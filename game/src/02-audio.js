/* ============================================================
   Audio — everything synthesised, no external files
   ============================================================ */
let AC = null, masterGain = null, musicGain = null, sfxGain = null;
let audioReady = false;

function initAudio(){
  if (AC) return;
  AC = new (window.AudioContext || window.webkitAudioContext)();
  masterGain = AC.createGain(); masterGain.gain.value = 0.9; masterGain.connect(AC.destination);
  musicGain  = AC.createGain(); musicGain.gain.value  = 0.34; musicGain.connect(masterGain);
  sfxGain    = AC.createGain(); sfxGain.gain.value    = 0.55; sfxGain.connect(masterGain);
  audioReady = true;
}
function resumeAudio(){ if (AC && AC.state === 'suspended') AC.resume(); }

/* note name -> frequency */
const NOTE = {};
(function(){
  const names = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'];
  for (let o=1;o<=7;o++) for (let i=0;i<12;i++)
    NOTE[names[i]+o] = 440 * Math.pow(2, (i-9)/12 + (o-4));
})();
const N = n => n === '-' ? 0 : (NOTE[n] || 0);

/* ---------- one-shot tone ---------- */
function tone(freq, dur, opt = {}){
  if (!audioReady || !freq) return;
  const t0 = AC.currentTime + (opt.delay || 0);
  const o = AC.createOscillator();
  const gn = AC.createGain();
  o.type = opt.type || 'square';
  o.frequency.setValueAtTime(freq, t0);
  if (opt.slide) o.frequency.exponentialRampToValueAtTime(Math.max(20,opt.slide), t0 + dur);
  if (opt.vib){
    const lfo = AC.createOscillator(), lg = AC.createGain();
    lfo.frequency.value = opt.vib; lg.gain.value = opt.vibDepth || 6;
    lfo.connect(lg); lg.connect(o.frequency); lfo.start(t0); lfo.stop(t0+dur);
  }
  const vol = opt.vol === undefined ? .18 : opt.vol;
  const atk = opt.atk === undefined ? .008 : opt.atk;
  gn.gain.setValueAtTime(0.0001, t0);
  gn.gain.exponentialRampToValueAtTime(vol, t0 + atk);
  gn.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  let node = o;
  if (opt.filter){
    const f = AC.createBiquadFilter(); f.type='lowpass'; f.frequency.value = opt.filter;
    o.connect(f); node = f;
  }
  node.connect(gn); gn.connect(opt.bus || sfxGain);
  o.start(t0); o.stop(t0 + dur + .02);
}

/* ---------- noise burst (drums, steam, explosions) ---------- */
let noiseBuf = null;
function noise(dur, opt = {}){
  if (!audioReady) return;
  if (!noiseBuf){
    noiseBuf = AC.createBuffer(1, AC.sampleRate*2, AC.sampleRate);
    const d = noiseBuf.getChannelData(0);
    for (let i=0;i<d.length;i++) d[i] = Math.random()*2-1;
  }
  const t0 = AC.currentTime + (opt.delay||0);
  const src = AC.createBufferSource(); src.buffer = noiseBuf; src.loop = true;
  const f = AC.createBiquadFilter();
  f.type = opt.ftype || 'bandpass';
  f.frequency.setValueAtTime(opt.freq || 1200, t0);
  if (opt.sweep) f.frequency.exponentialRampToValueAtTime(Math.max(60,opt.sweep), t0+dur);
  f.Q.value = opt.q || 1;
  const gn = AC.createGain();
  const vol = opt.vol === undefined ? .2 : opt.vol;
  gn.gain.setValueAtTime(0.0001, t0);
  gn.gain.exponentialRampToValueAtTime(vol, t0 + (opt.atk||.006));
  gn.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  src.connect(f); f.connect(gn); gn.connect(opt.bus || sfxGain);
  src.start(t0); src.stop(t0 + dur + .02);
}

/* ============================================================
   SFX
   ============================================================ */
const SFX = {
  click(){ tone(660,.05,{type:'square',vol:.08}); },
  hover(){ tone(880,.03,{type:'sine',vol:.04}); },
  step(){ noise(.05,{freq:260,q:1.4,vol:.05,ftype:'lowpass'}); },

  good(){ [784,988,1319].forEach((f,i)=> tone(f,.22,{type:'square',vol:.12,delay:i*.075})); },
  great(){ [659,784,988,1319,1568].forEach((f,i)=> tone(f,.3,{type:'triangle',vol:.14,delay:i*.07})); },

  /* the silly "you messed up" slide */
  bad(){
    tone(392,.18,{type:'sawtooth',vol:.13,slide:330});
    tone(330,.2 ,{type:'sawtooth',vol:.13,slide:262,delay:.16});
    tone(262,.42,{type:'sawtooth',vol:.14,slide:180,delay:.34,vib:9,vibDepth:9});
    noise(.2,{freq:500,vol:.05,delay:.34,sweep:180});
  },
  wahwah(){ // extra goofy, for big blunders
    for (let i=0;i<3;i++)
      tone(300 - i*40, .3, {type:'sawtooth', vol:.12, delay:i*.22, vib:7, vibDepth:26, slide:220-i*40});
  },

  place(){ tone(180,.09,{type:'square',vol:.12,slide:120}); noise(.08,{freq:900,vol:.09,sweep:300}); },
  bolt(){ noise(.07,{freq:2600,q:3,vol:.09,sweep:1400}); tone(1320,.05,{type:'square',vol:.06}); },
  pickup(){ [523,784].forEach((f,i)=>tone(f,.12,{type:'triangle',vol:.1,delay:i*.07})); },

  steam(){ noise(.85,{freq:3000,q:.6,vol:.12,ftype:'highpass',sweep:900,atk:.09}); },
  bubble(){ tone(rnd(400,700),.1,{type:'sine',vol:.06,slide:rnd(800,1200)}); },
  pour(){ noise(.6,{freq:800,q:.8,vol:.07,sweep:400,atk:.12}); },

  boom(){
    noise(.75,{freq:900,q:.4,vol:.4,ftype:'lowpass',sweep:50,atk:.004});
    tone(90,.6,{type:'sawtooth',vol:.25,slide:28});
    tone(55,.8,{type:'sine',vol:.3,slide:24});
  },
  fire(){ noise(1.1,{freq:700,q:.5,vol:.11,ftype:'lowpass',sweep:260,atk:.2}); },
  freeze(){
    [1400,1100,900,700].forEach((f,i)=>tone(f,.5,{type:'sine',vol:.07,delay:i*.09,slide:f*.6}));
    noise(.7,{freq:4200,q:1.5,vol:.05,ftype:'highpass',sweep:2000});
  },
  squelch(){ tone(160,.4,{type:'sawtooth',vol:.14,slide:70,vib:14,vibDepth:20});
             noise(.4,{freq:420,q:1.2,vol:.1,sweep:150}); },
  puff(){ noise(.35,{freq:1800,q:.7,vol:.09,ftype:'highpass',sweep:500,atk:.03}); },

  phone(){ [880,1175].forEach((f,i)=>tone(f,.1,{type:'sine',vol:.08,delay:i*.11})); },
  cash(){ [1319,1568,2093].forEach((f,i)=>tone(f,.16,{type:'triangle',vol:.1,delay:i*.06})); },

  sleep(){ [392,330,262,196].forEach((f,i)=>tone(f,.6,{type:'sine',vol:.09,delay:i*.22,vib:4,vibDepth:4})); },
  dream(){
    for (let i=0;i<7;i++) tone(523*Math.pow(2,i/12*.6),.9,{type:'sine',vol:.05,delay:i*.1,vib:5,vibDepth:8});
    noise(1.4,{freq:600,q:.5,vol:.05,ftype:'lowpass',sweep:180,atk:.5});
  },
  swirl(){
    tone(180,1.3,{type:'sawtooth',vol:.1,slide:1400,vib:11,vibDepth:30});
    noise(1.3,{freq:400,q:.8,vol:.09,sweep:3000,atk:.3});
  },
  gasp(){ noise(.35,{freq:1600,q:.8,vol:.11,ftype:'highpass',sweep:600,atk:.02}); },

  stamp(){ noise(.16,{freq:260,q:1.2,vol:.35,ftype:'lowpass',sweep:70,atk:.003});
           tone(120,.2,{type:'square',vol:.2,slide:55}); },
  thud(){ noise(.3,{freq:180,q:1,vol:.3,ftype:'lowpass',sweep:50}); tone(70,.35,{type:'sine',vol:.25,slide:35}); },
  laugh(){ // classroom "haaa ha ha"
    const base=[330,392,440,392,349];
    base.forEach((f,i)=>{ tone(f,.16,{type:'sawtooth',vol:.09,delay:i*.14,vib:16,vibDepth:18});
                          tone(f*1.5,.14,{type:'square',vol:.05,delay:i*.14+.02}); });
  },
  yell(){ tone(220,.5,{type:'sawtooth',vol:.2,slide:150,vib:8,vibDepth:22});
          noise(.5,{freq:900,q:.7,vol:.1,sweep:300}); },

  kick(){ noise(.25,{freq:1400,q:.6,vol:.22,sweep:300}); tone(200,.3,{type:'square',vol:.16,slide:900}); },
  fanfare(){ [523,659,784,1047,1319].forEach((f,i)=>tone(f,.45,{type:'triangle',vol:.16,delay:i*.12}));
             [523,659,784,1047].forEach((f,i)=>tone(f/2,.5,{type:'square',vol:.08,delay:i*.12})); },
  sad(){ [440,415,392,330].forEach((f,i)=>tone(f,.5,{type:'triangle',vol:.12,delay:i*.26,vib:5,vibDepth:6})); },
  badge(){ [1047,1319,1568,2093].forEach((f,i)=>tone(f,.6,{type:'sine',vol:.13,delay:i*.14})); },
  alarm(){ for(let i=0;i<4;i++){ tone(880,.16,{type:'square',vol:.1,delay:i*.3});
                                 tone(660,.16,{type:'square',vol:.1,delay:i*.3+.16}); } }
};

/* ============================================================
   Music — tiny step sequencer
   ============================================================ */
const TRACKS = {
  menu: { bpm:126, swing:.12, wave:'square', bassWave:'triangle',
    lead:['C5','-','E5','G5','-','E5','C5','-','D5','-','F5','A5','-','F5','D5','-',
          'E5','-','G5','C6','-','G5','E5','-','D5','F5','E5','D5','C5','-','-','-'],
    bass:['C3','-','C3','-','G2','-','G2','-','A2','-','A2','-','F2','-','F2','-',
          'C3','-','C3','-','G2','-','G2','-','F2','-','G2','-','C3','-','-','-'],
    drum:[1,0,2,0,1,0,2,0,1,0,2,0,1,2,2,0, 1,0,2,0,1,0,2,0,1,0,2,0,1,2,1,2] },

  work: { bpm:138, swing:.14, wave:'square', bassWave:'sawtooth',
    lead:['E5','G5','-','A5','G5','-','E5','-','D5','E5','-','G5','E5','-','D5','-',
          'C5','E5','-','G5','A5','-','G5','E5','D5','-','C5','-','D5','-','E5','-'],
    bass:['A2','-','A2','A2','-','A2','-','-','F2','-','F2','F2','-','F2','-','-',
          'C3','-','C3','C3','-','C3','-','-','G2','-','G2','-','E2','-','E2','-'],
    drum:[1,0,2,0,1,0,2,2,1,0,2,0,1,0,2,0, 1,0,2,0,1,0,2,2,1,0,2,0,1,2,2,2] },

  lab: { bpm:118, swing:.1, wave:'triangle', bassWave:'triangle',
    lead:['G4','-','B4','-','D5','-','B4','-','C5','-','E5','-','G5','-','E5','-',
          'F5','-','D5','-','B4','-','D5','-','C5','-','-','-','-','-','-','-'],
    bass:['G2','-','-','-','C3','-','-','-','A2','-','-','-','D3','-','-','-',
          'G2','-','-','-','C3','-','-','-','D3','-','-','-','G2','-','-','-'],
    drum:[1,0,0,0,2,0,0,0,1,0,0,0,2,0,0,2, 1,0,0,0,2,0,0,0,1,0,2,0,2,0,0,0] },

  tense: { bpm:150, swing:0, wave:'sawtooth', bassWave:'square',
    lead:['A4','-','A4','C5','-','A4','-','G#4','A4','-','C5','-','E5','-','D5','-',
          'C5','-','B4','-','A4','-','G#4','-','A4','-','-','-','-','-','-','-'],
    bass:['A2','A2','-','A2','A2','-','A2','-','F2','F2','-','F2','F2','-','F2','-',
          'E2','E2','-','E2','E2','-','E2','-','A2','A2','-','A2','-','-','-','-'],
    drum:[1,1,2,0,1,1,2,0,1,1,2,0,1,2,2,2, 1,1,2,0,1,1,2,0,1,1,2,0,2,2,2,2] },

  dream: { bpm:84, swing:0, wave:'sine', bassWave:'sine',
    lead:['C5','-','-','E5','-','-','G5','-','B5','-','-','G5','-','E5','-','-',
          'A4','-','-','C5','-','-','E5','-','D5','-','-','-','-','-','-','-'],
    bass:['C2','-','-','-','-','-','-','-','A1','-','-','-','-','-','-','-',
          'F1','-','-','-','-','-','-','-','G1','-','-','-','-','-','-','-'],
    drum:[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0] }
};

const Music = {
  name:null, step:0, timer:null, nextTime:0, playing:false,
  play(name){
    if (!audioReady || this.name === name) return;
    this.name = name; this.step = 0;
    if (!this.playing){ this.playing = true; this.nextTime = AC.currentTime + .05; this.loop(); }
  },
  stop(){ this.name = null; },
  loop(){
    if (!audioReady) return;
    const lookahead = .12;
    while (this.name && this.nextTime < AC.currentTime + lookahead){
      this.tick(this.nextTime);
      const tr = TRACKS[this.name];
      const spb = 60 / tr.bpm / 2;                       // eighth notes
      const sw  = (this.step % 2) ? -tr.swing*spb : tr.swing*spb;
      this.nextTime += spb + sw;
      this.step++;
    }
    setTimeout(()=>this.loop(), 25);
  },
  tick(t){
    const tr = TRACKS[this.name]; if (!tr) return;
    const i = this.step % tr.lead.length;
    const d = 60 / tr.bpm / 2;
    const ld = tr.lead[i], bs = tr.bass[i], dr = tr.drum[i];
    const at = t - AC.currentTime;
    if (ld && ld !== '-') tone(N(ld), d*1.5, {type:tr.wave, vol:.10, delay:Math.max(0,at), bus:musicGain, filter:2600});
    if (bs && bs !== '-') tone(N(bs), d*1.7, {type:tr.bassWave, vol:.13, delay:Math.max(0,at), bus:musicGain, filter:900});
    if (dr === 1) noise(.09,{freq:180,q:1,vol:.16,ftype:'lowpass',sweep:60,delay:Math.max(0,at),bus:musicGain});
    if (dr === 2) noise(.05,{freq:5200,q:.8,vol:.055,ftype:'highpass',delay:Math.max(0,at),bus:musicGain});
  }
};
