# -*- coding: utf-8 -*-
import sys, os
HERE=os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0,HERE)
OUT=os.path.dirname(HERE)
import minipdf as M, mdout
import content_a, content_b, content_c, content_d, content_e, content_f, content_g
MODS=[content_a,content_b,content_c,content_d,content_e,content_f,content_g]

d=M.Doc()
for m in MODS: m.build(d,PDF=True)
pdf=d.render('Mandi-Setu  |  SIH 2026  |  PS 26132  |  Government of Maharashtra')
p1=os.path.join(OUT,'MANDI-SETU_SIH2026_PS26132_Playbook.pdf')
open(p1,'wb').write(pdf)

md=mdout.MdDoc()
for m in MODS: m.build(md,PDF=False)
p2=os.path.join(OUT,'MANDI-SETU_SIH2026_PS26132_Playbook.md')
open(p2,'wb').write(md.render())

print('PDF :',p1)
print('      pages =',len(d.pages),' bytes =',len(pdf))
print('MD  :',p2)
print('      bytes =',os.path.getsize(p2))
