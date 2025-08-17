// v4.8 — Hairband arc, no ghost, portrait UI, no preview tab
const COLORS=[
  {name:'Chocolate Mocha',val:'#7A5037'},
  {name:'Deep Black',val:'#0D0D0D'},
  {name:'Scarlet Red',val:'#C1121F'},
  {name:'Cream Yellow',val:'#F5E6A1'},
  {name:'Orange (Default)',val:'#FF7A00', preset:true},
  {name:'Pink',val:'#FF8ABF'},
  {name:'Champagne Beige',val:'#E6D5B8'},
  {name:'Moss Green',val:'#6B8E23'},
  {name:'Burgundy',val:'#800020'},
  {name:'Pure White',val:'#FFFFFF'}
];
const STYLES=['月兔','Clean Fit','斜紋','賽車','運動','山形','芭蕾少女','Y2K'];

let curColor=COLORS[4].val, curStyle=STYLES[0];
let txt='Happy Mid-Autumn Festival', txtSize=30, txtWeight=700, txtRepeat=1, txtGap=22;
let shine=0.65, shadow=0.5;
let showBunnyNose=true, bubblesOn=true;

const video = document.getElementById('video');
const overlay = document.getElementById('overlay');
const ctx = overlay.getContext('2d');
const tapmask = document.getElementById('tapmask');
const err = document.getElementById('err');
const shareRow = document.getElementById('shareRow');

// Tabs
document.querySelectorAll('.tab').forEach(t=>t.onclick=()=>{
  document.querySelectorAll('.tab').forEach(x=>x.classList.remove('active'));
  document.querySelectorAll('.panel').forEach(p=>p.classList.remove('show'));
  t.classList.add('active');
  document.getElementById(t.dataset.panel).classList.add('show');
});

// Colors
const sw = document.getElementById('swatches');
COLORS.forEach(c=>{
  const d=document.createElement('div'); d.className='swatch'; d.style.background=c.val; d.title=c.name;
  if(c.preset){ d.style.outline='2px solid var(--accent)'; }
  d.onclick=()=>{ curColor=c.val; document.querySelectorAll('.swatch').forEach(x=>x.style.outline='none'); d.style.outline='2px solid var(--accent)'; makeBandTexture(); };
  sw.appendChild(d);
});
// Styles
const sg=document.getElementById('styleGrid');
STYLES.forEach((name,i)=>{
  const card=document.createElement('div'); card.className='style-card'+(i===0?' active':''); 
  const thumb=document.createElement('canvas'); thumb.className='style-thumb'; thumb.width=280; thumb.height=100;
  drawStyleThumb(thumb.getContext('2d'), name, curColor, shine);
  const label=document.createElement('div'); label.textContent=name;
  card.appendChild(thumb); card.appendChild(label);
  card.onclick=()=>{ document.querySelectorAll('.style-card').forEach(x=>x.classList.remove('active')); card.classList.add('active'); curStyle=name; makeBandTexture(); };
  sg.appendChild(card);
});

['txt','txtSize','txtWeight','txtRepeat','txtGap','shine','shadow','bunnyNose','bubblesToggle'].forEach(id=>{
  const el=document.getElementById(id);
  if(!el) return;
  el.oninput = e=>{
    if(id==='txt') txt=e.target.value;
    if(id==='txtSize') txtSize=+e.target.value;
    if(id==='txtWeight') txtWeight=+e.target.value;
    if(id==='txtRepeat') txtRepeat=+e.target.value;
    if(id==='txtGap') txtGap=+e.target.value;
    if(id==='shine') shine=+e.target.value;
    if(id==='shadow') shadow=+e.target.value;
    if(id==='bunnyNose') showBunnyNose=el.checked;
    if(id==='bubblesToggle') bubblesOn=el.checked;
    makeBandTexture();
  };
});

// Offscreen band texture
const band2d=document.createElement('canvas'); band2d.width=1200; band2d.height=160; const bctx=band2d.getContext('2d');
function roundedRect(g,x,y,w,h,r){g.beginPath();g.moveTo(x+r,y);g.arcTo(x+w,y,x+w,y+h,r);g.arcTo(x+w,y+h,x,y+h,r);g.arcTo(x,y+h,x,y,r);g.arcTo(x,y,x+w,y,r);g.closePath();}
function drawTexture(g,w,h,color){
  g.save();
  g.fillStyle='#fff'; g.fillRect(0,0,w,h);
  g.globalAlpha=.1; g.fillStyle=color;
  for(let x=-w;x<w*2;x+=16){ g.beginPath(); g.moveTo(x,0); g.lineTo(x+28,0); g.lineTo(x,h); g.lineTo(x-28,h); g.closePath(); g.fill(); }
  g.globalAlpha=.09; for(let i=0;i<Math.floor(w*h/1700);i++){ g.fillRect(Math.random()*w,Math.random()*h,1,1); }
  g.restore();
}
function drawGloss(g,w,h,intensity){
  const lg=g.createLinearGradient(0,0,0,h);
  lg.addColorStop(0,`rgba(255,255,255,${0.35*intensity})`);
  lg.addColorStop(0.45,`rgba(255,255,255,${0.06*intensity})`);
  lg.addColorStop(0.55,`rgba(0,0,0,${0.10*intensity})`);
  lg.addColorStop(1,`rgba(0,0,0,${0.25*intensity})`);
  g.fillStyle=lg; g.fillRect(0,0,w,h);
}
function drawPattern(g,w,h,style,color){
  g.save(); g.fillStyle=color; g.strokeStyle=color;
  switch(style){
    case '月兔':
      g.globalAlpha=.9; g.beginPath(); g.arc(h*.9,h*.5,h*.36,0,Math.PI*2); g.fill();
      g.globalAlpha=.55; g.beginPath(); g.arc(h*1.28,h*.45,h*.22,0,Math.PI*2); g.fill(); g.globalAlpha=1; break;
    case 'Clean Fit':
      g.fillRect(0,h*.38,w,h*.24); break;
    case '斜紋':
      for(let x=-w;x<w*2;x+=24){ g.globalAlpha=(x/24%2===0)?.35:.15;
        g.beginPath(); g.moveTo(x,0); g.lineTo(x+40,0); g.lineTo(x,h); g.lineTo(x-40,h); g.closePath(); g.fill(); } g.globalAlpha=1; break;
    case '賽車':
      g.lineWidth=6; g.beginPath(); g.moveTo(w*.3,h*.2); g.lineTo(w*.5,h*.8); g.lineTo(w*.7,h*.2); g.stroke(); break;
    case '運動':
      g.fillRect(0,h*.25,w,4); g.fillRect(0,h*.75-4,w,4); break;
    case '山形':
      g.beginPath(); for(let x=0;x<=w;x+=28){ g.moveTo(x,h*.75); g.lineTo(x+14,h*.3); g.lineTo(x+28,h*.75);} g.closePath(); g.fill(); break;
    case '芭蕾少女':
      g.globalAlpha=.9; for(let x=32;x<w;x+=92){ g.beginPath(); g.ellipse(x-14,h*.5,10,16,0,0,Math.PI*2); g.ellipse(x+14,h*.5,10,16,0,0,Math.PI*2); g.fill(); g.fillRect(x-6,h*.5-6,12,12);} g.globalAlpha=1; break;
    case 'Y2K':
      for(let x=20;x<w;x+=70){ g.globalAlpha=.9; g.beginPath(); g.arc(x,h*.5,10,0,Math.PI*2); g.fill(); g.globalAlpha=.25; g.beginPath(); g.arc(x,h*.5,24,0,Math.PI*2); g.fill(); } g.globalAlpha=1; break;
  }
  g.restore();
}
function drawBandText(g,w,h){
  g.save();
  g.fillStyle='#111'; g.font=`${txtWeight} ${txtSize}px "Inter","Noto Sans TC",system-ui,sans-serif`;
  const tw=g.measureText(txt).width; const total=tw*txtRepeat + txtGap*(txtRepeat-1);
  let x=(w-total)/2; const y=h*.7;
  for(let i=0;i<txtRepeat;i++){ g.fillText(txt,x,y); x+=tw+txtGap; }
  g.restore();
}
function makeBandTexture(){
  const w=band2d.width,h=band2d.height;
  bctx.clearRect(0,0,w,h);
  roundedRect(bctx,0,0,w,h,28); bctx.clip(); // more rounded like hairband
  drawTexture(bctx,w,h,curColor);
  drawPattern(bctx,w,h,curStyle,curColor);
  drawGloss(bctx,w,h,shine);
  // stitches light
  bctx.save(); bctx.strokeStyle='rgba(0,0,0,.12)'; bctx.setLineDash([6,6]); bctx.lineWidth=1.1; bctx.strokeRect(8,8,w-16,h-16); bctx.restore();
  drawBandText(bctx,w,h);
  // edge vignette
  const vg=bctx.createLinearGradient(0,0,w,0);
  vg.addColorStop(0,'rgba(0,0,0,.18)'); vg.addColorStop(0.5,'rgba(0,0,0,0)'); vg.addColorStop(1,'rgba(0,0,0,.18)');
  bctx.fillStyle=vg; bctx.fillRect(0,0,w,h);
  document.querySelectorAll('.style-thumb').forEach((c,i)=>{
    const g=c.getContext('2d'); drawStyleThumb(g, STYLES[i], curColor, shine);
  });
}
makeBandTexture();
function drawStyleThumb(g, style, color, shineAmt){
  const w=g.canvas.width, h=g.canvas.height;
  g.clearRect(0,0,w,h); roundedRect(g,0,0,w,h,10); g.clip(); g.fillStyle='#fff'; g.fillRect(0,0,w,h);
  drawTexture(g,w,h,color); drawPattern(g,w,h,style,color); drawGloss(g,w,h,shineAmt);
}

// Camera + FaceMesh
document.getElementById('btnStart').onclick=startCamera;
window.addEventListener('load',()=>{ setTimeout(startCamera, 200); });

let fm, animId;
async function startCamera(){
  err.textContent='';
  try{
    video.setAttribute('playsinline','true'); video.muted=true;
    const stream = await navigator.mediaDevices.getUserMedia({ video:{ facingMode:'user', width:{ideal:1080}, height:{ideal:1920} }, audio:false });
    video.srcObject = stream; await video.play();
    overlay.width = video.videoWidth || overlay.clientWidth;
    overlay.height = video.videoHeight || overlay.clientHeight;
    tapmask.classList.add('hidden');
    bootFaceMesh();
  }catch(e){
    err.textContent='相機開啟失敗：'+(e.message||e);
    tapmask.classList.remove('hidden');
  }
}
function bootFaceMesh(){
  fm = new FaceMesh({locateFile:(file)=>`https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh@0.4.1633559619/${file}`});
  fm.setOptions({maxNumFaces:1,refineLandmarks:true,minDetectionConfidence:0.5,minTrackingConfidence:0.5});
  fm.onResults(onResults);
  loop();
}
async function loop(){ if(!video.srcObject) return; try{ await fm.send({image: video}); }catch(e){} animId = requestAnimationFrame(loop); }

// Bubble FX
const bubbles=[];
function spawnBunny(){ bubbles.push({x: overlay.width*0.5 + (Math.random()*160-80), y: overlay.height-30, a:1, vy: 0.9+Math.random()*0.7}); }
function drawBubbles(){ if(!bubblesOn) return; ctx.save(); ctx.font='28px serif'; for(let i=bubbles.length-1;i>=0;i--){const b=bubbles[i]; ctx.globalAlpha=b.a; ctx.fillText('🐰', b.x, b.y); b.y -= b.vy; b.a -= 0.004; if(b.a<=0) bubbles.splice(i,1);} ctx.restore(); ctx.globalAlpha=1; }
function mouthOpen(lm){ const top=lm[13], bottom=lm[14], left=lm[33], right=lm[263]; const mouth=Math.hypot(top.x-bottom.x, top.y-bottom.y); const faceW=Math.hypot(left.x-right.x, left.y-right.y); return (mouth/faceW) > 0.08; }

// Forehead occlusion path (upper face oval)
function drawForeheadClip(lm, W, H){
  const idx=[338,297,332,284,251,389,356,454,323,361,288,397,365,379];
  ctx.beginPath();
  idx.forEach((id,i)=>{ const p=lm[id]; const x=p.x*W, y=p.y*H; if(i===0) ctx.moveTo(x,y); else ctx.lineTo(x,y); });
  ctx.lineTo(W,0); ctx.lineTo(0,0); ctx.closePath();
}

// Hairband drawing (arc shape, extend beyond head)
function drawHairband(cx, cy, angle, faceW){
  const width = faceW * 2.0;  // extend beyond head sides
  const height = Math.max(26, faceW * 0.22);
  const slices = 28;
  for(let i=0;i<slices;i++){
    const t0=i/slices, t1=(i+1)/slices;
    const sx=t0*band2d.width, sw=(t1-t0)*band2d.width;
    const k = (i - slices/2) / (slices/2);
    // strong arc like hairband: top bulge & ends thin
    const localH = height * (1 - 0.55*Math.pow(k,2));
    const lift = Math.sin(k*Math.PI/2) * height*0.35; // push up center
    ctx.save();
    ctx.translate(cx, cy - height*0.6 + lift);
    ctx.rotate(angle);
    ctx.drawImage(band2d, sx, 0, sw, band2d.height, -width/2 + t0*width, -localH/2, (t1-t0)*width, localH);
    ctx.restore();
  }
  // underline shadow
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(angle);
  ctx.globalAlpha = 0.25*shadow;
  const grad = ctx.createLinearGradient(0, -height/2, 0, height/2);
  grad.addColorStop(0,'rgba(0,0,0,0.28)'); grad.addColorStop(1,'rgba(0,0,0,0)');
  ctx.fillStyle=grad;
  ctx.fillRect(-faceW, -height/2, faceW*2, height);
  ctx.restore();
}

// Bunny nose
function drawBunnyNose(lm, W, H, angle){
  const nose = lm[1]; const x = nose.x*W, y = nose.y*H;
  const left = lm[33], right = lm[263];
  const faceW = Math.hypot((right.x-left.x)*W,(right.y-left.y)*H);
  const r = Math.max(6, faceW*0.035);
  ctx.save(); ctx.translate(x,y); ctx.rotate(angle);
  ctx.fillStyle = '#ffb6c1'; ctx.beginPath(); ctx.arc(0,0,r,0,Math.PI*2); ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,.6)'; ctx.beginPath(); ctx.arc(-r*0.35,-r*0.25,r*0.35,0,Math.PI*2); ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,.9)'; ctx.lineWidth = Math.max(1.5, r*0.12);
  const wy = r*0.35, L = r*2.2;
  for(let i=-1;i<=1;i++){ const off=i*wy;
    ctx.beginPath(); ctx.moveTo(-r*0.8, off); ctx.lineTo(-r*0.8-L, off- i*r*0.3); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(r*0.8, off); ctx.lineTo(r*0.8+L, off- i*r*0.3); ctx.stroke();
  }
  ctx.restore();
}

function onResults(res){
  ctx.clearRect(0,0,overlay.width,overlay.height);
  const W=overlay.width, H=overlay.height;
  if(!res.multiFaceLandmarks || !res.multiFaceLandmarks.length){ drawBubbles(); return; }
  const lm=res.multiFaceLandmarks[0];

  // Face geometry
  const p33=lm[33], p263=lm[263], p10=lm[10];
  const x33=p33.x*W, y33=p33.y*H, x263=p263.x*W, y263=p263.y*H, x10=p10.x*W, y10=p10.y*H;
  const cx=(x33+x263)/2, faceW=Math.hypot(x263-x33,y263-y33), angle=Math.atan2(y263-y33,x263-x33);
  const cy = y10 - faceW*0.38; // place higher like hairband

  // Draw hairband first
  drawHairband(cx, cy, angle, faceW);

  // Forehead occlusion (clip top so it looks tucked in)
  ctx.save();
  drawForeheadClip(lm, W, H);
  ctx.clip();
  // subtle fade on top edge
  ctx.translate(cx, cy - faceW*0.18);
  ctx.rotate(angle);
  const fade = ctx.createLinearGradient(0,-faceW*0.2,0,faceW*0.2);
  fade.addColorStop(0,'rgba(0,0,0,.25)'); fade.addColorStop(0.4,'rgba(0,0,0,0)');
  ctx.fillStyle=fade; ctx.fillRect(-faceW, -faceW*0.2, faceW*2, faceW*0.35);
  ctx.restore();

  // Bunny nose
  if(showBunnyNose) drawBunnyNose(lm, W, H, angle);

  if(mouthOpen(lm) && Math.random()<0.3){ spawnBunny(); }
  drawBubbles();
}

// Capture & Share (1080x1920)
document.getElementById('btnShot').onclick=()=>{
  const snap=document.createElement('canvas'); snap.width=1080; snap.height=1920;
  const sctx=snap.getContext('2d');
  // compute cover crop from video
  const vW=video.videoWidth, vH=video.videoHeight; const v=vW/vH, c=snap.width/snap.height;
  let sx, sy, sw, sh;
  if(v>c){ sh=vH; sw=sh*c; sx=(vW-sw)/2; sy=0; } else { sw=vW; sh=sw/c; sx=0; sy=(vH-sh)/2; }
  // base frame (beauty filter already via CSS on <video> only)
  sctx.drawImage(video, sx, sy, sw, sh, 0, 0, snap.width, snap.height);
  // draw overlay scaled
  sctx.drawImage(overlay, 0, 0, overlay.width, overlay.height, 0, 0, snap.width, snap.height);
  snap.toBlob(async (blob)=>{
    shareRow.classList.add('show');
    document.getElementById('btnSave').onclick=()=>{ const a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download='headband-ar.png'; a.click(); URL.revokeObjectURL(a.href); };
    document.getElementById('btnShare').onclick=async()=>{
      const file=new File([blob],'headband-ar.png',{type:'image/png'});
      if(navigator.canShare && navigator.canShare({files:[file]})){
        try{ await navigator.share({files:[file], title:'Weave Headband AR', text:'我的運動頭帶設計'});}catch(e){}
      }else{
        const a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download='headband-ar.png'; a.click(); URL.revokeObjectURL(a.href);
        alert('此裝置不支援分享，已改為下載。');
      }
    };
  },'image/png');
};
