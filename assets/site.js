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
  var order=['index.html','prestations.html','experiences.html','references.html','outils.html','a-propos.html'];
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
      if(el.tagName==='IFRAME'||el.tagName==='INPUT'||el.tagName==='TEXTAREA'||el.tagName==='DIALOG')return true;
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

/* 6. Bouton flottant « Un besoin ? » + formulaire de contact en fenêtre */
(function(){
  var fab=document.getElementById('fab');
  if(!fab)return;
  var dlg=document.getElementById('contactDlg'),form=document.getElementById('contactForm');
  var status=document.getElementById('dlgStatus'),send=document.getElementById('dlgSend');
  var ENDPOINT='https://formsubmit.co/ajax/data.unchained@outlook.fr';
  // apparition du bouton, masqué près du bloc de contact et du pied de page
  var zones=[document.querySelector('.closing'),document.querySelector('.footer')].filter(Boolean),inZone=0,ready=false;
  function upd(){fab.classList.toggle('show',ready&&inZone<=0)}
  setTimeout(function(){ready=true;upd()},1500);
  if('IntersectionObserver' in window){
    var seen={},io=new IntersectionObserver(function(es){
      es.forEach(function(e){seen[e.target.className]=e.isIntersecting});
      inZone=Object.keys(seen).filter(function(k){return seen[k]}).length;upd();
    });
    zones.forEach(function(z){io.observe(z)});
  }
  // ouverture / fermeture de la fenêtre
  function open(){
    status.className='dlg-status';status.textContent='';
    if(dlg.showModal)dlg.showModal();else dlg.setAttribute('open','');
    var f=form.querySelector('input[name=name]');if(f)f.focus();
  }
  function close(){if(dlg.close)dlg.close();else dlg.removeAttribute('open')}
  fab.addEventListener('click',open);
  document.getElementById('dlgClose').addEventListener('click',close);
  dlg.addEventListener('click',function(e){if(e.target===dlg)close()});
  if(location.hash==='#contact')setTimeout(open,300); // arrivée depuis « Me contacter » (page Outils)
  // envoi
  form.addEventListener('submit',function(e){
    e.preventDefault();
    var bad=false;
    form.querySelectorAll('[required]').forEach(function(el){
      var ko=el.type==='checkbox'?!el.checked:!el.value.trim()||(el.type==='email'&&!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(el.value));
      el.classList.toggle('invalid',ko);if(ko)bad=true;
    });
    if(bad){status.className='dlg-status err';status.textContent='Merci de compléter les champs en rouge et de cocher la case.';return}
    var d=new FormData(form);
    if(d.get('_honey'))return; // robot : on ignore
    var payload={name:d.get('name'),email:d.get('email'),message:d.get('message'),_subject:'Message depuis le site Data Unchained',_template:'table',_captcha:'false'};
    send.disabled=true;status.className='dlg-status';status.textContent='Envoi en cours…';
    fetch(ENDPOINT,{method:'POST',headers:{'Content-Type':'application/json','Accept':'application/json'},body:JSON.stringify(payload)})
      .then(function(r){return r.json().then(function(j){return {ok:r.ok,j:j}})})
      .then(function(x){
        if(!x.ok||String(x.j.success)==='false'){console.warn('FormSubmit',x.j);var m=String(x.j&&x.j.message||'');if(/activat/i.test(m)){status.className='dlg-status ok';status.textContent='Presque : un e-mail d’activation vient d’être envoyé au propriétaire du site. Une fois confirmé, les messages arriveront.';return}throw new Error(m||('HTTP '+(x.ok?'ok':'erreur')))}
        status.className='dlg-status ok';status.textContent='Message envoyé. Merci, je vous réponds rapidement.';form.reset();
      })
      .catch(function(err){
        console.error('Envoi du formulaire :',err);
        var body=encodeURIComponent((payload.message||'')+'\n\n'+(payload.name||''));
        status.className='dlg-status err';
        var det=String(err&&err.message||err).replace(/[<>&]/g,'');status.innerHTML='L’envoi a échoué. Vous pouvez m’écrire directement : <a href="mailto:olivier.faure@dataunchained.fr?subject=Contact%20depuis%20le%20site&body='+body+'">olivier.faure@dataunchained.fr</a><br><small>Détail technique : '+det+'</small>';
      })
      .then(function(){send.disabled=false});
  });
  form.addEventListener('input',function(e){e.target.classList.remove('invalid');if(status.classList.contains('err')){status.className='dlg-status';status.textContent=''}});
})();

/* 7. Diaporama de réalisations (page Expériences) */
(function(){
  var tr=document.getElementById('gal'),pv=document.getElementById('galPrev'),nx=document.getElementById('galNext'),dots=document.querySelectorAll('.gal-dot');
  if(!tr||!pv||!nx)return;
  var slides=tr.querySelectorAll('.slide');
  function idx(){return Math.round(tr.scrollLeft/(tr.clientWidth||1))}
  function go(i){i=Math.max(0,Math.min(slides.length-1,i));tr.scrollTo({left:i*tr.clientWidth,behavior:'smooth'})}
  function fit(i){var s=slides[i];if(s)tr.style.height=s.offsetHeight+'px'}
  function upd(){var i=idx();fit(i);pv.disabled=i<=0;nx.disabled=i>=slides.length-1;dots.forEach(function(d,k){d.classList.toggle('on',k===i)});
    if(slides.length<2){document.getElementById('galDots').style.display='none';pv.style.display='none';nx.style.display='none'}}
  pv.addEventListener('click',function(){go(idx()-1)});
  nx.addEventListener('click',function(){go(idx()+1)});
  dots.forEach(function(d,k){d.addEventListener('click',function(){go(k)})});
  tr.addEventListener('scroll',upd,{passive:true});
  tr.addEventListener('keydown',function(e){if(e.key==='ArrowRight')go(idx()+1);if(e.key==='ArrowLeft')go(idx()-1)});
  window.addEventListener('resize',upd);window.addEventListener('load',upd);tr.querySelectorAll('img').forEach(function(m){m.addEventListener('load',upd)});upd();
})();

/* 9. Page Outils : fenêtre de présentation avant d'ouvrir un outil gratuit */
(function(){
  if(!document.querySelector('a.card[data-preview]'))return;
  var SKIP='du_tool_intro_skip',dlg=null;
  // pictos : [icône, titre, explication par défaut]
  var IC={
    install:['<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 9h18M6.5 6.5h.01M9 6.5h.01"/>','Sans installation','S’ouvre dans ton navigateur, sans compte'],
    fictif:['<rect x="4" y="4" width="16" height="16" rx="3"/><circle cx="9" cy="9" r="1.2"/><circle cx="15" cy="15" r="1.2"/><circle cx="15" cy="9" r="1.2"/><circle cx="9" cy="15" r="1.2"/>','Données fictives','Aucune donnée réelle, tu peux tout tester'],
    demo:['<circle cx="12" cy="12" r="9"/><path d="M10 8.5l5 3.5-5 3.5z"/>','Version démo','Adaptable à ton contexte sur demande'],
    local:['<path d="M12 3l7 3v5c0 4.5-3 8-7 10-4-2-7-5.5-7-10V6z"/><path d="M9 12l2 2 4-4"/>','Rien n’est envoyé','Tout reste sur ton poste'],
    chrono:['<circle cx="12" cy="13.5" r="7"/><path d="M12 10v3.8l2.4 1.4M9.5 3h5M12 3v3.5"/>','Chronométré',''],
    save:['<path d="M6 3h12v18l-6-4-6 4z"/>','Progression gardée','Reprends là où tu en étais'],
    offline:['<path d="M3 3l18 18"/><path d="M8.5 16.5a5 5 0 0 1 7 0M5 13a10 10 0 0 1 5-2.7M14 10.3A10 10 0 0 1 19 13M2 9.5a15 15 0 0 1 4.5-2.8M11 5.1A15 15 0 0 1 22 9.5"/><path d="M12 20h.01"/>','Hors connexion','La base est embarquée dans la page'],
    excel:['<path d="M14 3H6a1 1 0 0 0-1 1v16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V8z"/><path d="M14 3v5h5M9 12l4 5M13 12l-4 5"/>','Export Excel','Récupère les données pour les retravailler']
  };
  // texte et pictos propres à chaque outil (clé = data-preview)
  var TOOLS={
    'dax_sandbox.html':['pour que tu puisses écrire et tester tes mesures DAX sans ouvrir Power BI, puis progresser avec des défis de plus en plus corsés.',['install','fictif','local','demo']],
    'du_pl300_examen_blanc.html':['pour t’entraîner dans les conditions de la certification PL-300 et repérer les domaines à revoir avant le jour J.',['install',['chrono','100 minutes, comme le jour J'],['fictif','Études de cas inventées'],'demo']],
    'du_tcd_atelier.html':['pour que tu comprennes les tableaux croisés dynamiques en les manipulant, sans risque d’abîmer un vrai fichier.',['install',['fictif','Jeu de données RH inventé'],'local','demo']],
    'du_excel_positionnement.html':['pour que tu connaisses ton niveau avant la formation, et que le contenu colle à tes vrais besoins.',['install',['chrono','Quelques minutes suffisent'],'local','demo']],
    'du_cahier_vacances_excel.html':['pour que tu continues à pratiquer les formules après la formation, à ton rythme, exercice après exercice.',['install','fictif',['save','Un code de sauvegarde garde tes médailles'],'demo']],
    'du_exam.html':['pour évaluer de vraies compétences, en limitant l’aide de l’IA pendant l’épreuve.',['install',['chrono','Durée réglable selon ton besoin'],'fictif',['demo','Codes de séance fixés pour la démo']]],
    'du_sql_lab_offline_2.html':['pour que tu pratiques le SQL sur une vraie base de données, sans rien installer ni configurer.',['install','fictif','offline','demo']],
    'du_terracrm.html':['pour que tu t’entraînes sur des données commerciales imparfaites, comme dans la vraie vie, avant de construire ton tableau de bord.',['install','fictif','excel','demo']]
  };
  var DEF=['pour que tu apprennes en pratiquant, à ton rythme.',['install','fictif','local','demo']];
  function skip(){try{return sessionStorage.getItem(SKIP)==='1'}catch(e){return false}}
  function badges(list){
    return list.map(function(b){
      var k=typeof b==='string'?b:b[0],d=IC[k],txt=typeof b==='string'?d[2]:b[1];
      return '<li><span class="tb-ic"><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+d[0]+'</svg></span><span><b>'+d[1]+'</b><small>'+txt+'</small></span></li>';
    }).join('');
  }
  function build(){
    dlg=document.createElement('dialog');dlg.className='dlg dlg-tool';dlg.id='toolDlg';dlg.setAttribute('aria-labelledby','toolDlgTitle');
    dlg.innerHTML='<div class="dlg-head"><h2 id="toolDlgTitle"></h2><button type="button" class="dlg-x" aria-label="Fermer">×</button></div>'+
      '<div class="dlg-body">'+
      '<div class="tool-why"><span class="tw-ic"><svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.2"/><path d="M12 3v3M21 12h-3"/></svg></span><p><b>Objectif :</b> cet outil a été développé <span id="toolWhy"></span></p></div>'+
      '<ul class="tool-badges" id="toolBadges"></ul>'+
      '<div class="tool-custom"><b>Tu veux une version sur mesure ?</b> Ton thème, tes propres questions, tes données métier et ta charte graphique : c’est tout à fait possible, contacte-moi.</div>'+
      '<div class="btn-row"><a class="btn primary" id="toolGo" target="_blank" rel="noopener noreferrer">Accéder à l’outil</a><a class="btn" href="index.html#contact">Me contacter</a></div>'+
      '<label class="dlg-check"><input type="checkbox" id="toolSkip"> Ne plus afficher ce message pendant ma visite</label>'+
      '<p class="tool-auto" id="toolAuto" aria-live="off"></p>'+
      '</div>'+
      '<svg class="tool-ring" aria-hidden="true"><rect pathLength="100"/></svg>';
    document.body.appendChild(dlg);
    dlg.querySelector('.dlg-x').addEventListener('click',close);
    dlg.addEventListener('click',function(e){if(e.target===dlg)close()});
    dlg.querySelector('#toolGo').addEventListener('click',function(){remember();close()});
    dlg.addEventListener('close',stop);
    ['pointerdown','keydown','wheel','touchstart','scroll'].forEach(function(ev){
      dlg.addEventListener(ev,function(){last=performance.now()},{passive:true,capture:true});
    });
    document.addEventListener('visibilitychange',function(){last=performance.now()});
  }
  function remember(){if(dlg.querySelector('#toolSkip').checked){try{sessionStorage.setItem(SKIP,'1')}catch(e){}}}
  function close(){stop();if(dlg.close)dlg.close();else dlg.removeAttribute('open')}
  // minuteur : 30 s sans activité dans la fenêtre, l'outil s'ouvre (même onglet, les navigateurs bloquent un nouvel onglet ouvert sans clic)
  var DELAY=30000,last=0,raf=0,shown=-1;
  function stop(){cancelAnimationFrame(raf);raf=0}
  function tick(now){
    var el=Math.min(DELAY,now-last),left=Math.ceil((DELAY-el)/1000);
    var svg=dlg.querySelector('.tool-ring'),r=svg.firstChild,w=dlg.clientWidth,h=dlg.clientHeight;
    r.setAttribute('rx',20);r.setAttribute('x',3);r.setAttribute('y',3);r.setAttribute('width',Math.max(0,w-6));r.setAttribute('height',Math.max(0,h-6));
    r.style.strokeDashoffset=100*(1-el/DELAY);
    if(left!==shown){shown=left;dlg.querySelector('#toolAuto').textContent='Sans action de ta part, l’outil s’ouvre dans '+left+'\u00a0s.'}
    if(el>=DELAY){remember();var u=dlg.querySelector('#toolGo').href;close();location.href=u;return}
    raf=requestAnimationFrame(tick);
  }
  document.addEventListener('click',function(e){
    var c=e.target.closest('a.card[data-preview]');
    if(!c||e.button!==0||e.ctrlKey||e.metaKey||e.shiftKey||e.altKey||skip())return;
    e.preventDefault();
    if(!dlg)build();
    var tp=document.getElementById('toolPreview');if(tp)tp.classList.remove('show');
    var cfg=TOOLS[c.dataset.preview]||DEF;
    dlg.querySelector('#toolDlgTitle').textContent=(c.querySelector('h3')||{}).textContent||'Outil gratuit';
    dlg.querySelector('#toolWhy').textContent=cfg[0];
    dlg.querySelector('#toolBadges').innerHTML=badges(cfg[1]);
    dlg.querySelector('#toolGo').href=c.href;
    dlg.querySelector('#toolSkip').checked=false;
    if(dlg.showModal)dlg.showModal();else dlg.setAttribute('open','');
    dlg.querySelector('#toolGo').focus();
    stop();last=performance.now();shown=-1;raf=requestAnimationFrame(tick);
  });
})();
