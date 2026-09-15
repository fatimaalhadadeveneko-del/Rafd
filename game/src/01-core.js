/* ============================================================
   ChemEng Quest — core engine
   canvas, input, scenes, tweens, particles, draw helpers
   ============================================================ */
const W = 1280, H = 720;
const cv = document.getElementById('cv');
const g  = cv.getContext('2d');
const hudEl = document.getElementById('hud');
const toastEl = document.getElementById('toast');

let T = 0;          // global frame counter
let dt = 1;         // delta in frames (60fps = 1)
let last = 0;

/* ---------------- input ---------------- */
const keys = {};
const mouse = { x: W/2, y: H/2, down:false, click:false, up:false };
const hot = [];     // clickable rects registered each frame

addEventListener('keydown', e => {
  keys[e.key] = true; keys[e.code] = true;
  if (['ArrowUp','ArrowDown','ArrowLeft','ArrowRight',' '].includes(e.key)) e.preventDefault();
  if (e.key === 'f' || e.key === 'F') toggleFull();
});
addEventListener('keyup', e => { keys[e.key] = false; keys[e.code] = false; });
function toggleFull(){
  const w = document.getElementById('wrap');
  if (!document.fullscreenElement) w.requestFullscreen && w.requestFullscreen().catch(()=>{});
  else document.exitFullscreen && document.exitFullscreen();
}
function toCanvas(e){
  const r = cv.getBoundingClientRect();
  return { x:(e.clientX - r.left) * W / r.width, y:(e.clientY - r.top) * H / r.height };
}
cv.addEventListener('mousemove', e => { const p = toCanvas(e); mouse.x = p.x; mouse.y = p.y; });
cv.addEventListener('mousedown', e => { const p = toCanvas(e); mouse.x=p.x; mouse.y=p.y; mouse.down = true; mouse.click = true; });
addEventListener('mouseup', () => { mouse.down = false; mouse.up = true; });
cv.addEventListener('touchstart', e => { const p = toCanvas(e.touches[0]); mouse.x=p.x;mouse.y=p.y;mouse.down=true;mouse.click=true; e.preventDefault(); }, {passive:false});
cv.addEventListener('touchmove',  e => { const p = toCanvas(e.touches[0]); mouse.x=p.x;mouse.y=p.y; e.preventDefault(); }, {passive:false});
cv.addEventListener('touchend',   e => { mouse.down=false; mouse.up=true; e.preventDefault(); }, {passive:false});

function keyPressed(...list){
  for (const k of list) if (keys[k]) { list.forEach(x => keys[x]=false); return true; }
  return false;
}

/* a button you draw yourself: returns {hover, clicked} */
function zone(x, y, w, h){
  const hover = mouse.x>=x && mouse.x<=x+w && mouse.y>=y && mouse.y<=y+h;
  const clicked = hover && mouse.click;
  if (hover) hot.push(1);
  return { hover, clicked };
}

/* ---------------- math / easing ---------------- */
const clamp = (v,a,b) => v<a?a:v>b?b:v;
const lerp  = (a,b,t) => a + (b-a)*t;
const ease  = t => t<.5 ? 2*t*t : 1-Math.pow(-2*t+2,2)/2;
const easeOut = t => 1 - Math.pow(1-t, 3);
const easeIn  = t => t*t*t;
const bounce = t => { const n=7.5625,d=2.75;
  if(t<1/d)return n*t*t; if(t<2/d)return n*(t-=1.5/d)*t+.75;
  if(t<2.5/d)return n*(t-=2.25/d)*t+.9375; return n*(t-=2.625/d)*t+.984375; };
function rnd(a=1,b){ return b===undefined ? Math.random()*a : a + Math.random()*(b-a); }
function pick(arr){ return arr[Math.floor(Math.random()*arr.length)]; }
/* deterministic pseudo-noise so scenery does not shimmer */
function nz(i){ const s = Math.sin(i*127.1)*43758.5453; return s - Math.floor(s); }

/* ---------------- timers ---------------- */
const timers = [];
function after(frames, fn){ timers.push({ t:frames, fn }); }
function runTimers(){
  for (let i = timers.length-1; i >= 0; i--){
    timers[i].t -= dt;
    if (timers[i].t <= 0){ const f = timers[i].fn; timers.splice(i,1); f(); }
  }
}
function clearTimers(){ timers.length = 0; }

/* ---------------- particles ---------------- */
const parts = [];
function spawn(o){
  parts.push(Object.assign({
    x:0, y:0, vx:0, vy:0, g:0, life:60, max:60, size:6,
    col:'#fff', kind:'dot', rot:0, vr:0, fade:true, shrink:true
  }, o));
}
function updateParts(){
  for (let i = parts.length-1; i >= 0; i--){
    const p = parts[i];
    p.x += p.vx*dt; p.y += p.vy*dt; p.vy += p.g*dt;
    p.rot += p.vr*dt; p.life -= dt;
    if (p.drag){ p.vx *= Math.pow(p.drag, dt); p.vy *= Math.pow(p.drag, dt); }
    if (p.life <= 0) parts.splice(i,1);
  }
}
function drawParts(filter){
  for (const p of parts){
    if (filter && p.layer !== filter) continue;
    if (!filter && p.layer) continue;
    const k = p.life/p.max;
    g.save();
    g.globalAlpha = p.fade ? clamp(k,0,1) : 1;
    g.translate(p.x, p.y); g.rotate(p.rot);
    const s = p.shrink ? p.size*(0.35+0.65*k) : p.size;
    g.fillStyle = p.col;
    if (p.kind === 'dot'){ g.beginPath(); g.arc(0,0,s,0,7); g.fill(); }
    else if (p.kind === 'sq'){ g.fillRect(-s/2,-s/2,s,s); }
    else if (p.kind === 'star'){ star(0,0,s,s*.45,5); g.fill(); }
    else if (p.kind === 'puff'){
      g.globalAlpha *= .55; g.beginPath();
      g.arc(-s*.4,0,s*.6,0,7); g.arc(s*.4,0,s*.55,0,7); g.arc(0,-s*.4,s*.7,0,7); g.fill();
    }
    else if (p.kind === 'txt'){
      g.font = `700 ${s*2}px "Trebuchet MS",Verdana,sans-serif`;
      g.textAlign='center'; g.textBaseline='middle'; g.fillText(p.text, 0, 0);
    }
    else if (p.kind === 'tool'){ drawTool(p.tool||0, s); }
    else if (p.kind === 'ring'){
      g.strokeStyle = p.col; g.lineWidth = p.lw || 3; g.globalAlpha *= .8;
      g.beginPath(); g.arc(0,0,p.size*(1.4-k)*1.4,0,7); g.stroke();
    }
    g.restore();
  }
  if (!filter) parts.length && 0;
}
function clearParts(){ parts.length = 0; }

/* little flying wrench / bolt / screwdriver silhouettes for build clouds */
function drawTool(i, s){
  g.save(); g.scale(s/10, s/10); g.fillStyle = '#c9d6de'; g.strokeStyle='#7b8b96'; g.lineWidth=1.2;
  if (i%3===0){ // wrench
    g.beginPath(); g.moveTo(-8,-2); g.lineTo(4,-2); g.lineTo(4,2); g.lineTo(-8,2); g.closePath(); g.fill();
    g.beginPath(); g.arc(6,0,4.5,0,7); g.fill();
    g.fillStyle='#4b5a64'; g.beginPath(); g.arc(6,0,2,0,7); g.fill();
  } else if (i%3===1){ // bolt
    g.beginPath(); for(let k=0;k<6;k++){const a=k/6*Math.PI*2; g[k?'lineTo':'moveTo'](Math.cos(a)*6,Math.sin(a)*6);} g.closePath(); g.fill();
    g.fillStyle='#8d9ba5'; g.beginPath(); g.arc(0,0,2.6,0,7); g.fill();
  } else {   // screwdriver
    g.fillStyle='#e0a53d'; g.fillRect(-9,-2.4,7,4.8);
    g.fillStyle='#c9d6de'; g.fillRect(-2,-1.2,11,2.4);
  }
  g.restore();
}

/* ---------------- draw helpers ---------------- */
function rr(x,y,w,h,r){
  r = Math.min(r, Math.abs(w)/2, Math.abs(h)/2);
  g.beginPath(); g.moveTo(x+r,y);
  g.arcTo(x+w,y,x+w,y+h,r); g.arcTo(x+w,y+h,x,y+h,r);
  g.arcTo(x,y+h,x,y,r);     g.arcTo(x,y,x+w,y,r); g.closePath();
}
function star(cx,cy,ro,ri,n){
  g.beginPath();
  for (let i=0;i<n*2;i++){ const r = i%2?ri:ro, a = i/(n*2)*Math.PI*2 - Math.PI/2;
    g[i?'lineTo':'moveTo'](cx+Math.cos(a)*r, cy+Math.sin(a)*r); }
  g.closePath();
}
function txt(s,x,y,size=20,col='#eaf4fa',align='center',weight=700,baseline='middle'){
  g.fillStyle=col; g.textAlign=align; g.textBaseline=baseline;
  g.font=`${weight} ${size}px "Trebuchet MS",Verdana,sans-serif`;
  g.fillText(s,x,y);
}
function txtShadow(s,x,y,size,col,align='center',weight=700){
  g.save(); g.shadowColor='rgba(0,0,0,.6)'; g.shadowBlur=8; g.shadowOffsetY=3;
  txt(s,x,y,size,col,align,weight); g.restore();
}
function wrapText(s,x,y,maxw,lh,size,col,align='left',weight=400){
  g.fillStyle=col; g.textAlign=align; g.textBaseline='middle';
  g.font=`${weight} ${size}px "Trebuchet MS",Verdana,sans-serif`;
  const words=String(s).split(' '); let line='', yy=y, n=0;
  for (const wd of words){
    const test = line + wd + ' ';
    if (g.measureText(test).width > maxw && line){ g.fillText(line.trim(),x,yy); line=wd+' '; yy+=lh; n++; }
    else line = test;
  }
  g.fillText(line.trim(),x,yy);
  return n+1;
}
function panel(x,y,w,h,fill='rgba(6,26,38,.93)',stroke='rgba(35,166,224,.75)',r=14){
  g.save(); g.shadowColor='rgba(0,0,0,.55)'; g.shadowBlur=18; g.shadowOffsetY=6;
  g.fillStyle=fill; rr(x,y,w,h,r); g.fill(); g.restore();
  g.strokeStyle=stroke; g.lineWidth=2; rr(x,y,w,h,r); g.stroke();
}
function shade(a){ g.fillStyle=`rgba(2,10,16,${a})`; g.fillRect(0,0,W,H); }
function vignette(a=.4){
  const v=g.createRadialGradient(W/2,H/2,H*.35,W/2,H/2,H*.92);
  v.addColorStop(0,'rgba(0,0,0,0)'); v.addColorStop(1,`rgba(0,0,0,${a})`);
  g.fillStyle=v; g.fillRect(0,0,W,H);
}

/* a drawn button (canvas), consistent look everywhere */
function button(label,x,y,w,h,opt={}){
  const z = zone(x,y,w,h);
  const on = z.hover && !opt.disabled;
  const base = opt.col || '#23a6e0';
  g.save();
  if (on){ g.shadowColor = base; g.shadowBlur = 16; }
  g.fillStyle = opt.disabled ? 'rgba(20,34,44,.7)' : on ? base : 'rgba(9,38,54,.94)';
  rr(x, on?y-2:y, w, h, 10); g.fill(); g.restore();
  g.strokeStyle = opt.disabled ? 'rgba(120,140,150,.35)' : base;
  g.lineWidth = 2; rr(x, on?y-2:y, w, h, 10); g.stroke();
  txt(label, x+w/2, (on?y-2:y)+h/2+1, opt.size||18,
      opt.disabled ? 'rgba(200,220,230,.4)' : on ? '#04121a' : '#eaf4fa');
  if (on) cv.style.cursor='pointer';
  return z.clicked && !opt.disabled;
}

/* ---------------- HUD / toast ---------------- */
let toastT = 0;
function toast(msg){ toastEl.textContent = msg; toastEl.classList.add('show'); toastT = 150; }
function tickToast(){ if (toastT>0){ toastT -= dt; if (toastT<=0) toastEl.classList.remove('show'); } }

/* ---------------- scene manager with transitions ---------------- */
let scene = null, nextScene = null;
let trans = null;   // {kind, t, dur, half}

function go(s, kind='fade'){
  if (!scene){ scene = s; s.enter && s.enter(); return; }
  if (trans) return;
  nextScene = s;
  trans = { kind, t:0, dur: kind==='swirl'?110 : kind==='ripple'?120 : 52, swapped:false };
}
function doSwap(){
  clearTimers(); clearParts();
  if (scene && scene.exit) scene.exit();
  scene = nextScene; nextScene = null;
  T = 0;
  if (scene.enter) scene.enter();
}
function drawTransition(){
  if (!trans) return;
  trans.t += dt;
  const k = clamp(trans.t / trans.dur, 0, 1);
  if (!trans.swapped && k >= .5){ trans.swapped = true; doSwap(); }

  if (trans.kind === 'fade'){
    const a = k<.5 ? k*2 : (1-k)*2;
    g.fillStyle = `rgba(3,13,20,${a})`; g.fillRect(0,0,W,H);
  }
  else if (trans.kind === 'ripple'){
    // dream entry: horizontal wavy displacement + wash
    const a = k<.5 ? k*2 : (1-k)*2;
    const img = g.getImageData(0,0,W,H);
    const tmp = document.createElement('canvas'); tmp.width=W; tmp.height=H;
    tmp.getContext('2d').putImageData(img,0,0);
    g.fillStyle='#0a1830'; g.fillRect(0,0,W,H);
    const amp = 34*a;
    for (let y=0;y<H;y+=2){
      const off = Math.sin(y/26 + trans.t/7) * amp;
      g.drawImage(tmp, 0,y,W,2, off, y + Math.sin(y/50+trans.t/11)*amp*.3, W,2);
    }
    g.fillStyle=`rgba(90,150,220,${a*.5})`; g.fillRect(0,0,W,H);
  }
  else if (trans.kind === 'swirl'){
    const a = k<.5 ? k*2 : (1-k)*2;
    const img = g.getImageData(0,0,W,H);
    const tmp = document.createElement('canvas'); tmp.width=W; tmp.height=H;
    tmp.getContext('2d').putImageData(img,0,0);
    g.fillStyle='#05101c'; g.fillRect(0,0,W,H);
    g.save();
    const rings = 26;
    for (let i=rings;i>0;i--){
      const r0 = i/rings, rad = r0 * H*0.95;
      g.save();
      g.translate(W/2,H/2); g.rotate(a * (1-r0) * 7);
      g.scale(1 - a*0.25*(1-r0), 1 - a*0.25*(1-r0));
      g.beginPath(); g.arc(0,0,rad,0,7); g.clip();
      g.globalAlpha = 1;
      g.drawImage(tmp, -W/2, -H/2);
      g.restore();
    }
    g.restore();
    g.fillStyle=`rgba(5,16,28,${a*.45})`; g.fillRect(0,0,W,H);
  }
  if (k >= 1) trans = null;
}

/* screen shake */
let shakeAmt = 0;
function shake(a){ shakeAmt = Math.max(shakeAmt, a); }
let flashAmt = 0, flashCol = '255,255,255';
function flash(a, col='255,255,255'){ flashAmt = a; flashCol = col; }

/* ---------------- main loop ---------------- */
function frame(ts){
  dt = last ? clamp((ts-last)/16.667, 0.2, 3) : 1;
  last = ts; T += dt;
  hot.length = 0; cv.style.cursor = 'default';

  g.save();
  if (shakeAmt > 0.2){
    g.translate(rnd(-shakeAmt,shakeAmt), rnd(-shakeAmt,shakeAmt));
    shakeAmt *= Math.pow(0.88, dt);
  } else shakeAmt = 0;

  runTimers();
  updateParts();
  if (scene) scene.draw();
  g.restore();

  if (flashAmt > 0.01){
    g.fillStyle = `rgba(${flashCol},${flashAmt})`; g.fillRect(0,0,W,H);
    flashAmt *= Math.pow(0.86, dt);
  }
  drawTransition();
  tickToast();

  mouse.click = false; mouse.up = false;
  requestAnimationFrame(frame);
}
