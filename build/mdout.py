"""Markdown emitter exposing the same API as minipdf.Doc, so one content
source renders to both PDF and Markdown."""

class MdDoc:
    def __init__(self, title=None):
        self.o = []
        self._h1 = 0
        if title:
            self.o.append('# ' + title + '\n')

    def h1(self, txt, num=None):
        self.o.append('\n\n---\n\n# ' + ((num + '. ') if num else '') + txt + '\n')
    def h2(self, txt):
        self.o.append('\n## ' + txt + '\n')
    def h3(self, txt):
        self.o.append('\n### ' + txt + '\n')
    def p(self, txt, **kw):
        self.o.append('\n' + txt + '\n')
    def bul(self, items, **kw):
        self.o.append('')
        for it in items:
            self.o.append('- ' + it)
        self.o.append('')
    def num(self, items, start=1, **kw):
        self.o.append('')
        for i, it in enumerate(items, start):
            self.o.append('%d. %s' % (i, it))
        self.o.append('')
    def kv(self, pairs, **kw):
        self.o.append('')
        for k, v in pairs:
            self.o.append('**%s** — %s' % (k, v))
            self.o.append('')
    def table(self, head, rows, widths=None, **kw):
        self.o.append('')
        self.o.append('| ' + ' | '.join(str(h).replace('|','\\|') for h in head) + ' |')
        self.o.append('|' + '|'.join(['---'] * len(head)) + '|')
        for r in rows:
            self.o.append('| ' + ' | '.join(str(c).replace('|','\\|').replace('\n',' ') for c in r) + ' |')
        self.o.append('')
    def code(self, text, label=None, **kw):
        self.o.append('')
        self.o.append('```' + (label or ''))
        self.o.append(text)
        self.o.append('```')
        self.o.append('')
    def callout(self, title, text, **kw):
        self.o.append('')
        self.o.append('> **%s**  ' % (title or 'NOTE'))
        for ln in text.split('\n'):
            self.o.append('> ' + ln)
        self.o.append('')
    def space(self, h=0): pass
    def newpage(self, footer=True): pass
    def need(self, h): pass

    def render(self, footer_text=''):
        return ('\n'.join(self.o) + '\n').encode('utf-8')
