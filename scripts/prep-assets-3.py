# Fotos oficiais dos domingos 18/10 (Alister Ferraz) e 25/10 (João Maurício),
# tiradas do PSD do Saideira atualizado pelo designer em 30/09 (psd/domingo-F-30set.psd)
from PIL import Image

A = "assets/raw-domingo-30set"
P = "public"


def trim_save(src, dst, maxh):
    im = Image.open(src).convert("RGBA")
    im = im.crop(im.getbbox())
    if im.height > maxh:
        im = im.resize((round(im.width * maxh / im.height), maxh), Image.LANCZOS)
    im.save(dst, optimize=True)
    print(dst, im.size, round(im.size[0] / im.size[1], 4))


trim_save(f"{A}/embed__BXS02126-Aprimorado-NR__BXS02126-Aprimorado-NR.png", f"{P}/fotos/allister-ferraz.png", 2200)
trim_save(f"{A}/embed__image1_adobespark__image1_adobespark.png", f"{P}/fotos/joao-mauricio.png", 2200)
