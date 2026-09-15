/* ============================================================
   Refinery hub — the walkable overworld
   ============================================================ */
const STATIONS = [
  { key:'sep', name:'Separation Techniques Lab',  x:168,  col:'#3fd0c0', scene:()=>S_sep },
  { key:'rea', name:'Reactor Design Lab',         x:412,  col:'#ee5f6e', scene:()=>S_rea },
  { key:'flu', name:'Piping Circuit Bay',         x:656,  col:'#f0a02a', scene:()=>S_flu },
  { key:'hea', name:'Thermal Exchange Hall',      x:900,  col:'#ff7a3a', scene:()=>S_hea },
  { key:'brk', name:'Break Room',                 x:1136, col:'#9b8cf0', scene:()=>S_brk }
];

const WALL_TOP = 300;        // top of the back wall
const GROUND   = 512;        // where the wall meets the floor
const FLOOR_LO = 524, FLOOR_HI = H - 42;

/* ---- reusable yard scenery ---- */
function storageTank(x, y, w, h, col, label){
  g.fillStyle = col; rr(x - w/2, y - h, w, h, 6); g.fill();
  g.fillStyle = 'rgba(0,0,0,.16)'; rr(x + w/2 - w*0.3, y - h, w*0.3, h, 6); g.fill();
  g.fillStyle = 'rgba(255,255,255,.10)'; rr(x - w/2 + 4, y - h, w*0.16, h, 4); g.fill();
  g.strokeStyle = 'rgba(0,0,0,.28)'; g.lineWidth = 1.6;
  for (let i = 1; i < 3; i++){
    g.beginPath(); g.moveTo(x-w/2, y-h*i/3); g.lineTo(x+w/2, y-h*i/3); g.stroke();
  }
  g.fillStyle = col; g.beginPath(); g.ellipse(x, y-h, w/2, w*0.17, 0, 0, 7); g.fill();
  g.fillStyle = 'rgba(255,255,255,.12)'; g.beginPath(); g.ellipse(x, y-h, w/2, w*0.17, 0, Math.PI, 0); g.fill();
  g.strokeStyle='rgba(0,0,0,.3)'; g.lineWidth=1.4; rr(x - w/2, y - h, w, h, 6); g.stroke();
  if (label) txt(label, x, y - h/2, 11, 'rgba(255,255,255,.45)');
}
function barrel(x, y, s, col){
  g.save(); g.translate(x,y); g.scale(s,s);
  g.fillStyle='rgba(0,0,0,.2)'; g.beginPath(); g.ellipse(0,0,13,3.6,0,0,7); g.fill();
  g.fillStyle=col; rr(-11,-30,22,30,3); g.fill();
  g.fillStyle='rgba(0,0,0,.18)'; rr(4,-30,7,30,3); g.fill();
  g.fillStyle='rgba(255,255,255,.14)'; rr(-9,-30,3.4,30,2); g.fill();
  g.strokeStyle='rgba(0,0,0,.3)'; g.lineWidth=1.6;
  g.beginPath(); g.moveTo(-11,-22); g.lineTo(11,-22); g.moveTo(-11,-9); g.lineTo(11,-9); g.stroke();
  g.fillStyle=col; g.beginPath(); g.ellipse(0,-30,11,3.2,0,0,7); g.fill();
  g.fillStyle='rgba(255,255,255,.16)'; g.beginPath(); g.ellipse(0,-30,11,3.2,0,Math.PI,0); g.fill();
  g.restore();
}
function crate(x,y,s){
  g.save(); g.translate(x,y); g.scale(s,s);
  g.fillStyle='rgba(0,0,0,.2)'; g.beginPath(); g.ellipse(0,0,17,4,0,0,7); g.fill();
  g.fillStyle='#8a6034'; rr(-16,-30,32,30,3); g.fill();
  g.fillStyle='#6d4a27'; rr(6,-30,10,30,3); g.fill();
  g.strokeStyle='#5c3f22'; g.lineWidth=2.4;
  g.beginPath(); g.moveTo(-16,-30); g.lineTo(16,0); g.moveTo(16,-30); g.lineTo(-16,0); g.stroke();
  g.strokeStyle='#5c3f22'; g.lineWidth=2; rr(-16,-30,32,30,3); g.stroke();
  g.restore();
}
function hazardSign(x,y,s,kind){
  g.save(); g.translate(x,y); g.scale(s,s);
  g.fillStyle='#8a939a'; g.fillRect(-2,-26,4,26);
  g.fillStyle='#f5c22b';
  g.beginPath(); g.moveTo(0,-56); g.lineTo(16,-28); g.lineTo(-16,-28); g.closePath(); g.fill();
  g.strokeStyle='#2b2b2b'; g.lineWidth=2.2;
  g.beginPath(); g.moveTo(0,-56); g.lineTo(16,-28); g.lineTo(-16,-28); g.closePath(); g.stroke();
  g.fillStyle='#2b2b2b';
  if (kind === 'ppe'){ g.fillRect(-1.6,-46,3.2,10); g.beginPath(); g.arc(0,-33,1.9,0,7); g.fill(); }
  else { g.beginPath(); g.moveTo(2,-48); g.lineTo(-5,-38); g.lineTo(-0.5,-38);
         g.lineTo(-3,-31); g.lineTo(5,-41); g.lineTo(0.5,-41); g.closePath(); g.fill(); }
  g.restore();
}

const S_hub = {
  enter(){
    Music.play('work');
    if (this.px === undefined){ this.px = W/2; this.py = 610; }
    this.face = 'right'; this.walkT = 0; this.stepT = 0; this.nearS = null;
  },
  allDone(){ return STATIONS.every(s => G.done[s.key]); },

  draw(){
    /* ================= sky ================= */
    const sky = g.createLinearGradient(0,0,0,WALL_TOP+40);
    sky.addColorStop(0,'#123c56'); sky.addColorStop(.6,'#215f7c'); sky.addColorStop(1,'#37809b');
    g.fillStyle = sky; g.fillRect(0,0,W,WALL_TOP+40);

    /* distant plant silhouette */
    for (let i=0;i<16;i++){
      const x = i*84 - 20, h = 40 + nz(i)*110;
      g.fillStyle = 'rgba(12,42,60,.5)';
      g.fillRect(x, WALL_TOP - h, 24, h + 20);
      g.fillRect(x+24, WALL_TOP - h*0.55, 10, h*0.55 + 20);
    }
    /* stacks with drifting plumes */
    for (const sx of [120, 520, 880, 1180]){
      g.fillStyle='rgba(9,34,50,.72)'; g.fillRect(sx-11, WALL_TOP-190, 22, 190);
      g.fillStyle='rgba(245,120,80,.5)'; g.fillRect(sx-13, WALL_TOP-196, 26, 8);
      for (let s=0;s<7;s++){
        const t2 = (T*0.42 + s*34 + sx) % 238;
        g.fillStyle = `rgba(226,238,244,${0.13*(1-t2/238)})`;
        g.beginPath();
        g.arc(sx + Math.sin(t2/26 + sx)*22, WALL_TOP-196 - t2*0.52, 9 + t2*0.085, 0, 7);
        g.fill();
      }
    }

    /* ================= overhead pipe rack ================= */
    g.fillStyle='#0f3348'; g.fillRect(0, 74, W, 14);
    for (let i=0;i<4;i++)
      pipeSeg(-10, 96+i*13, W+10, 96+i*13, 11,
              {shell: i%2?'#2d6683':'#336f8d', inner: i%2?'#1c475e':'#215068'});
    for (let i=0;i<8;i++){
      g.fillStyle='#10394f'; g.fillRect(i*170+50, 88, 15, 64);
      g.fillStyle='#0b2b3c'; g.fillRect(i*170+50, 148, 15, 10);
    }
    // flow inside the top pipe
    flowDots([[0,96],[W,96]], 1.6, .5, 'rgba(150,235,255,.5)', 3);

    /* ================= back wall ================= */
    const wall = g.createLinearGradient(0,WALL_TOP,0,GROUND);
    wall.addColorStop(0,'#1b4a63'); wall.addColorStop(1,'#10364b');
    g.fillStyle = wall; g.fillRect(0, WALL_TOP, W, GROUND-WALL_TOP);
    // corrugation
    for (let i=0;i<W/26;i++){
      g.fillStyle = i%2 ? 'rgba(255,255,255,.022)' : 'rgba(0,0,0,.05)';
      g.fillRect(i*26, WALL_TOP, 13, GROUND-WALL_TOP);
    }
    // top capping beam
    g.fillStyle='#0d2c3e'; g.fillRect(0, WALL_TOP-10, W, 14);
    g.fillStyle='rgba(255,255,255,.05)'; g.fillRect(0, WALL_TOP-10, W, 3);
    // rust streaks
    for (let i=0;i<14;i++){
      g.fillStyle='rgba(120,70,40,.10)';
      g.fillRect(nz(i)*W, WALL_TOP, 7, 30 + nz(i+4)*90);
    }

    /* ================= doors ================= */
    this.nearS = null;
    const DW = 118, DH = 172;
    for (const s of STATIONS){
      const done = !!G.done[s.key];
      const dy = GROUND - DH;
      const near = Math.abs(this.px - s.x) < 74 && this.py < 630;
      if (near && !done) this.nearS = s;

      // recessed frame
      g.fillStyle='#0a2433'; rr(s.x-DW/2-9, dy-11, DW+18, DH+11, 7); g.fill();
      // interior
      const gr = g.createLinearGradient(0, dy, 0, GROUND);
      if (done){ gr.addColorStop(0,'#061c16'); gr.addColorStop(.55,'#0b2b22');
                 gr.addColorStop(1,'rgba(40,120,90,.55)'); }
      else { gr.addColorStop(0,'#04141e'); gr.addColorStop(.55,'#07202e');
             gr.addColorStop(1,`rgba(46,140,185,${(near?.68:.34)+Math.sin(T/26)*.06})`); }
      g.fillStyle = gr; rr(s.x-DW/2, dy, DW, DH, 5); g.fill();
      // silhouetted contents hint
      g.save(); g.beginPath(); rr(s.x-DW/2, dy, DW, DH, 5); g.clip();
      g.fillStyle='rgba(2,10,16,.62)';
      if (s.key==='sep'){ g.fillRect(s.x-28, dy+40, 18, DH); g.fillRect(s.x+10, dy+66, 22, DH); }
      if (s.key==='rea'){ g.beginPath(); g.arc(s.x, dy+120, 30, 0, 7); g.fill(); g.fillRect(s.x-4, dy+50, 8, 60); }
      if (s.key==='flu'){ g.fillRect(s.x-40, dy+96, 80, 12); g.fillRect(s.x-12, dy+56, 12, 52); }
      if (s.key==='hea'){ g.fillRect(s.x-34, dy+80, 26, DH); g.fillRect(s.x+8, dy+80, 26, DH); }
      if (s.key==='brk'){ g.fillRect(s.x-32, dy+104, 64, 18); g.fillRect(s.x-26, dy+122, 10, 40); g.fillRect(s.x+16, dy+122, 10, 40); }
      g.restore();
      // light spill
      g.save(); g.globalAlpha = done ? .12 : .20;
      const sp = g.createLinearGradient(0, GROUND, 0, GROUND+86);
      sp.addColorStop(0, done ? '#3fd07f' : s.col); sp.addColorStop(1,'rgba(0,0,0,0)');
      g.fillStyle = sp;
      g.beginPath(); g.moveTo(s.x-DW/2, GROUND); g.lineTo(s.x+DW/2, GROUND);
      g.lineTo(s.x+DW/2+34, GROUND+86); g.lineTo(s.x-DW/2-34, GROUND+86); g.closePath(); g.fill();
      g.restore();
      // frame trim
      g.strokeStyle = done ? '#3fd07f' : s.col;
      g.lineWidth = (near && !done) ? 4 : 2.4;
      rr(s.x-DW/2, dy, DW, DH, 5); g.stroke();

      // sign board above the door
      const SW = 176;
      g.save(); g.shadowColor='rgba(0,0,0,.5)'; g.shadowBlur=10; g.shadowOffsetY=3;
      g.fillStyle='rgba(5,22,33,.96)'; rr(s.x-SW/2, dy-58, SW, 44, 7); g.fill();
      g.restore();
      g.strokeStyle = done ? '#3fd07f' : s.col; g.lineWidth=2; rr(s.x-SW/2, dy-58, SW, 44, 7); g.stroke();
      const words = s.name.split(' ');
      const cut = words.length > 2 ? words.length-1 : 1;
      txt(words.slice(0,cut).join(' '), s.x, dy-45, 13, done?'#8fe8b8':'#e2eef5');
      txt(words.slice(cut).join(' '),   s.x, dy-29, 13, done?'#8fe8b8':'#e2eef5');
      if (done){
        g.fillStyle='#3fd07f'; g.beginPath(); g.arc(s.x+SW/2-15, dy-51, 9, 0, 7); g.fill();
        g.strokeStyle='#04121a'; g.lineWidth=2.4; g.lineCap='round';
        g.beginPath(); g.moveTo(s.x+SW/2-19, dy-51); g.lineTo(s.x+SW/2-16, dy-47.5);
        g.lineTo(s.x+SW/2-11, dy-55); g.stroke();
      }
    }

    /* ================= yard props against the wall ================= */
    storageTank(292, GROUND, 58, 118, '#5d7684', 'N2');
    storageTank(548, GROUND, 46, 96,  '#6a6f84', 'H2O');
    storageTank(788, GROUND, 52, 108, '#7a6a5e', 'FUEL');
    storageTank(1030, GROUND, 40, 84, '#5d7684');
    // vertical pipes running off the tanks
    for (const tx of [292, 548, 788, 1030]){
      pipeSeg(tx+28, GROUND-60, tx+28, 158, 7, {shell:'#2f6480', inner:'#1e4459'});
    }
    hazardSign(238, GROUND+2, 1, 'ppe');
    hazardSign(1082, GROUND+2, 1, 'elec');
    barrel(330, GROUND+6, 1, '#d8a832');
    barrel(352, GROUND+4, .88, '#c94a3c');
    crate(588, GROUND+6, .95);
    barrel(836, GROUND+5, 1, '#3f8ad0');
    // wall vents with steam
    for (const vx of [470, 962]){
      g.fillStyle='#0a2432'; rr(vx-18, GROUND-64, 36, 26, 4); g.fill();
      g.strokeStyle='#17475f'; g.lineWidth=2;
      for (let i=0;i<3;i++){ g.beginPath(); g.moveTo(vx-14, GROUND-58+i*7); g.lineTo(vx+14, GROUND-58+i*7); g.stroke(); }
      if (Math.random()<.10) emitSteam(vx, GROUND-64, 1, {speed:.7});
    }

    /* ================= floor ================= */
    const fl = g.createLinearGradient(0,GROUND,0,H);
    fl.addColorStop(0,'#1d4a5f'); fl.addColorStop(1,'#0c2635');
    g.fillStyle = fl; g.fillRect(0, GROUND, W, H-GROUND);
    g.strokeStyle='rgba(255,255,255,.03)'; g.lineWidth=2;
    for (let i=-6;i<24;i++){ g.beginPath(); g.moveTo(i*76, GROUND); g.lineTo(i*76-130, H); g.stroke(); }
    for (let y=GROUND+18;y<H;y+=28){ g.beginPath(); g.moveTo(0,y); g.lineTo(W,y); g.stroke(); }
    // hazard-striped walkway edge
    for (let i=0;i<W/22;i++){
      g.fillStyle = i%2 ? 'rgba(245,181,61,.55)' : 'rgba(30,40,48,.55)';
      g.fillRect(i*22, GROUND+3, 22, 6);
    }
    // a puddle that catches the door light
    g.fillStyle='rgba(120,200,235,.07)';
    g.beginPath(); g.ellipse(700, 660, 90, 20, 0, 0, 7); g.fill();
    g.strokeStyle='rgba(160,220,245,.10)'; g.lineWidth=1.5;
    g.beginPath(); g.ellipse(700, 660, 90, 20, 0, 0, 7); g.stroke();

    /* ================= movement ================= */
    let dx=0, dy=0;
    if (keys.ArrowLeft||keys.a||keys.A) dx--;
    if (keys.ArrowRight||keys.d||keys.D) dx++;
    if (keys.ArrowUp||keys.w||keys.W) dy--;
    if (keys.ArrowDown||keys.s||keys.S) dy++;
    const moving = (dx||dy) && !trans;
    if (dx) this.face = dx>0 ? 'right' : 'left';
    if (moving){
      const n = Math.hypot(dx,dy) || 1;
      this.px = clamp(this.px + dx/n*3.6*dt, 40, W-40);
      this.py = clamp(this.py + dy/n*2.2*dt, FLOOR_LO, FLOOR_HI);
      this.walkT += dt*2.4;
      this.stepT += dt;
      if (this.stepT > 12){ this.stepT = 0; SFX.step();
        spawn({x:this.px, y:this.py, vx:rnd(-.5,.5), vy:rnd(-.6,-.15), life:24, max:24,
               size:rnd(3,6), col:'rgba(190,215,228,.30)', kind:'puff'}); }
    } else this.walkT = 0;

    /* ================= the boss, once everything is done ================= */
    const all = this.allDone();
    if (all){
      const bx = 1240, by = 600;
      drawPerson(NPCS.boss, bx, by, 2.1, { dir:'left', face:'neutral', seed:2 });
      const near = Math.hypot(this.px-bx, this.py-by) < 120;
      bubble(near ? 'Right. Let us talk about your day.' : 'Over here, graduate.',
             bx-30, by-96, {w:216, size:16, pop:1});
      if (near){
        txt('SPACE', bx-30, by+22, 13, '#f5b53d');
        if (keyPressed(' ','Enter','Space')){ SFX.click(); go(S_end, 'fade'); }
      }
    }

    drawParts();

    /* ================= the player ================= */
    drawPerson(hero, this.px, this.py, 2.05, {
      dir: this.face, walk: this.walkT,
      face: this.nearS ? 'happy' : 'neutral', seed:5,
      ppe:{ hat:true, goggles: G.ppe.goggles, coat: G.ppe.coat }
    });

    if (this.nearS){
      const s = this.nearS, yy = this.py - 218;
      g.save(); g.shadowColor='rgba(0,0,0,.5)'; g.shadowBlur=12;
      g.fillStyle='rgba(5,22,33,.96)'; rr(this.px-118, yy-24, 236, 42, 10); g.fill(); g.restore();
      g.strokeStyle=s.col; g.lineWidth=2.2; rr(this.px-118, yy-24, 236, 42, 10); g.stroke();
      txt('SPACE   —   go inside', this.px, yy-2, 17, '#eaf4fa');
      if (keyPressed(' ','Enter','Space')){
        SFX.click(); Hint.begin(s.key); go(s.scene(), 'fade');
      }
    }

    vignette(.36);

    const left = STATIONS.filter(s=>!G.done[s.key]).length;
    hudEl.textContent = all
      ? 'All stations complete  —  report to Mr. Tarek'
      : `${hero.name}   ·   stations left ${left}   ·   score ${finalScore()}/100`;
  }
};
