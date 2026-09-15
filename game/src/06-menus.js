/* ============================================================
   Studio logo, main menu, character select
   ============================================================ */

/* ---------- AIChE studio sting ---------- */
const S_logo = {
  enter(){ Music.stop(); this.skipped = false;
    after(6,  ()=> SFX.dream());
    after(72, ()=> { SFX.steam(); });
    after(132,()=> SFX.badge());
  },
  draw(){
    g.fillStyle = '#ffffff'; g.fillRect(0,0,W,H);
    const tt = T;
    const outK = tt > 212 ? clamp((tt-212)/34,0,1) : 0;
    g.save();
    g.globalAlpha = 1 - outK;

    const cx = W/2 - 96, cy = H/2 - 16;

    /* wordmark: letters rise and settle */
    const word = 'AIChE';
    g.textAlign='left'; g.textBaseline='middle';
    const sizes = [128,128,96,128,128];
    const widths = [];
    for (let i=0;i<word.length;i++){
      g.font = `700 ${sizes[i]}px "Trebuchet MS",Verdana,sans-serif`;
      widths.push(g.measureText(word[i]).width * 0.94);
    }
    const totalW = widths.reduce((a,b)=>a+b,0);
    let px = cx - totalW/2 - 40;
    for (let i=0;i<word.length;i++){
      const d = i*11;
      const k = clamp((tt - 8 - d)/26, 0, 1);
      const e = bounce(clamp(k,0,1));
      g.save();
      g.globalAlpha = (1-outK) * clamp(k*1.6,0,1);
      g.translate(px + widths[i]/2, cy + (1-e) * 90);
      g.scale(1, lerp(1.35, 1, e));
      g.fillStyle = '#1e9cd7';
      g.font = `700 ${sizes[i]}px "Trebuchet MS",Verdana,sans-serif`;
      g.textAlign='center';
      g.fillText(word[i], 0, 0);
      g.restore();
      px += widths[i];
    }

    /* dotted globe assembling from scattered dots */
    g.save();
    g.translate(cx + totalW/2 + 118, cy - 4);
    const R = 74, rows = 11, cols = 13;
    for (let r=0;r<rows;r++) for (let c=0;c<cols;c++){
      const u = (c/(cols-1)-.5)*2, v = (r/(rows-1)-.5)*2;
      const d2 = u*u + v*v; if (d2 > 1.02) continue;
      const idx = r*cols + c;
      const delay = 66 + Math.sqrt(d2)*26 + nz(idx)*10;
      const k = clamp((tt - delay)/22, 0, 1);
      if (k <= 0) continue;
      const e = easeOut(k);
      // fly in from a random offset
      const sx = (nz(idx)-.5) * 420, sy = (nz(idx+77)-.5) * 320;
      const tx = u*R, ty = v*R;
      const x = lerp(tx + sx, tx, e), y = lerp(ty + sy, ty, e);
      // squares shrink toward the rim like the real mark
      const sq = 8.4 * (1 - d2*0.30);
      g.globalAlpha = (1-outK) * e;
      g.fillStyle = '#1e9cd7';
      g.fillRect(x - sq/2, y - sq/2, sq, sq);
    }
    g.restore();

    /* tagline */
    const tk = clamp((tt-130)/30,0,1);
    g.globalAlpha = (1-outK) * tk;
    txt('The Global Home of Chemical Engineers', W/2, H/2 + 108, 30, '#111', 'center', 400);
    g.globalAlpha = (1-outK) * clamp((tt-160)/30,0,1);
    txt('presents', W/2, H/2 + 158, 17, 'rgba(20,20,20,.45)', 'center', 400);

    g.restore();

    if (tt > 250 || this.skipped) go(S_menu);
    if (tt > 30 && (mouse.click || keyPressed(' ','Enter','Escape'))) this.skipped = true;
    if (tt < 240) txt('click to skip', W-90, H-28, 13, 'rgba(0,0,0,.28)', 'center', 400);
  }
};

/* ---------- main menu ---------- */
const S_menu = {
  enter(){ Music.play('menu'); this.sel = 0;
    this.smoke = 0; G.reset(); },
  draw(){
    /* sunset refinery skyline */
    const sky = g.createLinearGradient(0,0,0,H);
    sky.addColorStop(0,'#0b2a44'); sky.addColorStop(.42,'#1d4e66');
    sky.addColorStop(.66,'#c96a3e'); sky.addColorStop(1,'#2a1a20');
    g.fillStyle = sky; g.fillRect(0,0,W,H);

    // sun
    g.fillStyle='rgba(255,186,110,.9)';
    g.beginPath(); g.arc(W*0.72, H*0.60, 70, 0, 7); g.fill();
    g.fillStyle='rgba(255,186,110,.16)';
    g.beginPath(); g.arc(W*0.72, H*0.60, 140, 0, 7); g.fill();

    // far towers
    for (let i=0;i<9;i++){
      const x = 40 + i*146, h = 130 + nz(i)*170;
      g.fillStyle='rgba(10,30,44,.75)';
      g.fillRect(x, H*0.72 - h, 40, h+60);
      g.fillStyle='rgba(6,20,32,.75)';
      g.fillRect(x+40, H*0.72 - h*0.6, 16, h*0.6+60);
      // steam plume
      if (i%3===1){
        for (let s=0;s<5;s++){
          const t2 = (T*0.5 + s*40) % 200;
          g.fillStyle=`rgba(240,220,210,${0.12*(1-t2/200)})`;
          g.beginPath(); g.arc(x+20 + Math.sin(t2/28)*16, H*0.72-h-t2*0.55, 12+t2*0.10, 0, 7); g.fill();
        }
      }
    }
    // near piping silhouette
    g.fillStyle='#0a1a26'; g.fillRect(0, H*0.80, W, H*0.20);
    g.strokeStyle='#0d2231'; g.lineWidth=16;
    g.beginPath(); g.moveTo(-10,H*0.80); g.lineTo(W+10,H*0.80); g.stroke();
    for (let i=0;i<14;i++){
      g.fillStyle='#0d2231'; g.fillRect(i*96+20, H*0.80, 14, 40);
    }
    // blinking tower lights
    for (let i=0;i<9;i++){
      if (Math.sin(T/26 + i*2) > .65){
        g.fillStyle='rgba(255,120,110,.9)';
        g.beginPath(); g.arc(60 + i*146, H*0.72 - (130 + nz(i)*170) - 4, 3.4, 0, 7); g.fill();
      }
    }
    vignette(.42);

    /* title */
    g.save();
    g.shadowColor='rgba(0,0,0,.6)'; g.shadowBlur=22; g.shadowOffsetY=7;
    txt('ChemEng', W/2, 158, 86, '#f6fbff');
    txt('QUEST',   W/2, 236, 74, '#f5b53d');
    g.restore();
    g.strokeStyle='rgba(35,166,224,.7)'; g.lineWidth=2;
    g.beginPath(); g.moveTo(W/2-230, 278); g.lineTo(W/2+230, 278); g.stroke();
    txt('First Day at the Refinery', W/2, 302, 23, '#bfe4f5','center',400);

    /* an engineer idling on the pipe rack */
    drawPerson(hero, W*0.20, H*0.80, 2.5, { dir:'right', face:'neutral', seed:1,
      ppe:{hat:true, goggles:hero.safety===2} });

    /* buttons */
    const bw=320, bh=58, bx=W/2-bw/2;
    if (button('START THE GAME', bx, 400, bw, bh, {size:22})) { SFX.great(); go(S_select); }
    if (button('HOW TO PLAY',    bx, 470, bw, bh, {size:19})) { SFX.click(); go(S_help); }
    if (button('CREDITS',        bx, 540, bw, bh, {size:19})) { SFX.click(); go(S_credits); }

    txt('AIChE Student Chapter', W/2, H-30, 14, 'rgba(234,244,250,.42)','center',400);
    hudEl.textContent = '';
  }
};

const S_help = {
  draw(){
    g.fillStyle='#061620'; g.fillRect(0,0,W,H);
    for (let i=0;i<60;i++){ g.fillStyle='rgba(35,166,224,.05)';
      g.fillRect((i*211)%W, (i*137)%H, 2, 2); }
    panel(150, 70, 980, 560);
    txt('HOW TO PLAY', W/2, 122, 42, '#f5b53d');
    const rows = [
      ['ARROWS / WASD', 'walk your engineer around the refinery'],
      ['SPACE or ENTER', 'talk, continue a conversation, enter a doorway'],
      ['MOUSE', 'pick up, place and install equipment'],
      ['COFFEE CUP', 'one hint per station. Use it when you are stuck'],
      ['F', 'full screen'],
    ];
    rows.forEach(([k,v],i)=>{
      const y = 188 + i*56;
      g.fillStyle='rgba(35,166,224,.14)'; rr(200, y-20, 210, 40, 8); g.fill();
      txt(k, 305, y, 17, '#7fd0f0');
      txt(v, 440, y, 19, '#dceaf2','left',400);
    });
    panel(200, 470, 880, 110, 'rgba(245,181,61,.10)', 'rgba(245,181,61,.5)');
    txt('Every engineer is strong in some subjects and weak in others.', W/2, 505, 19, '#f5d78a','center',400);
    txt('A weak subject means worse instincts, fewer hints, and some very confident nonsense.',
        W/2, 540, 18, '#cfe6f2','center',400);
    if (button('BACK', W/2-90, H-62, 180, 46)) go(S_menu);
  }
};

const S_credits = {
  draw(){
    g.fillStyle='#061620'; g.fillRect(0,0,W,H);
    panel(240, 90, 800, 520);
    txt('CREDITS', W/2, 145, 40, '#f5b53d');
    const L = [
      ['Presented by','AIChE Student Chapter'],
      ['Game design','Chemical engineering, mostly'],
      ['Art','Vector, drawn every frame'],
      ['Music and sound','Synthesised live in your browser'],
      ['Safety officer','Whoever remembered their goggles'],
      ['Special thanks','Every reactor that did not explode']
    ];
    L.forEach(([a,b],i)=>{
      txt(a, W/2, 215 + i*62, 15, '#7fd0f0');
      txt(b, W/2, 240 + i*62, 21, '#eaf4fa','center',400);
    });
    if (button('BACK', W/2-90, H-62, 180, 46)) go(S_menu);
  }
};

/* ---------- character select ---------- */
const S_select = {
  enter(){ Music.play('menu'); this.sel = 0; this.pop = 0; this.lineK = 0; },
  draw(){
    const bg = g.createLinearGradient(0,0,0,H);
    bg.addColorStop(0,'#0a2a3e'); bg.addColorStop(1,'#041420');
    g.fillStyle=bg; g.fillRect(0,0,W,H);
    // blueprint grid
    g.strokeStyle='rgba(35,166,224,.07)'; g.lineWidth=1;
    for (let x=0;x<W;x+=40){ g.beginPath(); g.moveTo(x,0); g.lineTo(x,H); g.stroke(); }
    for (let y=0;y<H;y+=40){ g.beginPath(); g.moveTo(0,y); g.lineTo(W,y); g.stroke(); }

    txtShadow('CHOOSE YOUR ENGINEER', W/2, 58, 40, '#f6fbff');

    const cw = 258, gap = 20, x0 = (W - (cw*4 + gap*3))/2;
    CHARS.forEach((c,i)=>{
      const x = x0 + i*(cw+gap), y = 88, h = 424;
      const z = zone(x, y, cw, h);
      const on = z.hover || this.sel === i;
      if (z.hover && this.sel !== i){ this.sel = i; this.pop = 0; SFX.hover(); }
      g.save();
      if (on){ g.shadowColor = c.suit; g.shadowBlur = 26; }
      panel(x, on ? y-6 : y, cw, h,
            on ? 'rgba(10,38,54,.97)' : 'rgba(6,24,36,.9)',
            on ? c.suit : 'rgba(35,166,224,.35)');
      g.restore();
      const yy = on ? y-6 : y;

      // portrait platform
      g.fillStyle='rgba(35,166,224,.10)';
      g.beginPath(); g.ellipse(x+cw/2, yy+196, 66, 14, 0, 0, 7); g.fill();
      drawPerson(c, x+cw/2, yy+196, on ? 1.62 : 1.5, {
        dir:'front', face: on ? 'happy' : 'neutral', seed:i*3,
        ppe:{ hat: c.safety===2, goggles: on && c.safety===2 },
        walk: on ? T*1.0 : 0
      });

      txt(c.name, x+cw/2, yy+226, 21, on ? '#fff' : '#cfe6f2');
      txt(c.title, x+cw/2, yy+250, 15, c.suit, 'center', 700);
      if (c.hard){
        const hw = 116, hx = x+cw/2-hw/2, hy2 = yy+12;
        g.save();
        g.fillStyle = `rgba(238,95,110,${on ? .95 : .7})`;
        g.rotate(0); rr(hx, hy2, hw, 22, 6); g.fill(); g.restore();
        txt('HARD MODE', x+cw/2, hy2+11, 13, '#1b0508');
      }

      // stat bars
      const rows = [...Object.keys(SUBJ).map(k=>[SUBJ[k], c.stats[k]]), ['Safety', c.safety]];
      rows.forEach(([lab, v], r)=>{
        const sy = yy + 282 + r*21;
        txt(lab, x+18, sy, 13, '#93b6c8','left',400);
        for (let s=0;s<3;s++){
          g.fillStyle = s > v ? 'rgba(255,255,255,.08)'
                      : v===2 ? '#3fd07f' : v===1 ? '#f0c02a' : '#ee5f6e';
          rr(x+cw-86 + s*24, sy-6, 19, 11, 3); g.fill();
        }
      });

      if (z.clicked){ hero = c; SFX.great(); go(S_intro); }
    });

    /* the selected engineer says something revealing */
    const c = CHARS[this.sel];
    this.pop = Math.min(1, this.pop + dt/14);
    panel(x0, 532, W - x0*2, 104, 'rgba(6,24,36,.94)', c.suit);
    g.save(); g.globalAlpha = this.pop;
    txt(c.blurb, W/2, 562, 18, '#cfe6f2','center',400);
    const hasWeak = Object.keys(c.stats).some(k=>c.stats[k]===0);
    txt(hasWeak ? c.wrongLine : c.rightLine, W/2, 602, 21, '#f5d78a','center',400);
    if (c.hard){
      txt('no hints  ·  no guide markings  ·  Bassam will be watching you',
          W/2, 646, 15, '#f0a0ac','center',400);
    }
    g.restore();

    txt('click a card to begin', W/2, H-22, 14, 'rgba(234,244,250,.35)','center',400);
    hudEl.textContent = '';
  }
};

/* ---------- boss briefing ---------- */
const S_intro = {
  enter(){
    Music.play('lab');
    G.reset();
    this.bossX = 430; this.heroX = 1400; this.walking = true;
    this.convo = null;
    this.deskPapers = 0;
  },
  draw(){
    /* office */
    const wall = g.createLinearGradient(0,0,0,H);
    wall.addColorStop(0,'#17455f'); wall.addColorStop(1,'#0d2c3f');
    g.fillStyle = wall; g.fillRect(0,0,W,H*0.66);
    g.fillStyle = '#123246'; g.fillRect(0,H*0.66,W,H*0.34);
    // floor sheen
    g.fillStyle='rgba(255,255,255,.03)';
    g.beginPath(); g.moveTo(0,H*0.66); g.lineTo(W,H*0.66); g.lineTo(W,H); g.lineTo(0,H); g.fill();
    for (let i=0;i<9;i++){ g.strokeStyle='rgba(255,255,255,.04)'; g.lineWidth=2;
      g.beginPath(); g.moveTo(i*160, H*0.66); g.lineTo(i*160-90, H); g.stroke(); }

    // window with the refinery outside
    panel(80, 80, 300, 200, 'rgba(20,70,98,.9)', 'rgba(150,190,210,.5)');
    g.save(); g.beginPath(); rr(90,90,280,180,8); g.clip();
    g.fillStyle='#2a5f7e'; g.fillRect(90,90,280,180);
    for (let i=0;i<5;i++){ g.fillStyle='rgba(8,30,44,.8)';
      g.fillRect(100+i*56, 190 - nz(i)*80, 26, 200); }
    for (let s=0;s<4;s++){ const t2=(T*0.4+s*50)%200;
      g.fillStyle=`rgba(230,240,245,${0.10*(1-t2/200)})`;
      g.beginPath(); g.arc(160+Math.sin(t2/30)*12, 190-t2*0.5, 10+t2*0.08,0,7); g.fill(); }
    g.restore();

    // wall sign
    panel(880, 92, 300, 92, 'rgba(245,181,61,.14)', 'rgba(245,181,61,.55)');
    txt('DAYS WITHOUT INCIDENT', 1030, 122, 15, '#f5d78a');
    txt(G.blunders>0 ? '0' : '1', 1030, 158, 30, '#f5b53d');

    // desk
    g.fillStyle='#5a3a24'; rr(540, H*0.66-18, 300, 20, 5); g.fill();
    g.fillStyle='#734b2e'; rr(556, H*0.66+2, 268, 74, 5); g.fill();
    g.fillStyle='#4a2f1d'; rr(556, H*0.66+2, 268, 10, 4); g.fill();
    // papers + mug on desk
    for (let i=0;i<3;i++){ g.save(); g.translate(600+i*18, H*0.66-24); g.rotate((nz(i)-.5)*.3);
      g.fillStyle='#eef2f5'; rr(-16,-10,32,20,2); g.fill(); g.restore(); }
    g.fillStyle='#e8eef2'; rr(790, H*0.66-36, 22, 22, 4); g.fill();
    if (Math.random()<.1) emitSteam(801, H*0.66-38, 1, {speed:.4, col:'rgba(210,190,170,.4)'});

    /* boss stands behind the desk */
    const talkingBoss = this.convo && this.convo.speaking('Mr. Tarek');
    drawPerson(NPCS.boss, this.bossX, H*0.66+96, 2.9, {
      dir:'right',
      face: isHard() ? (talkingBoss ? 'worry' : 'shame') : (talkingBoss ? 'neutral' : 'happy'),
      talk: talkingBoss, seed:2,
      pose: talkingBoss ? 'talk' : 'idle'
    });
    txt(NPCS.boss.name, this.bossX, H*0.66+124, 14, 'rgba(234,244,250,.5)');

    /* in hard mode Bassam is already in the room, filing something, listening */
    if (isHard()){
      const sx = 1010;
      const heard = this.convo && this.convo.i >= 2;
      drawPerson(NPCS.sus, sx, H*0.66+96, 2.6, {
        dir:'left', seed:23,
        face: heard ? 'angry' : 'neutral',
        pose: heard ? 'cross' : 'clipboard'
      });
      txt(NPCS.sus.name, sx, H*0.66+124, 14, 'rgba(234,244,250,.5)');
      if (heard){
        const marks = ['?', '?!', '...'];
        txt(marks[Math.floor(T/40) % 3], sx + 34, H*0.66-92 + Math.sin(T/16)*4,
            26, '#ee5f6e');
      }
    }

    /* hero walks in from the right */
    if (this.walking){
      this.heroX -= 3.4*dt;
      if (T % 22 < dt) SFX.step();
      if (this.heroX <= 700){
        this.walking = false;
        const B = ()=>[this.bossX, H*0.66-52];
        const Hh = ()=>[this.heroX, H*0.66-52];
        const lines = isHard() ? [
          /* the nepotism briefing */
          { by:'Mr. Tarek', text:'Jojo. Your mother called me. Twice.', at:B },
          { by:hero.name,   text:'Uncle! This is a lovely factory. Very... piped.', at:Hh, w:340 },
          { by:'Mr. Tarek', text:'It is a refinery. Do not call me uncle on the floor.', at:B },
          { by:hero.name,   text:'Understood. So what does a chemical engineer actually do all day?', at:Hh, w:380 },
          { by:'Mr. Tarek', text:'...You start at the separation lab. Please touch as little as possible.', at:B, w:380 },
          { by:hero.name,   text:'Relax. I have watched a documentary about oil.', at:Hh, w:340 },
          { by:NPCS.sus.name, text:'Sir. Sorry. Which university was that, exactly?',
            at:()=>[1010, H*0.66-52], w:330 },
          { by:'Mr. Tarek', text:'Bassam. Go and check something. Anything.', at:B, w:320 },
          { by:NPCS.sus.name, text:'Of course, sir. I will check on him.',
            at:()=>[1010, H*0.66-52], w:300 }
        ] : [
          { by:'Mr. Tarek', text:'You must be the new graduate. Good. Badge on.', at:B },
          { by:'Mr. Tarek', text:'Four stations need covering today, and the break room needs someone in it eventually.', at:B },
          { by:'Mr. Tarek', text:'Do the work. Read the process. Do not burn my refinery down.', at:B },
          { by:hero.name, text: hero.safety===2
              ? 'Understood. Goggles first, questions later.'
              : hero.safety===0 ? 'Understood. Mostly understood.'
              : 'Understood, sir.', at:Hh },
          { by:'Mr. Tarek', text:'"Mostly" is how refineries end up in the news. Go.', at:B }
        ];
        this.convo = Convo(lines, ()=> go(S_hub, 'fade'));
      }
    }
    const talkingHero = this.convo && this.convo.speaking(hero.name);
    drawPerson(hero, this.heroX, H*0.66+96, 2.9, {
      dir:'left', walk: this.walking ? T*2.2 : 0,
      face: isHard() ? 'happy'
          : talkingHero ? 'neutral' : this.walking ? 'neutral' : 'worry',
      talk: talkingHero, seed:5,
      pose: isHard() && !this.walking ? 'wave' : undefined,
      ppe:{ hat: !isHard(), goggles: hero.safety===2 }
    });

    vignette(.35);
    if (this.convo) this.convo.draw();
    hudEl.textContent = '';
  }
};
