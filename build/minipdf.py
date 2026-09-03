"""Pure-Python PDF generator: base-14 fonts, no external deps.
Supports headings, paragraphs, bullets, tables, code blocks, page numbers, TOC.
"""
import zlib, re

# --- AFM widths for Helvetica (1000-unit em). Index = char code 32..126 ---
HELV = [278,278,355,556,556,889,667,191,333,333,389,584,278,333,278,278,556,556,556,556,556,556,556,556,556,556,278,278,584,584,584,556,1015,667,667,722,722,667,611,778,722,278,500,667,556,833,722,778,667,778,722,667,611,722,667,944,667,667,611,278,278,278,469,556,333,556,556,500,556,556,278,556,556,222,222,500,222,833,556,556,556,556,333,500,278,556,500,722,500,500,500,334,260,334,584]
HELVB = [278,333,474,556,556,889,722,238,333,333,389,584,278,333,278,278,556,556,556,556,556,556,556,556,556,556,333,333,584,584,584,611,975,722,722,722,722,667,611,778,722,278,556,722,611,833,722,778,667,778,722,667,611,722,667,944,667,667,611,333,278,333,584,556,333,556,611,556,611,556,333,611,611,278,278,556,278,889,611,611,611,611,389,556,333,611,556,778,556,556,500,389,280,389,584]
TIMES = [250,333,408,500,500,833,778,180,333,333,500,564,250,333,250,278,500,500,500,500,500,500,500,500,500,500,278,278,564,564,564,444,921,722,667,667,722,611,556,722,722,333,389,722,611,889,722,722,556,722,667,556,611,722,722,944,722,722,611,333,278,333,469,500,333,444,500,444,500,444,333,500,500,278,278,500,278,778,500,500,500,500,333,389,278,500,500,722,500,500,444,480,200,480,541]
TIMESB= [250,333,555,500,500,1000,833,278,333,333,500,570,250,333,250,278,500,500,500,500,500,500,500,500,500,500,333,333,570,570,570,500,930,722,667,722,722,667,611,778,778,389,500,778,667,944,722,778,611,778,722,556,667,722,722,1000,722,722,667,333,278,333,581,500,333,500,556,444,556,444,333,500,556,278,333,556,278,833,556,500,556,500,444,389,333,556,500,722,500,500,444,394,220,394,520]
TIMESI= [250,333,420,500,500,833,778,214,333,333,500,675,250,333,250,278,500,500,500,500,500,500,500,500,500,500,333,333,675,675,675,500,920,611,611,667,722,611,611,722,722,333,444,667,556,833,667,722,611,722,611,500,556,722,611,833,611,556,556,389,278,389,422,500,333,500,500,444,500,444,278,500,500,278,278,444,278,722,500,500,500,500,389,389,278,500,444,667,444,444,389,400,275,400,541]
COUR = [600]*95

FONTS = {'H':HELV,'HB':HELVB,'T':TIMES,'TB':TIMESB,'TI':TIMESI,'C':COUR}
FONTNAME = {'H':'Helvetica','HB':'Helvetica-Bold','T':'Times-Roman','TB':'Times-Bold','TI':'Times-Italic','C':'Courier'}

def esc(s):
    return s.replace('\\','\\\\').replace('(','\\(').replace(')','\\)')

def sw(text, font, size):
    """string width in points"""
    w = FONTS[font]; t=0
    for ch in text:
        c = ord(ch)
        if 32 <= c <= 126: t += w[c-32]
        elif c == 8377: t += 600   # ₹ approximated
        elif c in (8211,8212): t += 500
        elif c in (8216,8217): t += 250
        elif c in (8220,8221): t += 400
        elif c == 8226: t += 350
        else: t += 500
    return t*size/1000.0

def sanitize(s):
    """Map unicode to WinAnsi-safe latin1 equivalents."""
    rep = {'‘':"'",'’':"'",'“':'"','”':'"','–':'-','—':'--',
           '•':'\x95','₹':'Rs.','→':'->','←':'<-','≥':'>=','≤':'<=',
           '×':'x','…':'...',' ':' ','≥':'>=','−':'-','′':"'",
           '■':'\x95','✓':'v','°':'\xb0','±':'+/-','≈':'~','∞':'inf',
           'α':'alpha','β':'beta','μ':'mu','σ':'sigma','‑':'-','‐':'-'}
    for k,v in rep.items(): s = s.replace(k,v)
    return s

def wrap(text, font, size, maxw):
    words = text.split(' ')
    lines=[]; cur=''
    for wd in words:
        trial = wd if not cur else cur+' '+wd
        if sw(trial,font,size) <= maxw: cur = trial
        else:
            if cur: lines.append(cur)
            # hard-break very long words
            while sw(wd,font,size) > maxw:
                lo=1
                for i in range(1,len(wd)+1):
                    if sw(wd[:i],font,size) > maxw: lo=max(1,i-1); break
                lines.append(wd[:lo]); wd = wd[lo:]
            cur = wd
    if cur: lines.append(cur)
    return lines or ['']

class Doc:
    def __init__(self, W=595.28, H=841.89, ml=54, mr=54, mt=64, mb=58):
        self.W,self.H = W,H
        self.ml,self.mr,self.mt,self.mb = ml,mr,mt,mb
        self.cw = W-ml-mr
        self.pages=[]      # list of list-of-ops(bytes)
        self.ops=[]
        self.y = H-mt
        self.pageno = 1
        self.toc=[]        # (level, title, pageno)
        self.footer_skip=set()
        self.links=[]

    # ---- primitives
    def _t(self,x,y,txt,font,size,color=(0,0,0)):
        r,g,b=color
        self.ops.append(b'BT /%s %.1f Tf %.3f %.3f %.3f rg %.2f %.2f Td (%s) Tj ET' %
            (font.encode(),size,r,g,b,x,y,esc(sanitize(txt)).encode('latin-1','replace')))
    def _rect(self,x,y,w,h,color,fill=True):
        r,g,b=color
        if fill: self.ops.append(b'%.3f %.3f %.3f rg %.2f %.2f %.2f %.2f re f'%(r,g,b,x,y,w,h))
        else: self.ops.append(b'%.3f %.3f %.3f RG %.2f %.2f %.2f %.2f re S'%(r,g,b,x,y,w,h))
    def _line(self,x1,y1,x2,y2,color=(0.7,0.7,0.7),lw=0.6):
        r,g,b=color
        self.ops.append(b'%.3f %.3f %.3f RG %.2f w %.2f %.2f m %.2f %.2f l S'%(r,g,b,lw,x1,y1,x2,y2))

    def newpage(self, footer=True):
        self.pages.append(self.ops)
        if not footer: self.footer_skip.add(len(self.pages))
        self.ops=[]
        self.pageno = len(self.pages)+1
        self.y = self.H-self.mt

    def need(self,h):
        if self.y - h < self.mb: self.newpage()

    def space(self,h):
        self.y -= h

    # ---- content blocks
    def h1(self,txt,num=None):
        if self.y < self.H-self.mt-2: self.newpage()
        self.toc.append((1,(num+'  ' if num else '')+txt,self.pageno))
        self._rect(0,self.y-6,self.W,34,(0.055,0.29,0.20))
        self._rect(0,self.y-6,5,34,(0.85,0.62,0.13))
        if num:
            self._t(self.ml,self.y+6,num,'HB',15,(0.85,0.78,0.55))
            off = sw(num,'HB',15)+10
        else: off=0
        self._t(self.ml+off,self.y+6,txt,'HB',15,(1,1,1))
        self.y -= 46
    def h2(self,txt):
        self.need(52); self.y-=14
        self.toc.append((2,txt,self.pageno))
        self._t(self.ml,self.y,txt,'HB',12.5,(0.055,0.29,0.20))
        self.y-=6; self._line(self.ml,self.y,self.ml+self.cw,self.y,(0.80,0.85,0.80),0.8)
        self.y-=13
    def h3(self,txt):
        self.need(38); self.y-=8
        self._t(self.ml,self.y,txt,'HB',10.6,(0.16,0.22,0.18))
        self.y-=15
    def p(self,txt,size=9.5,font='T',lead=13.2,indent=0,color=(0.12,0.12,0.12),align_just=False):
        for ln in wrap(txt,font,size,self.cw-indent):
            self.need(lead); self._t(self.ml+indent,self.y,ln,font,size,color); self.y-=lead
        self.y-=3
    def bul(self,items,size=9.3,lead=12.6,marker='\x95',indent=0,font='T'):
        for it in items:
            first=True
            for ln in wrap(it,font,size,self.cw-16-indent):
                self.need(lead)
                if first:
                    self._t(self.ml+2+indent,self.y,marker,'H',size,(0.06,0.42,0.28)); first=False
                self._t(self.ml+16+indent,self.y,ln,font,size,(0.12,0.12,0.12)); self.y-=lead
            self.y-=2.2
        self.y-=3
    def num(self,items,size=9.3,lead=12.6,start=1,indent=0):
        for i,it in enumerate(items,start):
            lab='%d.'%i; first=True
            for ln in wrap(it,'T',size,self.cw-20-indent):
                self.need(lead)
                if first: self._t(self.ml+2+indent,self.y,lab,'TB',size,(0.06,0.42,0.28)); first=False
                self._t(self.ml+20+indent,self.y,ln,'T',size,(0.12,0.12,0.12)); self.y-=lead
            self.y-=2.2
        self.y-=3
    def kv(self,pairs,kw=0.30,size=9.3,lead=12.6):
        kwid=self.cw*kw
        for k,v in pairs:
            klines = wrap(k,'HB',size,kwid-6)
            vlines = wrap(v,'T',size,self.cw-kwid-4)
            n=max(len(klines),len(vlines))
            self.need(lead*n+3)
            y0=self.y
            for i,ln in enumerate(klines): self._t(self.ml,y0-i*lead,ln,'HB',size,(0.06,0.32,0.22))
            for i,ln in enumerate(vlines): self._t(self.ml+kwid,y0-i*lead,ln,'T',size,(0.12,0.12,0.12))
            self.y = y0-n*lead-2.5
        self.y-=3
    def table(self,head,rows,widths=None,size=8.4,pad=4.5,zebra=True,hcolor=(0.055,0.29,0.20)):
        n=len(head)
        widths = widths or [1.0/n]*n
        ws=[w*self.cw for w in widths]
        lead=size*1.28
        def rowh(cells,f):
            m=1
            for c,w in zip(cells,ws): m=max(m,len(wrap(str(c),f,size,w-2*pad)))
            return m*lead+2*pad-2
        hh=rowh(head,'HB')
        self.need(hh+rowh(rows[0] if rows else [''],'T')+6)
        # header
        self._rect(self.ml,self.y-hh+lead-3,self.cw,hh,hcolor)
        x=self.ml
        for c,w in zip(head,ws):
            for i,ln in enumerate(wrap(str(c),'HB',size,w-2*pad)):
                self._t(x+pad,self.y-i*lead,ln,'HB',size,(1,1,1))
            x+=w
        self.y-=hh
        alt=False
        for r in rows:
            h=rowh(r,'T')
            if self.y-h < self.mb:
                self.newpage()
                self._rect(self.ml,self.y-hh+lead-3,self.cw,hh,hcolor)
                x=self.ml
                for c,w in zip(head,ws):
                    for i,ln in enumerate(wrap(str(c),'HB',size,w-2*pad)):
                        self._t(x+pad,self.y-i*lead,ln,'HB',size,(1,1,1))
                    x+=w
                self.y-=hh; alt=False
            if zebra and alt: self._rect(self.ml,self.y-h+lead-3,self.cw,h,(0.955,0.965,0.95))
            x=self.ml
            for c,w in zip(r,ws):
                for i,ln in enumerate(wrap(str(c),'T',size,w-2*pad)):
                    self._t(x+pad,self.y-i*lead,ln,'T',size,(0.13,0.13,0.13))
                x+=w
            self._line(self.ml,self.y-h+lead-3,self.ml+self.cw,self.y-h+lead-3,(0.86,0.88,0.86),0.5)
            self.y-=h; alt = not alt
        self.y-=8
    def code(self,text,size=7.4,lead=9.6,label=None):
        lines=[]
        for raw in text.split('\n'):
            raw = raw.replace('\t','    ')
            lines += wrap(raw,'C',size,self.cw-20) if sw(raw,'C',size)>self.cw-20 else [raw]
        h=len(lines)*lead+14
        if self.y-h < self.mb and h < (self.H-self.mt-self.mb):
            self.newpage()
        i=0
        while i < len(lines):
            avail=int((self.y-self.mb-14)//lead)
            if avail<=2: self.newpage(); continue
            chunk=lines[i:i+avail]
            bh=len(chunk)*lead+11
            self._rect(self.ml,self.y-bh+lead-1,self.cw,bh,(0.965,0.972,0.965))
            self._rect(self.ml,self.y-bh+lead-1,2.5,bh,(0.06,0.42,0.28))
            yy=self.y-3
            for ln in chunk:
                self._t(self.ml+10,yy,ln,'C',size,(0.10,0.16,0.12)); yy-=lead
            self.y-=bh+4
            i+=avail
        self.y-=4
    def callout(self,title,text,color=(0.85,0.62,0.13),bg=(0.995,0.975,0.90),size=9.0):
        lines=wrap(text,'T',size,self.cw-24)
        h=len(lines)*12.2+ (17 if title else 4) + 10
        if self.y-h < self.mb: self.newpage()
        self._rect(self.ml,self.y-h+11,self.cw,h,bg)
        self._rect(self.ml,self.y-h+11,3.5,h,color)
        yy=self.y
        if title:
            self._t(self.ml+12,yy,title,'HB',9.4,(0.45,0.30,0.02)); yy-=15
        for ln in lines:
            self._t(self.ml+12,yy,ln,'T',size,(0.18,0.15,0.08)); yy-=12.2
        self.y-=h+4

    def render(self, footer_text=''):
        self.pages.append(self.ops); self.ops=[]
        objs=[]; 
        def add(b): objs.append(b); return len(objs)
        # fonts
        fids={}
        for k,nm in FONTNAME.items():
            fids[k]=add(b'<< /Type /Font /Subtype /Type1 /BaseFont /%s /Encoding /WinAnsiEncoding >>'%nm.encode())
        res=b'<< /Font << '+b' '.join(b'/%s %d 0 R'%(k.encode(),v) for k,v in fids.items())+b' >> >>'
        resid=add(res)
        total=len(self.pages)
        cids=[]
        for i,ops in enumerate(self.pages,1):
            extra=[]
            if i not in self.footer_skip:
                extra.append(b'%.3f %.3f %.3f RG 0.5 w %.2f %.2f m %.2f %.2f l S'%
                    (0.80,0.84,0.80,self.ml,self.mb-14,self.W-self.mr,self.mb-14))
                ft=sanitize(footer_text)
                extra.append(b'BT /T 7.6 Tf 0.42 0.45 0.42 rg %.2f %.2f Td (%s) Tj ET'%
                    (self.ml,self.mb-26,esc(ft).encode('latin-1','replace')))
                pg='%d / %d'%(i,total)
                extra.append(b'BT /HB 7.6 Tf 0.06 0.32 0.22 rg %.2f %.2f Td (%s) Tj ET'%
                    (self.W-self.mr-sw(pg,'HB',7.6),self.mb-26,esc(pg).encode()))
            data=b'\n'.join(ops+extra)
            comp=zlib.compress(data,9)
            cids.append(add(b'<< /Length %d /Filter /FlateDecode >>stream\n'%len(comp)+comp+b'\nendstream'))
        pageids=[]
        parent_placeholder = None
        # reserve pages-tree id
        for cid in cids:
            pageids.append(add(b'@@PAGE@@%d'%cid))
        treeid=add(b'<< /Type /Pages /Kids ['+b' '.join(b'%d 0 R'%p for p in pageids)+b'] /Count %d >>'%len(pageids))
        for idx,cid in zip(pageids,cids):
            objs[idx-1]=(b'<< /Type /Page /Parent %d 0 R /MediaBox [0 0 %.2f %.2f] /Contents %d 0 R /Resources %d 0 R >>'
                %(treeid,self.W,self.H,cid,resid))
        catid=add(b'<< /Type /Catalog /Pages %d 0 R >>'%treeid)
        infoid=add(b'<< /Title (OneForAll Farmers - SIH 2026 PS26132 Master Playbook) /Author (Team OneForAll) /Creator (minipdf) >>')
        out=b'%PDF-1.4\n%\xe2\xe3\xcf\xd3\n'; offs=[]
        for i,o in enumerate(objs,1):
            offs.append(len(out)); out+=b'%d 0 obj\n'%i+o+b'\nendobj\n'
        x=len(out)
        out+=b'xref\n0 %d\n0000000000 65535 f \n'%(len(objs)+1)
        for o in offs: out+=b'%010d 00000 n \n'%o
        out+=b'trailer\n<< /Size %d /Root %d 0 R /Info %d 0 R >>\nstartxref\n%d\n%%%%EOF\n'%(len(objs)+1,catid,infoid,x)
        return out
