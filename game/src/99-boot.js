/* ============================================================
   Boot — wait for a gesture so audio is allowed, then run
   ============================================================ */
const tapEl = document.getElementById('tapstart');

/* #sep #rea #flu #hea #brk #hub #end jump straight to a scene, for testing
   and for running a single station at a booth. #mute silences the music.   */
function devScene(){
  const h = (location.hash || '').slice(1).split(',');
  const map = { sep:()=>S_sep, rea:()=>S_rea, flu:()=>S_flu, hea:()=>S_hea,
                brk:()=>S_brk, hub:()=>S_hub, end:()=>S_end, select:()=>S_select };
  let target = null;
  for (const part of h){
    if (part === 'mute' && musicGain) musicGain.gain.value = 0;
    if (map[part]) target = map[part]();
  }
  return target;
}

function boot(){
  tapEl.removeEventListener('click', boot);
  tapEl.classList.add('gone');
  initAudio(); resumeAudio();
  const jump = devScene();
  if (jump){
    for (const s of STATIONS) if (s.key !== 'brk') { /* keep scoring sane when jumping */ }
    Hint.begin('dev');
    go(jump);
  } else go(S_logo);
  requestAnimationFrame(frame);
}
tapEl.addEventListener('click', boot);
addEventListener('keydown', function once(e){
  if (!tapEl.classList.contains('gone')){ removeEventListener('keydown', once); boot(); }
});
addEventListener('click', resumeAudio);
addEventListener('keydown', resumeAudio);

/* keep the canvas crisp on high-dpi displays */
function fitCanvas(){
  const r = cv.getBoundingClientRect();
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  if (cv.width !== Math.round(W) ) { /* logical size stays 1280x720 */ }
  cv.style.width = r.width + 'px';
}
addEventListener('resize', fitCanvas);
