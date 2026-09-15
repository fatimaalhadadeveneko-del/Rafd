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
/* the analyser terminal stands between the two skids, always reachable */
const HEA_KIOSK = 668;

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
  bailKey: 'hea',
  canBail(){ return this.mode !== 'quiz'; },

  enter(){
    Music.play('work');
    Hint.begin('hea');
    this.px=70; this.py=612; this.face='right'; this.walkT=0; this.stepT=0;
    this.mode='walkin';
    this.st = HEA_PLANTS.map(p=>({ device:null, ok:false, temp:p.base }));
    this.firstTreated = null;
    this.pi = -1;
    this.pathAns = [null,null,null,null];
    this.pathMiss = [false,false,false,false];
    this.pathLive = -1;
    this.trim = 0.2; this.trimDone = false;
    this.pts = 0; this.safePts = 0; this.scored = false;
    this.quiz = null; this.quizScore = 0;
    this.bad = null; this.pathDone = false;
    this.note = null; this.noteT = 0;
    this.mutter = mutterFor('hea'); this.mutterT = 210;
    after(60, ()=>{ this.mode='free'; });
  },
  exit(){
    if (!this.scored){ this.scored = true;
      award('hea', this.pts, 7); award('saf', this.safePts, 1);
      if (isHard()) award('hea', this.quizScore || 0, 3);
      if (this.trimDone) G.done.hea = true;
      armExplosion('hea'); }
  },
  say(t, f=240){ this.note=t; this.noteT=f; },
  bothFixed(){ return this.st.every(s=>s.device && (s.ok || s.leftBad)); },

  draw(){
    if (this.mode === 'quiz' && this.quiz){
      const bg0 = g.createLinearGradient(0,0,0,H);
      bg0.addColorStop(0,'#241610'); bg0.addColorStop(1,'#0f0908');
      g.fillStyle=bg0; g.fillRect(0,0,W,H);
      this.quiz.draw(); return;
    }
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

      if (st.leftBad){
        const bl = .45 + Math.sin(T/9 + i)*.35;
        panel(p.x-96, 486, 192, 30, 'rgba(38,8,10,.94)', `rgba(238,95,110,${bl})`, 7);
        txt('UNRESOLVED', p.x, 500, 15, `rgba(255,150,160,${.55+bl*.45})`);
      }

      if (this.mode==='free' && !st.ok && !st.leftBad && Math.abs(this.px - p.x) < 150) nearP = i;
    });

    /* ---------------- the thermal path analyser, bolted to the hall wall ---------------- */
    const KX = HEA_KIOSK;
    const nearK = this.mode==='free' && Math.abs(this.px - KX) < 120;
    {
      // pedestal
      g.fillStyle='#1b1410'; rr(KX-34, 556, 68, 60, 5); g.fill();
      g.fillStyle='rgba(0,0,0,.35)'; rr(KX-46, 604, 92, 14, 4); g.fill();
      g.fillStyle='#2a1d16'; rr(KX-9, 470, 18, 92, 4); g.fill();
      // bezel
      g.save(); g.shadowColor='rgba(0,0,0,.55)'; g.shadowBlur=18; g.shadowOffsetY=7;
      g.fillStyle='#15191d'; rr(KX-118, 322, 236, 156, 11); g.fill(); g.restore();
      g.strokeStyle = nearK ? '#35c8f0' : '#2b3239'; g.lineWidth = nearK ? 3 : 2.4;
      rr(KX-118, 322, 236, 156, 11); g.stroke();
      // screen
      g.save(); g.beginPath(); rr(KX-106, 332, 212, 122, 7); g.clip();
      const sg = g.createLinearGradient(0,332,0,454);
      sg.addColorStop(0,'#0b2231'); sg.addColorStop(1,'#061119');
      g.fillStyle=sg; g.fillRect(KX-106,332,212,122);
      // a looping little cross-section: fire | gap | wall | film | flow
      pathArt(Math.floor(T/110)%4, KX-98, 356, 196, 88, true);
      for (let i=0;i<62;i++){ g.fillStyle='rgba(0,0,0,.14)'; g.fillRect(KX-106, 332+i*2, 212, 1); }
      g.restore();
      g.strokeStyle='rgba(120,160,185,.3)'; g.lineWidth=1.6; rr(KX-106, 332, 212, 122, 7); g.stroke();
      txt('THERMAL PATH ANALYSER', KX, 344, 12, 'rgba(160,215,240,.8)');
      txt(this.pathDone ? 'LOGGED' : 'AWAITING TAGS', KX, 468, 12,
          this.pathDone ? 'rgba(143,232,184,.9)' : `rgba(245,207,138,${.55+Math.sin(T/10)*.35})`);
      if (!this.pathDone){
        g.fillStyle=`rgba(53,200,240,${.10+Math.sin(T/13)*.06})`;
        g.beginPath(); g.moveTo(KX-118,322); g.lineTo(KX+118,322); g.lineTo(KX+210,H); g.lineTo(KX-210,H); g.fill();
      }
    }

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
      if (nearP < 0 && nearK && !this.pathDone && !this.bothFixed()){
        panel(HEA_KIOSK-250, 664, 500, 44, 'rgba(8,4,4,.96)', 'rgba(120,160,185,.5)', 10);
        txt('the analyser is live, but settle both skids first',
            HEA_KIOSK, 686, 17, 'rgba(180,205,220,.85)','center',400);
      }
      if (nearP < 0 && nearK && !this.pathDone && this.bothFixed()){
        panel(HEA_KIOSK-260, 664, 520, 44, 'rgba(8,4,4,.96)', '#35c8f0', 10);
        txt('SPACE  —  read the analyser and trace where the heat goes',
            HEA_KIOSK, 686, 17, '#9fd8ef','center',400);
        if (keyPressed(' ','Enter','Space')) { this.mode='path'; SFX.click(); }
      } else if (nearP < 0 && nearK && this.pathDone && !this.trimDone){
        panel(HEA_KIOSK-240, 664, 480, 44, 'rgba(8,4,4,.96)', '#f5b53d', 10);
        txt('SPACE  —  back to the cooling trim', HEA_KIOSK, 686, 17, '#f5cf8a','center',400);
        if (keyPressed(' ','Enter','Space')) { this.mode='trim'; SFX.click(); }
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
        /* instinct: a heat specialist already knows, a weak one guesses badly */
        const ghostGood = ghostHelp('hea') && o.id === p.need;
        const ghostBad  = isWeak('hea')   && o.id !== p.need;
        g.save(); if (z.hover){ g.shadowColor='#ff7a3a'; g.shadowBlur=24; }
        g.fillStyle = z.hover ? 'rgba(60,28,16,.98)' : 'rgba(26,14,10,.96)';
        rr(x, z.hover?y-5:y, cw, h, 12); g.fill(); g.restore();
        g.strokeStyle = ghostGood ? `rgba(63,208,127,${.5+Math.sin(T/10)*.35})`
                      : ghostBad  ? `rgba(238,95,110,${.42+Math.sin(T/10)*.28})`
                      : z.hover ? '#ff7a3a' : 'rgba(255,122,58,.32)';
        g.lineWidth = (ghostGood||ghostBad) ? 3.4 : 2;
        rr(x, z.hover?y-5:y, cw, h, 12); g.stroke();
        const yy = z.hover?y-5:y;
        g.save(); g.translate(x+cw/2, yy+220); g.scale(1.5,1.5);
        o.draw(0,0,1,{run:z.hover}); g.restore();
        txt(o.name, x+cw/2, yy+248, 22, z.hover?'#fff':'#e8d8cc');
        txt(o.sub,  x+cw/2, yy+272, 14, 'rgba(232,216,204,.6)','center',400);
        if (z.clicked) this.fit(o.id);
      });
      /* what the engineer thinks, which is not always worth hearing */
      const hunch = isStrong('hea')
        ? (p.need === 'cool'
            ? 'That is a runaway. Take the heat out before it takes the lagging off.'
            : 'It is losing more heat than it makes. Put heat back in.')
        : isWeak('hea')
          ? (p.need === 'cool'
              ? 'It is hot, so it clearly likes being hot. Help it along.'
              : 'It is cold. Cold things are safe things. Make it colder.')
          : null;
      if (hunch){
        panel(W/2-380, H-150, 760, 64,
              isStrong('hea') ? 'rgba(8,36,26,.95)' : 'rgba(44,14,18,.95)',
              isStrong('hea') ? 'rgba(63,208,127,.55)' : 'rgba(238,95,110,.55)');
        const nw = 14 + hero.name.length*8.4;
        g.fillStyle = isStrong('hea') ? 'rgba(63,208,127,.92)' : 'rgba(238,95,110,.92)';
        rr(W/2-362, H-162, nw, 22, 7); g.fill();
        txt(hero.name, W/2-362+nw/2, H-151, 14, '#04121a');
        wrapText(hunch, W/2, H-118, 700, 22, 18,
                 isStrong('hea') ? '#d8f0e2' : '#f0b8be', 'center', 400);
      }
      if (button('NOT YET', W/2-90, H-56, 180, 40, {size:16})) this.mode='free';
    }

    /* ---------------- it went wrong: fix it, or walk away from it ---------------- */
    if (this.mode === 'fail' && this.bad !== null){
      const p = HEA_PLANTS[this.bad], st = this.st[this.bad];
      shade(.82);
      txt(p.name + '  —  THAT MADE IT WORSE', W/2, 96, 30, '#ee5f6e');
      wrapText(p.wrongLine, W/2, 148, 820, 26, 20, '#f0b8be', 'center', 400);

      // the skid, still doing the wrong thing
      const hotNow = p.need === 'cool';
      g.fillStyle = hotNow ? '#5a2a1c' : '#1d3a52';
      rr(W/2-180, 214, 360, 240, 12); g.fill();
      g.strokeStyle = '#ee5f6e'; g.lineWidth=3; rr(W/2-180, 214, 360, 240, 12); g.stroke();
      g.save(); g.beginPath(); rr(W/2-176, 218, 352, 232, 10); g.clip();
      g.fillStyle='rgba(0,0,0,.3)'; g.fillRect(W/2-176,218,352,232);
      for (let v=0;v<2;v++){
        const vx = W/2 - 76 + v*152;
        g.fillStyle = hotNow ? '#b0603c' : '#7fa8c8';
        rr(vx-36, 252, 72, 190, 9); g.fill();
        g.fillStyle='rgba(0,0,0,.2)'; rr(vx+12, 252, 24, 190, 8); g.fill();
      }
      if (hotNow && Math.random()<.65) emitSmoke(W/2+rnd(-130,130), 232, 1, 'rgba(90,50,40,.5)');
      if (!hotNow && Math.random()<.5) emitFrost(W/2+rnd(-150,150), rnd(252,442), 1);
      g.restore();
      if (st.device === 'heat') unitHeater(W/2+250, 452, 1.15, {run:true});
      else                      unitCooler(W/2+250, 452, 1.15, {run:true});
      drawParts();

      if (button('TAKE IT OFF AND TRY AGAIN', W/2-352, H-82, 330, 44,
                 {col:'#35c8f0', size:17})){
        st.device = null; st.ok = false; st.leftBad = false;
        this.bad = null; this.mode='plant'; SFX.click();
      }
      if (button(leaveLabel('hea'), W/2+22, H-82, 330, 44, {col:'#8a7a5a', size:17})){
        st.leftBad = true;
        noteFault('hea');
        toast(leaveBlurb('hea'));
        this.bad = null; this.mode='free';
        this.say(isWeak('hea')
          ? 'It has settled down. Probably. I will not look at it again.'
          : 'Noted on the board. Somebody will get to it before the shift ends.');
      }
      txt(isWeak('hea')
          ? 'nobody has said anything, so it is presumably fine'
          : 'a skid left wrong is a skid that stays wrong',
          W/2, H-20, 15, 'rgba(232,216,204,.55)');
    }

    if (this.noteT > 0){
      this.noteT -= dt;
      const cw=720, cx=W/2-cw/2, cy=H-128;
      panel(cx, cy, cw, 60, 'rgba(8,4,4,.96)', 'rgba(245,181,61,.55)');
      wrapText(this.note, cx+24, cy+30, cw-48, 21, 17, '#e8d8cc','left',400);
    }
    if (this.mutterT>0 && this.mode==='free'){ this.mutterT -= dt;
      if (this.mutterT<180) bubble(this.mutter, this.px, this.py-196, {w:300,size:17,pop:1}); }

    if (Hint.draw(76, 150, 210, 250)) Hint.use(...this.hintFor());
    Hint.drawMark();

    vignette(.4);
    hudEl.textContent = 'Thermal Exchange Hall   ·   ' +
      this.st.filter(s=>s.ok).length + '/2 skids steady';
  },

  hintFor(){
    if (this.mode === 'plant'){
      const p = HEA_PLANTS[this.pi];
      return [p.need === 'cool'
        ? 'That skid is making more heat than it can lose. Take heat out of it.'
        : 'That skid is losing more heat than it makes. Put heat back in.'];
    }
    if (this.mode === 'fail')
      return ['Take it off and try the other one. Nothing here is permanent.'];
    if (this.mode === 'path'){
      const i = HEA_PATH.findIndex((p,k) => this.pathAns[k] !== p.right);
      if (i >= 0) return ['Section ' + (i+1) + ': ask what is between the two sides. ' +
                          'Solid means conduction, moving fluid means convection, ' +
                          'nothing at all means radiation.'];
      return ['All four right. Go and trim the cooler.'];
    }
    if (this.mode === 'trim')
      return ['Steady means the needle stops drifting, not that it reads low. ' +
              'Nudge it and wait before you nudge it again.'];

    // out on the floor
    const hot = this.st.findIndex((s,i) => !s.ok && !s.leftBad && HEA_PLANTS[i].danger === 'high');
    if (hot >= 0)
      return ['SKID A is the one that can hurt somebody. Deal with it first.',
              HEA_PLANTS[hot].x, 340, HEA_PLANTS[hot].name];
    const any = this.st.findIndex(s => !s.ok && !s.leftBad);
    if (any >= 0)
      return [HEA_PLANTS[any].name + ' is still drifting. Walk up to it and press space.',
              HEA_PLANTS[any].x, 340, HEA_PLANTS[any].name];
    if (!this.pathDone)
      return ['Both skids are settled. Read the analyser in the middle of the hall.',
              HEA_KIOSK, 400, 'ANALYSER'];
    return ['Back to the trim. Hold Skid A at steady state.',
            HEA_KIOSK, 400, 'ANALYSER'];
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
    if (st.ok){ this.pts += 1; SFX.good(); this.mode='free'; }
    else { SFX.bad(); this.noteT = 0; this.bad = this.pi; this.mode='fail'; }
  },

  /* ---------------- heat path quiz, on the hall's wall monitor ---------------- */
  drawPath(){
    /* the hall behind it, so you still know where you are standing */
    const bg = g.createLinearGradient(0,0,0,H);
    bg.addColorStop(0,'#2e1a12'); bg.addColorStop(.55,'#1d110c'); bg.addColorStop(1,'#120a08');
    g.fillStyle=bg; g.fillRect(0,0,W,H);
    for (let i=0;i<W/54;i++){ g.fillStyle = i%2?'rgba(255,255,255,.012)':'rgba(0,0,0,.05)';
      g.fillRect(i*54,0,27,648); }
    for (let i=0;i<3;i++)
      pipeSeg(0, 20+i*17, W, 20+i*17, 11, {shell: i%2?'#7a4a32':'#6a5a4a', inner:'#3e2a1e'});
    const fl = g.createLinearGradient(0,648,0,H);
    fl.addColorStop(0,'#2e1c14'); fl.addColorStop(1,'#130b09');
    g.fillStyle=fl; g.fillRect(0,648,W,H-648);
    g.fillStyle='rgba(245,181,61,.3)'; g.fillRect(0,648,W,4);

    /* ---------------- the monitor ---------------- */
    const BX = 196, BY = 46, BW = 988, BH = 590;      // bezel
    const SX = BX+18, SY = BY+18, SW = BW-36, SH = BH-58;   // screen

    /* wall bracket behind it */
    g.fillStyle='#231611'; rr(BX+BW/2-46, BY+BH-6, 92, 34, 5); g.fill();
    g.fillStyle='#2e1d16'; rr(BX+BW/2-70, BY+BH+24, 140, 14, 5); g.fill();

    /* bezel */
    g.save(); g.shadowColor='rgba(0,0,0,.6)'; g.shadowBlur=26; g.shadowOffsetY=10;
    g.fillStyle='#15191d'; rr(BX, BY, BW, BH, 16); g.fill(); g.restore();
    g.strokeStyle='#2b3239'; g.lineWidth=3; rr(BX, BY, BW, BH, 16); g.stroke();
    g.fillStyle='#1e242a'; rr(BX+6, BY+6, BW-12, BH-12, 12); g.fill();

    /* chin: brand, power light, a couple of dead buttons */
    txt('THERMAL PATH ANALYSER', BX+28, BY+BH-20, 13, 'rgba(180,200,215,.5)','left');
    g.fillStyle='#3fd07f'; g.beginPath(); g.arc(BX+BW-30, BY+BH-20, 5, 0, 7); g.fill();
    g.fillStyle='rgba(63,208,127,.25)'; g.beginPath(); g.arc(BX+BW-30, BY+BH-20, 10, 0, 7); g.fill();
    for (let i=0;i<3;i++){
      g.fillStyle='#2b3239'; rr(BX+BW-96-i*22, BY+BH-25, 14, 10, 3); g.fill();
    }

    /* screen */
    const sc = g.createLinearGradient(0, SY, 0, SY+SH);
    sc.addColorStop(0,'#08161d'); sc.addColorStop(1,'#050f15');
    g.fillStyle = sc; rr(SX, SY, SW, SH, 8); g.fill();
    g.save();
    g.beginPath(); rr(SX, SY, SW, SH, 8); g.clip();

    /* title bar on the screen */
    g.fillStyle='rgba(35,166,224,.14)'; g.fillRect(SX, SY, SW, 38);
    g.fillStyle='rgba(35,166,224,.5)'; g.fillRect(SX, SY+38, SW, 2);
    txt('HEAT PATH  ·  FURNACE  →  PROCESS FLUID', SX+16, SY+20, 16, '#7fd0f0','left');
    txt(this.pathAns.filter(a=>a!==null).length + ' / 4 TAGGED', SX+SW-16, SY+20, 14,
        'rgba(159,216,239,.7)','right');

    /* the four sections of the path */
    const pw = 228, gap = 8, px0 = SX + (SW - (4*pw + 3*gap))/2;
    const py = SY + 58, ph = 196;
    HEA_PATH.forEach((p,i)=>{
      const x = px0 + i*(pw+gap);
      pathArt(i, x, py, pw, ph, this.pathAns[i] === null);
      /* a chevron carrying the heat on to the next section */
      if (i < 3){
        const ax = x + pw + gap/2, ay = py + ph/2;
        for (let c=0;c<2;c++){
          const ph2 = ((T*2 + c*22) % 44) / 44;
          g.strokeStyle = `rgba(255,186,110,${0.9*(1-ph2)})`;
          g.lineWidth = 3; g.lineCap='round'; g.lineJoin='round';
          const ox = -7 + ph2*14;
          g.beginPath();
          g.moveTo(ax+ox-4, ay-7); g.lineTo(ax+ox+3, ay); g.lineTo(ax+ox-4, ay+7);
          g.stroke();
        }
      }
      wrapText(p.label, x+pw/2, py+ph+22, pw-12, 18, 14, '#cfe0ea','center',400);

      HEA_MODES.forEach((m,k)=>{
        const bw = pw, bh = 42, bx = x, by = py+ph+50+k*48;
        const chosen = this.pathAns[i] === m;
        /* only a correct tag locks the row.  A wrong one can always be re-tagged. */
        const locked = this.pathAns[i] === p.right;
        const right = (m === p.right);
        const z = locked ? {hover:false,clicked:false} : zone(bx,by,bw,bh);
        g.save();
        if (z.hover){ g.shadowColor='#23a6e0'; g.shadowBlur=16; }
        g.fillStyle = chosen ? (right ? 'rgba(14,64,44,.98)' : 'rgba(66,16,24,.98)')
                    : locked ? 'rgba(10,26,34,.65)'
                    : z.hover ? 'rgba(14,54,74,.98)' : 'rgba(8,28,38,.94)';
        rr(bx, z.hover?by-2:by, bw, bh, 8); g.fill();
        g.restore();
        g.strokeStyle = chosen ? (right ? '#3fd07f' : '#ee5f6e')
                      : locked && right ? 'rgba(63,208,127,.45)'
                      : locked ? 'rgba(90,120,135,.25)'
                      : z.hover ? '#23a6e0' : 'rgba(35,166,224,.35)';
        g.lineWidth = chosen ? 2.8 : 1.8;
        rr(bx, z.hover?by-2:by, bw, bh, 8); g.stroke();
        txt(m, bx+bw/2, (z.hover?by-2:by)+bh/2, 17,
            chosen ? (right?'#8fe8b8':'#f0b0bc')
                   : locked ? 'rgba(180,205,220,.35)' : '#dceaf2');
        if (z.clicked){
          this.pathAns[i] = m;
          if (right){
            if (!this.pathMiss[i]) this.pts += 1;   // first time counts
            SFX.good();
          } else { this.pathMiss[i] = true; SFX.bad(); }
          this.say(right ? p.why : 'Not that one. Look at what is between the two sides.', 200);
        }
      });
    });

    /* the readout strip along the bottom of the screen */
    const stripY = SY + SH - 62;
    g.fillStyle='rgba(35,166,224,.10)'; g.fillRect(SX, stripY, SW, 62);
    g.fillStyle='rgba(35,166,224,.4)'; g.fillRect(SX, stripY, SW, 2);
    if (this.noteT > 0){
      this.noteT -= dt;
      wrapText(this.note, SX+SW/2, stripY+30, SW-60, 22, 17, '#f5e0c8','center',400);
    } else if (HEA_PATH.every((p2,i2)=> this.pathAns[i2] === p2.right)){
      txt('path tagged end to end, and all of it right', SX+SW/2, stripY+30, 17,
          '#8fe8b8','center',400);
    } else if (this.pathAns.every(a=>a!==null)){
      txt('every section tagged, but the red ones are wrong. Click one to try again.',
          SX+SW/2, stripY+30, 17, '#f0b8be','center',400);
    } else {
      txt('tag every section with the mechanism that carries the heat through it',
          SX+SW/2, stripY+30, 17, 'rgba(207,224,234,.7)','center',400);
    }

    /* screen glare and scanlines, so it reads as a screen */
    for (let y2 = SY; y2 < SY+SH; y2 += 3){
      g.fillStyle='rgba(0,0,0,.055)'; g.fillRect(SX, y2, SW, 1);
    }
    const gl = g.createLinearGradient(SX, SY, SX+SW*0.7, SY+SH);
    gl.addColorStop(0,'rgba(255,255,255,.055)'); gl.addColorStop(.45,'rgba(255,255,255,.012)');
    gl.addColorStop(1,'rgba(255,255,255,0)');
    g.fillStyle = gl; g.fillRect(SX, SY, SW, SH);
    g.restore();
    g.strokeStyle='rgba(120,160,185,.35)'; g.lineWidth=2; rr(SX, SY, SW, SH, 8); g.stroke();

    /* the engineer standing at the monitor, and the glow it throws on them */
    const glow = g.createRadialGradient(BX+BW/2, BY+BH/2, 60, BX+BW/2, BY+BH/2, 900);
    glow.addColorStop(0,'rgba(60,150,200,.10)'); glow.addColorStop(1,'rgba(60,150,200,0)');
    g.fillStyle = glow; g.fillRect(0,0,W,H);
    drawPerson(hero, 104, 700, 1.9, {
      dir:'right', seed:5,
      face: this.pathAns.every(a=>a!==null) ? 'happy' : 'neutral',
      pose: this.noteT > 0 ? 'point' : 'think',
      ppe:{ hat:true, goggles:G.ppe.goggles, coat:G.ppe.coat }
    });

    const allRight = HEA_PATH.every((p,i)=> this.pathAns[i] === p.right);
    const allTagged = this.pathAns.every(a=>a!==null);
    if (allTagged && this.noteT <= 0){
      if (allRight){
        if (button('NOW TRIM THE COOLER', W-352, H-58, 320, 44,
                   {col:'#3fd07f', size:19})){
          this.mode='trim'; this.pathDone=true; SFX.click();
        }
      } else {
        /* the red ones can be re-tagged for as long as you like, or left red */
        txt('the red sections are still wrong. Click one to tag it again.',
            W-186, H-76, 14, '#f0b8be');
        if (button(leaveLabel('hea'), W-352, H-58, 320, 44, {col:'#8a7a5a', size:17})){
          noteFault('hea'); this.pathLeft = true;
          toast(leaveBlurb('hea'));
          this.mode='trim'; this.pathDone=true;
        }
      }
    }
    if (Hint.draw(96, 640, 230, 560)) Hint.use(...this.hintFor());
    Hint.drawMark();
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
    if (showGuide('hea')){
      g.strokeStyle='rgba(63,208,127,.7)'; g.lineWidth=2;
      g.strokeRect(W/2-200+400*0.565, 611, 400*0.095, 24);
    }
    if (button('–', W/2-262, 608, 46, 32, {size:22})) this.trim = clamp(this.trim-0.03,0,1);
    if (button('+', W/2+216, 608, 46, 32, {size:22})) this.trim = clamp(this.trim+0.03,0,1);
    if (keys.ArrowRight) this.trim = clamp(this.trim + 0.006*dt, 0, 1);
    if (keys.ArrowLeft)  this.trim = clamp(this.trim - 0.006*dt, 0, 1);

    txt(showGuide('hea')
        ? (good ? 'that is steady state. Hold it.'
                 : shown > 92 ? 'still too hot. More cooling.'
                 : 'you have overcooled it. Ease off.')
        : (good ? 'the needle has stopped moving. Hold it there.'
                 : 'watch the gauge. Steady means it stops drifting, not that it reads zero.'),
       W/2, 660, 20, good ? '#8fe8b8' : '#f5cf8a','center',400);

    if (good) this.holdT = (this.holdT||0) + dt; else this.holdT = 0;
    g.fillStyle='rgba(63,208,127,.25)';
    g.fillRect(W/2-120, 678, 240*clamp((this.holdT||0)/(isHard()?140:90),0,1), 6);

    if (Hint.draw(76, 150, 210, 250)) Hint.use(...this.hintFor());
    Hint.drawMark();

    if ((this.holdT||0) > (isHard() ? 140 : 90) && !this.trimDone){
      this.trimDone = true; this.pts += 1; SFX.great();
      toast('Steady. Both skids are yours.');
      after(70, ()=>{
        G.done.hea = true;
        if (isHard() && !G.quizDone.hea){
          this.quiz = makeTFQuiz('hea', (correct)=>{
            G.quizDone.hea = true; this.quizScore = correct; this.quiz = null;
            go(S_hub, 'fade');
          });
          this.mode = 'quiz';
        } else go(S_hub, 'fade');
      });
    }

    hudEl.textContent = 'Thermal Exchange Hall   ·   trimming to steady state';
  }
};
