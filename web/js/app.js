const API_BASE_URL = window.CINETICKETS_API_URL || 'https://super-funicular-jrq6j9v7j6w5cqgx5-8080.app.github.dev';
const money = value => new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL'}).format(value);
const read = (key,fallback) => {try{return JSON.parse(localStorage.getItem(key)) ?? fallback}catch{return fallback}};
const save = (key,value) => localStorage.setItem(key,JSON.stringify(value));
let catalogMovies = [];
let adminMovies = [];

async function apiRequest(path, options = {}) {
 const response = await fetch(`${API_BASE_URL}${path}`, {
  ...options,
  credentials: 'omit',
  headers: {'Accept':'application/json', ...(options.body ? {'Content-Type':'application/json'} : {}), ...(options.headers || {})}
 });
 if (!response.ok) {
  let detail = '';
  try { const body = await response.json(); detail = body.message || body.detail || ''; } catch {}
  throw new Error(detail || `A API respondeu com HTTP ${response.status}.`);
 }
 if (response.status === 204) return null;
 return response.json();
}
const apiListMovies = () => apiRequest('/api/filmes');
const mapMovie = film => ({
 id: film.id,
 title: film.titulo,
 genre: film.genero,
 duration: film.duracaoMinutos,
 rating: film.classificacaoIndicativa,
 description: film.sinopse,
 score: 'Em breve',
 symbol: '✦',
 colors: ['#244b73','#101b2c'],
 active: film.ativo
});
function escapeHTML(value){return String(value ?? '').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
const normalizeText = value => String(value ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase('pt-BR').trim();
function setFeedback(element, message, type = 'info') {
 if (!element) return;
 element.textContent = message;
 element.className = type === 'error' ? 'notice error' : 'notice';
 element.hidden = !message;
}
function renderMovies(){
 const grid=document.querySelector('#movie-grid'); if(!grid)return;
 const query=normalizeText(document.querySelector('#movie-search')?.value||'');
 const genre=document.querySelector('.chip.selected')?.dataset.genre||'Todos';
 const selectedGenre=normalizeText(genre);
 const list=catalogMovies.filter(m=>{
  const movieGenre=normalizeText(m.genre);
  const matchesGenre=genre==='Todos'||movieGenre===selectedGenre||(selectedGenre==='ficcao'&&movieGenre.startsWith('ficcao'));
  return matchesGenre&&normalizeText(m.title+' '+m.genre).includes(query);
 });
 grid.innerHTML=list.map(m=>`<article class="movie-card"><div class="poster" style="--poster-a:${m.colors[0]};--poster-b:${m.colors[1]}"><span class="poster-symbol">${m.symbol}</span><span class="poster-tag">${escapeHTML(m.rating||'Livre')}</span></div><div class="movie-info"><h3>${escapeHTML(m.title)}</h3><div class="movie-meta">${escapeHTML(m.genre)} · ${Number(m.duration)||110} min</div><div class="movie-bottom"><span class="rating">★ ${m.score}</span><a class="button button-primary" href="pages/assentos.html?movie=${encodeURIComponent(m.id)}">Ver sessões →</a></div></div></article>`).join('')||'<p class="muted">Nenhum filme encontrado. Tente outra busca.</p>';
 const count=document.querySelector('#movie-count');
 if(count) count.textContent=`${list.length} título(s)`;
}
async function loadCatalog() {
 const grid=document.querySelector('#movie-grid');
 if(grid) grid.innerHTML='<p class="muted">Carregando filmes...</p>';
 try {
  const films=await apiListMovies();
  catalogMovies=films.map(mapMovie);
  renderMovies();
 } catch(error) {
  catalogMovies=[];
  if(grid) grid.innerHTML=`<p class="muted">Não foi possível carregar o catálogo. ${escapeHTML(error.message)} Atualize a página ou tente novamente mais tarde.</p>`;
  const count=document.querySelector('#movie-count');
  if(count) count.textContent='Catálogo indisponível';
 }
}
function setupCatalog(){
 if(!document.querySelector('#movie-grid'))return;
 document.querySelector('#movie-search')?.addEventListener('input',renderMovies);
 document.querySelector('#genre-filters')?.addEventListener('click',e=>{const b=e.target.closest('[data-genre]');if(!b)return;document.querySelectorAll('.chip').forEach(x=>x.classList.toggle('selected',x===b));renderMovies()});
 loadCatalog();
}
async function setupSeats(){
 const map=document.querySelector('#seat-map');if(!map)return;
 const params=new URLSearchParams(location.search);
 const session=read('ct-session',{date:'Hoje',time:'19:30',room:'Sala 02',format:'2D',roomType:'Tradicional'});
 const title=document.querySelector('#seat-movie-title');
 const continueButton=document.querySelector('#continue-checkout');
 try {
  const films=await apiListMovies();
  const film=films.find(item=>item.id===params.get('movie'));
  if(!film) {
   title.textContent='Filme indisponível';
   map.innerHTML='<p class="muted">Este filme não está disponível no catálogo. Volte e escolha um título ativo.</p>';
   document.querySelector('#seat-session-label').textContent='Não foi possível carregar uma sessão.';
   if(continueButton) continueButton.disabled=true;
   return;
  }
  const movie=mapMovie(film);
  title.textContent=movie.title;
  document.querySelector('#seat-session-label').textContent=`${session.date} · ${session.time} · ${session.roomType} · ${session.format}`;
  const occupied=new Set(['A4','A5','B7','C3','D8','E2','F6','G5']);
  const selectionKey=`ct-selected-seats:${movie.id}`;
  const storedSeats=read(selectionKey,[]);
  let selected=new Set(Array.isArray(storedSeats)?storedSeats.filter(id=>typeof id==='string'&&/^[A-H](?:[1-9]|10)$/.test(id)).slice(0,6):[]);
  const rows='ABCDEFGH'.split('');
  map.innerHTML=rows.map((row,ri)=>`<div class="seat-row"><span class="row-label">${row}</span>${Array.from({length:10},(_,i)=>{const id=row+(i+1),premium=ri>=6;return `<button class="seat ${premium?'premium':''} ${occupied.has(id)?'occupied':''} ${selected.has(id)?'selected':''}" data-seat="${id}" ${occupied.has(id)?'disabled':''} aria-label="Poltrona ${id}">${i+1}</button>`}).join('')}</div>`).join('');
  const update=()=>{map.querySelectorAll('[data-seat]').forEach(b=>b.classList.toggle('selected',selected.has(b.dataset.seat)));document.querySelector('#selected-seats').textContent=selected.size?[...selected].sort().join(', '):'Nenhum assento';document.querySelector('#seat-total').textContent=money([...selected].reduce((sum,id)=>sum+(id[0]>='G'?42:30),0));continueButton.disabled=!selected.size;save(selectionKey,[...selected]);};
  map.addEventListener('click',e=>{const b=e.target.closest('[data-seat]');if(!b||b.disabled)return;if(selected.has(b.dataset.seat))selected.delete(b.dataset.seat);else if(selected.size<6)selected.add(b.dataset.seat);else alert('Você pode selecionar até 6 assentos por pedido.');update()});
  continueButton.addEventListener('click',()=>{save('ct-order',{movie:movie.title,movieId:movie.id,session,seats:[...selected],createdAt:new Date().toISOString()});location.href='checkout.html'});
  update();
 } catch(error) {
  title.textContent='Não foi possível carregar o filme';
  map.innerHTML=`<p class="muted">${escapeHTML(error.message)}. Volte ao catálogo e tente novamente.</p>`;
  if(continueButton) continueButton.disabled=true;
 }
}
function setupCheckout(){
 const form=document.querySelector('#checkout-form');if(!form)return;
 const order=read('ct-order',null);
 const seats=Array.isArray(order?.seats)?order.seats.filter(id=>typeof id==='string'&&/^[A-H](?:[1-9]|10)$/.test(id)).slice(0,6):[];
 if(!order||!order.movieId||!order.session||!seats.length){document.querySelector('#checkout-summary').innerHTML='<p class="muted">Nenhuma seleção encontrada. Volte ao catálogo e escolha seus lugares.</p>';form.hidden=true;return}
 const total=seats.reduce((sum,id)=>sum+(id[0]>='G'?42:30),0);
 document.querySelector('#checkout-summary').innerHTML=`<div class="summary-row"><span>Filme</span><strong>${escapeHTML(order.movie)}</strong></div><div class="summary-row"><span>Sessão</span><strong>${escapeHTML(order.session.time)} · ${escapeHTML(order.session.format)}</strong></div><div class="summary-row"><span>Assentos</span><strong>${escapeHTML(seats.join(', '))}</strong></div><div class="summary-row"><span>Ingressos</span><strong>${seats.length} ×</strong></div>`;
 document.querySelector('#checkout-total').textContent=money(total);
 form.addEventListener('submit',e=>{
  e.preventDefault();
  const button=form.querySelector('button[type="submit"]');
  if(button.disabled)return;
  button.disabled=true;
  const tickets=read('ct-tickets',[]);
  const safeTickets=Array.isArray(tickets)?tickets:[];
  const ticket={...order,total,name:document.querySelector('#customer-name').value.trim(),email:document.querySelector('#customer-email').value.trim(),code:'CT-'+Math.random().toString(36).slice(2,8).toUpperCase()};
  try{
   save('ct-tickets',[ticket,...safeTickets]);
   localStorage.removeItem(`ct-selected-seats:${order.movieId}`);
   localStorage.removeItem('ct-order');
   location.href='ingressos.html?confirmed=1';
  }catch(error){
   button.disabled=false;
   setFeedback(document.querySelector('#checkout-summary'),'Não foi possível salvar o ingresso neste navegador. Verifique o armazenamento local e tente novamente.','error');
  }
 });
}
function setupTickets(){
 const list=document.querySelector('#tickets-list');if(!list)return;const tickets=read('ct-tickets',[]);
 if(new URLSearchParams(location.search).has('confirmed'))list.insertAdjacentHTML('beforebegin','<div class="notice">Ingresso demonstrativo confirmado! Você pode consultar os detalhes abaixo.</div>');
 list.innerHTML=tickets.length?tickets.map(t=>`<article class="ticket-item"><div><strong>${escapeHTML(t.movie)}</strong><p>${escapeHTML(t.session.date)} · ${escapeHTML(t.session.time)} · Assentos: ${escapeHTML(Array.isArray(t.seats)?t.seats.join(', '):'')}</p><p>${escapeHTML(t.name)} · ${money(t.total)}</p></div><span class="ticket-code">${escapeHTML(t.code)}</span></article>`).join(''):'<div class="panel"><p class="muted">Você ainda não tem ingressos confirmados neste navegador.</p><a class="button button-primary" href="../index.html">Explorar filmes →</a></div>';
}
function renderAdminMovies(films) {
 const list=document.querySelector('#admin-movie-list'); if(!list)return;
 adminMovies = films;
 list.innerHTML=films.length?films.map(f=>`
  <article class="admin-movie-entry" data-movie-id="${escapeHTML(f.id)}">
   <div class="admin-info">
    <span>${escapeHTML(f.titulo)} · ${escapeHTML(f.genero)}</span>
    <strong>${Number(f.duracaoMinutos)} min · ${escapeHTML(f.classificacaoIndicativa)}</strong>
   </div>
   <div class="admin-actions">
    <button class="admin-action" type="button" data-edit-movie>Editar</button>
    <button class="admin-action admin-action-danger" type="button" data-deactivate-movie>Desativar</button>
   </div>
   <form class="admin-edit-form" data-edit-form hidden>
    <label class="field-label">Título</label>
    <input class="text-field" name="titulo" required maxlength="120" value="${escapeHTML(f.titulo)}">
    <label class="field-label">Gênero</label>
    <input class="text-field" name="genero" required maxlength="60" value="${escapeHTML(f.genero)}">
    <label class="field-label">Duração (minutos)</label>
    <input class="text-field" name="duracaoMinutos" type="number" min="1" max="600" step="1" required value="${Number(f.duracaoMinutos)}">
    <label class="field-label">Classificação indicativa</label>
    <input class="text-field" name="classificacaoIndicativa" required maxlength="30" value="${escapeHTML(f.classificacaoIndicativa)}">
    <label class="field-label">Sinopse</label>
    <textarea class="text-field" name="sinopse" rows="3" maxlength="2000" required>${escapeHTML(f.sinopse)}</textarea>
    <div class="admin-actions">
     <button class="admin-action admin-action-primary" type="submit">Salvar alterações</button>
     <button class="admin-action" type="button" data-cancel-edit>Cancelar</button>
    </div>
   </form>
  </article>`).join(''):'<p class="muted">Nenhum filme ativo cadastrado.</p>';
}
async function loadAdminMovies() {
 const list=document.querySelector('#admin-movie-list'); if(!list)return;
 list.innerHTML='<p class="muted">Carregando catálogo...</p>';
 try { renderAdminMovies(await apiListMovies()); }
 catch(error) { list.textContent='Não foi possível consultar a API: '+error.message; }
}
function setupAdmin(){
 const form=document.querySelector('#admin-movie-form');if(!form)return;
 const feedback=document.querySelector('#admin-feedback');
 const list=document.querySelector('#admin-movie-list');
 loadAdminMovies();
 form.addEventListener('submit',async e=>{
  e.preventDefault();
  const button=form.querySelector('button[type="submit"]');
  const payload={
   titulo:document.querySelector('#admin-title').value.trim(),
   genero:document.querySelector('#admin-genre').value,
   duracaoMinutos:Number(document.querySelector('#admin-duration').value),
   classificacaoIndicativa:document.querySelector('#admin-rating').value,
   sinopse:document.querySelector('#admin-synopsis').value.trim(),
   ativo:true
  };
  if(!payload.titulo||!payload.sinopse||!Number.isInteger(payload.duracaoMinutos)||payload.duracaoMinutos<1||payload.duracaoMinutos>600) {
   setFeedback(feedback,'Preencha todos os campos corretamente. A duração deve estar entre 1 e 600 minutos.','error');return;
  }
  button.disabled=true;button.textContent='Salvando...';
  try {
   await apiRequest('/api/filmes',{method:'POST',body:JSON.stringify(payload)});
   form.reset();
   setFeedback(feedback,'Filme cadastrado no banco de dados com sucesso.');
   await loadAdminMovies();
  } catch(error) {
   setFeedback(feedback,'Não foi possível cadastrar o filme: '+error.message,'error');
  } finally { button.disabled=false;button.textContent='Adicionar filme'; }
 });
 list.addEventListener('click',async e=>{
  const editButton=e.target.closest('[data-edit-movie]');
  const cancelButton=e.target.closest('[data-cancel-edit]');
  const deactivateButton=e.target.closest('[data-deactivate-movie]');
  const entry=e.target.closest('.admin-movie-entry');
  if(!entry)return;
  if(editButton){
   entry.querySelector('[data-edit-form]').hidden=false;
   editButton.hidden=true;
   return;
  }
  if(cancelButton){
   entry.querySelector('[data-edit-form]').hidden=true;
   entry.querySelector('[data-edit-movie]').hidden=false;
   return;
  }
  if(deactivateButton){
   const movie=adminMovies.find(item=>item.id===entry.dataset.movieId);
   if(!movie||!confirm(`Desativar "${movie.titulo}"? Ele deixará de aparecer no catálogo, mas continuará salvo no banco de dados.`))return;
   deactivateButton.disabled=true;
   try{
    await apiRequest(`/api/filmes/${encodeURIComponent(movie.id)}`,{method:'DELETE'});
    setFeedback(feedback,`Filme "${movie.titulo}" desativado. O registro foi preservado no banco de dados.`);
    await loadAdminMovies();
   }catch(error){
    setFeedback(feedback,'Não foi possível desativar o filme: '+error.message,'error');
    deactivateButton.disabled=false;
   }
  }
 });
 list.addEventListener('submit',async e=>{
  const editForm=e.target.closest('[data-edit-form]');
  if(!editForm)return;
  e.preventDefault();
  const entry=editForm.closest('.admin-movie-entry');
  const movie=adminMovies.find(item=>item.id===entry.dataset.movieId);
  if(!movie)return;
  const button=editForm.querySelector('button[type="submit"]');
  const payload={
   titulo:editForm.elements.titulo.value.trim(),
   genero:editForm.elements.genero.value.trim(),
   duracaoMinutos:Number(editForm.elements.duracaoMinutos.value),
   classificacaoIndicativa:editForm.elements.classificacaoIndicativa.value.trim(),
   sinopse:editForm.elements.sinopse.value.trim(),
   ativo:true
  };
  if(!payload.titulo||!payload.genero||!payload.classificacaoIndicativa||!payload.sinopse||!Number.isInteger(payload.duracaoMinutos)||payload.duracaoMinutos<1||payload.duracaoMinutos>600){
   setFeedback(feedback,'Revise os campos. A duração deve estar entre 1 e 600 minutos.','error');return;
  }
  button.disabled=true;button.textContent='Salvando...';
  try{
   await apiRequest(`/api/filmes/${encodeURIComponent(movie.id)}`,{method:'PUT',body:JSON.stringify(payload)});
   setFeedback(feedback,`Filme "${payload.titulo}" atualizado com sucesso.`);
   await loadAdminMovies();
  }catch(error){
   setFeedback(feedback,'Não foi possível editar o filme: '+error.message,'error');
   button.disabled=false;button.textContent='Salvar alterações';
  }
 });
}
document.addEventListener('DOMContentLoaded',()=>{setupCatalog();setupSeats();setupCheckout();setupTickets();setupAdmin()});
