/* ============================================================
   Thermal Exchange Hall — triage, then fix, then read the path
   ============================================================ */
const HEA_PLANTS = [
  { id:'hot',  x:360,  name:'SKID A', base:191, swing:7,  need:'cool',
    danger:'high',
    line:'Skid A is at 191 and still climbing. The lagging is scorched.',
    wrongLine:'You put a heater on a skid that was already cooking. It is now a small sun.' },
  { id:'cold', x:940,  name:'SKID B', base:14,  swing:3.4, need:'heat',
    danger:'low',
    line:'Skid B has drifted down to 14. Sluggish, but nobody is getting hurt.',
    wrongLine:'You cooled a skid that was already too cold. The line is frosting over.' }
];

const HEA_PATH = [
  { label:'the furnace, across an air gap', right:'radiation',
    why:'No contact and no flow. Energy crosses the gap as radiation.' },
  { label:'through the solid steel wall',   right:'conduction',
    why:'Straight through a solid. Conduction.' },
  { label:'the still film clinging to the wall', right:'conduction',
    why:'The film is not going anywhere. Heat crawls through it by conduction.' },
  { label:'the fluid rushing down the pipe', right:'convection',
    why:'The fluid carries the heat away with it. Convection.' }
];
const HEA_MODES = ['conduction','convection','radiation'];

/* one segment of the heat-path cross-section */
function pathArt(kind, x, y, w, h, live){
  g.save();
  g.beginPath(); rr(x, y, w, h, 8); g.clip();
  if (kind === 0){          // furnace across a gap
    g.fillStyle='#170e12'; g.fillRect(x,y,w,h);
    // firebox
    g.fillStyle='#43201a'; rr(x+6, y+12, 48, h-24, 6); g.fill();
    g.fillStyle='#160b09'; rr(x+12, y+20, 36, h-40, 4); g.fill();
    g.strokeStyle='#6a3426'; g.lineWidth=2.4; rr(x+6, y+12, 48, h-24, 6); g.stroke();
    // a real fire inside it
    for (let i=0;i<9;i++) emitFireStatic(x+30, y+h-34, i);
    g.fillStyle='rgba(255,150,60,.35)';
    g.beginPath(); g.ellipse(x+30, y+h/2, 30, h/2, 0, 0, 7); g.fill();
    // the glow it throws across the gap
    const gl = g.createLinearGradient(x+54, 0, x+w, 0);
    gl.addColorStop(0,'rgba(255,150,70,.30)'); gl.addColorStop(1,'rgba(255,150,70,0)');
    g.fillStyle = gl; g.fillRect(x+54, y, w-54, h);
    // radiating wavefronts
    for (let i=0;i<4;i++){
      const ph = (T*1.5 + i*30) % 120;
      g.strokeStyle = `rgba(255,205,130,${0.95*(1-ph/120)})`;
      g.lineWidth = 3;
      g.beginPath();
      for (let k=0;k<=26;k++){
        const px = x+58+ph*0.72 + k*2.1;
        if (px > x+w-6) break;
        g.lineTo(px, y+h/2 - 30 + i*20 + Math.sin(k/2.4 + T/6)*5);
      }
      g.stroke();
    }
    txt('FURNACE', x+30, y+h-12, 11, 'rgba(255,190,140,.8)');
    txt('air gap', x+w-52, y+18, 11, 'rgba(255,205,150,.55)');
  }
  else if (kind === 1){     // solid steel wall
    const grd = g.createLinearGradient(x,0,x+w,0);
    grd.addColorStop(0,'#c05a2a'); grd.addColorStop(1,'#5d7a90');
    g.fillStyle='#8d9aa4'; g.fillRect(x,y,w,h);
    g.fillStyle=grd; g.globalAlpha=.55; g.fillRect(x,y,w,h); g.globalAlpha=1;
    for (let i=0;i<7;i++){
      g.strokeStyle='rgba(255,255,255,.12)'; g.lineWidth=1.4;
      g.beginPath(); g.moveTo(x, y+i*h/7); g.lineTo(x+w, y+i*h/7); g.stroke();
    }
    // heat marching through the lattice
    for (let i=0;i<16;i++){
      const px = x + ((T*1.1 + i*17) % w);
      const py = y + 14 + nz(i)*(h-28);
      g.fillStyle='rgba(255,170,90,.85)';
      g.beginPath(); g.arc(px, py, 3, 0, 7); g.fill();
    }
    txt('STEEL', x+w/2, y+h-14, 12, 'rgba(255,255,255,.5)');
  }
  else if (kind === 2){     // stagnant film
    g.fillStyle='#173d4e'; g.fillRect(x,y,w,h);
    g.fillStyle='rgba(120,200,240,.30)'; g.fillRect(x,y,w,h);
    // molecules that jiggle in place and go nowhere
    for (let i=0;i<26;i++){
      const px = x + 10 + nz(i)*(w-20) + Math.sin(T/9 + i*2)*1.8;
      const py = y + 10 + nz(i+30)*(h-20) + Math.cos(T/11 + i)*1.8;
      g.fillStyle='rgba(190,235,255,.85)';
      g.beginPath(); g.arc(px, py, 2.6, 0, 7); g.fill();
    }
    txt('STILL FILM', x+w/2, y+h-14, 12, 'rgba(200,235,250,.6)');
  }
  else {                    // flowing fluid
    g.fillStyle='#0f3448'; g.fillRect(x,y,w,h);
    liquid(x, y+10, w, h-20, {r:0, c1:'#1f6f9c', c2:'#3fb8e0', surface:false});
    for (let i=0;i<16;i++){
      const px = x + ((T*3.4 + i*19) % (w+30)) - 15;
      const py = y + 14 + nz(i)*(h-28);
      g.fillStyle='rgba(255,190,110,.95)';
      g.beginPath(); g.ellipse(px, py, 6.5, 2.8, 0, 0, 7); g.fill();
    }
    txt('FLOWING', x+w/2, y+h-14, 12, 'rgba(210,240,255,.65)');
  }
  g.restore();
  g.strokeStyle = live ? '#f5b53d' : 'rgba(35,166,224,.4)';
  g.lineWidth = live ? 3 : 2; rr(x, y, w, h, 8); g.stroke();
}
/* a small always-on flame for the furnace panel */
function emitFireStatic(x, y, i){
  const ph = (T*2.2 + i*19) % 62;
  g.fillStyle = `rgba(255,${150+Math.floor(nz(i)*95)},60,${0.9*(1-ph/62)})`;
  g.beginPath();
  g.arc(x + Math.sin(T/7+i*1.7)*7, y - ph*1.5, 11 - ph*0.13, 0, 7);
  g.fill();
}

const S_hea = {
  enter(){
    Music.play('work');
    Hint.begin('hea');
    this.px=70; this.py=612; this.face='right'; this.walkT=0; this.stepT=0;
    this.mode='walkin';
    this.st = HEA_PLANTS.map(p=>({ device:null, ok:false, temp:p.base }));
    this.firstTreated = null;
    this.pi = -1;
    this.pathAns = [null,null,null,null];
    this.pathLive = -1;
    this.trim = 0.2; this.trimDone = false;
    this.pts = 0; this.safePts = 0; this.scored = false;
    this.note = null; this.noteT = 0;
    this.mutter = MUTTER.hea[skill('hea')]; this.mutterT = 210;
    after(60, ()=>{ this.mode='free'; });
  },
  exit(){
    if (!this.scored){ this.scored = true;
      award('hea', this.pts, 7); award('saf', this.safePts, 1);
      if (this.trimDone) G.done.hea = true; }
  },
  say(t, f=240){ this.note=t; this.noteT=f; },
  bothFixed(){ return this.st.every(s=>s.device && s.ok); },

  draw(){
    if (this.mode === 'path')  { this.drawPath();  return; }
    if (this.mode === 'trim')  { this.drawTrim();  return; }

    /* ---------------- the hall ---------------- */
    const bg = g.createLinearGradient(0,0,0,H);
    bg.addColorStop(0,'#3a2114'); bg.addColorStop(.55,'#24150f'); bg.addColorStop(1,'#140c0a');
    g.fillStyle=bg; g.fillRect(0,0,W,H);
    for (let i=0;i<W/54;i++){ g.fillStyle = i%2?'rgba(255,255,255,.014)':'rgba(0,0,0,.05)';
      g.fillRect(i*54,0,27,614); }
    for (let i=0;i<4;i++)
      pipeSeg(0, 42+i*20, W, 42+i*20, 13, {shell: i%2?'#7a4a32':'#6a5a4a', inner:'#3e2a1e'});
    flowDots([[0,42],[W,42]], 1.4, .5, 'rgba(255,190,120,.5)', 3);

    const fl = g.createLinearGradient(0,614,0,H);
    fl.addColorStop(0,'#2e1c14'); fl.addColorStop(1,'#130b09');
    g.fillStyle=fl; g.fillRect(0,614,W,H-614);
    g.fillStyle='rgba(245,181,61,.35)'; g.fillRect(0,616,W,4);
    for (let i=0;i<W/60;i++){ g.strokeStyle='rgba(255,255,255,.025)'; g.lineWidth=2;
      g.beginPath(); g.moveTo(i*60,620); g.lineTo(i*60-70,H); g.stroke(); }

    /* ---------------- the two skids ---------------- */
    let nearP = -1;
    HEA_PLANTS.forEach((p,i)=>{
      const st = this.st[i];
      // the live temperature wanders, and settles once treated
      const target = st.ok ? 78 : p.base;
      st.temp += (target - st.temp) * 0.012 * dt + Math.sin(T/13 + i*3)*p.swing*0.018*dt;
      const shown = st.temp + Math.sin(T/9 + i*2.2)*p.swing*0.5 + Math.sin(T/3.1+i)*p.swing*0.18;

      const tooHot = shown > 140, tooCold = shown < 40;

      // skid body
      g.fillStyle = tooHot ? '#5a2a1c' : tooCold ? '#1d3a52' : '#2f4230';
      rr(p.x-140, 232, 280, 226, 10); g.fill();
      g.strokeStyle = st.ok ? '#3fd07f' : tooHot ? '#ee5f6e' : '#5aa8e0';
      g.lineWidth = 3; rr(p.x-140, 232, 280, 226, 10); g.stroke();
      // vessels inside
      g.save(); g.beginPath(); rr(p.x-136, 236, 272, 218, 8); g.clip();
      g.fillStyle='rgba(0,0,0,.28)'; g.fillRect(p.x-136,236,272,218);
      for (let v=0; v<2; v++){
        const vx = p.x - 60 + v*110;
        g.fillStyle = tooHot ? '#b0603c' : tooCold ? '#7fa8c8' : '#9aa8a0';
        rr(vx-30, 282, 60, 166, 8); g.fill();
        g.fillStyle='rgba(0,0,0,.18)'; rr(vx+10, 282, 20, 166, 7); g.fill();
        g.strokeStyle='rgba(0,0,0,.3)'; g.lineWidth=1.6;
        for (let k=1;k<4;k++){ g.beginPath(); g.moveTo(vx-30, 282+k*42); g.lineTo(vx+30, 282+k*42); g.stroke(); }
      }
      pipeSeg(p.x-90, 264, p.x+50, 264, 14, {shell:'#8a7a6a', inner:'#4e433a'});
      // heat or frost signature
      if (tooHot){
        if (Math.random()<.55) emitSmoke(p.x + rnd(-70,70), 248, 1, 'rgba(90,50,40,.45)');
        g.fillStyle=`rgba(255,110,60,${0.06+Math.sin(T/8)*0.03})`; g.fillRect(p.x-136,236,272,218);
      }
      if (tooCold){
        if (Math.random()<.35) emitFrost(p.x + rnd(-80,80), rnd(272,446), 1);
        g.fillStyle='rgba(190,230,255,.10)'; g.fillRect(p.x-136,236,272,218);
      }
      g.restore();

      // plinth, so the skid sits on the floor behind the walkway
      g.fillStyle='rgba(0,0,0,.35)'; rr(p.x-152, 458, 304, 16, 4); g.fill();
      g.fillStyle='#1b1410'; rr(p.x-150, 456, 300, 13, 4); g.fill();

      // the gauge, fluctuating
      gauge(p.x, 164, 42, shown, 0, 220, null, {
        readout: shown.toFixed(1) + '°',
        zones: [[0,.18,'#5aa8d8'],[.18,.55,'#3fd07f'],[.55,1,'#ee5f6e']]
      });
      panel(p.x-76, 92, 152, 32, 'rgba(8,4,4,.9)',
            st.ok ? 'rgba(63,208,127,.6)' : 'rgba(245,181,61,.5)', 7);
      txt(p.name, p.x, 108, 15, st.ok ? '#8fe8b8' : '#f5cf8a');

      // the fitted device
      if (st.device === 'heat')      unitHeater(p.x+180, 612, 1.05, {run:true});
      else if (st.device === 'cool') unitCooler(p.x+180, 612, 1.05, {run:true});
      else {
        g.save();
        g.strokeStyle=`rgba(245,181,61,${.35+Math.sin(T/12+i)*.18})`; g.lineWidth=3;
        g.setLineDash([9,8]);
        rr(p.x+128, 536, 104, 76, 8); g.stroke();
        g.setLineDash([]); g.restore();
        txt('?', p.x+180, 574, 30, 'rgba(245,181,61,.65)');
      }

      if (this.mode==='free' && !st.ok && Math.abs(this.px - p.x) < 150) nearP = i;
    });

    drawParts();
    drawPerson(hero, this.px, this.py, 2.0, {
      dir:this.face, walk:this.walkT, seed:5,
      face: this.st.some((s,i)=>!s.ok && HEA_PLANTS[i].danger==='high') ? 'worry' : 'neutral',
      ppe:{ hat:true, goggles:G.ppe.goggles, coat:G.ppe.coat }
    });

    /* ---------------- movement ---------------- */
    if (this.mode==='walkin'){
      this.px += 3.2*dt; this.walkT += dt*2.4;
      this.stepT+=dt; if (this.stepT>12){this.stepT=0;SFX.step();}
    } else if (this.mode==='free'){
      let dx=0,dy=0;
      if (keys.ArrowLeft||keys.a||keys.A) dx--;
      if (keys.ArrowRight||keys.d||keys.D) dx++;
      if (keys.ArrowUp||keys.w||keys.W) dy--;
      if (keys.ArrowDown||keys.s||keys.S) dy++;
      if (dx) this.face = dx>0?'right':'left';
      if ((dx||dy) && !trans){
        this.px = clamp(this.px + dx*3.6*dt, 46, W-46);
        this.py = clamp(this.py + dy*1.9*dt, 594, 678);
        this.walkT += dt*2.4;
        this.stepT+=dt; if (this.stepT>12){this.stepT=0;SFX.step();}
      } else this.walkT=0;

      if (nearP >= 0){
        const p = HEA_PLANTS[nearP];
        panel(p.x-170, 470, 340, 42, 'rgba(8,4,4,.96)', '#ff7a3a', 10);
        txt('SPACE   —   deal with ' + p.name, p.x, 492, 16, '#eaf4fa');
        if (keyPressed(' ','Enter','Space')) this.openPlant(nearP);
      }
      if (this.bothFixed() && !this.pathDone){
        panel(W/2-260, 664, 520, 44, 'rgba(8,4,4,.96)', '#f5b53d', 10);
        txt('SPACE  —  both skids steady, now trace where the heat goes', W/2, 686, 17, '#f5cf8a','center',400);
        if (keyPressed(' ','Enter','Space')) { this.mode='path'; SFX.click(); }
      }
    }

    /* ---------------- choose a device ---------------- */
    if (this.mode === 'plant'){
      const p = HEA_PLANTS[this.pi], st = this.st[this.pi];
      shade(.62);
      txt(p.name, W/2, 84, 32, '#f5cf8a');
      txt(p.line, W/2, 122, 21, '#e8d8cc','center',400);
      const opts = [
        { id:'heat', name:'Heater',  sub:'a flamethrower on a stand', draw:unitHeater },
        { id:'cool', name:'Cooler',  sub:'an air conditioner, basically', draw:unitCooler }
      ];
      opts.forEach((o,i)=>{
        const cw=340, gap=40, x0=(W-(2*cw+gap))/2;
        const x=x0+i*(cw+gap), y=200, h=300;
        const z = zone(x,y,cw,h);
        g.save(); if (z.hover){ g.shadowColor='#ff7a3a'; g.shadowBlur=24; }
        g.fillStyle = z.hover ? 'rgba(60,28,16,.98)' : 'rgba(26,14,10,.96)';
        rr(x, z.hover?y-5:y, cw, h, 12); g.fill(); g.restore();
        g.strokeStyle = z.hover ? '#ff7a3a' : 'rgba(255,122,58,.32)';
        g.lineWidth=2; rr(x, z.hover?y-5:y, cw, h, 12); g.stroke();
        const yy = z.hover?y-5:y;
        g.save(); g.translate(x+cw/2, yy+220); g.scale(1.5,1.5);
        o.draw(0,0,1,{run:z.hover}); g.restore();
        txt(o.name, x+cw/2, yy+248, 22, z.hover?'#fff':'#e8d8cc');
        txt(o.sub,  x+cw/2, yy+272, 14, 'rgba(232,216,204,.6)','center',400);
        if (z.clicked) this.fit(o.id);
      });
      if (button('NOT YET', W/2-90, H-72, 180, 44, {size:16})) this.mode='free';
    }

    if (this.noteT > 0){
      this.noteT -= dt;
      const cw=720, cx=W/2-cw/2, cy=H-128;
      panel(cx, cy, cw, 60, 'rgba(8,4,4,.96)', 'rgba(245,181,61,.55)');
      wrapText(this.note, cx+24, cy+30, cw-48, 21, 17, '#e8d8cc','left',400);
    }
    if (this.mutterT>0 && this.mode==='free'){ this.mutterT -= dt;
      if (this.mutterT<180) bubble(this.mutter, this.px, this.py-196, {w:300,size:17,pop:1}); }

    if (Hint.draw(76, 150, 210, 250))
      Hint.use('Treat the dangerous one first. A cold line is a nuisance. A runaway hot one is a hazard.');

    vignette(.4);
    hudEl.textContent = 'Thermal Exchange Hall   ·   ' +
      this.st.filter(s=>s.ok).length + '/2 skids steady';
  },

  openPlant(i){ SFX.click(); this.mode='plant'; this.pi=i; },

  fit(deviceId){
    const p = HEA_PLANTS[this.pi], st = this.st[this.pi];
    st.device = deviceId;
    st.ok = (deviceId === p.need);
    SFX.place();
    for (let k=0;k<16;k++) spawn({ x:p.x+180+rnd(-40,40), y:600+rnd(-20,20),
      vx:rnd(-2,2), vy:rnd(-2.4,-.4), life:rnd(24,46), max:46,
      size:rnd(6,14), col:'rgba(220,210,196,.5)', kind:'puff' });

    if (this.firstTreated === null){
      this.firstTreated = p.id;
      if (p.danger === 'high'){
        this.safePts = 1;
        this.say('The hot one first. If that had run away, the cold skid would have been the least of it.');
        toast('Good triage.');
      } else {
        this.say('You warmed the sluggish one while the other skid sat at 191 and climbing. Wrong order.');
        toast('Hot line first, next time.');
      }
    }
    if (st.ok){ this.pts += 1; SFX.good(); }
    else { SFX.bad(); G.blunders++; this.say(p.wrongLine); }
    this.mode='free';
  },

  /* ---------------- heat path quiz ---------------- */
  drawPath(){
    const bg = g.createLinearGradient(0,0,0,H);
    bg.addColorStop(0,'#241610'); bg.addColorStop(1,'#0f0908');
    g.fillStyle=bg; g.fillRect(0,0,W,H);
    txt('FOLLOW THE HEAT', W/2, 56, 32, '#f5cf8a');
    txt('from the furnace on the left to the fluid on the right, name each step',
        W/2, 92, 18, 'rgba(232,216,204,.7)','center',400);

    const segW = 250, gap = 24, x0 = (W - (4*segW + 3*gap))/2, y = 150, h = 190;
    HEA_PATH.forEach((p,i)=>{
      const x = x0 + i*(segW+gap);
      pathArt(i, x, y, segW, h, this.pathAns[i] === null);
      wrapText(p.label, x+segW/2, y+h+26, segW-10, 19, 15, '#e8d8cc','center',400);

      HEA_MODES.forEach((m,k)=>{
        const bw = segW, bh = 36, bx = x, by = y+h+62+k*42;
        const chosen = this.pathAns[i] === m;
        const locked = this.pathAns[i] !== null;
        const right = (m === p.right);
        const z = zone(bx,by,bw,bh);
        g.fillStyle = chosen ? (right ? 'rgba(20,70,48,.98)' : 'rgba(70,20,26,.98)')
                    : locked ? 'rgba(24,16,14,.7)'
                    : z.hover ? 'rgba(62,32,18,.98)' : 'rgba(26,16,12,.94)';
        rr(bx,by,bw,bh,8); g.fill();
        g.strokeStyle = chosen ? (right ? '#3fd07f' : '#ee5f6e')
                      : locked ? 'rgba(120,100,90,.25)'
                      : z.hover ? '#ff7a3a' : 'rgba(255,122,58,.28)';
        g.lineWidth = chosen ? 2.6 : 1.8; rr(bx,by,bw,bh,8); g.stroke();
        txt(m, bx+bw/2, by+bh/2, 17,
            chosen ? (right?'#8fe8b8':'#f0b0bc') : locked ? 'rgba(200,185,175,.35)' : '#e8d8cc');
        if (z.clicked && !locked){
          this.pathAns[i] = m;
          if (right){ this.pts += 1; SFX.good(); } else { SFX.bad(); }
          this.say(p.why, 200);
        }
      });
    });

    if (this.noteT > 0){
      this.noteT -= dt;
      const cw=760, cx=W/2-cw/2, cy=H-78;
      panel(cx, cy, cw, 52, 'rgba(8,4,4,.96)', 'rgba(245,181,61,.55)');
      txt(this.note, W/2, cy+27, 18, '#f5e0c8','center',400);
    }

    if (this.pathAns.every(a=>a!==null)){
      if (this.noteT <= 0 && button('NOW TRIM THE COOLER', W/2-160, H-70, 320, 46,
                                    {col:'#3fd07f', size:19})){
        this.mode='trim'; this.pathDone=true; SFX.click();
      }
    }
    hudEl.textContent = 'Thermal Exchange Hall   ·   heat path ' +
      this.pathAns.filter(a=>a!==null).length + '/4';
  },

  /* ---------------- steady-state trim ---------------- */
  drawTrim(){
    const st = this.st[0];
    const bg = g.createLinearGradient(0,0,0,H);
    bg.addColorStop(0,'#241610'); bg.addColorStop(1,'#0f0908');
    g.fillStyle=bg; g.fillRect(0,0,W,H);
    txt('HOLD SKID A AT STEADY STATE', W/2, 56, 30, '#f5cf8a');
    txt('too little cooling and it climbs, too much and you overshoot',
        W/2, 92, 18, 'rgba(232,216,204,.7)','center',400);

    /* the skid reacts to the trim */
    const equilibrium = 200 - this.trim * 190;
    st.temp += (equilibrium - st.temp) * 0.05 * dt;
    const shown = st.temp + Math.sin(T/7)*1.6 + Math.sin(T/2.6)*0.5;
    const good = shown > 74 && shown < 92;

    // the vessel
    g.fillStyle = shown>140 ? '#5a2a1c' : shown<50 ? '#1d3a52' : '#2f4230';
    rr(W/2-190, 170, 380, 280, 12); g.fill();
    g.strokeStyle = good ? '#3fd07f' : shown>140 ? '#ee5f6e' : '#5aa8e0';
    g.lineWidth=3; rr(W/2-190, 170, 380, 280, 12); g.stroke();
    g.save(); g.beginPath(); rr(W/2-186, 174, 372, 272, 10); g.clip();
    g.fillStyle='rgba(0,0,0,.3)'; g.fillRect(W/2-186,174,372,272);
    for (let v=0;v<2;v++){
      const vx = W/2 - 80 + v*160;
      g.fillStyle = shown>140 ? '#b0603c' : shown<50 ? '#7fa8c8' : '#9aa8a0';
      rr(vx-40, 210, 80, 210, 9); g.fill();
      g.fillStyle='rgba(0,0,0,.2)'; rr(vx+14, 210, 26, 210, 8); g.fill();
    }
    if (shown>140 && Math.random()<.5) emitSmoke(W/2+rnd(-120,120), 190, 1, 'rgba(90,50,40,.5)');
    if (shown<50 && Math.random()<.4) emitFrost(W/2+rnd(-140,140), rnd(210,420), 1);
    g.restore();
    unitCooler(W/2+250, 450, 1.3, {run:this.trim>0.05});
    drawParts();

    gauge(W/2, 520, 54, shown, 0, 220, null, {
      readout: shown.toFixed(1)+'°',
      zones: [[0,.20,'#5aa8d8'],[.20,.48,'#3fd07f'],[.48,1,'#ee5f6e']] });

    // trim slider
    txt('COOLING DUTY', W/2, 600, 14, '#9fd8ef');
    g.fillStyle='rgba(255,255,255,.1)'; rr(W/2-200, 614, 400, 18, 9); g.fill();
    g.fillStyle = good ? '#3fd07f' : '#5aa8e0';
    rr(W/2-200, 614, 400*clamp(this.trim,0,1), 18, 9); g.fill();
    g.strokeStyle='rgba(63,208,127,.7)'; g.lineWidth=2;
    g.strokeRect(W/2-200+400*0.565, 611, 400*0.095, 24);
    if (button('–', W/2-262, 608, 46, 32, {size:22})) this.trim = clamp(this.trim-0.03,0,1);
    if (button('+', W/2+216, 608, 46, 32, {size:22})) this.trim = clamp(this.trim+0.03,0,1);
    if (keys.ArrowRight) this.trim = clamp(this.trim + 0.006*dt, 0, 1);
    if (keys.ArrowLeft)  this.trim = clamp(this.trim - 0.006*dt, 0, 1);

    txt(good ? 'that is steady state. Hold it.'
       : shown > 92 ? 'still too hot. More cooling.'
       : 'you have overcooled it. Ease off.',
       W/2, 660, 20, good ? '#8fe8b8' : '#f5cf8a','center',400);

    if (good) this.holdT = (this.holdT||0) + dt; else this.holdT = 0;
    g.fillStyle='rgba(63,208,127,.25)';
    g.fillRect(W/2-120, 678, 240*clamp((this.holdT||0)/90,0,1), 6);

    if ((this.holdT||0) > 90 && !this.trimDone){
      this.trimDone = true; this.pts += 1; SFX.great();
      toast('Steady. Both skids are yours.');
      after(70, ()=>{ G.done.hea = true; go(S_hub, 'fade'); });
    }
    hudEl.textContent = 'Thermal Exchange Hall   ·   trimming to steady state';
  }
};
