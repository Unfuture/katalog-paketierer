/*! Katalog-Paketierer · Unfuture · laeuft komplett im Browser, keine Daten verlassen das Geraet.
    Einbindung: <script src="https://cdn.jsdelivr.net/gh/Unfuture/katalog-paketierer@1/paketierer.js"></script> */
(function(){
"use strict";
var VERSION = "1.1.0";
var LIBS = [
  "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js",
  "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js",
  "https://cdnjs.cloudflare.com/ajax/libs/pdf-lib/1.17.1/pdf-lib.min.js",
  "https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js",
  "https://cdnjs.cloudflare.com/ajax/libs/exceljs/4.4.0/exceljs.min.js"
];
var FONTS = "https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600&family=Instrument+Serif:ital@0;1&display=swap";
var CSS = "/* Layout: Cream-B\u00fchne, links Schritte als schwebende Karten, rechts eine Graphit-Instrumentenb\u00fchne mit dem Ergebnis.\n   Unfuture-Tokens: Cream / Ink / Graphit, Marine nicht genutzt, Gr\u00fcn = gefunden, Terrakotta = fehlt. */\n:root{\n  --page:#FCFAF3; --card:#FFFEF9; --ink:#0E0A06; --graphite:#1a1714; --cream:#F5EFE2; --sand:#EBE0CD;\n  --text2:#524A41; --text3:#6A6258; --green:#678760; --green-dark:#3f5d39; --green-light:#8FB585; --terracotta:#C45743; --terracotta-soft:#E39A8B;\n  --line:rgba(14,10,6,.10); --line-soft:rgba(14,10,6,.06);\n  --serif:\"Instrument Serif\",Georgia,serif; --sans:\"Geist\",system-ui,-apple-system,sans-serif;\n  --mono:ui-monospace,\"SF Mono\",Menlo,Consolas,monospace;\n  --shadow:0 2px 4px rgba(14,10,6,.04),0 22px 48px -24px rgba(14,10,6,.24);\n  --shadow-stage:0 2px 4px rgba(14,10,6,.06),0 28px 60px -28px rgba(14,10,6,.45);\n  --ease:cubic-bezier(.22,.8,.3,1);\n  color-scheme:light;\n}\n*,*::before,*::after{box-sizing:border-box}\nhtml{background:var(--page)}\nbody{margin:0;background:var(--page);color:var(--ink);font:16px/1.6 var(--sans);letter-spacing:-.005em;-webkit-font-smoothing:antialiased;overflow-x:clip}\nbody::after{content:\"\";position:fixed;inset:0;pointer-events:none;z-index:9999;opacity:.06;mix-blend-mode:multiply;\n  background-image:url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='280' height='280'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.55 0'/></filter><rect width='100%25' height='100%25' filter='url(%23n)'/></svg>\")}\n[hidden]{display:none!important}\n.wrap{max-width:1280px;margin:0 auto;padding-inline:clamp(24px,3vw,40px)}\n:focus-visible{outline:2px solid var(--ink);outline-offset:2px}\n.stage :focus-visible{outline-color:var(--cream)}\n\n/* Kopf */\n.top{display:flex;align-items:center;justify-content:space-between;gap:16px;padding-block:28px}\n.wordmark{font-family:var(--serif);font-style:italic;font-size:28px;line-height:1;letter-spacing:-.01em}\n.label{font-size:13px;font-weight:500;letter-spacing:.12em;text-transform:uppercase;color:var(--text3)}\n.hero{padding-block:clamp(40px,6vw,80px) clamp(28px,4vw,48px);max-width:900px}\n.hero h1{font-family:var(--serif);font-weight:400;font-size:clamp(40px,5.2vw,76px);line-height:1.04;letter-spacing:-.01em;margin:20px 0 20px;text-wrap:balance;font-size-adjust:.46}\n.hero h1 em{font-style:italic}\n.lead{font-size:clamp(18px,1.55vw,23px);line-height:1.45;color:var(--text2);margin:0;max-width:62ch;text-wrap:pretty}\n.dot{display:inline-flex;align-items:center;gap:8px}\n.dot::before{content:\"\";width:6px;height:6px;border-radius:999px;background:var(--green);flex-shrink:0}\n\n/* Umschalter */\n.seg{display:inline-flex;gap:4px;padding:4px;border-radius:999px;background:rgba(14,10,6,.05);margin-bottom:28px}\n.seg button{border:0;background:transparent;color:var(--text2);font:500 14px var(--sans);padding:9px 18px;border-radius:999px;cursor:pointer;transition:background .2s,color .2s}\n.seg button[aria-selected=true]{background:var(--ink);color:#fff}\n\n/* Raster */\n.grid{display:grid;grid-template-columns:minmax(0,5fr) minmax(0,7fr);gap:clamp(20px,2.4vw,32px);align-items:start;padding-bottom:clamp(80px,10vw,140px)}\n@media (max-width:960px){.grid{grid-template-columns:1fr}}\n.steps{display:flex;flex-direction:column;gap:16px;min-width:0}\n\n/* Schwebende Karten */\n.card{position:relative;background:var(--card);border-radius:16px;box-shadow:var(--shadow);padding:28px 32px 30px;min-width:0}\n.card::after{content:\"\";position:absolute;inset:0;border-radius:16px;pointer-events:none;mix-blend-mode:multiply;opacity:.03;\n  background-image:url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='g'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23g)'/%3E%3C/svg%3E\")}\n.card-head{display:flex;align-items:baseline;justify-content:space-between;gap:12px;margin-bottom:10px}\n.zone{font-size:12px;font-weight:500;letter-spacing:.1em;text-transform:uppercase;color:var(--text3)}\n.idx{font-family:var(--serif);font-size:15px;color:rgba(14,10,6,.32)}\n.card h2{font-family:var(--serif);font-weight:400;font-size:clamp(24px,2.3vw,34px);line-height:1.12;margin:0 0 14px;font-size-adjust:.46}\n.hint{font-size:14px;line-height:1.55;color:var(--text3);margin:10px 0 0;text-wrap:pretty}\n.hint strong{color:var(--text2);font-weight:500}\n\n/* Eingaben */\n.drop{position:relative;z-index:2;display:flex;flex-direction:column;align-items:center;gap:4px;border:1.5px dashed rgba(14,10,6,.22);border-radius:12px;padding:26px 18px;text-align:center;cursor:pointer;background:rgba(14,10,6,.02);transition:border-color .2s,background .2s}\n.drop:hover,.drop.over{border-color:var(--ink);background:rgba(14,10,6,.04)}\n.drop .big{font-family:var(--serif);font-size:24px;line-height:1.1;color:var(--ink)}\n.drop .small{font-size:14px;color:var(--text3)}\n.drop.filled{border-style:solid;border-color:rgba(103,135,96,.5);background:rgba(103,135,96,.07)}\n.drop.filled .small{color:var(--green-dark)}\ntextarea,.num{position:relative;z-index:2;width:100%;border-radius:12px;border:1px solid var(--line);background:rgba(14,10,6,.03);color:var(--ink);font:13.5px/1.5 var(--mono);padding:12px 14px;transition:border-color .2s,background .2s}\ntextarea{min-height:160px;resize:vertical}\ntextarea:focus,.num:focus{outline:none;border-color:rgba(14,10,6,.4);background:#fff}\ntextarea::placeholder{color:var(--text3)}\n.fields{display:flex;gap:16px;flex-wrap:wrap}\n.field label{display:block;font-size:13px;font-weight:500;color:var(--text2);margin-bottom:6px}\n.num{width:110px;font:500 16px var(--sans)}\n\n/* Kn\u00f6pfe */\n.btn{position:relative;z-index:2;display:inline-flex;align-items:center;gap:8px;padding:12px 20px;border-radius:999px;font:500 14px var(--sans);letter-spacing:-.005em;cursor:pointer;border:1px solid transparent;transition:background .2s,border-color .2s,color .2s}\n.btn svg{width:15px;height:15px;transition:transform .25s cubic-bezier(.2,.7,.2,1)}\n.btn:hover svg{transform:translateX(3px)}\n.btn:active{transform:translateY(1px)}\n.btn:disabled{opacity:.4;cursor:not-allowed}\n.btn:disabled:hover svg{transform:none}\n.btn-primary{background:var(--ink);color:#fff}\n.btn-primary:hover:not(:disabled){background:#2a211b}\n.btn-secondary{background:transparent;color:var(--ink);border-color:rgba(14,10,6,.12)}\n.btn-secondary:hover{border-color:rgba(14,10,6,.4)}\n.btn-on-dark{background:#F9F6EE;color:var(--ink)}\n.btn-on-dark:hover{background:#fff}\n.btn-ghost-dark{background:transparent;color:rgba(255,255,255,.85);border-color:rgba(255,255,255,.18)}\n.btn-ghost-dark:hover{border-color:rgba(255,255,255,.5);color:#fff}\n.run-row{display:flex;align-items:center;gap:16px;flex-wrap:wrap;margin-top:4px}\n.bar{position:relative;z-index:2;height:4px;border-radius:999px;background:rgba(14,10,6,.08);overflow:hidden;margin-top:18px}\n.bar i{display:block;height:100%;width:0;background:var(--green);transition:width .25s var(--ease)}\n.status{font-size:14px;color:var(--text3);margin-top:10px;min-height:1.5em;white-space:pre-wrap}\n\n/* Graphit-B\u00fchne */\n.stage{position:relative;overflow:hidden;border-radius:16px;background:var(--graphite);color:var(--cream);padding:clamp(24px,3.2vw,48px);box-shadow:var(--shadow-stage);min-width:0}\n.glow{position:absolute;top:-120px;right:-120px;width:420px;height:320px;border-radius:50%;background:radial-gradient(closest-side,rgba(103,135,96,.35),transparent);filter:blur(40px);pointer-events:none}\n.stage > *{position:relative}\n.stage > .glow{position:absolute}\n.stage .label{color:rgba(245,239,226,.6)}\n.stage-title{font-family:var(--serif);font-weight:400;font-size:clamp(34px,3.4vw,54px);line-height:1.02;margin:16px 0 0;text-wrap:balance;font-size-adjust:.46}\n.stage-title em{font-style:italic}\n.stage-sub{color:rgba(245,239,226,.72);font-size:clamp(16px,1.25vw,18px);margin:16px 0 0;max-width:56ch}\n.cols{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:16px;margin-top:32px}\n@media (max-width:620px){.cols{grid-template-columns:1fr}}\n.col{border-top:1px solid rgba(245,239,226,.15);padding-top:16px;min-width:0}\n.col .n{font-family:var(--serif);font-size:clamp(22px,2vw,28px);color:var(--green-light);line-height:1}\n.col .t{font-family:var(--serif);font-size:clamp(20px,1.7vw,25px);line-height:1.15;margin-top:8px}\n.col .s{font-size:13px;color:rgba(245,239,226,.6);margin-top:6px}\n.placeholder{display:grid;grid-template-columns:repeat(6,minmax(0,1fr));gap:8px;margin-top:32px}\n.placeholder span{aspect-ratio:1.4;border-radius:8px;border:1px dashed rgba(245,239,226,.22)}\n.placeholder span.on{border:0;background:rgba(143,181,133,.35)}\n.miss{margin-top:28px;border-radius:12px;background:rgba(196,87,67,.14);padding:14px 18px}\n.miss .label{color:var(--terracotta-soft)}\n.miss pre{margin:6px 0 0;font:13px/1.5 var(--mono);color:var(--cream);white-space:pre-wrap}\n.actions{display:flex;gap:10px;flex-wrap:wrap;margin-top:28px}\n.teile{display:flex;flex-direction:column;gap:12px;margin-top:32px}\n.teil{background:var(--card);color:var(--ink);border-radius:12px;padding:20px 22px}\n.teil-head{display:flex;align-items:baseline;justify-content:space-between;gap:12px}\n.teil h3{font-family:var(--serif);font-weight:400;font-size:clamp(22px,1.9vw,27px);line-height:1.1;margin:0}\n.teil .meta{font-size:14px;color:var(--text3);margin-top:4px}\n.teil .partial{font-size:13px;color:var(--terracotta);margin-top:4px}\n.teil details{margin-top:12px}\n.teil summary{cursor:pointer;font-size:14px;color:var(--text2);width:fit-content}\n.teil summary:hover{color:var(--ink)}\n.teil pre{font:12.5px/1.5 var(--mono);background:rgba(14,10,6,.04);color:var(--text2);border-radius:8px;padding:12px;white-space:pre-wrap;max-height:220px;overflow:auto;margin:10px 0 0}\n.teil .row{display:flex;gap:8px;flex-wrap:wrap;margin-top:14px}\n.teil .btn{padding:9px 16px;font-size:13.5px}\n.log{font:13px/1.55 var(--mono);color:rgba(245,239,226,.8);white-space:pre-wrap;margin-top:24px}\n.foot{font-size:13px;color:var(--text3);margin-top:14px}\n@media (prefers-reduced-motion:reduce){*{transition:none!important}.btn:hover svg{transform:none}}\n";
var HTML = "<div class=\"wrap\">\n  <header class=\"top\">\n    <span class=\"wordmark\">unfuture</span>\n    <span class=\"label\">Werkzeug \u00b7 Datenr\u00fcckf\u00fchrung</span>\n  </header>\n\n  <section class=\"hero\">\n    <span class=\"label dot\">Katalog-Paketierer</span>\n    <h1>Gro\u00dfe Kataloge in <em>handliche</em> Pakete.</h1>\n    <p class=\"lead\">Der Paketierer schneidet aus der Sammelmappe nur die Seiten der gesuchten Produkte heraus. So verarbeitet Langdock jedes Paket in ein bis zwei Minuten. Die PDF bleibt dabei auf Ihrem Rechner.</p>\n  </section>\n\n  <div class=\"seg\" role=\"tablist\" aria-label=\"Ansicht\">\n    <button id=\"tab-split\" role=\"tab\" aria-selected=\"true\">Teilpakete erstellen</button>\n    <button id=\"tab-merge\" role=\"tab\" aria-selected=\"false\">Ergebnisse zusammenf\u00fchren</button>\n  </div>\n\n  <main id=\"view-split\" class=\"grid\">\n    <div class=\"steps\">\n      <div class=\"card\">\n        <div class=\"card-head\"><span class=\"zone dot\">Schritt 1</span><span class=\"idx\">01</span></div>\n        <h2>Sammelmappe</h2>\n        <div class=\"drop\" id=\"pdfDrop\" tabindex=\"0\" role=\"button\" aria-label=\"Sammelmappe als PDF ausw\u00e4hlen\">\n          <span class=\"big\">PDF hierher ziehen</span>\n          <span class=\"small\" id=\"pdfName\">oder klicken, um eine Datei zu w\u00e4hlen</span>\n        </div>\n        <input type=\"file\" id=\"pdfInput\" accept=\"application/pdf\" hidden>\n      </div>\n\n      <div class=\"card\">\n        <div class=\"card-head\"><span class=\"zone dot\">Schritt 2</span><span class=\"idx\">02</span></div>\n        <h2>Produktliste</h2>\n        <textarea id=\"list\" spellcheck=\"false\" aria-label=\"Produktliste mit Artikelnummern\" placeholder=\"P1812124\t6790305&#10;P1812124\t6790313&#10;P1821018\t6794033&#10;\u2026\"></textarea>\n        <p class=\"hint\">Eine Zeile je Artikel mit <strong>Produktnummer</strong> und <strong>Artikelnummer</strong>, direkt aus Excel oder der Antwort des Agenten kopiert. Artikelnummern d\u00fcrfen 7-stellig (6790305) oder im Katalogformat (6790.305.543) sein.</p>\n      </div>\n\n      <div class=\"card\">\n        <div class=\"card-head\"><span class=\"zone dot\">Schritt 3</span><span class=\"idx\">03</span></div>\n        <h2>Paketgr\u00f6\u00dfe</h2>\n        <div class=\"fields\">\n          <div class=\"field\"><label for=\"maxPages\">Doppelseiten je Paket</label><input class=\"num\" type=\"number\" id=\"maxPages\" value=\"5\" min=\"1\" max=\"30\"></div>\n          <div class=\"field\"><label for=\"maxProducts\">Produkte je Paket</label><input class=\"num\" type=\"number\" id=\"maxProducts\" value=\"15\" min=\"1\" max=\"100\"></div>\n        </div>\n        <p class=\"hint\">Im Test lief ein Paket mit 5 Doppelseiten und 12 Produkten in gut einer Minute durch.</p>\n        <div class=\"bar\"><i id=\"prog\"></i></div>\n        <div class=\"status\" id=\"status\"></div>\n        <div class=\"run-row\">\n          <button class=\"btn btn-primary\" id=\"run\" disabled>Teilpakete erstellen <svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2.2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><path d=\"M5 12h14M13 6l6 6-6 6\"/></svg></button>\n        </div>\n      </div>\n    </div>\n\n    <section class=\"stage\" aria-live=\"polite\">\n      <div class=\"glow\" aria-hidden=\"true\"></div>\n      <div id=\"empty\">\n        <span class=\"label\">Ergebnis</span>\n        <p class=\"stage-title\">Hier erscheinen Ihre <em>Teilpakete.</em></p>\n        <p class=\"stage-sub\">Je Paket gibt es eine kleine PDF. Ihre erste Seite enthält die Produktliste für Langdock, deshalb genügt es, die PDF in einen neuen Chat zu ziehen.</p>\n        <div class=\"placeholder\" aria-hidden=\"true\"><span class=\"on\"></span><span></span><span class=\"on\"></span><span></span><span></span><span class=\"on\"></span><span></span><span></span><span class=\"on\"></span><span></span><span></span><span></span></div>\n      </div>\n      <div id=\"result\" hidden>\n        <span class=\"label\">Ergebnis</span>\n        <p class=\"stage-title\" id=\"resultTitle\"></p>\n        <p class=\"stage-sub\" id=\"resultSub\"></p>\n        <div class=\"cols\" id=\"summary\"></div>\n        <div class=\"miss\" id=\"missingBox\" hidden><span class=\"label\">Nicht im Katalog gefunden</span><pre id=\"missing\"></pre></div>\n        <div class=\"actions\"><button class=\"btn btn-on-dark\" id=\"zipAll\">Alle Pakete als ZIP speichern <svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2.2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><path d=\"M5 12h14M13 6l6 6-6 6\"/></svg></button></div>\n        <div class=\"teile\" id=\"teile\"></div>\n      </div>\n    </section>\n  </main>\n\n  <main id=\"view-merge\" class=\"grid\" hidden>\n    <div class=\"steps\">\n      <div class=\"card\">\n        <div class=\"card-head\"><span class=\"zone dot\">Zusammenf\u00fchren</span><span class=\"idx\">04</span></div>\n        <h2>Excel-Dateien aller Pakete</h2>\n        <div class=\"drop\" id=\"xlsDrop\" tabindex=\"0\" role=\"button\" aria-label=\"Excel-Dateien ausw\u00e4hlen\">\n          <span class=\"big\">Excel-Dateien hierher ziehen</span>\n          <span class=\"small\" id=\"xlsNames\">Datenr\u00fcckf\u00fchrung und Artikel-Zuordnung aus allen Paketen</span>\n        </div>\n        <input type=\"file\" id=\"xlsInput\" accept=\".xlsx\" multiple hidden>\n        <p class=\"hint\">Die Dateien werden am Tabellenblatt erkannt. Doppelte Produktnummern oder SKUs werden nur einmal \u00fcbernommen und gemeldet.</p>\n        <div class=\"run-row\" style=\"margin-top:18px\"><button class=\"btn btn-primary\" id=\"merge\" disabled>Zusammenf\u00fchren <svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2.2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><path d=\"M5 12h14M13 6l6 6-6 6\"/></svg></button></div>\n      </div>\n    </div>\n    <section class=\"stage\">\n      <div class=\"glow\" aria-hidden=\"true\"></div>\n      <span class=\"label\">Ergebnis</span>\n      <p class=\"stage-title\">Wieder <em>genau zwei</em> Dateien.</p>\n      <p class=\"stage-sub\">Datenrueckfuehrung.xlsx und Artikel-Zuordnung.xlsx, mit fetter Kopfzeile, Filter und fixierter erster Zeile.</p>\n      <div class=\"log\" id=\"mstatus\"></div>\n    </section>\n  </main>\n</div>";

function loadScript(src){ return new Promise(function(ok, fail){ var s=document.createElement("script"); s.src=src; s.onload=ok; s.onerror=function(){fail(new Error("Konnte nicht laden: "+src));}; document.head.appendChild(s); }); }

function boot(){
  var l=document.createElement("link"); l.rel="stylesheet"; l.href=FONTS; document.head.appendChild(l);
  var st=document.createElement("style"); st.textContent=CSS; document.head.appendChild(st);
  if(!document.title) document.title="Katalog-Paketierer";
  var host=document.getElementById("paketierer") || document.body;
  host.insertAdjacentHTML("beforeend", HTML);
  LIBS.reduce(function(p,src){ return p.then(function(){ return loadScript(src); }); }, Promise.resolve())
    .then(start)
    .catch(function(e){ var el=document.getElementById("status"); if(el) el.textContent="Fehler beim Laden der Bibliotheken: "+e.message+". Bitte Internetverbindung prüfen."; });
}

function start(){
const ARROW = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';
const $ = id => document.getElementById(id);
let pdfBytes = null, pdfFileName = "", lastResult = null;

/* ---------- Tabs ---------- */
function showTab(which){
  $("view-split").hidden = which !== "split"; $("view-merge").hidden = which !== "merge";
  $("tab-split").setAttribute("aria-selected", which==="split"); $("tab-merge").setAttribute("aria-selected", which==="merge");
}
$("tab-split").onclick = () => showTab("split");
$("tab-merge").onclick = () => showTab("merge");

const workerReady = Promise.resolve();

/* ---------- Drop-Zonen ---------- */
function wireDrop(zone, input, onFiles){
  zone.onclick = () => input.click();
  zone.onkeydown = e => { if(e.key==="Enter"||e.key===" "){ e.preventDefault(); input.click(); } };
  zone.ondragover = e => { e.preventDefault(); zone.classList.add("over"); };
  zone.ondragleave = () => zone.classList.remove("over");
  zone.ondrop = e => { e.preventDefault(); zone.classList.remove("over"); onFiles([...e.dataTransfer.files]); };
  input.onchange = () => onFiles([...input.files]);
}
wireDrop($("pdfDrop"), $("pdfInput"), async files => {
  const f = files.find(f => /\.pdf$/i.test(f.name)); if(!f) return;
  pdfFileName = f.name; pdfBytes = new Uint8Array(await f.arrayBuffer());
  $("pdfName").textContent = `${f.name} · ${(f.size/2**20).toFixed(1)} MB`; $("pdfDrop").classList.add("filled"); $("pdfDrop").querySelector(".big").textContent = "Sammelmappe geladen";
  updateRun();
});
$("list").addEventListener("input", updateRun);
function updateRun(){ $("run").disabled = !(pdfBytes && $("list").value.trim()); }

/* ---------- Hilfen ---------- */
const core7 = s => s.replace(/\D/g,"").slice(0,7);
function setProg(p){ $("prog").style.width = Math.round(p*100)+"%"; }
function status(t){ $("status").textContent = t; }
function pad(n){ return String(n).padStart(2,"0"); }
function download(blob, name){
  const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = name;
  document.body.appendChild(a); a.click(); setTimeout(()=>{URL.revokeObjectURL(a.href); a.remove();}, 2000);
}

/* Produktliste lesen: Zeilen mit P-Nummer und/oder Artikelnummern */
function parseList(text){
  const products = new Map(); const unread = [];
  for(const raw of text.split(/\r?\n/)){
    const line = raw.trim(); if(!line) continue;
    const p = (line.match(/\bP\d{5,}\b/i)||[])[0];
    const rest = line.replace(/\bP\d{5,}\b/ig," ");
    const arts = [...rest.matchAll(/(?<![\d.])(\d{4})\.?(\d{3})(?:\.\d{3})?(?![\d])/g)].map(m=>m[1]+m[2]);
    if(!p && !arts.length){ if(!/produkt|artikel|sku/i.test(line)) unread.push(line); continue; }
    const key = p ? p.toUpperCase() : arts[0];
    if(!products.has(key)) products.set(key, new Set());
    arts.forEach(a => products.get(key).add(a));
  }
  return {products, unread};
}

/* ---------- Hauptlauf ---------- */
$("run").onclick = async () => {
  $("run").disabled = true; setProg(0);
  try{
    await workerReady;
    const {products, unread} = parseList($("list").value);
    if(!products.size) throw new Error("In der Liste wurden keine Produkt- oder Artikelnummern erkannt.");
    status(`Lese Text der Sammelmappe …`);
    const doc = await pdfjsLib.getDocument({data: pdfBytes.slice(), disableFontFace:true}).promise;
    const n = doc.numPages; const artPages = new Map(); // 7-stellig -> Set(Seiten)
    for(let i=1;i<=n;i++){
      const page = await doc.getPage(i); const tc = await page.getTextContent();
      const s = tc.items.map(x=>x.str).join(" ");
      for(const m of s.matchAll(/(\d{4})\s*\.\s*(\d{3})\s*\.\s*\d{3}/g)){
        const k = m[1]+m[2]; if(!artPages.has(k)) artPages.set(k,new Set()); artPages.get(k).add(i);
      }
      page.cleanup(); if(i%5===0||i===n){ setProg(.7*i/n); status(`Lese Text der Sammelmappe … Seite ${i} von ${n}`); }
    }
    await doc.destroy();

    // Produkte -> Seiten
    const found = [], missing = [];
    for(const [key, arts] of products){
      const pages = new Set(); const hit = [], miss = [];
      for(const a of arts){ const ps = artPages.get(a); if(ps){ ps.forEach(p=>pages.add(p)); hit.push(a);} else miss.push(a); }
      if(pages.size) found.push({key, arts:[...arts], hit, miss, pages:[...pages].sort((a,b)=>a-b)});
      else missing.push(`${key}${arts.size?" ("+[...arts].join(", ")+")":""}`);
    }
    found.sort((a,b)=>a.pages[0]-b.pages[0]);

    // Gierig in Teile packen
    const maxP = +$("maxPages").value||5, maxN = +$("maxProducts").value||15;
    const teile = []; let cur = null;
    for(const prod of found){
      const union = cur ? new Set([...cur.pages, ...prod.pages]) : null;
      if(!cur || union.size > maxP || cur.products.length >= maxN){
        cur = {pages:new Set(prod.pages), products:[prod]}; teile.push(cur);
      } else { cur.pages = union; cur.products.push(prod); }
    }

    // PDFs bauen
    status("Erstelle Teil-PDFs …");
    const src = await PDFLib.PDFDocument.load(pdfBytes, {ignoreEncryption:true, updateMetadata:false});
    for(let t=0;t<teile.length;t++){
      const T = teile[t]; T.pageList = [...T.pages].sort((a,b)=>a-b);
      const out = await PDFLib.PDFDocument.create();
      T.name = `Teil_${pad(t+1)}_von_${pad(teile.length)}`;
      T.prompt = buildPrompt(T, t+1, teile.length);
      await addCover(out, T.prompt, src.getPage(T.pageList[0]-1).getSize());
      const copied = await out.copyPages(src, T.pageList.map(p=>p-1)); copied.forEach(p=>out.addPage(p));
      T.bytes = await out.save({useObjectStreams:true});
      setProg(.7 + .3*(t+1)/teile.length);
    }
    lastResult = {teile, missing, unread, total:products.size, pages:n};
    render(); status(`Fertig. ${teile.length} Pakete aus ${n} Doppelseiten erstellt.`); setProg(1);
  }catch(e){ console.error(e); status("Fehler: " + (e.message||e)); }
  finally{ updateRun(); }
};

/* Begleitseite als erste Seite jeder Paket-PDF: so reicht es, nur die PDF in den Chat zu ziehen */
async function addCover(doc, text, size){
  const font = await doc.embedFont(PDFLib.StandardFonts.Helvetica);
  const bold = await doc.embedFont(PDFLib.StandardFonts.HelveticaBold);
  const W = size && size.width ? size.width : 842, H = size && size.height ? size.height : 595;
  const page = doc.addPage([W, H]);
  const m = Math.round(Math.min(W, H) * 0.08);
  const clean = s => s.replace(/[^\x20-\x7E -ÿ“”„–—…]/g, "?");
  const wrap = (line, f, size, maxW) => {
    if(!line) return [""];
    const words = line.split(" "); const out = []; let cur = "";
    for(const w of words){
      const t = cur ? cur + " " + w : w;
      if(f.widthOfTextAtSize(t, size) <= maxW || !cur) cur = t; else { out.push(cur); cur = w; }
    }
    out.push(cur); return out;
  };
  const src = text.split("\n").map(clean);
  let fs = Math.max(9, Math.min(16, H / 40));
  let lines;
  for(let k=0;k<8;k++){
    lines = [];
    src.forEach((l,i) => wrap(l, i===0?bold:font, i===0?fs*1.3:fs, W-2*m).forEach(x => lines.push({t:x, first:i===0})));
    if(lines.length * fs * 1.45 <= H - 2*m - fs*2) break;
    fs *= 0.88;
  }
  const ink = PDFLib.rgb(0.055, 0.04, 0.025), muted = PDFLib.rgb(0.42, 0.38, 0.35), green = PDFLib.rgb(0.40, 0.53, 0.38);
  page.drawRectangle({x:0, y:0, width:W, height:H, color:PDFLib.rgb(0.99, 0.98, 0.95)});
  page.drawRectangle({x:m, y:H-m+fs*0.9, width:fs*0.45, height:fs*0.45, color:green});
  page.drawText("BEGLEITSEITE FÜR LANGDOCK · KEINE KATALOGSEITE", {x:m+fs*0.9, y:H-m+fs*0.75, size:fs*0.7, font:font, color:muted});
  let y = H - m - fs*1.2;
  for(const l of lines){
    const sz = l.first ? fs*1.3 : fs;
    page.drawText(l.t, {x:m, y:y, size:sz, font:l.first?bold:font, color:ink});
    y -= (l.first ? sz*1.6 : sz*1.45);
  }
  page.drawText("Erstellt mit dem Katalog-Paketierer " + VERSION, {x:m, y:m*0.6, size:fs*0.65, font:font, color:muted});
}

function buildPrompt(T, i, total){
  const isP = T.products.some(p=>/^P/.test(p.key));
  const liste = T.products.map(p => /^P/.test(p.key) ? `${p.key}: ${p.hit.join(", ")}` : p.key).join("\n");
  return `Datenrückführung Teilpaket ${i} von ${total}.
Die Paket-PDF beginnt mit dieser Begleitseite (keine Katalogseite). Danach folgen nur die PDF-Seiten ${T.pageList.join(", ")} der Sammelmappe (Auswahl ist bereits erfolgt, keine weiteren Seiten suchen).
Produktliste für dieses Teilpaket${isP?" (Produktnummer: Artikelnummern im Katalog)":""}:
${liste}

Bitte nach dem Skill Katalog-Textrückführung arbeiten und die Dateien als Datenrueckfuehrung_Teil${pad(i)}.xlsx und Artikel-Zuordnung_Teil${pad(i)}.xlsx ausgeben.`;
}

const de = x => x.toFixed(1).replace(".", ",");
function render(){
  const R = lastResult; $("empty").hidden = true; $("result").hidden = false;
  const sizeMB = R.teile.reduce((s,t)=>s+t.bytes.length,0)/2**20;
  const srcMB = pdfBytes.length/2**20;
  const foundN = R.teile.reduce((s,t)=>s+t.products.length,0);
  const pagesN = R.teile.reduce((s,t)=>s+t.pageList.length,0);
  const n = R.teile.length;
  $("resultTitle").innerHTML = `${n} ${n===1?"Paket":"Pakete"}, <em>bereit für Langdock.</em>`;
  $("resultSub").textContent = `Statt ${R.pages} Doppelseiten mit ${srcMB.toFixed(0)} MB gehen nur ${pagesN} Doppelseiten mit ${de(sizeMB)} MB an Langdock.`;
  $("summary").innerHTML = "";
  [[`${foundN} von ${R.total}`,"Produkte gefunden", R.missing.length?`${R.missing.length} ${R.missing.length===1?"fehlt":"fehlen"} im Katalog`:"alle im Katalog"],
   [`${pagesN} von ${R.pages}`,"Doppelseiten übernommen","nur Seiten mit gesuchten Produkten"],
   [`${de(sizeMB)} MB`,"statt "+srcMB.toFixed(0)+" MB","Summe aller Pakete"]]
   .forEach(([a,b,c])=>{ const d=document.createElement("div"); d.className="col";
     d.innerHTML='<div class="n"></div><div class="t"></div><div class="s"></div>';
     d.querySelector(".n").textContent=a; d.querySelector(".t").textContent=b; d.querySelector(".s").textContent=c; $("summary").appendChild(d); });
  const miss = [...R.missing, ...R.unread.map(u=>"nicht gelesen: "+u)];
  $("missingBox").hidden = !miss.length; $("missing").textContent = miss.join("\n");
  const box = $("teile"); box.innerHTML = "";
  R.teile.forEach((T,ix) => {
    const d = document.createElement("article"); d.className = "teil";
    const partial = T.products.filter(p=>p.miss.length).map(p=>`${p.key}: ${p.miss.join(", ")} nicht im Katalog`);
    d.innerHTML = `<div class="teil-head"><span class="zone dot"></span><span class="idx"></span></div><h3></h3><div class="meta"></div><div class="partial" hidden></div>
      <details><summary>Text für Langdock anzeigen</summary><pre></pre></details>
      <div class="row"><button class="btn btn-primary" data-a="pdf">PDF speichern ARROW</button><button class="btn btn-secondary" data-a="copy">Text kopieren</button></div>`.replace("ARROW", ARROW);
    d.querySelector(".zone").textContent = `Paket ${pad(ix+1)} von ${pad(n)}`;
    d.querySelector(".idx").textContent = `${de(T.bytes.length/2**20)} MB`;
    d.querySelector("h3").textContent = `${T.products.length} ${T.products.length===1?"Produkt":"Produkte"} auf ${T.pageList.length} ${T.pageList.length===1?"Doppelseite":"Doppelseiten"}`;
    d.querySelector(".meta").textContent = `PDF-Seiten ${T.pageList.join(", ")}`;
    if(partial.length){ const p=d.querySelector(".partial"); p.hidden=false; p.textContent = "Teilweise: " + partial.join("; "); }
    d.querySelector("pre").textContent = T.prompt;
    d.querySelector('[data-a=pdf]').onclick = () => download(new Blob([T.bytes],{type:"application/pdf"}), T.name+".pdf");
    d.querySelector('[data-a=copy]').onclick = async e => {
      const b = e.currentTarget;
      try{ await navigator.clipboard.writeText(T.prompt); b.textContent="Kopiert"; }
      catch{ d.querySelector("details").open = true; const r=document.createRange(); r.selectNodeContents(d.querySelector("pre")); getSelection().removeAllRanges(); getSelection().addRange(r); b.textContent="Markiert, mit Cmd/Strg+C kopieren"; }
    };
    box.appendChild(d);
  });
}

$("zipAll").onclick = async () => {
  const R = lastResult; const zip = new JSZip();
  const ov = ["Teil;Doppelseiten;Produkt;Artikel gefunden;Artikel nicht gefunden"];
  R.teile.forEach(T => {
    zip.file(T.name+".pdf", T.bytes); zip.file(T.name+"_Langdock-Text.txt", T.prompt);
    T.products.forEach(p => ov.push([T.name, T.pageList.join(" "), p.key, p.hit.join(" "), p.miss.join(" ")].join(";")));
  });
  R.missing.forEach(m => ov.push(["nicht gefunden","",m,"",""].join(";")));
  zip.file("Uebersicht.csv", "﻿"+ov.join("\n"));
  const base = pdfFileName.replace(/\.pdf$/i,"");
  download(await zip.generateAsync({type:"blob"}), `${base}_Teilpakete.zip`);
};

/* ---------- Zusammenführen ---------- */
let xlsFiles = [];
wireDrop($("xlsDrop"), $("xlsInput"), files => {
  xlsFiles = xlsFiles.concat(files.filter(f=>/\.xlsx$/i.test(f.name)));
  $("xlsNames").textContent = xlsFiles.length ? xlsFiles.map(f=>f.name).join(", ") : "Noch keine Dateien";
  $("merge").disabled = !xlsFiles.length; $("xlsDrop").classList.toggle("filled", xlsFiles.length>0); if(xlsFiles.length) $("xlsDrop").querySelector(".big").textContent = `${xlsFiles.length} Dateien geladen`;
});
const COLS = {
  "Produkte": ["Produktnummer","Produktname","Tagline","Sellingpoint 1","Sellingpoint 2","Sellingpoint 3","Sellingpoint 4","Sellingpoint 5","Sellingpoint 6","Sellingpoint 7","Sellingpoint 8","Marketingtext Master (Fließtext)","Abmessungen Set (Einzelmaße)","Fassungsvermögen Set","Set-Inhalt"],
  "Artikel-Zuordnung": ["SKU","Größenbezeichnung","Artikelfarbe","Auswahl","Maße"]
};
const KEY = {"Produkte":"Produktnummer","Artikel-Zuordnung":"SKU"};
const OUT = {"Produkte":"Datenrueckfuehrung.xlsx","Artikel-Zuordnung":"Artikel-Zuordnung.xlsx"};
function cellText(v){
  if(v==null) return ""; if(typeof v==="object"){ if(v.richText) return v.richText.map(r=>r.text).join(""); if("result" in v) return String(v.result??""); if(v.text) return String(v.text); }
  return String(v);
}
$("merge").onclick = async () => {
  const log = []; const rows = {"Produkte":[], "Artikel-Zuordnung":[]}; const seen = {"Produkte":new Set(),"Artikel-Zuordnung":new Set()};
  for(const f of xlsFiles){
    const wb = new ExcelJS.Workbook(); await wb.xlsx.load(await f.arrayBuffer());
    for(const kind of Object.keys(COLS)){
      const ws = wb.getWorksheet(kind); if(!ws) continue;
      const head = {}; ws.getRow(1).eachCell((c,i)=>{ head[cellText(c.value).trim()] = i; });
      const miss = COLS[kind].filter(c=>!(c in head)); if(miss.length) log.push(`${f.name}: Spalten fehlen: ${miss.join(", ")}`);
      let added=0, dup=0;
      for(let r=2;r<=ws.rowCount;r++){
        const row = ws.getRow(r); const vals = COLS[kind].map(c => head[c] ? cellText(row.getCell(head[c]).value).trim() : "");
        if(vals.every(v=>!v)) continue;
        const k = vals[COLS[kind].indexOf(KEY[kind])];
        if(k && seen[kind].has(k)){ dup++; log.push(`${f.name}: ${KEY[kind]} ${k} doppelt, übersprungen`); continue; }
        if(k) seen[kind].add(k); rows[kind].push(vals); added++;
      }
      log.push(`${f.name}: ${added} Zeilen aus ${kind}`);
    }
  }
  for(const kind of Object.keys(COLS)){
    if(!rows[kind].length) continue;
    const wb = new ExcelJS.Workbook(); const ws = wb.addWorksheet(kind, {views:[{state:"frozen", ySplit:1}]});
    ws.addRow(COLS[kind]); ws.getRow(1).font = {bold:true};
    rows[kind].forEach(v=>ws.addRow(v));
    ws.columns.forEach((c,i)=>{ const h=COLS[kind][i]; c.width = /Marketing/.test(h)?70:/Sellingpoint|Produktname|Abmess|Set-Inhalt/.test(h)?30:18; c.alignment={wrapText:true, vertical:"top"}; });
    ws.autoFilter = {from:{row:1,column:1}, to:{row:1,column:COLS[kind].length}};
    download(new Blob([await wb.xlsx.writeBuffer()],{type:"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"}), OUT[kind]);
  }
  $("mstatus").textContent = log.join("\n") + `\n\nErgebnis: ${rows["Produkte"].length} Produkte, ${rows["Artikel-Zuordnung"].length} Artikel.`;
};

}

if(document.readyState==="loading") document.addEventListener("DOMContentLoaded", boot); else boot();
})();
