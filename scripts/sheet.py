import sys, glob, os
from PIL import Image, ImageDraw
files = sys.argv[2:]
W,H=300,400; cols=6
rows=(len(files)+cols-1)//cols
sh=Image.new("RGB",(cols*W,rows*(H+24)),(60,60,60)); dr=ImageDraw.Draw(sh)
for i,f in enumerate(files):
    im=Image.open(f); sz=im.size; im=im.convert("RGBA"); im.thumbnail((W,H))
    x=(i%cols)*W; y=(i//cols)*(H+24)
    sh.paste(im,(x,y+24),im); dr.text((x+3,y+3),os.path.basename(f)[7:45]+f" {sz[0]}x{sz[1]}",fill="white")
sh.save(sys.argv[1],quality=85)
