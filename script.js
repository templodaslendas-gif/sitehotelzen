
const menu=document.querySelector('.menu');
const header=document.querySelector('.nav');
const progress=document.querySelector('.scroll-progress span');

menu?.addEventListener('click',()=>{
  const open=header.classList.toggle('open');
  menu.setAttribute('aria-expanded',String(open));
});
document.querySelectorAll('.nav nav a').forEach(a=>a.addEventListener('click',()=>header.classList.remove('open')));

const io=new IntersectionObserver(entries=>{
  entries.forEach((entry,i)=>{
    if(entry.isIntersecting){
      entry.target.style.transitionDelay=`${Math.min(i*55,180)}ms`;
      entry.target.classList.add('in');
      io.unobserve(entry.target);
    }
  });
},{threshold:.12});
document.querySelectorAll('.reveal').forEach(el=>io.observe(el));

const depthLayers=[...document.querySelectorAll('.depth-layer')];
let lastY=0,ticking=false;
function onScroll(){
  lastY=window.scrollY;
  if(!ticking){
    requestAnimationFrame(()=>{
      const max=document.documentElement.scrollHeight-innerHeight;
      progress.style.width=`${max>0?(lastY/max)*100:0}%`;
      header.classList.toggle('scrolled',lastY>24);
      depthLayers.forEach(el=>{
        const depth=parseFloat(el.dataset.depth||0);
        el.style.transform=`translate3d(0,${lastY*depth}px,0)`;
      });
      ticking=false;
    });
    ticking=true;
  }
}
addEventListener('scroll',onScroll,{passive:true});
onScroll();

const finePointer=matchMedia('(pointer:fine)').matches;
if(finePointer){
  document.querySelectorAll('.tilt-card').forEach(card=>{
    card.addEventListener('mousemove',e=>{
      const r=card.getBoundingClientRect();
      const x=(e.clientX-r.left)/r.width-.5;
      const y=(e.clientY-r.top)/r.height-.5;
      card.style.transform=`perspective(1200px) rotateY(${x*4.5}deg) rotateX(${-y*4.5}deg) translateY(-3px)`;
    });
    card.addEventListener('mouseleave',()=>card.style.transform='');
  });
}

document.getElementById('year').textContent=new Date().getFullYear();

(() => {
  const KEY='hotelZenfCookieConsentV1';
  const banner=document.getElementById('cookieBanner');
  const modal=document.getElementById('cookieModal');
  const analytics=document.getElementById('analyticsCookies');
  const marketing=document.getElementById('marketingCookies');

  function readPrefs(){try{return JSON.parse(localStorage.getItem(KEY)||'null')}catch{return null}}
  function savePrefs(prefs){
    localStorage.setItem(KEY,JSON.stringify({
      necessary:true,
      analytics:!!prefs.analytics,
      marketing:!!prefs.marketing,
      savedAt:new Date().toISOString(),
      version:1
    }));
    banner?.classList.remove('show');
    modal?.classList.remove('show');
    modal?.setAttribute('aria-hidden','true');
    applyConsent();
  }
  function applyConsent(){
    const p=readPrefs();
    window.HotelZenfConsent=p||{necessary:true,analytics:false,marketing:false};
  }
  function openManager(){
    const p=readPrefs()||{analytics:false,marketing:false};
    if(analytics) analytics.checked=!!p.analytics;
    if(marketing) marketing.checked=!!p.marketing;
    modal?.classList.add('show');
    modal?.setAttribute('aria-hidden','false');
  }
  function closeManager(){modal?.classList.remove('show');modal?.setAttribute('aria-hidden','true')}

  document.getElementById('acceptCookies')?.addEventListener('click',()=>savePrefs({analytics:true,marketing:true}));
  document.getElementById('rejectCookies')?.addEventListener('click',()=>savePrefs({analytics:false,marketing:false}));
  document.getElementById('manageCookies')?.addEventListener('click',openManager);
  document.getElementById('manageCookiesFooter')?.addEventListener('click',openManager);
  document.getElementById('cookieClose')?.addEventListener('click',closeManager);
  document.getElementById('rejectAllModal')?.addEventListener('click',()=>savePrefs({analytics:false,marketing:false}));
  document.getElementById('saveCookiePrefs')?.addEventListener('click',()=>savePrefs({analytics:analytics?.checked,marketing:marketing?.checked}));
  modal?.addEventListener('click',e=>{if(e.target===modal)closeManager()});

  if(!readPrefs()) banner?.classList.add('show');
  applyConsent();
})();

/* v8 — narrativa de scroll e troca progressiva das fotos */
(() => {
  const panels=[...document.querySelectorAll('.story-panel')];
  if(!panels.length) return;
  let raf=0;
  function updateRoomStories(){
    const vh=innerHeight;
    panels.forEach(panel=>{
      const rect=panel.getBoundingClientRect();
      const progress=Math.max(0,Math.min(0.999,(vh-rect.top)/(vh+rect.height)));
      const imgs=[...panel.querySelectorAll('.story-media img')];
      const idx=Math.min(imgs.length-1,Math.floor(progress*imgs.length));
      imgs.forEach((img,i)=>img.classList.toggle('active',i===idx));
      if(matchMedia('(pointer:fine)').matches && innerWidth>980){
        panel.style.transform=`translate3d(${panel.classList.contains('alt')?'-7%':'0'},${(progress-.5)*-18}px,0) rotateX(${(progress-.5)*1.2}deg)`;
      }
    });
    raf=0;
  }
  addEventListener('scroll',()=>{if(!raf) raf=requestAnimationFrame(updateRoomStories)},{passive:true});
  addEventListener('resize',updateRoomStories,{passive:true});
  updateRoomStories();
})();


/* V9 — sequência de quartos controlada pelo scroll */
(() => {
  const section=document.querySelector('.rooms-cinematic');
  const panels=[...document.querySelectorAll('.room-stage .story-panel')];
  const currentEl=document.getElementById('roomCurrent');
  const totalEl=document.getElementById('roomTotal');
  const bar=document.getElementById('roomProgressBar');
  const nameEl=document.getElementById('roomProgressName');
  if(!section || !panels.length) return;

  if(totalEl) totalEl.textContent=String(panels.length).padStart(2,'0');
  let active=-1;
  let imageActive=-1;

  function applyPanel(index, localProgress){
    if(index!==active){
      active=index;
      panels.forEach((p,i)=>{
        p.classList.toggle('is-active',i===index);
        p.classList.toggle('is-before',i<index);
      });
      if(currentEl) currentEl.textContent=String(index+1).padStart(2,'0');
      if(nameEl) nameEl.textContent=panels[index]?.dataset.roomName||'';
      if(bar) bar.style.width=`${((index+1)/panels.length)*100}%`;
    }

    const imgs=[...panels[index].querySelectorAll('.story-media img')];
    if(imgs.length>1){
      const imgIndex=Math.min(imgs.length-1,Math.floor(localProgress*imgs.length));
      if(imgIndex!==imageActive){
        imageActive=imgIndex;
        imgs.forEach((im,i)=>im.classList.toggle('active',i===imgIndex));
      }
    }else if(imgs[0]){
      imgs[0].classList.add('active');
    }
  }

  function update(){
    if(matchMedia('(max-width:980px)').matches){
      panels.forEach(p=>p.classList.add('is-active'));
      return;
    }
    const rect=section.getBoundingClientRect();
    const scrollable=section.offsetHeight-innerHeight;
    const travelled=Math.min(Math.max(-rect.top,0),scrollable);
    const progress=scrollable>0?travelled/scrollable:0;
    const scaled=progress*panels.length;
    const index=Math.min(panels.length-1,Math.floor(scaled));
    const local=Math.min(.999,Math.max(0,scaled-index));
    applyPanel(index,local);
  }

  let raf=0;
  addEventListener('scroll',()=>{
    if(!raf) raf=requestAnimationFrame(()=>{update();raf=0});
  },{passive:true});
  addEventListener('resize',update,{passive:true});
  update();
})();
