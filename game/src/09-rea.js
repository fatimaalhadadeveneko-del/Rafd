/* TEMPORARY STUB — replaced by the real stage */
const S_rea = { draw(){ g.fillStyle='#08202c'; g.fillRect(0,0,W,H);
  txt('S_rea stub', W/2, H/2, 40, '#f5b53d');
  if (button('finish', W/2-80, H/2+60, 160, 44)){ award('rea',1,1); G.done['rea']=true; go(S_hub); } } };
