/* ============================================================
   People — one articulated vector rig used by players and NPCs
   ============================================================ */

/* skill levels: 2 strong, 1 ok, 0 weak */
const CHARS = [
  { id:'layla', name:'Layla Haddad', title:'The Distiller',
    skin:'#f0c49a', hair:'#2b1a14', hairStyle:'ponytail',
    suit:'#d94e86', suit2:'#b13a6c', trim:'#ffd9e8', accent:'#ffe08a',
    stats:{ sep:2, rea:0, flu:0, hea:1, the:2 }, safety:2,
    blurb:'Lives inside a distillation column. Has never met a reactor she liked.',
    wrongLine:'"A batch reactor is just a pipe you close at both ends. Forever."',
    rightLine:'"Give me two boiling points and I will give you two products."' },

  { id:'omar', name:'Omar Nasser', title:'The Reactor Guy',
    skin:'#c98d5e', hair:'#161010', hairStyle:'spiky',
    suit:'#2f9e6e', suit2:'#1f7150', trim:'#b8f0d4', accent:'#ffd24a',
    stats:{ sep:0, rea:2, flu:1, hea:2, the:1 }, safety:0,
    blurb:'Can size a reactor in his head. Cannot find his goggles. Ever.',
    wrongLine:'"Distillation separates by colour. The darker stuff sinks."',
    rightLine:'"Every reaction is just a vessel and enough patience."' },

  { id:'yusra', name:'Yusra Kanaan', title:'The Flow Queen',
    skin:'#e8b487', hair:'#1c1218', hairStyle:'hijab',
    suit:'#e89020', suit2:'#bc6d0e', trim:'#ffd9a0', accent:'#7fe0ff',
    stats:{ sep:1, rea:1, flu:2, hea:0, the:0 }, safety:2,
    blurb:'Hears a pump going bad from three floors up. Thermo is not her friend.',
    wrongLine:'"Entropy is basically how fast the pump is spinning."',
    rightLine:'"If it is moving, I can tell you exactly how and why."' },

  { id:'jojo', name:'Jojo Tarek', title:"The Boss's Cousin",
    skin:'#e0b083', hair:'#241a12', hairStyle:'neat',
    suit:'#25c9b0', suit2:'#17998a', trim:'#fff0b0', accent:'#ff5f8a',
    floral:true, shades:true, shorts:true,
    stats:{ sep:0, rea:0, flu:0, hea:0, the:0 }, safety:0,
    hard:true,
    blurb:'Nobody knows which department he is in. Nobody is sure he applied.',
    wrongLine:'"Chemical engineering. That is the one with the beakers and the fizzing, yes?"',
    rightLine:'"My uncle runs this place, so how hard can any of it possibly be."' }
];

/* NPC definitions reuse the same rig */
const NPCS = {
  boss:      { name:'Mr. Tarek', skin:'#c08b5e', hair:'#4a4a4a', hairStyle:'bald',
               suit:'#b8562e', suit2:'#8e3f20', trim:'#f5d9a0', accent:'#f5b53d',
               build:1.12, moustache:true, tie:true },
  pharm:     { name:'Dr. Nadia', skin:'#ecc49c', hair:'#2a1c2a', hairStyle:'bun',
               suit:'#f2f4f6', suit2:'#d6dade', trim:'#8fd8f0', accent:'#e05a7a', coat:true },
  fuels:     { name:'Hakim', skin:'#a5703f', hair:'#141414', hairStyle:'cap',
               suit:'#4a6a86', suit2:'#33506a', trim:'#c8dcea', accent:'#f5b53d', build:1.08 },
  chem:      { name:'Rana', skin:'#f0c9a4', hair:'#6a2a1a', hairStyle:'wavy',
               suit:'#2fa0a8', suit2:'#1d757c', trim:'#c0f0f4', accent:'#ffd24a' },
  operator:  { name:'Fadi', skin:'#b07a48', hair:'#2a1a10', hairStyle:'cap',
               suit:'#d8c23a', suit2:'#a89a22', trim:'#fff0a0', accent:'#ee5f6e', build:1.05 },
  colleague: { name:'Dina', skin:'#e6b189', hair:'#241418', hairStyle:'hijab',
               suit:'#5f7ae0', suit2:'#4459b4', trim:'#cfd8ff', accent:'#ffd9a0' },
  prof:      { name:'Dr. Sabbagh', skin:'#d6a877', hair:'#c8c8c8', hairStyle:'profhair',
               suit:'#4a4258', suit2:'#332d40', trim:'#e0dce8', accent:'#e0c060',
               build:1.06, beard:true, glasses:true },
  student:   { name:'', skin:'#cfa075', hair:'#241810', hairStyle:'neat',
               suit:'#6a7a88', suit2:'#4c5a66', trim:'#c0ccd6', accent:'#88a0b0' },
  /* hard mode only: the colleague who does not believe you passed an interview */
  sus:       { name:'Bassam', skin:'#b8895a', hair:'#1b1410',
               hairStyle:'neat', suit:'#46566a', suit2:'#2f3c4c', trim:'#c6d2de',
               accent:'#8fe8b8', build:1.04, moustache:true }
};


function charById(id){ return CHARS.find(c=>c.id===id) || CHARS[0]; }

/* ============================================================
   Rig geometry, feet on the ground at local y = 0, up is negative
      ankle -7   knee -25   hip -46   shoulder -78   head centre -96
   Limb angles: 0 points straight DOWN, positive swings forward.
   ============================================================ */
const RIG = { ankle:-7, knee:-25, hip:-46, shoulder:-78, head:-96 };

function capsule(x1,y1,x2,y2,w,col){
  g.strokeStyle = col; g.lineWidth = w; g.lineCap = 'round';
  g.beginPath(); g.moveTo(x1,y1); g.lineTo(x2,y2); g.stroke();
}
/* a hand, oriented along the forearm, with a thumb so it reads as a hand */
function drawHand(col, a){
  g.save(); g.rotate(-a);
  g.fillStyle = col;
  g.beginPath(); g.ellipse(0, 3.4, 4.3, 5.0, 0, 0, 7); g.fill();
  g.beginPath(); g.ellipse(-3.4, 1.4, 1.8, 2.6, -0.55, 0, 7); g.fill();
  g.fillStyle = 'rgba(0,0,0,.09)';
  g.beginPath(); g.ellipse(1.6, 4.0, 1.9, 3.6, 0, 0, 7); g.fill();
  g.restore();
}
/* two-segment limb hanging downward from (hx,hy) */
function limb(hx,hy,a1,l1,a2,l2,w,col,endCol,endLen,isHand){
  const kx = hx + Math.sin(a1)*l1, ky = hy + Math.cos(a1)*l1;
  const fx = kx + Math.sin(a1+a2)*l2, fy = ky + Math.cos(a1+a2)*l2;
  capsule(hx,hy,kx,ky,w,col);
  capsule(kx,ky,fx,fy,w*0.9,col);
  if (endCol){
    g.save(); g.translate(fx,fy);
    if (isHand) drawHand(endCol, a1+a2);
    else { g.rotate(-(a1+a2)*0.45); g.fillStyle = endCol;
           rr(-endLen*0.34, -2.6, endLen, 6.8, 3); g.fill(); }
    g.restore();
  }
  return {kx,ky,fx,fy};
}

/* a leg, with an optional bare shin for anyone wearing shorts */
function drawLeg(hx,hy,a1,l1,a2,l2,w,col,shinCol,footCol){
  const kx = hx + Math.sin(a1)*l1, ky = hy + Math.cos(a1)*l1;
  const fx = kx + Math.sin(a1+a2)*l2, fy = ky + Math.cos(a1+a2)*l2;
  capsule(hx,hy,kx,ky,w,col);
  capsule(kx,ky,fx,fy,w*0.9,shinCol || col);
  g.save(); g.translate(fx,fy); g.rotate(-(a1+a2)*0.45);
  g.fillStyle = footCol; rr(-4.4, -2.6, 13, 6.8, 3); g.fill();
  if (shinCol){                       // a sandal strap, so it reads as a sandal
    g.strokeStyle = 'rgba(0,0,0,.35)'; g.lineWidth = 1.6;
    g.beginPath(); g.moveTo(-2, -2.6); g.lineTo(3, 1.2); g.stroke();
  }
  g.restore();
  return {kx,ky,fx,fy};
}

/* ============================================================
   Arm poses.  Angles: 0 = hanging straight down, positive swings
   FORWARD (the way the character is facing), so a raised arm is a
   large positive number, never a negative one.
   Each entry is [frontUpper, frontElbow, backUpper, backElbow].
   ============================================================ */
const ARM_POSES = {
  idle:      [ 0.10, 0.26, -0.10, 0.26 ],
  talk:      [ 0.90, 0.80, -0.12, 0.30 ],
  point:     [ 1.45, 0.10, -0.15, 0.28 ],
  present:   [ 1.15, 0.55, -0.10, 0.30 ],
  cheer:     [ 2.72,-0.22,  2.55,-0.22 ],
  wave:      [ 2.35,-0.45, -0.12, 0.28 ],
  work:      [ 1.75, 0.60,  0.30, 0.42 ],
  think:     [ 1.90, 1.75, -0.10, 0.28 ],
  panic:     [ 2.62,-0.18,  2.44,-0.18 ],
  hold:      [ 1.30, 0.75, -0.10, 0.28 ],
  shrug:     [ 1.62, 0.95, -1.62,-0.95 ],
  reach:     [ 1.70, 0.20, -0.12, 0.28 ],
  cross:     [ 1.15,-3.26,  1.05,-3.10 ],
  clipboard: [ 1.25, 0.95,  0.55, 1.05 ],
  grab:      [ 1.62, 0.18,  0.90, 0.55 ],
  slump:     [-0.30, 0.55, -0.42, 0.55 ]
};

/* returns {aF,bF,aB,bB} for a pose, with its own idle motion mixed in */
function armAngles(o, walking, ph, seed){
  const pose = o.pose || (walking ? 'walk' : 'idle');
  if (pose === 'walk'){
    const sw = 0.6;
    return { aF: Math.sin(ph + Math.PI) * sw, bF: 0.30 + Math.max(0, Math.sin(ph))*0.22,
             aB: Math.sin(ph) * sw,           bB: 0.30 + Math.max(0, Math.sin(ph + Math.PI))*0.22 };
  }
  const p = ARM_POSES[pose] || ARM_POSES.idle;
  let [aF, bF, aB, bB] = p;
  const t = T + seed * 17;
  switch (pose){
    case 'idle':   aF += Math.sin(t/46)*0.05; aB -= Math.sin(t/46)*0.05; break;
    case 'talk':   aF += Math.sin(t/9)*0.30;  bF += Math.sin(t/7)*0.16;  break;
    case 'work':   aF += Math.sin(t/5)*0.42;  bF += Math.sin(t/5)*0.22;  break;
    case 'cheer':  aF += Math.sin(t/7)*0.13;  aB += Math.sin(t/7+1)*0.13; break;
    case 'wave':   aF += Math.sin(t/5)*0.05;  bF += Math.sin(t/4.5)*0.55; break;
    case 'panic':  aF += Math.sin(t/3)*0.22;  aB += Math.sin(t/3+2)*0.22; break;
    case 'point':  aF += Math.sin(t/13)*0.06; break;
    case 'think':  bF += Math.sin(t/17)*0.07; break;
    case 'present':aF += Math.sin(t/15)*0.07; break;
  }
  return { aF, bF, aB, bB };
}

/* ============================================================
   drawPerson(def, x, y, scale, o)
   x,y = the ground point under the feet
   o.dir    'right' | 'left' | 'front' | 'back'
   o.walk   phase counter (0 / undefined = standing)
   o.face   neutral happy worry shock panic sweat proud sleep dead angry shame
   o.ppe    {goggles, hat, coat}
   o.pose   a name from ARM_POSES — idle talk point present cheer wave work
            think panic hold shrug reach cross clipboard grab slump
   o.armF / o.armB   raw arm override, only when a pose will not do
   o.talk   jaw and head-bob animation
   o.tilt   whole-body rotation      o.lift  vertical offset
   o.squash vertical squash (1 = normal)
   o.holdDraw(ctx)  draws something in the front hand
   ============================================================ */
function drawPerson(def, x, y, scale, o={}){
  const s = scale * (def.build || 1);
  const dir = o.dir || 'right';
  const facing = dir === 'left' ? -1 : 1;
  const flat = (dir === 'front' || dir === 'back');
  const walking = !!o.walk;
  const ph = (o.walk || 0) * 0.22;
  const seed = o.seed || 0;
  const bob = walking ? Math.abs(Math.sin(ph*2)) * 2.2 : Math.sin(T/40 + seed) * 0.8;
  const squash = o.squash === undefined ? 1 : o.squash;

  g.save();
  g.translate(x, y + (o.lift || 0));
  if (o.tilt) g.rotate(o.tilt);
  g.scale(facing * s, s * squash);

  if (o.shadow !== false){
    g.fillStyle = 'rgba(0,0,0,.25)';
    g.beginPath(); g.ellipse(0, 0, 19, 5, 0, 0, 7); g.fill();
  }

  const hipY = RIG.hip - bob, shoY = RIG.shoulder - bob, headY = RIG.head - bob;
  const thigh = RIG.knee - RIG.hip, shin = RIG.ankle - RIG.knee;
  const upper = 17, fore = 16;
  const boot = '#2d363e';

  /* ---- legs (back first) ---- */
  const swing = walking ? 0.52 : 0;
  const lgA = Math.sin(ph) * swing, lgB = Math.sin(ph + Math.PI) * swing;
  const bendA = walking ? Math.max(0, -Math.sin(ph)) * 0.55 : 0.10;
  const bendB = walking ? Math.max(0, -Math.sin(ph + Math.PI)) * 0.55 : 0.10;
  const legW = 10.5;
  const spread = flat ? 6 : 3;
  /* someone who turned up in shorts and sandals has bare shins */
  const shinCol = def.shorts ? def.skin : null;
  const footCol = def.shorts ? '#8a6a44' : boot;
  drawLeg(-spread, hipY, lgB, thigh, bendB, shin, legW, def.suit2, shinCol, footCol);

  /* ---- arm angles, from the named pose ---- */
  const A = armAngles(o, walking, ph, seed);
  const aB = o.armB     !== undefined ? o.armB     : A.aB + (flat ? -0.10 : 0);
  const bB = o.armBBend !== undefined ? o.armBBend : A.bB;
  const aF = o.armF     !== undefined ? o.armF     : A.aF + (flat ?  0.10 : 0);
  const bF = o.armFBend !== undefined ? o.armFBend : A.bF;

  /* ---- back arm ---- */
  limb(flat ? -11 : -5, shoY, aB, upper, bB, fore, 8.6, def.suit2, def.skin, 4.6, true);

  /* ---- front leg ---- */
  drawLeg(spread, hipY, lgA, thigh, bendA, shin, legW, def.suit, shinCol, footCol);

  /* ---- neck, drawn behind the torso so the collar covers its base ---- */
  g.fillStyle = def.skin;
  rr(-4.8, headY + 4, 9.6, (shoY + 4) - (headY + 4), 3.5); g.fill();
  g.fillStyle = 'rgba(0,0,0,.14)';
  rr(-4.8, headY + 4, 9.6, 5, 3); g.fill();

  /* ---- torso ---- */
  const tw = flat ? 32 : 28;
  g.fillStyle = def.suit;
  rr(-tw/2, shoY - 5, tw, (hipY - shoY) + 13, 10); g.fill();
  if (!flat){
    g.fillStyle = 'rgba(0,0,0,.13)';
    rr(tw/2 - 9, shoY - 5, 9, (hipY - shoY) + 13, 9); g.fill();
  }
  /* a loud holiday shirt, for the man who did not read the dress code */
  if (def.floral){
    g.save();
    g.beginPath(); rr(-tw/2, shoY - 5, tw, (hipY - shoY) + 13, 10); g.clip();
    for (let i=0;i<11;i++){
      const fx2 = -tw/2 + 3 + nz(i*3+1)*(tw-6);
      const fy2 = shoY + 2 + nz(i*5+2)*((hipY - shoY) + 6);
      g.fillStyle = i%3===0 ? def.accent : i%3===1 ? '#fff0b0' : 'rgba(255,255,255,.55)';
      for (let k=0;k<5;k++){
        const a = k/5*Math.PI*2 + i;
        g.beginPath(); g.ellipse(fx2+Math.cos(a)*2.4, fy2+Math.sin(a)*2.4, 1.8, 1.8, 0, 0, 7); g.fill();
      }
      g.fillStyle='rgba(255,220,90,.9)';
      g.beginPath(); g.arc(fx2, fy2, 1.5, 0, 7); g.fill();
    }
    g.restore();
  }
  // belt
  g.fillStyle = 'rgba(0,0,0,.2)'; rr(-tw/2, hipY - 2, tw, 6, 2); g.fill();
  // collar
  g.fillStyle = def.trim;
  g.beginPath();
  g.moveTo(-10, shoY-4); g.lineTo(0, shoY+9); g.lineTo(10, shoY-4);
  g.lineTo(10, shoY-8); g.lineTo(-10, shoY-8); g.closePath(); g.fill();
  // zip
  g.strokeStyle = 'rgba(0,0,0,.22)'; g.lineWidth = 1.5;
  g.beginPath(); g.moveTo(0, shoY+8); g.lineTo(0, hipY+2); g.stroke();
  // chest badge
  g.fillStyle = def.accent; rr(-9, shoY+13, 7.5, 5.5, 1.6); g.fill();
  if (def.tie){
    g.fillStyle = def.accent;
    g.beginPath(); g.moveTo(0,shoY+8); g.lineTo(-3.6,shoY+15);
    g.lineTo(0,shoY+30); g.lineTo(3.6,shoY+15); g.closePath(); g.fill();
  }
  if (def.coat || (o.ppe && o.ppe.coat)){
    g.fillStyle = 'rgba(248,251,253,.97)';
    const cb = hipY + 22;
    g.beginPath(); g.moveTo(-tw/2-2, shoY-4); g.lineTo(-tw/2-4, cb);
    g.lineTo(-6, cb); g.lineTo(-6, shoY-4); g.closePath(); g.fill();
    g.beginPath(); g.moveTo(tw/2+2, shoY-4); g.lineTo(tw/2+4, cb);
    g.lineTo(6, cb); g.lineTo(6, shoY-4); g.closePath(); g.fill();
    g.strokeStyle='rgba(158,178,192,.7)'; g.lineWidth=1.1;
    g.beginPath(); g.moveTo(-6,shoY-4); g.lineTo(-6,cb); g.moveTo(6,shoY-4); g.lineTo(6,cb); g.stroke();
    g.fillStyle='#b9c8d2'; g.beginPath(); g.arc(-8.5, shoY+26, 1.5, 0, 7); g.fill();
  }

  /* ---- front arm ---- */
  const fa = limb(flat ? 11 : 5, shoY, aF, upper, bF, fore, 8.6,
                  def.suit, def.skin, 4.6, true);
  if (o.holdDraw){ g.save(); g.translate(fa.fx, fa.fy); o.holdDraw(g); g.restore(); }

  /* ---- head ---- */
  g.save();
  g.translate(0, headY);
  g.rotate((o.headTilt || 0) + (o.talk ? Math.sin(T/5)*0.045 : 0));
  drawHead(def, o, dir);
  g.restore();

  g.restore();
}

/* ---------------- head, face, hair, PPE ---------------- */
function drawHead(def, o, dir){
  const face = o.face || 'neutral';
  const front = (dir === 'front');
  const back  = (dir === 'back');

  hairBack(def, o);

  // skull
  g.fillStyle = def.skin;
  g.beginPath(); g.ellipse(0, 0, 12.8, 13.8, 0, 0, 7); g.fill();
  if (!front && !back){
    g.fillStyle = def.skin;
    g.beginPath(); g.ellipse(-8.2, 2, 2.8, 3.6, 0, 0, 7); g.fill();
    g.fillStyle = 'rgba(0,0,0,.10)';
    g.beginPath(); g.ellipse(-8.2, 2, 1.4, 1.9, 0, 0, 7); g.fill();
  }

  if (back){ hairFront(def, o, true); return; }

  /* ---- eyes ---- */
  const exR = front ? 5.0 : 4.6, exL = front ? -5.0 : -1.6;
  const blink = (Math.floor((T + (o.seed||0)*53)/120) % 6 === 0) && ((T + (o.seed||0)*53) % 120 < 9);
  const asleep = face === 'sleep';
  const wide = face === 'shock' || face === 'panic';
  const shut = asleep || blink || face === 'dead';
  const eh = wide ? 4.6 : 3.2;
  const pr = wide ? 1.15 : 1.8;

  if (!shut){
    g.fillStyle = '#fff';
    g.beginPath(); g.ellipse(exL, -1.6, 2.9, eh, 0, 0, 7);
    g.ellipse(exR, -1.6, 2.9, eh, 0, 0, 7); g.fill();
    const look = o.look || 0;
    g.fillStyle = '#16232c';
    g.beginPath(); g.arc(exL+look, -1.2, pr, 0, 7); g.arc(exR+look, -1.2, pr, 0, 7); g.fill();
    g.fillStyle = 'rgba(255,255,255,.92)';
    g.beginPath(); g.arc(exL+look+.75, -2.2, .62, 0, 7); g.arc(exR+look+.75, -2.2, .62, 0, 7); g.fill();
  } else if (face === 'dead'){
    g.strokeStyle='#16232c'; g.lineWidth=1.8; g.lineCap='round';
    [exL,exR].forEach(e=>{ g.beginPath();
      g.moveTo(e-2.6,-3.6); g.lineTo(e+2.6,0.4);
      g.moveTo(e+2.6,-3.6); g.lineTo(e-2.6,0.4); g.stroke(); });
  } else {
    g.strokeStyle = '#16232c'; g.lineWidth = 1.6; g.lineCap='round';
    g.beginPath();
    g.moveTo(exL-2.6,-1.8); g.quadraticCurveTo(exL,0.9,exL+2.6,-1.8);
    g.moveTo(exR-2.6,-1.8); g.quadraticCurveTo(exR,0.9,exR+2.6,-1.8); g.stroke();
  }

  /* ---- brows ---- */
  if (!def.hideBrows){
    g.strokeStyle = def.hair; g.lineWidth = 1.9; g.lineCap = 'round';
    const by = wide ? -8.6 : face==='worry' ? -6.6 : -7.2;
    const tilt = (face==='worry'||face==='sweat'||face==='panic') ? -1.7
               : face==='angry' ? 2.1 : face==='happy' ? -0.7 : 0;
    g.beginPath();
    g.moveTo(exL-3.2, by - tilt); g.lineTo(exL+2.8, by + tilt*0.6);
    g.moveTo(exR-2.8, by + tilt*0.6); g.lineTo(exR+3.2, by - tilt);
    g.stroke();
  }

  /* ---- mouth ---- */
  const mx = front ? 0 : 1.6, my = 5.8;
  const open = o.talk ? (Math.sin(T/3.2)*.5+.5) : 0;
  g.fillStyle = '#8a3a46'; g.strokeStyle = '#8a3a46'; g.lineWidth = 1.7; g.lineCap='round';
  if (o.talk && open > .35){
    g.beginPath(); g.ellipse(mx, my, 2.7, 1.2 + open*2.0, 0, 0, 7); g.fill();
  } else if (face === 'happy' || face === 'proud'){
    g.beginPath(); g.arc(mx, my-1.4, 3.8, .25, Math.PI-.25); g.stroke();
  } else if (wide){
    g.beginPath(); g.ellipse(mx, my+.6, 2.3, 3.2, 0, 0, 7); g.fill();
  } else if (face === 'worry' || face === 'sweat' || face === 'shame'){
    g.beginPath(); g.arc(mx, my+3.6, 3.3, Math.PI+.32, -.32); g.stroke();
  } else if (face === 'sleep'){
    g.beginPath(); g.ellipse(mx, my+.8, 1.7, 2.1, 0, 0, 7); g.fill();
  } else if (face === 'dead'){
    g.beginPath(); g.moveTo(mx-3, my+.5); g.lineTo(mx+3, my+.5); g.stroke();
  } else if (face === 'angry'){
    g.beginPath(); g.arc(mx, my+3.2, 3.0, Math.PI+.4, -.4); g.stroke();
  } else {
    g.beginPath(); g.moveTo(mx-2.7, my); g.lineTo(mx+2.7, my); g.stroke();
  }

  if (def.moustache){
    g.fillStyle = def.hair;
    g.beginPath(); g.ellipse(mx, my-2.6, 4.6, 1.6, 0, 0, 7); g.fill();
  }
  if (def.beard){
    g.save();
    g.fillStyle = def.hair;
    g.beginPath(); g.ellipse(mx*0.6, 9.2, 8.0, 6.8, 0, 0, Math.PI); g.fill();
    g.beginPath(); g.ellipse(mx*0.6, 6.0, 7.4, 5.2, 0, 0, 7); g.fill();
    g.fillStyle = def.skin;
    g.beginPath(); g.ellipse(mx, 3.6, 5.0, 3.4, 0, 0, 7); g.fill();
    g.restore();
    // redraw the mouth over the beard
    g.strokeStyle = '#8a3a46'; g.lineWidth = 1.7;
    g.beginPath(); g.moveTo(mx-2.6, my); g.lineTo(mx+2.6, my); g.stroke();
  }

  if (face === 'panic' || face === 'shame' || face === 'sweat'){
    g.fillStyle = 'rgba(232,90,90,.32)';
    g.beginPath(); g.ellipse(exL-1.4, 3.0, 3.4, 2.1, 0, 0, 7);
    g.ellipse(exR+1.4, 3.0, 3.4, 2.1, 0, 0, 7); g.fill();
  }

  hairFront(def, o, false);

  /* ---- glasses ---- */
  if (def.glasses){
    const lr = front ? 4.0 : 3.7;
    g.strokeStyle = '#2a2a33'; g.lineWidth = 1.5;
    g.fillStyle = 'rgba(205,238,255,.22)';
    [exL, exR].forEach(e=>{ g.beginPath(); g.arc(e, -1.4, lr, 0, 7); g.fill(); g.stroke(); });
    g.beginPath(); g.moveTo(exL+lr, -1.6); g.lineTo(exR-lr, -1.6); g.stroke();
    g.beginPath(); g.moveTo(exR+lr, -1.8); g.lineTo(exR+lr+3.4, -2.6); g.stroke();
  }

  /* sunglasses parked on the forehead, never actually used */
  if (def.shades && !(o.ppe && o.ppe.hat)){
    g.fillStyle = '#1b2026';
    rr(-11.8, -11.6, 23.6, 6.2, 2.6); g.fill();
    g.fillStyle = 'rgba(120,200,235,.45)';
    rr(-10.6, -10.8, 9.6, 4.6, 2); g.fill();
    rr(1.0,   -10.8, 9.6, 4.6, 2); g.fill();
    g.strokeStyle = '#1b2026'; g.lineWidth = 1.8;
    g.beginPath(); g.moveTo(-11.8,-8.6); g.lineTo(-14.4,-7.6);
    g.moveTo(11.8,-8.6); g.lineTo(14.4,-7.6); g.stroke();
  }

  /* ---- PPE ---- */
  if (o.ppe && o.ppe.goggles){
    g.strokeStyle = '#3d4d5a'; g.lineWidth = 2.4;
    g.beginPath(); g.moveTo(-11.5,-1.8); g.lineTo(-14.6,-1.0);
    g.moveTo(11.5,-1.8); g.lineTo(14.6,-1.0); g.stroke();
    g.fillStyle = 'rgba(150,228,255,.42)';
    rr(-11.6, -5.6, 23.2, 8.0, 3.4); g.fill();
    g.strokeStyle = '#2a3a46'; g.lineWidth = 1.9; rr(-11.6, -5.6, 23.2, 8.0, 3.4); g.stroke();
    g.strokeStyle = 'rgba(40,58,70,.7)'; g.lineWidth = 1.4;
    g.beginPath(); g.moveTo(0,-5.6); g.lineTo(0,2.4); g.stroke();
    g.fillStyle='rgba(255,255,255,.5)';
    g.beginPath(); g.moveTo(-8.4,-4.8); g.lineTo(-4.4,-4.8); g.lineTo(-7.6,1.4); g.lineTo(-11.2,1.4);
    g.closePath(); g.fill();
  }
  if (o.ppe && o.ppe.hat){
    g.fillStyle = '#f5c22b';
    g.beginPath(); g.ellipse(0,-10.2, 13.0, 9.0, 0, Math.PI, 0); g.fill();
    g.fillStyle = '#ffd95e';
    g.beginPath(); g.ellipse(0,-10.6, 3.2, 8.4, 0, Math.PI, 0); g.fill();
    g.fillStyle = '#e0a814'; rr(-16.4, -11.0, 32.8, 3.6, 1.8); g.fill();
    g.fillStyle = '#c99310'; rr(2, -11.0, 15, 3.6, 1.8); g.fill();
    g.fillStyle='rgba(255,255,255,.32)';
    g.beginPath(); g.ellipse(-5,-13.6, 4.0, 2.0, -.35, 0, 7); g.fill();
  }

  /* ---- sweat ---- */
  if (o.sweat){
    for (let i=0;i<o.sweat;i++){
      const pp = ((T*1.7 + i*41) % 74);
      g.save();
      g.translate((i%2 ? 1 : -1) * (11 + (i%3)*2.6), -7 + pp*0.44);
      g.rotate(.18);
      g.fillStyle = 'rgba(130,212,255,.92)';
      g.beginPath(); g.moveTo(0,-3.4); g.quadraticCurveTo(2.5,1.3,0,2.8);
      g.quadraticCurveTo(-2.5,1.3,0,-3.4); g.fill();
      g.fillStyle='rgba(255,255,255,.6)';
      g.beginPath(); g.arc(-0.7,0.6,0.7,0,7); g.fill();
      g.restore();
    }
  }
}

/* hair drawn BEHIND the face */
function hairBack(def, o){
  const st = def.hairStyle;
  g.fillStyle = def.hair;
  if (st === 'hijab'){
    g.fillStyle = def.suit2;
    g.beginPath(); g.ellipse(0, -0.6, 15.8, 16.6, 0, 0, 7); g.fill();
    g.fillStyle = def.suit;
    g.beginPath(); g.moveTo(-15.2,-2); g.quadraticCurveTo(-18,16,-9,23);
    g.lineTo(-1,20.5); g.quadraticCurveTo(-11.5,13,-10.5,-1); g.closePath(); g.fill();
    return;
  }
  if (st === 'ponytail'){
    const sw = Math.sin(T/17)*.14 + (o.walk ? Math.sin(o.walk*0.22)*.2 : 0);
    g.save(); g.translate(-11.5,-5); g.rotate(sw);
    g.beginPath(); g.moveTo(0,0);
    g.quadraticCurveTo(-12,5,-9.5,19); g.quadraticCurveTo(-3,10,0,3.5); g.closePath(); g.fill();
    g.restore();
    return;
  }
  if (st === 'bun'){ g.beginPath(); g.arc(-11.4,-11.8, 5.8, 0, 7); g.fill();
    g.fillStyle='rgba(255,255,255,.12)'; g.beginPath(); g.arc(-13,-13.4, 2.1, 0, 7); g.fill(); return; }
  if (st === 'wavy'){
    for (let i=0;i<3;i++){
      g.beginPath(); g.ellipse(-12 + i*0.4, 1 + i*5.6, 5.4 - i*.5, 4.8, .3, 0, 7); g.fill();
      g.beginPath(); g.ellipse( 12 - i*0.4, 1 + i*5.6, 4.8 - i*.5, 4.4, -.3, 0, 7); g.fill();
    }
    return;
  }
  if (st === 'profhair'){
    g.beginPath(); g.ellipse(-11.8,-2.4, 4.6, 6.4, .25, 0, 7);
    g.ellipse( 11.8,-2.4, 4.6, 6.4, -.25, 0, 7); g.fill();
    return;
  }
}

/* hair drawn IN FRONT of the face */
function hairFront(def, o, isBack){
  const st = def.hairStyle;
  g.fillStyle = def.hair;
  if (st === 'bald'){
    /* thin horseshoe low on the sides, shiny crown left bare */
    g.lineWidth = 3.0; g.strokeStyle = def.hair; g.lineCap = 'round';
    g.beginPath(); g.ellipse(0, 0.4, 12.0, 12.4, 0, 0.55, Math.PI-0.55); g.stroke();
    g.fillStyle = 'rgba(255,255,255,.20)';
    g.beginPath(); g.ellipse(-4.4, -8.2, 3.4, 1.8, -0.36, 0, 7); g.fill();
    return;
  }
  if (st === 'hijab'){
    // only the front edge of the scarf, so the face stays clear
    g.save();
    g.beginPath(); g.ellipse(0,-0.6, 15.8, 16.6, 0, 0, 7);
    g.ellipse(0, 1.6, 10.8, 12.0, 0, 0, 7, true);
    g.fill('evenodd');
    g.restore();
    g.strokeStyle='rgba(0,0,0,.13)'; g.lineWidth=1.1;
    g.beginPath(); g.ellipse(0, 1.6, 10.8, 12.0, 0, 0, 7); g.stroke();
    return;
  }
  if (st === 'cap'){
    g.beginPath(); g.ellipse(0,-2.8, 13.0, 9.8, 0, Math.PI, 0); g.fill();
    g.fillStyle = def.accent;
    g.beginPath(); g.ellipse(0,-9.4, 13.0, 7.6, 0, Math.PI, 0); g.fill();
    g.fillStyle = def.accent; rr(3, -11.2, 16, 3.6, 1.8); g.fill();
    return;
  }
  if (st === 'ponytail'){
    g.beginPath(); g.ellipse(0,-3.6, 13.4, 11.8, 0, Math.PI+.12, -.12); g.fill();
    g.beginPath(); g.moveTo(-13.4,-5.6); g.quadraticCurveTo(-3,-15.6, 13.4,-6.6);
    g.lineTo(13.4,-9.4); g.quadraticCurveTo(0,-19,-13.4,-9); g.closePath(); g.fill();
    g.beginPath(); g.ellipse(-9.6,-1.8, 4.2, 7.6, .18, 0, 7); g.fill();
    g.fillStyle = def.accent; g.beginPath(); g.arc(-11.0,-4.2, 2.4, 0, 7); g.fill();
    return;
  }
  if (st === 'bun'){
    g.beginPath(); g.ellipse(0,-3.8, 13.2, 11.4, 0, Math.PI+.16, -.16); g.fill();
    g.beginPath(); g.moveTo(-13.2,-6); g.quadraticCurveTo(0,-16,13.2,-6.6);
    g.lineTo(13.2,-9.6); g.quadraticCurveTo(0,-18.4,-13.2,-9.2); g.closePath(); g.fill();
    return;
  }
  if (st === 'wavy'){
    g.beginPath(); g.ellipse(0,-4.0, 13.8, 12.0, 0, Math.PI+.08, -.08); g.fill();
    g.beginPath(); g.moveTo(-13.8,-5.4); g.quadraticCurveTo(-4,-17,6,-9);
    g.quadraticCurveTo(10,-14,13.8,-7.4); g.lineTo(13.8,-10.6);
    g.quadraticCurveTo(0,-19.6,-13.8,-9.4); g.closePath(); g.fill();
    return;
  }
  if (st === 'spiky'){
    g.beginPath(); g.ellipse(0,-3.4, 13.0, 10.8, 0, Math.PI+.18, -.18); g.fill();
    g.beginPath();
    for (let i=0;i<6;i++){
      const x0 = -11.4 + i*4.6;
      g.moveTo(x0, -8.4); g.lineTo(x0+2.3, -16.4 - (i%2)*3.2); g.lineTo(x0+4.8, -8.4);
    }
    g.fill();
    return;
  }
  if (st === 'profhair'){
    g.beginPath(); g.ellipse(0,-6.4, 12.0, 7.6, 0, Math.PI+.2, -.2); g.fill();
    return;
  }
  /* neat */
  g.beginPath(); g.ellipse(0,-3.6, 13.2, 11.2, 0, Math.PI+.16, -.16); g.fill();
  g.beginPath(); g.moveTo(-13.2,-5.8); g.quadraticCurveTo(-2,-15.4, 13.2,-7.0);
  g.lineTo(13.2,-10.2); g.quadraticCurveTo(0,-18.6,-13.2,-9.4); g.closePath(); g.fill();
}

/* ---------------- speech bubbles ---------------- */
/* typewriter bubble anchored above a person */
function bubble(text, x, y, opt={}){
  const maxw = opt.w || 300;
  g.font = `${opt.weight||400} ${opt.size||18}px "Trebuchet MS",Verdana,sans-serif`;
  // measure wrapped lines
  const words = String(text).split(' ');
  const lines = []; let line = '';
  for (const wd of words){
    const test = line + wd + ' ';
    if (g.measureText(test).width > maxw && line){ lines.push(line.trim()); line = wd + ' '; }
    else line = test;
  }
  lines.push(line.trim());
  const lh = (opt.size||18) * 1.34;
  const bw = Math.min(maxw, Math.max(...lines.map(l=>g.measureText(l).width))) + 34;
  const bh = lines.length * lh + 26;
  const bx = clamp(x - bw/2, 12, W - bw - 12);
  const by = y - bh - 16;

  const pop = opt.pop === undefined ? 1 : clamp(opt.pop,0,1);
  g.save();
  g.translate(bx + bw/2, by + bh);
  g.scale(lerp(.7,1,bounce(pop)), lerp(.5,1,bounce(pop)));
  g.translate(-(bx + bw/2), -(by + bh));

  g.save(); g.shadowColor='rgba(0,0,0,.4)'; g.shadowBlur=14; g.shadowOffsetY=5;
  g.fillStyle = opt.fill || 'rgba(250,252,254,.97)';
  rr(bx, by, bw, bh, 14); g.fill();
  // tail
  g.beginPath();
  g.moveTo(clamp(x,bx+22,bx+bw-22) - 9, by + bh - 1);
  g.lineTo(clamp(x,bx+22,bx+bw-22) + 9, by + bh - 1);
  g.lineTo(clamp(x,bx+20,bx+bw-20),     by + bh + 15);
  g.closePath(); g.fill();
  g.restore();
  g.strokeStyle = opt.stroke || 'rgba(35,166,224,.85)'; g.lineWidth = 2.4;
  rr(bx, by, bw, bh, 14); g.stroke();

  // typewriter reveal
  const shown = opt.reveal === undefined ? 1e9 : Math.floor(opt.reveal);
  let count = 0;
  g.fillStyle = opt.col || '#10222e'; g.textAlign='left'; g.textBaseline='middle';
  g.font = `${opt.weight||400} ${opt.size||18}px "Trebuchet MS",Verdana,sans-serif`;
  for (let i=0;i<lines.length;i++){
    let l = lines[i];
    if (count + l.length > shown) l = l.slice(0, Math.max(0, shown - count));
    g.fillText(l, bx+17, by+17+lh*i+lh/2);
    count += lines[i].length + 1;
    if (count > shown) break;
  }
  g.restore();
  return { done: shown >= lines.join(' ').length, bx, by, bw, bh };
}

/* thought bubble (the coffee hint) */
function thought(text, x, y, opt={}){
  const r = bubble(text, x, y-18, Object.assign({fill:'rgba(252,250,235,.97)', stroke:'rgba(245,181,61,.9)'}, opt));
  g.fillStyle='rgba(252,250,235,.97)'; g.strokeStyle='rgba(245,181,61,.9)'; g.lineWidth=2;
  for (let i=0;i<3;i++){
    const rr2 = 7 - i*2, yy = r.by + r.bh + 4 + i*11;
    g.beginPath(); g.arc(x - i*5, yy, rr2, 0, 7); g.fill(); g.stroke();
  }
  return r;
}
