
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


/* V11 — scroll cinematográfico robusto */
(() => {
  const section = document.querySelector('.rooms-cinematic');
  const wrap = document.querySelector('.rooms-interactive-wrap');
  const panels = [...document.querySelectorAll('.room-stage .story-panel')];
  const currentEl = document.getElementById('roomCurrent');
  const totalEl = document.getElementById('roomTotal');
  const bar = document.getElementById('roomProgressBar');
  const nameEl = document.getElementById('roomProgressName');

  if (!section || !wrap || !panels.length) return;

  if (totalEl) totalEl.textContent = String(panels.length).padStart(2,'0');

  let desktopIndex = -1;
  const imgIndexByPanel = new Map();

  function setDesktopPanel(index, localProgress) {
    index = Math.max(0, Math.min(panels.length - 1, index));

    panels.forEach((panel, i) => {
      panel.classList.toggle('is-active', i === index);
      panel.classList.toggle('is-before', i < index);
      panel.classList.remove('mobile-in');
    });

    if (desktopIndex !== index) {
      desktopIndex = index;
      if (currentEl) currentEl.textContent = String(index + 1).padStart(2,'0');
      if (nameEl) nameEl.textContent = panels[index].dataset.roomName || '';
      if (bar) bar.style.width = `${((index + 1) / panels.length) * 100}%`;
    }

    const imgs = [...panels[index].querySelectorAll('.story-media img')];
    if (imgs.length) {
      const safeLocal = Math.max(0, Math.min(.9999, localProgress));
      const imageIndex = Math.min(imgs.length - 1, Math.floor(safeLocal * imgs.length));
      if (imgIndexByPanel.get(index) !== imageIndex) {
        imgs.forEach((img, i) => img.classList.toggle('active', i === imageIndex));
        imgIndexByPanel.set(index, imageIndex);
      }
    }
  }

  function desktopUpdate() {
    const sectionTop = section.getBoundingClientRect().top + window.scrollY;
    const travel = Math.max(1, wrap.offsetHeight - window.innerHeight);
    const y = Math.max(0, Math.min(window.scrollY - sectionTop, travel));
    const progress = y / travel;

    /* divide o percurso igualmente entre os seis quartos */
    const scaled = Math.min(panels.length - 0.00001, progress * panels.length);
    const index = Math.floor(scaled);
    const localProgress = scaled - index;

    setDesktopPanel(index, localProgress);
  }

  let mobileObserver;
  function enableMobile() {
    if (mobileObserver) return;

    panels.forEach(panel => {
      panel.classList.remove('is-active','is-before');
      const imgs = [...panel.querySelectorAll('.story-media img')];
      imgs.forEach((img,i) => img.classList.toggle('active', i === 0));
    });

    mobileObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('mobile-in');

          /* troca suave de fotos quando o card entra no mobile */
          const imgs = [...entry.target.querySelectorAll('.story-media img')];
          if (imgs.length > 1 && !entry.target.dataset.slideshowStarted) {
            entry.target.dataset.slideshowStarted = '1';
            let idx = 0;
            const timer = setInterval(() => {
              if (!document.body.contains(entry.target)) {
                clearInterval(timer);
                return;
              }
              const rect = entry.target.getBoundingClientRect();
              const visible = rect.bottom > 0 && rect.top < innerHeight;
              if (!visible) return;
              idx = (idx + 1) % imgs.length;
              imgs.forEach((img,i) => img.classList.toggle('active', i === idx));
            }, 2600);
          }
        }
      });
    }, { threshold: 0.18 });

    panels.forEach(panel => mobileObserver.observe(panel));
  }

  function disableMobile() {
    if (mobileObserver) {
      mobileObserver.disconnect();
      mobileObserver = null;
    }
    panels.forEach(panel => panel.classList.remove('mobile-in'));
  }

  function updateMode() {
    if (window.matchMedia('(max-width:980px)').matches) {
      enableMobile();
    } else {
      disableMobile();
      desktopUpdate();
    }
  }

  let raf = 0;
  function schedule() {
    if (raf) return;
    raf = requestAnimationFrame(() => {
      if (!window.matchMedia('(max-width:980px)').matches) desktopUpdate();
      raf = 0;
    });
  }

  window.addEventListener('scroll', schedule, { passive:true });
  window.addEventListener('resize', () => {
    updateMode();
    schedule();
  }, { passive:true });

  setDesktopPanel(0,0);
  updateMode();
})();

