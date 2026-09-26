# Gera out/final/index.html (vitrine das peças para o Rafa/time avaliar)
noites = [
    ("fds1", "sexta", "SEXTA 02/10 · GUI SILVA", "SERTANEJO", "A · “PLACA DE ESQUINA”", "Preto e lima, placa de rua “NA ESQUINA COM”, o “O” do logo em 3D lima.", True),
    ("fds1", "sabado", "SÁBADO 03/10 · SOU VIBE", "PAGODE", "A · “ESQUINA DE VIDRO”", "Luzes do palco, “SABADÁ” cromado, “O” furta-cor e card de vidro fosco.", True),
    ("fds1", "domingo", "DOMINGO 04/10 · RICARDO RIBEIRO", "SERTANEJO", "A · “RÓTULO DA ÚLTIMA RODADA”", "Rótulo de bebida: selo com a data, faixa com o nome, canhoto com a lista, “O” de cobre.", True),
    ("fds2", "sexta2", "SEXTA 09/10 · GRUPO RILEX", "PAGODE", "B · “PAINEL DE EMBARQUE”", "A Sexta como destino num painel de partidas: letras giram até formar atração, data e horário; status “CONFIRMADO” piscando; serviço de bordo com as bebidas trocando; relógio vira 23:00.", True),
    ("fds2", "sabado2", "SÁBADO 10/10 · CQ SAMBA", "PAGODE", "B · “LADO A”", "Capa de disco de pagode ao vivo: vinil girando solta notas musicais, “SABADÁ” pulsa no ritmo, selo de preço com a data, a lista vira tracklist digitada faixa a faixa, bebidas boiando no fundo.", True),
    ("fds2", "domingo2", "DOMINGO 11/10 · BIANNCHI & CRISTIANO", "SERTANEJO", "B · “LETREIRO NEON”", "Parede de tijolo com néons acendendo: o “O” do logo desenhado em néon, “Saideira” se escrevendo em verde-lima, chapéu, violão, chope e notas piscando, data numa placa de néon.", True),
    ("fds3", "sexta3", "SEXTA 16/10 · HILANA", "SERTANEJO", "A · “PLACA DE ESQUINA”", "", True),
    ("fds3", "sabado3", "SÁBADO 17/10 · PAGODE 44", "PAGODE", "A · “ESQUINA DE VIDRO”", "", True),
    ("fds4", "sexta4", "SEXTA 23/10 · JUNTOU DEU SAMBA", "PAGODE", "B · “PAINEL DE EMBARQUE”", "", True),
    ("fds4", "sabado4", "SÁBADO 24/10 · JUNINHO CARI", "PAGODE", "B · “LADO A”", "", True),
    ("fds5", "sexta5", "SEXTA 30/10 · PAPO 10", "PAGODE", "A · “PLACA DE ESQUINA”", "", True),
    ("fds5", "sabado5", "SÁBADO 31/10 · DEIXA CLAREAR", "PAGODE", "A · “ESQUINA DE VIDRO”", "", True),
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
s3 = "\n".join(secao(n) for n in noites if n[0] == "fds3")
s4 = "\n".join(secao(n) for n in noites if n[0] == "fds4")
s5 = "\n".join(secao(n) for n in noites if n[0] == "fds5")

VERSOES = [
    ("v1", "V1 · LINEUP", "Referência do Camarote: coluna com logo e período, lista das noites com data, artista e estilo, e “AGENDA” gigante em lima com “SEMANA” sobrescrito em contorno; artistas lado a lado se sobrepondo na frente."),
    ("v2", "V2 · CARTAZ", "No estilo das agendas da A6: os 3 artistas agrupados na frente do “AGENDA”, o “O” lima atrás e “Semana” manuscrito em lima, agora acima das cabeças (antes caía no rosto do Sou Vibe); as noites em 3 colunas."),
    ("v3", "V3 · REPETIÇÃO", "Tipo o Buteko, em fundo claro: “AGENDA” repetido em linhas vazadas, “Semana” em lima por cima, artistas como adesivos sobrepostos e cartões com as datas."),
]
sa = "\n".join(
    f"""<section id="agenda-{v}">
  <div class="head"><h2>{t}</h2></div>
  <div class="ideia">{d}</div>
  <div class="grid">
    <div class="peca"><div class="rot"><b>FEED ESTÁTICO</b><span>1080×1350</span></div><img src="agenda-{v}-FEED.png" alt=""></div>
    <div class="peca"><div class="rot"><b>FEED VÍDEO</b><span>10s · com som</span></div><video src="agenda-{v}-FEED.mp4" controls muted loop autoplay playsinline></video></div>
    <div class="peca"><div class="rot"><b>STORY ESTÁTICO</b><span>1080×1920</span></div><img src="agenda-{v}-STORY.png" alt=""></div>
    <div class="peca"><div class="rot"><b>STORY VÍDEO</b><span>10s · com som</span></div><video src="agenda-{v}-STORY.mp4" controls muted loop autoplay playsinline></video></div>
  </div>
</section>"""
    for v, t, d in VERSOES
)


def grade4(itens):
    """itens: lista de (rotulo, detalhe, arquivo) — png vira img, mp4 vira video"""
    cel = []
    for rot, det, arq in itens:
        tag = f'<video src="{arq}" controls muted loop autoplay playsinline></video>' if arq.endswith(".mp4") else f'<img src="{arq}" alt="">'
        cel.append(f'<div class="peca"><div class="rot"><b>{rot}</b><span>{det}</span></div>{tag}</div>')
    return '<div class="grid">' + "".join(cel) + "</div>"


sv = f"""<section id="vespera-sec">
  <div class="head"><h2>DOMINGO 11/10 · BIANNCHI &amp; CRISTIANO</h2><span class="est">♪ SERTANEJO <small>+ SpotiFunk</small></span><span class="tag">ID NOVA · “FOLHINHA”</span></div>
  <div class="ideia">Véspera de Nossa Senhora Aparecida. A folhinha de parede do Butiquim, pendurada no “O” 3D, tem a página do domingo arrancada e revela “SEGUNDA-FEIRA 12 · FERIADO” circulado com o “O” do logo; confete e o aviso “amanhã sem despertador”.</div>
  {grade4([("FEED ESTÁTICO", "1080×1350", "vespera-FEED.png"), ("FEED VÍDEO", "8s · com som", "vespera-FEED.mp4"), ("STORY", "1080×1920", "vespera-STORY.png"), ("STORY + B-ROLL", "10s · com som", "vespera-STORY-BROLL.mp4")])}
</section>"""

LISTAS = [
    ("sexta", "SEXTA", "A · Placa de Esquina: placa lima gigante “COMENTE / RESPONDA LISTA”. B · Painel de Embarque: “LISTA” se forma no painel, é digitada no check-in e o aviãozinho do direct entrega o link."),
    ("sabado", "SÁBADO", "A · Esquina de Vidro: “LISTA” cromada no palco e o campo de comentário com LISTA digitado. B · Lado A: “LISTA” é a faixa 1 do disco, o comentário é enviado e o direct chega."),
    ("domingo", "DOMINGO", "A · Rótulo: a bebida da vez se chama “LISTA”, e as regras vêm no canhoto. B · Letreiro Neon: “LISTA” se acende em néon lima e um celular em néon mostra o comentário e o direct chegando."),
]
sl = "\n".join(
    f"""<section id="lista-{k}">
  <div class="head"><h2>LISTA · {t}</h2><span class="tag">2 ARTES · FEED “COMENTE LISTA” · STORY “RESPONDA LISTA”</span></div>
  <div class="ideia">{d}</div>
  {grade4([("A · FEED", "estático", f"lista-{k}-A-FEED.png"), ("A · STORY", "estático", f"lista-{k}-A-STORY.png"), ("B · FEED", "vídeo 8s", f"lista-{k}-B-FEED.mp4"), ("B · STORY", "vídeo 8s", f"lista-{k}-B-STORY.mp4")])}
</section>"""
    for k, t, d in LISTAS
)

AGS = [("s1", "28/09 e 29/09", "V1", "02 a 04/10"), ("s2", "05/10 e 06/10", "V2", "09 a 11/10"), ("s3", "12/10 e 13/10", "V3", "16 e 17/10"), ("s4", "19/10 e 20/10", "V1", "23 e 24/10"), ("s5", "26/10 e 27/10", "V2", "30 e 31/10")]
sg = "\n".join(
    f"""<section id="ag-{s}">
  <div class="head"><h2>SEMANA {sem}</h2><span class="tag">{v} · FEED SEG 17H10 + STORIES TER 17H · {quando}</span></div>
  {grade4([("FEED ESTÁTICO", "", f"agenda-{s}-FEED.png"), ("FEED VÍDEO", "10s · com som", f"agenda-{s}-FEED.mp4"), ("STORY ESTÁTICO", "", f"agenda-{s}-STORY.png"), ("STORY VÍDEO", "10s · com som", f"agenda-{s}-STORY.mp4")])}
</section>"""
    for s, quando, v, sem in AGS
)

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
  .grid.ag { grid-template-columns:1.25fr 1fr; max-width:900px; }
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
  <nav><a href="#novas">Véspera de feriado</a><a href="#listas">Artes de LISTA</a><a href="#agendas-out">Agendas programadas</a><a href="#agenda">Agenda (3 versões)</a><a href="#fds3">16–17 · A</a><a href="#fds4">23–24 · B</a><a href="#fds5">30–31 · A</a><a href="#fds1">02–04 · A</a><a href="#fds2">09–11 · B</a><a href="#estilos">Estilos</a></nav>
</header>
<div class="bloco" id="novas"><h3>VÉSPERA DE FERIADO · ID NOVA</h3><p>Primeira véspera com atração na planilha: domingo 11/10 (amanhã é Nossa Senhora Aparecida).</p></div>
{sv}
<div class="bloco" id="listas"><h3>ARTES DE LISTA · 2 NOVAS POR DIA</h3><p>Artes “de sempre” (sem artista e sem data): A estática no estilo da identidade A do dia, B em vídeo animado no estilo da identidade B. Feed pede “COMENTE LISTA”; story pede “RESPONDA LISTA”.</p></div>
{sl}
<div class="bloco" id="agendas-out"><h3>AGENDAS DE OUTUBRO · JÁ PROGRAMADAS</h3><p>Rodízio V1 → V2 → V3. Segunda 17h10: carrossel no feed (agenda + feed de cada noite), logo depois da agenda da esteira. Terça 17h: sequência de stories (agenda + story de cada noite, marcando o artista).</p></div>
{sg}
<div class="bloco" id="agenda"><h3>AGENDA DA SEMANA · 3 VERSÕES</h3><p>Semana de 02 a 04/10. Versão estática e em vídeo: no vídeo toca um trecho de cada artista (~3s) e a noite dele acende na hora.</p></div>
{sa}
<div class="bloco" id="fds3"><h3>16–17/10 · IDENTIDADES A</h3><p>Domingo 18 sem atração na planilha: pulado.</p></div>
{s3}
<div class="bloco" id="fds4"><h3>23–24/10 · IDENTIDADES B</h3><p>Domingo 25 sem atração na planilha: pulado.</p></div>
{s4}
<div class="bloco" id="fds5"><h3>30–31/10 · IDENTIDADES A</h3><p>Última semana do mês.</p></div>
{s5}
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
