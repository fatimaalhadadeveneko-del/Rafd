/* ============================================================
   Break Room  →  the thermodynamics nightmare  →  back again
   ============================================================ */

/* ---------- break room furniture ---------- */
function couch(x, y, s){
  g.save(); g.translate(x,y); g.scale(s,s);
  g.fillStyle='rgba(0,0,0,.25)'; g.beginPath(); g.ellipse(0,2,120,12,0,0,7); g.fill();
  g.fillStyle='#4a5f72'; rr(-118,-96,236,74,14); g.fill();          // back
  g.fillStyle='#5a7186'; rr(-118,-40,236,42,10); g.fill();          // seat
  g.fillStyle='#3d5164'; rr(-126,-58,24,58,8); g.fill();            // arms
  g.fillStyle='#3d5164'; rr(102,-58,24,58,8); g.fill();
  g.strokeStyle='rgba(0,0,0,.18)'; g.lineWidth=2;
  g.beginPath(); g.moveTo(-40,-96); g.lineTo(-40,-24); g.moveTo(40,-96); g.lineTo(40,-24); g.stroke();
  g.fillStyle='#2f4050'; rr(-104,0,16,14,3); g.fill(); rr(88,0,16,14,3); g.fill();
  g.restore();
}
function vending(x, y, s){
  g.save(); g.translate(x,y); g.scale(s,s);
  g.fillStyle='#2a3f4e'; rr(-52,-190,104,190,8); g.fill();
  g.fillStyle='#16303e'; rr(-44,-178,66,140,5); g.fill();
  for (let r=0;r<4;r++) for (let c=0;c<3;c++){
    g.fillStyle = ['#e0566a','#3fb27f','#f0a02a','#5f7ae0'][(r+c)%4];
    rr(-40+c*21, -172+r*34, 15, 26, 3); g.fill();
  }
  g.fillStyle='#0d2230'; rr(26,-178,20,140,4); g.fill();
  for (let i=0;i<4;i++){ g.fillStyle='#4d6d80'; rr(30,-170+i*22,12,8,2); g.fill(); }
  g.fillStyle='#f5c22b'; rr(-44,-30,88,18,4); g.fill();
  txt('SNACKS', 0, -21, 12, '#2a2a2a');
  g.restore();
}
function waterCooler(x,y,s){
  g.save(); g.translate(x,y); g.scale(s,s);
  g.fillStyle='#e8eef2'; rr(-22,-70,44,70,5); g.fill();
  g.strokeStyle='#bcc9d2'; g.lineWidth=2; rr(-22,-70,44,70,5); g.stroke();
  g.fillStyle='rgba(120,210,245,.55)';
  g.beginPath(); g.moveTo(-18,-70); g.lineTo(18,-70); g.lineTo(14,-124); g.lineTo(-14,-124); g.closePath(); g.fill();
  g.strokeStyle='rgba(200,235,250,.8)'; g.lineWidth=2;
  g.beginPath(); g.moveTo(-18,-70); g.lineTo(-14,-124); g.lineTo(14,-124); g.lineTo(18,-70); g.stroke();
  for (let i=0;i<3;i++){ g.fillStyle='rgba(255,255,255,.6)';
    g.beginPath(); g.arc(-6+i*6, -88 - ((T*0.8+i*14)%30), 2.6, 0, 7); g.fill(); }
  g.fillStyle='#5a7186'; rr(-8,-46,16,10,2); g.fill();
  g.restore();
}

/* ============================================================
   S_brk — before and after the dream
   ============================================================ */
const S_brk = {
  enter(){
    Hint.begin('brk');
    this.after = !!G.dreamt;
    Music.play(this.after ? 'lab' : 'lab');
    this.px = this.after ? 640 : 60;
    this.py = 618; this.face='right'; this.walkT=0; this.stepT=0;
    this.mode = this.after ? 'wake' : 'walkin';
    this.convo = null; this.reply = null; this.zT = 0; this.sitK = 0;
    this.gaspT = 0;
    if (this.after){
      this.mode='wake'; this.gaspT = 70; SFX.gasp();
      after(60, ()=>{
        this.convo = Convo([
          { by:NPCS.colleague.name, text:'Hey. Hey! Are you alright? You shouted.',
            at:()=>[880, 372], w:320 },
          { by:hero.name, text:'Yes. Yes. Thank God that was only a dream.',
            at:()=>[this.px, 372], w:320 },
          { by:NPCS.colleague.name, text:'Break is over anyway. Mr. Tarek is asking for you.',
            at:()=>[880, 372], w:320 }
        ], ()=>{ this.convo=null; this.mode='leave';
                 toast('Walk out to the right. Mr. Tarek is waiting.'); });
      });
    } else {
      after(64, ()=>{ this.mode='free'; });
    }
  },
  exit(){ if (G.dreamt) G.done.brk = true; },

  draw(){
    /* ---------------- the room ---------------- */
    const wall = g.createLinearGradient(0,0,0,600);
    wall.addColorStop(0,'#3b3550'); wall.addColorStop(.6,'#2d2840'); wall.addColorStop(1,'#241f33');
    g.fillStyle = wall; g.fillRect(0,0,W,600);
    // ceiling tiles
    g.fillStyle='#463f5e'; g.fillRect(0,0,W,58);
    for (let i=0;i<W/88;i++){ g.strokeStyle='rgba(0,0,0,.14)'; g.lineWidth=2;
      g.strokeRect(i*88, 0, 88, 58); }
    // warm ceiling lights
    for (const lx of [300, 640, 980]){
      g.fillStyle='rgba(255,236,190,.92)'; rr(lx-52, 44, 104, 10, 4); g.fill();
      const cone = g.createLinearGradient(0,54,0,520);
      cone.addColorStop(0,'rgba(255,230,180,.13)'); cone.addColorStop(1,'rgba(255,230,180,0)');
      g.fillStyle=cone;
      g.beginPath(); g.moveTo(lx-50,54); g.lineTo(lx+50,54);
      g.lineTo(lx+160,520); g.lineTo(lx-160,520); g.closePath(); g.fill();
    }
    // a poster and a wall clock
    g.fillStyle='#e8e2d0'; rr(180, 150, 128, 96, 4); g.fill();
    g.strokeStyle='#b8b0a0'; g.lineWidth=2; rr(180, 150, 128, 96, 4); g.stroke();
    txt('TAKE YOUR', 244, 176, 13, '#3a4a54'); txt('BREAK', 244, 198, 20, '#c05a6a');
    txt('it is policy', 244, 224, 11, '#6a7a86','center',400);
    g.fillStyle='#e8eef2'; g.beginPath(); g.arc(1080, 190, 40, 0, 7); g.fill();
    g.strokeStyle='#8d9aa4'; g.lineWidth=3; g.beginPath(); g.arc(1080, 190, 40, 0, 7); g.stroke();
    g.strokeStyle='#2a3a44'; g.lineWidth=3; g.lineCap='round';
    g.beginPath(); g.moveTo(1080,190); g.lineTo(1080+Math.cos(T/400-1.2)*22, 190+Math.sin(T/400-1.2)*22);
    g.moveTo(1080,190); g.lineTo(1080+Math.cos(T/40)*30, 190+Math.sin(T/40)*30); g.stroke();

    // floor
    const fl = g.createLinearGradient(0,600,0,H);
    fl.addColorStop(0,'#4a4258'); fl.addColorStop(1,'#241f33');
    g.fillStyle=fl; g.fillRect(0,600,W,H-600);
    g.fillStyle='rgba(0,0,0,.12)'; g.fillRect(0,600,W,5);
    for (let i=0;i<70;i++){ g.fillStyle='rgba(255,255,255,.035)';
      g.fillRect(nz(i)*W, 606+nz(i+30)*110, 3, 3); }

    vending(170, 600, 1.0);
    waterCooler(1180, 600, 1.0);
    // table with mugs
    g.fillStyle='#6a5540'; rr(400, 556, 180, 12, 4); g.fill();
    g.fillStyle='#55442f'; rr(414, 568, 12, 44, 3); g.fill(); rr(554, 568, 12, 44, 3); g.fill();
    for (let i=0;i<2;i++){ g.fillStyle='#e8eef2'; rr(424+i*46, 534, 22, 22, 4); g.fill();
      if (Math.random()<.08) emitSteam(435+i*46, 532, 1, {speed:.4, col:'rgba(210,190,170,.4)'}); }

    couch(880, 604, 1.0);

    /* ---------------- the other colleagues, who do not talk ---------------- */
    const stu = { skin:'#c99a6e', hair:'#2a1c14', hairStyle:'neat',
                  suit:'#6a7a88', suit2:'#4c5a66', trim:'#c0ccd6', accent:'#88a0b0' };
    const stu2 = { skin:'#e0b48c', hair:'#3a2a1a', hairStyle:'cap',
                   suit:'#7a6a90', suit2:'#5a4d6c', trim:'#d8cfe8', accent:'#f0c05a' };
    drawPerson(stu,  790, 604, 1.75, { dir:'right', face:'neutral', seed:11 });
    drawPerson(stu2, 985, 604, 1.75, { dir:'left',  face:'happy',   seed:17 });

    /* ---------------- Dina ---------------- */
    const dinaX = 880;
    const dinaTalk = this.convo && this.convo.speaking(NPCS.colleague.name);
    drawPerson(NPCS.colleague, dinaX, 566, 1.85, {
      dir: this.px < dinaX ? 'left' : 'right',
      face: this.mode==='wake' ? 'shock' : 'happy',
      talk: dinaTalk, seed:9,
      armF: dinaTalk ? -0.7 - Math.sin(T/9)*0.35 : undefined, armFBend: dinaTalk ? 0.9 : undefined
    });
    txt(NPCS.colleague.name, dinaX, 596, 13, 'rgba(234,244,250,.5)');

    drawParts();

    /* ---------------- the player ---------------- */
    let hopt = { dir:this.face, walk:this.walkT, seed:5,
                 ppe:{ hat:false, goggles:false, coat:G.ppe.coat } };
    if (this.mode === 'sleep'){
      hopt = Object.assign(hopt, { dir:'right', walk:0, face:'sleep',
        lift:-38, headTilt:0.42, armF:0.1, armB:-0.1, squash:0.96 });
      this.zT += dt;
      if (this.zT > 34){ this.zT = 0; emitZ(this.px+26, this.py-168); }
    } else if (this.mode === 'wake'){
      hopt = Object.assign(hopt, { dir:'right', walk:0,
        face: this.gaspT>0 ? 'panic' : 'worry', lift:-38,
        sweat: this.gaspT>0 ? 3 : 1, armF:-1.3, armB:-1.1 });
      if (this.gaspT>0) this.gaspT -= dt;
    } else if (this.mode === 'chat'){
      hopt.face = 'happy';
    }
    drawPerson(hero, this.px, this.py, 1.95, hopt);

    /* ---------------- flow ---------------- */
    if (this.mode === 'walkin'){
      this.px += 3.2*dt; this.walkT += dt*2.4;
      this.stepT+=dt; if (this.stepT>12){this.stepT=0;SFX.step();}
    }
    else if (this.mode === 'free'){
      let dx=0,dy=0;
      if (keys.ArrowLeft||keys.a||keys.A) dx--;
      if (keys.ArrowRight||keys.d||keys.D) dx++;
      if (keys.ArrowUp||keys.w||keys.W) dy--;
      if (keys.ArrowDown||keys.s||keys.S) dy++;
      if (dx) this.face = dx>0?'right':'left';
      if ((dx||dy) && !trans){
        this.px = clamp(this.px + dx*3.6*dt, 46, W-46);
        this.py = clamp(this.py + dy*1.7*dt, 604, 672);
        this.walkT += dt*2.4;
        this.stepT+=dt; if (this.stepT>12){this.stepT=0;SFX.step();}
      } else this.walkT = 0;

      if (Math.abs(this.px - dinaX) < 150){
        panel(dinaX-160, 300, 320, 42, 'rgba(14,10,22,.96)', '#9b8cf0', 10);
        txt('SPACE   —   talk to Dina', dinaX, 322, 16, '#eaf4fa');
        if (keyPressed(' ','Enter','Space')) this.startChat();
      }
    }
    else if (this.mode === 'tocouch'){
      const tx = 880;
      if (Math.abs(this.px - tx) > 4){
        this.px += Math.sign(tx - this.px) * 2.6 * dt;
        this.face = tx > this.px ? 'right' : 'left';
        this.walkT += dt*2.2;
        this.stepT+=dt; if (this.stepT>12){this.stepT=0;SFX.step();}
      } else if (!this.sitting){
        this.sitting = true; this.walkT = 0;
        SFX.sleep();
        this.mode='sleep';
        after(200, ()=>{ SFX.dream(); G.dreamt = true; go(S_dream, 'ripple'); });
      }
    }
    else if (this.mode === 'leave'){
      let dx=0;
      if (keys.ArrowLeft||keys.a||keys.A) dx--;
      if (keys.ArrowRight||keys.d||keys.D) dx++;
      if (dx) this.face = dx>0?'right':'left';
      if (dx && !trans){ this.px = clamp(this.px + dx*3.6*dt, 46, W-20);
        this.walkT += dt*2.4;
        this.stepT+=dt; if (this.stepT>12){this.stepT=0;SFX.step();} }
      else this.walkT = 0;
      if (this.px > W-60){ G.done.brk = true; go(S_hub, 'fade'); }
      txt('→', W-40, 470, 40, `rgba(63,208,127,${.5+Math.sin(T/12)*.4})`);
    }

    /* ---------------- reply buttons ---------------- */
    if (this.mode === 'chat' && this.reply === 'pick'){
      const opts = [
        { t:'Honestly? I am holding it together with tape.', k:'tired' },
        { t:'Flawless. Nothing exploded that was not supposed to.', k:'smug' }
      ];
      opts.forEach((o,i)=>{
        const bw=520, bh=54, bx=W/2-bw/2, by=572+i*62;
        const z = zone(bx,by,bw,bh);
        g.save(); if (z.hover){ g.shadowColor='#9b8cf0'; g.shadowBlur=20; }
        g.fillStyle = z.hover ? 'rgba(44,32,72,.98)' : 'rgba(20,14,32,.94)';
        rr(bx,by,bw,bh,10); g.fill(); g.restore();
        g.strokeStyle = z.hover ? '#9b8cf0' : 'rgba(155,140,240,.4)';
        g.lineWidth=2; rr(bx,by,bw,bh,10); g.stroke();
        txt(o.t, bx+bw/2, by+bh/2, 18, z.hover?'#fff':'#d8d0f0','center',400);
        if (z.clicked) this.answer(o.k);
      });
    }

    if (this.convo) this.convo.draw();

    if (this.mode === 'sleep'){
      txt('...', this.px+40, this.py-200, 26, 'rgba(200,220,245,.6)');
    }

    vignette(.4);
    hudEl.textContent = this.after ? 'Break Room   ·   that was unpleasant'
                                   : 'Break Room   ·   you have earned this';
  },

  startChat(){
    SFX.click();
    this.mode='chat';
    this.convo = Convo([
      { by:NPCS.colleague.name, text:'You survived the morning. How is it going out there?',
        at:()=>[880, 372], w:330 }
    ], ()=>{ this.convo=null; this.reply='pick'; });
  },

  answer(k){
    SFX.click(); this.reply=null;
    const mine = k==='tired'
      ? 'Honestly? I am holding it together with tape.'
      : 'Flawless. Nothing exploded that was not supposed to.';
    const hers = k==='tired'
      ? 'That is what tape is for. Sit down before you fall down.'
      : 'That is the most dangerous sentence in this building. Sit. Rest.';
    this.convo = Convo([
      { by:hero.name, text:mine, at:()=>[this.px, 372], w:330 },
      { by:NPCS.colleague.name, text:hers, at:()=>[880, 372], w:330 },
      { by:NPCS.colleague.name, text:'Take the couch. You have earned it.',
        at:()=>[880, 372], w:300 }
    ], ()=>{ this.convo=null; this.mode='tocouch'; });
  }
};

/* ============================================================
   S_dream — the thermodynamics classroom
   ============================================================ */
const DREAM_Q = [
  { q:'Heat flows from which body to which?',
    opts:['cold to hot','hot to cold','neither, they agree'], a:1 },
  { q:'Two bodies in thermal equilibrium means they share the same...',
    opts:['temperature','mass','volume'], a:0 },
  { q:'In a CLOSED system, energy crosses the boundary as...',
    opts:['kinetic and potential energy','heat and work','mass transfer'], a:1 },
  { q:'Define entropy.   Δ∮δQ⁄T  ≥  ∂Ω⁄∂ξ',
    opts:['◍⟡ϟ⟠','⟆ϙ϶ϗ','ϡ⟒⟓⟔'], a:-1, blur:true }
];

const S_dream = {
  enter(){
    Music.play('tense');
    this.phase='open';      // open | called | quiz | stamp | fall | laugh
    this.qi = 0; this.timer = 0; this.fb = 0; this.ok = false;
    this.correct = 0; this.scored = false;
    this.heroX = 980; this.heroY = 560; this.boardX = 470;
    this.walking = false; this.fallK = 0; this.stampK = 0; this.fT = 0;
    this.convo = Convo([
      { by:'Dr. Sabbagh', text:'Are you paying attention?', at:()=>[286, 342], w:280 },
      { by:'Dr. Sabbagh', text:'No. You are not. Come to the board.', at:()=>[286, 342], w:300 }
    ], ()=>{ this.convo=null; this.phase='called'; this.walking=true; });
    after(20, ()=> SFX.yell());
  },
  exit(){
    if (!this.scored){ this.scored = true; award('the', this.correct, 3); }
  },

  draw(){
    /* ---------------- the classroom, from the reference photo ---------------- */
    g.fillStyle='#d8d2c4'; g.fillRect(0,0,W,H);
    // drop ceiling
    g.fillStyle='#e6e2d8'; g.fillRect(0,0,W,96);
    for (let i=0;i<W/96;i++) for (let j=0;j<2;j++){
      g.strokeStyle='rgba(120,116,104,.35)'; g.lineWidth=2;
      g.strokeRect(i*96, j*48, 96, 48);
    }
    // wall
    const wl = g.createLinearGradient(0,96,0,540);
    wl.addColorStop(0,'#ece7db'); wl.addColorStop(1,'#d9d3c4');
    g.fillStyle=wl; g.fillRect(0,96,W,444);
    // skirting / wall base line
    g.fillStyle='#c0b9a8'; g.fillRect(0,528,W,10);

    // projector screen with a process flow diagram
    g.fillStyle='#f6f7f4'; rr(60, 120, 340, 250, 4); g.fill();
    g.strokeStyle='#b5ae9c'; g.lineWidth=3; rr(60, 120, 340, 250, 4); g.stroke();
    g.save(); g.beginPath(); rr(64,124,332,242,3); g.clip();
    g.fillStyle='#fdfdfb'; g.fillRect(64,124,332,242);
    txt('...truction', 130, 146, 19, '#2a3a48','left');
    // a scrappy PFD
    g.strokeStyle='#7f96a6'; g.lineWidth=1.6;
    for (let i=0;i<4;i++){ g.strokeRect(86+i*76, 186, 30, 54); }
    g.beginPath();
    g.moveTo(80,212); g.lineTo(86,212);
    for (let i=0;i<3;i++){ g.moveTo(116+i*76,212); g.lineTo(162+i*76,212); }
    g.moveTo(344,212); g.lineTo(380,212); g.stroke();
    for (let i=0;i<3;i++){ g.fillStyle='#7f96a6';
      g.beginPath(); g.arc(139+i*76, 212, 4, 0, 7); g.fill(); }
    // the orange bullet panel
    g.fillStyle='#f7dcb8'; rr(230, 150, 160, 66, 3); g.fill();
    g.fillStyle='#c98a3a';
    for (let i=0;i<5;i++) g.fillRect(238, 158+i*11, 100 - (i*9)%40, 3);
    // the three icon cards
    for (let i=0;i<3;i++){
      g.fillStyle='#f2e6d4'; rr(84+i*104, 262, 92, 62, 4); g.fill();
      g.fillStyle='#c9a06a'; g.beginPath(); g.arc(102+i*104, 282, 9, 0, 7); g.fill();
      g.fillStyle='#b7ada0';
      for (let k=0;k<3;k++) g.fillRect(92+i*104, 300+k*7, 70-(k*11)%30, 3);
    }
    g.restore();
    // projector beam
    g.fillStyle='rgba(255,255,240,.18)';
    g.beginPath(); g.moveTo(W/2+180,60); g.lineTo(400,130); g.lineTo(400,364); g.closePath(); g.fill();

    // whiteboard
    g.fillStyle='#e8ecea'; rr(430, 140, 400, 210, 4); g.fill();
    g.strokeStyle='#9aa4a8'; g.lineWidth=5; rr(430, 140, 400, 210, 4); g.stroke();
    g.fillStyle='#b9c2c6'; rr(430, 350, 400, 10, 3); g.fill();

    // window
    g.fillStyle='#8fb8cc'; rr(960, 150, 200, 180, 4); g.fill();
    g.fillStyle='#b8d8e8'; rr(966, 156, 188, 168, 3); g.fill();
    g.fillStyle='#e8f2f6'; rr(966, 156, 90, 168, 3); g.fill();
    g.strokeStyle='#8a939a'; g.lineWidth=5; rr(960, 150, 200, 180, 4); g.stroke();
    g.beginPath(); g.moveTo(1060,150); g.lineTo(1060,330); g.stroke();

    // wall air conditioner
    g.fillStyle='#f0f2f0'; rr(1180, 96, 96, 44, 6); g.fill();
    g.fillStyle='#dfe3e0'; rr(1180, 122, 96, 18, 4); g.fill();
    g.strokeStyle='#b8bdb8'; g.lineWidth=2; rr(1180, 96, 96, 44, 6); g.stroke();
    txt('PEARL', 1228, 108, 9, '#8a908a');
    // exit sign
    g.fillStyle='#2a6a3a'; rr(1214, 36, 44, 24, 3); g.fill();
    txt('EXIT', 1236, 48, 11, '#dff5e4');

    // speckled floor
    const flo = g.createLinearGradient(0,540,0,H);
    flo.addColorStop(0,'#cfcabc'); flo.addColorStop(1,'#b6b1a4');
    g.fillStyle=flo; g.fillRect(0,540,W,H-540);
    for (let i=0;i<220;i++){
      g.fillStyle = i%3 ? 'rgba(120,116,104,.22)' : 'rgba(255,255,255,.3)';
      g.fillRect(nz(i)*W, 540+nz(i+90)*(H-540), 3, 3);
    }

    // chairs with the little desk arms, like the photo
    for (let i=0;i<4;i++) classChair(700 + i*150, 660 + (i%2)*8, 1.0 - (i%2)*0.04);
    for (let i=0;i<3;i++) classChair(760 + i*150, 596, 0.86);

    /* seated students who will shortly enjoy themselves */
    const stuA = { skin:'#c99a6e', hair:'#241810', hairStyle:'neat',
                   suit:'#6a7a88', suit2:'#4c5a66', trim:'#c0ccd6', accent:'#88a0b0' };
    const stuB = { skin:'#e6bb92', hair:'#1c1218', hairStyle:'hijab',
                   suit:'#4a5a7a', suit2:'#34415a', trim:'#cfd8ff', accent:'#ffd9a0' };
    const laughing = this.phase === 'laugh';
    const lg = laughing ? Math.abs(Math.sin(T/5))*8 : 0;
    drawPerson(stuA, 812, 600, 1.75, { dir:'left', face: laughing?'happy':'neutral',
      seed:13, lift:-lg, tilt: laughing ? Math.sin(T/5)*0.10 : 0 });
    drawPerson(stuB, 1058, 600, 1.75, { dir:'left', face: laughing?'happy':'neutral',
      seed:19, lift:-lg*0.8, tilt: laughing ? -Math.sin(T/5.5)*0.10 : 0 });
    if (laughing){
      txt('ha', 790 + Math.sin(T/7)*8, 470 - (T%60), 26, `rgba(60,60,70,${1-(T%60)/60})`);
      txt('ha ha', 1090 + Math.sin(T/6)*8, 480 - ((T+30)%60), 26,
          `rgba(60,60,70,${1-((T+30)%60)/60})`);
    }

    /* ---------------- the professor ---------------- */
    const profTalk = this.convo && !this.convo.done;
    const angry = this.phase==='stamp' || this.phase==='fall' || this.phase==='laugh';
    drawPerson(NPCS.prof, 300, 560, 2.15, {
      dir:'right', face: angry ? 'angry' : profTalk ? 'angry' : 'neutral',
      talk: profTalk, seed:2,
      armF: angry ? -2.5 + Math.sin(T/4)*0.3
          : profTalk ? -1.2 - Math.sin(T/8)*0.5 : undefined,
      armFBend: (angry||profTalk) ? 0.7 : undefined,
      holdDraw: (this.phase==='stamp') ? (c)=>{
        c.save(); c.rotate(-0.4);
        c.fillStyle='#3b2a20'; rr(-7,-16,14,16,3); c.fill();
        c.fillStyle='#8a6a4a'; rr(-11,0,22,9,2); c.fill();
        c.fillStyle='#c0392b'; rr(-11,9,22,5,1); c.fill();
        c.restore();
      } : null
    });

    /* ---------------- the student under examination ---------------- */
    const stress = this.phase==='quiz' ? Math.min(3, 1 + this.qi) : 0;
    const shivver = this.phase==='quiz' ? Math.sin(T*1.1)*(1.2 + this.qi*0.7) : 0;
    let hf = 'worry';
    if (this.qi >= 3 && this.phase==='quiz') hf = 'panic';
    if (this.phase==='stamp') hf = 'shock';
    if (this.phase==='fall' || this.phase==='laugh') hf = 'dead';

    if (this.phase === 'fall' || this.phase === 'laugh'){
      this.fallK = Math.min(1, this.fallK + dt/26);
      const k = easeIn(this.fallK);
      drawPerson(hero, this.boardX + 40*k, 560 + 4*k, 2.0, {
        dir:'left', face:'dead', tilt: -k*Math.PI/2*0.92, lift: -6*Math.sin(k*Math.PI),
        armF: -1.9, armB: 1.6, seed:5 });
      // the F stamped on the forehead, riding along
      g.save();
      g.translate(this.boardX + 40*k, 560 + 4*k);
      g.rotate(-k*Math.PI/2*0.92);
      g.translate(0, -192);
      g.fillStyle='rgba(200,45,40,.92)';
      g.font='700 34px "Trebuchet MS",Verdana,sans-serif';
      g.textAlign='center'; g.textBaseline='middle';
      g.save(); g.rotate(-0.18); g.fillText('F', 0, 0); g.restore();
      g.strokeStyle='rgba(200,45,40,.8)'; g.lineWidth=3;
      g.beginPath(); g.arc(0,0,26,0,7); g.stroke();
      g.restore();
      if (this.fallK >= 1 && this.phase==='fall'){
        this.phase='laugh'; SFX.laugh(); SFX.thud();
        after(150, ()=>{ SFX.swirl(); go(S_brk, 'swirl'); });
      }
    } else {
      const x = this.phase==='open' ? this.heroX : this.boardX;
      if (this.walking){
        this.heroX -= 3.4*dt;
        if (this.heroX <= this.boardX){ this.heroX = this.boardX; this.walking=false;
          this.phase='quiz'; this.timer=470; }
      }
      drawPerson(hero, (this.phase==='open'||this.walking) ? this.heroX : this.boardX + shivver,
                 560, 2.0, {
        dir: this.walking ? 'left' : 'right',
        walk: this.walking ? T*2.2 : 0,
        face: hf, sweat: stress, seed:5,
        armF: this.phase==='quiz' ? -0.35 + Math.sin(T/6)*0.12 : undefined,
        tilt: this.phase==='stamp' ? Math.sin(T/3)*0.04 : 0
      });
      if (this.phase==='stamp'){
        this.stampK += dt;
        if (this.stampK > 26 && this.stampK < 28){ SFX.stamp(); shake(14); flash(.5,'220,60,50'); }
        if (this.stampK > 28){
          g.save();
          g.translate(this.boardX + 2, 560 - 192);
          g.rotate(-0.18);
          const pop = clamp((this.stampK-28)/8, 0, 1);
          g.globalAlpha = pop;
          g.scale(lerp(2.2,1,bounce(pop)), lerp(2.2,1,bounce(pop)));
          g.fillStyle='rgba(200,45,40,.92)';
          g.font='700 34px "Trebuchet MS",Verdana,sans-serif';
          g.textAlign='center'; g.textBaseline='middle';
          g.fillText('F', 0, 0);
          g.strokeStyle='rgba(200,45,40,.8)'; g.lineWidth=3;
          g.beginPath(); g.arc(0,0,26,0,7); g.stroke();
          g.restore();
        }
        if (this.stampK > 58){ this.phase='fall'; }
      }
    }

    drawParts();

    /* ---------------- the quiz ---------------- */
    if (this.phase === 'quiz') this.drawQuiz();

    if (this.convo) this.convo.draw();

    /* a dreamlike wash over everything */
    g.fillStyle = `rgba(90,110,180,${0.06 + Math.sin(T/60)*0.03})`;
    g.fillRect(0,0,W,H);
    vignette(.36);
    hudEl.textContent = this.phase==='quiz'
      ? `Thermodynamics   ·   question ${Math.min(this.qi+1,4)}/4`
      : 'Thermodynamics';
  },

  drawQuiz(){
    const q = DREAM_Q[this.qi];
    // the question on the board
    g.save();
    if (q.blur) g.filter = 'blur(2.6px)';
    g.fillStyle='#233';
    wrapText(q.q, 630, 200, 360, 30, q.blur ? 22 : 23, '#233', 'center', 700);
    g.restore();

    // timer bar, only while no feedback is showing
    const waiting = this.fb <= 0;
    if (waiting){
      this.timer -= dt;
      const k = clamp(this.timer/470, 0, 1);
      g.fillStyle='rgba(0,0,0,.14)'; rr(430, 318, 400, 12, 6); g.fill();
      g.fillStyle = k < .3 ? '#c0392b' : '#2f7fb8'; rr(430, 318, 400*k, 12, 6); g.fill();
      if (this.timer <= 0) this.answer(-2);
    }

    // options
    q.opts.forEach((o,i)=>{
      const bw=310, bh=50, bx=W/2-bw/2+70, by=390+i*60;
      const z = zone(bx,by,bw,bh);
      g.save(); if (z.hover && waiting){ g.shadowColor='#2f7fb8'; g.shadowBlur=16; }
      g.fillStyle = z.hover && waiting ? 'rgba(255,255,255,.98)' : 'rgba(250,250,246,.92)';
      rr(bx,by,bw,bh,9); g.fill(); g.restore();
      g.strokeStyle = z.hover && waiting ? '#2f7fb8' : '#a8a89c';
      g.lineWidth=2; rr(bx,by,bw,bh,9); g.stroke();
      g.save();
      if (q.blur) g.filter='blur(2.2px)';
      txt(o, bx+bw/2, by+bh/2, 19, '#2a3a44','center',400);
      g.restore();
      if (z.clicked && waiting) this.answer(i);
    });

    if (!waiting){
      this.fb -= dt;
      const msg = this.qi>=3 ? 'WRONG.' : this.ok ? 'CORRECT' : 'WRONG';
      txtShadow(msg, W/2+70, 348, 34, this.ok && this.qi<3 ? '#2f8f5c' : '#c0392b');
      if (this.fb <= 0){ this.fb = 0; this.next(); }
    }
  },

  answer(i){
    const q = DREAM_Q[this.qi];
    this.ok = (i === q.a);
    if (this.ok){ this.correct++; SFX.good(); } else SFX.bad();
    this.fb = 60;
  },

  next(){
    this.qi++;
    if (this.qi >= DREAM_Q.length){
      // the entropy question was never going to go well
      this.phase = 'stamp'; this.stampK = 0;
      SFX.yell();
      this.convo = Convo([
        { by:'Dr. Sabbagh', text:'WRONG. Repeat the course. Repeat the whole degree.',
          at:()=>[286, 342], w:320 }
      ], ()=>{ this.convo = null; });
      return;
    }
    this.timer = 470;
  }
};

/* a lecture chair with the fold-out desk arm and a wire basket */
function classChair(x, y, s){
  g.save(); g.translate(x,y); g.scale(s,s);
  g.fillStyle='rgba(0,0,0,.16)'; g.beginPath(); g.ellipse(0,4,46,8,0,0,7); g.fill();
  // frame
  g.strokeStyle='#2a2a2e'; g.lineWidth=5; g.lineCap='round';
  g.beginPath();
  g.moveTo(-28,0); g.lineTo(-22,-40); g.moveTo(24,0); g.lineTo(18,-40);
  g.moveTo(-30,-2); g.lineTo(26,-2);
  g.stroke();
  // wire basket
  g.strokeStyle='#3a3a40'; g.lineWidth=2;
  for (let i=0;i<4;i++){ g.beginPath(); g.moveTo(-24+i*16,-6); g.lineTo(-22+i*16,-22); g.stroke(); }
  g.beginPath(); g.moveTo(-26,-14); g.lineTo(24,-14); g.stroke();
  // seat and back
  g.fillStyle='#c8a068'; rr(-30,-52,60,14,4); g.fill();
  g.fillStyle='#b98f56'; rr(-30,-52,60,4,2); g.fill();
  g.fillStyle='#c8a068'; rr(-28,-96,56,34,5); g.fill();
  g.fillStyle='#b98f56'; rr(-28,-96,56,5,3); g.fill();
  // the little desk arm
  g.fillStyle='#c8a068'; rr(26,-62,42,12,3); g.fill();
  g.strokeStyle='#2a2a2e'; g.lineWidth=4;
  g.beginPath(); g.moveTo(30,-50); g.lineTo(28,-30); g.stroke();
  g.restore();
}
