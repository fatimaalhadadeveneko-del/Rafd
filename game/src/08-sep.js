/* ============================================================
   Separation Techniques Lab
   ============================================================ */
const SEP_ROOM = 2560;

const SEP_UNITS = [
  { id:'evap', name:'Evaporator',  sub:'boil it off',        draw:unitEvaporator, sc:0.78 },
  { id:'col',  name:'Column',      sub:'distillation',       draw:unitColumn,     sc:0.68 },
  { id:'abs',  name:'Absorber',    sub:'liquid solvent',     draw:unitAbsorber,   sc:0.72 },
  { id:'ads',  name:'Adsorber',    sub:'solid pellets',      draw:unitAdsorber,   sc:0.76 },
  { id:'dry',  name:'Dryer',       sub:'warm air',           draw:unitDryer,      sc:0.78 }
];
const sepUnit = id => SEP_UNITS.find(u=>u.id===id);

const SEP_BAYS = [
  { x:430, tag:'SAMPLE 01', sample:'saltwater',
    prompt:'Sea water. Salt dissolved in it. We want the water back, clean.',
    right:'evap',
    why:'Salt does not boil. Boil the water off and the salt stays behind.',
    hint:'One of them boils. The other one really does not.',
    strong:'Non-volatile solid in water. Boil the water off, done.',
    weak:'Salt is heavier, so a column will drop it out the bottom. Obviously.',
    weakPick:'col',
    wrong:{
      col:{ fail:'crust', line:'The salt has no vapour pressure. It just cakes on every tray.' },
      dry:{ fail:'spray', line:'You cannot blow-dry the sea. Now there is salt on everything.' },
      abs:{ fail:'flood', line:'Absorbing what, exactly? There is no gas here.' },
      ads:{ fail:'sludge',line:'The pellets drowned. They were never meant to swim.' } } },

  { x:910, tag:'SAMPLE 02', sample:'binary',
    prompt:'Ethanol and water, mixed. Both boil, but at different temperatures.',
    right:'col',
    why:'Two volatile liquids with different boiling points. That is a column.',
    hint:'Both of them boil. One boils first. Use that, over and over.',
    strong:'Different volatilities. Column, no argument.',
    weak:'Just boil it. Whatever comes off first is probably the good one.',
    weakPick:'evap',
    wrong:{
      evap:{ fail:'murk', line:'Both boiled. You made warm mixture instead of two products.' },
      dry: {fail:'murk',  line:'There is no solid here to dry. You warmed a puddle.' },
      abs: {fail:'flood', line:'The solvent dissolved into your feed. Now there are three things.' },
      ads: {fail:'sludge',line:'Soaked pellets, no separation, and a very expensive bin.' } } },

  { x:1390, tag:'SAMPLE 03', sample:'fluegas',
    prompt:'Flue gas with CO2 in it. There is a tank of liquid amine solvent beside you.',
    right:'abs',
    why:'Gas into a liquid solvent, counter-current. Absorption.',
    hint:'The gas has to move into that liquid. What takes a gas into a liquid?',
    strong:'Gas into liquid solvent. Absorber, counter-current.',
    weak:'It is a gas, so we heat it until the CO2 gets bored and leaves.',
    weakPick:'evap',
    wrong:{
      evap:{ fail:'blow', line:'You boiled a gas. The CO2 sailed straight out the stack.' },
      col: { fail:'blow', line:'Nothing condensed. The whole feed went out the top.' },
      dry: { fail:'blow', line:'You blew warm air at flue gas. It blew back.' },
      ads: { fail:'blow', line:'Not wrong forever, but you were handed a liquid solvent. Use it.' } } },

  { x:1870, tag:'SAMPLE 04', sample:'moist',
    prompt:'Compressed air with a trace of moisture. A drum of solid desiccant pellets is here.',
    right:'ads',
    why:'The water sticks to the surface of the solid. Adsorption.',
    hint:'It sticks to the outside of a solid. One word, starts with ad.',
    strong:'Trace moisture onto a solid bed. Adsorber.',
    weak:'Pellets, liquid, same idea. Absorber. They are basically the same word.',
    weakPick:'abs',
    wrong:{
      abs:{ fail:'flood', line:'Absorption goes INTO a liquid. These are pellets. Different word.' },
      evap:{fail:'blow',  line:'You heated air that was already dry enough to annoy you.' },
      col: {fail:'blow',  line:'A whole column for a trace of water. The water was not impressed.' },
      dry: {fail:'blow',  line:'A dryer dries solids. This is air. The air remains damp.' } } },

  { x:2340, tag:'SAMPLE 05', sample:'wetsugar',
    prompt:'Sugar crystals straight off the filter. Still wet. The product has to come out dry.',
    right:'dry',
    why:'Wet solid, warm air over it. That is drying.',
    hint:'It is a wet solid. There is a unit named after exactly this job.',
    strong:'Wet solid in, dry solid out. Dryer.',
    weak:'Boil it. The water leaves, the sugar stays. Sugar loves heat.',
    weakPick:'evap',
    wrong:{
      evap:{ fail:'goo',  line:'You boiled sugar. That is not a product, that is dessert.' },
      col: { fail:'burnt',line:'Sugar in a reboiler. It caramelised, then it carbonised.' },
      abs: { fail:'flood',line:'You washed the product you were asked to dry.' },
      ads: { fail:'sludge',line:'Wet sugar and dry pellets. Now you have one wet brick.' } } }
];

/* ============================================================
   sample visualisations
   ============================================================ */
function beakerGlass(x, y, w, h){
  g.fillStyle='rgba(215,240,250,.14)'; rr(x-w/2, y-h, w, h, 8); g.fill();
  g.strokeStyle='rgba(225,245,255,.62)'; g.lineWidth=3; rr(x-w/2, y-h, w, h, 8); g.stroke();
  g.fillStyle='rgba(255,255,255,.22)';
  g.beginPath(); g.moveTo(x-w/2+8, y-h+10); g.lineTo(x-w/2+15, y-h+10);
  g.lineTo(x-w/2+10, y-8); g.lineTo(x-w/2+4, y-8); g.closePath(); g.fill();
  // graduation marks
  g.strokeStyle='rgba(225,245,255,.4)'; g.lineWidth=1.6;
  for (let i=1;i<4;i++){ g.beginPath();
    g.moveTo(x+w/2-16, y-h*i/4); g.lineTo(x+w/2-4, y-h*i/4); g.stroke(); }
}

function sepSample(kind, x, y){
  if (kind === 'saltwater'){
    const w=150, h=130;
    g.save(); g.beginPath(); rr(x-w/2+4, y-h+4, w-8, h-8, 6); g.clip();
    liquid(x-w/2+4, y-h+42, w-8, h-46, {r:0});
    saltCrystals(x-w/2+14, y-h+56, w-28, h-66, 16, 0.55);
    bubbles(x-w/2+10, y-h+50, w-20, h-56, 4, .5);
    g.restore();
    beakerGlass(x,y,w,h);
    txt('H2O + NaCl', x, y-h-18, 17, '#9fe8ff');
    // a pinch of salt falling in
    if (Math.random()<.10) spawn({ x:x+rnd(-24,24), y:y-h-4, vx:0, vy:rnd(1.2,2.4),
      g:.05, life:44, max:44, size:rnd(2,4), col:'#fff', kind:'sq', vr:.1 });
  }
  else if (kind === 'binary'){
    const w=150, h=130;
    g.save(); g.beginPath(); rr(x-w/2+4, y-h+4, w-8, h-8, 6); g.clip();
    liquid(x-w/2+4, y-h+40, w-8, h-44, {r:0, c1:'#2a7a6a', c2:'#57d0a8'});
    // two molecule species swirling together
    for (let i=0;i<20;i++){
      const a = T/34 + i*0.62;
      const px = x + Math.cos(a)*(16+nz(i)*40);
      const py = y - 46 + Math.sin(a*1.3)*26 + nz(i+5)*16;
      g.fillStyle = i%2 ? 'rgba(255,225,130,.95)' : 'rgba(140,235,255,.95)';
      g.beginPath(); g.arc(px, py, i%2?4.2:3.2, 0, 7); g.fill();
    }
    g.restore();
    beakerGlass(x,y,w,h);
    txt('A + B', x, y-h-18, 17, '#9fe8ff');
    g.fillStyle='rgba(255,225,130,.95)'; g.beginPath(); g.arc(x-58, y+22, 5, 0, 7); g.fill();
    txt('A  bp 78 C', x-46, y+22, 13, '#e8dca0','left',400);
    g.fillStyle='rgba(140,235,255,.95)'; g.beginPath(); g.arc(x+8, y+22, 5, 0, 7); g.fill();
    txt('B  bp 100 C', x+20, y+22, 13, '#a8e2f0','left',400);
  }
  else if (kind === 'fluegas'){
    // a duct carrying grey gas with CO2 molecules in it
    g.fillStyle='#3d4a54'; rr(x-90, y-120, 180, 74, 10); g.fill();
    g.save(); g.beginPath(); rr(x-86, y-116, 172, 66, 8); g.clip();
    g.fillStyle='#232c33'; g.fillRect(x-86, y-116, 172, 66);
    for (let i=0;i<16;i++){
      const px = x-86 + ((T*1.6 + i*22) % 178);
      g.fillStyle = `rgba(150,160,168,${0.20+nz(i)*0.2})`;
      g.beginPath(); g.arc(px, y-84 + Math.sin(T/20+i)*18, 12+nz(i)*9, 0, 7); g.fill();
    }
    for (let i=0;i<9;i++){
      const px = x-86 + ((T*2.0 + i*30) % 178);
      const py = y-84 + Math.sin(T/15+i*2)*20;
      g.fillStyle='#ee7a5f';
      g.beginPath(); g.arc(px, py, 4.4, 0, 7); g.fill();
      g.fillStyle='#c0d8e8';
      g.beginPath(); g.arc(px-6.4, py, 2.9, 0, 7); g.arc(px+6.4, py, 2.9, 0, 7); g.fill();
    }
    g.restore();
    g.strokeStyle='#5f7280'; g.lineWidth=3; rr(x-90, y-120, 180, 74, 10); g.stroke();
    txt('FLUE GAS  +  CO2', x, y-136, 16, '#f0a88f');
    // solvent drum beside it
    barrel(x+76, y+4, 1.3, '#3f9ad0');
    txt('amine solvent', x+76, y+22, 12, '#8fd0f0');
  }
  else if (kind === 'moist'){
    g.fillStyle='#3d4a54'; rr(x-90, y-120, 180, 74, 10); g.fill();
    g.save(); g.beginPath(); rr(x-86, y-116, 172, 66, 8); g.clip();
    g.fillStyle='#1d3644'; g.fillRect(x-86, y-116, 172, 66);
    for (let i=0;i<22;i++){
      const px = x-86 + ((T*2.2 + i*17) % 178);
      const py = y-84 + Math.sin(T/13+i*1.7)*22;
      g.fillStyle='rgba(150,225,255,.9)';
      g.beginPath(); g.ellipse(px, py, 2.0, 2.8, 0, 0, 7); g.fill();
    }
    g.restore();
    g.strokeStyle='#5f7280'; g.lineWidth=3; rr(x-90, y-120, 180, 74, 10); g.stroke();
    txt('DRY AIR  +  trace H2O', x, y-136, 16, '#9fe8ff');
    // pellet drum
    g.fillStyle='#6a5f4a'; rr(x+56, y-34, 48, 38, 5); g.fill();
    g.strokeStyle='#4a4232'; g.lineWidth=2; rr(x+56, y-34, 48, 38, 5); g.stroke();
    for (let i=0;i<16;i++){ g.fillStyle = i%3?'#9d8f72':'#b3a488';
      g.beginPath(); g.arc(x+62+nz(i)*36, y-28+nz(i+9)*26, 3, 0, 7); g.fill(); }
    txt('desiccant pellets', x+80, y+18, 12, '#c9bfa8');
  }
  else if (kind === 'wetsugar'){
    // a tray of glistening wet crystals
    g.fillStyle='#8a939a'; rr(x-100, y-46, 200, 46, 6); g.fill();
    g.fillStyle='#6d777e'; rr(x-100, y-46, 200, 9, 4); g.fill();
    g.save(); g.beginPath(); rr(x-96, y-40, 192, 38, 4); g.clip();
    g.fillStyle='#e8e2d2'; g.fillRect(x-96, y-40, 192, 38);
    for (let i=0;i<70;i++){
      const px = x-96 + nz(i)*192, py = y-38 + nz(i+40)*34;
      g.save(); g.translate(px,py); g.rotate(nz(i+80)*3);
      g.fillStyle = i%4 ? '#fbf7ec' : '#ffffff';
      const s = 4+nz(i+20)*4; g.fillRect(-s/2,-s/2,s,s);
      g.fillStyle='rgba(180,225,245,.6)'; g.fillRect(-s/2,-s/2,s*.4,s*.4);
      g.restore();
    }
    // wet sheen moving over the surface
    const sh = ((T*0.9) % 300) - 60;
    const grad = g.createLinearGradient(x-96+sh, 0, x-96+sh+70, 0);
    grad.addColorStop(0,'rgba(160,225,255,0)'); grad.addColorStop(.5,'rgba(190,240,255,.35)');
    grad.addColorStop(1,'rgba(160,225,255,0)');
    g.fillStyle = grad; g.fillRect(x-96, y-40, 192, 38);
    g.restore();
    g.strokeStyle='#5f6a72'; g.lineWidth=2.4; rr(x-100, y-46, 200, 46, 6); g.stroke();
    txt('WET SUGAR CRYSTALS', x, y-64, 16, '#ffe9c0');
    if (Math.random()<.16) emitDrip(x+rnd(-90,90), y, 1, 'rgba(150,215,245,.9)');
  }
}

/* ============================================================
   outcome animations
   ============================================================ */
function sepOutcome(fail, unitId, x, y, k){
  const u = sepUnit(unitId);
  const st = { run:true };
  if (fail === 'crust') st.broken = true;
  if (fail === 'burnt') st.fire = true;

  /* the unit itself, shaking when it is unhappy */
  const bad = !!fail;
  g.save();
  if (bad && k > .2) g.translate(rnd(-2.2,2.2), rnd(-1.6,1.6));
  u.draw(x, y, u.sc, st);
  g.restore();

  if (!bad){
    // happy: clean steam, sparkle, product jar fills
    if (Math.random()<.5) emitSteam(x, y-150*u.sc, 1, {speed:1.2});
    if (Math.random()<.16) emitSpark(x+rnd(-40,40), y-rnd(30,120), 1, '#9fe8ff');
    return;
  }

  if (fail === 'crust'){
    // salt cakes on the shell, then a seam lets go
    g.save(); g.globalAlpha = clamp(k*1.6,0,.9);
    for (let i=0;i<26;i++){
      g.fillStyle='rgba(255,255,255,.9)';
      g.beginPath(); g.arc(x-24+nz(i)*48, y-150*u.sc + nz(i+7)*140*u.sc, 2.4+nz(i+3)*4, 0, 7); g.fill();
    }
    g.restore();
    if (k > .45){
      if (Math.random()<.6) for (let i=0;i<2;i++) spawn({
        x:x+22, y:y-84, vx:rnd(2.5,7), vy:rnd(-2.6,.6), g:.14, life:rnd(26,48), max:48,
        size:rnd(3,7), col:'rgba(235,250,255,.95)', kind:'dot' });
      emitSteam(x+26, y-84, 1, {vx:2.2, speed:1.6});
    }
  }
  else if (fail === 'spray'){
    for (let i=0;i<3;i++) spawn({
      x:x-40, y:y-70, vx:-rnd(3,9), vy:rnd(-4,2), g:.13, life:rnd(26,52), max:52,
      size:rnd(2,5), col: Math.random()<.5?'#fff':'rgba(200,235,250,.9)', kind:'sq', vr:.2 });
    emitSteam(x-46, y-74, 1, {vx:-2.4});
  }
  else if (fail === 'flood'){
    // liquid pours out of the bottom and spreads on the floor
    if (Math.random()<.8) emitDrip(x+rnd(-30,30), y-30, 2, 'rgba(110,200,240,.85)');
    const pw = clamp(k,0,1) * 150;
    g.fillStyle='rgba(90,180,230,.42)';
    g.beginPath(); g.ellipse(x, y+6, pw, pw*0.16, 0, 0, 7); g.fill();
    g.fillStyle='rgba(180,235,255,.30)';
    g.beginPath(); g.ellipse(x - pw*.25, y+4, pw*.35, pw*0.06, 0, 0, 7); g.fill();
  }
  else if (fail === 'sludge'){
    if (Math.random()<.6) spawn({ x:x+rnd(-26,26), y:y-40, vx:rnd(-1,1), vy:rnd(.4,1.6),
      g:.05, life:rnd(50,90), max:90, size:rnd(7,15), col:'rgba(120,105,70,.8)', kind:'puff', drag:.97 });
    const pw = clamp(k,0,1) * 120;
    g.fillStyle='rgba(112,98,66,.6)';
    g.beginPath(); g.ellipse(x, y+6, pw, pw*0.17, 0, 0, 7); g.fill();
  }
  else if (fail === 'blow'){
    // the feed sails straight out of the top, untouched
    for (let i=0;i<9;i++){
      const pr = ((T*3 + i*24) % 150);
      g.globalAlpha = clamp(1 - pr/150, 0, 1) * 0.9;
      g.fillStyle='rgba(170,180,190,.7)';
      g.beginPath(); g.arc(x + Math.sin(pr/16+i)*13, y-150*u.sc - pr, 7+pr*0.07, 0, 7); g.fill();
      g.fillStyle='#ee7a5f';
      g.beginPath(); g.arc(x + Math.sin(pr/16+i)*13, y-150*u.sc - pr, 3.2, 0, 7); g.fill();
      g.globalAlpha = 1;
    }
  }
  else if (fail === 'murk'){
    if (Math.random()<.7) emitSteam(x, y-140*u.sc, 2, {speed:1.6, col:'rgba(200,205,195,.7)'});
    g.save(); g.globalAlpha=.5;
    g.fillStyle='#6a6a52';
    g.beginPath(); g.ellipse(x, y-60, 40, 26, 0, 0, 7); g.fill();
    g.restore();
  }
  else if (fail === 'burnt'){
    emitSmoke(x, y-130*u.sc, 2, 'rgba(40,36,34,.75)');
    if (k > .3) emitFire(x, y-40, 1);
    g.save(); g.globalAlpha = clamp((k-.2)*1.6,0,.8);
    g.fillStyle='#2b211a';
    g.beginPath(); g.ellipse(x, y-70, 34, 44, 0, 0, 7); g.fill();
    g.restore();
  }
  else if (fail === 'goo'){
    if (Math.random()<.8) emitGoo(x+rnd(-22,22), y-34, 1);
    const pw = clamp(k,0,1) * 110;
    g.fillStyle='rgba(130,55,170,.6)';
    g.beginPath(); g.ellipse(x, y+6, pw, pw*0.2, 0, 0, 7); g.fill();
    g.fillStyle='rgba(190,110,220,.45)';
    g.beginPath(); g.ellipse(x-pw*.2, y+3, pw*.4, pw*0.09, 0, 0, 7); g.fill();
  }
}

/* product jar that shows what you actually made */
function productJar(x, y, good, fail){
  g.fillStyle='rgba(215,240,250,.14)'; rr(x-26, y-52, 52, 52, 7); g.fill();
  g.save(); g.beginPath(); rr(x-24, y-50, 48, 48, 6); g.clip();
  if (good){
    liquid(x-24, y-34, 48, 32, {r:0, c1:'#1f8fc8', c2:'#5fe0f8'});
    if (Math.random()<.2) emitSpark(x+rnd(-16,16), y-rnd(6,30), 1, '#bff2ff');
  } else if (fail === 'goo' || fail === 'sludge'){
    g.fillStyle = fail==='goo' ? '#7a2fa8' : '#6b5c3a'; g.fillRect(x-24, y-28, 48, 26);
    for (let i=0;i<5;i++){ g.fillStyle = fail==='goo' ? 'rgba(180,100,220,.7)':'rgba(140,124,84,.7)';
      g.beginPath(); g.arc(x-18+i*9, y-28+Math.sin(T/14+i)*3, 5.4, 0, 7); g.fill(); }
  } else if (fail === 'burnt'){
    g.fillStyle='#241c16'; g.fillRect(x-24, y-30, 48, 28);
    if (Math.random()<.2) emitSmoke(x, y-30, 1, 'rgba(60,54,50,.5)');
  } else if (fail === 'blow'){
    g.fillStyle='rgba(120,140,155,.2)'; g.fillRect(x-24, y-50, 48, 48);
    txt('empty', x, y-26, 12, 'rgba(210,230,240,.5)','center',400);
  } else {
    g.fillStyle='#5c6b5a'; g.fillRect(x-24, y-26, 48, 24);
    for (let i=0;i<10;i++){ g.fillStyle='rgba(180,190,175,.5)';
      g.beginPath(); g.arc(x-20+nz(i)*40, y-24+nz(i+4)*18, 3.4, 0, 7); g.fill(); }
  }
  g.restore();
  g.strokeStyle='rgba(225,245,255,.6)'; g.lineWidth=2.4; rr(x-26, y-52, 52, 52, 7); g.stroke();
  g.fillStyle='#8a939a'; rr(x-14, y-60, 28, 9, 3); g.fill();
  txt('PRODUCT', x, y+16, 11, good ? '#8fe8b8' : '#e8a0a0');
}

/* ============================================================
   the scene
   ============================================================ */
const S_sep = {
  enter(){
    Music.play('lab');
    Hint.begin('sep');
    this.px = 60; this.py = 596; this.face='right'; this.walkT=0; this.stepT=0;
    this.mode = 'walkin';                 // walkin | free | bay | outro
    this.bayI = -1; this.phase=''; this.pk=0;
    this.choice = null; this.ok = false; this.fail = null;
    this.solved = [false,false,false,false,false];
    this.ppeStage = 0;                    // 0 nothing, 1 goggles, 2 coat
    this.ppeMsg = null; this.ppeMsgT = 0; this.ppeAnim = 0;
    this.convo = null; this.reactT = 0;
    this.scored = false;
    this.mutter = MUTTER.sep[skill('sep')]; this.mutterT = 210;
    after(60, ()=>{ this.mode = 'free'; });
  },
  exit(){
    if (!this.scored){
      this.scored = true;
      award('sep', this.solved.filter(Boolean).length, SEP_BAYS.length);
      award('saf', this.ppeStage, 2);
      if (this.solved.every(Boolean)) G.done.sep = true;
    }
  },
  camX(){ return clamp(this.px - W/2, 0, SEP_ROOM - W); },

  /* ---------- PPE station ---------- */
  ppeExcuses(){
    if (hero.safety === 2) return null;
    if (hero.safety === 1) return ['Fine. I suppose the rules are the rules.'];
    return [
      'Goggles? For a beaker? I will be careful.',
      'Alright, in case something unexpected happens. Which it will not.',
      'Fine. Fine! I am putting them on. Look at me. Safety.'
    ];
  },
  tryPPE(){
    const ex = this.ppeExcuses();
    if (!ex){                             // safety-conscious: instant
      this.ppeStage = 2; G.ppe.goggles = true; G.ppe.coat = true;
      this.ppeAnim = 40; SFX.pickup();
      this.ppeMsg = 'Goggles, coat. Now we can work.'; this.ppeMsgT = 150;
      return;
    }
    G.ppeTries++;
    if (G.ppeTries >= ex.length){
      this.ppeStage = 2; G.ppe.goggles = true; G.ppe.coat = true;
      this.ppeAnim = 40; SFX.pickup();
    } else { SFX.click(); shake(3); }
    this.ppeMsg = ex[Math.min(G.ppeTries-1, ex.length-1)]; this.ppeMsgT = 170;
  },

  drawPPEStation(){
    const x = 170, y = 604;
    // locker
    g.fillStyle='#2f4756'; rr(x-70, y-190, 140, 190, 8); g.fill();
    g.fillStyle='#263c49'; rr(x-70, y-190, 140, 30, 8); g.fill();
    g.strokeStyle='#4d6d80'; g.lineWidth=2.4; rr(x-70, y-190, 140, 190, 8); g.stroke();
    txt('PPE', x, y-174, 17, '#f5c22b');
    // hanging goggles + coat, they vanish once worn
    if (this.ppeStage < 2){
      const bobY = Math.sin(T/22)*2;
      // goggles on a peg
      g.save(); g.translate(x-34, y-108+bobY);
      g.fillStyle='rgba(150,228,255,.5)'; rr(-19,-8,38,15,5); g.fill();
      g.strokeStyle='#2a3a46'; g.lineWidth=3; rr(-19,-8,38,15,5); g.stroke();
      g.strokeStyle='#3d4d5a'; g.lineWidth=3;
      g.beginPath(); g.moveTo(-19,0); g.lineTo(-27,-4); g.moveTo(19,0); g.lineTo(27,-4); g.stroke();
      g.restore();
      // lab coat on a hanger
      g.save(); g.translate(x+30, y-112+bobY*0.7);
      g.strokeStyle='#b9c6ce'; g.lineWidth=2.4;
      g.beginPath(); g.moveTo(0,-14); g.lineTo(0,-6); g.moveTo(-14,-6); g.lineTo(14,-6); g.stroke();
      g.fillStyle='#f4f7f9';
      g.beginPath(); g.moveTo(-14,-6); g.lineTo(14,-6); g.lineTo(19,46); g.lineTo(-19,46); g.closePath(); g.fill();
      g.strokeStyle='#c3ced6'; g.lineWidth=1.4;
      g.beginPath(); g.moveTo(0,-6); g.lineTo(0,46); g.stroke();
      g.restore();
      // a glow when you are close
      const near = Math.abs(this.px - x) < 100;
      if (near){
        g.strokeStyle=`rgba(245,194,43,${.45+Math.sin(T/12)*.25})`; g.lineWidth=3;
        rr(x-70, y-190, 140, 190, 8); g.stroke();
      }
    } else {
      txt('all clear', x, y-100, 15, '#8fe8b8');
      g.fillStyle='#3fd07f'; g.beginPath(); g.arc(x, y-70, 13, 0, 7); g.fill();
      g.strokeStyle='#04121a'; g.lineWidth=3; g.lineCap='round';
      g.beginPath(); g.moveTo(x-6, y-70); g.lineTo(x-2, y-65); g.lineTo(x+6, y-76); g.stroke();
    }
    hazardSign(x+96, y, .9, 'ppe');
  },

  draw(){
    const cam = this.camX();

    /* ================= room ================= */
    g.fillStyle='#0e2b36'; g.fillRect(0,0,W,H);
    g.save(); g.translate(-cam, 0);

    // wall
    const wall = g.createLinearGradient(0,0,0,610);
    wall.addColorStop(0,'#0f3141'); wall.addColorStop(.55,'#0c2a38');
    wall.addColorStop(1,'#081f2b');
    g.fillStyle = wall; g.fillRect(0,0,SEP_ROOM,610);
    // wall tiles
    for (let i=0;i<SEP_ROOM/64;i++) for (let j=0;j<7;j++){
      g.strokeStyle='rgba(255,255,255,.022)'; g.lineWidth=1;
      g.strokeRect(i*64, 152+j*64, 64, 64);
    }
    // dado rail
    g.fillStyle='#123a4c'; g.fillRect(0, 412, SEP_ROOM, 10);
    g.fillStyle='rgba(255,255,255,.04)'; g.fillRect(0, 412, SEP_ROOM, 3);

    // service pipes along the ceiling
    pipeSeg(0, 46, SEP_ROOM, 46, 13, {shell:'#2c6076', inner:'#1b4053'});
    pipeSeg(0, 66, SEP_ROOM, 66, 9,  {shell:'#3a7a6a', inner:'#245046'});
    flowDots([[0,46],[SEP_ROOM,46]], 1.3, .45, 'rgba(150,235,255,.5)', 3);

    // strip lights and their cones
    for (const b of SEP_BAYS){
      g.fillStyle='#1c3a49'; rr(b.x-62, 92, 124, 15, 4); g.fill();
      g.fillStyle='rgba(225,248,255,.85)'; rr(b.x-56, 100, 112, 6, 3); g.fill();
      const lamp = g.createLinearGradient(0, 107, 0, 560);
      lamp.addColorStop(0,'rgba(190,235,255,.16)'); lamp.addColorStop(1,'rgba(190,235,255,0)');
      g.fillStyle = lamp;
      g.beginPath(); g.moveTo(b.x-56,107); g.lineTo(b.x+56,107);
      g.lineTo(b.x+160,560); g.lineTo(b.x-160,560); g.closePath(); g.fill();
    }

    /* ---- wall furniture between and behind the bays ---- */
    for (let i=0;i<SEP_BAYS.length;i++){
      const b = SEP_BAYS[i];
      // glassware shelf behind the bench
      g.fillStyle='#1a3f52'; rr(b.x-150, 268, 300, 126, 5); g.fill();
      g.fillStyle='#143444'; rr(b.x-150, 268, 300, 126, 5); g.fill();
      g.strokeStyle='#27596f'; g.lineWidth=2.4; rr(b.x-150, 268, 300, 126, 5); g.stroke();
      for (let sh=0; sh<2; sh++){
        const sy = 324 + sh*60;
        g.fillStyle='#27596f'; g.fillRect(b.x-150, sy, 300, 6);
        // bottles and flasks
        for (let k=0;k<7;k++){
          const gx = b.x-132 + k*42, seed2 = i*13+sh*7+k;
          const hgt = 22 + nz(seed2)*20, wdt = 11 + nz(seed2+3)*9;
          const col = ['#6fd8c8','#f0c05a','#e07a90','#8fb8f0','#a8e08a'][Math.floor(nz(seed2+9)*5)];
          g.fillStyle='rgba(220,245,255,.16)';
          rr(gx-wdt/2, sy-hgt, wdt, hgt, 3); g.fill();
          g.fillStyle=col; g.globalAlpha=.55;
          rr(gx-wdt/2+1.5, sy-hgt*0.55, wdt-3, hgt*0.55-1.5, 2.5); g.fill();
          g.globalAlpha=1;
          g.strokeStyle='rgba(225,245,255,.34)'; g.lineWidth=1.2;
          rr(gx-wdt/2, sy-hgt, wdt, hgt, 3); g.stroke();
          g.fillStyle='rgba(200,225,238,.5)'; g.fillRect(gx-2.2, sy-hgt-5, 4.4, 5);
        }
      }
      // a small poster between bays
      if (i < SEP_BAYS.length-1){
        const px = (b.x + SEP_BAYS[i+1].x)/2;
        g.fillStyle='#e8e2d0'; rr(px-52, 282, 104, 130, 4); g.fill();
        g.strokeStyle='#b8b0a0'; g.lineWidth=2; rr(px-52, 282, 104, 130, 4); g.stroke();
        txt(['KNOW YOUR','BOILING','POINTS'][0], px, 300, 11, '#2a3a44');
        // a tiny column diagram
        g.strokeStyle='#4a7a92'; g.lineWidth=2.4;
        g.strokeRect(px-13, 316, 26, 74);
        for (let k=0;k<5;k++){ g.beginPath(); g.moveTo(px-11, 326+k*13); g.lineTo(px+11, 326+k*13); g.stroke(); }
        txt('read the feed', px, 404, 10, '#5a6a74','center',400);
      }
    }
    // extractor hood at the far end
    g.fillStyle='#25505f'; rr(SEP_ROOM-230, 240, 190, 60, 6); g.fill();
    g.fillStyle='#1b3e4b'; rr(SEP_ROOM-200, 100, 44, 145, 4); g.fill();
    g.strokeStyle='#3a7288'; g.lineWidth=2.2; rr(SEP_ROOM-230, 240, 190, 60, 6); g.stroke();
    txt('EXTRACT', SEP_ROOM-135, 270, 15, '#7fd0f0');
    // exit door at the far right
    g.fillStyle='#0a2433'; rr(SEP_ROOM-120, 396, 96, 214, 6); g.fill();
    g.strokeStyle= this.solved.every(Boolean) ? '#3fd07f' : 'rgba(120,150,165,.45)';
    g.lineWidth=3; rr(SEP_ROOM-120, 396, 96, 214, 6); g.stroke();
    txt('EXIT', SEP_ROOM-72, 372, 16,
        this.solved.every(Boolean) ? '#3fd07f' : 'rgba(150,180,195,.55)');
    // floor
    const fl = g.createLinearGradient(0,610,0,H);
    fl.addColorStop(0,'#1a4457'); fl.addColorStop(1,'#0a2130');
    g.fillStyle=fl; g.fillRect(0,610,SEP_ROOM,H-610);
    g.fillStyle='rgba(245,181,61,.4)'; g.fillRect(0,612,SEP_ROOM,4);
    for (let i=0;i<SEP_ROOM/60;i++){ g.strokeStyle='rgba(255,255,255,.028)'; g.lineWidth=2;
      g.beginPath(); g.moveTo(i*60,616); g.lineTo(i*60-70,H); g.stroke(); }

    this.drawPPEStation();

    /* ================= bays ================= */
    let nearBay = -1;
    SEP_BAYS.forEach((b,i)=>{
      const solved = this.solved[i];
      const active = this.mode==='bay' && this.bayI===i;
      // bench
      g.fillStyle='#3a5666'; rr(b.x-170, 560, 340, 18, 5); g.fill();
      g.fillStyle='#2b4250'; rr(b.x-160, 578, 320, 34, 4); g.fill();
      g.fillStyle='#213543'; rr(b.x-160, 578, 320, 8, 3); g.fill();
      // install pad
      const padOn = active && (this.phase==='pick');
      g.fillStyle = solved ? 'rgba(63,208,127,.14)'
                  : padOn ? `rgba(35,166,224,${.2+Math.sin(T/10)*.1})` : 'rgba(35,166,224,.07)';
      g.beginPath(); g.ellipse(b.x+96, 610, 76, 17, 0, 0, 7); g.fill();
      g.strokeStyle = solved ? 'rgba(63,208,127,.5)' : 'rgba(35,166,224,.35)';
      g.lineWidth=2; g.setLineDash([7,7]);
      g.beginPath(); g.ellipse(b.x+96, 610, 76, 17, 0, 0, 7); g.stroke(); g.setLineDash([]);

      // sample sitting on the bench (it is consumed once the unit runs)
      const consumed = active && (this.phase==='run' || this.phase==='react');
      if (!solved && !consumed) sepSample(b.sample, b.x-70, 560);
      else if (!solved && consumed) { /* the jar takes its place below */ }
      else {
        // solved: show the chosen unit standing proud
        const u = sepUnit(b.right);
        u.draw(b.x+96, 610, u.sc*0.9, {run:true});
        productJar(b.x-70, 558, true, null);
      }

      // bay label
      panel(b.x-96, 212, 192, 40, 'rgba(5,22,33,.9)',
            solved ? 'rgba(63,208,127,.6)' : 'rgba(35,166,224,.45)', 8);
      txt(b.tag, b.x, 232, 15, solved ? '#8fe8b8' : '#9fd8ef');

      // the unit being built / run, during the bay sequence
      if (active && (this.phase==='build' || this.phase==='run' || this.phase==='react')){
        const u = sepUnit(this.choice);
        if (this.phase === 'build'){
          const k = this.pk/70;
          if (k > .3){
            g.save(); g.globalAlpha = clamp((k-.3)/.4,0,1);
            u.draw(b.x+96, 610, u.sc, {});
            g.restore();
          }
          buildCloud(b.x+96, 574, 74, k);
        } else {
          sepOutcome(this.fail, this.choice, b.x+96, 610, this.pk/90);
          productJar(b.x-70, 558, this.ok, this.fail);
        }
      }

      if (this.mode==='free' && !solved && Math.abs(this.px - b.x) < 110) nearBay = i;
    });

    drawParts();

    /* ================= the engineer ================= */
    const talking = this.convo && !this.convo.done;
    let face = 'neutral', sweat = 0, armF, tilt = 0, lift = 0;
    if (this.mode==='bay' && this.phase==='react'){
      if (this.ok){ face = 'proud'; armF = -2.2 + Math.sin(T/7)*0.25; }
      else { face = 'shock'; sweat = 2; armF = -1.0; }
      lift = this.ok ? -Math.abs(Math.sin(T/9))*9 : 0;
      tilt = this.ok ? 0 : Math.sin(T/6)*0.05;
    } else if (this.mode==='bay' && this.phase==='build'){
      face = 'happy'; armF = -1.5 + Math.sin(T/5)*0.6;
    } else if (this.ppeAnim > 0){ face = 'happy'; armF = -2.4; }
    drawPerson(hero, this.px, this.py, 2.0, {
      dir:this.face, walk:this.walkT, face, sweat, armF, tilt, lift, seed:5,
      talk: talking, ppe:{ hat:true, goggles:G.ppe.goggles, coat:G.ppe.coat }
    });
    if (this.ppeAnim > 0){
      this.ppeAnim -= dt;
      for (let i=0;i<2;i++) emitSpark(this.px+rnd(-26,26), this.py-rnd(90,190), 1, '#bff2ff');
    }

    g.restore();  /* ---- end of world transform ---- */

    /* ================= movement ================= */
    if (this.mode === 'walkin'){
      this.px += 3.2*dt; this.walkT += dt*2.4; this.face='right';
      this.stepT += dt; if (this.stepT>12){ this.stepT=0; SFX.step(); }
    }
    else if (this.mode === 'free'){
      let dx=0, dy=0;
      if (keys.ArrowLeft||keys.a||keys.A) dx--;
      if (keys.ArrowRight||keys.d||keys.D) dx++;
      if (keys.ArrowUp||keys.w||keys.W) dy--;
      if (keys.ArrowDown||keys.s||keys.S) dy++;
      if (dx) this.face = dx>0?'right':'left';
      if ((dx||dy) && !trans){
        this.px = clamp(this.px + dx*3.6*dt, 46, SEP_ROOM-46);
        this.py = clamp(this.py + dy*1.9*dt, 578, 672);
        this.walkT += dt*2.4;
        this.stepT += dt; if (this.stepT>12){ this.stepT=0; SFX.step(); }
      } else this.walkT = 0;

      // PPE prompt
      if (Math.abs(this.px-170) < 100 && this.ppeStage < 2){
        this.promptAt(170-cam, 'SPACE   —   suit up', '#f5c22b');
        if (keyPressed(' ','Enter','Space')) this.tryPPE();
      }
      else if (nearBay >= 0){
        const b = SEP_BAYS[nearBay];
        this.promptAt(b.x-cam, 'SPACE   —   work this sample', '#3fd0c0');
        if (keyPressed(' ','Enter','Space')) this.openBay(nearBay);
      }
      // leaving
      if (this.px > SEP_ROOM-80 && this.solved.every(Boolean)) go(S_hub, 'fade');
    }

    if (this.ppeMsgT > 0){
      this.ppeMsgT -= dt;
      bubble(this.ppeMsg, this.px - cam, this.py - 196, {w:290, size:17, pop:1});
    }
    if (this.mutterT > 0 && this.mode !== 'bay'){
      this.mutterT -= dt;
      if (this.mutterT < 180)
        bubble(this.mutter, this.px - cam, this.py - 196, {w:300, size:17, pop:1});
    }

    /* ================= the bay panel ================= */
    if (this.mode === 'bay') this.drawBay(cam);

    /* ================= hint + hud ================= */
    if (this.mode === 'bay' && this.phase === 'pick'){
      const b = SEP_BAYS[this.bayI];
      if (Hint.draw(76, 150, 210, 250)) Hint.use(b.hint);
    } else if (this.mode !== 'bay') {
      if (Hint.draw(76, 150, 210, 250))
        Hint.use('Read what the feed actually is. Solid or liquid, gas or not, and what you were handed to work with.');
    }

    vignette(.34);
    const n = this.solved.filter(Boolean).length;
    hudEl.textContent = `Separation Techniques Lab   ·   samples ${n}/${SEP_BAYS.length}` +
      (this.ppeStage<2 ? '   ·   PPE not worn' : '   ·   PPE on');
  },

  promptAt(sx, label, col){
    g.save(); g.shadowColor='rgba(0,0,0,.5)'; g.shadowBlur=12;
    g.fillStyle='rgba(5,22,33,.96)'; rr(sx-140, 396, 280, 42, 10); g.fill(); g.restore();
    g.strokeStyle=col; g.lineWidth=2.2; rr(sx-140, 396, 280, 42, 10); g.stroke();
    txt(label, sx, 418, 17, '#eaf4fa');
  },

  openBay(i){
    SFX.click();
    this.mode='bay'; this.bayI=i; this.phase='show'; this.pk=0;
    this.choice=null; this.ok=false; this.fail=null;
    const b = SEP_BAYS[i];
    const sk = skill('sep');
    const lines = [{ by:hero.name, text:b.prompt, at:()=>[W/2, 300], w:420 }];
    if (sk === 2) lines.push({ by:hero.name, text:b.strong, at:()=>[W/2, 300], w:380 });
    if (sk === 0) lines.push({ by:hero.name, text:b.weak,   at:()=>[W/2, 300], w:380, think:true });
    this.convo = Convo(lines, ()=>{ this.phase='pick'; this.convo=null; });
  },

  drawBay(cam){
    const b = SEP_BAYS[this.bayI];
    const sk = skill('sep');

    if (this.phase === 'show'){
      shade(.74);
      // a soft spotlight on the sample while the engineer reads it
      const sp = g.createRadialGradient(W/2, 300, 30, W/2, 300, 340);
      sp.addColorStop(0,'rgba(120,200,240,.20)'); sp.addColorStop(1,'rgba(120,200,240,0)');
      g.fillStyle = sp; g.fillRect(0,0,W,H);
      g.fillStyle='rgba(35,166,224,.10)';
      g.beginPath(); g.ellipse(W/2, 312, 190, 30, 0, 0, 7); g.fill();
      sepSample(b.sample, W/2, 300);
      txt(b.tag, W/2, 56, 16, '#f5b53d');
      txt('reading the feed', W/2, 84, 26, '#cfe6f2','center',400);
      if (this.convo) this.convo.draw();
      return;
    }

    if (this.phase === 'pick'){
      /* the unit tray along the bottom */
      const n = SEP_UNITS.length, tw = 196, gap = 14;
      const x0 = (W - (n*tw + (n-1)*gap))/2;
      g.fillStyle='rgba(3,14,22,.97)'; g.fillRect(0, H-208, W, 208);
      g.strokeStyle='rgba(35,166,224,.3)'; g.lineWidth=2;
      g.beginPath(); g.moveTo(0,H-208); g.lineTo(W,H-208); g.stroke();
      txt('pick the unit and drop it on the pad', W/2, H-186, 17, '#9fd8ef','center',400);

      SEP_UNITS.forEach((u,i)=>{
        const x = x0 + i*(tw+gap), y = H-168, h = 152;
        const z = zone(x, y, tw, h);
        // ghost highlight from the engineer's instincts
        const ghostGood = (sk===2) && u.id===b.right;
        const ghostBad  = (sk===0) && u.id===b.weakPick;
        const hinted    = G.hintUsed['sep'] && Hint.shown>0 && u.id===b.right;
        let ring = null;
        if (ghostGood || hinted) ring = 'rgba(63,208,127,';
        else if (ghostBad) ring = 'rgba(238,95,110,';
        g.save();
        if (z.hover){ g.shadowColor='#23a6e0'; g.shadowBlur=20; }
        g.fillStyle = z.hover ? 'rgba(16,58,80,.98)' : 'rgba(8,32,46,.94)';
        rr(x, z.hover?y-4:y, tw, h, 10); g.fill();
        g.restore();
        if (ring){
          g.strokeStyle = ring + (0.5 + Math.sin(T/10)*0.35) + ')'; g.lineWidth = 3.4;
        } else { g.strokeStyle = z.hover ? '#23a6e0' : 'rgba(35,166,224,.3)'; g.lineWidth = 2; }
        rr(x, z.hover?y-4:y, tw, h, 10); g.stroke();
        const yy = z.hover?y-4:y;
        g.save();
        g.translate(x+tw/2, yy+110); g.scale(0.86, 0.86);
        u.draw(0, 0, u.sc, { run: z.hover });
        g.restore();
        txt(u.name, x+tw/2, yy+128, 17, z.hover?'#fff':'#cfe6f2');
        txt(u.sub,  x+tw/2, yy+144, 12, 'rgba(159,216,239,.7)','center',400);
        if (z.clicked) this.choose(u.id);
      });

      /* the brief stays on screen */
      panel(W/2-330, 178, 660, 92, 'rgba(4,18,28,.92)', 'rgba(35,166,224,.5)');
      txt(b.tag, W/2, 202, 14, '#f5b53d');
      wrapText(b.prompt, W/2, 232, 600, 24, 19, '#dceaf2', 'center', 400);
      return;
    }

    if (this.phase === 'build'){
      this.pk += dt;
      if (!this.placedSfx){ this.placedSfx = true; SFX.place(); }
      if (this.pk > 70){ this.phase='run'; this.pk=0;
        if (this.ok) SFX.good(); else { SFX.bad(); if (this.fail==='burnt') SFX.fire();
          if (this.fail==='flood'||this.fail==='sludge') SFX.pour();
          if (this.fail==='goo') SFX.squelch();
          if (this.fail==='crust') SFX.steam(); shake(7); }
      }
      return;
    }

    if (this.phase === 'run'){
      this.pk += dt;
      if (this.pk > 90){ this.phase='react'; this.pk=0; this.reactT=0;
        if (this.ok) SFX.great(); else SFX.wahwah();
      }
      return;
    }

    if (this.phase === 'react'){
      this.pk += dt;
      const b2 = SEP_BAYS[this.bayI];
      const msg = this.ok ? b2.why : (b2.wrong[this.choice] || {line:'That is not the one.'}).line;
      panel(W/2-350, H-160, 700, 116, this.ok?'rgba(10,44,32,.95)':'rgba(48,16,22,.95)',
            this.ok?'#3fd07f':'#ee5f6e');
      txt(this.ok ? 'THAT IS THE ONE' : 'NOT THAT ONE', W/2, H-126, 26, this.ok?'#3fd07f':'#ee5f6e');
      wrapText(msg, W/2, H-88, 640, 25, 19, '#e4eef4','center',400);

      if (this.pk > 60){
        if (button(this.ok ? 'NEXT SAMPLE' : 'TRY AGAIN', W/2-110, H-40, 220, 34,
                   {col:this.ok?'#3fd07f':'#ee5f6e', size:16})){
          if (this.ok){
            this.solved[this.bayI] = true;
            this.mode='free'; this.convo=null;
            if (this.solved.every(Boolean)){
              toast('All five samples cleared. Head for the exit on the right.');
            }
          } else {
            this.phase='pick'; this.pk=0;
            // an average engineer works it out after failing once
            if (skill('sep')===1) hero._sepLearned = true;
          }
        }
      }
      return;
    }
  },

  choose(id){
    const b = SEP_BAYS[this.bayI];
    this.choice = id;
    this.ok = (id === b.right);
    this.fail = this.ok ? null : (b.wrong[id] ? b.wrong[id].fail : 'blow');
    this.phase = 'build'; this.pk = 0; this.placedSfx = false;
    if (!this.ok) G.blunders++;
  }
};
