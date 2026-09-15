/* ============================================================
   FX + equipment art
   ============================================================ */

/* ---------- emitters ---------- */
function emitSteam(x,y,n=1,opt={}){
  for (let i=0;i<n;i++) spawn({
    x:x+rnd(-8,8), y, vx:rnd(-.5,.5)+(opt.vx||0), vy:rnd(-1.9,-1.0)*(opt.speed||1),
    g:-0.005, life:rnd(50,90), max:90, size:rnd(9,18),
    col:opt.col||'rgba(226,240,248,.75)', kind:'puff', vr:rnd(-.02,.02), drag:.985, layer:opt.layer
  });
}
function emitSmoke(x,y,n=1,col='rgba(60,60,66,.8)'){
  for (let i=0;i<n;i++) spawn({
    x:x+rnd(-7,7), y, vx:rnd(-.6,.6), vy:rnd(-2.2,-1.1), g:-0.008,
    life:rnd(60,110), max:110, size:rnd(11,22), col, kind:'puff', vr:rnd(-.03,.03), drag:.986
  });
}
function emitFire(x,y,n=1){
  for (let i=0;i<n;i++) spawn({
    x:x+rnd(-11,11), y:y+rnd(-4,4), vx:rnd(-.7,.7), vy:rnd(-3.4,-1.6), g:-0.02,
    life:rnd(20,38), max:38, size:rnd(7,16),
    col: pick(['rgba(255,208,70,.95)','rgba(255,140,40,.9)','rgba(255,80,30,.85)']),
    kind:'puff', drag:.96
  });
}
function emitFrost(x,y,n=1){
  for (let i=0;i<n;i++) spawn({
    x:x+rnd(-16,16), y:y+rnd(-10,10), vx:rnd(-.5,.5), vy:rnd(.3,1.5), g:0.006,
    life:rnd(50,95), max:95, size:rnd(2.5,5.5),
    col: pick(['rgba(200,240,255,.95)','rgba(150,215,245,.9)','#fff']), kind:'star', vr:rnd(-.06,.06)
  });
}
function emitSpark(x,y,n=1,col='#ffd24a'){
  for (let i=0;i<n;i++) spawn({
    x,y, vx:rnd(-4.5,4.5), vy:rnd(-5,-.5), g:.16, life:rnd(22,44), max:44,
    size:rnd(2,4.5), col, kind:'dot', drag:.97
  });
}
function emitDrip(x,y,n=1,col='rgba(120,200,240,.9)'){
  for (let i=0;i<n;i++) spawn({
    x:x+rnd(-5,5), y, vx:rnd(-.7,.7), vy:rnd(.4,1.6), g:.13, life:rnd(40,75), max:75,
    size:rnd(2.5,5), col, kind:'dot'
  });
}
function emitGoo(x,y,n=1){
  for (let i=0;i<n;i++) spawn({
    x:x+rnd(-14,14), y:y+rnd(-6,6), vx:rnd(-1.4,1.4), vy:rnd(-1.2,.8), g:.11,
    life:rnd(40,80), max:80, size:rnd(5,13),
    col: pick(['rgba(150,60,200,.85)','rgba(110,40,170,.8)','rgba(190,90,220,.75)']),
    kind:'puff', drag:.97
  });
}
function emitConfetti(x,y,n=1){
  for (let i=0;i<n;i++) spawn({
    x,y, vx:rnd(-6,6), vy:rnd(-9,-3), g:.2, life:rnd(70,130), max:130, size:rnd(4,8),
    col: pick(['#f5b53d','#3fd07f','#23a6e0','#ee5f6e','#b98cf0','#fff']),
    kind:'sq', vr:rnd(-.25,.25), shrink:false
  });
}
function emitZ(x,y){
  spawn({ x, y, vx:.35, vy:-.55, life:110, max:110, size:9, col:'rgba(180,220,245,.9)',
          kind:'txt', text:'Z', vr:.008, shrink:false });
}

/* ---------- build cloud: the "constructing something" dust bubble ---------- */
/* prog 0..1 ; draws an expanding dust ball with tools orbiting out of it */
function buildCloud(x, y, r, prog){
  const k = clamp(prog,0,1);
  const grow = k < .25 ? easeOut(k/.25) : k > .78 ? 1 - easeIn((k-.78)/.22) : 1;
  if (grow <= 0.01) return;
  g.save();
  g.globalAlpha = grow * .96;
  // layered dust puffs
  for (let i=0;i<14;i++){
    const a = i/14*Math.PI*2 + T*0.012 + i;
    const wob = Math.sin(T/7 + i*1.7)*0.16 + 1;
    const rr2 = r * (0.52 + 0.42*nz(i)) * wob * grow;
    const dx = Math.cos(a) * r * 0.55 * grow;
    const dy = Math.sin(a) * r * 0.40 * grow;
    const shadeV = 200 + Math.floor(nz(i+9)*45);
    g.fillStyle = `rgba(${shadeV},${shadeV-6},${shadeV-18},${0.24 + nz(i+3)*0.2})`;
    g.beginPath(); g.arc(x+dx, y+dy, rr2, 0, 7); g.fill();
  }
  g.fillStyle = 'rgba(232,228,214,.35)';
  g.beginPath(); g.arc(x, y, r*0.75*grow, 0, 7); g.fill();
  // orbiting tools
  for (let i=0;i<5;i++){
    const a = T*0.075 + i*1.26;
    const rad = r*(0.85 + Math.sin(T/13+i)*0.14) * grow;
    g.save();
    g.translate(x + Math.cos(a)*rad*1.05, y + Math.sin(a)*rad*0.72);
    g.rotate(a*2.2);
    drawTool(i, 13);
    g.restore();
  }
  // impact stars
  if (Math.random() < 0.28*grow){
    emitSpark(x+rnd(-r*.6,r*.6), y+rnd(-r*.5,r*.5), 1, '#fff3c4');
  }
  g.restore();
}

/* ---------- animated water surface with light reflection ---------- */
/* draws a body of liquid inside (x,y,w,h) with moving highlights */
function liquid(x, y, w, h, opt={}){
  const c1 = opt.c1 || '#1f7fb8', c2 = opt.c2 || '#2fc0e8';
  g.save();
  g.beginPath(); rr(x, y, w, h, opt.r === undefined ? 8 : opt.r); g.clip();
  const gr = g.createLinearGradient(0, y, 0, y+h);
  gr.addColorStop(0, c2); gr.addColorStop(1, c1);
  g.fillStyle = gr; g.fillRect(x, y, w, h);

  // moving caustic bands
  g.globalCompositeOperation = 'lighter';
  for (let i=0;i<5;i++){
    const yy = y + ((T*(0.5+i*0.18) + i*h/5) % (h+40)) - 20;
    g.fillStyle = `rgba(190,245,255,${0.05 + 0.035*Math.sin(T/23+i)})`;
    g.beginPath();
    g.moveTo(x, yy);
    for (let px=0; px<=w; px+=18)
      g.lineTo(x+px, yy + Math.sin(px/38 + T/16 + i)*5);
    g.lineTo(x+w, yy+11);
    for (let px=w; px>=0; px-=18)
      g.lineTo(x+px, yy + 11 + Math.sin(px/38 + T/16 + i)*5);
    g.closePath(); g.fill();
  }
  g.globalCompositeOperation = 'source-over';

  // surface line with specular glints
  if (opt.surface !== false){
    g.strokeStyle = 'rgba(220,250,255,.8)'; g.lineWidth = 2.6;
    g.beginPath();
    for (let px=0; px<=w; px+=8){
      const yy = y + 3 + Math.sin(px/26 + T/13)*2.6 + Math.sin(px/11 - T/19)*1.1;
      g[px?'lineTo':'moveTo'](x+px, yy);
    }
    g.stroke();
    for (let i=0;i<4;i++){
      const px = ((T*0.9 + i*w/4) % w);
      const yy = y + 3 + Math.sin(px/26 + T/13)*2.6;
      g.fillStyle = 'rgba(255,255,255,.9)';
      g.beginPath(); g.ellipse(x+px, yy, 9+Math.sin(T/9+i)*3, 1.9, 0, 0, 7); g.fill();
    }
  }
  // wall reflection sheen
  g.fillStyle = 'rgba(255,255,255,.10)';
  g.beginPath(); g.moveTo(x+w*.12, y); g.lineTo(x+w*.30, y); g.lineTo(x+w*.16, y+h); g.lineTo(x+w*.02, y+h);
  g.closePath(); g.fill();
  g.restore();
}

/* salt crystals suspended / settled in a liquid */
function saltCrystals(x, y, w, h, n, dissolvedK){
  for (let i=0;i<n;i++){
    const sx = x + nz(i)*w;
    const drift = Math.sin(T/26 + i*1.9)*4;
    const settle = easeOut(clamp(dissolvedK,0,1));
    const sy = lerp(y + nz(i+40)*h, y + h - 6 - nz(i+7)*7, settle);
    g.save();
    g.translate(sx + drift, sy + Math.cos(T/31+i)*3);
    g.rotate(T/90 + i);
    g.fillStyle = 'rgba(255,255,255,.95)';
    const s = 2.4 + nz(i+12)*2.6;
    g.fillRect(-s/2,-s/2,s,s);
    g.fillStyle = 'rgba(190,225,240,.7)';
    g.fillRect(-s/2,-s/2,s*.45,s*.45);
    g.restore();
  }
}

/* rising bubbles inside a vessel */
function bubbles(x, y, w, h, n, speed=1){
  for (let i=0;i<n;i++){
    const bx = x + nz(i)*w + Math.sin(T/17 + i*2.3)*4;
    const by = y + h - ((T*speed*(0.7+nz(i+5)*0.9) + i*h/n) % h);
    const r = 1.6 + nz(i+21)*3.2;
    g.fillStyle = 'rgba(235,252,255,.55)';
    g.beginPath(); g.arc(bx, by, r, 0, 7); g.fill();
    g.strokeStyle = 'rgba(255,255,255,.7)'; g.lineWidth = .9;
    g.beginPath(); g.arc(bx, by, r, 0, 7); g.stroke();
  }
}

/* ---------- gauges and readouts ---------- */
function gauge(x, y, r, value, min, max, label, opt={}){
  const k = clamp((value-min)/(max-min), 0, 1);
  g.save();
  g.fillStyle = '#e8eef2'; g.beginPath(); g.arc(x,y,r,0,7); g.fill();
  g.strokeStyle = '#4a5a66'; g.lineWidth = 3; g.beginPath(); g.arc(x,y,r,0,7); g.stroke();
  // coloured arc zones
  const a0 = Math.PI*0.75, a1 = Math.PI*2.25;
  const zones = opt.zones || [[0,.3,'#5aa8d8'],[.3,.7,'#3fd07f'],[.7,1,'#ee5f6e']];
  for (const [z0,z1,col] of zones){
    g.strokeStyle = col; g.lineWidth = r*0.2;
    g.beginPath(); g.arc(x,y,r*0.76, lerp(a0,a1,z0), lerp(a0,a1,z1)); g.stroke();
  }
  // needle
  const a = lerp(a0, a1, k);
  g.strokeStyle = '#1b2830'; g.lineWidth = 2.6; g.lineCap='round';
  g.beginPath(); g.moveTo(x - Math.cos(a)*r*.16, y - Math.sin(a)*r*.16);
  g.lineTo(x + Math.cos(a)*r*.72, y + Math.sin(a)*r*.72); g.stroke();
  g.fillStyle = '#1b2830'; g.beginPath(); g.arc(x,y,r*.13,0,7); g.fill();
  if (label) txt(label, x, y + r + 13, Math.max(10,r*0.32), opt.labCol||'#cfe6f2');
  if (opt.readout !== undefined) txt(opt.readout, x, y + r*0.46, r*0.3, '#1b2830');
  g.restore();
}

/* digital panel readout */
function readout(x,y,w,h,lines,opt={}){
  g.fillStyle = opt.bg || '#08181f'; rr(x,y,w,h,6); g.fill();
  g.strokeStyle = opt.stroke || 'rgba(60,220,160,.5)'; g.lineWidth=1.6; rr(x,y,w,h,6); g.stroke();
  lines.forEach((l,i)=> txt(l, x+10, y+16+i*19, opt.size||14, opt.col||'#5ce8a8','left',700));
}

/* ============================================================
   Process equipment — drawn at (x, baseY), `sc` scales it
   state: {run, broken, fire, frost, leak, k}
   ============================================================ */
function unitEvaporator(x,y,sc,st={}){
  g.save(); g.translate(x,y); g.scale(sc,sc);
  g.fillStyle='#8a9aa6'; rr(-44,-8,88,10,3); g.fill();           // base
  g.fillStyle='#b9c7d1'; rr(-38,-74,76,68,10); g.fill();          // vessel
  g.fillStyle='rgba(0,0,0,.14)'; rr(18,-74,20,68,10); g.fill();
  g.strokeStyle='#6f808c'; g.lineWidth=2.5; rr(-38,-74,76,68,10); g.stroke();
  // sight glass
  g.save(); g.beginPath(); rr(-22,-62,44,48,6); g.clip();
  liquid(-22,-62+ (st.level!==undefined? (1-st.level)*30 : 10), 44, 48, {r:0});
  if (st.run) bubbles(-22,-62,44,48,10,1.5);
  g.restore();
  g.strokeStyle='#5e6f7b'; g.lineWidth=2; rr(-22,-62,44,48,6); g.stroke();
  // heating coil
  g.strokeStyle= st.run ? '#ff7a3a' : '#7b6a5a'; g.lineWidth=3.4; g.lineCap='round';
  g.beginPath();
  for (let i=0;i<5;i++){ g.moveTo(-30, -20+i*3); g.lineTo(30, -20+i*3); }
  g.stroke();
  // vapour stack
  g.fillStyle='#9aa9b4'; rr(-7,-96,14,24,4); g.fill();
  g.restore();
  if (st.run) emitSteam(x, y-96*sc, Math.random()<.5?1:0, {speed:1.2});
}

function unitColumn(x,y,sc,st={}){
  g.save(); g.translate(x,y); g.scale(sc,sc);
  g.fillStyle='#8a9aa6'; rr(-30,-8,60,10,3); g.fill();
  const bodyCol = st.frost ? '#b8dcec' : st.broken ? '#9a7060' : '#c2ced7';
  g.fillStyle=bodyCol; rr(-22,-150,44,144,10); g.fill();
  g.fillStyle='rgba(0,0,0,.13)'; rr(8,-150,14,144,9); g.fill();
  g.strokeStyle='#6f808c'; g.lineWidth=2.5; rr(-22,-150,44,144,10); g.stroke();
  // trays
  for (let i=0;i<7;i++){
    const ty = -138 + i*19;
    g.strokeStyle = st.run ? 'rgba(120,220,255,.9)' : 'rgba(110,128,140,.9)';
    g.lineWidth=2; g.beginPath(); g.moveTo(-19,ty); g.lineTo(19,ty); g.stroke();
    if (st.run) for (let b=0;b<3;b++){
      g.fillStyle='rgba(200,245,255,.6)';
      g.beginPath(); g.arc(-13+b*13, ty-3-((T*1.4+i*9+b*5)%13), 2, 0, 7); g.fill();
    }
  }
  // head + reboiler nozzles
  g.fillStyle='#9aa9b4'; rr(-6,-168,12,20,4); g.fill();
  g.fillStyle='#8a9aa6'; rr(22,-128,26,9,3); g.fill(); rr(22,-40,26,9,3); g.fill();
  if (st.frost){
    g.fillStyle='rgba(225,245,255,.55)'; rr(-24,-152,48,148,10); g.fill();
    for (let i=0;i<11;i++){ g.fillStyle='rgba(255,255,255,.85)';
      g.beginPath(); g.arc(-20+nz(i)*40, -146+nz(i+5)*138, 2.6+nz(i+9)*2.4, 0, 7); g.fill(); }
  }
  g.restore();
  if (st.run && !st.broken) emitSteam(x, y-168*sc, Math.random()<.4?1:0);
}

function unitAbsorber(x,y,sc,st={}){
  g.save(); g.translate(x,y); g.scale(sc,sc);
  g.fillStyle='#8a9aa6'; rr(-28,-8,56,10,3); g.fill();
  g.fillStyle='#a8c0b4'; rr(-20,-132,40,126,9); g.fill();
  g.fillStyle='rgba(0,0,0,.13)'; rr(6,-132,14,126,8); g.fill();
  g.strokeStyle='#5e7b6c'; g.lineWidth=2.5; rr(-20,-132,40,126,9); g.stroke();
  // random packing
  g.save(); g.beginPath(); rr(-17,-122,34,100,6); g.clip();
  for (let i=0;i<40;i++){
    g.strokeStyle='rgba(130,170,150,.85)'; g.lineWidth=1.6;
    g.save(); g.translate(-17+nz(i)*34, -122+nz(i+30)*100); g.rotate(nz(i+60)*3);
    g.beginPath(); g.arc(0,0,3.1,0,7); g.stroke(); g.restore();
  }
  if (st.run) for (let i=0;i<14;i++){
    const yy = -122 + ((T*1.7 + i*14) % 100);
    g.fillStyle='rgba(150,220,255,.75)';
    g.beginPath(); g.arc(-14+nz(i)*28, yy, 1.9, 0, 7); g.fill();
  }
  g.restore();
  // solvent spray head
  g.fillStyle='#7d8f9a'; rr(-10,-140,20,9,3); g.fill();
  g.restore();
}

function unitAdsorber(x,y,sc,st={}){
  g.save(); g.translate(x,y); g.scale(sc,sc);
  g.fillStyle='#8a9aa6'; rr(-30,-8,60,10,3); g.fill();
  g.fillStyle='#c9bfa8'; rr(-24,-104,48,98,10); g.fill();
  g.fillStyle='rgba(0,0,0,.13)'; rr(6,-104,18,98,9); g.fill();
  g.strokeStyle='#8a7f68'; g.lineWidth=2.5; rr(-24,-104,48,98,10); g.stroke();
  // pellet bed
  g.save(); g.beginPath(); rr(-20,-94,40,76,6); g.clip();
  for (let i=0;i<58;i++){
    g.fillStyle = i%4 ? '#9d8f72' : '#b3a488';
    g.beginPath(); g.arc(-20+nz(i)*40, -94+nz(i+20)*76, 2.9, 0, 7); g.fill();
  }
  if (st.run) for (let i=0;i<8;i++){
    g.fillStyle='rgba(255,255,255,.5)';
    g.beginPath(); g.arc(-16+nz(i+3)*32, -20-((T*1.1+i*10)%74), 1.7, 0, 7); g.fill();
  }
  g.restore();
  g.fillStyle='#8a9aa6'; rr(-6,-120,12,18,4); g.fill();
  g.restore();
}

function unitDryer(x,y,sc,st={}){
  /* an actual hair blower labelled DRYER */
  g.save(); g.translate(x,y); g.scale(sc,sc);
  g.save(); g.rotate(st.tilt || -0.22);
  g.fillStyle='#3b4a55'; rr(-6,-6,26,44,8); g.fill();        // handle
  g.fillStyle='#e0566a'; rr(-40,-46,66,42,14); g.fill();      // barrel
  g.fillStyle='rgba(0,0,0,.16)'; rr(4,-46,22,42,13); g.fill();
  g.strokeStyle='#a03444'; g.lineWidth=2.5; rr(-40,-46,66,42,14); g.stroke();
  g.fillStyle='#2b343c'; rr(-50,-44,12,38,5); g.fill();       // nozzle
  g.fillStyle='#f2f5f7'; rr(-26,-36,42,15,4); g.fill();
  txt('DRYER', -5, -28.5, 12, '#1b2830');
  g.restore();
  g.restore();
  if (st.run){
    for (let i=0;i<2;i++) spawn({
      x: x - 52*sc + rnd(-4,4), y: y - 26*sc + rnd(-9,9),
      vx: -rnd(3.6,6.4)*sc, vy: rnd(-.8,.8), life:rnd(22,40), max:40,
      size: rnd(4,9)*sc, col:'rgba(255,225,190,.5)', kind:'puff', drag:.98 });
  }
}

function unitBatch(x,y,sc,st={}){
  g.save(); g.translate(x,y); g.scale(sc,sc);
  g.fillStyle='#7b8a95'; rr(-34,-10,68,12,3); g.fill();
  const col = st.frost ? '#cbe6f2' : st.fire ? '#c07a52' : '#cdd8e0';
  g.fillStyle=col;
  g.beginPath(); g.moveTo(-38,-86); g.lineTo(38,-86);
  g.lineTo(38,-30); g.quadraticCurveTo(38,-8,0,-8); g.quadraticCurveTo(-38,-8,-38,-30);
  g.closePath(); g.fill();
  g.fillStyle='rgba(0,0,0,.13)';
  g.beginPath(); g.moveTo(14,-86); g.lineTo(38,-86); g.lineTo(38,-30);
  g.quadraticCurveTo(38,-8,10,-9); g.closePath(); g.fill();
  g.strokeStyle='#6a7a85'; g.lineWidth=2.6;
  g.beginPath(); g.moveTo(-38,-86); g.lineTo(38,-86);
  g.lineTo(38,-30); g.quadraticCurveTo(38,-8,0,-8); g.quadraticCurveTo(-38,-8,-38,-30);
  g.closePath(); g.stroke();
  // window
  g.save(); g.beginPath(); rr(-24,-74,48,54,10); g.clip();
  liquid(-24,-56,48,38,{r:0, c1: st.badProduct?'#4a1a5a':'#1f7fb8', c2: st.badProduct?'#8a3ab0':'#2fc0e8'});
  if (st.run) bubbles(-24,-56,48,38,9,1.6);
  g.restore();
  g.strokeStyle='#5e6f7b'; g.lineWidth=2; rr(-24,-74,48,54,10); g.stroke();
  // agitator
  g.strokeStyle='#8fa0ab'; g.lineWidth=3.4; g.lineCap='round';
  g.beginPath(); g.moveTo(0,-100); g.lineTo(0,-34); g.stroke();
  g.save(); g.translate(0,-34);
  const sp = st.run ? T*0.34 : 0;
  g.scale(Math.cos(sp), 1);
  g.beginPath(); g.moveTo(-17,0); g.lineTo(17,0); g.stroke(); g.restore();
  g.fillStyle='#6a7a85'; rr(-11,-110,22,12,4); g.fill();        // motor
  // jacket
  if (st.jacket === 'cool'){ g.strokeStyle='#5ab8f0'; g.lineWidth=4;
    g.beginPath(); g.moveTo(-44,-70); g.lineTo(-44,-26); g.moveTo(44,-70); g.lineTo(44,-26); g.stroke(); }
  if (st.jacket === 'heat'){ g.strokeStyle='#ff8a3a'; g.lineWidth=4;
    g.beginPath(); g.moveTo(-44,-70); g.lineTo(-44,-26); g.moveTo(44,-70); g.lineTo(44,-26); g.stroke(); }
  // rupture
  if (st.rupture){
    g.fillStyle='#2b1a10';
    g.beginPath(); g.moveTo(38,-64); g.lineTo(60,-56); g.lineTo(44,-48);
    g.lineTo(62,-40); g.lineTo(38,-38); g.closePath(); g.fill();
  }
  g.restore();
}

function unitPacked(x,y,sc,st={}){
  g.save(); g.translate(x,y); g.scale(sc,sc);
  g.fillStyle='#7b8a95'; rr(-30,-10,60,12,3); g.fill();
  const col = st.frost ? '#cbe6f2' : st.fire ? '#b06a44' : '#c4cfd8';
  g.fillStyle=col; rr(-26,-132,52,124,10); g.fill();
  g.fillStyle='rgba(0,0,0,.13)'; rr(6,-132,20,124,9); g.fill();
  g.strokeStyle='#6a7a85'; g.lineWidth=2.6; rr(-26,-132,52,124,10); g.stroke();
  // catalyst pellets
  g.save(); g.beginPath(); rr(-22,-120,44,100,6); g.clip();
  for (let i=0;i<64;i++){
    g.fillStyle = i%5 ? '#6e7a52' : '#8a9668';
    g.save(); g.translate(-22+nz(i)*44, -120+nz(i+33)*100); g.rotate(nz(i+66)*3);
    rr(-3.4,-1.8,6.8,3.6,1.6); g.fill(); g.restore();
  }
  if (st.run) for (let i=0;i<10;i++){
    g.fillStyle='rgba(180,240,255,.55)';
    g.beginPath(); g.arc(-18+nz(i+2)*36, -20-((T*1.5+i*10)%98), 2, 0, 7); g.fill();
  }
  g.restore();
  g.fillStyle='#8a9aa6'; rr(-7,-150,14,20,4); g.fill();
  if (st.jacket === 'heat'){ g.strokeStyle='#ff8a3a'; g.lineWidth=4;
    for(let i=0;i<4;i++){ g.beginPath(); g.moveTo(-32,-116+i*28); g.lineTo(-26,-116+i*28);
      g.moveTo(26,-116+i*28); g.lineTo(32,-116+i*28); g.stroke(); } }
  if (st.jacket === 'cool'){ g.strokeStyle='#5ab8f0'; g.lineWidth=4;
    for(let i=0;i<4;i++){ g.beginPath(); g.moveTo(-32,-116+i*28); g.lineTo(-26,-116+i*28);
      g.moveTo(26,-116+i*28); g.lineTo(32,-116+i*28); g.stroke(); } }
  if (st.rupture){ g.fillStyle='#2b1a10';
    g.beginPath(); g.moveTo(-26,-96); g.lineTo(-50,-88); g.lineTo(-34,-80);
    g.lineTo(-52,-70); g.lineTo(-26,-68); g.closePath(); g.fill(); }
  g.restore();
}

function unitMembrane(x,y,sc,st={}){
  g.save(); g.translate(x,y); g.scale(sc,sc);
  g.fillStyle='#7b8a95'; rr(-58,-10,116,12,3); g.fill();
  const col = st.frost ? '#cbe6f2' : st.fire ? '#b06a44' : '#cbd6de';
  g.fillStyle=col; rr(-56,-74,112,66,14); g.fill();
  g.strokeStyle='#6a7a85'; g.lineWidth=2.6; rr(-56,-74,112,66,14); g.stroke();
  // interior: two chambers split by a porous membrane
  g.save(); g.beginPath(); rr(-50,-68,100,54,8); g.clip();
  g.fillStyle='#17384a'; g.fillRect(-50,-68,100,54);
  // membrane sheet with pores
  g.fillStyle='#e6eef2'; g.fillRect(-3,-68,6,54);
  for (let i=0;i<13;i++){
    g.fillStyle='#17384a';
    g.beginPath(); g.arc(0, -65 + i*4.2, 1.15, 0, 7); g.fill();
  }
  // feed-side molecules (big, stay left) and product (small, cross over)
  for (let i=0;i<14;i++){
    const bx = -46 + ((T*0.7 + i*13) % 40);
    g.fillStyle = 'rgba(120,200,255,.9)';
    g.beginPath(); g.arc(bx, -62 + nz(i)*46, 3.4, 0, 7); g.fill();
  }
  for (let i=0;i<12;i++){
    const prog = ((T*1.5 + i*17) % 92);
    const px = -46 + prog;
    const py = -62 + nz(i+9)*46;
    // squeeze through a pore near the middle
    const near = Math.abs(px) < 6;
    g.fillStyle = near ? 'rgba(255,215,120,1)' : 'rgba(245,181,61,.95)';
    g.beginPath(); g.ellipse(px, py, near?1.1:1.9, near?2.2:1.9, 0, 0, 7); g.fill();
  }
  g.restore();
  g.strokeStyle='#5e6f7b'; g.lineWidth=2; rr(-50,-68,100,54,8); g.stroke();
  // nozzles
  g.fillStyle='#8a9aa6'; rr(-72,-52,18,10,3); g.fill(); rr(54,-52,18,10,3); g.fill();
  rr(54,-34,18,10,3); g.fill();
  if (st.jacket === 'cool'){ g.strokeStyle='#5ab8f0'; g.lineWidth=4;
    g.beginPath(); g.moveTo(-40,-80); g.lineTo(40,-80); g.stroke(); }
  if (st.jacket === 'heat'){ g.strokeStyle='#ff8a3a'; g.lineWidth=4;
    g.beginPath(); g.moveTo(-40,-80); g.lineTo(40,-80); g.stroke(); }
  if (st.rupture){ g.fillStyle='#2b1a10';
    g.beginPath(); g.moveTo(20,-74); g.lineTo(34,-92); g.lineTo(40,-74); g.closePath(); g.fill(); }
  g.restore();
}

function unitPump(x,y,sc,st={}){
  g.save(); g.translate(x,y); g.scale(sc,sc);
  g.fillStyle='#5a6a75'; rr(-30,-10,60,12,3); g.fill();
  g.fillStyle='#3fa8d8'; g.beginPath(); g.arc(-8,-28,21,0,7); g.fill();     // volute
  g.strokeStyle='#22718f'; g.lineWidth=2.6; g.beginPath(); g.arc(-8,-28,21,0,7); g.stroke();
  g.fillStyle='#2b3a44'; rr(12,-38,26,22,5); g.fill();                       // motor
  g.fillStyle='#6a7a85'; rr(34,-34,8,14,2); g.fill();
  // impeller
  g.save(); g.translate(-8,-28); g.rotate((st.spin||0));
  g.strokeStyle='#d8e6ee'; g.lineWidth=2.8; g.lineCap='round';
  for (let i=0;i<5;i++){ const a=i/5*Math.PI*2;
    g.beginPath(); g.moveTo(Math.cos(a)*4,Math.sin(a)*4);
    g.lineTo(Math.cos(a+.5)*14,Math.sin(a+.5)*14); g.stroke(); }
  g.restore();
  g.fillStyle='#8a9aa6'; rr(-34,-34,10,12,2); g.fill();
  txt('PUMP', 2, 2, 9, '#cfe6f2');
  g.restore();
}

function unitCompressor(x,y,sc,st={}){
  g.save(); g.translate(x,y); g.scale(sc,sc);
  g.fillStyle='#5a6a75'; rr(-34,-10,68,12,3); g.fill();
  g.fillStyle='#e0a030'; rr(-30,-46,52,38,8); g.fill();
  g.fillStyle='rgba(0,0,0,.16)'; rr(4,-46,18,38,7); g.fill();
  g.strokeStyle='#a87418'; g.lineWidth=2.6; rr(-30,-46,52,38,8); g.stroke();
  // piston head bobbing
  const bobp = st.spin ? Math.sin(st.spin)*5 : 0;
  g.fillStyle='#3b4a55'; rr(-14,-66+bobp,28,22,5); g.fill();
  g.fillStyle='#8a9aa6'; rr(-6,-76+bobp,12,12,3); g.fill();
  // cooling fins
  g.strokeStyle='#b8862a'; g.lineWidth=2;
  for (let i=0;i<5;i++){ g.beginPath(); g.moveTo(-26,-40+i*7); g.lineTo(18,-40+i*7); g.stroke(); }
  g.fillStyle='#8a9aa6'; rr(22,-34,14,12,2); g.fill();
  txt('COMP', -4, 2, 9, '#ffd9a0');
  g.restore();
}

function unitHeater(x,y,sc,st={}){
  /* flamethrower on a stand */
  g.save(); g.translate(x,y); g.scale(sc,sc);
  g.fillStyle='#5a6a75'; rr(-22,-10,44,12,3); g.fill();
  g.fillStyle='#8a4a2a'; rr(-9,-44,18,36,4); g.fill();          // tank
  g.fillStyle='#c0562a'; rr(-16,-58,32,16,6); g.fill();          // body
  g.strokeStyle='#8a3418'; g.lineWidth=2.2; rr(-16,-58,32,16,6); g.stroke();
  g.fillStyle='#3b4a55'; rr(14,-56,24,9,3); g.fill();            // muzzle
  txt('HEAT', 0, -50, 8, '#ffe0b0');
  g.restore();
  if (st.run){
    emitFire(x + 42*sc, y - 51*sc, 2);
    for (let i=0;i<1;i++) spawn({ x:x+42*sc, y:y-51*sc, vx:rnd(2.5,6)*sc, vy:rnd(-1,1),
      life:rnd(18,32), max:32, size:rnd(6,13)*sc, col:'rgba(255,170,60,.75)', kind:'puff', drag:.95 });
  }
}

function unitCooler(x,y,sc,st={}){
  /* wall AC unit on a stand */
  g.save(); g.translate(x,y); g.scale(sc,sc);
  g.fillStyle='#5a6a75'; rr(-24,-10,48,12,3); g.fill();
  g.fillStyle='#8a9aa6'; rr(-4,-44,8,36,2); g.fill();
  g.fillStyle='#eef3f6'; rr(-34,-72,68,30,7); g.fill();
  g.fillStyle='#d4dde3'; rr(-34,-58,68,16,4); g.fill();
  g.strokeStyle='#9aa8b2'; g.lineWidth=2.2; rr(-34,-72,68,30,7); g.stroke();
  g.strokeStyle='#aab8c2'; g.lineWidth=1.6;
  for (let i=0;i<5;i++){ g.beginPath(); g.moveTo(-28,-55+i*3.2); g.lineTo(28,-55+i*3.2); g.stroke(); }
  g.fillStyle= st.run ? '#3fd07f' : '#7b8b96';
  g.beginPath(); g.arc(26,-67,2.6,0,7); g.fill();
  txt('A/C', -18, -66, 9, '#6a7a85');
  g.restore();
  if (st.run){
    for (let i=0;i<1;i++) spawn({ x:x+rnd(-26,26)*sc, y:y-48*sc, vx:rnd(-.6,.6), vy:rnd(1.4,3.2)*sc,
      life:rnd(26,46), max:46, size:rnd(6,13)*sc, col:'rgba(180,230,255,.45)', kind:'puff', drag:.98 });
    if (Math.random()<.25) emitFrost(x+rnd(-24,24)*sc, y-44*sc, 1);
  }
}

/* piping primitives */
function pipeSeg(x1,y1,x2,y2,w,opt={}){
  g.save(); g.lineCap = opt.cap || 'butt';
  g.strokeStyle = opt.shell || '#8fa3af'; g.lineWidth = w;
  g.beginPath(); g.moveTo(x1,y1); g.lineTo(x2,y2); g.stroke();
  g.strokeStyle = opt.inner || '#5f7280'; g.lineWidth = w*0.62;
  g.beginPath(); g.moveTo(x1,y1); g.lineTo(x2,y2); g.stroke();
  // specular top edge
  const a = Math.atan2(y2-y1, x2-x1), nx = Math.sin(a)*w*0.26, ny = -Math.cos(a)*w*0.26;
  g.strokeStyle = 'rgba(255,255,255,.28)'; g.lineWidth = w*0.16;
  g.beginPath(); g.moveTo(x1+nx,y1+ny); g.lineTo(x2+nx,y2+ny); g.stroke();
  g.restore();
}
function flange(x,y,a,w,ok){
  g.save(); g.translate(x,y); g.rotate(a);
  g.fillStyle = ok ? '#9fb0bb' : 'rgba(150,170,182,.35)';
  rr(-4, -w*0.72, 8, w*1.44, 2); g.fill();
  g.strokeStyle = ok ? '#63757f' : 'rgba(120,140,152,.5)'; g.lineWidth=1.6;
  rr(-4, -w*0.72, 8, w*1.44, 2); g.stroke();
  if (ok){ g.fillStyle='#4e5f69';
    for (let i=0;i<4;i++){ const yy = -w*0.52 + i*(w*1.04/3);
      g.beginPath(); g.arc(0, yy, 1.5, 0, 7); g.fill(); } }
  g.restore();
}
function reliefValve(x,y,sc,st={}){
  g.save(); g.translate(x,y); g.scale(sc,sc);
  g.fillStyle='#8a9aa6'; rr(-7,-4,14,14,2); g.fill();
  g.fillStyle='#b8c4cc'; rr(-11,-24,22,22,5); g.fill();
  g.strokeStyle='#6a7a85'; g.lineWidth=2; rr(-11,-24,22,22,5); g.stroke();
  g.fillStyle='#e0566a'; rr(-5,-40,10,18,3); g.fill();
  g.strokeStyle='#9aa8b2'; g.lineWidth=2.4;
  g.beginPath();
  for (let i=0;i<5;i++){ g.moveTo(-6,-38+i*3.4); g.lineTo(6,-36.4+i*3.4); }
  g.stroke();
  g.restore();
  if (st.venting) emitSteam(x, y-40*sc, 1, {speed:1.6});
}

/* flow dots travelling along a path of points */
function flowDots(pts, speed, amount, col='rgba(160,235,255,.95)', size=4){
  if (!pts.length || amount<=0) return;
  let total = 0; const segs = [];
  for (let i=1;i<pts.length;i++){
    const d = Math.hypot(pts[i][0]-pts[i-1][0], pts[i][1]-pts[i-1][1]);
    segs.push(d); total += d;
  }
  const n = Math.max(2, Math.floor(total/44));
  for (let i=0;i<n;i++){
    let d = ((T*speed + i*total/n) % total);
    for (let s=0;s<segs.length;s++){
      if (d <= segs[s]){
        const k = d/segs[s];
        const x = lerp(pts[s][0], pts[s+1][0], k), y = lerp(pts[s][1], pts[s+1][1], k);
        g.fillStyle = col; g.globalAlpha = amount;
        g.beginPath(); g.arc(x, y, size, 0, 7); g.fill(); g.globalAlpha = 1;
        break;
      }
      d -= segs[s];
    }
  }
}
