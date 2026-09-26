from PIL import Image
import os
A='assets'; P='public'
def trim_save(src,dst,maxh):
    im=Image.open(src).convert('RGBA'); bb=im.getbbox(); im=im.crop(bb)
    if im.height>maxh: im=im.resize((round(im.width*maxh/im.height),maxh),Image.LANCZOS)
    im.save(dst,optimize=True); print(dst,im.size)
os.makedirs(f'{P}/fotos',exist_ok=True)
trim_save(f'{A}/raw-sexta/embed__GUI SILVA__GUI SILVA.png',f'{P}/fotos/gui-silva.png',2000)
trim_save(f'{A}/raw-sabado/embed__DSC03477__DSC03477.png',f'{P}/fotos/sou-vibe.png',2400)
trim_save(f'{A}/raw-sexta/embed__RicardoRibeiro__RicardoRibeiro.png',f'{P}/fotos/ricardo-ribeiro.png',2000)
# logos artistas
im=Image.open(f'{A}/raw-sabado/embed__LOGOS SOU VIBE__LOGOS SOU VIBE.png').convert('RGBA'); im=im.crop(im.getbbox())
r,g,b,a=im.split(); w=Image.new('L',im.size,255); Image.merge('RGBA',(w,w,w,a)).save(f'{P}/logos/sou-vibe-branco.png'); print('souvibe logo',im.size)
im=Image.open(f'{A}/raw-sexta/embed__Logo RicardoRibeiro copiar__Logo RicardoRibeiro copiar.png').convert('RGBA'); im=im.crop(im.getbbox()); im.save(f'{P}/logos/ricardo-ribeiro-branco.png'); print('ricardo logo',im.size)
# logo butiquim branco (wordmark preto -> branco, O lima mantido)
im=Image.open(f'{P}/logos/logo_obutiquim_policromia_horizontal.png').convert('RGBA'); px=im.load()
O=im.crop((0,0,215,im.height)); O=O.crop(O.getbbox()); O.save(f'{P}/logos/o-simbolo.png'); print('O',O.size)
for y in range(im.height):
    for x in range(im.width):
        r,g,b,a=px[x,y]
        if a>0 and r<90 and g<90 and b<90: px[x,y]=(255,255,255,a)
im.save(f'{P}/logos/butiquim-branco-h.png')
im2=Image.open(f'{P}/logos/logo_obutiquim_policromia_horizontal.png').convert('RGBA'); px=im2.load()
for y in range(im2.height):
    for x in range(im2.width):
        r,g,b,a=px[x,y]
        if a>0: px[x,y]=(255,255,255,a)
im2.save(f'{P}/logos/butiquim-mono-branco-h.png')
