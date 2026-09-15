/* TEMPORARY STUB — replaced by the real stage */
const S_hea = { draw(){ g.fillStyle='#08202c'; g.fillRect(0,0,W,H);
  txt('S_hea stub', W/2, H/2, 40, '#f5b53d');
  if (button('finish', W/2-80, H/2+60, 160, 44)){ award('hea',1,1); G.done['hea']=true; go(S_hub); } } };
