/* ============================================================
   Reactor Design Lab — three clients, one phone, many ways to fail
   ============================================================ */
const REA_ROOM = 2200;

const REA_TYPES = [
  { id:'batch', name:'Batch reactor',      sub:'one charge at a time', draw:unitBatch,    sc:0.74 },
  { id:'pbr',   name:'Packed bed reactor', sub:'solid catalyst, continuous', draw:unitPacked, sc:0.72 },
  { id:'mem',   name:'Membrane reactor',   sub:'pulls product out as it forms', draw:unitMembrane, sc:0.76 }
];
const REA_THERM = [
  { id:'cool', name:'Cooling jacket', sub:'takes heat away' },
  { id:'heat', name:'Heating jacket', sub:'puts heat in' },
  { id:'none', name:'No jacket',      sub:'leave it alone' }
];
const REA_SCALE = [
  { id:'low',  name:'Low rate',    sub:'a test amount' },
  { id:'med',  name:'Medium rate', sub:'a steady batch' },
  { id:'high', name:'High rate',   sub:'all day, every day' }
];
const reaType = id => REA_TYPES.find(t=>t.id===id);

const REA_CLIENTS = [
  { id:'nadia', npc:'pharm', x:520, product:'pill',
    intro:[
      'I am trying to make a new medicine. I am a pharmacist, not an engineer.',
      'Nobody will tell me which reactor to ask for. Can you help?'
    ],
    asks:[
      { key:'type',  q:'Have you run this reaction before?',
        hardQ:'Tell me how you run it at the moment.',
        a:'Never. It is brand new. I am still changing the recipe every week.',
        hardA:'I mix it, I wait, I pour it out and wash the flask. Then I change one thing and do it again.',
        good:'New chemistry, recipe still moving. One charge at a time, so we can stop and look. Batch.',
        bad:'Brand new? Then run it continuously. We will learn faster if it never stops.',
        hardBad:'Washing a flask between every run? Wasteful. Get one enormous pipe and never stop it.' },
      { key:'therm', q:'While it runs, does the flask feel warm or cold?',
        hardQ:'What is the room like while it is running?',
        a:'Warm. Warm enough that I stopped holding it.',
        hardA:'Stuffy. I have started opening the window halfway through, even in winter.',
        good:'It is giving off heat. Exothermic. We take that heat out with a cooling jacket.',
        bad:'Warm means it likes heat. Give it more. Heating jacket.',
        hardBad:'The room is stealing the heat. We fight back with a heating jacket.' },
      { key:'scale', q:'How much do you actually need?',
        hardQ:'What does your paperwork allow you to make?',
        a:'Barely anything. Enough to fill one small vial for testing.',
        hardA:'The regulator has me capped at twenty grams per run until the trial clears.',
        good:'Tiny and experimental. Low rate. We are not building a factory yet.',
        bad:'Small today, huge tomorrow. Order the high rate now and save a trip.',
        hardBad:'Twenty grams is an insult to this refinery. Maximum rate. We ask forgiveness later.' }
    ],
    right:{ type:'batch', therm:'cool', scale:'low' },
    praise:'Small, new, and it makes its own heat. Batch reactor with cooling, low rate.' },

  { id:'hakim', npc:'fuels', x:1100, product:'fuel',
    intro:[
      'My reaction is slow. Painfully slow. It needs a catalyst to get anywhere.',
      'And it has to keep running. This line does not stop.'
    ],
    asks:[
      { key:'type',  q:'You said it needs a catalyst. A solid one?',
        hardQ:'Walk me through a normal week on that unit.',
        a:'Solid pellets, yes. And the feed has to keep flowing through it, all day.',
        hardA:'Monday I load a bed of pellets. Friday I unload it. In between the feed never stops once.',
        good:'Solid catalyst with continuous flow through it. That is a packed bed.',
        bad:'Solid catalyst? Then we stir it in a pot and scoop it out later. Batch.',
        hardBad:'Loads on Monday, unloads on Friday. That is just one very long batch, surely.' },
      { key:'therm', q:'Does the vessel warm up or go cold while it runs?',
        hardQ:'Anything odd about the outside of the vessel?',
        a:'It goes cold. The whole skid gets cold enough to sweat.',
        hardA:'There is frost on the pipework by mid morning. In August. The insulation crew think I am mad.',
        good:'It is drinking heat. Endothermic. We have to feed it, so heating jacket.',
        bad:'Cold is good, cold is safe. Add more cooling and it will be even safer.',
        hardBad:'Frost in August? Free air conditioning. Add more cooling and sell the surplus.' },
      { key:'scale', q:'What rate does the plant need?',
        hardQ:'What is downstream of you?',
        a:'Everything you can give me. This runs twenty four hours.',
        hardA:'A tank farm that takes forty cubic metres an hour and has never once been full.',
        good:'Continuous fuel duty. High rate.',
        bad:'Twenty four hours is a long time, so go low and let it build up slowly.',
        hardBad:'A tank that never fills is a leak, not a demand. Go low until somebody fixes it.' }
    ],
    right:{ type:'pbr', therm:'heat', scale:'high' },
    praise:'Slow reaction, solid catalyst, continuous, and it absorbs heat. Packed bed with heating, high rate.' },

  { id:'rana', npc:'chem', x:1690, product:'crystal',
    intro:[
      'My reaction starts fine and then just... stops. Every time.',
      'The product keeps piling up inside and the whole thing stalls.'
    ],
    asks:[
      { key:'type',  q:'The product builds up and stalls it. Every batch?',
        hardQ:'What exactly happens when it stalls?',
        a:'Every single one. If I could take the product out as it forms, it would keep going.',
        hardA:'It runs beautifully for ten minutes and then the rate just dies. If I drain some off and put the rest back, it starts again.',
        good:'Equilibrium held back by product. Pull it out through a membrane as it forms.',
        bad:'It stalls? Then just run it harder in a bigger pot. Batch, but angry.',
        hardBad:'Dies after ten minutes? Then we run it for nine. Batch. Next question.' },
      { key:'therm', q:'Warm or cold while it runs?',
        hardQ:'What does your cooling water do across the jacket?',
        a:'Mildly warm. Nothing dramatic, but it is definitely warm.',
        hardA:'It comes out two degrees warmer than it went in. Only two. Every single run.',
        good:'Mildly exothermic. Gentle cooling will hold it steady.',
        bad:'Mildly warm is basically nothing. Skip the jacket entirely.',
        hardBad:'Two degrees is a rounding error. Skip the jacket, save my uncle some money.' },
      { key:'scale', q:'How much do you need per run?',
        hardQ:'What do you actually ship?',
        a:'It is a specialty product. Steady and moderate, not huge.',
        hardA:'Four drums a month. It has been four drums a month for six years and nobody has asked for more.',
        good:'Specialty duty. Medium rate.',
        bad:'Specialty means expensive, so make as much as physically possible.',
        hardBad:'Four drums a month for six years? No ambition. Maximum rate, starting today.' }
    ],
    right:{ type:'mem', therm:'cool', scale:'med' },
    praise:'Product inhibition, solved by pulling it out as it forms. Membrane reactor, gentle cooling, medium rate.' }
];

/* ---------- the product that slides out ---------- */
function reaProduct(kind, x, y, quality, scale){
  /* quality: 'good' | 'wrongtype' ; scale: 'low' | 'ok' | 'high' */
  const s = scale==='high' ? 1.9 : scale==='low' ? 0.42 : 1;
  g.save(); g.translate(x,y); g.scale(s,s);
  if (quality === 'wrongtype'){
    g.fillStyle='rgba(120,50,165,.85)';
    g.beginPath(); g.ellipse(0,-9, 30, 16, 0, 0, 7); g.fill();
    g.fillStyle='rgba(170,90,210,.8)';
    for (let i=0;i<5;i++){
      g.beginPath(); g.arc(-18+i*9, -14 + Math.sin(T/11+i)*4, 7.5, 0, 7); g.fill();
    }
    g.fillStyle='rgba(210,150,240,.6)';
    g.beginPath(); g.arc(-8,-18, 4, 0, 7); g.fill();
    if (Math.random()<.3) emitGoo(x + rnd(-24,24)*s, y-6, 1);
  } else if (kind === 'pill'){
    for (let i=0;i<5;i++){
      g.save(); g.translate(-22+i*11, -8 - (i%2)*6); g.rotate(nz(i)*2);
      g.fillStyle='#f4f7fa'; rr(-7,-4,14,8,4); g.fill();
      g.fillStyle='#e05a7a'; rr(-7,-4,7,8,4); g.fill();
      g.strokeStyle='rgba(120,140,155,.6)'; g.lineWidth=1; rr(-7,-4,14,8,4); g.stroke();
      g.restore();
    }
  } else if (kind === 'fuel'){
    g.fillStyle='#8a6a2a'; rr(-22,-34,44,34,5); g.fill();
    g.fillStyle='#e0a832'; rr(-18,-30,36,26,3); g.fill();
    g.save(); g.beginPath(); rr(-18,-30,36,26,3); g.clip();
    liquid(-18,-20,36,20,{r:0,c1:'#b07a18',c2:'#f0c85a'});
    g.restore();
    g.strokeStyle='#6a4f1c'; g.lineWidth=2; rr(-22,-34,44,34,5); g.stroke();
    txt('FUEL', 0, -16, 10, '#3a2a0a');
  } else {
    for (let i=0;i<4;i++){
      g.save(); g.translate(-18+i*12, -10); g.rotate(T/120 + i);
      g.fillStyle='rgba(120,230,255,.9)';
      star(0,0,9,4.4,6); g.fill();
      g.fillStyle='rgba(255,255,255,.7)'; star(0,0,4.4,2,6); g.fill();
      g.restore();
    }
    if (Math.random()<.2) emitSpark(x+rnd(-22,22)*s, y-12, 1, '#bff2ff');
  }
  g.restore();
  const lab = quality==='wrongtype' ? 'that is not medicine'
            : scale==='high' ? 'far too much of it'
            : scale==='low'  ? 'barely a trace' : 'exactly right';
  txt(lab, x, y+22, 13, quality==='good' && scale==='ok' ? '#8fe8b8' : '#e8a0a0');
}

/* ---------- the ordering phone ---------- */
function drawPhone(x, y, sel, onPick){
  const pw = 470, ph = 618;
  g.save(); g.shadowColor='rgba(0,0,0,.6)'; g.shadowBlur=30; g.shadowOffsetY=10;
  g.fillStyle='#10161c'; rr(x-pw/2, y-ph/2, pw, ph, 30); g.fill(); g.restore();
  g.strokeStyle='#2c3a46'; g.lineWidth=3; rr(x-pw/2, y-ph/2, pw, ph, 30); g.stroke();
  // screen
  const sx = x-pw/2+14, sy = y-ph/2+38, sw = pw-28, sh = ph-70;
  g.fillStyle='#f2f5f8'; rr(sx, sy, sw, sh, 18); g.fill();
  // notch + status bar
  g.fillStyle='#10161c'; rr(x-46, y-ph/2+6, 92, 18, 9); g.fill();
  txt('09:41', sx+30, sy+16, 12, '#8a97a4');
  txt('UNIT-MART', x, sy+16, 13, '#1f6f9c');
  txt('4G', sx+sw-22, sy+16, 12, '#8a97a4');

  const rows = [
    { key:'type',  label:'REACTOR',    opts:REA_TYPES },
    { key:'therm', label:'TEMPERATURE', opts:REA_THERM },
    { key:'scale', label:'RATE',        opts:REA_SCALE }
  ];
  let yy = sy + 32;
  for (const row of rows){
    txt(row.label, sx+16, yy+9, 12, '#5f7280','left');
    yy += 22;
    row.opts.forEach((o,i)=>{
      const bw = sw-32, bh = 34;
      const bx = sx+16, by = yy + i*(bh+4);
      const on = sel[row.key] === o.id;
      const z = zone(bx, by, bw, bh);
      g.fillStyle = on ? '#1f6f9c' : z.hover ? '#dde6ec' : '#e8eef2';
      rr(bx, by, bw, bh, 9); g.fill();
      g.strokeStyle = on ? '#12536f' : '#cbd6de'; g.lineWidth = 1.6;
      rr(bx, by, bw, bh, 9); g.stroke();
      txt(o.name, bx+14, by+13, 15, on ? '#fff' : '#20323e','left');
      txt(o.sub,  bx+14, by+26, 11, on ? 'rgba(255,255,255,.75)' : '#7a8b96','left',400);
      if (on){ g.fillStyle='#fff'; g.beginPath(); g.arc(bx+bw-20, by+17, 8, 0, 7); g.fill();
        g.strokeStyle='#1f6f9c'; g.lineWidth=2.4; g.lineCap='round';
        g.beginPath(); g.moveTo(bx+bw-24, by+17); g.lineTo(bx+bw-21, by+20.5);
        g.lineTo(bx+bw-16, by+13); g.stroke(); }
      if (z.clicked){ SFX.click(); onPick(row.key, o.id); }
    });
    yy += row.opts.length*38 + 12;
  }
  // order button
  const ready = sel.type && sel.therm && sel.scale;
  const obw = sw-32, obh = 42, obx = sx+16, oby = sy+sh-54;
  const z = zone(obx, oby, obw, obh);
  g.fillStyle = !ready ? '#c8d2d8' : z.hover ? '#25c07a' : '#1fa768';
  rr(obx, oby, obw, obh, 11); g.fill();
  txt(ready ? 'PLACE THE ORDER' : 'pick all three', x, oby+22, 17, ready?'#04121a':'#8a97a4');
  return ready && z.clicked;
}

/* ============================================================
   scene
   ============================================================ */
const S_rea = {
  enter(){
    Music.play('lab');
    Hint.begin('rea');
    this.px = 60; this.py = 606; this.face='right'; this.walkT=0; this.stepT=0;
    this.mode='walkin'; this.ci=-1;
    this.phase=''; this.pk=0;
    this.asked = {}; this.readLine = null; this.readT = 0;
    this.sel = { type:null, therm:null, scale:null };
    this.result = null;
    this.solved = [false,false,false];
    this.pts = 0; this.safePts = 0;
    this.convo = null; this.scored = false;
    this.quiz = null; this.quizScore = 0;
    this.mutter = mutterFor('rea'); this.mutterT = 210;
    after(60, ()=>{ this.mode='free'; });
  },
  exit(){
    if (!this.scored){
      this.scored = true;
      award('rea', this.pts, 9);
      award('saf', this.safePts, 3);
      if (isHard()) award('rea', this.quizScore || 0, 3);
      if (this.solved.every(Boolean)) G.done.rea = true;
    }
  },
  camX(){ return clamp(this.px - W/2, 0, REA_ROOM - W); },

  draw(){
    const cam = this.camX();
    g.fillStyle='#160d16'; g.fillRect(0,0,W,H);
    g.save(); g.translate(-cam, 0);

    /* ---- room ---- */
    const wall = g.createLinearGradient(0,0,0,612);
    wall.addColorStop(0,'#3a1f34'); wall.addColorStop(.55,'#2b1628'); wall.addColorStop(1,'#1d0f1c');
    g.fillStyle=wall; g.fillRect(0,0,REA_ROOM,612);
    for (let i=0;i<REA_ROOM/70;i++) for (let j=0;j<8;j++){
      g.strokeStyle='rgba(255,255,255,.017)'; g.lineWidth=1;
      g.strokeRect(i*70, 120+j*62, 70, 62);
    }
    pipeSeg(0, 48, REA_ROOM, 48, 14, {shell:'#7a3a4a', inner:'#4e2230'});
    pipeSeg(0, 70, REA_ROOM, 70, 9,  {shell:'#4a5f7a', inner:'#2d3c50'});
    flowDots([[0,48],[REA_ROOM,48]], 1.5, .5, 'rgba(255,170,150,.55)', 3);
    // hanging lamps
    for (let i=0;i<8;i++){
      const lx = 160 + i*280;
      g.strokeStyle='#4a2a38'; g.lineWidth=3;
      g.beginPath(); g.moveTo(lx, 78); g.lineTo(lx, 128); g.stroke();
      g.fillStyle='#5f3346';
      g.beginPath(); g.moveTo(lx-30,168); g.lineTo(lx+30,168); g.lineTo(lx+14,128); g.lineTo(lx-14,128);
      g.closePath(); g.fill();
      g.fillStyle='rgba(255,220,170,.9)'; g.beginPath(); g.ellipse(lx,168,26,6,0,0,7); g.fill();
      const cone = g.createLinearGradient(0,168,0,560);
      cone.addColorStop(0,'rgba(255,215,160,.13)'); cone.addColorStop(1,'rgba(255,215,160,0)');
      g.fillStyle=cone;
      g.beginPath(); g.moveTo(lx-28,168); g.lineTo(lx+28,168);
      g.lineTo(lx+130,560); g.lineTo(lx-130,560); g.closePath(); g.fill();
    }
    // floor
    const fl = g.createLinearGradient(0,612,0,H);
    fl.addColorStop(0,'#2b1a26'); fl.addColorStop(1,'#150c14');
    g.fillStyle=fl; g.fillRect(0,612,REA_ROOM,H-612);
    g.fillStyle='rgba(245,181,61,.32)'; g.fillRect(0,614,REA_ROOM,4);
    for (let i=0;i<REA_ROOM/62;i++){ g.strokeStyle='rgba(255,255,255,.025)'; g.lineWidth=2;
      g.beginPath(); g.moveTo(i*62,618); g.lineTo(i*62-70,H); g.stroke(); }

    /* ---- a whiteboard of reactor sketches ---- */
    g.fillStyle='#f0f2f0'; rr(150, 200, 260, 170, 6); g.fill();
    g.strokeStyle='#9aa4a8'; g.lineWidth=3; rr(150, 200, 260, 170, 6); g.stroke();
    txt('REACTOR TYPES', 280, 222, 14, '#3a4a54');
    g.strokeStyle='#4a7a92'; g.lineWidth=2.4;
    g.strokeRect(190, 246, 44, 54); txt('batch', 212, 314, 11, '#5a6a74','center',400);
    g.strokeRect(258, 240, 44, 66); txt('packed', 280, 314, 11, '#5a6a74','center',400);
    g.strokeRect(326, 254, 52, 40); txt('membrane', 352, 314, 11, '#5a6a74','center',400);
    g.strokeStyle='#c05a6a'; g.lineWidth=2;
    g.beginPath(); g.moveTo(190, 334); g.lineTo(378, 334); g.stroke();
    txt('ask what the reaction actually does', 280, 348, 11, '#a04a5a','center',400);

    /* ---- each client, their desk, and their pad ---- */
    let nearC = -1;
    REA_CLIENTS.forEach((c,i)=>{
      const solved = this.solved[i];
      const active = this.mode==='client' && this.ci===i;
      // desk
      g.fillStyle='#4a2a3a'; rr(c.x-120, 560, 240, 16, 4); g.fill();
      g.fillStyle='#39202d'; rr(c.x-110, 576, 220, 36, 4); g.fill();
      // install pad
      const padOn = active && this.phase==='phone';
      g.fillStyle = solved ? 'rgba(63,208,127,.14)'
                  : padOn ? `rgba(238,95,110,${.18+Math.sin(T/10)*.1})` : 'rgba(238,95,110,.07)';
      g.beginPath(); g.ellipse(c.x+180, 612, 84, 18, 0, 0, 7); g.fill();
      g.strokeStyle = solved ? 'rgba(63,208,127,.5)' : 'rgba(238,95,110,.35)';
      g.lineWidth=2; g.setLineDash([7,7]);
      g.beginPath(); g.ellipse(c.x+180, 612, 84, 18, 0, 0, 7); g.stroke(); g.setLineDash([]);

      // the installed reactor
      if (solved){
        const t = reaType(c.right.type);
        t.draw(c.x+180, 612, t.sc, {run:true, jacket:c.right.therm==='none'?null:c.right.therm});
        reaProduct(c.product, c.x+180, 660, 'good', 'ok');
      } else if (active && (this.phase==='build' || this.phase==='run' || this.phase==='verdict')){
        this.drawReactorOutcome(c, c.x+180, 612);
      }

      // nameplate
      panel(c.x-80, 330, 160, 34, 'rgba(12,6,12,.9)',
            solved?'rgba(63,208,127,.6)':'rgba(238,95,110,.5)', 7);
      txt(NPCS[c.npc].name, c.x, 347, 15, solved?'#8fe8b8':'#f0b0bc');

      // the client
      const talking = active && this.convo && this.convo.speaking(NPCS[c.npc].name);
      drawPerson(NPCS[c.npc], c.x, 606, 2.0, {
        dir: this.px > c.x ? 'right' : 'left',
        face: solved ? 'happy' : active ? 'neutral' : 'worry',
        talk: talking, seed: i*7,
        pose: talking ? 'talk' : (solved ? 'cheer' : 'idle')
      });
      if (!solved && !active){
        const bob = Math.sin(T/18 + i)*3;
        txt('!', c.x, 384 + bob, 30, '#f5b53d');
      }

      if (this.mode==='free' && !solved && Math.abs(this.px - c.x) < 110) nearC = i;
    });

    drawParts();

    /* ---- the engineer ---- */
    const heroTalk = this.convo && this.convo.speaking(hero.name);
    let face='neutral', pose, sweat=0;
    if (this.phase==='verdict'){
      if (this.result && this.result.perfect){ face='proud'; pose='cheer'; }
      else { face='worry'; sweat=1; pose='slump'; }
    } else if (this.phase==='phone'){ pose='hold'; }
    drawPerson(hero, this.px, this.py, 2.0, {
      dir:this.face, walk:this.walkT, face, pose, sweat, seed:5, talk:heroTalk,
      ppe:{ hat:true, goggles:G.ppe.goggles, coat:G.ppe.coat }
    });

    // exit
    g.fillStyle='#160a10'; rr(REA_ROOM-110, 396, 92, 216, 6); g.fill();
    g.strokeStyle = this.solved.every(Boolean) ? '#3fd07f' : 'rgba(150,110,120,.4)';
    g.lineWidth=3; rr(REA_ROOM-110, 396, 92, 216, 6); g.stroke();
    txt('EXIT', REA_ROOM-64, 372, 16,
        this.solved.every(Boolean)?'#3fd07f':'rgba(180,140,150,.5)');

    g.restore();   /* ---- end world ---- */

    /* ---- movement ---- */
    if (this.mode==='walkin'){
      this.px += 3.2*dt; this.walkT += dt*2.4;
      this.stepT += dt; if (this.stepT>12){ this.stepT=0; SFX.step(); }
    } else if (this.mode==='free'){
      let dx=0, dy=0;
      if (keys.ArrowLeft||keys.a||keys.A) dx--;
      if (keys.ArrowRight||keys.d||keys.D) dx++;
      if (keys.ArrowUp||keys.w||keys.W) dy--;
      if (keys.ArrowDown||keys.s||keys.S) dy++;
      if (dx) this.face = dx>0?'right':'left';
      if ((dx||dy) && !trans){
        this.px = clamp(this.px + dx*3.6*dt, 46, REA_ROOM-46);
        this.py = clamp(this.py + dy*1.9*dt, 586, 676);
        this.walkT += dt*2.4;
        this.stepT += dt; if (this.stepT>12){ this.stepT=0; SFX.step(); }
      } else this.walkT = 0;

      if (nearC >= 0){
        const c = REA_CLIENTS[nearC];
        panel(c.x-cam-150, 388, 300, 42, 'rgba(12,6,12,.96)', '#ee5f6e', 10);
        txt('SPACE   —   talk to ' + NPCS[c.npc].name.split(' ').pop(), c.x-cam, 410, 16, '#eaf4fa');
        if (keyPressed(' ','Enter','Space')) this.openClient(nearC);
      }
      if (this.px > REA_ROOM-80 && this.solved.every(Boolean)){
        if (isHard() && !G.quizDone.rea){
          this.quiz = makeTFQuiz('rea', (correct)=>{
            G.quizDone.rea = true; this.quizScore = correct; this.quiz = null;
            go(S_hub, 'fade');
          });
          this.mode = 'quiz';
        } else go(S_hub, 'fade');
      }
    }

    if (this.mutterT>0 && this.mode!=='client'){
      this.mutterT -= dt;
      if (this.mutterT < 180) bubble(this.mutter, this.px-cam, this.py-196, {w:300, size:17, pop:1});
    }

    if (this.mode==='client') this.drawClient(cam);
    if (this.mode==='quiz' && this.quiz){ this.quiz.draw(); return; }

    if (this.mode==='client' && this.phase==='ask'){
      const c = REA_CLIENTS[this.ci];
      if (Hint.draw(1198, 128, 1064, 238))
        Hint.use('Three questions. Is it new, does it heat up or cool down, and how much do they need.');
    } else if (this.mode!=='client'){
      if (Hint.draw(76, 150, 210, 250))
        Hint.use('Ask all three questions before you order. The answers are the spec.');
    }

    vignette(.38);
    const n = this.solved.filter(Boolean).length;
    hudEl.textContent = `Reactor Design Lab   ·   clients ${n}/3   ·   correct calls ${this.pts}/9`;
  },

  openClient(i){
    SFX.click();
    this.mode='client'; this.ci=i; this.phase='intro'; this.pk=0;
    this.asked={}; this.sel={type:null,therm:null,scale:null}; this.result=null;
    this.readLine=null; this.readT=0;
    const c = REA_CLIENTS[i], nm = NPCS[c.npc].name;
    this.convo = Convo(
      c.intro.map(t=>({ by:nm, text:t, at:()=>[c.x - this.camX(), 440], w:380 })),
      ()=>{ this.phase='ask'; this.convo=null; }
    );
  },

  /* ---------- the client panel ---------- */
  drawClient(cam){
    const c = REA_CLIENTS[this.ci];
    const nm = NPCS[c.npc].name;

    if (this.phase==='intro'){ shade(.5); if (this.convo) this.convo.draw(); return; }

    if (this.phase==='ask'){
      shade(.55);
      panel(40, 84, 420, 132, 'rgba(10,5,10,.95)', 'rgba(238,95,110,.6)');
      txt('CLIENT', 60, 110, 13, '#f0b0bc','left');
      txt(nm, 60, 136, 26, '#fff','left');
      wrapText(c.intro[0], 60, 172, 380, 22, 16, '#dcc4cc','left',400);

      // question buttons
      const allAsked = c.asks.every(a=>this.asked[a.key]);
      c.asks.forEach((a,i)=>{
        const bw=540, bh=56, bx=W/2-bw/2, by=270+i*68;
        const done = this.asked[a.key];
        const z = zone(bx,by,bw,bh);
        g.save(); if (z.hover && !done){ g.shadowColor='#ee5f6e'; g.shadowBlur=18; }
        g.fillStyle = done ? 'rgba(18,44,34,.92)' : z.hover ? 'rgba(60,24,32,.98)' : 'rgba(22,10,18,.94)';
        rr(bx,by,bw,bh,10); g.fill(); g.restore();
        g.strokeStyle = done ? 'rgba(63,208,127,.6)' : z.hover ? '#ee5f6e' : 'rgba(238,95,110,.35)';
        g.lineWidth=2; rr(bx,by,bw,bh,10); g.stroke();
        txt(done ? '✓' : '?', bx+26, by+bh/2, 20, done?'#3fd07f':'#f0b0bc');
        txt(isHard() && a.hardQ ? a.hardQ : a.q, bx+52, by+bh/2, 18,
            done?'rgba(200,230,215,.75)':'#f2e8ea','left',400);
        if (z.clicked && !done) this.ask(a);
      });

      // the answer and the engineer's reading of it
      if (this.readT > 0){
        this.readT -= dt;
        panel(W/2-420, 474, 840, 150, 'rgba(8,4,8,.96)', 'rgba(245,181,61,.55)');
        txt(nm, W/2-396, 500, 14, '#f0b0bc','left');
        wrapText(this.readLine.a, W/2-396, 524, 790, 22, 18, '#e8dce0','left',400);
        g.strokeStyle='rgba(255,255,255,.12)'; g.lineWidth=1;
        g.beginPath(); g.moveTo(W/2-396, 548); g.lineTo(W/2+396, 548); g.stroke();
        txt(hero.name, W/2-396, 570, 14, this.readLine.wasBad ? '#ee5f6e' : '#7fe0a8','left');
        wrapText(this.readLine.read, W/2-396, 596, 790, 22, 18,
                 this.readLine.wasBad ? '#f0b8be' : '#d8f0e2','left',400);
      }

      if (button(allAsked ? 'OPEN THE PHONE' : 'order anyway', W/2-140, H-52, 280, 40,
                 { col: allAsked ? '#3fd07f' : '#8a7a5a', size:17 })){
        SFX.phone(); this.phase='phone';
      }
      return;
    }

    if (this.phase==='phone'){
      shade(.66);
      txt('UNIT-MART   ·   next day delivery', W/2, 46, 20, '#cfe6f2','center',400);
      txt('order what ' + nm.split(' ').pop() + ' actually needs', W/2, 76, 16, 'rgba(207,230,242,.6)','center',400);
      const placed = drawPhone(W/2, H/2+40, this.sel, (k,v)=>{ this.sel[k]=v; });
      if (button('BACK TO QUESTIONS', 40, H-58, 240, 40, {size:15})) this.phase='ask';
      if (placed) this.placeOrder();
      return;
    }

    if (this.phase==='build'){
      this.pk += dt;
      if (this.pk > 92){ this.phase='run'; this.pk=0; this.fireOutcome(); }
      return;
    }
    if (this.phase==='run'){
      this.pk += dt;
      if (this.pk > 130){ this.phase='verdict'; this.pk=0;
        if (this.result.perfect) SFX.great(); else SFX.wahwah(); }
      return;
    }
    if (this.phase==='verdict'){
      this.pk += dt;
      const r = this.result;
      panel(W/2-420, H-186, 840, 138,
            r.perfect ? 'rgba(8,40,28,.96)' : 'rgba(44,12,18,.96)',
            r.perfect ? '#3fd07f' : '#ee5f6e');
      txt(r.perfect ? 'THAT IS EXACTLY WHAT THEY NEEDED' : 'NOT QUITE WHAT THEY NEEDED',
          W/2, H-156, 24, r.perfect?'#3fd07f':'#ee5f6e');
      // per-choice marks
      const marks = [['REACTOR', r.typeOK], ['TEMPERATURE', r.thermOK], ['RATE', r.scaleOK]];
      marks.forEach(([lab, ok], i)=>{
        const mx = W/2 - 300 + i*300;
        g.fillStyle = ok ? '#3fd07f' : '#ee5f6e';
        g.beginPath(); g.arc(mx-70, H-122, 11, 0, 7); g.fill();
        g.strokeStyle='#04121a'; g.lineWidth=2.6; g.lineCap='round';
        if (ok){ g.beginPath(); g.moveTo(mx-75,H-122); g.lineTo(mx-71,H-117); g.lineTo(mx-64,H-128); g.stroke(); }
        else { g.beginPath(); g.moveTo(mx-75,H-127); g.lineTo(mx-65,H-117);
               g.moveTo(mx-65,H-127); g.lineTo(mx-75,H-117); g.stroke(); }
        txt(lab, mx-50, H-122, 15, ok?'#8fe8b8':'#f0b0bc','left');
      });
      wrapText(r.line, W/2, H-88, 780, 22, 18, '#e8eef2','center',400);

      if (this.pk > 60 && button(r.perfect ? 'NEXT CLIENT' : 'ORDER AGAIN',
                                 W/2-110, H-44, 220, 34,
                                 {col:r.perfect?'#3fd07f':'#ee5f6e', size:16})){
        if (r.perfect){
          this.solved[this.ci] = true;
          this.mode='free'; this.convo=null; clearParts();
          if (this.solved.every(Boolean)) toast('All three clients sorted. Exit is on the right.');
        } else { this.phase='phone'; this.pk=0; clearParts(); }
      }
      return;
    }
  },

  ask(a){
    SFX.click();
    this.asked[a.key] = true;
    const bad = isWeak('rea');
    this.readLine = {
      a: (isHard() && a.hardA) ? a.hardA : a.a,
      read: bad ? ((isHard() && a.hardBad) ? a.hardBad : a.bad) : a.good,
      wasBad: bad
    };
    this.readT = 520;
  },

  placeOrder(){
    SFX.cash();
    const c = REA_CLIENTS[this.ci];
    this.result = {
      typeOK:  this.sel.type  === c.right.type,
      thermOK: this.sel.therm === c.right.therm,
      scaleOK: this.sel.scale === c.right.scale
    };
    this.result.perfect = this.result.typeOK && this.result.thermOK && this.result.scaleOK;
    this.phase='build'; this.pk=0;
  },

  fireOutcome(){
    const c = REA_CLIENTS[this.ci], r = this.result;
    // what went wrong drives both the animation and the line
    const wrongTherm = !r.thermOK;
    const over  = !r.scaleOK && this.sel.scale === 'high';
    const under = !r.scaleOK && this.sel.scale === 'low' && c.right.scale !== 'low';
    r.rupture = over; r.puff = under;
    r.frost = wrongTherm && this.sel.therm === 'cool';
    r.fire  = wrongTherm && (this.sel.therm === 'heat' || this.sel.therm === 'none');

    if (r.perfect){
      r.line = c.praise;
      this.pts += 3; this.safePts += 1;
      SFX.good();
    } else {
      this.pts += (r.typeOK?1:0) + (r.thermOK?1:0) + (r.scaleOK?1:0);
      if (r.thermOK) this.safePts += 1;
      G.blunders++;
      const bits = [];
      if (!r.typeOK)  bits.push('the reactor is the wrong shape for this reaction, so the product came out wrong');
      if (r.frost)    bits.push('you cooled a reaction that was already cold, and it froze solid');
      if (r.fire)     bits.push('you heated a reaction that was already making its own heat, and it caught');
      if (wrongTherm && !r.frost && !r.fire) bits.push('the temperature scheme does not match what it does');
      if (over)       bits.push('the rate was far too high, so it split a seam and spilled everywhere');
      if (under)      bits.push('the rate was far too low, so almost nothing came out at all');
      r.line = 'Look at it — ' + bits.join(', and ') + '.';
      if (over) { SFX.boom(); shake(16); flash(.5,'255,200,120'); }
      else if (r.fire) SFX.fire();
      else if (r.frost) SFX.freeze();
      else if (under) SFX.puff();
      else SFX.bad();
    }
    // reset the per-order choices so a retry starts clean on the wrong ones
  },

  drawReactorOutcome(c, x, y){
    const t = reaType(this.sel.type) || reaType(c.right.type);
    const r = this.result || {};
    if (this.phase === 'build'){
      const k = this.pk/92;
      if (k > .34){
        g.save(); g.globalAlpha = clamp((k-.34)/.4, 0, 1);
        t.draw(x, y, t.sc, { jacket: this.sel.therm==='none'?null:this.sel.therm });
        g.restore();
      }
      buildCloud(x, y-62, 86, k);
      if (this.pk < dt*2) SFX.place();
      return;
    }
    // running / verdict
    const st = {
      run: !r.puff,
      jacket: this.sel.therm==='none' ? null : this.sel.therm,
      frost: r.frost, fire: r.fire, rupture: r.rupture,
      badProduct: !r.typeOK
    };
    g.save();
    if ((r.rupture || r.fire) && this.pk > 20) g.translate(rnd(-2.4,2.4), rnd(-1.8,1.8));
    t.draw(x, y, t.sc, st);
    g.restore();

    if (r.frost){ emitFrost(x + rnd(-50,50), y - rnd(30,110), 1);
      g.fillStyle='rgba(215,242,255,.28)';
      g.beginPath(); g.ellipse(x, y-70, 62, 76, 0, 0, 7); g.fill(); }
    if (r.fire){ emitFire(x + rnd(-40,40), y - rnd(20,90), 2);
      if (Math.random()<.4) emitSmoke(x, y-120, 1); }
    if (r.rupture){
      for (let i=0;i<3;i++) spawn({ x:x+34, y:y-78, vx:rnd(3,11), vy:rnd(-7,1), g:.22,
        life:rnd(30,60), max:60, size:rnd(5,13),
        col: r.typeOK ? 'rgba(120,210,245,.9)' : 'rgba(150,70,200,.85)', kind:'puff', drag:.98 });
      emitSmoke(x+40, y-84, 1, 'rgba(90,80,80,.6)');
    }
    if (r.puff && this.pk < 50 && Math.random()<.4) emitSteam(x, y-140*t.sc, 1, {speed:.7});

    // the product slides out onto the floor
    if (this.pk > 40 && !r.puff){
      const k = clamp((this.pk-40)/40, 0, 1);
      const px = lerp(x, x + 118, easeOut(k));
      reaProduct(c.product, px, y + 46, r.typeOK ? 'good' : 'wrongtype',
                 r.scaleOK ? 'ok' : this.sel.scale === 'high' ? 'high' : 'low');
      if (this.pk > 40 && this.pk < 42) SFX.squelch();
    } else if (r.puff && this.pk > 46){
      txt('...nothing came out', x + 90, y - 30, 16, 'rgba(220,200,205,.75)','center',400);
    }
  }
};
