(() => {
 const TOKEN_KEY = 'ct-admin-token';
 const DEFAULT_API_URL = window.location.hostname.endsWith('-5500.app.github.dev') ? `${window.location.protocol}//${window.location.hostname.replace(/-5500\\.app\\.github\\.dev$/, '-8080.app.github.dev')}` : 'http://localhost:8080';
 const apiBaseUrl = (window.CINETICKETS_API_URL || DEFAULT_API_URL).replace(/\\/+$/, '');
 const apiBase = new URL(apiBaseUrl, window.location.href);
 const apiPath = apiBase.pathname.replace(/\/+$/, '');
 const token = () => sessionStorage.getItem(TOKEN_KEY);
 const originalFetch = window.fetch.bind(window);

 const isApiRequest = rawUrl => {
  try {
   const target = new URL(rawUrl, window.location.href);
   return target.origin === apiBase.origin && target.pathname.startsWith(`${apiPath}/api/`);
  } catch {
   return false;
  }
 };

 window.fetch = (resource, options = {}) => {
  const url = typeof resource === 'string' ? resource : resource?.url;
  const headers = new Headers(options.headers || (resource instanceof Request ? resource.headers : undefined));
  if (url && isApiRequest(url)) {
   const jwt = token();
   if (jwt && !new URL(url, window.location.href).pathname.endsWith('/api/auth/login')) {
    headers.set('Authorization', 'Bearer ' + jwt);
   }
  }

  return originalFetch(resource, {...options, headers}).then(response => {
   if (response.status === 401 && token() && url && isApiRequest(url)) {
    sessionStorage.removeItem(TOKEN_KEY);
    if (location.pathname.includes('/admin')) location.reload();
   }
   return response;
  });
 };

 document.addEventListener('DOMContentLoaded', () => {
  const login = document.querySelector('#admin-login');
  if (!login) return;
  const content = document.querySelector('#admin-content');
  const logout = document.querySelector('#admin-logout');
  const form = document.querySelector('#admin-login-form');
  const feedback = document.querySelector('#admin-login-feedback');
  const showAuthenticated = () => {
   login.hidden = true;
   content.hidden = false;
   logout.hidden = false;
  };

  if (token()) showAuthenticated();
  else {
   login.hidden = false;
   content.hidden = true;
  }

  logout.addEventListener('click', () => {
   sessionStorage.removeItem(TOKEN_KEY);
   location.reload();
  });

  form.addEventListener('submit', async event => {
   event.preventDefault();
   const button = form.querySelector('button[type="submit"]');
   button.disabled = true;
   button.textContent = 'Entrando...';
   try {
    const response = await originalFetch(apiBaseUrl + '/api/auth/login', {
     method: 'POST',
     headers: {'Content-Type':'application/json','Accept':'application/json'},
     body: JSON.stringify({
      email: document.querySelector('#admin-login-email').value,
      senha: document.querySelector('#admin-login-password').value
     })
    });
    if (!response.ok) {
     throw new Error(response.status === 401
      ? 'E-mail ou senha inválidos.'
      : 'Não foi possível autenticar. Verifique a API.');
    }
    const data = await response.json();
    if (data.perfil !== 'ADMIN' || !data.token) {
     throw new Error('Esta conta não possui permissão administrativa.');
    }
    sessionStorage.setItem(TOKEN_KEY, data.token);
    location.reload();
   } catch (error) {
    feedback.textContent = error.message;
    feedback.className = 'notice error';
    feedback.hidden = false;
   } finally {
    button.disabled = false;
    button.textContent = 'Entrar';
   }
  });
 });
})();
