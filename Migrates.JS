<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
<title>PostAllTon — Um clique. Todas as redes.</title>
<style>
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,500;0,600;1,400;1,600&family=Syne:wght@400;600;700;800&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
:root{
  --bg:#07070a;--surface:#0f0f12;--border:#1e1e24;--border2:#2a2a32;
  --gold:#c9a84c;--gold-dim:#6b5520;--amber:#f59e0b;
  --text:#e8e6e0;--muted:#5a5854;--muted2:#8a8680;
  --green:#4ade80;--red:#f87171;
  --fd:'Cormorant Garamond',Georgia,serif;
  --fu:'Syne',system-ui,sans-serif;
}
html,body{min-height:100vh;background:var(--bg);color:var(--text);font-family:var(--fu)}
a{color:var(--gold)}
::-webkit-scrollbar{width:3px}
::-webkit-scrollbar-thumb{background:var(--border2)}

/* ANIMAÇÕES */
@keyframes fadeUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
@keyframes spin{to{transform:rotate(360deg)}}
@keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}
@keyframes pillIn{from{opacity:0;transform:scale(.9)}to{opacity:1;transform:scale(1)}}

/* LANDING */
.landing{min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;position:relative;overflow:hidden;text-align:center;padding:40px 20px}
.grid-bg{position:absolute;inset:0;background-image:linear-gradient(rgba(201,168,76,.04) 1px,transparent 1px),linear-gradient(90deg,rgba(201,168,76,.04) 1px,transparent 1px);background-size:64px 64px;mask-image:radial-gradient(ellipse 80% 80% at 50% 50%,black 20%,transparent 100%)}
.glow{position:absolute;top:40%;left:50%;transform:translate(-50%,-50%);width:700px;height:700px;background:radial-gradient(ellipse,rgba(201,168,76,.07) 0%,transparent 68%);pointer-events:none}
.inner{position:relative;z-index:2;display:flex;flex-direction:column;align-items:center;animation:fadeUp .8s ease both}
.emblem{width:84px;height:84px;border:1px solid rgba(201,168,76,.25);display:flex;align-items:center;justify-content:center;margin-bottom:28px;position:relative}
.emblem::before{content:'';position:absolute;inset:-1px;border:1px solid transparent;border-top-color:var(--gold);animation:spin 3s linear infinite}
.emblem-in{width:66px;height:66px;border:1px solid rgba(201,168,76,.12);display:flex;align-items:center;justify-content:center}
.sigla{font-family:var(--fd);font-size:20px;font-weight:600;color:var(--gold);letter-spacing:3px}
.wordmark{font-family:var(--fd);font-size:clamp(52px,9vw,88px);font-weight:500;letter-spacing:-2px;line-height:.95;color:var(--text)}
.wordmark span{color:var(--gold);font-style:italic}
.slogan{font-size:12px;letter-spacing:4px;text-transform:uppercase;color:var(--muted2);margin-top:16px}
.slogan strong{color:var(--gold);font-weight:700}
.orn{display:flex;align-items:center;gap:16px;width:300px;margin:36px 0}
.orn-l{flex:1;height:1px;background:linear-gradient(90deg,transparent,var(--gold-dim))}
.orn-r{flex:1;height:1px;background:linear-gradient(90deg,var(--gold-dim),transparent)}
.orn-d{width:6px;height:6px;background:var(--gold);transform:rotate(45deg);box-shadow:0 0 10px var(--gold)}
.nets{display:flex;flex-wrap:wrap;justify-content:center;gap:8px;max-width:520px;margin-bottom:16px}
.net-pill{display:inline-flex;align-items:center;gap:6px;font-size:9px;letter-spacing:2px;text-transform:uppercase;padding:6px 12px;border:1px solid var(--border2);color:var(--muted);font-weight:700;transition:all .2s;animation:pillIn .5s ease both}
.net-pill:hover{border-color:var(--gold-dim);color:var(--gold)}
.lang-bar{display:flex;gap:8px;margin-bottom:36px}
.lang-btn{padding:6px 14px;background:transparent;border:1px solid var(--border2);color:var(--muted);font-size:10px;letter-spacing:2px;font-weight:700;cursor:pointer;transition:all .2s;font-family:var(--fu)}
.lang-btn:hover,.lang-btn.active{border-color:var(--gold-dim);color:var(--gold);background:rgba(201,168,76,.05)}
.ctas{display:flex;flex-direction:column;align-items:center;gap:12px;margin-top:32px}
.btn-cta{display:inline-flex;align-items:center;gap:10px;padding:18px 52px;background:var(--gold);color:#07070a;font-size:11px;font-weight:800;letter-spacing:3px;text-transform:uppercase;border:none;cursor:pointer;transition:all .25s;font-family:var(--fu)}
.btn-cta:hover{background:var(--amber);transform:translateY(-2px);box-shadow:0 14px 40px rgba(201,168,76,.3)}
.btn-outline{padding:10px 28px;background:transparent;border:1px solid var(--border2);color:var(--muted2);font-size:10px;letter-spacing:2px;text-transform:uppercase;cursor:pointer;transition:all .2s;font-family:var(--fu)}
.btn-outline:hover{border-color:var(--gold-dim);color:var(--gold)}
.powered{font-size:10px;color:var(--muted);letter-spacing:1px;opacity:.6;margin-top:4px}
.lfoot{position:absolute;bottom:24px;left:0;right:0;display:flex;justify-content:center;gap:32px;z-index:2}
.lfoot span{font-size:9px;letter-spacing:2px;text-transform:uppercase;color:var(--muted);opacity:.4}

/* AUTH */
.auth-page{min-height:100vh;background:var(--bg);display:flex;align-items:center;justify-content:center;padding:20px;animation:fadeUp .4s ease both}
.auth-box{width:100%;max-width:400px}
.auth-card{background:var(--surface);border:1px solid var(--border);padding:32px}
.auth-logo{text-align:center;margin-bottom:32px}
.auth-wordmark{font-family:var(--fd);font-size:30px;font-weight:500;color:var(--text)}
.auth-wordmark span{color:var(--gold);font-style:italic}
.auth-sub{font-size:10px;letter-spacing:2px;text-transform:uppercase;color:var(--muted);margin-top:4px}
.auth-title{font-family:var(--fd);font-size:22px;font-weight:500;color:var(--text);margin-bottom:20px}
.auth-error{background:rgba(248,113,113,.08);border-left:2px solid var(--red);padding:10px 14px;margin-bottom:16px;font-size:12px;color:#fca5a5}
.auth-divider{display:flex;align-items:center;gap:12px;margin:16px 0;font-size:10px;letter-spacing:1px;color:var(--muted)}
.auth-divider::before,.auth-divider::after{content:'';flex:1;height:1px;background:var(--border)}
.auth-toggle{text-align:center;margin-top:20px;font-size:11px;color:var(--gold);cursor:pointer;letter-spacing:.5px}
.auth-back{text-align:center;margin-top:14px;font-size:10px;color:var(--muted);cursor:pointer}

/* PLANS */
.plans-page{min-height:100vh;background:var(--bg);display:flex;flex-direction:column;align-items:center;padding:70px 20px 60px;position:relative;overflow:hidden;animation:fadeUp .5s ease both}
.back-btn{position:absolute;top:24px;left:28px;background:transparent;border:1px solid var(--border2);color:var(--muted2);font-size:11px;letter-spacing:1.5px;text-transform:uppercase;padding:8px 16px;cursor:pointer;font-family:var(--fu);transition:all .2s}
.back-btn:hover{border-color:var(--gold-dim);color:var(--gold)}
.plans-title{font-family:var(--fd);font-size:clamp(36px,5vw,52px);font-weight:500;color:var(--text);letter-spacing:-1px;margin-bottom:6px;text-align:center}
.plans-title em{color:var(--gold);font-style:italic}
.plans-sub{font-size:11px;letter-spacing:3px;text-transform:uppercase;color:var(--muted);margin-bottom:32px}
.billing{display:flex;border:1px solid var(--border2);margin-bottom:48px}
.bill-btn{padding:10px 28px;background:transparent;border:none;font-size:11px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:var(--muted);cursor:pointer;font-family:var(--fu);transition:all .2s}
.bill-btn.active{background:var(--gold);color:#07070a}
.plans-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:1px;background:var(--border);max-width:860px;width:100%;border:1px solid var(--border)}
@media(max-width:700px){.plans-grid{grid-template-columns:1fr}}
.plan-card{background:var(--surface);padding:32px 24px;display:flex;flex-direction:column;position:relative}
.plan-card.hi{background:#0c0c0e}
.plan-badge{position:absolute;top:-1px;left:50%;transform:translateX(-50%);background:var(--gold);color:#07070a;font-size:8px;font-weight:800;letter-spacing:2px;text-transform:uppercase;padding:4px 14px;white-space:nowrap}
.plan-name{font-family:var(--fd);font-size:26px;font-weight:500;color:var(--text);margin-bottom:2px}
.plan-card.hi .plan-name{color:var(--gold)}
.plan-desc{font-size:11px;color:var(--muted);margin-bottom:24px}
.plan-price{font-family:var(--fd);font-size:44px;font-weight:400;color:var(--text);line-height:1;margin-bottom:4px}
.plan-price-sub{font-size:11px;color:var(--muted);letter-spacing:1px;margin-bottom:24px}
.plan-div{height:1px;background:var(--border);margin-bottom:20px}
.plan-feats{list-style:none;display:flex;flex-direction:column;gap:9px;margin-bottom:28px;flex:1}
.plan-feat{display:flex;align-items:center;gap:9px;font-size:12px;color:var(--muted2)}
.feat-chk{width:13px;height:13px;flex-shrink:0;border:1px solid var(--gold-dim);display:flex;align-items:center;justify-content:center;font-size:7px;color:var(--gold)}
.plan-cta{padding:13px;border:none;font-size:10px;font-weight:800;letter-spacing:2px;text-transform:uppercase;cursor:pointer;width:100%;font-family:var(--fu);transition:all .2s}
.cta-def{background:transparent;border:1px solid var(--border2);color:var(--muted2)}
.cta-def:hover{border-color:var(--gold-dim);color:var(--gold)}
.cta-hi{background:var(--gold);color:#07070a}
.cta-hi:hover{background:var(--amber)}

/* APP SHELL */
.shell{display:flex;min-height:100vh}
.sidebar{width:220px;min-height:100vh;background:var(--surface);border-right:1px solid var(--border);display:flex;flex-direction:column;position:fixed;top:0;left:0;z-index:50;padding:28px 0}
.sb-logo{padding:0 24px 24px;border-bottom:1px solid var(--border)}
.sb-mark{font-family:var(--fd);font-size:22px;font-weight:500;color:var(--text);display:flex;align-items:center;gap:9px;line-height:1}
.sb-dot{width:7px;height:7px;background:var(--gold);border-radius:50%;box-shadow:0 0 10px var(--gold);flex-shrink:0}
.sb-sub{font-size:9px;letter-spacing:2.5px;text-transform:uppercase;color:var(--muted);margin-top:5px;padding-left:16px}
.nav-list{padding:18px 0;list-style:none;flex:1}
.nav-item{position:relative}
.nav-btn{width:100%;display:flex;align-items:center;gap:11px;padding:10px 24px;background:none;border:none;color:var(--muted);font-size:11px;font-weight:500;letter-spacing:.5px;cursor:pointer;transition:color .2s;text-align:left;font-family:var(--fu)}
.nav-btn:hover{color:var(--text)}
.nav-btn.active{color:var(--gold)}
.nav-bar{position:absolute;right:0;top:50%;transform:translateY(-50%);width:2px;height:16px;background:var(--gold);box-shadow:0 0 8px var(--gold)}
.sb-foot{padding:16px 24px 0;border-top:1px solid var(--border);display:flex;flex-direction:column;gap:8px}
.lang-foot{display:flex;gap:4px}
.lf-btn{padding:4px 8px;background:transparent;border:1px solid transparent;color:var(--muted);font-size:9px;letter-spacing:1.5px;font-weight:700;cursor:pointer;transition:all .15s;font-family:var(--fu)}
.lf-btn:hover,.lf-btn.active{border-color:var(--gold-dim);color:var(--gold)}
.main{margin-left:220px;flex:1;min-height:100vh;display:flex;flex-direction:column}
@media(max-width:800px){.sidebar{display:none}.main{margin-left:0}}
.topbar{padding:24px 40px 16px;display:flex;align-items:flex-end;justify-content:space-between;border-bottom:1px solid var(--border)}
.page-title{font-family:var(--fd);font-size:28px;font-weight:500;letter-spacing:-.5px;line-height:1}
.page-title em{font-style:italic;color:var(--gold)}
.page-date{font-size:10px;color:var(--muted);letter-spacing:1px;text-transform:uppercase;display:flex;flex-direction:column;align-items:flex-end;gap:6px}
.home-btn{background:transparent;border:1px solid var(--border);color:var(--muted);font-size:9px;letter-spacing:1.5px;text-transform:uppercase;padding:4px 10px;cursor:pointer;font-family:var(--fu)}
.content{padding:32px 40px;flex:1;animation:fadeUp .3s ease both}
.sec-lbl{font-size:9px;letter-spacing:2.5px;text-transform:uppercase;color:var(--muted);margin-bottom:12px;display:flex;align-items:center;gap:10px}
.sec-lbl::after{content:'';flex:1;height:1px;background:var(--border)}
.panel{background:var(--surface);border:1px solid var(--border);padding:24px 28px;margin-bottom:18px}
.panel-gold{border-color:var(--gold-dim);background:linear-gradient(135deg,#0c0a05,#0f0f0a)}
.field-lbl{font-size:9px;letter-spacing:2px;text-transform:uppercase;color:var(--muted);display:block;margin-bottom:9px}
.input-f{width:100%;background:var(--bg);border:1px solid var(--border);color:var(--text);font-size:13px;padding:12px 15px;outline:none;transition:border-color .2s;font-family:var(--fu);color-scheme:dark}
.input-f:focus{border-color:var(--gold-dim)}
.input-f::placeholder{color:var(--muted)}
.textarea-f{width:100%;background:var(--bg);border:1px solid var(--border);color:var(--text);font-size:14px;line-height:1.7;padding:13px 15px;resize:vertical;min-height:120px;outline:none;transition:border-color .2s;font-family:var(--fu)}
.textarea-f:focus{border-color:var(--gold-dim)}
.textarea-f::placeholder{color:var(--muted)}
.char-c{font-size:10px;color:var(--muted);text-align:right;margin-top:6px}
.btn-primary{display:flex;align-items:center;justify-content:center;gap:10px;width:100%;padding:15px;background:var(--gold);color:#07070a;font-size:11px;font-weight:800;letter-spacing:2.5px;text-transform:uppercase;border:none;cursor:pointer;transition:all .2s;font-family:var(--fu)}
.btn-primary:hover{background:var(--amber)}
.btn-primary:disabled{background:var(--border2);color:var(--muted);cursor:not-allowed}
.btn-ghost{padding:10px 18px;background:transparent;border:1px solid var(--border2);color:var(--muted2);font-size:10px;letter-spacing:1.5px;text-transform:uppercase;cursor:pointer;transition:all .2s;font-family:var(--fu)}
.btn-ghost:hover{border-color:var(--gold-dim);color:var(--gold)}
.btn-sm{padding:5px 12px;background:transparent;border:1px solid var(--border);color:var(--muted);font-size:10px;letter-spacing:1.5px;text-transform:uppercase;cursor:pointer;transition:all .2s;font-family:var(--fu)}
.btn-sm:hover,.btn-sm.active{border-color:var(--gold-dim);color:var(--gold);background:rgba(201,168,76,.05)}
.net-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(80px,1fr));gap:7px}
.net-card{display:flex;flex-direction:column;align-items:center;gap:6px;padding:12px 6px;background:var(--bg);border:1px solid var(--border);cursor:pointer;transition:all .18s;position:relative}
.net-card:hover{border-color:var(--border2)}
.net-card.sel{border-color:var(--gold-dim);background:rgba(201,168,76,.04)}
.net-name-s{font-size:9px;color:var(--muted);text-align:center;line-height:1.2;font-weight:500}
.net-chk{position:absolute;top:4px;right:5px;font-size:7px;color:var(--gold);opacity:0;transition:opacity .15s}
.net-card.sel .net-chk{opacity:1}
.cg{display:grid;grid-template-columns:1fr 290px;gap:18px;align-items:start}
@media(max-width:900px){.cg{grid-template-columns:1fr}}
.cg-side{position:sticky;top:20px}
.sel-count{font-family:var(--fd);font-size:42px;font-weight:400;color:var(--gold);line-height:1}
.sel-lbl{font-size:10px;letter-spacing:2px;text-transform:uppercase;color:var(--muted);margin-top:4px}
.sel-div{height:1px;background:var(--border);margin:13px 0}
.sel-list{display:flex;flex-direction:column;gap:6px;max-height:180px;overflow-y:auto}
.sel-item{display:flex;align-items:center;gap:8px;font-size:11px;color:var(--muted2)}
.notice{display:flex;gap:12px;align-items:flex-start;padding:13px 16px;border-left:2px solid var(--gold-dim);background:rgba(201,168,76,.04);margin-bottom:18px}
.notice p{font-size:12px;line-height:1.6}
.notice-warn{border-color:#7a4a00;background:rgba(245,158,11,.04)}
.notice-err{border-color:var(--red);background:rgba(248,113,113,.05)}
.hist-item{padding:16px 0;border-bottom:1px solid var(--border);display:grid;grid-template-columns:1fr auto;gap:12px;align-items:start}
.hist-item:last-child{border-bottom:none}
.hist-cap{font-size:13px;color:var(--text);line-height:1.5;margin-bottom:8px}
.hist-tags{display:flex;flex-wrap:wrap;gap:5px}
.hist-tag{display:inline-flex;align-items:center;gap:4px;font-size:9px;letter-spacing:1px;text-transform:uppercase;padding:3px 8px;border:1px solid var(--border2);color:var(--muted2)}
.hist-meta{text-align:right}
.hist-date{font-size:10px;color:var(--muted)}
.badge{display:inline-block;font-size:8px;letter-spacing:1.5px;text-transform:uppercase;padding:3px 8px;margin-bottom:5px}
.badge-pub{background:rgba(74,222,128,.08);color:#4ade80;border:1px solid #4ade8030}
.badge-sch{background:rgba(245,158,11,.08);color:#f59e0b;border:1px solid #f59e0b30}
.modal-bg{position:fixed;inset:0;background:rgba(0,0,0,.88);display:flex;align-items:center;justify-content:center;z-index:200;backdrop-filter:blur(6px)}
.modal{background:var(--surface);border:1px solid var(--border2);width:90%;max-width:420px;padding:30px;box-shadow:0 40px 100px rgba(0,0,0,.8);animation:fadeUp .2s ease}
.modal-title{font-family:var(--fd);font-size:24px;font-weight:500;margin-bottom:6px}
.modal-sub{font-size:12px;color:var(--muted2);margin-bottom:20px;line-height:1.5}
.modal-plats{display:flex;flex-wrap:wrap;gap:5px;margin-bottom:20px;padding:12px;background:var(--bg);border:1px solid var(--border)}
.plat-pill{display:inline-flex;align-items:center;gap:5px;font-size:8px;letter-spacing:1px;text-transform:uppercase;padding:4px 9px;border:1px solid;font-weight:700}
.modal-actions{display:flex;gap:10px;margin-top:20px}
.modal-actions .btn-ghost{flex:1}
.modal-actions .btn-primary{flex:2}
.result-row{display:flex;align-items:center;gap:10px;padding:7px 0;border-bottom:1px solid var(--border);font-size:12px}
.result-row:last-child{border-bottom:none}
.result-name{flex:1;color:var(--muted2)}
.result-ok{color:var(--green);font-size:10px}
.result-err{color:var(--red);font-size:10px}
.pub-state{text-align:center;padding:24px 0}
.spinner{width:32px;height:32px;border:2px solid var(--border2);border-top-color:var(--gold);border-radius:50%;animation:spin .8s linear infinite;margin:0 auto 16px}
</style>
</head>
<body>
<div id="app"></div>
<script>
// ══ SVG ICONS ═══════════════════════════════════════════════════════
const SVG = {
  instagram:`<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>`,
  facebook:`<svg viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>`,
  tiktok:`<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/></svg>`,
  youtube:`<svg viewBox="0 0 24 24" fill="currentColor"><path d="M23.495 6.205a3.007 3.007 0 0 0-2.088-2.088c-1.87-.501-9.396-.501-9.396-.501s-7.507-.01-9.396.501A3.007 3.007 0 0 0 .527 6.205a31.247 31.247 0 0 0-.522 5.805 31.247 31.247 0 0 0 .522 5.783 3.007 3.007 0 0 0 2.088 2.088c1.868.502 9.396.502 9.396.502s7.506 0 9.396-.502a3.007 3.007 0 0 0 2.088-2.088 31.247 31.247 0 0 0 .5-5.783 31.247 31.247 0 0 0-.5-5.805zM9.609 15.601V8.408l6.264 3.602z"/></svg>`,
  twitter:`<svg viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>`,
  linkedin:`<svg viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>`,
  telegram:`<svg viewBox="0 0 24 24" fill="currentColor"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.820 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>`,
  pinterest:`<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.373 0 0 5.372 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 0 1 .083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.632-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0z"/></svg>`,
  reddit:`<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z"/></svg>`,
  bluesky:`<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 10.8c-1.087-2.114-4.046-6.053-6.798-7.995C2.566.944 1.561 1.266.902 1.565.139 1.908 0 3.08 0 3.768c0 .69.378 5.65.624 6.479.815 2.736 3.713 3.66 6.383 3.364.136-.02.275-.039.415-.056-.138.022-.276.04-.415.056-3.912.58-7.387 2.005-2.83 7.078 5.013 5.19 6.87-1.113 7.823-4.308.953 3.195 2.05 9.271 7.733 4.308 4.267-4.308 1.172-6.498-2.74-7.078a8.741 8.741 0 0 1-.415-.056c.14.017.279.036.415.056 2.67.297 5.568-.628 6.383-3.364.246-.828.624-5.79.624-6.478 0-.69-.139-1.861-.902-2.204-.659-.299-1.664-.62-4.3 1.24C16.046 4.748 13.087 8.687 12 10.8z"/></svg>`,
  threads:`<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12.186 24h-.007c-3.581-.024-6.334-1.205-8.184-3.509C2.35 18.44 1.5 15.586 1.472 12.01v-.017c.03-3.579.879-6.43 2.525-8.482C5.845 1.205 8.6.024 12.18 0h.014c2.746.02 5.043.725 6.826 2.098 1.677 1.29 2.858 3.13 3.509 5.467l-2.04.569c-1.104-3.96-3.898-5.984-8.304-6.015-2.91.022-5.11.936-6.54 2.717C4.307 6.504 3.616 8.914 3.589 12c.027 3.086.718 5.496 2.057 7.164 1.43 1.783 3.631 2.698 6.54 2.717 2.623-.02 4.358-.631 5.8-2.045 1.647-1.613 1.618-3.593 1.09-4.798-.31-.71-.873-1.3-1.634-1.75-.192 1.352-.622 2.446-1.284 3.272-.886 1.102-2.14 1.704-3.73 1.79-1.202.065-2.361-.218-3.259-.801-1.063-.689-1.685-1.74-1.752-2.964-.065-1.19.408-2.285 1.33-3.082.88-.76 2.119-1.207 3.583-1.291a13.853 13.853 0 0 1 3.02.142c-.126-.742-.375-1.332-.75-1.757-.513-.586-1.308-.883-2.359-.89h-.029c-.844 0-1.992.232-2.721 1.32L7.734 7.952c.98-1.454 2.568-2.256 4.478-2.256h.044c3.194.02 5.097 1.975 5.287 5.388.108.005.213.017.316.026 1.553.143 2.996.732 4.054 1.668 1.209 1.074 1.85 2.542 1.79 4.134-.08 2.021-.87 3.942-2.261 5.404C19.717 23.738 16.48 24 12.186 24zm-2.75-8.696c.883-.048 1.55-.36 1.99-.932.516-.663.762-1.641.728-2.91a11.086 11.086 0 0 0-2.3-.073c-1.739.1-2.708.771-2.652 1.82.037.68.448 1.81 2.234 2.095z"/></svg>`,
  snapchat:`<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12.206.793c.99 0 4.347.276 5.93 3.821.529 1.193.403 3.219.299 4.847l-.003.06c-.012.18-.022.345-.03.51.075.045.203.09.401.09.3-.016.659-.12 1.033-.301.165-.088.344-.104.512-.104.45 0 .916.195 1.094.465.14.209.14.43.02.67-.173.36-.426.612-1.025.695-.14.03-.282.074-.427.12-.65.244-1.234.731-1.462 1.25-.045.115-.015.195.015.24l.03.045c.9 1.345 2.924 4.47 6.198 5.16.065.014.104.044.09.104-.375 1.061-2.624 1.844-4.783 2.258-.075.017-.104.06-.12.09-.21.24-.315.721-.48 1.365-.03.12-.12.194-.254.194h-.014c-.09 0-.27-.03-.54-.092-.33-.09-.747-.192-1.23-.192-.51 0-.899.12-1.26.239-.869.308-1.664.645-3.07.645-1.391 0-2.326-.33-3.227-.645-.352-.12-.749-.239-1.26-.239-.483 0-.887.092-1.23.193-.27.061-.449.091-.54.091h-.014c-.133 0-.223-.074-.254-.194-.164-.644-.269-1.125-.479-1.365-.016-.03-.045-.073-.12-.09-2.159-.414-4.408-1.197-4.783-2.258-.014-.06.025-.09.09-.104 3.273-.69 5.298-3.815 6.197-5.16l.03-.045c.03-.045.06-.125.015-.24-.228-.519-.812-1.006-1.462-1.25-.144-.046-.286-.09-.427-.12-.6-.083-.852-.334-1.025-.695-.12-.24-.12-.461.02-.67.18-.27.645-.465 1.094-.465.168 0 .347.016.512.104.374.181.732.285 1.033.301.197 0 .326-.045.401-.09l-.031-.57c-.103-1.628-.229-3.654.3-4.847C7.86 1.07 11.216.793 12.206.793z"/></svg>`
};

// ══ DADOS ════════════════════════════════════════════════════════════
const API = 'https://postallton-saas.onrender.com';

const NETS = [
  {id:'instagram',name:'Instagram',  color:'#E1306C'},
  {id:'facebook', name:'Facebook',   color:'#1877F2'},
  {id:'tiktok',   name:'TikTok',     color:'#ff2d55'},
  {id:'youtube',  name:'YouTube',    color:'#FF0000'},
  {id:'twitter',  name:'X/Twitter',  color:'#e7e9ea'},
  {id:'linkedin', name:'LinkedIn',   color:'#0A66C2'},
  {id:'telegram', name:'Telegram',   color:'#229ED9'},
  {id:'pinterest',name:'Pinterest',  color:'#E60023'},
  {id:'reddit',   name:'Reddit',     color:'#FF4500'},
  {id:'bluesky',  name:'Bluesky',    color:'#0085ff'},
  {id:'threads',  name:'Threads',    color:'#cccccc'},
  {id:'snapchat', name:'Snapchat',   color:'#FFFC00'},
];

const PLANS = [
  {id:'basic',   name:'Básico',  desc:'Para criadores solo',  m:'R$19', l:'R$149',  feats:['3 redes sociais','30 posts/mês','Agendamento básico','Suporte por e-mail']},
  {id:'pro',     name:'Pro',     desc:'Para profissionais',   m:'R$49', l:'R$349',  feats:['12 redes sociais','Posts ilimitados','Agendamento avançado','Mídias e links','Histórico completo','Suporte prioritário'], hi:true},
  {id:'business',name:'Business',desc:'Para agências',        m:'R$99', l:'R$599',  feats:['Todas as redes','Posts ilimitados','Multi-clientes','API personalizada','Relatórios de alcance','Suporte dedicado']},
];

// ══ TRADUÇÕES ════════════════════════════════════════════════════════
const I18N = {
  pt:{
    slogan:'Um clique. Todas as redes.', enter:'Acessar o painel', plans:'Ver planos',
    monthly:'Mensal', lifetime:'Vitalício', mo:'/mês', once:'único',
    popular:'Mais popular', bestval:'Melhor valor', start:'Começar agora', buy:'Comprar acesso',
    login:'Entrar', register:'Criar conta', email:'E-mail', password:'Senha', name:'Nome',
    loginSub:'Acesse seu painel PostAllTon', registerSub:'Crie sua conta gratuita',
    google:'Continuar com Google', noAccount:'Não tem conta? Registre-se', hasAccount:'Já tem conta? Entre',
    compose:'Nova Publicação', history:'Histórico', logout:'Sair',
    platforms:'Plataformas', all:'Todas', none:'Nenhuma',
    selected:'Selecionadas', platform:'plataforma', platforms2:'plataformas',
    caption:'Legenda / Mensagem', captionPh:'Escreva sua legenda, hashtags, emojis…',
    media:'URLs de Mídia — opcional', mediaPh:'https://dominio.com/foto.jpg',
    mediaHint:'URLs públicas separadas por vírgula.',
    schedule:'Agendar Publicação — opcional', scheduledFor:'Agendado para',
    publishNow:'Publicar agora em', scheduleIn:'Agendar em',
    preview:'Preview', previewEmpty:'Sua legenda aparecerá aqui.',
    histTitle:'Histórico de Posts', histDesc:'Posts publicados via PostAllTon.',
    refresh:'↻ Atualizar', loading:'Carregando…', noPostsYet:'Nenhum post ainda.',
    createFirst:'Criar primeira publicação',
    confirmTitle:'Confirmar', confirmSub:'Publicar em', confirmSub2:'plataforma(s) simultaneamente.',
    publishBtn:'Publicar agora', cancelBtn:'Cancelar',
    publishing:'Publicando…', publishingSub:'Enviando para',
    publishedTitle:'Publicado!', publishedSub:'Conteúdo distribuído nas plataformas abaixo.',
    seePost:'Ver post →', published:'publicado', sent:'enviado', closeBtn:'Fechar',
    errorTitle:'Erro', errorHint:'Verifique suas credenciais e tente novamente.',
    retryBtn:'Tentar novamente', statusPub:'publicado', statusSched:'agendado',
    chars:'caracteres', back:'Voltar',
  },
  en:{
    slogan:'One click. Every network.', enter:'Open dashboard', plans:'See plans',
    monthly:'Monthly', lifetime:'Lifetime', mo:'/mo', once:'once',
    popular:'Most popular', bestval:'Best value', start:'Get started', buy:'Buy access',
    login:'Sign in', register:'Create account', email:'Email', password:'Password', name:'Name',
    loginSub:'Access your PostAllTon dashboard', registerSub:'Create your free account',
    google:'Continue with Google', noAccount:"No account? Sign up", hasAccount:'Already have one? Sign in',
    compose:'New Post', history:'History', logout:'Logout',
    platforms:'Platforms', all:'All', none:'None',
    selected:'Selected', platform:'platform', platforms2:'platforms',
    caption:'Caption / Message', captionPh:'Write your caption, hashtags, emojis…',
    media:'Media URLs — optional', mediaPh:'https://domain.com/photo.jpg',
    mediaHint:'Comma-separated public URLs.',
    schedule:'Schedule Post — optional', scheduledFor:'Scheduled for',
    publishNow:'Publish now to', scheduleIn:'Schedule to',
    preview:'Preview', previewEmpty:'Your caption will appear here.',
    histTitle:'Post History', histDesc:'Posts published via PostAllTon.',
    refresh:'↻ Refresh', loading:'Loading…', noPostsYet:'No posts yet.',
    createFirst:'Create first post',
    confirmTitle:'Confirm', confirmSub:'Publish to', confirmSub2:'platform(s) simultaneously.',
    publishBtn:'Publish now', cancelBtn:'Cancel',
    publishing:'Publishing…', publishingSub:'Sending to',
    publishedTitle:'Published!', publishedSub:'Content distributed to the platforms below.',
    seePost:'See post →', published:'published', sent:'sent', closeBtn:'Close',
    errorTitle:'Error', errorHint:'Check your credentials and try again.',
    retryBtn:'Try again', statusPub:'published', statusSched:'scheduled',
    chars:'characters', back:'Back',
  },
  es:{
    slogan:'Un clic. Todas las redes.', enter:'Abrir panel', plans:'Ver planes',
    monthly:'Mensual', lifetime:'Vitalicio', mo:'/mes', once:'único',
    popular:'Más popular', bestval:'Mejor valor', start:'Empezar ahora', buy:'Comprar acceso',
    login:'Iniciar sesión', register:'Crear cuenta', email:'Correo', password:'Contraseña', name:'Nombre',
    loginSub:'Accede a tu panel PostAllTon', registerSub:'Crea tu cuenta gratuita',
    google:'Continuar con Google', noAccount:'¿Sin cuenta? Regístrate', hasAccount:'¿Ya tienes cuenta? Entra',
    compose:'Nueva Publicación', history:'Historial', logout:'Salir',
    platforms:'Plataformas', all:'Todas', none:'Ninguna',
    selected:'Seleccionadas', platform:'plataforma', platforms2:'plataformas',
    caption:'Leyenda / Mensaje', captionPh:'Escribe tu leyenda, hashtags, emojis…',
    media:'URLs de Medios — opcional', mediaPh:'https://dominio.com/foto.jpg',
    mediaHint:'URLs públicas separadas por comas.',
    schedule:'Programar Publicación — opcional', scheduledFor:'Programado para',
    publishNow:'Publicar ahora en', scheduleIn:'Programar en',
    preview:'Vista previa', previewEmpty:'Tu leyenda aparecerá aquí.',
    histTitle:'Historial de Publicaciones', histDesc:'Posts publicados via PostAllTon.',
    refresh:'↻ Actualizar', loading:'Cargando…', noPostsYet:'No hay posts aún.',
    createFirst:'Crear primera publicación',
    confirmTitle:'Confirmar', confirmSub:'Publicar en', confirmSub2:'plataforma(s) simultáneamente.',
    publishBtn:'Publicar ahora', cancelBtn:'Cancelar',
    publishing:'Publicando…', publishingSub:'Enviando a',
    publishedTitle:'¡Publicado!', publishedSub:'Contenido distribuido en las plataformas abajo.',
    seePost:'Ver post →', published:'publicado', sent:'enviado', closeBtn:'Cerrar',
    errorTitle:'Error', errorHint:'Verifica tus credenciales e inténtalo de nuevo.',
    retryBtn:'Intentar de nuevo', statusPub:'publicado', statusSched:'programado',
    chars:'caracteres', back:'Volver',
  },
  fr:{
    slogan:'Un clic. Tous les réseaux.', enter:'Ouvrir le tableau', plans:'Voir les plans',
    monthly:'Mensuel', lifetime:'À vie', mo:'/mois', once:'unique',
    popular:'Le plus populaire', bestval:'Meilleur rapport', start:'Commencer', buy:"Acheter l'accès",
    login:'Se connecter', register:'Créer un compte', email:'E-mail', password:'Mot de passe', name:'Nom',
    loginSub:'Accédez à votre tableau de bord', registerSub:'Créez votre compte gratuit',
    google:'Continuer avec Google', noAccount:"Pas de compte? S'inscrire", hasAccount:'Déjà un compte? Se connecter',
    compose:'Nouvelle Publication', history:'Historique', logout:'Déconnexion',
    platforms:'Plateformes', all:'Toutes', none:'Aucune',
    selected:'Sélectionnées', platform:'plateforme', platforms2:'plateformes',
    caption:'Légende / Message', captionPh:'Écrivez votre légende, hashtags, emojis…',
    media:'URLs de Médias — optionnel', mediaPh:'https://domaine.com/photo.jpg',
    mediaHint:'URLs publiques séparées par des virgules.',
    schedule:'Planifier la Publication — optionnel', scheduledFor:'Planifié pour',
    publishNow:'Publier maintenant sur', scheduleIn:'Planifier sur',
    preview:'Aperçu', previewEmpty:'Votre légende apparaîtra ici.',
    histTitle:'Historique des Publications', histDesc:'Posts publiés via PostAllTon.',
    refresh:'↻ Actualiser', loading:'Chargement…', noPostsYet:'Aucun post encore.',
    createFirst:'Créer la première publication',
    confirmTitle:'Confirmer', confirmSub:'Publier sur', confirmSub2:'plateforme(s) simultanément.',
    publishBtn:'Publier maintenant', cancelBtn:'Annuler',
    publishing:'Publication…', publishingSub:'Envoi vers',
    publishedTitle:'Publié!', publishedSub:'Contenu distribué sur les plateformes ci-dessous.',
    seePost:'Voir le post →', published:'publié', sent:'envoyé', closeBtn:'Fermer',
    errorTitle:'Erreur', errorHint:'Vérifiez vos identifiants et réessayez.',
    retryBtn:'Réessayer', statusPub:'publié', statusSched:'planifié',
    chars:'caractères', back:'Retour',
  },
};

// ══ STATE ════════════════════════════════════════════════════════════
let state = {
  screen:   'landing',
  lang:     'pt',
  billing:  'monthly',
  token:    localStorage.getItem('pat_token') || null,
  user:     (() => { try { return JSON.parse(localStorage.getItem('pat_user')); } catch(e) { return null; } })(),
  authMode: 'login',
  authEmail:'', authPassword:'', authName:'', authError:'',
  tab:      'compose',
  selected: new Set(NETS.map(n=>n.id)),
  caption:  '',
  mediaUrls:'',
  schedDate:'',
  posts:    [],
  connections: {}, // redes conectadas do usuário
  modal:    null,
  modalResults: {},
  modalError:   '',
  // configuração de rede em edição
  editingNet: null,
  netForm: {},
  netSaving: false,
  netError: '',
  netSuccess: '',
};

if(state.token && state.user) state.screen = 'app';

function t(k){ return (I18N[state.lang]||I18N.pt)[k] || k; }
function setState(p){ Object.assign(state, p); render(); }

// ══ HELPERS ══════════════════════════════════════════════════════════
function icon(id, color, size=22){
  return '<span style="display:inline-flex;width:'+size+'px;height:'+size+'px;flex-shrink:0;color:'+color+'">'+( SVG[id]||'' )+'</span>';
}

// ══ AUTH ════════════════════════════════════════════════════════════
async function doAuth(){
  const {authMode,authEmail,authPassword,authName} = state;
  if(!authEmail||!authPassword){ setState({authError:t('email')+' e '+t('password')+' são obrigatórios.'}); return; }
  setState({authError:''});
  try{
    const endpoint = authMode==='login' ? '/api/auth/login' : '/api/auth/register';
    const body = authMode==='login'
      ? {email:authEmail, password:authPassword}
      : {name:authName||authEmail.split('@')[0], email:authEmail, password:authPassword};
    const res = await fetch(API+endpoint,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});
    const data = await res.json();
    if(!res.ok) throw new Error(data.error||'Erro de autenticação');
    localStorage.setItem('pat_token', data.token);
    localStorage.setItem('pat_user', JSON.stringify(data.user));
    setState({token:data.token, user:data.user, screen:'app', tab:'compose', authError:''});
  }catch(e){ setState({authError:e.message}); }
}

function doLogout(){
  localStorage.removeItem('pat_token');
  localStorage.removeItem('pat_user');
  setState({token:null, user:null, screen:'landing', authEmail:'', authPassword:'', authName:''});
}

function doGoogleLogin(){
  window.location.href = API+'/api/auth/google';
}

// ══ PUBLICAÇÃO ═══════════════════════════════════════════════════════
async function publishPost(){
  if(!state.token||!state.caption.trim()||!state.selected.size) return;
  setState({modal:'publishing'});
  const body = {caption:state.caption, platforms:[...state.selected]};
  const ma = state.mediaUrls.split(',').map(s=>s.trim()).filter(Boolean);
  if(ma.length) body.mediaUrls = ma;
  if(state.schedDate) body.scheduleDate = new Date(state.schedDate).toISOString();
  try{
    const res = await fetch(API+'/api/post',{
      method:'POST',
      headers:{'Content-Type':'application/json','Authorization':'Bearer '+state.token},
      body:JSON.stringify(body)
    });
    const data = await res.json();
    if(!res.ok) throw new Error(data.error||'HTTP '+res.status);
    const results={};
    (data.postIds||[]).forEach(p=>{results[p.platform]={ok:true,url:p.postUrl};});
    (data.errors||[]).forEach(e=>{results[e.platform]={ok:false,msg:e.message};});
    const np={id:Date.now(),caption:state.caption,networks:[...state.selected],date:new Date().toLocaleString(),status:'publicado'};
    setState({modal:'done',modalResults:results,posts:[np,...state.posts],caption:'',mediaUrls:'',schedDate:''});
  }catch(e){ setState({modal:'error',modalError:e.message}); }
}

// ══ CREDENCIAIS DE REDES ══════════════════════════════════════════════
async function loadConnections() {
  if (!state.token) return;
  try {
    const r = await fetch(API+'/api/creds', { headers:{'Authorization':'Bearer '+state.token} });
    const d = await r.json();
    const map = {};
    (d.connections||[]).forEach(c => { map[c.platform] = c; });
    setState({ connections: map });
  } catch(e) { console.error('loadConnections:', e); }
}

async function saveCreds(platform) {
  setState({ netSaving:true, netError:'', netSuccess:'' });
  try {
    const r = await fetch(API+'/api/creds/'+platform, {
      method: 'POST',
      headers: { 'Content-Type':'application/json', 'Authorization':'Bearer '+state.token },
      body: JSON.stringify(state.netForm)
    });
    const d = await r.json();
    if (!r.ok) throw new Error(d.error || 'Erro ao salvar');
    await loadConnections();
    setState({ netSaving:false, netSuccess: d.message || platform+' conectado!', editingNet: null, netForm:{} });
  } catch(e) {
    setState({ netSaving:false, netError: e.message });
  }
}

async function deleteCreds(platform) {
  try {
    await fetch(API+'/api/creds/'+platform, {
      method:'DELETE', headers:{'Authorization':'Bearer '+state.token}
    });
    await loadConnections();
    render();
  } catch(e) { console.error(e); }
}

// ══ PAGAMENTOS ════════════════════════════════════════════════════════
async function startStripeCheckout(plan, billing) {
  if (!state.token) { setState({screen:'auth',authMode:'register'}); return; }
  try {
    const r = await fetch(API+'/api/payment/stripe/checkout', {
      method:'POST',
      headers:{'Content-Type':'application/json','Authorization':'Bearer '+state.token},
      body: JSON.stringify({plan, billingType:billing})
    });
    const d = await r.json();
    if (d.checkoutUrl) window.location.href = d.checkoutUrl;
    else throw new Error(d.error || 'Erro no checkout');
  } catch(e) { alert('Erro: '+e.message); }
}

async function startMPCheckout(plan, billing) {
  if (!state.token) { setState({screen:'auth',authMode:'register'}); return; }
  try {
    const r = await fetch(API+'/api/payment/mp/checkout', {
      method:'POST',
      headers:{'Content-Type':'application/json','Authorization':'Bearer '+state.token},
      body: JSON.stringify({plan, billingType:billing})
    });
    const d = await r.json();
    if (d.checkoutUrl) window.location.href = d.checkoutUrl;
    else throw new Error(d.error || 'Erro no checkout');
  } catch(e) { alert('Erro: '+e.message); }
}
function render(){ document.getElementById('app').innerHTML = page(); bindEvents(); }

function page(){
  if(state.screen==='landing') return pageLanding();
  if(state.screen==='plans')   return pagePlans();
  if(state.screen==='auth' || !state.token) return pageAuth();
  return pageApp();
}

// ══ LANDING ══════════════════════════════════════════════════════════
function pageLanding(){
  const s = t('slogan').split('.');
  return `
  <div class="landing">
    <div class="grid-bg"></div><div class="glow"></div>
    <div class="inner">
      <div class="lang-bar">
        ${['pt','en','es','fr'].map(l=>`<button class="lang-btn ${state.lang===l?'active':''}" onclick="setLang('${l}')">${l.toUpperCase()}</button>`).join('')}
      </div>
      <div class="emblem"><div class="emblem-in"><span class="sigla">PAT</span></div></div>
      <h1 class="wordmark">PostAll<span>Ton</span></h1>
      <p class="slogan"><strong>${s[0]}.</strong>${s.slice(1).join('.')}</p>
      <div class="orn"><div class="orn-l"></div><div class="orn-d"></div><div class="orn-r"></div></div>
      <div class="nets">
        ${NETS.map((n,i)=>`<span class="net-pill" style="animation-delay:${i*.04}s;border-color:${n.color}30;color:${n.color}99">
          ${icon(n.id,n.color,13)}<span>${n.name}</span>
        </span>`).join('')}
      </div>
      <div class="ctas">
        <button class="btn-cta" onclick="setState({screen:'auth',authMode:'login'})">◈ ${t('enter')}</button>
        <button class="btn-outline" onclick="setState({screen:'plans'})">${t('plans')}</button>
        <p class="powered">PostAllTon © 2026</p>
      </div>
    </div>
    <div class="lfoot"><span>PostAllTon</span><span>${t('slogan')}</span><span>© 2026</span></div>
  </div>`;
}

// ══ PLANS ════════════════════════════════════════════════════════════
function pagePlans(){
  const b = state.billing;
  return `
  <div class="plans-page">
    <div class="grid-bg" style="opacity:.4"></div>
    <button class="back-btn" onclick="setState({screen:'landing'})">← ${t('back')}</button>
    <h2 class="plans-title" style="margin-top:20px">
      ${state.lang==='pt'?'Escolha seu':state.lang==='es'?'Elige tu':state.lang==='fr'?'Choisissez votre':'Choose your'}
      <em>${state.lang==='pt'?'Plano':state.lang==='es'?'Plan':state.lang==='fr'?'Plan':'Plan'}</em>
    </h2>
    <p class="plans-sub">PostAllTon</p>
    <div class="billing">
      <button class="bill-btn ${b==='monthly'?'active':''}" onclick="setState({billing:'monthly'})">${t('monthly')}</button>
      <button class="bill-btn ${b==='lifetime'?'active':''}" onclick="setState({billing:'lifetime'})">${t('lifetime')}</button>
    </div>
    <div class="plans-grid">
      ${PLANS.map(p=>`
      <div class="plan-card ${p.hi?'hi':''}">
        ${p.hi?`<div class="plan-badge">${b==='monthly'?t('popular'):t('bestval')}</div>`:''}
        <div class="plan-name">${p.name}</div>
        <div class="plan-desc">${p.desc}</div>
        <div class="plan-price">${b==='monthly'?p.m:p.l}</div>
        <div class="plan-price-sub">${b==='monthly'?t('mo'):t('once')}</div>
        <div class="plan-div"></div>
        <ul class="plan-feats">${p.feats.map(f=>`<li class="plan-feat"><div class="feat-chk">✦</div>${f}</li>`).join('')}</ul>
        <button class="plan-cta ${p.hi?'cta-hi':'cta-def'}" onclick="setState({screen:'auth',authMode:'register'})">
          ${b==='monthly'?t('start'):t('buy')}
        </button>
      </div>`).join('')}
    </div>
  </div>`;
}

// ══ AUTH ════════════════════════════════════════════════════════════
function pageAuth(){
  const isLogin = state.authMode==='login';
  return `
  <div class="auth-page">
    <div class="auth-box">
      <div class="auth-logo">
        <div class="auth-wordmark">PostAll<span>Ton</span></div>
        <div class="auth-sub">${isLogin?t('loginSub'):t('registerSub')}</div>
      </div>
      <div class="auth-card">
        <h2 class="auth-title">${isLogin?t('login'):t('register')}</h2>
        ${state.authError?`<div class="auth-error">${state.authError}</div>`:''}
        ${!isLogin?`
        <div style="margin-bottom:14px">
          <label class="field-lbl">${t('name')}</label>
          <input class="input-f" type="text" placeholder="${t('name')}" id="authName" oninput="state.authName=this.value"/>
        </div>`:''}
        <div style="margin-bottom:14px">
          <label class="field-lbl">${t('email')}</label>
          <input class="input-f" type="email" placeholder="voce@email.com" id="authEmail" oninput="state.authEmail=this.value"/>
        </div>
        <div style="margin-bottom:24px">
          <label class="field-lbl">${t('password')}</label>
          <input class="input-f" type="password" placeholder="••••••••" id="authPass" oninput="state.authPassword=this.value"/>
        </div>
        <button class="btn-primary" onclick="doAuth()" style="margin-bottom:10px">${isLogin?t('login'):t('register')}</button>
        <div class="auth-divider">ou</div>
        <button onclick="doGoogleLogin()" style="width:100%;padding:12px;background:transparent;border:1px solid var(--border2);color:var(--muted2);font-size:11px;letter-spacing:1px;cursor:pointer;font-family:var(--fu);transition:all .2s;margin-bottom:4px"
          onmouseover="this.style.borderColor='var(--gold-dim)';this.style.color='var(--gold)'"
          onmouseout="this.style.borderColor='var(--border2)';this.style.color='var(--muted2)'">
          G &nbsp; ${t('google')}
        </button>
        <div class="auth-toggle" onclick="setState({authMode:'${isLogin?'register':'login'}',authError:''})">${isLogin?t('noAccount'):t('hasAccount')}</div>
      </div>
      <div class="auth-back" onclick="setState({screen:'landing'})">← ${t('back')}</div>
    </div>
  </div>`;
}

// ══ APP ══════════════════════════════════════════════════════════════
function pageApp(){
  const {tab,lang,user} = state;
  const navs = [
    {id:'compose',icon:'✦',label:t('compose')},
    {id:'history',icon:'◇',label:t('history')},
  ];
  const today = new Date().toLocaleDateString(
    lang==='pt'?'pt-BR':lang==='es'?'es-ES':lang==='fr'?'fr-FR':'en-US',
    {weekday:'long',day:'numeric',month:'long',year:'numeric'}
  );
  const titleMap = {
    compose:{pt:'Nova <em>Publicação</em>',en:'New <em>Post</em>',es:'Nueva <em>Publicación</em>',fr:'Nouvelle <em>Publication</em>'},
    history:{pt:'<em>Histórico</em> de Posts',en:'Post <em>History</em>',es:'<em>Historial</em>',fr:'<em>Historique</em>'},
  };
  const pageTitle = (titleMap[tab]&&titleMap[tab][lang]) || titleMap[tab]?.pt || '';
  return `
  <div class="shell">
    <aside class="sidebar">
      <div class="sb-logo">
        <div class="sb-mark"><div class="sb-dot"></div>PostAll<em style="font-style:italic;color:var(--gold)">Ton</em></div>
        <div class="sb-sub">PostAllTon</div>
      </div>
      <ul class="nav-list">
        ${navs.map(n=>`<li class="nav-item">
          <button class="nav-btn ${tab===n.id?'active':''}" onclick="setTab('${n.id}')">${n.icon} ${n.label}</button>
          ${tab===n.id?'<div class="nav-bar"></div>':''}
        </li>`).join('')}
      </ul>
      <div class="sb-foot">
        ${user?`<div style="font-size:10px;color:var(--muted2);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;letter-spacing:.3px;margin-bottom:6px">${user.name||user.email}</div>`:''}
        <div class="lang-foot">
          ${['pt','en','es','fr'].map(l=>`<button class="lf-btn ${lang===l?'active':''}" onclick="setLang('${l}')">${l.toUpperCase()}</button>`).join('')}
        </div>
        <button onclick="doLogout()" style="margin-top:8px;background:transparent;border:1px solid var(--border);color:var(--muted);font-size:9px;letter-spacing:1.5px;text-transform:uppercase;padding:6px;cursor:pointer;width:100%;font-family:var(--fu);transition:all .2s"
          onmouseover="this.style.borderColor='var(--red)';this.style.color='var(--red)'"
          onmouseout="this.style.borderColor='var(--border)';this.style.color='var(--muted)'">${t('logout')}</button>
      </div>
    </aside>
    <main class="main">
      <div class="topbar">
        <h1 class="page-title">${pageTitle}</h1>
        <div class="page-date">${today}<button class="home-btn" onclick="setState({screen:'landing'})">← Home</button></div>
      </div>
      <div class="content">${tab==='compose'?tabCompose():tabHistory()}</div>
    </main>
  </div>
  ${state.modal ? modalView() : ''}`;
}

// ══ COMPOSE ══════════════════════════════════════════════════════════
function tabCompose(){
  const sel = [...state.selected];
  const selNets = NETS.filter(n=>state.selected.has(n.id));
  const ma = state.mediaUrls.split(',').map(s=>s.trim()).filter(Boolean);
  const can = !!state.token && state.caption.trim() && sel.length>0;
  return `
  <div class="cg">
    <div>
      <div class="panel">
        <div class="sec-lbl" style="margin-bottom:14px">${t('platforms')}
          <div style="display:flex;gap:6px;margin-left:auto">
            <button class="btn-sm ${sel.length===NETS.length?'active':''}" onclick="selectAll()">${t('all')}</button>
            <button class="btn-sm" onclick="selectNone()">${t('none')}</button>
          </div>
        </div>
        <div class="net-grid">
          ${NETS.map(n=>`
          <div class="net-card ${state.selected.has(n.id)?'sel':''}" data-id="${n.id}" onclick="toggleNet('${n.id}')">
            <span class="net-chk">✦</span>
            <span style="display:inline-flex;width:24px;height:24px;color:${state.selected.has(n.id)?n.color:'var(--muted)'};">${SVG[n.id]||''}</span>
            <span class="net-name-s">${n.name}</span>
          </div>`).join('')}
        </div>
      </div>
      <div class="panel">
        <label class="field-lbl">${t('caption')}</label>
        <textarea class="textarea-f" id="captionInput" placeholder="${t('captionPh')}" oninput="onCaption(this.value)">${state.caption}</textarea>
        <div class="char-c" id="charCount">${state.caption.length} / 2200 ${t('chars')}</div>
      </div>
      <div class="panel">
        <label class="field-lbl">${t('media')}</label>
        <p style="font-size:11px;color:var(--muted);margin-bottom:9px;line-height:1.6">${t('mediaHint')}</p>
        <input class="input-f" value="${state.mediaUrls}" placeholder="${t('mediaPh')}" oninput="onMedia(this.value)"/>
      </div>
      <div class="panel">
        <label class="field-lbl">${t('schedule')}</label>
        <input class="input-f" type="datetime-local" value="${state.schedDate}" oninput="onSched(this.value)" style="color-scheme:dark"/>
        <div id="schedLabel">${state.schedDate?`<p style="font-size:11px;color:var(--amber);margin-top:8px">${t('scheduledFor')}: ${new Date(state.schedDate).toLocaleString()}</p>`:''}</div>
      </div>
      <button id="publishBtn" class="btn-primary" ${can?'':'disabled'} onclick="${can?'openModal()':''}">
        ◈ ${state.schedDate?t('scheduleIn'):t('publishNow')} ${sel.length} ${sel.length===1?t('platform'):t('platforms2')}
      </button>
    </div>
    <div class="cg-side">
      <div class="panel" style="margin-bottom:14px">
        <div class="sec-lbl">${t('selected')}</div>
        <div class="sel-count" id="selCount">${sel.length}</div>
        <div class="sel-lbl">${sel.length===1?t('platform'):t('platforms2')}</div>
        <div class="sel-div"></div>
        <div class="sel-list" id="selList">
          ${selNets.length===0?`<p style="font-size:11px;color:var(--muted)">${t('none')}</p>`:selNets.map(n=>`<div class="sel-item">${icon(n.id,n.color,14)}<span>${n.name}</span></div>`).join('')}
        </div>
      </div>
      <div class="panel">
        <div class="sec-lbl">${t('preview')}</div>
        <div id="previewText">${state.caption?`<p style="font-size:13px;color:var(--text);line-height:1.6;word-break:break-word">${state.caption.slice(0,160)}${state.caption.length>160?'…':''}</p>`:`<p style="font-size:12px;color:var(--muted);font-style:italic">${t('previewEmpty')}</p>`}</div>
        ${ma.length>0?`<div style="margin-top:10px;font-size:11px;color:var(--muted);border-top:1px solid var(--border);padding-top:8px">${ma.length} arquivo(s) de mídia</div>`:''}
      </div>
    </div>
  </div>`;
}

// ══ HISTORY ══════════════════════════════════════════════════════════
function tabHistory(){
  return `
  <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:18px">
    <p style="font-size:12px;color:var(--muted)">${state.token?t('histDesc'):t('noPostsYet')}</p>
  </div>
  ${state.posts.length===0?`
  <div class="panel" style="text-align:center;padding:50px 20px">
    <div style="font-size:36px;color:var(--border2);margin-bottom:12px;font-family:var(--fd)">◇</div>
    <p style="font-size:13px;color:var(--muted);margin-bottom:16px">${t('noPostsYet')}</p>
    <button class="btn-ghost" onclick="setTab('compose')">${t('createFirst')}</button>
  </div>`:`
  <div class="panel">
    ${state.posts.map(post=>`
    <div class="hist-item">
      <div>
        <p class="hist-cap">${post.caption.length>130?post.caption.slice(0,130)+'…':post.caption}</p>
        <div class="hist-tags">
          ${(post.networks||[]).slice(0,8).map(nid=>{
            const n=NETS.find(x=>x.id===nid);
            return `<span class="hist-tag" style="border-color:${n?n.color+'33':'var(--border2)'}">${icon(nid,n?.color||'var(--muted2)',11)}<span style="color:${n?.color||'var(--muted2)'}">${n?.name||nid}</span></span>`;
          }).join('')}
          ${(post.networks||[]).length>8?`<span class="hist-tag">+${post.networks.length-8}</span>`:''}
        </div>
      </div>
      <div class="hist-meta">
        <span class="badge ${post.status==='publicado'||post.status==='published'?'badge-pub':'badge-sch'}">${post.status}</span>
        <div class="hist-date">${post.date}</div>
      </div>
    </div>`).join('')}
  </div>`}`;
}

// ══ MODAL ════════════════════════════════════════════════════════════
function modalView(){
  const m = state.modal;
  const selNets = NETS.filter(n=>state.selected.has(n.id));
  return `
  <div class="modal-bg" onclick="if(event.target===this&&'${m}'!=='publishing')setState({modal:null})">
    <div class="modal">
      ${m==='confirm'?`
        <div class="modal-title">${t('confirmTitle')}</div>
        <div class="modal-sub">${t('confirmSub')} <strong style="color:var(--gold)">${selNets.length}</strong> ${t('confirmSub2')}</div>
        <div class="modal-plats">${selNets.map(n=>`<span class="plat-pill" style="border-color:${n.color}44;color:${n.color}">${icon(n.id,n.color,13)}<span>${n.name}</span></span>`).join('')}</div>
        <div class="modal-actions">
          <button class="btn-ghost" onclick="setState({modal:null})">${t('cancelBtn')}</button>
          <button class="btn-primary" onclick="publishPost()">${t('publishBtn')}</button>
        </div>`
      :m==='publishing'?`
        <div class="pub-state">
          <div class="spinner"></div>
          <div style="font-family:var(--fd);font-size:22px;margin-bottom:6px">${t('publishing')}</div>
          <div style="font-size:11px;color:var(--muted)">${t('publishingSub')} ${selNets.length} redes</div>
        </div>`
      :m==='done'?`
        <div class="modal-title" style="color:var(--gold)">${t('publishedTitle')}</div>
        <div class="modal-sub">${t('publishedSub')}</div>
        <div style="border-top:1px solid var(--border);margin-bottom:20px">
          ${selNets.map(n=>{const r=state.modalResults[n.id];return`
          <div class="result-row">${icon(n.id,n.color,16)}<span class="result-name">${n.name}</span>
            ${r?.ok?r.url?`<a href="${r.url}" target="_blank" style="color:var(--gold);font-size:10px">${t('seePost')}</a>`:`<span class="result-ok">✓ ${t('published')}</span>`:`<span class="result-err">✗ ${r?.msg||t('sent')}</span>`}
          </div>`;}).join('')}
        </div>
        <button class="btn-primary" onclick="setState({modal:null})">${t('closeBtn')}</button>`
      :`
        <div class="modal-title" style="color:var(--red)">${t('errorTitle')}</div>
        <div class="notice notice-err" style="margin-bottom:14px"><p><strong>${state.modalError}</strong></p></div>
        <p style="font-size:11px;color:var(--muted);margin-bottom:16px;line-height:1.6">${t('errorHint')}</p>
        <div class="modal-actions">
          <button class="btn-ghost" onclick="setState({modal:null})">${t('closeBtn')}</button>
          <button class="btn-primary" onclick="setState({modal:'confirm'})">${t('retryBtn')}</button>
        </div>`}
    </div>
  </div>`;
}

// ══ EVENT HANDLERS ═══════════════════════════════════════════════════
function bindEvents(){}
window.setState   = setState;
window.setLang    = l => setState({lang:l});
window.setTab     = t => setState({tab:t});
window.selectAll  = () => { state.selected=new Set(NETS.map(n=>n.id)); render(); };
window.selectNone = () => { state.selected=new Set(); render(); };
window.toggleNet  = id => {
  const s=new Set(state.selected);
  s.has(id)?s.delete(id):s.add(id);
  state.selected=s;
  document.querySelectorAll('.net-card').forEach(el=>{
    if(el.dataset.id===id){
      const sel=s.has(id);
      el.classList.toggle('sel',sel);
      const span=el.querySelector('span:nth-child(2)');
      if(span){const n=NETS.find(x=>x.id===id);if(n)span.style.color=sel?n.color:'var(--muted)';}
    }
  });
  const cnt=document.getElementById('selCount');
  if(cnt){cnt.textContent=s.size;}
  updatePublishBtn();
  const sl=document.getElementById('selList');
  if(sl){
    const selNets=NETS.filter(n=>s.has(n.id));
    sl.innerHTML=selNets.length===0?`<p style="font-size:11px;color:var(--muted)">${t('none')}</p>`:selNets.map(n=>`<div class="sel-item">${icon(n.id,n.color,14)}<span>${n.name}</span></div>`).join('');
  }
};
window.onCaption  = v => {
  state.caption=v;
  const cc=document.getElementById('charCount');
  if(cc) cc.textContent=v.length+' / 2200 '+t('chars');
  const pt=document.getElementById('previewText');
  if(pt) pt.innerHTML=v?`<p style="font-size:13px;color:var(--text);line-height:1.6;word-break:break-word">${v.slice(0,160)}${v.length>160?'…':''}</p>`:`<p style="font-size:12px;color:var(--muted);font-style:italic">${t('previewEmpty')}</p>`;
  updatePublishBtn();
};
window.onMedia    = v => { state.mediaUrls=v; };
window.onSched    = v => {
  state.schedDate=v;
  const sl=document.getElementById('schedLabel');
  if(sl) sl.innerHTML=v?`<p style="font-size:11px;color:var(--amber);margin-top:8px">${t('scheduledFor')}: ${new Date(v).toLocaleString()}</p>`:'';
  updatePublishBtn();
};
window.openModal      = () => setState({modal:'confirm'});
window.publishPost    = publishPost;
window.doAuth         = doAuth;
window.doLogout       = doLogout;
window.doGoogleLogin  = doGoogleLogin;

function updatePublishBtn(){
  const can=!!state.token&&state.caption.trim()&&state.selected.size>0;
  const btn=document.getElementById('publishBtn');
  if(btn){
    btn.disabled=!can;
    btn.textContent='◈ '+(state.schedDate?t('scheduleIn'):t('publishNow'))+' '+state.selected.size+' '+(state.selected.size===1?t('platform'):t('platforms2'));
  }
}

// ══ GOOGLE OAUTH CALLBACK ════════════════════════════════════════════
(function(){
  const params=new URLSearchParams(window.location.search);
  const tk=params.get('token');
  const us=params.get('user');
  if(tk){
    localStorage.setItem('pat_token',tk);
    if(us){ try{localStorage.setItem('pat_user',decodeURIComponent(us));}catch(e){} }
    state.token=tk;
    try{state.user=JSON.parse(decodeURIComponent(us||'null'));}catch(e){}
    state.screen='app';
    window.history.replaceState({},'','/');
  }
  const err=params.get('error');
  if(err){ state.screen='auth'; state.authError=decodeURIComponent(err); }
})();

// ══ INIT ═════════════════════════════════════════════════════════════
render();
</script>
</body>
</html>
