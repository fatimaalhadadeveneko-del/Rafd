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
  reset(){
    for (const k in this.got){ this.got[k]=0; this.maxp[k]=0; }
    this.done = {}; this.ppe = {goggles:false,coat:false,hat:false}; this.ppeTries=0;
    this.sheet=false; this.hintUsed={}; this.blunders=0;
  }
};

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
function isStrong(k){ return skill(k) === 2; }
function isWeak(k){ return skill(k) === 0; }

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

/* ---------------- coffee hint ---------------- */
const Hint = {
  station:null, shown:0, text:'',
  begin(station){ this.station = station; this.shown = 0; this.text=''; },
  available(){ return !G.hintUsed[this.station]; },
  use(text){
    if (!this.available()) return false;
    G.hintUsed[this.station] = true;
    this.text = text; this.shown = 300;
    SFX.pickup(); toast('Coffee. Suddenly things are clearer.');
    return true;
  },
  /* draw the coffee cup button + the thought bubble */
  draw(x, y, anchorX, anchorY){
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
