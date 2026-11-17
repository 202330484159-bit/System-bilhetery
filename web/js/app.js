const money = value => new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL'}).format(value);
const defaultMovies = [
{id:'orbita',title:'Órbita Final',genre:'Ficção',duration:128,rating:'12 anos',score:'9,2',symbol:'✦',colors:['#163c70','#081629'],description:'Uma missão além das estrelas coloca o destino de toda a humanidade em jogo.'},
{id:'ultimo-round',title:'O Último Round',genre:'Ação',duration:112,rating:'14 anos',score:'8,8',symbol:'✧',colors:['#814a35','#281b27'],description:'Um campeão afastado dos ringues encontra uma razão para lutar novamente.'},
{id:'alem-mar',title:'Além do Mar',genre:'Drama',duration:104,rating:'10 anos',score:'9,0',symbol:'≈',colors:['#1c6675','#10263a'],description:'Uma viagem inesperada transforma a relação de uma família.'},
{id:'reino-luz',title:'O Reino da Luz',genre:'Aventura',duration:119,rating:'Livre',score:'9,4',symbol:'☼',colors:['#8b6b37','#332a36'],description:'Uma jovem exploradora parte em busca de uma cidade esquecida.'}
];
const read = (key,fallback) => {try{return JSON.parse(localStorage.getItem(key)) ?? fallback}catch{return fallback}};
const save = (key,value) => localStorage.setItem(key,JSON.stringify(value));
const getMovies = () => [...defaultMovies,...read('ct-custom-movies',[])];
function renderMovies(){
 const grid=document.querySelector('#movie-grid'); if(!grid)return;
 const query=(document.querySelector('#movie-search')?.value||'').toLocaleLowerCase('pt-BR');
 const genre=document.querySelector('.chip.selected')?.dataset.genre||'Todos';
 const list=getMovies().filter(m=>(genre==='Todos'||m.genre===genre)&&(m.title+' '+m.genre).toLocaleLowerCase('pt-BR').includes(query));
 grid.innerHTML=list.map(m=>`<article class="movie-card"><div class="poster" style="--poster-a:${m.colors?.[0]||'#244b73'};--poster-b:${m.colors?.[1]||'#101b2c'}"><span class="poster-symbol">${m.symbol||'✦'}</span><span class="poster-tag">${m.rating||'Livre'}</span></div><div class="movie-info"><h3>${escapeHTML(m.title)}</h3><div class="movie-meta">${escapeHTML(m.genre)} · ${Number(m.duration)||110} min</div><div class="movie-bottom"><span class="rating">★ ${m.score||'Em breve'}</span><a class="button button-primary" href="pages/assentos.html?movie=${encodeURIComponent(m.id)}">Ver sessões →</a></div></div></article>`).join('')||'<p class="muted">Nenhum filme encontrado. Tente outra busca.</p>';
 document.querySelector('#movie-count').textContent=`${list.length} título(s)`;
}
function escapeHTML(value){return String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function setupCatalog(){
 document.querySelector('#movie-search')?.addEventListener('input',renderMovies);
 document.querySelector('#genre-filters')?.addEventListener('click',e=>{const b=e.target.closest('[data-genre]');if(!b)return;document.querySelectorAll('.chip').forEach(x=>x.classList.toggle('selected',x===b));renderMovies()});
 renderMovies();
}
function setupSeats(){
 const map=document.querySelector('#seat-map');if(!map)return;
 const params=new URLSearchParams(location.search), movie=getMovies().find(m=>m.id===params.get('movie'))||defaultMovies[0];
 const session=read('ct-session',{date:'Hoje',time:'19:30',room:'Sala 02',format:'2D',roomType:'Tradicional'});
 document.querySelector('#seat-movie-title').textContent=movie.title;
 document.querySelector('#seat-session-label').textContent=`${session.date} · ${session.time} · ${session.roomType} · ${session.format}`;
 const occupied=new Set(['A4','A5','B7','C3','D8','E2','F6','G5']);
 let selected=new Set(read('ct-selected-seats',[]));
 const rows='ABCDEFGH'.split('');
 map.innerHTML=rows.map((row,ri)=>`<div class="seat-row"><span class="row-label">${row}</span>${Array.from({length:10},(_,i)=>{const id=row+(i+1),premium=ri>=6;return `<button class="seat ${premium?'premium':''} ${occupied.has(id)?'occupied':''} ${selected.has(id)?'selected':''}" data-seat="${id}" ${occupied.has(id)?'disabled':''} aria-label="Poltrona ${id}">${i+1}</button>`}).join('')}</div>`).join('');
 const update=()=>{document.querySelectorAll('[data-seat]').forEach(b=>b.classList.toggle('selected',selected.has(b.dataset.seat)));document.querySelector('#selected-seats').textContent=selected.size?[...selected].sort().join(', '):'Nenhum assento';document.querySelector('#seat-total').textContent=money([...selected].reduce((sum,id)=>sum+(id[0]>='G'?42:30),0));document.querySelector('#continue-checkout').disabled=!selected.size;save('ct-selected-seats',[...selected]);};
 map.addEventListener('click',e=>{const b=e.target.closest('[data-seat]');if(!b||b.disabled)return;if(selected.has(b.dataset.seat))selected.delete(b.dataset.seat);else if(selected.size<6)selected.add(b.dataset.seat);else alert('Você pode selecionar até 6 assentos por pedido.');update()});
 document.querySelector('#continue-checkout').addEventListener('click',()=>{save('ct-order',{movie:movie.title,movieId:movie.id,session,seats:[...selected],createdAt:new Date().toISOString()});location.href='checkout.html'});update();
}
function setupCheckout(){
 const form=document.querySelector('#checkout-form');if(!form)return;
 const order=read('ct-order',null),seats=order?.seats||[];
 if(!order||!seats.length){document.querySelector('#checkout-summary').innerHTML='<p class="muted">Nenhuma seleção encontrada. Volte ao catálogo e escolha seus lugares.</p>';form.hidden=true;return}
 const total=seats.reduce((sum,id)=>sum+(id[0]>='G'?42:30),0);
 document.querySelector('#checkout-summary').innerHTML=`<div class="summary-row"><span>Filme</span><strong>${escapeHTML(order.movie)}</strong></div><div class="summary-row"><span>Sessão</span><strong>${escapeHTML(order.session.time)} · ${escapeHTML(order.session.format)}</strong></div><div class="summary-row"><span>Assentos</span><strong>${seats.join(', ')}</strong></div><div class="summary-row"><span>Ingressos</span><strong>${seats.length} ×</strong></div>`;
 document.querySelector('#checkout-total').textContent=money(total);
 form.addEventListener('submit',e=>{e.preventDefault();const tickets=read('ct-tickets',[]);const ticket={...order,total,name:document.querySelector('#customer-name').value.trim(),email:document.querySelector('#customer-email').value.trim(),code:'CT-'+Math.random().toString(36).slice(2,8).toUpperCase()};save('ct-tickets',[ticket,...tickets]);save('ct-selected-seats',[]);location.href='ingressos.html?confirmed=1'});
}
function setupTickets(){
 const list=document.querySelector('#tickets-list');if(!list)return;const tickets=read('ct-tickets',[]);
 if(new URLSearchParams(location.search).has('confirmed'))list.insertAdjacentHTML('beforebegin','<div class="notice">Ingresso demonstrativo confirmado! Você pode consultar os detalhes abaixo.</div>');
 list.innerHTML=tickets.length?tickets.map(t=>`<article class="ticket-item"><div><strong>${escapeHTML(t.movie)}</strong><p>${escapeHTML(t.session.date)} · ${escapeHTML(t.session.time)} · Assentos: ${t.seats.join(', ')}</p><p>${escapeHTML(t.name)} · ${money(t.total)}</p></div><span class="ticket-code">${escapeHTML(t.code)}</span></article>`).join(''):'<div class="panel"><p class="muted">Você ainda não tem ingressos confirmados neste navegador.</p><a class="button button-primary" href="../index.html">Explorar filmes →</a></div>';
}
function setupAdmin(){
 const form=document.querySelector('#admin-movie-form');if(!form)return;
 form.addEventListener('submit',e=>{e.preventDefault();const title=document.querySelector('#admin-title').value.trim();if(!title)return;const custom=read('ct-custom-movies',[]);custom.push({id:'custom-'+Date.now(),title,genre:document.querySelector('#admin-genre').value,duration:110,rating:document.querySelector('#admin-rating').value,score:'Novo',symbol:'✦',colors:['#24517d','#111c2e'],description:'Filme adicionado pelo painel demonstrativo.'});save('ct-custom-movies',custom);form.reset();alert('Filme adicionado ao catálogo deste navegador.');});
}
document.addEventListener('DOMContentLoaded',()=>{setupCatalog();setupSeats();setupCheckout();setupTickets();setupAdmin()});