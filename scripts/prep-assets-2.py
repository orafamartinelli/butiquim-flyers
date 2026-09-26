# Fotos e logos oficiais das semanas 3-5 de outubro (tirados dos PSDs do designer)
from PIL import Image

A = "assets"
P = "public"


def trim_save(src, dst, maxh):
    im = Image.open(src).convert("RGBA")
    im = im.crop(im.getbbox())
    if im.height > maxh:
        im = im.resize((round(im.width * maxh / im.height), maxh), Image.LANCZOS)
    im.save(dst, optimize=True)
    print(dst, im.size, round(im.size[0] / im.size[1], 4))


trim_save(f"{A}/raw-sexta/embed__HILANA__HILANA.png", f"{P}/fotos/hilana.png", 2200)
trim_save(f"{A}/raw-sabado/layer__Camada 2.png", f"{P}/fotos/pagode-44.png", 2200)
trim_save(f"{A}/raw-sexta/embed__JUNTOUdeuSAMBA__JUNTOUdeuSAMBA.png", f"{P}/fotos/juntou-deu-samba.png", 2200)
trim_save(f"{A}/raw-sabado/embed__JUNINHO CARI 8__JUNINHO CARI 8.png", f"{P}/fotos/juninho-cari.png", 2200)
trim_save(f"{A}/raw-sexta/embed__GRUPO PAPO 10 NOVA 2026 - 001__GRUPO PAPO 10 NOVA 2026 - 001.png", f"{P}/fotos/papo-10.png", 2200)
trim_save(f"{A}/raw-sabado/embed__DC 1__DC 1.png", f"{P}/fotos/deixa-clarear.png", 2200)

# logos
trim_save(f"{A}/raw-sabado/embed__PAGODE 44 LOGO__PAGODE 44 LOGO.png", f"{P}/logos/pagode-44.png", 900)
trim_save(f"{A}/raw-sabado/embed__Logo Deixa Clarear__Logo Deixa Clarear.png", f"{P}/logos/deixa-clarear.png", 900)

# Juninho Cari: logo são 3 pedaços rasterizados no PSD do Sabadá; remonta nas posições originais
pecas = [("layer__Camada 1.png", 584, 1060), ("layer__Camada 1 copiar.png", 323, 1065), ("layer__Camada 1 copiar 2.png", 353, 1172)]
tela = Image.new("RGBA", (1080, 1350), (0, 0, 0, 0))
for f, x, y in pecas:
    im = Image.open(f"{A}/raw-sabado/{f}").convert("RGBA")
    tela.alpha_composite(im, (x, y))
tela = tela.crop(tela.getbbox())
tela.save(f"{P}/logos/juninho-cari.png")
print("juninho logo", tela.size, round(tela.size[0] / tela.size[1], 4), tela.getpixel((tela.width // 2, tela.height // 2)))
