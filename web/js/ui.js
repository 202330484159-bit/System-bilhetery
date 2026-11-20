/* CineTickets — melhorias de UI (não altera API, JWT nem regras de negócio) */
(() => {
 const FONT='https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Manrope:wght@400;500;600;700;800&display=swap';
 if(!document.querySelector('link[href*="fonts.googleapis.com/css2"]')){const l=document.createElement('link');l.rel='stylesheet';l.href=FONT;document.head.appendChild(l)}
 /* Toasts: substitui alert() bloqueante */
 let wrap;
 const toast=msg=>{wrap=wrap||document.body.appendChild(Object.assign(document.createElement('div'),{className:'toast-wrap',role:'status'}));const t=document.createElement('div');t.className='toast';t.textContent=String(msg);wrap.appendChild(t);setTimeout(()=>t.remove(),4200)};
 window.alert=toast;
 /* Capas únicas por gênero/título (a API não possui imagem de pôster) */
 const PALETTES={acao:['#c2410c','#3b0a1f','✹'],aventura:['#0f766e','#10243f','✧'],drama:['#7c3aed','#1a1040','❖'],ficcao:['#2563eb','#1b1257','✦'],animacao:['#db2777','#3b1163','✺'],comedia:['#d97706','#4a1d2e','☺'],default:['#3b6fb5','#141b3d','✦']};
 const norm=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
 const hue=s=>[...s].reduce((a,c)=>(a*31+c.charCodeAt(0))%360,7);
 const paint=grid=>grid.querySelectorAll('.movie-card:not([data-painted])').forEach(card=>{
  card.dataset.painted='1';
  const genre=norm(card.querySelector('.movie-meta')?.textContent.split('·')[0]).trim();
  const key=Object.keys(PALETTES).find(k=>genre.startsWith(k))||'default';
  const [a,b,sym]=PALETTES[key],p=card.querySelector('.poster');if(!p)return;
  p.style.setProperty('--poster-a',`color-mix(in srgb,${a} 80%,hsl(${hue(card.querySelector('h3')?.textContent||'')} 70% 50%) 20%)`);
  p.style.setProperty('--poster-b',b);
  const s=p.querySelector('.poster-symbol');if(s)s.textContent=sym;
 });
 /* Skeleton enquanto o catálogo carrega */
 const watchGrid=grid=>{
  const run=()=>{
   if(grid.querySelector('p.muted')&&/Carregando/.test(grid.textContent)&&!grid.querySelector('.skeleton')){grid.innerHTML=Array(8).fill('<div class="skeleton" aria-hidden="true"></div>').join('');return}
   paint(grid);
  };
  new MutationObserver(run).observe(grid,{childList:true});run();
 };
 document.addEventListener('DOMContentLoaded',()=>{
  const grid=document.querySelector('#movie-grid');if(grid)watchGrid(grid);
  const bar=document.querySelector('.topbar');
  if(bar){const on=()=>bar.classList.toggle('scrolled',scrollY>8);addEventListener('scroll',on,{passive:true});on()}
 });
})();
