
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


/* V12 — controle por IntersectionObserver: sem cards escondidos */
(() => {
  const rooms=[...document.querySelectorAll('.rooms-v12-list .v12-room')];
  const currentEl=document.getElementById('roomCurrent');
  const totalEl=document.getElementById('roomTotal');
  const bar=document.getElementById('roomProgressBar');
  const nameEl=document.getElementById('roomProgressName');

  if(!rooms.length) return;
  if(totalEl) totalEl.textContent=String(rooms.length).padStart(2,'0');

  let currentIndex=0;
  const timers=new WeakMap();

  function updateProgress(index){
    currentIndex=index;
    rooms.forEach((room,i)=>room.classList.toggle('is-current',i===index));
    if(currentEl) currentEl.textContent=String(index+1).padStart(2,'0');
    if(nameEl) nameEl.textContent=rooms[index]?.dataset.roomName||'';
    if(bar) bar.style.width=`${((index+1)/rooms.length)*100}%`;
  }

  function startSlideshow(room){
    const imgs=[...room.querySelectorAll('.story-media img')];
    if(imgs.length<2 || timers.has(room)) return;
    let idx=0;
    const id=setInterval(()=>{
      const rect=room.getBoundingClientRect();
      const visible=rect.bottom>0 && rect.top<innerHeight;
      if(!visible) return;
      idx=(idx+1)%imgs.length;
      imgs.forEach((img,i)=>img.classList.toggle('active',i===idx));
    },2800);
    timers.set(room,id);
  }

  if('IntersectionObserver' in window){
    const observer=new IntersectionObserver(entries=>{
      const visible=entries
        .filter(e=>e.isIntersecting)
        .sort((a,b)=>b.intersectionRatio-a.intersectionRatio);

      visible.forEach(e=>startSlideshow(e.target));

      if(visible.length){
        const best=visible[0].target;
        const index=rooms.indexOf(best);
        if(index>=0) updateProgress(index);
      }
    },{
      root:null,
      rootMargin:'-18% 0px -18% 0px',
      threshold:[0.2,0.35,0.5,0.65,0.8]
    });

    rooms.forEach(room=>observer.observe(room));
  }else{
    rooms.forEach(startSlideshow);
  }

  updateProgress(0);
})();

