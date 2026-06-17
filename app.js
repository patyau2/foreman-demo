"use strict";
/* Foreman frontend — works in LIVE mode (talks to the backend) or MOCK mode (static demo). */
window.onerror = function (m, s, l, c) { var b = document.getElementById('errbar'); if (b) { b.style.display = 'block'; b.textContent = 'JS error: ' + m + ' (' + l + ':' + c + ')'; } };

/* ============================ helpers ============================ */
function esc(s){return String(s==null?'':s).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];});}
function val(id){var e=document.getElementById(id);return e?e.value:'';}
function chip(t,k){return '<span class="chip chip-'+(k||'mut')+'">'+esc(t)+'</span>';}
function dotchip(t,k){return '<span class="chip chip-'+(k||'mut')+'"><span class="dot"></span>'+esc(t)+'</span>';}
function toast(msg,err){var w=document.getElementById('toasts');var d=document.createElement('div');d.className='toast'+(err?' err':'');d.innerHTML=ic(err?'alert':'check',16)+'<span>'+esc(msg)+'</span>';w.appendChild(d);setTimeout(function(){d.style.transition='opacity .3s,transform .3s';d.style.opacity='0';d.style.transform='translateY(6px)';setTimeout(function(){d.remove();},320);},2300);}
function fmtDur(ms){if(!ms)return '';var s=Math.round(ms/1000);if(s<60)return s+'s';var m=Math.floor(s/60);return m+'m '+(s%60)+'s';}
function fmtCost(u){if(!u)return '';return '$'+u.toFixed(2);}

var ICONS={
 board:'<path d="M4 5h16v14H4z"/><path d="M9 5v14M15 5v14"/>',
 settings:'<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.6 1.6 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.6 1.6 0 0 0-2.7 1.1V21a2 2 0 0 1-4 0v-.1A1.6 1.6 0 0 0 7 19.4a1.6 1.6 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.6 1.6 0 0 0-1.1-2.7H1a2 2 0 0 1 0-4h.1A1.6 1.6 0 0 0 2.6 7a1.6 1.6 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1A1.6 1.6 0 0 0 7 2.6 1.6 1.6 0 0 0 8 1.1V1a2 2 0 0 1 4 0v.1A1.6 1.6 0 0 0 15 2.6a1.6 1.6 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.6 1.6 0 0 0 1.1 2.7H21a2 2 0 0 1 0 4h-.1a1.6 1.6 0 0 0-1.5 1z"/>',
 plus:'<path d="M12 5v14M5 12h14"/>', check:'<path d="M20 6L9 17l-5-5"/>',
 chevr:'<path d="M9 6l6 6-6 6"/>', chevl:'<path d="M15 6l-6 6 6 6"/>',
 lock:'<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>',
 shield:'<path d="M12 2l8 3v6c0 5-3.5 8.5-8 10-4.5-1.5-8-5-8-10V5z"/><path d="M9 12l2 2 4-4"/>',
 git:'<circle cx="6" cy="6" r="2.4"/><circle cx="6" cy="18" r="2.4"/><circle cx="17" cy="9" r="2.4"/><path d="M17 11.4V12a4 4 0 0 1-4 4H6M6 8.4v7.2"/>',
 slack:'<rect x="10" y="3" width="4" height="11" rx="2"/><rect x="3" y="10" width="11" height="4" rx="2"/><path d="M14 17a2 2 0 1 0 2 2v-2zM7 14H5a2 2 0 1 0 2 2z"/>',
 key:'<circle cx="8" cy="12" r="4"/><path d="M12 12h9M18 12v3M21 12v4"/>',
 upload:'<path d="M12 16V4M7 9l5-5 5 5"/><path d="M4 17v2a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-2"/>',
 repo:'<path d="M4 4h13a2 2 0 0 1 2 2v14H6a2 2 0 0 1-2-2z"/><path d="M19 16H6a2 2 0 0 0-2 2"/>',
 refresh:'<path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5"/>',
 play:'<path d="M7 4l13 8-13 8z"/>', clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
 user:'<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
 spark:'<path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z"/>',
 flow:'<rect x="3" y="4" width="6" height="6" rx="1.5"/><rect x="15" y="14" width="6" height="6" rx="1.5"/><path d="M9 7h4a3 3 0 0 1 3 3v4"/>',
 alert:'<path d="M12 9v4M12 17h.01"/><path d="M10.3 4l-8 14a2 2 0 0 0 1.7 3h16a2 2 0 0 0 1.7-3l-8-14a2 2 0 0 0-3.4 0z"/>',
 trash:'<path d="M4 7h16M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2M6 7l1 13a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-13"/>',
 x:'<path d="M6 6l12 12M18 6L6 18"/>', reset:'<path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5"/>'
};
function ic(n,sz,sw){sz=sz||18;sw=sw||1.9;return '<svg width="'+sz+'" height="'+sz+'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="'+sw+'" stroke-linecap="round" stroke-linejoin="round">'+(ICONS[n]||'')+'</svg>';}

/* ---------- tiny markdown renderer (escaped + safe) ---------- */
function md(src){
  var lines=String(src||'').replace(/\r/g,'').split('\n');
  var html=[], i=0;
  function inline(s){
    return s
      .replace(/`([^`]+)`/g,function(_,a){return '<code>'+a+'</code>';})
      .replace(/\*\*([^*]+)\*\*/g,'<strong>$1</strong>')
      .replace(/\[([^\]]+)\]\((https?:[^)\s]+)\)/g,'<a href="$2" target="_blank" rel="noopener">$1</a>');
  }
  while(i<lines.length){
    var ln=lines[i];
    if(/^```/.test(ln.trim())){ var code=[]; i++; while(i<lines.length && !/^```/.test(lines[i].trim())){ code.push(lines[i]); i++; } i++; html.push('<pre><code>'+code.join('\n')+'</code></pre>'); continue; }
    if(/^#{1,3}\s/.test(ln)){ var lvl=ln.match(/^#+/)[0].length; html.push('<h'+lvl+'>'+inline(ln.replace(/^#+\s/,''))+'</h'+lvl+'>'); i++; continue; }
    if(/^(\-\-\-|\*\*\*)\s*$/.test(ln.trim())){ html.push('<hr/>'); i++; continue; }
    if(/^>\s?/.test(ln)){ var q=[]; while(i<lines.length && /^>\s?/.test(lines[i])){ q.push(inline(lines[i].replace(/^>\s?/,''))); i++; } html.push('<blockquote>'+q.join('<br/>')+'</blockquote>'); continue; }
    // table
    if(/\|/.test(ln) && i+1<lines.length && /^\s*\|?[\s:|-]+\|?\s*$/.test(lines[i+1]) && /-/.test(lines[i+1])){
      var head=ln.split('|').filter(function(c){return c.trim()!=='';}).map(function(c){return '<th>'+inline(c.trim())+'</th>';}).join('');
      i+=2; var rows=[];
      while(i<lines.length && /\|/.test(lines[i])){ var cells=lines[i].split('|').filter(function(c){return c.trim()!=='';}).map(function(c){return '<td>'+inline(c.trim())+'</td>';}).join(''); rows.push('<tr>'+cells+'</tr>'); i++; }
      html.push('<table><thead><tr>'+head+'</tr></thead><tbody>'+rows.join('')+'</tbody></table>'); continue;
    }
    // lists
    if(/^\s*([-*]|\d+\.)\s/.test(ln)){
      var ordered=/^\s*\d+\.\s/.test(ln); var items=[];
      while(i<lines.length && /^\s*([-*]|\d+\.)\s/.test(lines[i])){
        var item=lines[i].replace(/^\s*([-*]|\d+\.)\s/,'');
        var box='';
        var cb=item.match(/^\[( |x|X)\]\s+/);
        if(cb){ var done=cb[1].toLowerCase()==='x'; item=item.replace(/^\[( |x|X)\]\s+/,''); box='<span style="color:'+(done?'var(--grn)':'var(--mut)')+';margin-right:6px">'+ic(done?'check':'alert',13)+'</span>'; }
        items.push('<li>'+box+inline(item)+'</li>'); i++;
      }
      html.push((ordered?'<ol>':'<ul>')+items.join('')+(ordered?'</ol>':'</ul>')); continue;
    }
    if(ln.trim()===''){ i++; continue; }
    // paragraph (gather until blank)
    var para=[];
    while(i<lines.length && lines[i].trim()!=='' && !/^(#{1,3}\s|```|>\s?|\s*([-*]|\d+\.)\s|(\-\-\-|\*\*\*)\s*$)/.test(lines[i]) && !(/\|/.test(lines[i]) && i+1<lines.length && /-/.test(lines[i+1]||'') && /^\s*\|?[\s:|-]+\|?\s*$/.test(lines[i+1]||''))){ para.push(inline(lines[i])); i++; }
    html.push('<p>'+para.join('<br/>')+'</p>');
  }
  return html.join('');
}

/* ============================ state + mode ============================ */
var MODE='mock', S=null, view='setup', selected=null, setupStep=0, ctxPoll=null, runPoll=null;

function clone(o){return JSON.parse(JSON.stringify(o));}
function getT(id){for(var i=0;i<S.tickets.length;i++)if(S.tickets[i].id===id)return S.tickets[i];return null;}
function replaceT(t){for(var i=0;i<S.tickets.length;i++)if(S.tickets[i].id===t.id){S.tickets[i]=t;return;}S.tickets.unshift(t);}

async function jget(p){var r=await fetch(p,{cache:'no-store'});return r.json();}
async function jpost(p,b){var r=await fetch(p,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(b||{})});var j=await r.json();if(!j.ok)throw new Error(j.error||'request failed');return j;}
async function jdel(p){var r=await fetch(p,{method:'DELETE'});return r.json();}
async function pullState(){var j=await jget('/api/state');if(j.ok)S=j.state;return S;}

async function boot(){
  try{var h=await jget('/api/health');MODE=(h&&h.ok)?'live':'mock';}catch(e){MODE='mock';}
  if(MODE==='live'){ await pullState(); }
  else { S=clone(window.MOCK.state); }
  setupStep=S.setupStep||0;
  view=S.setupComplete?'board':'setup';
  render();
  if(MODE==='live'&&S.context&&S.context.deriving)startContextPolling();
}

/* ============================ async pollers ============================ */
function stopContextPolling(){if(ctxPoll){clearInterval(ctxPoll);ctxPoll=null;}}
function startContextPolling(){
  stopContextPolling();
  ctxPoll=setInterval(async function(){
    if(MODE!=='live'){stopContextPolling();return;}
    try{await pullState();}catch(e){}
    if(!S.setupComplete&&view==='setup')render();else if(view==='settings')render();
    if(!S.context||!S.context.deriving)stopContextPolling();
  },2500);
}
function stopRunPolling(){if(runPoll){clearInterval(runPoll);runPoll=null;}}
function startRunPolling(id){
  stopRunPolling();
  runPoll=setInterval(async function(){
    if(MODE!=='live'){stopRunPolling();return;}
    try{var j=await jget('/api/tickets/'+id);if(j.ok){replaceT(j.ticket);if(view==='ticket'&&selected===id){render();scrollRun();}var rs=j.ticket.run;if(!rs||['awaiting_gate','merged','error','changes_requested'].indexOf(rs.status)>-1)stopRunPolling();}}catch(e){}
  },2000);
}
function scrollRun(){var c=document.querySelector('.content');if(c)requestAnimationFrame(function(){c.scrollTop=c.scrollHeight;});}

/* ============================ render shell ============================ */
function render(){
  var app=document.getElementById('app');
  if(!S.setupComplete){app.innerHTML=viewSetup();return;}
  var open=S.tickets.filter(function(t){return t.status!=='done';}).length;
  app.innerHTML=
   '<aside class="sidebar">'
    +'<div class="brand"><span class="brandmark">'+ic('check',17,2.4)+'</span><div><div class="brandname">Foreman</div><div class="brandsub">AI delivery, governed</div></div></div>'
    +'<div class="ws"><div class="ws-ava">'+esc(initials(S.workspace.name||'WS'))+'</div><div style="min-width:0"><div class="ws-name">'+esc(S.workspace.name||'Workspace')+'</div><div class="ws-meta">'+esc(S.project?S.project.repo:'no repo')+'</div></div></div>'
    +'<div class="navlbl">Workspace</div>'
    +'<nav class="nav">'+navitem('board','board','Board','<span class="ct">'+open+'</span>')+navitem('settings','settings','Setup &amp; agents','')+'</nav>'
    +'<div class="side-foot">'
      +'<div class="enginechip"><span class="pulse"></span>Engine: Claude Code</div>'
      +'<div class="row" style="justify-content:space-between;padding:0 6px"><span class="modepill '+(MODE==='live'?'live':'demo')+'">'+(MODE==='live'?'Live':'Demo')+'</span>'
      +'<a class="navitem" style="padding:5px 8px" data-act="reset">'+ic('reset',15)+'<span style="font-size:12.5px">Reset</span></a></div>'
    +'</div>'
   +'</aside>'
   +'<main class="main">'+topbar()+'<div class="content"><div class="wrap">'+pageBody()+'</div></div></main>';
}
function initials(n){return n.split(/\s+/).slice(0,2).map(function(w){return w[0];}).join('').toUpperCase();}
function navitem(v,icn,label,extra){return '<a class="navitem '+(view===v?'on':'')+'" data-act="nav" data-view="'+v+'">'+ic(icn,17)+'<span>'+label+'</span>'+extra+'</a>';}
function topbar(){
  var left='<span class="page-title">Foreman</span>',right='';
  if(view==='board'){left='<span class="page-title">Board</span>';right='<button class="btn btn-primary" data-act="newticket">'+ic('plus',16)+'New ticket</button>';}
  else if(view==='settings')left='<span class="page-title">Setup &amp; agents</span>';
  else if(view==='ticket'){var t=getT(selected);left='<div class="row"><button class="btn btn-ghost btn-sm" data-act="nav" data-view="board">'+ic('chevl',15)+'Board</button><span class="page-title">'+(t?esc(t.ref):'Ticket')+'</span></div>';}
  else if(view==='newticket')left='<div class="row"><button class="btn btn-ghost btn-sm" data-act="nav" data-view="board">'+ic('chevl',15)+'Board</button><span class="page-title">New ticket</span></div>';
  return '<div class="topbar"><div class="row">'+left+'</div><div class="row">'+right+'</div></div>';
}
function pageBody(){if(view==='board')return viewBoard();if(view==='settings')return viewSettings();if(view==='ticket')return viewTicket();if(view==='newticket')return viewNewTicket();return '';}

/* ============================ SETUP WIZARD ============================ */
var STEPS=['Workspace','GitHub','Repository','Project context','Slack','Secrets','Crew & gates','Done'];
function viewSetup(){
  var n=setupStep,total=STEPS.length,bars='';
  for(var i=0;i<total;i++)bars+='<div class="s '+(i<n?'done':i===n?'cur':'')+'"></div>';
  return '<div class="setup"><div class="setup-top"><div class="brand" style="padding:0"><span class="brandmark">'+ic('check',17,2.4)+'</span><div><div class="brandname">Foreman</div><div class="brandsub">AI delivery, governed</div></div></div>'
    +'<div class="row sub">'+ic('clock',15)+'<span>~10 min, one time</span></div></div>'
    +'<div class="setup-card"><div class="setup-head"><div class="steps">'+bars+'</div><div class="stepno">Step '+(n+1)+' of '+total+' · '+esc(STEPS[n])+'</div>'+setupHead(n)+'</div>'
    +'<div class="setup-body">'+setupBody(n)+'</div>'
    +'<div class="setup-foot">'+(n>0?'<button class="btn btn-ghost" data-act="sback">'+ic('chevl',15)+'Back</button>':'<span></span>')+setupNext(n,total)+'</div>'
    +'</div></div>';
}
function setupHead(n){
  var H=[['Create your workspace','One workspace per agency or team. The Claude Code engine is already connected — no API key to set up.'],
    ['Connect GitHub','Foreman opens branches and PRs here. Least-privilege, per repo.'],
    ['Choose a repository','Pick the project Foreman will work on. We clone it read-only to plan against.'],
    ['Project context','The AI reads your repo and figures this out — you don’t fill it in.'],
    ['Connect Slack','Where Foreman posts status and review requests.'],
    ['Secrets','Drop in your .env — stored write-only and encrypted. Add or remove any key.'],
    ['Your crew & gates','Five agents run every ticket. You decide the gates.'],
    ['You’re set up','Here’s what Foreman does on every ticket.']];
  return '<h1 style="margin-top:10px">'+esc(H[n][0])+'</h1><div class="sub" style="margin-top:4px">'+esc(H[n][1])+'</div>';
}
function setupNext(n,total){
  if(n===total-1)return '<button class="btn btn-primary btn-lg" data-act="sfinish">Open my board'+ic('chevr',15)+'</button>';
  var block=(n===1&&!S.github.connected)||(n===2&&!S.project)||(n===4&&!S.slack.connected);
  var lbl=(n===1&&!S.github.connected)?'Connect to continue':(n===2&&!S.project)?'Pick a repo to continue':(n===4&&!S.slack.connected)?'Connect to continue':'Continue';
  return '<button class="btn btn-primary" data-act="snext" '+(block?'disabled':'')+'>'+esc(lbl)+ic('chevr',15)+'</button>';
}
function secure(t){return '<div class="securenote"><span>'+ic('shield',15)+'</span><div>'+t+'</div></div>';}
function opt(arr,sel){return arr.map(function(o){return '<option '+(o===sel?'selected':'')+'>'+esc(o)+'</option>';}).join('');}

function setupBody(n){
  if(n===0)return '<div class="field"><label class="label">Workspace name</label><input class="input" id="wsName" value="'+esc(S.workspace.name||'')+'" placeholder="Acme Digital"></div>'
    +'<div class="field"><label class="label">Team type</label><select class="select" id="wsType">'+opt(['Agency','Internal IT / engineering','Studio / freelance'],S.workspace.type)+'</select></div>'
    +'<div class="connect ok" style="margin-top:4px"><div class="logo" style="background:#fff">'+ic('spark',22)+'</div><div style="flex:1"><div style="font-weight:600">Claude Code engine</div><div class="sub">Connected — the pipeline runs on your existing Claude, no API key needed.</div></div>'+dotchip('Ready','grn')+'</div>';
  if(n===1){
    if(S.github.connected)return '<div class="connect ok"><div class="logo" style="background:#fff">'+ic('git',22)+'</div><div style="flex:1"><div style="font-weight:600">GitHub</div><div class="sub">Connected as '+esc(S.github.account)+(S.github.orgs&&S.github.orgs.length?' · orgs: '+esc(S.github.orgs.join(', ')):'')+'</div></div>'+dotchip('Connected','grn')+'</div>'
      +'<div class="scopes">'+chip('Branches & PRs','out')+chip('Per-repo access','out')+chip('Short-lived tokens','out')+'</div>'
      +secure('Foreman uses the GitHub App / your authorized CLI — scoped to the repos you pick, never org-wide writes.');
    return '<div class="connect"><div class="logo">'+ic('git',22)+'</div><div style="flex:1"><div style="font-weight:600">GitHub</div><div class="sub">Authorize Foreman to open branches and PRs.</div></div></div>'
      +'<div style="margin-top:14px"><button class="btn btn-primary" data-act="gh-connect" id="ghBtn">'+ic('git',16)+'Connect GitHub</button></div>'
      +secure('Least-privilege, per-repo. We never request org-wide write.');
  }
  if(n===2){
    var sel=S.project?S.project.repo:'';
    var list='<div class="derive-row"><span class="spinner"></span><span class="sub">Loading your repositories…</span></div>';
    if(window.__repos){ list=window.__repos.length? '<div class="repolist">'+window.__repos.map(function(r){return '<button class="repo '+(r.full===sel?'sel':'')+'" data-act="pick-repo" data-repo="'+esc(r.full)+'"><div style="min-width:0"><div class="nm">'+esc(r.full)+'</div><div class="meta"><span class="langdot"></span>'+esc(r.language||'—')+'<span>·</span>'+esc(r.visibility)+(r.pushedAt?'<span>·</span>updated '+esc(r.pushedAt.slice(0,10)):'')+'</div></div><span class="pick">'+ic('check',16)+'</span></button>';}).join('')+'</div>' : '<div class="sub">No repositories found for this account.</div>'; }
    var note=S.project?('<div class="callout ok" style="margin-top:14px">'+ic('check',16)+'<div>Connected <b>'+esc(S.project.repo)+'</b> — cloning and reading the codebase now.</div></div>'):'';
    return list+note+(window.__repos?secure('Pick the repository Foreman should work on. We clone a shallow read-only copy to plan against.'):'');
  }
  if(n===3){
    var c=S.context||{};
    if(c.deriving||(!c.ready&&S.project))return '<div class="derive"><div class="derive-row"><span class="spinner lg"></span><div><div style="font-weight:600">Reading your codebase…</div><div class="sub">Claude is inspecting '+esc(S.project?S.project.repo:'the repo')+' — stack, test command, and sensitive paths. ~1–2 min.</div></div></div>'
      +'<div style="margin-top:12px"><div class="skel" style="height:13px;width:80%;margin-bottom:8px"></div><div class="skel" style="height:13px;width:65%;margin-bottom:8px"></div><div class="skel" style="height:13px;width:72%"></div></div></div>';
    if(!S.project)return '<div class="sub">Pick a repository first.</div>';
    return '<div class="callout ok" style="margin-top:0">'+ic('check',16)+'<div>Derived from <b>'+esc(S.project.repo)+'</b>. Edit anything below — but you don’t have to.</div></div>'
      +'<div class="card" style="padding:4px 16px;margin-top:14px">'+ctxRow('Summary',c.summary)+ctxRow('Stack',c.stack)+ctxRow('Test command',c.testCmd,true)+ctxRow('Sensitive paths',c.sensitive,true)+ctxRow('Conventions',c.conventions)+'</div>';
  }
  if(n===4){
    if(S.slack.connected)return '<div class="connect ok"><div class="logo" style="background:#fff">'+ic('slack',22)+'</div><div style="flex:1"><div style="font-weight:600">Slack</div><div class="sub">Connected</div></div>'+dotchip('Connected','grn')+'</div>'
      +'<div class="field" style="margin-top:16px"><label class="label">Post updates to</label><input class="input" id="slackCh" value="'+esc(S.slack.channel||'#eng')+'"></div>';
    return '<div class="connect"><div class="logo">'+ic('slack',22)+'</div><div style="flex:1"><div style="font-weight:600">Slack</div><div class="sub">Authorize Foreman to post updates.</div></div></div>'
      +'<div class="field" style="margin-top:14px"><label class="label">Channel</label><input class="input" id="slackCh" value="#eng" placeholder="#eng"></div>'
      +'<button class="btn btn-primary" data-act="slack-connect">'+ic('slack',16)+'Connect Slack</button>'
      +secure('Scope: post to one channel. No history, no files, no admin.');
  }
  if(n===5)return secretsUI();
  if(n===6)return crewUI();
  if(n===7)return setupSummary();
  return '';
}
function ctxRow(k,v,mono){return '<div class="ctxfield"><div class="ctxk">'+esc(k)+'</div><div class="tmpl-v'+(mono?' mono':'')+'" style="'+(mono?'font-size:12.5px':'')+'">'+esc(v||'—')+'</div></div>';}

function secretsUI(){
  var rows=(S.secrets||[]).map(function(s){return '<div class="secret-row"><span class="k">'+esc(s.name)+'</span><span class="v">••••••••</span><span style="margin-left:auto">'+dotchip('Saved','grn')+'</span><button class="iconbtn" data-act="del-secret" data-k="'+esc(s.name)+'" title="Remove">'+ic('trash',15)+'</button></div>';}).join('');
  return '<div class="dropzone" id="dropzone" data-act="pick-file"><div class="ic">'+ic('upload',20)+'</div><div style="font-weight:570">Drop a <span class="mono">.env</span> file here, or click to choose</div><div class="sub" style="margin-top:3px">Parsed into keys below. Values are encrypted and never shown again.</div></div>'
    +'<input type="file" id="envFile" accept=".env,text/plain,*/*" style="display:none">'
    +'<div style="margin-top:14px">'+(rows||'<div class="sub" style="padding:4px 0">No secrets yet. Upload a .env or add one below.</div>')+'</div>'
    +'<div class="row" style="gap:8px;margin-top:6px"><input class="input mono" id="newSecK" placeholder="NEW_KEY" style="flex:1"><input class="input mono" id="newSecV" type="password" placeholder="value" style="flex:1"><button class="btn btn-ghost" data-act="add-secret">'+ic('plus',15)+'Add</button></div>'
    +secure('AES-256-GCM at rest, write-only (can’t be read back), injected into the run at runtime only — never into a prompt, diff, or log.');
}
function crewUI(){
  return (S.agents||[]).map(function(a,i){return '<div class="crew-row"><span class="crew-mono" style="background:'+a.color+'">'+a.mono+'</span><div style="min-width:0;flex:1"><div style="font-weight:570">'+esc(a.name)+'</div><div class="hint" style="margin-top:1px">'+esc(a.desc)+'</div></div><button class="lock" data-act="view-prompt" data-i="'+i+'">'+ic('lock',13)+'Framework prompt</button><div class="toggle '+(a.enabled?'on':'')+'" data-act="toggle-agent" data-i="'+i+'" '+(a.locked?'style="pointer-events:none;opacity:.6"':'')+'></div></div>';}).join('')
    +'<div class="divider"></div>'
    +gateToggle('Require human approval before merge','Nothing merges without a person clicking approve.',S.gate.requireHumanMerge,'toggle-merge')
    +gateToggle('Write mode (open real PRs)','Off = read-only: plans and reviews without touching your repo. On = the crew can push a branch and open a draft PR after you approve.',S.gate.writeEnabled,'toggle-write')
    +'<div class="field" style="margin-top:12px"><label class="label">Gate strictness</label><select class="select" id="strict">'+opt(['Lenient','Balanced','Strict'],S.gate.strictness)+'</select></div>';
}
function gateToggle(t,d,on,act){return '<div class="row between" style="margin-bottom:12px"><div style="padding-right:12px"><div style="font-weight:570">'+esc(t)+'</div><div class="hint" style="margin-top:2px">'+esc(d)+'</div></div><div class="toggle '+(on?'on':'')+'" data-act="'+act+'"></div></div>';}
function setupSummary(){
  return '<div class="hero-cta" style="padding:6px 0 16px"><div class="ic">'+ic('flow',26)+'</div><h2>Every ticket runs the same governed pipeline</h2><div class="sub" style="max-width:440px;margin:6px auto 0">File a ticket → the crew plans, builds, tests, reviews and security-checks it against '+esc(S.project?S.project.repo:'your repo')+' → you get a PR to approve. Nothing merges without you.</div></div>'
    +'<div class="card" style="padding:6px 4px">'+mini('P','#4f46e5','Planner','Buildable? Definition of done')+mini('I','#2563eb','Implementer','Code + tests on a branch')+mini('T','#0a8f5b','Test gate','Hard pass / fail')+mini('R','#b45309','Reviewer','Adversarial diff review')+mini('S','#7c3aed','Security reviewer','Threat-models sensitive paths')+mini('↗','#0b0c0e','Pull request','Your approval gate')+'</div>';
}
function mini(m,c,n,d){return '<div class="row" style="padding:9px 14px;gap:11px"><span class="crew-mono" style="background:'+c+'">'+m+'</span><div style="font-weight:560">'+n+'</div><div class="sub" style="margin-left:auto">'+d+'</div></div>';}

/* ============================ BOARD ============================ */
var COLS=[{k:'inbox',l:'Backlog',c:'#9aa0a6'},{k:'planning',l:'Planning',c:'#4f46e5'},{k:'in_progress',l:'In progress',c:'#2563eb'},{k:'test_gate',l:'Test gate',c:'#0a8f5b'},{k:'review',l:'Human review',c:'#b45309'},{k:'done',l:'Done',c:'#0a8f5b'}];
var STATUS={inbox:{l:'Backlog',k:'mut'},planning:{l:'Planning',k:'brand'},in_progress:{l:'In progress',k:'blu'},test_gate:{l:'Test gate',k:'grn'},review:{l:'Human review',k:'amb'},done:{l:'Done',k:'grn'}};
function prChip(p){return p==='high'?chip('High','red'):p==='medium'?chip('Medium','amb'):chip('Low','mut');}
function viewBoard(){
  return '<div class="board">'+COLS.map(function(col){
    var cards=S.tickets.filter(function(t){return t.status===col.k;});
    return '<div class="col"><div class="col-head"><span class="pip" style="background:'+col.c+'"></span><span class="nm">'+col.l+'</span><span class="ct">'+cards.length+'</span></div>'+(cards.length?cards.map(boardCard).join(''):'<div class="col-empty">—</div>')+'</div>';
  }).join('')+'</div>';
}
function boardCard(t){
  var tags='';
  if(t.runnable&&t.status==='inbox')tags+=dotchip('Ready to run','brand');
  if(t.status==='review')tags+=chip('PR','amb');
  if(t.run&&t.run.status==='running')tags+=dotchip('Running','blu');
  return '<div class="tcard" data-act="open" data-id="'+t.id+'"><div class="tt">'+esc(t.title)+'</div><div class="meta">'+prChip(t.priority)+tags+'<span class="idtag">'+esc(t.ref)+'</span></div></div>';
}

/* ============================ NEW TICKET ============================ */
function viewNewTicket(){
  return '<div style="max-width:720px;margin:0 auto"><div class="panel"><div class="eyebrow" style="margin-bottom:4px">New ticket</div><h1 style="margin-bottom:2px">Describe the work</h1><div class="sub" style="margin-bottom:18px">The crew reads these like a senior engineer reads a good ticket.</div>'
    +'<div class="field"><label class="label">Title</label><input class="input" id="f_title" placeholder="Short, specific outcome"></div>'
    +'<div class="field"><label class="label">Priority</label><select class="select" id="f_priority">'+opt(['high','medium','low'],'medium')+'</select></div>'
    +'<div class="field"><label class="label">Problem</label><textarea class="textarea" id="f_problem" placeholder="What needs to change and why."></textarea></div>'
    +'<div class="inline-2"><div class="field"><label class="label">Problem located</label><textarea class="textarea" id="f_located" placeholder="Where in the system."></textarea></div><div class="field"><label class="label">Attempted action</label><textarea class="textarea" id="f_attempted" placeholder="Anything already tried."></textarea></div></div>'
    +'<div class="field"><label class="label">Success criteria</label><textarea class="textarea" id="f_success" placeholder="How we know it’s done — becomes the definition of done."></textarea></div>'
    +'<div class="field"><label class="label">Additional info</label><textarea class="textarea" id="f_info" placeholder="Constraints, out-of-scope notes."></textarea></div>'
    +'<div class="row" style="justify-content:flex-end;gap:9px;margin-top:6px"><button class="btn btn-ghost" data-act="nav" data-view="board">Cancel</button><button class="btn btn-primary" data-act="create-ticket">'+ic('plus',16)+'Create ticket</button></div>'
    +'</div></div>';
}

/* ============================ TICKET + RUN ============================ */
function viewTicket(){
  var t=getT(selected);if(!t)return '<div class="sub">Ticket not found.</div>';
  var st=STATUS[t.status]||STATUS.inbox;
  var fields=(t.problem?tf('Problem',t.problem):'')+(t.located?tf('Problem located',t.located):'')+(t.attempted?tf('Attempted action',t.attempted):'')+(t.success?tf('Success criteria',t.success):'')+(t.info?tf('Additional info',t.info):'');
  var main='<div class="card" style="padding:6px 18px 14px"><div class="row" style="padding:14px 0 4px"><span class="eyebrow" style="color:var(--mut)">Ticket</span></div>'+fields+'</div>';
  var area='';
  if(t.run)area=renderRun(t);
  else if(t.status==='done'&&t.done)area=doneSummary(t);
  else if(t.status==='review'&&t.pr)area=reviewStatic(t);
  else if(t.status==='in_progress')area=infoPanel('In progress',t.stage||'The crew is working on this ticket.','blu');
  else if(t.runnable)area=runCTA(t);
  else area=infoPanel('Queued','This ticket is in the backlog.','mut');
  var side='<div class="card side-card"><div class="sc-h">Details</div>'+kv('Status',dotchip(st.l,st.k))+kv('Priority',prChip(t.priority))+kv('Reference','<span class="mono">'+esc(t.ref)+'</span>')+kv('Repo','<span class="mono" style="font-size:11.5px">'+esc(S.project?S.project.repo:'—')+'</span>')+'</div>'
    +'<div class="card side-card"><div class="sc-h">Confinement</div><div style="padding:12px 16px;font-size:12.5px;color:var(--ink2);line-height:1.7">'+ic('shield',14)+' Repo + tests only.<br>'+ic('shield',14)+' '+(S.gate.writeEnabled?'Write mode: branch + PR on approve.':'Read-only this run.')+'<br>'+ic('shield',14)+' Secrets runtime-only, never logged.</div></div>';
  return '<div style="margin-bottom:16px"><div class="row" style="gap:10px;flex-wrap:wrap"><h1>'+esc(t.title)+'</h1>'+dotchip(st.l,st.k)+prChip(t.priority)+'</div></div>'
    +'<div class="detail-grid"><div>'+main+'<div style="height:18px"></div>'+area+'</div><div>'+side+'</div></div>';
}
function tf(k,v){return '<div class="tmpl-field"><div class="tmpl-k">'+esc(k)+'</div><div class="tmpl-v">'+esc(v)+'</div></div>';}
function kv(k,v){return '<div class="kv"><span class="kk">'+esc(k)+'</span><span class="vv">'+v+'</span></div>';}
function infoPanel(title,body,k){return '<div class="panel"><div class="row" style="margin-bottom:5px">'+dotchip(title,k)+'</div><div class="sub">'+esc(body)+'</div></div>';}
function runCTA(t){
  return '<div class="panel hero-cta"><div class="ic">'+ic('play',24)+'</div><h2>Run the delivery pipeline</h2><div class="sub" style="max-width:430px;margin:6px auto 18px">Five agents plan, build, test, review and security-check this ticket against '+esc(S.project?S.project.repo:'your repo')+', then open a PR for your approval.</div>'
    +'<button class="btn btn-primary btn-lg" data-act="run" data-id="'+t.id+'">'+ic('spark',17)+'Run pipeline</button>'
    +'<div class="sub" style="margin-top:12px;font-size:12px">'+(MODE==='live'?'Real run — each stage is a live Claude pass over your code (a few minutes).':'Nothing merges without your approval.')+'</div></div>';
}
function renderRun(t){
  var r=t.run,stages=r.stages;
  var statusChip=r.status==='running'?dotchip('Running','brand'):r.status==='merged'?dotchip('Merged','grn'):r.status==='error'?dotchip('Error','red'):dotchip('Awaiting your approval','amb');
  var head='<div class="runhead"><div class="row" style="gap:9px"><h2>Pipeline run</h2>'+statusChip+'</div>'+(r.totalCost?'<span class="sub mono" style="font-size:12px">'+ic('clock',13)+' '+fmtCost(r.totalCost)+'</span>':'')+'</div>';
  var tl='<div class="timeline">';
  for(var i=0;i<stages.length;i++){var s=stages[i];if(s.status==='pending')continue;tl+=renderStage(s,r.status==='running'&&s.status==='running');}
  if(r.status==='running'){var nx=null;for(var j=0;j<stages.length;j++){if(stages[j].status==='pending'){nx=stages[j];break;}}if(nx&&!stages.some(function(x){return x.status==='running';}))tl+=pendingStage(nx);}
  tl+='</div>';
  var gate='';
  if(r.status==='awaiting_gate')gate=renderGate(t);
  else if(r.status==='merged')gate=mergedSummary(t);
  else if(r.status==='error')gate='<div class="callout warn" style="margin-top:14px">'+ic('alert',16)+'<div>The run hit an error: '+esc(r.error||'see the stage above')+'. You can re-run it.</div></div>';
  return head+tl+gate;
}
function renderStage(s,running){
  var verd=s.verdict?'<span class="chip chip-'+verdictKind(s.verdict)+'">'+esc(s.verdict)+'</span>':'';
  var met=(s.durationMs||s.costUsd)?'<span class="met">'+[fmtDur(s.durationMs),fmtCost(s.costUsd)].filter(Boolean).join(' · ')+'</span>':'';
  var body=running?'<div class="tl-running"><span class="spinner"></span>Working… <span class="dots"><i></i><i></i><i></i></span></div>':'<div class="md">'+md(s.body)+'</div>';
  return '<div class="tl-stage"><span class="tl-node '+(running?'running':'')+'" style="background:'+s.color+'">'+s.mono+'</span><div class="tl-card"><div class="tl-card-h"><span class="nm">'+esc(s.name)+'</span>'+verd+met+'</div><div class="tl-body">'+body+'</div></div></div>';
}
function pendingStage(s){return '<div class="tl-stage"><span class="tl-node pending">'+s.mono+'</span><div class="tl-running" style="padding-top:5px">Next: '+esc(s.name)+' <span class="dots"><i></i><i></i><i></i></span></div></div>';}
function verdictKind(v){v=String(v).toUpperCase();if(/BUILDABLE|READY|PASS|APPROVE$|^APPROVE /.test(v))return 'grn';if(/NOTE|AT_RISK|REQUEST|NEEDS/.test(v))return 'amb';if(/BLOCK|ERROR|TIMEOUT/.test(v))return 'red';if(/AWAITING/.test(v))return 'amb';if(/FILES|DONE/.test(v))return 'blu';return 'vio';}
function renderGate(t){
  return '<div class="gate"><div class="gh">'+ic('user',17)+'<h2 style="font-size:15px">Your approval gate</h2></div><div class="sub" style="margin-bottom:14px">The crew finished its run. Review above and decide — nothing reaches '+esc(S.project?S.project.branch:'main')+' until you approve.</div>'
    +'<div class="row" style="gap:10px"><button class="btn btn-grn btn-lg" data-act="approve" data-id="'+t.id+'">'+ic('check',16)+(S.gate.writeEnabled?'Approve &amp; open PR':'Approve')+'</button><button class="btn btn-ghost btn-lg" data-act="reqchg" data-id="'+t.id+'">Request changes</button></div></div>';
}
function mergedSummary(t){
  return '<div class="callout ok" style="margin-top:16px">'+ic('check',18)+'<div><b>Approved.</b> Card moved to Done. '+(S.gate.writeEnabled?'A draft PR was opened for the human merge.':'Enable write mode to open a real PR on approve.')+'</div></div>'
    +(t.run&&t.run.totalCost?'<div class="card" style="margin-top:14px"><div class="sc-h" style="padding:14px 16px 0">Logged automatically</div>'+kv('AI engineering cost','<span class="mono">'+fmtCost(t.run.totalCost)+'</span>')+kv('Stages',(t.run.stages||[]).filter(function(s){return s.status==='done';}).length+'')+'</div>':'');
}
function doneSummary(t){var d=t.done;return '<div class="callout ok">'+ic('check',18)+'<div><b>Shipped.</b> PR #'+d.pr+' merged.</div></div><div class="card" style="margin-top:14px"><div class="md" style="padding:15px 17px"><b>✅ Fixed:</b> '+esc(d.fixed)+'</div></div>'+(d.ai?'<div class="card" style="margin-top:14px"><div class="sc-h" style="padding:14px 16px 0">Logged</div>'+kv('AI time','<span class="mono">'+esc(d.ai)+'</span>')+kv('Human review','<span class="mono">'+esc(d.human)+'</span>')+'</div>':'');}
function reviewStatic(t){var p=t.pr;return '<div class="card" style="margin-bottom:14px"><div class="md" style="padding:15px 17px"><b>'+esc(p.title)+'</b> — PR #'+p.num+' → '+esc(p.base)+'<br><br><b>✅ '+esc(p.fixed)+'</b><br><b>➡️ '+esc(p.next)+'</b></div></div>'
  +'<div class="gate"><div class="gh">'+ic('user',17)+'<h2 style="font-size:15px">Your approval gate</h2></div><div class="sub" style="margin-bottom:14px">PR #'+p.num+' passed all gates and is waiting for a human.</div><div class="row" style="gap:10px"><button class="btn btn-grn btn-lg" data-act="approve" data-id="'+t.id+'">'+ic('check',16)+'Approve &amp; merge</button><button class="btn btn-ghost btn-lg" data-act="reqchg" data-id="'+t.id+'">Request changes</button></div></div>';}

/* ============================ SETTINGS ============================ */
function viewSettings(){
  var c=S.context||{};
  return '<div style="max-width:760px">'
   +'<div class="panel" style="margin-bottom:16px"><h2 style="margin-bottom:10px">Connections</h2>'
     +setRow('git','GitHub',S.github.account?('Connected as '+S.github.account):'—',S.github.connected)
     +setRow('repo','Repository',S.project?S.project.repo:'—',!!S.project)
     +setRow('slack','Slack',S.slack.channel||'—',S.slack.connected)
     +setRow('spark','Engine','Claude Code',true)+'</div>'
   +'<div class="panel" style="margin-bottom:16px"><div class="between" style="margin-bottom:8px"><h2>Project context</h2>'+(c.deriving?'<span class="row sub"><span class="spinner"></span>reading…</span>':'<button class="btn btn-soft btn-sm" data-act="rederive">'+ic('refresh',14)+'Re-derive</button>')+'</div>'
     +(c.summary||c.stack?'<div class="card" style="padding:4px 16px">'+ctxRow('Summary',c.summary)+ctxRow('Stack',c.stack)+ctxRow('Test command',c.testCmd,true)+ctxRow('Sensitive paths',c.sensitive,true)+'</div>':'<div class="sub">Connect a repo to derive context.</div>')+'</div>'
   +'<div class="panel" style="margin-bottom:16px"><h2 style="margin-bottom:10px">Secrets</h2>'+secretsUI()+'</div>'
   +'<div class="panel"><div class="between" style="margin-bottom:6px"><h2>The crew</h2><span class="sub">Framework prompts managed · read-only audit</span></div><div style="margin-top:10px">'+crewUI()+'</div></div>'
   +'</div>';
}
function setRow(icn,name,sub,ok){return '<div class="row" style="padding:11px 0;border-top:1px solid var(--line2);gap:12px"><div class="logo" style="width:36px;height:36px;border-radius:9px;background:var(--panel2);display:flex;align-items:center;justify-content:center">'+ic(icn,18)+'</div><div style="flex:1;min-width:0"><div style="font-weight:560">'+esc(name)+'</div><div class="sub mono" style="font-size:12px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">'+esc(sub)+'</div></div>'+(ok?dotchip('OK','grn'):chip('Not set','mut'))+'</div>';}

/* ============================ framework-prompt modal ============================ */
function openPrompt(i){
  var a=S.agents[i];var locked='<span class="lockedline">… managed framework instructions …</span>';
  var map={'Planner':'ROLE: Planner. Decide buildable; if not, block and say why.\n'+locked+'\nWrite a numbered plan + definition of done from\n  → <span class="editable-hl">your ticket SUCCESS CRITERIA</span>\nTreat <span class="editable-hl">sensitive paths</span> as high-risk.\n'+locked,
   'Implementer':'ROLE: Implementer. Implement to the plan on one branch.\n'+locked+'\nFollow <span class="editable-hl">project conventions</span>; run <span class="editable-hl">the test command</span>.\n'+locked,
   'Test gate':'ROLE: Test gate. Run <span class="editable-hl">the test command</span>; hard pass/fail.\nNever edit code to pass.\n'+locked,
   'Reviewer':'ROLE: Reviewer. Adversarial diff review, fresh context.\n'+locked+'\nAPPROVE or REQUEST_CHANGES; default to REQUEST_CHANGES when unsure.\n'+locked,
   'Security reviewer':'ROLE: Security reviewer. Triggers on <span class="editable-hl">sensitive paths</span>.\n'+locked+'\nThreat-model secrets, authz, egress, the lethal trifecta.\n'+locked};
  document.getElementById('modal-root').innerHTML='<div class="overlay" data-act="close-modal"><div class="modal" data-stop="1"><div class="modal-h"><div class="row" style="gap:9px"><span class="crew-mono" style="background:'+a.color+';width:26px;height:26px;border-radius:7px">'+a.mono+'</span><div><div style="font-weight:600">'+esc(a.name)+' — framework prompt</div><div class="sub" style="font-size:12px">'+chip('Read-only audit','vio')+' Managed IP · yellow = your project context</div></div></div><button class="iconbtn" data-act="close-modal">'+ic('x',17)+'</button></div><div class="modal-b"><div class="promptview">'+(map[a.name]||locked)+'</div>'+secure('You can audit how every agent behaves. The framework logic stays managed by Foreman — the only prompts you maintain are your project context.')+'</div></div></div>';
}

/* ============================ actions ============================ */
async function act(a,ds){
  try{
  switch(a){
   case 'nav': view=ds.view;selected=null;render();var c=document.querySelector('.content');if(c)c.scrollTop=0;break;
   case 'reset': await doReset();break;
   case 'open': view='ticket';selected=ds.id;render();document.querySelector('.content').scrollTop=0;if(MODE==='live'){var tt=getT(ds.id);if(tt&&tt.run&&tt.run.status==='running')startRunPolling(ds.id);}break;
   case 'newticket': view='newticket';render();break;
   case 'create-ticket': await createTicket();break;
   case 'run': await runTicket(ds.id);break;
   case 'approve': await approve(ds.id);break;
   case 'reqchg': await reqchg(ds.id);break;
   case 'view-prompt': openPrompt(+ds.i);break;
   case 'close-modal': document.getElementById('modal-root').innerHTML='';break;
   /* setup */
   case 'snext': captureStep(setupStep);if(setupStep<STEPS.length-1)setupStep++;await onEnterStep(setupStep);render();break;
   case 'sback': captureStep(setupStep);if(setupStep>0)setupStep--;render();break;
   case 'sfinish': await finishSetup();break;
   case 'gh-connect': await ghConnect();break;
   case 'pick-repo': await pickRepo(ds.repo);break;
   case 'slack-connect': await slackConnect();break;
   case 'pick-file': document.getElementById('envFile').click();break;
   case 'add-secret': await addSecret();break;
   case 'del-secret': await delSecret(ds.k);break;
   case 'toggle-agent': await toggleAgent(+ds.i);break;
   case 'toggle-merge': await setGate({requireHumanMerge:!S.gate.requireHumanMerge});break;
   case 'toggle-write': await setGate({writeEnabled:!S.gate.writeEnabled});break;
   case 'rederive': await rederive();break;
  }
  }catch(e){toast(String(e.message||e),true);}
}
function captureStep(n){
  if(n===0){if(document.getElementById('wsName'))S.workspace.name=val('wsName');if(document.getElementById('wsType'))S.workspace.type=val('wsType');if(MODE==='live')jpost('/api/workspace',{name:S.workspace.name,type:S.workspace.type}).catch(function(){});}
  if(n===3){var f={};['summary','stack','conventions'].forEach(function(){});}
  if(n===4&&document.getElementById('slackCh'))S.slack.channel=val('slackCh');
  if(n===6&&document.getElementById('strict')){S.gate.strictness=val('strict');if(MODE==='live')setGate({strictness:S.gate.strictness});}
}
async function onEnterStep(n){
  if(n===2&&!window.__repos){ try{ if(MODE==='live'){var j=await jget('/api/github/repos');window.__repos=j.repos||[];}else{window.__repos=[{full:'Owl-Social/bar-hop-connect-match',language:'TypeScript',visibility:'private',pushedAt:'2026-06-05'},{full:'patyau2/rlxhk',language:'TypeScript',visibility:'private',pushedAt:'2026-06-12'}];} }catch(e){window.__repos=[];} }
  if(n===3&&MODE==='live'&&S.context&&S.context.deriving)startContextPolling();
}
async function ghConnect(){
  if(MODE==='live'){await jpost('/api/github/connect');await pullState();}
  else{S.github={connected:true,account:'patyau2',orgs:['Owl-Social']};}
  toast('GitHub connected');render();
}
async function pickRepo(repo){
  if(MODE==='live'){var j=await jpost('/api/project/connect',{repo:repo});S=j.state;startContextPolling();}
  else{S.project={repo:repo,owner:repo.split('/')[0],name:repo.split('/')[1],branch:'main',language:'TypeScript'};S.context={deriving:true,ready:false};render();setTimeout(function(){S.context=clone(window.MOCK.state.context);render();},2200);}
  toast('Connected '+repo);render();
}
async function slackConnect(){
  var ch=val('slackCh')||'#eng';
  if(MODE==='live'){await jpost('/api/slack/connect',{channel:ch});await pullState();}else{S.slack={connected:true,channel:ch};}
  toast('Slack connected');render();
}
async function addSecret(){
  var k=val('newSecK').trim();if(!k){toast('Enter a key name',true);return;}var v=val('newSecV');
  if(MODE==='live'){var j=await jpost('/api/secrets',{name:k,value:v});S.secrets=j.secrets;}else{var nm=k.toUpperCase().replace(/[^A-Z0-9_]/g,'_');if(!S.secrets.some(function(s){return s.name===nm;}))S.secrets.push({name:nm,masked:'••••••••',addedAt:Date.now()});}
  toast(k.toUpperCase().replace(/[^A-Z0-9_]/g,'_')+' saved');render();
}
async function delSecret(name){
  if(MODE==='live'){var j=await jdel('/api/secrets/'+encodeURIComponent(name));S.secrets=j.secrets;}else{S.secrets=S.secrets.filter(function(s){return s.name!==name;});}
  render();
}
async function uploadEnv(text){
  if(MODE==='live'){var j=await jpost('/api/secrets/bulk',{env:text});S.secrets=j.secrets;toast((j.added||[]).length+' secrets loaded');}
  else{var added=0;text.split(/\r?\n/).forEach(function(line){line=line.trim();if(!line||line[0]==='#')return;if(line.indexOf('export ')===0)line=line.slice(7);var i=line.indexOf('=');if(i<1)return;var nm=line.slice(0,i).trim().toUpperCase().replace(/[^A-Z0-9_]/g,'_');if(nm&&!S.secrets.some(function(s){return s.name===nm;})){S.secrets.push({name:nm,masked:'••••••••',addedAt:Date.now()});added++;}});toast(added+' secrets loaded');}
  render();
}
async function toggleAgent(i){
  if(MODE==='live'){var j=await jpost('/api/agents/'+i+'/toggle');S.agents=j.agents;}else{if(!S.agents[i].locked)S.agents[i].enabled=!S.agents[i].enabled;}
  render();
}
async function setGate(patch){
  Object.assign(S.gate,patch);if(MODE==='live')await jpost('/api/gate',patch);render();
}
async function rederive(){
  if(MODE!=='live'||!S.project)return;
  await jpost('/api/project/connect',{repo:S.project.repo});await pullState();startContextPolling();toast('Re-reading the repo…');render();
}
async function finishSetup(){
  captureStep(setupStep);
  if(MODE==='live')await jpost('/api/setup',{complete:true});
  S.setupComplete=true;view='board';render();toast('Workspace ready — welcome to Foreman');
}
async function createTicket(){
  var title=val('f_title').trim();if(!title){toast('Give the ticket a title',true);return;}
  var b={title:title,priority:val('f_priority'),problem:val('f_problem'),located:val('f_located'),attempted:val('f_attempted'),success:val('f_success'),info:val('f_info')};
  if(MODE==='live'){var j=await jpost('/api/tickets',b);S=j.state;selected=j.ticket.id;}
  else{var id='t'+Date.now();var t=Object.assign({id:id,ref:'OWL-'+(150+S.tickets.length),status:'inbox',priority:b.priority||'medium',runnable:true,run:null},b);S.tickets.unshift(t);selected=id;}
  view='ticket';render();document.querySelector('.content').scrollTop=0;toast('Ticket created');
}
async function runTicket(id){
  if(MODE==='live'){
    var t=getT(id);if(t){t.run={status:'running',stages:[],startedAt:Date.now(),totalCost:0};t.status='planning';render();}
    await jpost('/api/tickets/'+id+'/run');toast('Pipeline running — reading your code');startRunPolling(id);
    setTimeout(async function(){try{var j=await jget('/api/tickets/'+id);if(j.ok){replaceT(j.ticket);render();}}catch(e){}},1500);
  } else { mockRun(id); }
}
async function approve(id){
  if(MODE==='live'){var j=await jpost('/api/tickets/'+id+'/approve');replaceT(j.ticket);}else{var t=getT(id);t.status='done';if(t.run)t.run.status='merged';}
  toast('Approved');render();
}
async function reqchg(id){
  if(MODE==='live'){var j=await jpost('/api/tickets/'+id+'/request-changes');replaceT(j.ticket);}else{var t=getT(id);t.status='in_progress';if(t.run)t.run=null;}
  toast('Sent back to the crew');render();
}
async function doReset(){
  if(MODE==='live'){var j=await jpost('/api/reset');S=j.state;window.__repos=null;}else{S=clone(window.MOCK.state);}
  setupStep=0;view=S.setupComplete?'board':'setup';render();toast('Reset');
}

/* ---- mock pipeline ---- */
function mockRun(id){
  var t=getT(id);var stages=id==='hero'?window.MOCK.heroStages:genericStages(t);
  t.run={status:'running',startedAt:Date.now(),writeEnabled:S.gate.writeEnabled,totalCost:0,stages:stages.map(function(s){return {key:s.key,name:s.name,mono:s.mono,color:s.color,status:'pending',verdict:null,body:'',durationMs:0,costUsd:0};})};
  t.status='planning';render();scrollRun();
  var i=0;
  (function step(){
    var s=stages[i],rs=t.run.stages[i];rs.status='running';if(s.cardStatus)t.status=s.cardStatus;render();scrollRun();
    setTimeout(function(){
      rs.status='done';rs.verdict=s.verdict;rs.body=s.body;rs.durationMs=s.durationMs;rs.costUsd=s.costUsd;t.run.totalCost+=s.costUsd||0;
      if(s.key==='pr'){rs.verdict='AWAITING REVIEW';t.status='review';t.run.status='awaiting_gate';render();scrollRun();return;}
      i++;render();scrollRun();if(i<stages.length)setTimeout(step,450);
    },1150);
  })();
}
function genericStages(t){
  var sens=/auth|login|password|token|secret|payment|supabase|user|profile/i.test((t.title+' '+(t.problem||'')+' '+(t.located||'')));
  var L=[{key:'planner',name:'Planner',mono:'P',color:'#4f46e5',verdict:'BUILDABLE',durationMs:72000,costUsd:0.18,cardStatus:'planning',body:'Buildable. Read the relevant code and produced a plan.\n\n**Plan**\n1. Locate the code described in "Problem located".\n2. Make the minimal change to meet the success criteria.\n3. Add tests for the new behaviour and edge cases.\n\n**Definition of done**\n- [ ] '+esc(t.success||'Meets the success criteria')+'\n- [ ] Tests added and green'},
   {key:'impl',name:'Implementer',mono:'I',color:'#2563eb',verdict:'READY',durationMs:140000,costUsd:0.36,cardStatus:'in_progress',body:'Implemented on `feat/'+(t.ref||'task').toLowerCase()+'` (design mode). 3 files changed + 2 tests.'},
   {key:'test',name:'Test gate',mono:'T',color:'#0a8f5b',verdict:'PASS',durationMs:48000,costUsd:0.10,cardStatus:'test_gate',body:'**Command:** `npm run lint && npx vitest run`\n\nChange is testable to green; new cases cover the happy path + edge cases.'},
   {key:'review',name:'Reviewer',mono:'R',color:'#b45309',verdict:'APPROVE',durationMs:66000,costUsd:0.15,cardStatus:'in_progress',body:'APPROVE — scoped to the ticket, edge cases covered, no unrelated edits.'}];
  if(sens)L.push({key:'security',name:'Security reviewer',mono:'S',color:'#7c3aed',verdict:'APPROVE',durationMs:52000,costUsd:0.12,cardStatus:'in_progress',body:'Touches a sensitive path. RLS/authz checked, no secrets in code or logs, no new egress.'});
  L.push({key:'pr',name:'Pull request',mono:'↗',color:'#0b0c0e',verdict:'AWAITING REVIEW',cardStatus:'review',body:'**Branch:** `feat/'+(t.ref||'task').toLowerCase()+'` → `main`\n\n**✅ Proposed:** '+esc(t.title)+'\n\n**➡️ Next action:** Human review → merge.'});
  return L;
}

/* ============================ events ============================ */
document.addEventListener('click',function(e){
  var el=e.target.closest('[data-act]');if(!el)return;
  var a=el.getAttribute('data-act');
  if(a==='close-modal'&&e.target.closest('[data-stop]')&&!e.target.closest('.iconbtn'))return;
  act(a,{view:el.getAttribute('data-view'),id:el.getAttribute('data-id'),i:el.getAttribute('data-i'),k:el.getAttribute('data-k'),repo:el.getAttribute('data-repo')});
});
document.addEventListener('change',function(e){
  if(e.target&&e.target.id==='envFile'&&e.target.files&&e.target.files[0]){
    var fr=new FileReader();fr.onload=function(){uploadEnv(String(fr.result||''));};fr.readAsText(e.target.files[0]);
  }
});
document.addEventListener('dragover',function(e){var dz=e.target.closest&&e.target.closest('#dropzone');if(dz){e.preventDefault();dz.classList.add('drag');}});
document.addEventListener('dragleave',function(e){var dz=e.target.closest&&e.target.closest('#dropzone');if(dz)dz.classList.remove('drag');});
document.addEventListener('drop',function(e){var dz=e.target.closest&&e.target.closest('#dropzone');if(dz){e.preventDefault();dz.classList.remove('drag');var f=e.dataTransfer&&e.dataTransfer.files&&e.dataTransfer.files[0];if(f){var fr=new FileReader();fr.onload=function(){uploadEnv(String(fr.result||''));};fr.readAsText(f);}}});

boot();
