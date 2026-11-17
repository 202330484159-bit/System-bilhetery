# CineTickets — Frontend

Protótipo web inicial do sistema de bilheteria. O projeto Java Swing original permanece na raiz do repositório e não foi alterado.

## Executar
Abra `web/index.html` em um navegador. Não há dependências de build.

## Estrutura
- `index.html`: catálogo de filmes, busca e filtros.
- `pages/assentos.html`: mapa de assentos e seleção.
- `pages/checkout.html`: revisão e confirmação demonstrativa do pedido.
- `pages/ingressos.html`: ingressos confirmados no navegador.
- `admin/index.html`: painel demonstrativo para adicionar filmes.
- `css/styles.css`: identidade visual responsiva.
- `js/app.js`: interações e persistência local com localStorage.

## Regras e limites desta etapa
- Preços demonstrativos: R$ 30,00 (assento padrão) e R$ 42,00 (fileiras premium).
- Seleção limitada a 6 assentos por pedido.
- Salas (Tradicional, Premium, VIP) e formatos (2D, 3D, 4D, IMAX) são conceitos distintos.
- O protótipo não processa pagamentos, não autentica usuários e não reserva assentos em servidor.
- Para produção, implementar API/backend, banco de dados, autenticação, controle transacional de assentos e integração de pagamento.

## Próximas etapas
1. Definir modelo de dados de filmes, salas, sessões, assentos e pedidos.
2. Implementar API e autenticação administrativa.
3. Integrar disponibilidade de assentos em tempo real e gateway de pagamento.
4. Gerar ingresso digital com QR Code validável pelo servidor.
