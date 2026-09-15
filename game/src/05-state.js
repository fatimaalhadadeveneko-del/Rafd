/* ============================================================
   Game state, skill behaviour, hints, conversations
   ============================================================ */
let hero = CHARS[0];

const SUBJ = { sep:'Separation', rea:'Reactors', flu:'Fluids', hea:'Heat', the:'Thermo' };
const WEIGHT = { sep:.20, rea:.20, flu:.20, hea:.20, the:.10, saf:.10 };

const G = {
  got:   { sep:0, rea:0, flu:0, hea:0, the:0, saf:0 },
  maxp:  { sep:0, rea:0, flu:0, hea:0, the:0, saf:0 },
  done:  {},                 // station key -> true
  ppe:   { goggles:false, coat:false, hat:false },
  ppeTries: 0,
  sheet: false,              // picked up the Reynolds cheat sheet
  hintUsed: {},              // per station
  blunders: 0,
  quizDone: {},              // station key -> true, hard mode only
  faults: {},                // station key -> how many faults were left behind
  boom: null,                // a station key waiting to blow up in the yard
  boomed: {},                // stations that have already gone off
  quitEarly: false,          // reported back with work still open
  bailed: {},                // stations walked out of half finished
  reset(){
    for (const k in this.got){ this.got[k]=0; this.maxp[k]=0; }
    this.done = {}; this.ppe = {goggles:false,coat:false,hat:false}; this.ppeTries=0;
    this.sheet=false; this.hintUsed={}; this.blunders=0; this.quizDone={};
    this.faults = {}; this.boom = null; this.boomed = {};
    this.quitEarly = false; this.bailed = {};
  }
};

/* ============================================================
   Walking away from a mistake.  Nobody makes you fix anything: a weak
   engineer genuinely cannot see the problem, and everyone else tells
   themselves they will come back to it.  Neither ever does, and a unit
   left with two or more faults does not stay quiet about it.
   ============================================================ */
function leaveLabel(subject){
  return isWeak(subject) ? 'LEAVE IT AS IT IS' : 'FIX IT LATER';
}
function leaveBlurb(subject){
  return isWeak(subject)
    ? 'it looked fine to me'
    : 'make a note, come back to it';
}
function noteFault(station){
  G.faults[station] = (G.faults[station] || 0) + 1;
  G.blunders++;
}
function stationFaults(station){ return G.faults[station] || 0; }
/* call as a station hands control back to the yard */
function armExplosion(station){
  if (stationFaults(station) >= 2 && !G.boomed[station]) G.boom = station;
}

/* Hard mode rides on the character you pick: the boss's cousin gets no hints,
   no guide bands, misreads everything, and is followed around by Bassam. */
function isHard(){ return !!hero.hard; }

/* award(key, earned, possible) */
function award(key, earned, possible){
  G.got[key]  += earned;
  G.maxp[key] += possible;
}
function finalScore(){
  let s = 0;
  for (const k in WEIGHT){
    const m = G.maxp[k] || 1;
    s += WEIGHT[k] * clamp(G.got[k]/m, 0, 1);
  }
  return Math.round(s * 100);
}
function subjectPct(k){
  const m = G.maxp[k]; if (!m) return 0;
  return Math.round(100 * G.got[k] / m);
}

/* ---------------- skill behaviour ----------------
   2 strong : the engineer spots it immediately (free ghost hint)
   1 ok     : no help up front, works it out after one wrong attempt
   0 weak   : no help, and offers a confidently wrong opinion
------------------------------------------------- */
function skill(k){ return hero.stats[k] === undefined ? 1 : hero.stats[k]; }
function isStrong(k){ return skill(k) === 2 && !isHard(); }
function isWeak(k){ return skill(k) === 0 || isHard(); }

/* Guide rails — the green target bands, the ghost outlines and the coffee hint
   are all crutches.  A weak engineer in that subject does not get them, and the
   boss's cousin never gets them at all. */
function showGuide(k){ return !isHard() && skill(k) > 0; }
function ghostHelp(k){ return isStrong(k); }
/* a shaky engineer has to look twice before the game will let them commit */
function needsInspection(k){ return isHard() || skill(k) === 0; }

/* what the engineer mutters when they look at a problem */
const MUTTER = {
  sep: { 2:'Easy. I can see the split from here.',
         1:'Right. Let me read the stream properly.',
         0:'Separation. That is the one with the colours, no?' },
  rea: { 2:'Reactor work. Finally something I enjoy.',
         1:'Reactors. Fine. Slowly.',
         0:'A reactor is just a big kettle. How hard can it be.' },
  flu: { 2:'I can hear what this line needs.',
         1:'Piping. Let me think it through.',
         0:'Fluids. Everything flows eventually, surely.' },
  hea: { 2:'Heat I can do in my sleep.',
         1:'Heat transfer. Careful now.',
         0:'Hot goes to cold. That is the whole subject, right?' },
  the: { 2:'Thermo. My favourite nightmare.',
         1:'Thermo. I remember most of it.',
         0:'Thermo. Please, not thermo.' }
};
/* the cousin has his own, worse, commentary */
const HARD_MUTTER = {
  sep:'Separation. So we separate it. I do not see the difficulty here.',
  rea:'A reactor. Like a microwave, but industrial. I have used a microwave.',
  flu:'Pipes. You point them where you want the stuff to go. Done.',
  hea:'Heat transfer. You turn the dial until the number looks nicer.',
  the:'Thermo. My uncle said I would not need this one.'
};
function mutterFor(k){ return isHard() ? HARD_MUTTER[k] : MUTTER[k][skill(k)]; }

/* ---------------- coffee hint ---------------- */
const Hint = {
  station:null, shown:0, text:'',
  begin(station){ this.station = station; this.shown = 0; this.text=''; },
  /* hard mode has no coffee, no hints, no mercy */
  offered(){ return !isHard(); },
  available(){ return !isHard() && !G.hintUsed[this.station]; },
  use(text){
    if (!this.available()) return false;
    G.hintUsed[this.station] = true;
    this.text = text; this.shown = 300;
    SFX.pickup(); toast('Coffee. Suddenly things are clearer.');
    return true;
  },
  /* draw the coffee cup button + the thought bubble */
  draw(x, y, anchorX, anchorY){
    if (!this.offered()) return false;
    if (this.shown > 0){
      this.shown -= dt;
      thought(this.text, anchorX, anchorY, { w:280, size:17, reveal:1e9 });
    }
    const avail = this.available();
    const z = zone(x-26, y-30, 52, 58);
    g.save();
    g.globalAlpha = avail ? 1 : .35;
    if (z.hover && avail){ g.shadowColor='#f5b53d'; g.shadowBlur=18; }
    // saucer + mug
    g.fillStyle='#e8eef2'; g.beginPath(); g.ellipse(x,y+18,24,7,0,0,7); g.fill();
    g.fillStyle='#f2f5f7'; rr(x-15,y-12,30,30,5); g.fill();
    g.strokeStyle='#b9c6ce'; g.lineWidth=2; rr(x-15,y-12,30,30,5); g.stroke();
    g.strokeStyle='#d8e2e8'; g.lineWidth=4;
    g.beginPath(); g.arc(x+19,y+2,8,-1.1,1.1); g.stroke();
    g.fillStyle='#6b3d22'; rr(x-11,y-8,22,7,2); g.fill();
    g.restore();
    if (avail){
      if (Math.random()<.14) emitSteam(x, y-14, 1, {speed:.5, col:'rgba(210,190,170,.5)'});
      txt('HINT', x, y+32, 11, z.hover?'#f5b53d':'rgba(245,181,61,.65)');
    } else txt('USED', x, y+32, 11, 'rgba(200,215,225,.3)');
    return z.clicked && avail;
  }
};

/* ============================================================
   Conversation runner
   lines: [{ by, text, face, talk, at:()=>[x,y], w }]
   `by` is only a label; `at` decides where the bubble points.
   ============================================================ */
function Convo(lines, onDone, opt={}){
  return {
    i:0, chars:0, done:false, pop:0,
    get line(){ return lines[Math.min(this.i, lines.length-1)]; },
    advance(){
      const l = this.line;
      if (this.chars < l.text.length){ this.chars = l.text.length; return; }
      this.i++; this.chars = 0; this.pop = 0;
      if (this.i >= lines.length){ this.done = true; onDone && onDone(); }
    },
    /* call every frame; returns the current line so the scene can animate the speaker */
    draw(){
      if (this.done) return null;
      const l = this.line;
      this.chars = Math.min(l.text.length, this.chars + dt * (opt.speed || 1.15));
      this.pop = Math.min(1, this.pop + dt/9);
      const [ax, ay] = l.at ? l.at() : [W/2, H*0.55];
      const b = bubble(l.text, ax, ay, {
        w: l.w || opt.w || 330, size: opt.size || 18,
        reveal: this.chars, pop: this.pop,
        fill: l.think ? 'rgba(252,250,235,.97)' : 'rgba(250,252,254,.97)',
        stroke: l.think ? 'rgba(245,181,61,.9)' : 'rgba(35,166,224,.85)'
      });
      if (l.by && l.name !== false){
        const nw = 14 + l.by.length * 8.4;
        g.fillStyle = l.think ? 'rgba(245,181,61,.92)' : 'rgba(35,166,224,.92)';
        rr(b.bx + 12, b.by - 13, nw, 22, 7); g.fill();
        txt(l.by, b.bx + 12 + nw/2, b.by - 2, 14, '#04121a');
      }
      const ready = this.chars >= l.text.length;
      if (ready){
        const blink = (Math.sin(T/12)*.5+.5);
        txt('▼', ax, ay - 4 + Math.sin(T/12)*2, 16, `rgba(35,166,224,${.45+blink*.55})`);
      }
      if (mouse.click || keyPressed(' ','Enter','Space')) { SFX.click(); this.advance(); }
      return l;
    },
    /* true while the given speaker label is the one talking */
    speaking(who){ return !this.done && this.line.by === who && this.chars < this.line.text.length; }
  };
}

/* helper: is this convo line from the hero? */
function heroTalking(c){ return c && !c.done && c.line.by === hero.name; }

/* ============================================================
   Bassam's exit quiz — hard mode only.  He blocks the door of each
   unit room and asks three true/false questions before letting you out.
   ============================================================ */
const TF_QUIZ = {
  sep: [
    { q:'Liquid holdup is the quantity of liquid contained in the packed bed.', a:true,
      why:'That is exactly what holdup means: the liquid sitting inside the packing at any moment.' },
    { q:'For equimolar counterdiffusion in a binary mixture, both components diffuse in the same direction.', a:false,
      why:'Counterdiffusion means they pass each other going opposite ways, mole for mole.' },
    { q:'Distillation can separate components of a liquid mixture based on differences in their volatility.', a:true,
      why:'A difference in volatility is the entire basis of distillation.' }
  ],
  rea: [
    { q:'For a given reaction, increasing reactant concentration will always increase the reaction rate, regardless of the form of the rate law.', a:false,
      why:'Zero order in that reactant, or a catalyst already saturated, and the rate does not move at all.' },
    { q:'Mass-transfer limitations can reduce the conversion achieved in a reactor.', a:true,
      why:'If reactant cannot reach the active site fast enough, the observed rate falls and so does conversion.' },
    { q:'For a first-order irreversible reaction, a CSTR generally achieves a higher conversion than a PFR of the same volume under identical feed conditions.', a:false,
      why:'A CSTR sits at the low outlet concentration throughout, so it needs more volume. The PFR wins.' }
  ],
  flu: [
    { q:'The Reynolds number represents the ratio of viscous forces to inertial forces.', a:false,
      why:'The other way round. Inertial over viscous.' },
    { q:'For flow through a pipe, the volumetric flow rate is equal to the fluid velocity divided by the cross-sectional area.', a:false,
      why:'Q equals v times A. Multiplied, not divided.' },
    { q:'The pressure drop due to friction in a pipe decreases as the pipe length increases.', a:false,
      why:'Friction loss grows with length. A longer pipe costs you more pressure, not less.' }
  ],
  hea: [
    { q:'In steady-state heat conduction, the temperature at every point in the system must be constant and equal.', a:false,
      why:'Constant in time, yes. Equal everywhere, no. Without a gradient nothing would conduct at all.' },
    { q:'The convection heat transfer coefficient, h, is a material property that depends only on the type of fluid.', a:false,
      why:'h also depends on geometry, flow regime and velocity. It is not a property of the fluid alone.' },
    { q:'Thermal radiation can transfer energy through a vacuum without requiring a material medium.', a:true,
      why:'Radiation needs no medium whatsoever. That is how the sun reaches you.' }
  ]
};

/* Bassam's opening jab per station, so he is not repeating himself */
const SUS_INTRO = {
  sep: 'Before you go. Three questions. Humour me.',
  rea: 'Not so fast. I watched that. Three questions.',
  flu: 'One moment. I want to check something about you.',
  hea: 'Last one, I promise. Then I will leave you alone. Probably.'
};
const SUS_PASS = [
  'Hm. Fine. Maybe somebody did teach you something.',
  'Two out of three. I am revising my theory. Slightly.',
  'All three. I genuinely did not expect that. Carry on.'
];
const SUS_FAIL = [
  'None of them. Not one. I am writing this down.',
  'That was painful to watch. Go. Just go.',
  'I am going to have a word with your uncle.'
];

/* returns a drawable quiz; call draw() each frame, it calls onDone(correct) */
function makeTFQuiz(key, onDone){
  const qs = TF_QUIZ[key] || [];
  return {
    i:0, picked:null, fb:0, correct:0, pop:0, closing:0,
    finished:false,
    draw(){
      /* the man himself, arms folded in the doorway */
      shade(.72);
      const bx = 250, by = 600;
      drawPerson(NPCS.sus, bx, by, 2.5, {
        dir:'right', seed:23,
        face: this.fb > 0 ? (this.wasRight ? 'neutral' : 'angry') : 'neutral',
        pose: this.fb > 0 ? 'point' : 'cross',
        talk: this.fb <= 0 && this.pop < 1
      });
      txt(NPCS.sus.name, bx, by + 28, 15, '#9fd8ef');
      txt('Process Safety. Allegedly.', bx, by + 48, 12, 'rgba(159,216,239,.55)','center',400);

      if (this.finished){
        this.closing -= dt;
        const msg = this.correct === 3 ? SUS_PASS[2]
                  : this.correct === 2 ? SUS_PASS[1]
                  : this.correct === 1 ? SUS_PASS[0]
                  : SUS_FAIL[0];
        bubble(msg, bx + 40, by - 250, { w:360, size:18, pop:1 });
        panel(W/2-220, H-118, 440, 60, 'rgba(4,18,28,.96)',
              this.correct >= 2 ? '#3fd07f' : '#ee5f6e');
        txt(this.correct + ' of 3 correct', W/2, H-88, 22,
            this.correct >= 2 ? '#8fe8b8' : '#f0b0bc');
        if (this.closing <= 0 && button('GO BACK TO WORK', W/2-130, H-48, 260, 40,
                                        { col:'#3fd07f', size:16 })){
          onDone(this.correct);
        }
        return;
      }

      const q = qs[this.i];
      this.pop = Math.min(1, this.pop + dt/12);

      txt('HARD MODE  ·  ' + (this.i+1) + ' of 3', W/2, 74, 15, '#f5b53d');
      if (this.i === 0 && this.fb <= 0)
        bubble(SUS_INTRO[key], bx + 40, by - 250, { w:320, size:17, pop:this.pop });

      panel(W/2-400, 150, 800, 150, 'rgba(6,24,36,.97)', 'rgba(35,166,224,.6)');
      wrapText(q.q, W/2, 210, 730, 30, 21, '#eaf4fa', 'center', 400);

      const bw = 240, bh = 64, gap = 40;
      [['TRUE', true], ['FALSE', false]].forEach(([lab, val], k)=>{
        const bx2 = W/2 - bw - gap/2 + k*(bw+gap), by2 = 344;
        const locked = this.fb > 0;
        const chosen = locked && this.picked === val;
        const isRight = val === q.a;
        const z = zone(bx2, by2, bw, bh);
        g.save();
        if (z.hover && !locked){ g.shadowColor='#23a6e0'; g.shadowBlur=22; }
        g.fillStyle = chosen ? (isRight ? 'rgba(16,70,48,.98)' : 'rgba(70,18,26,.98)')
                    : locked && isRight ? 'rgba(16,70,48,.72)'
                    : locked ? 'rgba(12,28,38,.7)'
                    : z.hover ? 'rgba(16,58,80,.98)' : 'rgba(8,32,46,.95)';
        rr(bx2, z.hover && !locked ? by2-3 : by2, bw, bh, 12); g.fill();
        g.restore();
        g.strokeStyle = chosen ? (isRight ? '#3fd07f' : '#ee5f6e')
                      : locked && isRight ? '#3fd07f'
                      : locked ? 'rgba(120,150,165,.3)'
                      : z.hover ? '#23a6e0' : 'rgba(35,166,224,.4)';
        g.lineWidth = chosen ? 3.4 : 2;
        rr(bx2, z.hover && !locked ? by2-3 : by2, bw, bh, 12); g.stroke();
        txt(lab, bx2+bw/2, (z.hover && !locked ? by2-3 : by2)+bh/2, 26,
            locked && !chosen && !isRight ? 'rgba(200,220,232,.35)' : '#eaf4fa');
        if (z.clicked && !locked) this.answer(val, q);
      });

      if (this.fb > 0){
        this.fb -= dt;
        panel(W/2-400, 442, 800, 118, this.wasRight ? 'rgba(8,40,28,.97)' : 'rgba(44,12,18,.97)',
              this.wasRight ? '#3fd07f' : '#ee5f6e');
        txt(this.wasRight ? 'CORRECT' : 'WRONG', W/2, 474, 24,
            this.wasRight ? '#3fd07f' : '#ee5f6e');
        wrapText(q.why, W/2, 514, 730, 24, 18, '#dceaf2', 'center', 400);
        if (this.fb <= 0){
          this.fb = 0; this.i++; this.picked = null; this.pop = 0;
          if (this.i >= qs.length){ this.finished = true; this.closing = 40; SFX.click(); }
        }
      }
    },
    answer(val, q){
      this.picked = val;
      this.wasRight = (val === q.a);
      if (this.wasRight){ this.correct++; SFX.good(); } else { SFX.bad(); }
      this.fb = 150;
    }
  };
}


/* ============================================================
   Clocking off early
   ============================================================ */
const UNIT_KEYS = ['sep','rea','flu','hea','brk'];
function unitsLeft(){ return UNIT_KEYS.filter(k => !G.done[k]).length; }

/* the little "walk out" tab every station carries, so nobody at a booth
   is ever trapped in a room they have run out of time for */
function bailTab(){
  const w = 168, h = 34, x = W - w - 18, y = 16;
  const z = zone(x, y, w, h);
  g.fillStyle = z.hover ? 'rgba(70,26,30,.96)' : 'rgba(10,14,20,.78)';
  rr(x, y, w, h, 8); g.fill();
  g.strokeStyle = z.hover ? '#ee5f6e' : 'rgba(190,200,210,.35)';
  g.lineWidth = z.hover ? 2.4 : 1.6; rr(x, y, w, h, 8); g.stroke();
  txt('WALK OUT  ·  ESC', x + w/2, y + h/2 + 5, 14,
      z.hover ? '#ffd0d4' : 'rgba(210,220,230,.7)');
  return z.clicked || keyPressed('Escape');
}
/* leave a station wherever you happen to be standing in it */
function bailOut(station){
  G.bailed[station] = true;
  SFX.bad();
  toast(isWeak(station) ? 'close enough' : 'leaving it half done');
  go(S_hub, 'fade');
}

/* ============================================================
   The scoreboard — a clipboard of Mr. Tarek's reports.
   Saved in the browser where it is allowed, and kept for the
   session either way, which is all a booth needs.
   ============================================================ */
const Board = {
  KEY: 'chemengquest.board.v1',
  mem: null,
  load(){
    if (this.mem) return this.mem;
    this.mem = [];
    try {
      const raw = localStorage.getItem(this.KEY);
      if (raw) this.mem = JSON.parse(raw) || [];
    } catch (e) { /* file:// or private browsing. The session copy still works. */ }
    return this.mem;
  },
  save(){
    try { localStorage.setItem(this.KEY, JSON.stringify(this.mem.slice(0, 60))); }
    catch (e) { /* nothing to do about it, and nothing that needs saying */ }
  },
  add(entry){
    this.load();
    this.mem.push(entry);
    this.mem.sort((a,b) => b.score - a.score);
    this.mem = this.mem.slice(0, 60);
    this.save();
    return this.mem.indexOf(entry);
  },
  clear(){ this.mem = []; this.save(); }
};
