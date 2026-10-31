/* 1. Hauteur du bandeau figé : la barre d'onglets se cale dessous (sur mobile le bandeau défile) */
function syncHeader(){
  var mh=document.getElementById('masthead');
  var sticky=getComputedStyle(mh).position==='sticky';
  document.documentElement.style.setProperty('--mh',sticky?mh.offsetHeight+'px':'0px');
}
window.addEventListener('resize',syncHeader);window.addEventListener('load',syncHeader);syncHeader();

/* 2. Aperçu au survol des cartes d'outils (miniatures dans assets/previews) */
(function(){
  if(!document.querySelector('a.card[data-preview]'))return;
  var tp=document.createElement('div');tp.id='toolPreview';tp.setAttribute('aria-hidden','true');
  tp.innerHTML='<img alt=""><div class="tp-cap"><b></b>Aperçu de la page, s\'ouvre dans un nouvel onglet</div>';
  document.body.appendChild(tp);
  function show(card){
    var key=card.dataset.preview.replace('.html','');
    tp.querySelector('img').src='assets/previews/'+key+'.jpg';
    tp.querySelector('b').textContent=(card.querySelector('h3')||{}).textContent||'';
    var r=card.getBoundingClientRect(),w=340,h=270;
    var x=Math.min(Math.max(8,r.left+r.width/2-w/2),innerWidth-w-8);
    var below=r.bottom+10+h<innerHeight||r.top<h+70;
    tp.style.left=x+'px';
    tp.style.top=(below?Math.min(r.bottom+10,innerHeight-h-8):r.top-h-10)+'px';
    tp.classList.add('show');
  }
  function hide(){tp.classList.remove('show')}
  document.addEventListener('mouseover',function(e){var c=e.target.closest('a.card[data-preview]');if(c)show(c)});
  document.addEventListener('mouseout',function(e){if(e.target.closest('a.card[data-preview]'))hide()});
  document.addEventListener('focusin',function(e){var c=e.target.closest('a.card[data-preview]');if(c)show(c)});
  document.addEventListener('focusout',hide);
  window.addEventListener('scroll',hide,{passive:true});
})();
