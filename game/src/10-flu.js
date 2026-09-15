/* ============================================================
   Piping Circuit Bay — build the line, then make it move
   ============================================================ */
const FLU_ROOM = 1900;

/* the line the player assembles, in rig-view coordinates */
const PIPE_SEGS = [
  { a:[390,520], b:[520,520] },
  { a:[520,520], b:[520,380] },
  { a:[520,380], b:[880,380] },
  { a:[880,380], b:[880,520] },
  { a:[880,520], b:[1040,520] }
];
const JOINTS = [[390,520],[520,520],[520,380],[880,380],[880,520],[1040,520]];
const MOVER_PAD = [318, 520];
const RELIEF_PAD = [700, 380];

const FLU_MOVERS = [
  { id:'pump', name:'Centrifugal pump', sub:'moves liquids', draw:unitPump },
  { id:'comp', name:'Compressor',       sub:'moves gases',   draw:unitCompressor },
  { id:'col',  name:'Distillation column', sub:'separates things. Not this.', draw:unitColumn }
];

const FLU_RIGS = [
  { id:'gas', x:520, title:'LINE A  ·  process gas', fluid:'gas',
    right:'comp', re:'turbulent', reVal:26400,
    brief:'Line A carries process gas. The stub is hanging open and it is leaking.',
    strong:'Gas line. That wants a compressor, not a pump.',
    weak:'Gas, liquid, it all flows. Put a pump on it and move on.',
    weakPick:'pump',
    wrongLine:{
      pump:'A pump needs liquid to grip. In gas it just spins, cavitates and screams at you.',
      col:'You put a distillation column in a transfer line. It separated nothing and blocked everything.' } },

  { id:'liq', x:1320, title:'LINE B  ·  cooling water', fluid:'liquid',
    right:'pump', re:'laminar', reVal:1480,
    brief:'Line B carries cooling water. Same gap, same problem, different fluid.',
    strong:'Liquid line. Centrifugal pump.',
    weak:'Water is basically wet air. Compressor should be fine.',
    weakPick:'comp',
    wrongLine:{
      comp:'A compressor on an incompressible liquid. It slammed, the casing rang, and nothing moved.',
      col:'Again? A column is not a way of moving water down a pipe.' } }
];

/* ---------- the Reynolds cheat sheet ---------- */
function cheatSheet(x, y, s, ticked, hover){
  g.save(); g.translate(x,y); g.scale(s,s);
  g.save(); g.shadowColor='rgba(0,0,0,.5)'; g.shadowBlur=14; g.shadowOffsetY=5;
  g.fillStyle='#f6f2e2'; g.rotate(-0.02); rr(-110,-84,220,168,5); g.fill(); g.restore();
  g.rotate(-0.02);
  g.strokeStyle='#cfc6ac'; g.lineWidth=2; rr(-110,-84,220,168,5); g.stroke();
  txt('REYNOLDS NUMBER', 0, -62, 14, '#2f4250');
  g.strokeStyle='#c8bfa4'; g.lineWidth=1.4;
  g.beginPath(); g.moveTo(-94,-50); g.lineTo(94,-50); g.stroke();
  const rows = [['laminar','Re < 2100'],['transition','2100 – 4000'],['turbulent','Re > 4000']];
  rows.forEach(([k,v],i)=>{
    const yy = -26 + i*32;
    g.strokeStyle='#5a6a76'; g.lineWidth=2;
    rr(-92, yy-9, 18, 18, 3); g.stroke();
    if (ticked === k){
      g.strokeStyle='#1f8f5c'; g.lineWidth=3; g.lineCap='round';
      g.beginPath(); g.moveTo(-88, yy); g.lineTo(-84, yy+5); g.lineTo(-76, yy-6); g.stroke();
    }
    txt(k, -66, yy, 15, '#2f4250','left');
    txt(v, 90, yy, 13, '#6a7a86','right',400);
  });
  txt('tick the one you measure', 0, 66, 11, '#8a9aa6','center',400);
  g.restore();
}

/* ---------- rig drawing ---------- */
function drawRigLine(st, rig){
  const liquidLine = rig.fluid === 'liquid';
  const col = liquidLine
    ? { shell:'#4f7f9a', inner:'#2f5568' }
    : { shell:'#8a9aa6', inner:'#5a6a76' };

  // inlet and outlet stubs, always present
  pipeSeg(150, 520, MOVER_PAD[0]-46, 520, 26, col);
  pipeSeg(1040, 520, 1130, 520, 26, col);
  // wall plates
  g.fillStyle='#2b3f4c'; rr(126, 486, 26, 68, 4); g.fill();
  g.fillStyle='#2b3f4c'; rr(1128, 486, 26, 68, 4); g.fill();
  txt('FEED', 138, 470, 13, '#9fd8ef');
  txt('TO PLANT', 1140, 470, 13, '#9fd8ef');

  // the segments
  PIPE_SEGS.forEach((s,i)=>{
    if (st.placed[i]) pipeSeg(s.a[0], s.a[1], s.b[0], s.b[1], 26, col);
    else {
      g.save();
      g.strokeStyle = `rgba(35,166,224,${.3+Math.sin(T/14+i)*.12})`;
      g.lineWidth = 26; g.lineCap='butt';
      g.setLineDash([12,10]);
      g.beginPath(); g.moveTo(s.a[0],s.a[1]); g.lineTo(s.b[0],s.b[1]); g.stroke();
      g.setLineDash([]);
      g.restore();
    }
  });

  // flanges
  JOINTS.forEach((j,i)=>{
    const vertical = (i===2 || i===3);
    flange(j[0], j[1], vertical ? Math.PI/2 : 0, 34, st.bolted[i]);
  });

  // relief valve
  if (st.relief) reliefValve(RELIEF_PAD[0], RELIEF_PAD[1]-13, 1.15, { venting: st.venting });
  else if (st.phase !== 'run'){
    g.save();
    g.strokeStyle=`rgba(245,181,61,${.4+Math.sin(T/12)*.2})`; g.lineWidth=2.4;
    g.setLineDash([6,6]);
    g.beginPath(); g.arc(RELIEF_PAD[0], RELIEF_PAD[1]-34, 26, 0, 7); g.stroke();
    g.setLineDash([]); g.restore();
    txt('relief', RELIEF_PAD[0], RELIEF_PAD[1]-66, 12, 'rgba(245,181,61,.75)');
  }

  // the mover, or its empty pad
  if (st.mover){
    const m = FLU_MOVERS.find(m=>m.id===st.mover);
    m.draw(MOVER_PAD[0], MOVER_PAD[1]+38, 1.05, { spin: st.spin });
  } else {
    g.save();
    g.strokeStyle=`rgba(35,166,224,${.35+Math.sin(T/11)*.18})`; g.lineWidth=3;
    g.setLineDash([9,8]);
    rr(MOVER_PAD[0]-58, MOVER_PAD[1]-36, 116, 74, 8); g.stroke();
    g.setLineDash([]); g.restore();
    txt('?', MOVER_PAD[0], MOVER_PAD[1], 34, 'rgba(35,166,224,.6)');
    // the ghost outline an experienced engineer already sees
    if (st.ghost){
      g.save(); g.globalAlpha = .30 + Math.sin(T/13)*.10;
      const m = FLU_MOVERS.find(m=>m.id===rig.right);
      m.draw(MOVER_PAD[0], MOVER_PAD[1]+38, 1.05, {});
      g.restore();
    }
  }

  // flow inside the finished line
  const allIn = st.placed.every(Boolean) && st.bolted.every(Boolean);
  if (allIn && st.flow > 0){
    const pts = [[150,520],[MOVER_PAD[0],520],[390,520],[520,520],[520,380],
                 [880,380],[880,520],[1040,520],[1130,520]];
    flowDots(pts, 0.6 + st.flow*3.2, clamp(st.flow*1.4,0,1),
             liquidLine ? 'rgba(120,205,245,.95)' : 'rgba(215,235,245,.75)',
             liquidLine ? 5 : 4);
  }

  // the open leak before anything is connected
  if (!st.placed[0] && st.phase !== 'run'){
    if (liquidLine){ emitDrip(MOVER_PAD[0]-40, 532, 1); }
    else if (Math.random()<.6) emitSteam(MOVER_PAD[0]-40, 520, 1, {vx:1.4, speed:1.3});
  }
}

/* ============================================================
   scene
   ============================================================ */
const S_flu = {
  enter(){
    Music.play('work');
    Hint.begin('flu');
    this.px=60; this.py=608; this.face='right'; this.walkT=0; this.stepT=0;
    this.mode='walkin'; this.ri=-1;
    this.rigs = FLU_RIGS.map(()=>({
      placed:[false,false,false,false,false], bolted:[false,false,false,false,false,false],
      mover:null, relief:false, flow:0, spin:0, power:0, phase:'build',
      venting:false, tried:false, ghost:false, re:null, done:false
    }));
    this.pts=0; this.safePts=0; this.scored=false;
    this.convo=null; this.fadiSaid=false; this.note=null; this.noteT=0;
    this.mutter = MUTTER.flu[skill('flu')]; this.mutterT=210;
    after(60, ()=>{ this.mode='free'; });
  },
  exit(){
    if (!this.scored){ this.scored=true;
      award('flu', this.pts, 8); award('saf', this.safePts, 2);
      if (this.rigs.every(r=>r.done)) G.done.flu = true; }
  },
  camX(){ return clamp(this.px - W/2, 0, FLU_ROOM - W); },
  say(t, frames=220){ this.note = t; this.noteT = frames; },

  draw(){
    if (this.mode === 'rig'){ this.drawRig(); return; }
    const cam = this.camX();

    g.fillStyle='#081c26'; g.fillRect(0,0,W,H);
    g.save(); g.translate(-cam,0);
    const wall = g.createLinearGradient(0,0,0,614);
    wall.addColorStop(0,'#123a4c'); wall.addColorStop(.6,'#0e2d3c');
    wall.addColorStop(1,'#0a2130');
    g.fillStyle=wall; g.fillRect(0,0,FLU_ROOM,614);
    for (let i=0;i<FLU_ROOM/58;i++){ g.fillStyle = i%2?'rgba(255,255,255,.02)':'rgba(0,0,0,.04)';
      g.fillRect(i*58,0,29,614); }
    // pipe racks everywhere
    for (let i=0;i<5;i++)
      pipeSeg(0, 40+i*22, FLU_ROOM, 40+i*22, 15,
              {shell: i%2?'#2d6683':'#336f8d', inner: i%2?'#1c475e':'#215068'});
    flowDots([[0,40],[FLU_ROOM,40]], 1.8, .55, 'rgba(150,235,255,.5)', 3);
    for (let i=0;i<7;i++){ g.fillStyle='#10394f'; g.fillRect(i*280+60, 150, 17, 90); }

    // floor
    const fl = g.createLinearGradient(0,614,0,H);
    fl.addColorStop(0,'#173c4e'); fl.addColorStop(1,'#08202d');
    g.fillStyle=fl; g.fillRect(0,614,FLU_ROOM,H-614);
    g.fillStyle='rgba(245,181,61,.4)'; g.fillRect(0,616,FLU_ROOM,4);
    for (let i=0;i<FLU_ROOM/60;i++){ g.strokeStyle='rgba(255,255,255,.03)'; g.lineWidth=2;
      g.beginPath(); g.moveTo(i*60,620); g.lineTo(i*60-70,H); g.stroke(); }

    /* the cheat-sheet table by the door */
    g.fillStyle='#3a5666'; rr(180, 556, 130, 14, 4); g.fill();
    g.fillStyle='#2b4250'; rr(190, 570, 110, 44, 3); g.fill();
    if (!G.sheet){
      cheatSheet(245, 534, 0.46, null);
      const near = Math.abs(this.px-245) < 92;
      if (near){
        g.strokeStyle=`rgba(245,181,61,${.5+Math.sin(T/11)*.3})`; g.lineWidth=3;
        rr(190, 492, 112, 84, 5); g.stroke();
      }
    } else txt('sheet taken', 245, 534, 13, '#8fe8b8');

    /* the two rigs, seen from the walkway */
    let nearR = -1;
    FLU_RIGS.forEach((r,i)=>{
      const st = this.rigs[i];
      // skid frame
      g.fillStyle='#1b4257'; rr(r.x-190, 300, 380, 250, 8); g.fill();
      g.strokeStyle= st.done ? '#3fd07f' : '#2f6a86'; g.lineWidth=3;
      rr(r.x-190, 300, 380, 250, 8); g.stroke();
      // a miniature of the line inside the frame
      g.save(); g.beginPath(); rr(r.x-186, 304, 372, 242, 6); g.clip();
      g.fillStyle='#0b2836'; g.fillRect(r.x-186,304,372,242);
      const mc = r.fluid==='liquid' ? {shell:'#4f7f9a',inner:'#2f5568'} : {shell:'#8a9aa6',inner:'#5a6a76'};
      pipeSeg(r.x-170, 470, r.x-60, 470, 13, mc);
      if (st.done){
        pipeSeg(r.x-60, 470, r.x+40, 470, 13, mc);
        pipeSeg(r.x+40, 470, r.x+40, 370, 13, mc);
        pipeSeg(r.x+40, 370, r.x+170, 370, 13, mc);
        flowDots([[r.x-170,470],[r.x+40,470],[r.x+40,370],[r.x+170,370]], 2.4, 1,
                 r.fluid==='liquid'?'rgba(120,205,245,.9)':'rgba(215,235,245,.7)', 3);
      } else {
        g.save(); g.strokeStyle='rgba(35,166,224,.3)'; g.lineWidth=13;
        g.setLineDash([9,8]);
        g.beginPath(); g.moveTo(r.x-60,470); g.lineTo(r.x+40,470);
        g.lineTo(r.x+40,370); g.lineTo(r.x+170,370); g.stroke();
        g.setLineDash([]); g.restore();
        if (r.fluid==='gas'){ if (Math.random()<.4) emitSteam(r.x-56, 470, 1, {vx:1.2}); }
        else if (Math.random()<.4) emitDrip(r.x-56, 478, 1);
      }
      g.restore();
      panel(r.x-130, 244, 260, 40, 'rgba(5,22,33,.94)',
            st.done ? 'rgba(63,208,127,.6)' : 'rgba(240,160,42,.55)', 8);
      txt(r.title, r.x, 264, 15, st.done ? '#8fe8b8' : '#f5cf8a');
      if (this.mode==='free' && !st.done && Math.abs(this.px - r.x) < 150) nearR = i;
    });

    /* Fadi, hovering anxiously between the two rigs */
    const fx = 920;
    const anxious = !this.rigs.every(r=>r.done);
    drawPerson(NPCS.operator, fx, 606, 2.0, {
      dir: this.px > fx ? 'right' : 'left',
      face: anxious ? 'worry' : 'happy', seed:3,
      sweat: anxious ? 1 : 0,
      armF: anxious ? -1.1 + Math.sin(T/13)*0.3 : undefined, armFBend: anxious ? 1.1 : undefined
    });
    txt(NPCS.operator.name, fx, 638, 13, 'rgba(234,244,250,.55)');
    if (anxious && !this.fadiSaid){
      bubble('Please tell me you know pipes. Both lines are open and I am out of ideas.',
             fx, 500, {w:300, size:16, pop:1});
    }

    drawParts();
    drawPerson(hero, this.px, this.py, 2.0, {
      dir:this.face, walk:this.walkT, seed:5,
      holdDraw: G.sheet ? (c)=>{ c.save(); c.rotate(-.3); c.fillStyle='#f6f2e2';
        rr(-5,-7,11,14,1.5); c.fill(); c.strokeStyle='#cfc6ac'; c.lineWidth=1; c.stroke(); c.restore(); } : null,
      ppe:{ hat:true, goggles:G.ppe.goggles, coat:G.ppe.coat }
    });

    // exit
    g.fillStyle='#08202d'; rr(FLU_ROOM-110, 400, 92, 214, 6); g.fill();
    g.strokeStyle = this.rigs.every(r=>r.done) ? '#3fd07f' : 'rgba(130,160,175,.4)';
    g.lineWidth=3; rr(FLU_ROOM-110, 400, 92, 214, 6); g.stroke();
    txt('EXIT', FLU_ROOM-64, 376, 16,
        this.rigs.every(r=>r.done)?'#3fd07f':'rgba(160,190,205,.5)');

    g.restore();

    /* movement */
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
        this.px = clamp(this.px + dx*3.6*dt, 46, FLU_ROOM-46);
        this.py = clamp(this.py + dy*1.9*dt, 590, 676);
        this.walkT += dt*2.4;
        this.stepT+=dt; if (this.stepT>12){this.stepT=0;SFX.step();}
      } else this.walkT = 0;

      if (!G.sheet && Math.abs(this.px-245)<92){
        this.prompt(245-cam, 'SPACE   —   take the Reynolds sheet', '#f5b53d');
        if (keyPressed(' ','Enter','Space')){
          G.sheet=true; SFX.pickup(); toast('Reynolds ranges in your pocket.');
        }
      } else if (nearR>=0){
        const r = FLU_RIGS[nearR];
        this.prompt(r.x-cam, 'SPACE   —   work on ' + r.title.split('·')[0].trim(), '#f0a02a');
        if (keyPressed(' ','Enter','Space')) this.openRig(nearR);
      }
      if (this.px > FLU_ROOM-80 && this.rigs.every(r=>r.done)) go(S_hub, 'fade');
    }

    if (this.mutterT>0){ this.mutterT -= dt;
      if (this.mutterT<180) bubble(this.mutter, this.px-cam, this.py-196, {w:300,size:17,pop:1}); }

    if (Hint.draw(76, 150, 210, 250))
      Hint.use('A gas needs a compressor. A liquid needs a pump. Fit the relief valve before you pressurise anything.');

    vignette(.34);
    const n = this.rigs.filter(r=>r.done).length;
    hudEl.textContent = `Piping Circuit Bay   ·   lines ${n}/2   ·   ` +
      (G.sheet ? 'Reynolds sheet in hand' : 'no cheat sheet yet');
  },

  prompt(sx, label, col){
    panel(sx-160, 176, 320, 42, 'rgba(5,22,33,.96)', col, 10);
    txt(label, sx, 198, 16, '#eaf4fa');
  },

  openRig(i){
    SFX.click();
    this.mode='rig'; this.ri=i;
    const st = this.rigs[i];
    st.phase='build';
    if (skill('flu')===2) st.ghost = true;
    this.say(FLU_RIGS[i].brief + (skill('flu')===2 ? '  ' + FLU_RIGS[i].strong
           : skill('flu')===0 ? '  ' + FLU_RIGS[i].weak : ''), 320);
  },

  /* ---------------- the rig view ---------------- */
  drawRig(){
    const rig = FLU_RIGS[this.ri], st = this.rigs[this.ri];

    /* backdrop */
    const bg = g.createLinearGradient(0,0,0,H);
    bg.addColorStop(0,'#0d3145'); bg.addColorStop(1,'#061722');
    g.fillStyle=bg; g.fillRect(0,0,W,H);
    for (let i=0;i<W/48;i++){ g.fillStyle = i%2?'rgba(255,255,255,.015)':'rgba(0,0,0,.05)';
      g.fillRect(i*48,0,24,H); }
    g.fillStyle='#0a2431'; g.fillRect(0,600,W,H-600);
    g.fillStyle='rgba(245,181,61,.35)'; g.fillRect(0,600,W,4);

    txt(rig.title, W/2, 44, 26, '#f5cf8a');

    drawRigLine(st, rig);
    drawParts();

    /* --- phase: build the line --- */
    if (st.phase === 'build'){
      // pipe slots
      PIPE_SEGS.forEach((s,i)=>{
        if (st.placed[i]) return;
        const cx = (s.a[0]+s.b[0])/2, cy = (s.a[1]+s.b[1])/2;
        const w = Math.abs(s.b[0]-s.a[0]) || 34, h = Math.abs(s.b[1]-s.a[1]) || 34;
        const z = zone(cx-w/2-8, cy-h/2-8, w+16, h+16);
        if (z.hover){ g.strokeStyle='#23a6e0'; g.lineWidth=3;
          rr(cx-w/2-8, cy-h/2-8, w+16, h+16, 8); g.stroke(); }
        if (z.clicked){
          st.placed[i]=true; SFX.place();
          for (let k=0;k<10;k++) spawn({x:cx+rnd(-w/2,w/2), y:cy+rnd(-h/2,h/2),
            vx:rnd(-1.6,1.6), vy:rnd(-1.8,-.3), life:rnd(22,40), max:40,
            size:rnd(5,12), col:'rgba(220,226,214,.5)', kind:'puff'});
        }
      });
      const allPipes = st.placed.every(Boolean);
      // flange bolting, only once the pipes are in
      if (allPipes){
        JOINTS.forEach((j,i)=>{
          if (st.bolted[i]) return;
          const z = zone(j[0]-24, j[1]-24, 48, 48);
          g.save();
          g.strokeStyle = z.hover ? '#f5b53d' : `rgba(245,181,61,${.4+Math.sin(T/10+i)*.2})`;
          g.lineWidth = z.hover ? 4 : 2.6;
          g.beginPath(); g.arc(j[0], j[1], 24, 0, 7); g.stroke(); g.restore();
          if (z.clicked){
            st.bolted[i]=true; SFX.bolt();
            for (let k=0;k<7;k++) emitSpark(j[0], j[1], 1, '#ffd88a');
          }
        });
      }
      // relief valve
      if (!st.relief){
        const z = zone(RELIEF_PAD[0]-30, RELIEF_PAD[1]-62, 60, 60);
        if (z.hover){ g.strokeStyle='#f5b53d'; g.lineWidth=3;
          g.beginPath(); g.arc(RELIEF_PAD[0], RELIEF_PAD[1]-34, 28, 0, 7); g.stroke(); }
        if (z.clicked){ st.relief=true; SFX.place(); toast('Relief valve fitted. Good.'); }
      }
      // mover
      if (!st.mover && allPipes && st.bolted.every(Boolean)){
        const z = zone(MOVER_PAD[0]-60, MOVER_PAD[1]-40, 120, 80);
        if (z.hover){ g.strokeStyle='#23a6e0'; g.lineWidth=3;
          rr(MOVER_PAD[0]-60, MOVER_PAD[1]-40, 120, 80, 8); g.stroke(); }
        if (z.clicked) st.phase = 'choose';
      }

      /* the instruction strip */
      const step = !allPipes ? 'Click each dashed run to drop a pipe section in.'
        : !st.bolted.every(Boolean) ? 'Now bolt a flange at every joint. Click the rings.'
        : !st.mover ? 'The line is built but nothing will move on its own. Click the empty pad.'
        : '';
      panel(W/2-420, 86, 840, 58, 'rgba(4,18,28,.94)', 'rgba(35,166,224,.5)');
      txt(step, W/2, 115, 19, '#dceaf2','center',400);

      if (!st.relief) txt('the dashed circle on the top run is a relief valve mount',
                          W/2, 168, 14, 'rgba(245,181,61,.75)','center',400);
    }

    /* --- phase: choose the mover --- */
    if (st.phase === 'choose'){
      shade(.55);
      txt('WHAT GOES ON THE PAD?', W/2, 120, 30, '#f5cf8a');
      txt(rig.fluid === 'gas' ? 'this line carries gas' : 'this line carries water',
          W/2, 156, 19, '#cfe6f2','center',400);
      const n=FLU_MOVERS.length, cw=300, gap=24, x0=(W-(n*cw+(n-1)*gap))/2;
      FLU_MOVERS.forEach((m,i)=>{
        const x=x0+i*(cw+gap), y=230, h=280;
        const z = zone(x,y,cw,h);
        const ghost = st.ghost && m.id===rig.right;
        const bad = skill('flu')===0 && m.id===rig.weakPick;
        g.save(); if (z.hover){ g.shadowColor='#23a6e0'; g.shadowBlur=22; }
        g.fillStyle = z.hover ? 'rgba(14,52,72,.98)' : 'rgba(7,28,40,.96)';
        rr(x, z.hover?y-5:y, cw, h, 12); g.fill(); g.restore();
        g.strokeStyle = ghost ? `rgba(63,208,127,${.5+Math.sin(T/10)*.35})`
                      : bad ? `rgba(238,95,110,${.45+Math.sin(T/10)*.3})`
                      : z.hover ? '#23a6e0' : 'rgba(35,166,224,.3)';
        g.lineWidth = (ghost||bad) ? 3.4 : 2;
        rr(x, z.hover?y-5:y, cw, h, 12); g.stroke();
        const yy = z.hover?y-5:y;
        g.save(); g.translate(x+cw/2, yy+206); g.scale(1.25,1.25);
        m.draw(0,0,1,{ spin: z.hover ? T*0.3 : 0 }); g.restore();
        txt(m.name, x+cw/2, yy+230, 19, z.hover?'#fff':'#cfe6f2');
        txt(m.sub,  x+cw/2, yy+252, 14, 'rgba(159,216,239,.7)','center',400);
        if (z.clicked){ st.mover = m.id; st.phase='build'; SFX.place();
          st.moverOK = (m.id === rig.right);
          for (let k=0;k<14;k++) spawn({x:MOVER_PAD[0]+rnd(-50,50), y:MOVER_PAD[1]+rnd(-20,30),
            vx:rnd(-2,2), vy:rnd(-2.4,-.4), life:rnd(24,44), max:44,
            size:rnd(6,14), col:'rgba(220,226,214,.5)', kind:'puff'});
        }
      });
      if (button('BACK', 40, H-64, 160, 44)) st.phase='build';
      return;
    }

    /* --- the start button --- */
    const ready = st.placed.every(Boolean) && st.bolted.every(Boolean) && st.mover;
    if (st.phase === 'build' && ready){
      if (button('START THE LINE', W/2-140, H-72, 280, 48, {col:'#3fd07f', size:20})){
        st.phase='run'; st.power=0; st.flow=0; SFX.click(); this.noteT = 0;
        if (!st.relief) this.say('No relief valve on a line you are about to pressurise. Noted.', 200);
      }
    }

    /* --- phase: run and ramp --- */
    if (st.phase === 'run'){
      st.spin += dt * st.power * 0.34;
      // the mover only actually moves the fluid if it is the right one
      const target = st.moverOK ? st.power : st.power * 0.06;
      st.flow += (target - st.flow) * 0.08 * dt;

      // readouts
      const Re = Math.round(st.flow * rig.reVal * 1.12);
      panel(W/2-370, 76, 740, 100, 'rgba(4,18,28,.95)', 'rgba(35,166,224,.5)');
      txt('POWER', W/2-232, 102, 13, '#9fd8ef');
      g.fillStyle='rgba(255,255,255,.1)'; rr(W/2-292, 118, 240, 16, 8); g.fill();
      g.fillStyle = st.power>0.82 ? '#ee5f6e' : '#3fd07f';
      rr(W/2-292, 118, 240*clamp(st.power,0,1), 16, 8); g.fill();
      g.strokeStyle='rgba(63,208,127,.85)'; g.lineWidth=2;
      g.strokeRect(W/2-292+240*0.55, 115, 240*0.27, 22);
      txt('hold it in the green', W/2-172, 150, 12, 'rgba(159,216,239,.6)','center',400);

      txt('FLOW', W/2+92, 100, 13, '#9fd8ef');
      txt(st.flow < .05 ? 'stopped' : Math.round(st.flow*100)+' %',
          W/2+92, 128, 22, st.flow<.05 ? '#ee5f6e' : '#8fe8b8');
      txt('REYNOLDS', W/2+248, 100, 13, '#9fd8ef');
      txt(st.flow<.05 ? '—' : Re.toLocaleString(), W/2+248, 128, 22, '#f5cf8a');

      // ramp controls
      if (button('–', W/2-350, 106, 46, 40, {size:24})) st.power = clamp(st.power-0.08,0,1);
      if (button('+', W/2-42,  106, 46, 40, {size:24})) st.power = clamp(st.power+0.08,0,1);
      if (keys.ArrowUp)   st.power = clamp(st.power + 0.012*dt, 0, 1);
      if (keys.ArrowDown) st.power = clamp(st.power - 0.012*dt, 0, 1);

      // over-pressure
      st.venting = st.power > 0.88;
      if (st.venting){
        shake(2.4);
        if (!st.relief){ if (Math.random()<.05) SFX.alarm(); flash(.08,'255,80,80'); }
      }

      // the wrong mover behaves badly and says so
      if (!st.moverOK && st.power > 0.2){
        if (Math.random()<.06) SFX.bad();
        txt(rig.right==='comp' ? 'the pump is cavitating, it has nothing to grip'
                               : 'the compressor is slamming against solid water',
            W/2, 220, 19, '#ee5f6e','center',400);
        if (Math.random()<.3) emitSpark(MOVER_PAD[0]+rnd(-20,20), MOVER_PAD[1]+10, 1, '#ff9a6a');
        shake(1.6);
      }

      const inBand = st.power >= 0.55 && st.power <= 0.82;
      const flowing = st.moverOK && inBand && st.flow > 0.5;

      if (!st.moverOK && st.power > 0.5 && !st.tried){
        st.tried = true;
        if (skill('flu') >= 1) { st.ghost = true;
          this.say('That is the wrong machine for this fluid. I can see what it should be now.', 240); }
        else this.say('Why is it not moving? It is plugged in. It is spinning. I am out of ideas.', 240);
      }

      if (flowing && !st.reAsk){
        st.reAsk = true;
        after(40, ()=>{ st.phase='re'; });
      }

      panel(W/2-420, H-104, 840, 56, 'rgba(4,18,28,.94)', 'rgba(35,166,224,.5)');
      txt(!st.moverOK ? 'this is not working. Put the right machine on the pad.'
          : st.power < 0.55 ? 'not enough power. Ramp it up.'
          : st.power > 0.82 ? 'too much. You are lifting the relief valve. Back it off.'
          : 'that is the band. Hold it there.',
          W/2, H-76, 19,
          !st.moverOK ? '#ee5f6e' : (st.power>=0.55 && st.power<=0.82) ? '#8fe8b8' : '#f5cf8a',
          'center', 400);

      if (!st.moverOK && button('SWAP THE MACHINE', 40, H-72, 250, 44, {col:'#ee5f6e', size:16})){
        st.phase='choose'; st.power=0; st.flow=0;
      }
      if (button('STOP', W-190, H-72, 150, 44, {size:16})){ st.phase='build'; st.power=0; st.flow=0; }
    }

    /* --- phase: tick the Reynolds box --- */
    if (st.phase === 're'){
      shade(.6);
      const Re = Math.round(rig.reVal);
      txt('THE LINE IS RUNNING', W/2, 88, 30, '#3fd07f');
      txt('measured Reynolds number   ' + Re.toLocaleString(), W/2, 128, 22, '#f5cf8a','center',400);
      if (G.sheet){
        cheatSheet(W/2, 330, 1.35, st.re);
        ['laminar','transition','turbulent'].forEach((k,i)=>{
          const z = zone(W/2-152, 268 + i*43, 300, 40);
          if (z.hover){ g.strokeStyle='#23a6e0'; g.lineWidth=2.4;
            rr(W/2-152, 268+i*43, 300, 40, 6); g.stroke(); }
          if (z.clicked && !st.re){
            st.re = k; SFX.click();
            if (k === rig.re){ this.pts += 1; SFX.good(); toast('Correct regime.'); }
            else { SFX.bad(); toast('Not that one. Check the ranges.'); }
            after(70, ()=> this.finishRig());
          }
        });
        txt('click a row to tick it', W/2, 470, 15, 'rgba(207,230,242,.6)','center',400);
      } else {
        panel(W/2-320, 250, 640, 130, 'rgba(48,26,10,.95)', 'rgba(245,181,61,.6)');
        txt('You never picked up the cheat sheet.', W/2, 292, 22, '#f5cf8a');
        txt('No ranges, no regime, no bonus. It is on the table by the door.',
            W/2, 328, 17, '#dceaf2','center',400);
        if (button('FINE', W/2-90, 400, 180, 44)) this.finishRig();
      }
      return;
    }

    /* the engineer's running commentary, as a caption along the bottom */
    if (this.noteT > 0){
      this.noteT -= dt;
      const cw = 700, cx = W/2 - cw/2, cy = H - 214;
      panel(cx, cy, cw, 58, 'rgba(4,18,28,.96)', 'rgba(35,166,224,.55)');
      const nw = 14 + hero.name.length * 8.4;
      g.fillStyle = 'rgba(35,166,224,.92)';
      rr(cx + 18, cy - 12, nw, 22, 7); g.fill();
      txt(hero.name, cx + 18 + nw/2, cy - 1, 14, '#04121a');
      wrapText(this.note, cx + 24, cy + 29, cw - 48, 21, 17, '#dceaf2', 'left', 400);
    }

    if (Hint.draw(W-80, 150, W-220, 250))
      Hint.use(rig.fluid==='gas'
        ? 'Gas is compressible. The machine that moves it is named after that.'
        : 'Water will not compress. It has to be pushed, not squeezed.');

    if (st.phase === 'build' && button('LEAVE THE RIG', 40, H-72, 200, 44, {size:16})){
      this.mode='free';
    }
    hudEl.textContent = rig.title + '   ·   ' +
      (st.placed.filter(Boolean).length + '/5 pipes, ' +
       st.bolted.filter(Boolean).length + '/6 flanges' +
       (st.relief ? ', relief fitted' : ', no relief valve'));
  },

  finishRig(){
    const st = this.rigs[this.ri], rig = FLU_RIGS[this.ri];
    st.done = true;
    if (st.moverOK) this.pts += 2;
    this.pts += 1;                       // held the line in the band
    if (st.relief) this.safePts += 1;
    st.phase='build';
    this.mode='free';
    SFX.great();
    toast(rig.title.split('·')[0].trim() + ' is running.');
    if (this.rigs.every(r=>r.done)) toast('Both lines running. Fadi can breathe again.');
  }
};
