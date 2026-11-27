# CineTickets

Sistema demonstrativo de bilheteria de cinema, com API REST em Java/Spring Boot, frontend estático e um protótipo legado em Java Swing.

## Estrutura
- backend/: API REST, autenticação administrativa JWT, persistência PostgreSQL/Supabase e testes automatizados.
- web/: catálogo, painel administrativo e fluxos demonstrativos de assentos, checkout e ingressos.
- Cinema.java: protótipo legado Swing independente do backend web.

## Backend
Requisitos: JDK 21 e Maven 3.9+.

Na pasta backend:
```bash
mvn test
mvn spring-boot:run
```

Os testes automatizados usam H2 em memória. Para executar a API, configure DB_URL e JWT_SECRET no ambiente. Consulte backend/README.md para a configuração do Supabase.

## Estado do produto
O catálogo e a administração de filmes estão integrados à API. Seleção de assentos, checkout e ingressos continuam demonstrativos e não representam reservas ou pagamentos reais.
