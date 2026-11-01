/* 1. Hauteur du bandeau figé : la barre d'onglets se cale dessous (sur mobile le bandeau défile) */
function syncHeader(){
  var mh=document.getElementById('masthead');
  var sticky=getComputedStyle(mh).position==='sticky';
  document.documentElement.style.setProperty('--mh',sticky?mh.offsetHeight+'px':'0px');
}
window.addEventListener('resize',syncHeader);window.addEventListener('load',syncHeader);syncHeader();

/* 2. Bulle d'aperçu au survol des cartes d'outils (miniatures dans assets/previews) */
(function(){
  var cards=document.querySelectorAll('a.card[data-preview]');
  if(!cards.length)return;
  cards.forEach(function(c){var i=new Image();i.src='assets/previews/'+c.dataset.preview.replace('.html','')+'.jpg'});
  var tp=document.createElement('div');tp.id='toolPreview';tp.setAttribute('aria-hidden','true');
  tp.innerHTML='<div class="tp-head"></div><img alt=""><div class="tp-foot"><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 4h6v6M20 4l-9 9"/><path d="M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/></svg>Cliquer pour ouvrir dans un nouvel onglet</div>';
  document.body.appendChild(tp);
  function show(card){
    var tile=card.querySelector('.tile'),color=tile?getComputedStyle(tile).backgroundColor:'#1F7A47';
    tp.style.setProperty('--bc',color);
    tp.querySelector('.tp-head').textContent=(card.querySelector('h3')||{}).textContent||'';
    tp.querySelector('img').src='assets/previews/'+card.dataset.preview.replace('.html','')+'.jpg';
    var r=card.getBoundingClientRect(),w=460,gap=18;
    var left=r.right+gap+w<=innerWidth-8;
    tp.classList.toggle('left',!left);
    var x=left?r.right+gap:Math.max(8,r.left-gap-w);
    tp.style.left=x+'px';tp.style.top='0px';tp.classList.add('show');
    var h=tp.offsetHeight,cy=r.top+r.height/2;
    var y=Math.min(Math.max(8,cy-h/2),Math.max(8,innerHeight-h-8));
    tp.style.top=y+'px';tp.style.setProperty('--ty',Math.min(Math.max(30,cy-y),h-30)+'px');
  }
  function hide(){tp.classList.remove('show')}
  document.addEventListener('mouseover',function(e){var c=e.target.closest('a.card[data-preview]');if(c)show(c)});
  document.addEventListener('mouseout',function(e){if(e.target.closest('a.card[data-preview]'))hide()});
  document.addEventListener('focusin',function(e){var c=e.target.closest('a.card[data-preview]');if(c)show(c)});
  document.addEventListener('focusout',hide);
  window.addEventListener('scroll',hide,{passive:true});
})();

/* 3. Photo cliquable : les arcs aux couleurs du logo font un tour complet autour du portrait */
(function(){
  var fig=document.querySelector('.portrait');
  if(!fig)return;
  var svg=fig.querySelector('svg'),busy=false;
  fig.setAttribute('role','button');fig.setAttribute('tabindex','0');
  fig.setAttribute('aria-label','Faire tourner les arcs autour de la photo');
  function spin(){
    if(busy)return;
    if(window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches)return;
    busy=true;svg.classList.add('spin');
    svg.addEventListener('animationend',function done(e){
      if(e.animationName!=='portrait-spin')return;
      svg.classList.remove('spin');busy=false;svg.removeEventListener('animationend',done);
    });
  }
  fig.addEventListener('click',spin);
  fig.addEventListener('keydown',function(e){if(e.key==='Enter'||e.key===' '){e.preventDefault();spin()}});
})();

/* 4. Smartphone : un balayage horizontal change de page (ordre des onglets) */
(function(){
  var order=['index.html','prestations.html','references.html','outils.html','a-propos.html'];
  var file=location.pathname.split('/').pop()||'index.html';
  var i=order.indexOf(file);
  if(i<0)return;
  var main=document.querySelector('main');
  try{
    var d=sessionStorage.getItem('du-swipe');
    if(d&&main){main.classList.add('slide-in-'+d);sessionStorage.removeItem('du-swipe')}
  }catch(e){}
  var x0=0,y0=0,t0=0,ok=false;
  function blocked(el){
    // On ignore les zones qui défilent ou se manipulent en horizontal
    while(el&&el!==document.body){
      if(el.tagName==='IFRAME'||el.tagName==='INPUT'||el.tagName==='TEXTAREA')return true;
      if(el.classList&&(el.classList.contains('tabbar')||el.classList.contains('lm')||el.classList.contains('ticker')))return true;
      if(el.scrollWidth>el.clientWidth+4){var o=getComputedStyle(el).overflowX;if(o==='auto'||o==='scroll')return true}
      el=el.parentElement;
    }
    return false;
  }
  document.addEventListener('touchstart',function(e){
    if(e.touches.length!==1){ok=false;return}
    var t=e.touches[0];x0=t.clientX;y0=t.clientY;t0=Date.now();ok=!blocked(e.target);
  },{passive:true});
  document.addEventListener('touchend',function(e){
    if(!ok)return;ok=false;
    var t=e.changedTouches[0],dx=t.clientX-x0,dy=t.clientY-y0;
    if(Date.now()-t0>700||Math.abs(dx)<70||Math.abs(dx)<Math.abs(dy)*1.8)return;
    var next=dx<0?i+1:i-1;
    if(next<0||next>=order.length)return;
    try{sessionStorage.setItem('du-swipe',dx<0?'left':'right')}catch(err){}
    location.href=order[next];
  },{passive:true});
})();

/* 5. Avis : défilement par boutons (le glissement au doigt marche aussi) */
(function(){
  var tr=document.getElementById('avis'),pv=document.getElementById('avisPrev'),nx=document.getElementById('avisNext');
  if(!tr||!pv||!nx)return;
  function step(){var c=tr.querySelector('.quote');return c?c.getBoundingClientRect().width+parseFloat(getComputedStyle(tr).columnGap||0):tr.clientWidth}
  function upd(){pv.disabled=tr.scrollLeft<4;nx.disabled=tr.scrollLeft+tr.clientWidth>=tr.scrollWidth-4}
  pv.addEventListener('click',function(){tr.scrollBy({left:-step(),behavior:'smooth'})});
  nx.addEventListener('click',function(){tr.scrollBy({left:step(),behavior:'smooth'})});
  tr.addEventListener('scroll',upd,{passive:true});
  tr.addEventListener('keydown',function(e){if(e.key==='ArrowRight')nx.click();if(e.key==='ArrowLeft')pv.click()});
  window.addEventListener('resize',upd);upd();
})();

/* 6. Bouton flottant « Un besoin ? » : apparaît après un instant, se range près du bloc de contact et du pied de page */
(function(){
  var fab=document.getElementById('fab');
  if(!fab)return;
  var hideZones=[document.querySelector('.closing'),document.querySelector('.footer')].filter(Boolean);
  var inZone=0;
  function upd(){fab.classList.toggle('show',ready&&inZone<=0)}
  var ready=false;
  setTimeout(function(){ready=true;upd()},1500);
  if('IntersectionObserver' in window){
    var seen={};
    var io=new IntersectionObserver(function(es){
      es.forEach(function(e){seen[e.target.className]=e.isIntersecting});
      inZone=Object.keys(seen).filter(function(k){return seen[k]}).length;upd();
    });
    hideZones.forEach(function(z){io.observe(z)});
  }
})();
