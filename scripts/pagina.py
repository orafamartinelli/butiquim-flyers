# Gera out/final/index.html (vitrine das peças para o Rafa/time avaliar)
noites = [
    ("fds1", "sexta", "SEXTA 02/10 · GUI SILVA", "SERTANEJO", "A · “PLACA DE ESQUINA”", "Preto e lima, placa de rua “NA ESQUINA COM”, o “O” do logo em 3D lima.", True),
    ("fds1", "sabado", "SÁBADO 03/10 · SOU VIBE", "PAGODE", "A · “ESQUINA DE VIDRO”", "Luzes do palco, “SABADÁ” cromado, “O” furta-cor e card de vidro fosco.", True),
    ("fds1", "domingo", "DOMINGO 04/10 · RICARDO RIBEIRO", "SERTANEJO", "A · “RÓTULO DA ÚLTIMA RODADA”", "Rótulo de bebida: selo com a data, faixa com o nome, canhoto com a lista, “O” de cobre.", True),
    ("fds2", "sexta2", "SEXTA 09/10 · GRUPO RILEX", "PAGODE", "B · “PAINEL DE EMBARQUE”", "A Sexta como destino num painel de partidas: letras giram até formar atração, data e horário; status “CONFIRMADO” piscando; serviço de bordo com as bebidas trocando; relógio vira 23:00.", True),
    ("fds2", "sabado2", "SÁBADO 10/10 · CQ SAMBA", "PAGODE", "B · “LADO A”", "Capa de disco de pagode ao vivo: vinil girando solta notas musicais, “SABADÁ” pulsa no ritmo, selo de preço com a data, a lista vira tracklist digitada faixa a faixa, bebidas boiando no fundo.", True),
    ("fds2", "domingo2", "DOMINGO 11/10 · BIANNCHI & CRISTIANO", "SERTANEJO", "B · “LETREIRO NEON”", "Parede de tijolo com néons acendendo: o “O” do logo desenhado em néon, “Saideira” se escrevendo, chapéu, violão, chope e notas piscando, data numa placa de néon.", True),
]


def secao(n):
    _, k, tit, est, tag, ideia, comp = n
    ref = ""
    if comp:
        ref = f"""<details><summary>Comparar com a versão atual do designer</summary><div class="comp">
      <div class="peca"><div class="rot"><b>FEED ATUAL</b></div><video src="referencia/{k}-FEED-atual.mp4" controls muted loop playsinline></video></div>
      <div class="peca"><div class="rot"><b>STORY ATUAL</b></div><img src="referencia/{k}-STORY-atual.png" alt=""></div></div></details>"""
    return f"""<section id="{k}">
  <div class="head"><h2>{tit}</h2><span class="est">♪ {est} <small>+ SpotiFunk</small></span><span class="tag">{tag}</span></div>
  <div class="ideia">{ideia}</div>
  <div class="grid">
    <div class="peca"><div class="rot"><b>FEED ESTÁTICO</b><span>1080×1350</span></div><img src="{k}-FEED.png" alt=""></div>
    <div class="peca"><div class="rot"><b>FEED VÍDEO</b><span>8s · com som</span></div><video src="{k}-FEED.mp4" controls muted loop autoplay playsinline></video></div>
    <div class="peca"><div class="rot"><b>STORY</b><span>1080×1920</span></div><img src="{k}-STORY.png" alt=""></div>
    <div class="peca"><div class="rot"><b>STORY + B-ROLL</b><span>10s · com som</span></div><video src="{k}-STORY-BROLL.mp4" controls muted loop autoplay playsinline></video></div>
  </div>
  {ref}
</section>"""


s1 = "\n".join(secao(n) for n in noites if n[0] == "fds1")
s2 = "\n".join(secao(n) for n in noites if n[0] == "fds2")

CSS = """
  :root { --bg:#0f0f0e; --card:#191917; --line:#2a2a27; --txt:#f2f0e6; --mut:#a3a197; --lima:#C8D200; }
  * { box-sizing:border-box; }
  body { margin:0; background:var(--bg); color:var(--txt); font-family:Archivo, system-ui, sans-serif; }
  header, section, .bloco, footer { max-width:1500px; margin:0 auto; padding:28px 32px; }
  h1 { font-family:"Big Shoulders", Archivo, sans-serif; font-weight:900; font-size:60px; line-height:.9; margin:0 0 10px; }
  h1 span { color:var(--lima); }
  .sub { color:var(--mut); font-size:16px; line-height:1.5; max-width:980px; }
  .sub b { color:var(--txt); }
  nav { display:flex; gap:10px; flex-wrap:wrap; margin-top:18px; }
  nav a { color:var(--txt); text-decoration:none; border:1px solid var(--line); padding:8px 14px; border-radius:999px; font-weight:700; font-size:14px; }
  nav a:hover { border-color:var(--lima); }
  .bloco { border-top:3px solid var(--lima); padding-top:22px; padding-bottom:0; }
  .bloco h3 { font-family:"Big Shoulders", Archivo, sans-serif; font-size:40px; margin:0; font-weight:900; }
  .bloco p { color:var(--mut); margin:6px 0 0; font-size:15px; }
  section { border-top:1px solid var(--line); }
  .head { display:flex; align-items:baseline; gap:16px; flex-wrap:wrap; margin-bottom:6px; }
  .head h2 { font-family:"Big Shoulders", Archivo, sans-serif; font-size:40px; margin:0; font-weight:900; }
  .tag { font-weight:800; font-size:13px; letter-spacing:.12em; color:var(--lima); }
  .est { font-weight:900; font-size:14px; letter-spacing:.1em; background:var(--txt); color:#111; padding:4px 10px; border-radius:6px; }
  .est small { font-weight:600; letter-spacing:0; opacity:.7; }
  .ideia { color:var(--mut); font-size:15px; line-height:1.5; max-width:1050px; margin:4px 0 18px; }
  .grid { display:grid; grid-template-columns:1.25fr 1.25fr 1fr 1fr; gap:16px; align-items:start; }
  .peca { background:var(--card); border:1px solid var(--line); border-radius:14px; padding:10px; }
  .rot { font-size:12px; font-weight:800; letter-spacing:.12em; color:var(--mut); margin:2px 2px 8px; display:flex; justify-content:space-between; }
  .rot b { color:var(--txt); }
  img, video { width:100%; display:block; border-radius:8px; background:#000; }
  details { margin-top:16px; } summary { cursor:pointer; color:var(--mut); font-weight:700; font-size:14px; }
  .comp { display:grid; grid-template-columns:1fr 1fr 2fr; gap:16px; margin-top:12px; max-width:900px; }
  table { border-collapse:collapse; margin-top:10px; font-size:15px; }
  td, th { padding:7px 16px 7px 0; border-bottom:1px solid var(--line); text-align:left; }
  th { color:var(--mut); font-size:12px; letter-spacing:.1em; }
  .inf { color:#e0a040; font-size:12px; }
  footer { color:var(--mut); font-size:14px; line-height:1.6; border-top:1px solid var(--line); padding-bottom:60px; }
  @media (max-width:1100px) { .grid { grid-template-columns:1fr 1fr; } }
  @media (max-width:600px) { header, section, .bloco, footer { padding-left:16px; padding-right:16px; } h1 { font-size:42px; } .grid, .comp { grid-template-columns:1fr; } }
"""

html = f"""<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Butiquim · Identidades novas</title>
<link href="https://fonts.googleapis.com/css2?family=Archivo:wght@500;700;800;900&family=Big+Shoulders:wght@900&display=swap" rel="stylesheet">
<style>{CSS}</style>
</head>
<body>
<header>
  <h1>O BUTIQUIM · <span>IDENTIDADES NOVAS</span></h1>
  <div class="sub"><b>1º fim de semana (02–04/10):</b> identidades A, com o “O” do logo em 3D agora <b>vazado</b> e o selo de estilo com <b>+ SpotiFunk</b>.<br>
  <b>2º fim de semana (09–11/10):</b> identidades B, mais ousadas e 100% animadas (painel de embarque, disco de vinil, letreiro neon), para o time avaliar o caminho.<br>
  O estilo agora vem do <b>cadastro do artista</b>: se ele mudar de dia, o selo acompanha.</div>
  <nav><a href="#fds1">1º fds · identidades A</a><a href="#fds2">2º fds · identidades B</a><a href="#estilos">Estilos dos artistas</a></nav>
</header>
<div class="bloco" id="fds1"><h3>1º FIM DE SEMANA · IDENTIDADES A</h3><p>Versão 3: “O” vazado igual ao logo + selo “ESTILO / + SpotiFunk”.</p></div>
{s1}
<div class="bloco" id="fds2"><h3>2º FIM DE SEMANA · IDENTIDADES B (NOVAS)</h3><p>Uma identidade nova por dia da semana. Tudo que se mexe é animação em código: letras, data, nome, bebidas e notas.</p></div>
{s2}
<section id="estilos">
  <div class="head"><h2>ESTILO DE CADA ARTISTA</h2><span class="tag">CADASTRO DE ARTISTAS DA ESTEIRA</span></div>
  <div class="ideia">Estilo gravado no cadastro de artistas (butiquim_social_artistas). Os marcados “a confirmar” eu deduzi pelas noites em que tocam.</div>
  <table>
    <tr><th>ARTISTA</th><th>ESTILO</th><th></th></tr>
    <tr><td>Sou Vibe · CQ Samba · Grupo Rilex · Pagode 44 · Juntou Deu Samba · Juninho Cari · Papo 10 · Deixa Clarear</td><td>Pagode</td><td></td></tr>
    <tr><td>Ricardo Ribeiro · Biannchi &amp; Cristiano · João Maurício · Ana Karla</td><td>Sertanejo</td><td></td></tr>
    <tr><td>Gui Silva · Hilana · Alister Ferraz</td><td>Sertanejo</td><td class="inf">a confirmar</td></tr>
  </table>
</section>
<footer>Fotos = recortes oficiais dos PSDs do designer · vídeos = Sou Vibe, Ricardo, Rilex e CQ Samba no palco do Butiquim; Gui Silva e Biannchi &amp; Cristiano dos perfis deles · agenda e estilos lidos do banco da esteira em 26/09.</footer>
</body>
</html>"""

open("out/final/index.html", "w", encoding="utf-8").write(html)
print("ok", len(html))
