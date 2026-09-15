/* ============================================================
   The board by the office door — Mr. Tarek's reports, pinned up
   ============================================================ */

/* what a run looks like once it is written down */
function makeEntry(name){
  const open = STATIONS.filter(s => !G.done[s.key]).map(s => s.key);
  return {
    name: (name || '').trim().slice(0, 14) || 'ANONYMOUS',
    char: hero.name,
    charId: hero.id,
    title: hero.title,
    score: finalScore(),
    verdict: verdictFor(finalScore()).title,
    vcol: verdictFor(finalScore()).col,
    hard: !!isHard(),
    quit: !!G.quitEarly,
    boomed: Object.keys(G.boomed).length,
    open: open.length,
    subs: { sep:subjectPct('sep'), rea:subjectPct('rea'), flu:subjectPct('flu'),
            hea:subjectPct('hea'), the:subjectPct('the'), saf:subjectPct('saf') },
    when: Date.now()
  };
}

/* a pin holding a slip to the cork */
function pin(x, y, col){
  g.fillStyle='rgba(0,0,0,.22)'; g.beginPath(); g.ellipse(x+1.5, y+3, 6, 3.4, 0, 0, 7); g.fill();
  g.fillStyle=col; g.beginPath(); g.arc(x, y, 6, 0, 7); g.fill();
  g.fillStyle='rgba(255,255,255,.45)'; g.beginPath(); g.arc(x-2, y-2.2, 2.2, 0, 7); g.fill();
}

const S_board = {
  enter(){
    Music.play('menu');
    this.rows = Board.load().slice();
    this.top = 0;
    this.k = 0;
  },
  /* the ending sets this so the new slip can be picked out of the pile */
  mark: -1,

  draw(){
    this.k = Math.min(1, this.k + dt/24);

    /* the corridor wall the board hangs on */
    const wall = g.createLinearGradient(0,0,0,H);
    wall.addColorStop(0,'#14384c'); wall.addColorStop(1,'#0a2130');
    g.fillStyle = wall; g.fillRect(0,0,W,H);
    for (let i=0;i<W/30;i++){
      g.fillStyle = i%2 ? 'rgba(255,255,255,.015)' : 'rgba(0,0,0,.05)';
      g.fillRect(i*30, 0, 15, H);
    }

    /* the cork board */
    const BX = 92, BY = 54, BW = W-184, BH = H-118;
    g.save(); g.shadowColor='rgba(0,0,0,.55)'; g.shadowBlur=26; g.shadowOffsetY=10;
    g.fillStyle='#6b4a28'; rr(BX-14, BY-14, BW+28, BH+28, 10); g.fill(); g.restore();
    g.fillStyle='#8a6136'; rr(BX-14, BY-14, BW+28, BH+28, 10); g.fill();
    g.fillStyle='#c8a06a'; rr(BX-14, BY-14, BW+28, 8, 4); g.fill();
    const cork = g.createLinearGradient(0,BY,0,BY+BH);
    cork.addColorStop(0,'#c99f63'); cork.addColorStop(1,'#b0864d');
    g.fillStyle = cork; rr(BX, BY, BW, BH, 4); g.fill();
    g.save(); g.beginPath(); rr(BX, BY, BW, BH, 4); g.clip();
    for (let i=0;i<1400;i++){
      const h = Math.sin(i*12.9898)*43758.5453, h2 = Math.sin(i*78.233)*12345.6789;
      g.fillStyle = i%3 ? 'rgba(90,58,26,.15)' : 'rgba(255,228,186,.15)';
      g.fillRect(BX + (h - Math.floor(h))*BW, BY + (h2 - Math.floor(h2))*BH,
                 2.6, 2.2);
    }
    g.restore();
    g.strokeStyle='rgba(60,36,14,.5)'; g.lineWidth=2; rr(BX, BY, BW, BH, 4); g.stroke();

    /* the header slip */
    g.save(); g.translate(W/2, BY+46); g.rotate(-0.012);
    g.save(); g.shadowColor='rgba(0,0,0,.4)'; g.shadowBlur=12; g.shadowOffsetY=4;
    g.fillStyle='#f6f2e2'; rr(-330, -34, 660, 68, 5); g.fill(); g.restore();
    txt('FIRST DAY REPORTS', 0, -4, 26, '#2f4250');
    txt('as read out by Mr. Tarek, and pinned up by him personally',
        0, 18, 13, '#7a8892', 'center', 400);
    g.restore();
    pin(W/2-318, BY+18, '#ee5f6e'); pin(W/2+318, BY+18, '#3fd0c0');

    /* the slips */
    const rows = this.rows;
    if (!rows.length){
      txt('Nothing pinned up yet.', W/2, H/2-14, 24, 'rgba(60,36,14,.6)');
      txt('Finish a morning, then add your run to the board.',
          W/2, H/2+16, 17, 'rgba(60,36,14,.45)', 'center', 400);
    }

    const PER = 7, rowH = 58, listY = BY + 104;
    const page = rows.slice(this.top, this.top + PER);
    page.forEach((r, i)=>{
      const idx = this.top + i, y = listY + i*rowH;
      const isNew = idx === S_board.mark;
      const tilt = ((idx*37) % 7 - 3) * 0.0035;
      const app = clamp(this.k*PER - i, 0, 1);
      g.save();
      g.globalAlpha = app;
      g.translate(W/2, y + 24);
      g.rotate(tilt);
      const sw = BW - 96, sh = 50;
      g.save(); g.shadowColor='rgba(0,0,0,.35)'; g.shadowBlur=10; g.shadowOffsetY=4;
      g.fillStyle = isNew ? '#fffbe8' : '#f6f2e2';
      rr(-sw/2, -sh/2, sw, sh, 4); g.fill(); g.restore();
      if (isNew){
        g.strokeStyle = `rgba(245,181,61,${.55+Math.sin(T/9)*.35})`;
        g.lineWidth = 3; rr(-sw/2, -sh/2, sw, sh, 4); g.stroke();
      }
      // rank
      const medal = idx===0 ? '#e8b64a' : idx===1 ? '#b9c2c8' : idx===2 ? '#c08a52' : null;
      if (medal){
        g.fillStyle = medal; g.beginPath(); g.arc(-sw/2+34, 0, 17, 0, 7); g.fill();
        g.fillStyle='rgba(0,0,0,.18)'; g.beginPath(); g.arc(-sw/2+34, 3, 17, 0.2, Math.PI-0.2); g.fill();
        txt(String(idx+1), -sw/2+34, 6, 18, '#3a2a12');
      } else {
        txt(String(idx+1), -sw/2+34, 6, 18, '#8a95a0');
      }
      // who
      txt(r.name, -sw/2+72, -2, 19, '#2f4250', 'left');
      txt(r.char + (r.hard ? '   ·   HARD MODE' : ''), -sw/2+72, 17, 12,
          r.hard ? '#a06a2a' : '#7a8892', 'left', 400);
      // what the boss said
      txt(r.verdict, 84, 2, 16, r.vcol || '#2f4250', 'left');
      const tags = [];
      if (r.quit) tags.push('walked off');
      if (r.boomed) tags.push(r.boomed + (r.boomed===1 ? ' unit burnt' : ' units burnt'));
      if (tags.length) txt(tags.join('  ·  '), 84, 19, 11, 'rgba(180,60,70,.85)', 'left', 400);
      // the number
      txt(String(r.score), sw/2-44, 8, 28,
          r.score >= 90 ? '#2f8f5c' : r.score >= 50 ? '#9a6a1a' : '#b5404c');
      g.restore();
      pin(W/2 - (BW-96)/2 + 12, y + 6, idx%2 ? '#3f7fd0' : '#ee5f6e');
    });

    /* paging */
    if (rows.length > PER){
      if (button('▲', W-150, H-128, 46, 40, {size:18}) && this.top > 0) this.top -= PER;
      if (button('▼', W-96,  H-128, 46, 40, {size:18}) &&
          this.top + PER < rows.length) this.top += PER;
      txt(`${this.top+1}–${Math.min(this.top+PER, rows.length)} of ${rows.length}`,
          W-123, H-142, 12, 'rgba(240,235,220,.6)');
    }

    if (button('BACK', 40, H-58, 200, 46, {size:18})){ SFX.click(); go(S_menu, 'fade'); }
    if (rows.length && button('CLEAR THE BOARD', W-260, H-58, 220, 42,
                              {col:'#8a7a5a', size:14})){
      if (this.armed){ Board.clear(); this.rows = []; this.armed = false;
                       S_board.mark = -1; SFX.bad(); toast('board cleared'); }
      else { this.armed = true; toast('press it again to clear the board'); }
    }
    if (this.armed) txt('press again to confirm', W-150, H-70, 12, '#f5cf8a');

    hudEl.textContent = 'The board by the office door';
  }
};

/* ---------------- typing your name onto a slip ---------------- */
const S_sign = {
  enter(){ typingStart('', 14); this.k = 0; this.entry = makeEntry(''); },
  exit(){ if (typingActive()) typingStop(); },
  draw(){
    this.k = Math.min(1, this.k + dt/22);
    const wall = g.createLinearGradient(0,0,0,H);
    wall.addColorStop(0,'#14384c'); wall.addColorStop(1,'#0a2130');
    g.fillStyle = wall; g.fillRect(0,0,W,H);
    vignette(.4);

    const name = typingText();
    /* the slip, waiting for a name */
    g.save(); g.translate(W/2, H/2 - 10); g.rotate(-0.014);
    g.save(); g.shadowColor='rgba(0,0,0,.5)'; g.shadowBlur=24; g.shadowOffsetY=10;
    g.fillStyle='#f6f2e2'; rr(-330, -160, 660, 320, 8); g.fill(); g.restore();
    g.strokeStyle='#cfc6ac'; g.lineWidth=3; rr(-330, -160, 660, 320, 8); g.stroke();

    txt('PIN IT TO THE BOARD', 0, -116, 22, '#2f4250');
    g.strokeStyle='#dcd4bc'; g.lineWidth=2;
    g.beginPath(); g.moveTo(-290, -98); g.lineTo(290, -98); g.stroke();

    txt('NAME', -290, -62, 13, '#8a95a0', 'left');
    // the writing line
    g.strokeStyle='#b9b098'; g.lineWidth=2;
    g.beginPath(); g.moveTo(-290, -14); g.lineTo(290, -14); g.stroke();
    txt(name || '', -286, -22, 30, '#2f4250', 'left');
    if (Math.sin(T/14) > 0){
      g.font = '700 30px "Trebuchet MS",Verdana,sans-serif';
      const w = name ? g.measureText(name).width : 0;
      g.fillStyle='#2f4250'; g.fillRect(-282 + w + 6, -46, 3, 30);
    }
    txt('type it in, then press ENTER', -290, 12, 13, '#8a95a0', 'left', 400);

    // what is being pinned up
    const e = this.entry;
    txt(e.char + '   ·   ' + e.title, -290, 58, 15, '#5a6a76', 'left', 400);
    txt(e.verdict, -290, 84, 17, e.vcol, 'left');
    txt(String(e.score) + ' / 100', 290, 78, 34,
        e.score >= 90 ? '#2f8f5c' : e.score >= 50 ? '#9a6a1a' : '#b5404c', 'right');
    if (e.hard) txt('HARD MODE', 290, 100, 12, '#a06a2a', 'right');
    g.restore();

    const ok = name.trim().length > 0;
    if (button('PIN IT UP', W/2-320, H-86, 300, 50,
               {col: ok ? '#3fd07f' : '#5a6672', size:19}) && ok) this.commit();
    if (keyPressed('Enter') && ok) this.commit();
    if (button('JUST SHOW ME THE BOARD', W/2+20, H-86, 300, 50, {size:16})){
      typingStop(); SFX.click(); S_board.mark = -1; go(S_board, 'fade');
    }
    hudEl.textContent = '';
  },
  commit(){
    const name = typingStop();
    const entry = makeEntry(name);
    S_board.mark = Board.add(entry);
    SFX.stamp(); shake(5);
    go(S_board, 'fade');
  }
};
