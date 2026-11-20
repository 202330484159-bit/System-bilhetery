# CineTickets — Frontend

Frontend estático em HTML, CSS e JavaScript, sem etapa de build.

## Executar
Sirva a pasta web/ por um servidor HTTP local. Configure window.CINETICKETS_API_URL antes de carregar js/admin-auth.js e js/app.js para apontar para a URL HTTPS da API. Por exemplo, inclua um script de configuração antes dos scripts da aplicação:

```html
<script>window.CINETICKETS_API_URL = "https://sua-api.exemplo.com";</script>
```

Em produção, substitua o endereço de exemplo pela URL HTTPS real da API. O endereço de Codespaces usado como fallback é temporário e não deve ser utilizado em produção. No backend, configure CORS_ALLOWED_ORIGINS com a origem exata do site (protocolo + domínio + porta, sem caminho), por exemplo `https://seu-site.exemplo.com`. Requisições via curl não validam CORS; faça também um teste no navegador após configurar os dois lados.

## Estrutura
- index.html: catálogo público de filmes, busca e filtros.
- pages/assentos.html: protótipo local de seleção de assentos.
- pages/checkout.html: revisão e confirmação demonstrativa do pedido.
- pages/ingressos.html: ingressos demonstrativos salvos no navegador.
- admin/index.html: painel administrativo com login JWT e operações do catálogo.
- css/styles.css: identidade visual responsiva.
- js/admin-auth.js: login, logout e envio do token para a API.
- js/app.js: catálogo, administração e fluxos demonstrativos do cliente.

## Funcionalidades integradas
- O catálogo consulta os filmes ativos na API.
- O painel administrativo autentica por POST /api/auth/login.
- Cadastro, edição e desativação de filmes usam endpoints protegidos.
- O token fica em sessionStorage nesta versão. Isso reduz a persistência após fechar a aba, mas não protege contra JavaScript malicioso executado na mesma origem. Uma implantação pública deve avaliar cookies HttpOnly, Secure e SameSite, com proteção CSRF apropriada.

## Limitações conhecidas
- A seleção de assentos usa disponibilidade simulada no navegador e não impede reservas simultâneas.
- Checkout, preço, confirmação e ingressos são demonstrativos e ficam no localStorage.
- Não há pagamento real, conta de cliente, reserva persistente nem emissão de ingresso validável.
- Não trate dados locais como venda, reserva ou pagamento confirmado.
