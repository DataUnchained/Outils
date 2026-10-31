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
