/* ============================================================
   The verdict — Mr. Tarek reads your day back to you
   ============================================================ */
function verdictFor(s){
  if (s >= 98) return { k:'badge', title:'TAKE MY BADGE',
    line:'"Twenty two years I have run this place. Take it. You deserve it more than I do."',
    col:'#f5b53d' };
  if (s >= 90) return { k:'employee', title:'EMPLOYEE OF THE DAY',
    line:'"Outstanding. Nothing exploded. Nothing even considered it."', col:'#3fd07f' };
  if (s >= 70) return { k:'hired', title:'YOU ARE HIRED',
    line:'"Solid work. Keep the badge, keep the desk, keep the goggles on."', col:'#7fd0f0' };
  if (s >= 50) return { k:'training', title:'UNDER SUPERVISION',
    line:'"You stay. You also start training on Monday. Bring a notebook."', col:'#f0a02a' };
  return { k:'fired', title:'FIRED',
    line: Object.keys(G.boomed).length
      ? '"Half my refinery is on fire and you walked past it whistling. Out."'
      : '"I wasted a perfectly good cup of coffee on you this morning."',
    col:'#ee5f6e' };
}

const S_end = {
  enter(){
    this.score = finalScore();
    this.v = verdictFor(this.score);
    Music.stop();
    this.phase = 'walk';        // walk | talk | card | act | done
    this.heroX = 1360; this.bossX = 430;
    this.cardK = 0; this.barK = 0; this.actK = 0;
    this.shown = 0;
    this.convo = null;
    this.flyX = 0; this.flyY = 0; this.flySpin = 0;
    this.badgeK = 0;
    this.confettiT = 0;
  },

  draw(){
    /* ---------------- the office ---------------- */
    const wall = g.createLinearGradient(0,0,0,H*0.66);
    wall.addColorStop(0,'#17455f'); wall.addColorStop(1,'#0d2c3f');
    g.fillStyle = wall; g.fillRect(0,0,W,H*0.66);
    g.fillStyle = '#123246'; g.fillRect(0,H*0.66,W,H*0.34);
    for (let i=0;i<10;i++){ g.strokeStyle='rgba(255,255,255,.035)'; g.lineWidth=2;
      g.beginPath(); g.moveTo(i*150, H*0.66); g.lineTo(i*150-90, H); g.stroke(); }

    // window
    panel(80, 80, 300, 200, 'rgba(20,70,98,.9)', 'rgba(150,190,210,.5)');
    g.save(); g.beginPath(); rr(90,90,280,180,8); g.clip();
    g.fillStyle='#2a5f7e'; g.fillRect(90,90,280,180);
    for (let i=0;i<5;i++){ g.fillStyle='rgba(8,30,44,.8)'; g.fillRect(100+i*56, 190 - nz(i)*80, 26, 200); }
    for (let s=0;s<4;s++){ const t2=(T*0.4+s*50)%200;
      g.fillStyle=`rgba(230,240,245,${0.10*(1-t2/200)})`;
      g.beginPath(); g.arc(160+Math.sin(t2/30)*12, 190-t2*0.5, 10+t2*0.08,0,7); g.fill(); }
    g.restore();

    // the incident sign, which now reflects your morning
    panel(880, 92, 300, 92, 'rgba(245,181,61,.14)', 'rgba(245,181,61,.55)');
    txt('DAYS WITHOUT INCIDENT', 1030, 122, 15, '#f5d78a');
    txt(String(Math.max(0, 1 - Math.min(1, G.blunders))), 1030, 158, 30, '#f5b53d');
    // whatever you walked away from is still on the incident board
    const blown = Object.keys(G.boomed).length;
    if (blown){
      panel(880, 190, 300, 42, 'rgba(238,95,110,.14)', 'rgba(238,95,110,.55)');
      txt(blown === 1 ? 'ONE UNIT IS STILL SMOKING' : blown + ' UNITS ARE STILL SMOKING',
          1030, 216, 14, `rgba(255,150,160,${.7+Math.sin(T/12)*.25})`);
    }

    // desk
    g.fillStyle='#5a3a24'; rr(540, H*0.66-18, 300, 20, 5); g.fill();
    g.fillStyle='#734b2e'; rr(556, H*0.66+2, 268, 74, 5); g.fill();
    g.fillStyle='#4a2f1d'; rr(556, H*0.66+2, 268, 10, 4); g.fill();
    g.fillStyle='#e8eef2'; rr(790, H*0.66-36, 22, 22, 4); g.fill();
    if (Math.random()<.08) emitSteam(801, H*0.66-38, 1, {speed:.4, col:'rgba(210,190,170,.4)'});

    /* ---------------- the boss ---------------- */
    const bossTalk = this.convo && !this.convo.done;
    const fired = this.v.k === 'fired';
    let bPose, bFace = 'neutral';
    if (this.phase === 'act' || this.phase === 'done'){
      if (fired) { bFace = 'angry'; bPose = 'point'; }
      else if (this.v.k === 'badge'){ bFace='happy'; bPose = 'present'; }
      else if (this.v.k === 'employee'){ bFace='happy'; bPose = 'cheer'; }
      else { bFace='happy'; bPose = 'present'; }
    } else if (bossTalk) bFace = fired ? 'angry' : 'neutral';

    drawPerson(NPCS.boss, this.bossX, H*0.66+96, 2.6, {
      dir:'right', face:bFace, talk:bossTalk, seed:2,
      pose: bPose || (bossTalk ? 'talk' : 'idle')
    });
    if (this.v.k === 'badge' && this.badgeK > 0.35){
      // paint over his chest badge so it reads as given away
      g.save(); g.translate(this.bossX, H*0.66+96); g.scale(2.6,2.6);
      g.fillStyle = NPCS.boss.suit; rr(-9, -65, 8, 6, 1.6); g.fill(); g.restore();
    }
    txt(NPCS.boss.name, this.bossX, H*0.66+126, 14, 'rgba(234,244,250,.5)');

    /* ---------------- the graduate ---------------- */
    const heroTalk = this.convo && this.convo.speaking(hero.name);
    let hFace = 'neutral', hPose, hLift = 0, hTilt = 0;
    if (this.phase === 'act' || this.phase === 'done'){
      if (this.v.k === 'badge' || this.v.k === 'employee'){
        hFace = 'proud'; hPose = 'cheer';
        hLift = -Math.abs(Math.sin(this.actK/9))*12;
      } else if (this.v.k === 'hired'){ hFace='happy'; hPose='reach'; }
      else if (this.v.k === 'training'){ hFace='worry'; hPose='hold'; }
      else { hFace='shock'; hPose='panic'; }
    }

    if ((this.phase === 'act' || this.phase === 'done') && fired && this.actK > 60){
      /* the cartoon kick */
      const k = clamp((this.actK - 60)/70, 0, 1);
      const x = lerp(this.heroX, W + 220, easeIn(k));
      const y = lerp(H*0.66+96, H*0.30, Math.sin(k*Math.PI)) ;
      drawPerson(hero, x, y, 2.6, { dir:'right', face:'dead', seed:5,
        tilt: k*12, pose:'panic', shadow:false });
      if (Math.random()<.7) spawn({ x:x-40, y:y+10, vx:rnd(-3,-1), vy:rnd(-1,1),
        life:rnd(24,44), max:44, size:rnd(8,18), col:'rgba(220,226,214,.45)', kind:'puff' });
      if (k > 0.98 && !this.kicked){ this.kicked = true; after(40, ()=> this.phase='done'); }
    } else {
      drawPerson(hero, this.heroX, H*0.66+96, 2.6, {
        dir:'left', walk: this.phase==='walk' ? T*2.2 : 0,
        face:hFace, talk:heroTalk, pose:hPose, lift:hLift, tilt:hTilt, seed:5,
        ppe:{ hat:true, goggles:G.ppe.goggles, coat:G.ppe.coat }
      });
    }

    /* ---------------- rewards ---------------- */
    if (this.phase === 'act' || this.phase === 'done'){
      if (this.phase === 'act') this.actK += dt;

      if (this.v.k === 'badge'){
        this.badgeK = clamp((this.actK - 30)/70, 0, 1);
        if (this.badgeK > 0 && this.badgeK < 1){
          const bx = lerp(this.bossX + 12, this.heroX - 14, easeOut(this.badgeK));
          const by = lerp(H*0.66-72, H*0.66-70, easeOut(this.badgeK)) - Math.sin(this.badgeK*Math.PI)*70;
          g.save(); g.translate(bx, by); g.rotate(this.badgeK*8);
          g.fillStyle='#f5b53d'; star(0,0,17,8,5); g.fill();
          g.strokeStyle='#c98a10'; g.lineWidth=2; star(0,0,17,8,5); g.stroke();
          g.fillStyle='#fff6d8'; g.beginPath(); g.arc(0,0,6,0,7); g.fill();
          g.restore();
          if (Math.random()<.5) emitSpark(bx, by, 1, '#ffe08a');
        }
        if (this.badgeK >= 1){
          // it lands on the graduate's chest
          g.save(); g.translate(this.heroX - 14, H*0.66-70);
          g.fillStyle='#f5b53d'; star(0,0,17,8,5); g.fill();
          g.strokeStyle='#c98a10'; g.lineWidth=2; star(0,0,17,8,5); g.stroke();
          g.fillStyle='#fff6d8'; g.beginPath(); g.arc(0,0,6,0,7); g.fill();
          g.restore();
          this.confettiT += dt;
          if (this.confettiT > 4){ this.confettiT = 0; emitConfetti(rnd(200,1080), -10, 2); }
        }
      }

      if (this.v.k === 'employee'){
        const k = clamp((this.actK-24)/40, 0, 1);
        if (k > 0){
          g.save();
          g.translate(this.heroX, H*0.66 - 250 + (1-bounce(k))*80);
          g.scale(bounce(k), bounce(k));
          g.save(); g.shadowColor='rgba(0,0,0,.4)'; g.shadowBlur=14;
          g.fillStyle='#3fd07f'; rr(-128,-34,256,68,12); g.fill(); g.restore();
          g.strokeStyle='#1f8f5c'; g.lineWidth=3; rr(-128,-34,256,68,12); g.stroke();
          txt('EMPLOYEE', 0, -12, 21, '#04201a');
          txt('OF THE DAY', 0, 12, 21, '#04201a');
          g.restore();
          this.confettiT += dt;
          if (this.confettiT > 6){ this.confettiT = 0; emitConfetti(rnd(240,1040), -10, 2); }
        }
      }

      if (this.v.k === 'training'){
        const k = clamp((this.actK-24)/40, 0, 1);
        if (k > 0){
          const cx = lerp(this.bossX+30, this.heroX-34, easeOut(k));
          g.save(); g.translate(cx, H*0.66-58); g.rotate(-0.12);
          g.fillStyle='#8a6a42'; rr(-26,-34,52,68,4); g.fill();
          g.fillStyle='#f6f2e2'; rr(-22,-30,44,58,2); g.fill();
          g.fillStyle='#9aa8b2'; rr(-9,-38,18,8,2); g.fill();
          g.fillStyle='#b8b0a0';
          for (let i=0;i<5;i++) g.fillRect(-16,-20+i*10, 34-(i*7)%18, 3);
          g.restore();
          txt('TRAINING SCHEDULE', (cx+this.heroX)/2, H*0.66-104, 14, '#f5cf8a');
        }
      }

      if (this.v.k === 'hired'){
        // a handshake in the middle
        const k = clamp((this.actK-20)/40, 0, 1);
        if (k > 0){
          const mx = (this.bossX + this.heroX)/2;
          g.save(); g.translate(mx, H*0.66-52);
          g.fillStyle = NPCS.boss.skin; g.beginPath(); g.arc(-7,0,10,0,7); g.fill();
          g.fillStyle = hero.skin;      g.beginPath(); g.arc(7,0,10,0,7); g.fill();
          g.restore();
          if (Math.random()<.10) emitSpark(mx, H*0.66-52, 1, '#bff2ff');
        }
      }

      if (fired && this.actK > 40 && this.actK < 60){
        // the wind-up: the boss hoists him by the shirt
        txt('...', (this.bossX+this.heroX)/2, H*0.66-140, 30, '#ee5f6e');
        shake(2);
      }
      if (fired && this.actK > 58 && this.actK < 62 && !this.kickSfx){
        this.kickSfx = true; SFX.kick(); shake(12);
      }

      if (this.actK > 150 && this.phase === 'act') this.phase = 'done';
    }

    drawParts();
    vignette(.35);

    /* ---------------- the report card ---------------- */
    if (this.phase === 'card' || this.phase === 'act' || this.phase === 'done'){
      this.cardK = Math.min(1, this.cardK + dt/26);
      const e = bounce(this.cardK);
      const cw = 560, ch = 340, cx = W/2 - cw/2, cy = 96;
      /* once the verdict plays, the card slides aside so the room is visible */
      const acting = (this.phase === 'act' || this.phase === 'done');
      const sk = acting ? easeOut(clamp(this.actK/26, 0, 1)) : 0;
      const scl = lerp(1, 0.56, sk);
      const tx = lerp(cx + cw/2, 26 + cw*scl/2, sk);
      const ty = lerp(cy + ch/2, 44 + ch*scl/2, sk);
      g.save();
      g.translate(tx, ty);
      g.scale(e*scl, e*scl); g.rotate((1-e)*0.3);
      g.translate(-(cx+cw/2), -(cy+ch/2));
      g.save(); g.shadowColor='rgba(0,0,0,.55)'; g.shadowBlur=26; g.shadowOffsetY=10;
      g.fillStyle='#f6f2e2'; rr(cx, cy, cw, ch, 10); g.fill(); g.restore();
      g.strokeStyle='#cfc6ac'; g.lineWidth=3; rr(cx, cy, cw, ch, 10); g.stroke();

      txt('FIRST DAY REPORT', cx+cw/2, cy+34, 20, '#2f4250');
      txt(hero.name, cx+cw/2, cy+58, 15, '#6a7a86','center',400);
      g.strokeStyle='#dcd4bc'; g.lineWidth=2;
      g.beginPath(); g.moveTo(cx+30, cy+74); g.lineTo(cx+cw-30, cy+74); g.stroke();

      // the subject bars fill in
      this.barK = Math.min(1, this.barK + dt/70);
      const rows = [['Separation','sep'],['Reactors','rea'],['Fluids','flu'],
                    ['Heat','hea'],['Thermo','the'],['Safety','saf']];
      rows.forEach(([lab,k],i)=>{
        const y = cy + 104 + i*30;
        txt(lab, cx+34, y, 15, '#2f4250','left');
        g.fillStyle='rgba(0,0,0,.08)'; rr(cx+150, y-8, 300, 16, 8); g.fill();
        const pct = subjectPct(k)/100 * this.barK;
        g.fillStyle = pct>0.75 ? '#3fd07f' : pct>0.45 ? '#f0a02a' : '#ee5f6e';
        rr(cx+150, y-8, 300*pct, 16, 8); g.fill();
        txt(Math.round(subjectPct(k)*this.barK) + '%', cx+cw-34, y, 14, '#6a7a86','right',400);
      });

      // the total, stamped on
      const tk = clamp((this.barK - 0.75)/0.25, 0, 1);
      if (tk > 0){
        g.save();
        g.translate(cx+cw/2, cy+ch-42);
        g.scale(lerp(2.4,1,bounce(tk)), lerp(2.4,1,bounce(tk)));
        g.globalAlpha = tk;
        txt(this.score + ' / 100', 0, 0, 40, this.v.col);
        g.restore();
      }
      g.restore();

      if (this.barK >= 1 && this.phase === 'card'){
        this.phase = 'act'; this.actK = 0;
        if (this.v.k === 'fired'){ SFX.sad(); }
        else if (this.v.k === 'badge'){ SFX.badge(); }
        else SFX.fanfare();
        this.convo = Convo([
          { by:NPCS.boss.name, text:this.v.line, at:()=>[this.bossX, H*0.66-180], w:400 }
        ], ()=>{ this.convo = null; });
      }
    }

    /* ---------------- the verdict banner ---------------- */
    if (this.phase === 'act' || this.phase === 'done'){
      const bk = clamp(this.actK/20, 0, 1);
      g.save(); g.globalAlpha = bk;
      g.translate(W/2 + 120, 74 + (1-bounce(bk))*40);
      g.save(); g.shadowColor='rgba(0,0,0,.5)'; g.shadowBlur=20;
      g.fillStyle = 'rgba(4,18,28,.94)'; rr(-230, -32, 460, 64, 12); g.fill(); g.restore();
      g.strokeStyle = this.v.col; g.lineWidth = 3; rr(-230, -32, 460, 64, 12); g.stroke();
      txt(this.v.title, 0, 2, 32, this.v.col);
      g.restore();
    }

    /* ---------------- flow ---------------- */
    if (this.phase === 'walk'){
      this.heroX -= 3.4*dt;
      if (T % 22 < dt) SFX.step();
      if (this.heroX <= 760){
        this.heroX = 760; this.phase = 'talk';
        this.convo = Convo([
          { by:NPCS.boss.name, text:'Sit down. Actually, do not. This will not take long.',
            at:()=>[this.bossX, H*0.66-180], w:380 },
          { by:NPCS.boss.name, text:'I have your morning here in writing.',
            at:()=>[this.bossX, H*0.66-180], w:340 }
        ], ()=>{ this.convo=null; this.phase='card'; SFX.stamp(); shake(6); });
      }
    }

    if (this.convo) this.convo.draw();

    if (this.phase === 'done'){
      if (button('PLAY AGAIN', W/2-230, H-64, 210, 46, {size:18})){
        G.reset(); G.dreamt = false; hero = CHARS[0]; go(S_menu, 'fade');
      }
      if (button('CHOOSE ANOTHER ENGINEER', W/2+20, H-64, 300, 46, {col:'#f5b53d', size:16})){
        G.reset(); G.dreamt = false; go(S_select, 'fade');
      }
    }

    hudEl.textContent = '';
  }
};
