# Grade visual da semana: o que já está agendado (esteira + nosso) × sugestões para aumentar volume.
# Uso: python scripts/grade-semana.py  → out/final/programacao.html (abrir da pasta do Drive, onde estão as peças)
import json
import urllib.request
from datetime import date, timedelta

cred = json.load(open("C:/Users/User/Documents/projetos/.credentials/supabase-new-api-keys.json", encoding="utf-8"))
URL = cred["project_url"].rstrip("/")
INI, FIM = date(2026, 9, 28), date(2026, 10, 4)


def rest(q):
    req = urllib.request.Request(f"{URL}/rest/v1/{q}", headers={"apikey": cred["secret_key"], "Authorization": f"Bearer {cred['secret_key']}"})
    return json.load(urllib.request.urlopen(req))


rows = rest(
    "butiquim_social_avulso?select=campanha,formato,publicar_em,video_url,legenda,marcados"
    f"&publicar_em=gte.{INI}T00:00:00-03:00&publicar_em=lt.{FIM + timedelta(days=1)}T00:00:00-03:00&order=publicar_em"
)


def brt(ts):
    # publicar_em vem em UTC (+00:00) → horário de Brasília
    from datetime import datetime, timezone, timedelta as td

    d = datetime.fromisoformat(ts.replace("Z", "+00:00")).astimezone(timezone(td(hours=-3)))
    return d.date(), d.strftime("%H:%M")


def origem(c):
    if c.startswith("agenda-claude"):
        return "nosso"
    return "atual"


def rotulo(c, fmt, leg):
    if c.startswith("agenda-claude-feed"):
        return "Agenda da semana (nossa) + feed de cada noite"
    if c.startswith("agenda-claude-story"):
        return "Sequência de stories da agenda (nossa)"
    if c.startswith("aquecimento"):
        return "Aquecimento · clipe do artista"
    if c.startswith("ambiente"):
        return "Ambiente · drinks"
    return ""


def rotulo_carrossel(arq):
    # classifica pelo 1º arquivo do carrossel (a legenda engana: todas citam o artista)
    n = arq.split("/")[-1]
    if "-dia-feed" in n:
        return "Arte do dia (designer) + lista + promo"
    if "lista" in n:
        return "Lista (arte do designer) + dia + promo"
    if any(p in n for p in ("promo", "aperol", "smirnoff", "combo")):
        return "Promo do dia (designer) + lista + dia"
    return "Carrossel"




itens = {}
for r in rows:
    d, h = brt(r["publicar_em"])
    arq = r["video_url"]
    rot = rotulo(r["campanha"], r["formato"], r["legenda"])
    if not rot and r["formato"] == "CAROUSEL":
        rot = rotulo_carrossel(arq)
    if not rot and r["formato"] == "REELS":
        rot = "Clipe do artista"
    if r["formato"] == "STORIES" and not rot:
        n = arq.split("/")[-1]
        rot = "Story · arte do designer" if n.startswith("d1") else "Story · lista (designer)" if "lista" in n else "Story · promo (designer)" if "promo" in n or "aperol" in n else "Story · clipe do artista"
    itens.setdefault(d, []).append({"h": h, "fmt": r["formato"], "arq": arq, "rot": rot, "tipo": origem(r["campanha"])})

# agenda da esteira: montada na própria segunda (ainda não aparece na fila)
itens.setdefault(date(2026, 9, 28), []).append({"h": "17:00", "fmt": "CAROUSEL", "arq": None, "rot": "Agenda da semana da esteira (artes do designer) · montada na própria segunda", "tipo": "atual"})
itens[date(2026, 9, 28)].append({"h": "17:20", "fmt": "STORIES", "arq": None, "rot": "Stories da agenda da esteira (1 por noite + mapa)", "tipo": "atual"})

# ---------------- sugestões (volume) ----------------
DIA_KEY = {date(2026, 10, 2): "sexta", date(2026, 10, 3): "sabado", date(2026, 10, 4): "domingo"}
for d, k in DIA_KEY.items():
    fim_lista = "21:30" if k == "domingo" else "22:00"
    itens[d] += [
        {"h": "12:00", "fmt": "REELS", "arq": f"{k}-FEED.mp4", "rot": "Flyer animado da noite (nosso, com som do artista)", "tipo": "sugestao"},
        {"h": "12:20", "fmt": "STORIES", "arq": f"{k}-STORY.png", "rot": "Story do flyer (nosso)", "tipo": "sugestao"},
        {"h": "16:00", "fmt": "STORIES", "arq": f"{k}-STORY-BROLL.mp4", "rot": "Story com vídeo do artista + flyer (nosso)", "tipo": "sugestao"},
        {"h": "16:30", "fmt": "REELS", "arq": f"lista-{k}-B-FEED.mp4", "rot": "LISTA animada · “COMENTE LISTA” ⚠️ só se a automação de comentário estiver ativa", "tipo": "sugestao"},
        {"h": "18:30", "fmt": "STORIES", "arq": f"lista-{k}-B-STORY.mp4", "rot": "LISTA animada · “RESPONDA LISTA” (Kim responde no direct)", "tipo": "sugestao"},
        {"h": fim_lista, "fmt": "STORIES", "arq": f"lista-{k}-A-STORY.png", "rot": "Última chamada da lista · “RESPONDA LISTA”", "tipo": "sugestao"},
    ]
# carrossel da manhã ganha nosso feed estático como slide extra (não cria post)
for d, k in DIA_KEY.items():
    for it in itens[d]:
        if it["fmt"] == "CAROUSEL" and it["rot"].startswith("Arte do dia"):
            it["extra"] = f"{k}-FEED.png"
# furo: sábado sem o story da arte do dia pela manhã
itens[date(2026, 10, 3)].append({"h": "11:05", "fmt": "STORIES", "arq": None, "rot": "CORREÇÃO: story da arte do dia (designer) não entrou na fila", "tipo": "correcao"})
# dias fracos: abrir a lista da sexta antes
itens[date(2026, 9, 30)].append({"h": "20:30", "fmt": "STORIES", "arq": "lista-sexta-A-STORY.png", "rot": "Lista da sexta já aberta · “RESPONDA LISTA”", "tipo": "sugestao"})
itens[date(2026, 10, 1)].append({"h": "20:30", "fmt": "STORIES", "arq": "lista-sexta-B-STORY.mp4", "rot": "Amanhã tem · lista da sexta (animada)", "tipo": "sugestao"})

DIAS = ["SEG", "TER", "QUA", "QUI", "SEX", "SÁB", "DOM"]
FMT = {"REELS": "REELS", "CAROUSEL": "CARROSSEL", "STORIES": "STORY"}


def midia(arq):
    if not arq:
        return '<div class="vazio">montado na hora</div>'
    if arq.endswith(".mp4"):
        return f'<video src="{arq}#t=1.5" preload="metadata" muted playsinline loop onmouseenter="this.play()" onmouseleave="this.pause()"></video>'
    return f'<img src="{arq}" loading="lazy" alt="">'


cols = []
tot = {"atual": 0, "nosso": 0, "sugestao": 0, "correcao": 0}
for i in range(7):
    d = INI + timedelta(days=i)
    lst = sorted(itens.get(d, []), key=lambda x: x["h"])
    cards = []
    for it in lst:
        tot[it["tipo"]] += 1
        extra = f'<div class="extra">+ slide extra nosso<img src="{it["extra"]}" alt=""></div>' if it.get("extra") else ""
        cards.append(
            f'<div class="card {it["tipo"]}"><div class="topo"><b>{it["h"]}</b><span class="fmt f-{it["fmt"].lower()}">{FMT[it["fmt"]]}</span></div>'
            f'<div class="thumb {"st" if it["fmt"] == "STORIES" else "fd"}">{midia(it["arq"])}</div><div class="rot">{it["rot"]}</div>{extra}</div>'
        )
    n_atual = sum(1 for x in lst if x["tipo"] in ("atual", "nosso"))
    n_sug = sum(1 for x in lst if x["tipo"] in ("sugestao", "correcao"))
    cols.append(f'<div class="col"><div class="dia"><b>{DIAS[i]}</b> {d.strftime("%d/%m")}<span>{n_atual} hoje · +{n_sug}</span></div>{"".join(cards)}</div>')

hoje = tot["atual"] + tot["nosso"]
html = f"""<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Butiquim · Programação da semana</title>
<link href="https://fonts.googleapis.com/css2?family=Archivo:wght@500;700;800;900&family=Big+Shoulders:wght@900&display=swap" rel="stylesheet">
<style>
:root{{--bg:#0f0f0e;--card:#191917;--line:#2a2a27;--txt:#f2f0e6;--mut:#a3a197;--lima:#C8D200;--mag:#FF2E93;--amb:#F29A2E}}
*{{box-sizing:border-box}} body{{margin:0;background:var(--bg);color:var(--txt);font-family:Archivo,system-ui,sans-serif}}
header{{padding:26px 28px 10px;max-width:1900px;margin:0 auto}} h1{{font-family:"Big Shoulders",Archivo;font-size:54px;margin:0;line-height:.9}} h1 span{{color:var(--lima)}}
.sub{{color:var(--mut);max-width:1100px;line-height:1.5;margin-top:8px}}
.kpis{{display:flex;gap:14px;flex-wrap:wrap;margin:16px 0 6px}} .kpi{{background:var(--card);border:1px solid var(--line);border-radius:12px;padding:10px 16px}} .kpi b{{font-family:"Big Shoulders";font-size:40px;display:block;line-height:1}} .kpi small{{color:var(--mut);font-weight:700;letter-spacing:.08em}}
.leg{{display:flex;gap:16px;flex-wrap:wrap;font-size:13px;font-weight:700;margin:10px 0}} .leg i{{display:inline-block;width:14px;height:14px;border-radius:4px;margin-right:6px;vertical-align:-2px}}
.grade{{display:grid;grid-template-columns:repeat(7,minmax(210px,1fr));gap:12px;padding:10px 28px 50px;max-width:1900px;margin:0 auto;overflow-x:auto}}
.col{{min-width:210px}} .dia{{position:sticky;top:0;background:var(--bg);padding:8px 2px 10px;font-size:15px;z-index:2;border-bottom:2px solid var(--line);margin-bottom:10px}} .dia b{{font-family:"Big Shoulders";font-size:28px;margin-right:6px}} .dia span{{display:block;color:var(--mut);font-size:12px;font-weight:700}}
.card{{background:var(--card);border:1px solid var(--line);border-radius:12px;padding:8px;margin-bottom:10px}}
.card.nosso{{border:2px solid var(--lima)}} .card.sugestao{{border:2px dashed var(--mag);background:#1d1219}} .card.correcao{{border:2px dashed var(--amb);background:#1f1710}}
.topo{{display:flex;justify-content:space-between;align-items:center;margin-bottom:6px}} .topo b{{font-size:17px}}
.fmt{{font-size:10px;font-weight:900;letter-spacing:.1em;padding:3px 7px;border-radius:5px;background:#333;color:#fff}} .f-reels{{background:#6b2bd9}} .f-carousel{{background:#1f6fd1}} .f-stories{{background:#c43a7a}}
.thumb{{border-radius:8px;overflow:hidden;background:#000;display:flex;align-items:center;justify-content:center}} .thumb.st{{height:170px}} .thumb.fd{{height:150px}}
.thumb img,.thumb video{{height:100%;width:auto;max-width:100%;object-fit:contain;display:block}} .vazio{{color:var(--mut);font-size:12px;padding:20px 8px;text-align:center}}
.rot{{font-size:12.5px;line-height:1.35;margin-top:7px;color:#e6e3d8}} .sugestao .rot::before{{content:"SUGESTÃO · ";color:var(--mag);font-weight:900}} .correcao .rot{{color:var(--amb);font-weight:800}}
.extra{{margin-top:7px;font-size:11px;font-weight:900;color:var(--mag);display:flex;align-items:center;gap:8px}} .extra img{{height:46px;border-radius:4px;border:1px dashed var(--mag)}}
.notas{{max-width:1900px;margin:0 auto;padding:0 28px 60px;color:var(--mut);line-height:1.6;font-size:14px}} .notas b{{color:var(--txt)}}
</style></head><body>
<header>
<h1>PROGRAMAÇÃO DA SEMANA · <span>28/09 A 04/10</span></h1>
<div class="sub">Como está a fila de publicação do @obutiquim hoje e onde dá para somar volume com as peças novas, sem tirar nada do que já existe. Passe o mouse nos vídeos para tocar.</div>
<div class="kpis"><div class="kpi"><b>{hoje}</b><small>POSTS AGENDADOS HOJE</small></div><div class="kpi"><b>+{tot['sugestao']}</b><small>SUGESTÕES NOVAS</small></div><div class="kpi"><b>{hoje + tot['sugestao'] + tot['correcao']}</b><small>COM AS SUGESTÕES</small></div><div class="kpi"><b>{tot['correcao']}</b><small>FURO PARA CORRIGIR</small></div></div>
<div class="leg"><span><i style="background:#555"></i>Esteira (artes do designer e clipes)</span><span><i style="background:var(--lima)"></i>Nosso, já agendado</span><span><i style="border:2px dashed var(--mag)"></i>Sugestão nova</span><span><i style="border:2px dashed var(--amb)"></i>Correção</span></div>
</header>
<div class="grade">{"".join(cols)}</div>
<div class="notas">
<b>Lógica das sugestões:</b> nos dias de show, o flyer animado vira Reels no almoço (hoje o 1º Reels do dia sai às 14h), o story com vídeo do artista preenche a tarde, e a lista ganha 3 toques: animada às 18h30, reforço no Reels das 16h30 e última chamada antes de fechar (22h; domingo 21h30). Quarta e quinta ganham a lista da sexta aberta com antecedência. O carrossel da manhã ganha o nosso feed como slide extra (não cria post novo).<br>
<b>Atenção:</b> o Reels “COMENTE LISTA” só deve entrar se a automação de comentário → direct estiver ativa; o “RESPONDA LISTA” no story já funciona pela Kim.
</div>
</body></html>"""
open("out/final/programacao.html", "w", encoding="utf-8").write(html)
print("ok", hoje, "+", tot["sugestao"], "sugestões", tot["correcao"], "correção")
