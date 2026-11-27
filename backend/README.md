# CineTickets API

Backend REST em Java 21 + Spring Boot + PostgreSQL.

## Requisitos
- JDK 21
- Maven 3.9+
- Projeto Supabase (recomendado) ou PostgreSQL local

## Conexão com Supabase
1. No Supabase, abra Connect → Session Pooler → JDBC e copie a URL JDBC.
2. Confirme que a conexão usa SSL (sslmode=require) e a porta do Session Pooler (5432).
3. No GitHub, abra Settings → Secrets and variables → Codespaces e crie o secret DB_URL com a URL JDBC completa.
4. Reinicie o Codespace para carregar o secret.

A URL JDBC contém credenciais. Nunca a coloque no código, commits, prints ou mensagens. Não compartilhe DB_URL, JWT_SECRET ou senhas.

Na pasta backend, inicie a API com:

```bash
mvn spring-boot:run
```

O backend não precisa de banco local quando DB_URL aponta para o Supabase.

## Configuração
Configure por variáveis de ambiente:
- DB_URL: URL JDBC completa do banco.
- CORS_ALLOWED_ORIGINS: origens exatas do frontend, separadas por vírgula.
- JWT_SECRET: segredo aleatório com pelo menos 32 bytes. É obrigatório; não existe segredo padrão seguro.
- JWT_EXPIRATION_MINUTES: validade do token, entre 1 e 1440 minutos (padrão 60).
- ADMIN_EMAIL e ADMIN_PASSWORD: credenciais para criar o primeiro administrador; senha com no mínimo 12 caracteres e no máximo 72 bytes UTF-8.

Exemplo para gerar segredo: openssl rand -base64 48. Nunca versione o valor real.

O primeiro administrador é criado apenas se o e-mail ainda não existir. A senha é armazenada com BCrypt. Alterar os Secrets depois não redefine a senha de uma conta existente.

## Testes automatizados
Os testes usam H2 em memória e não precisam conectar ao Supabase:

```bash
mvn test
```

## Endpoints
| Método | Endpoint | Acesso |
|---|---|---|
| POST | /api/auth/login | Público |
| GET | /api/filmes | Público, apenas ativos |
| GET | /api/filmes/{id} | Público |
| GET | /api/filmes?todos=true | ADMIN |
| POST | /api/filmes | ADMIN |
| PUT | /api/filmes/{id} | ADMIN |
| DELETE | /api/filmes/{id} | ADMIN |

O servidor verifica assinatura, expiração e situação ativa/perfil do usuário no banco em cada requisição protegida.

## Banco de dados
Flyway controla as migrações. O Hibernate usa ddl-auto: validate, portanto valida o mapeamento sem alterar tabelas automaticamente. A configuração atual usa baseline-on-migrate: true e baseline-version: 1. Em um banco vazio, o Flyway executa V1 e V2 normalmente. Em um banco não vazio sem histórico do Flyway, ele registra um baseline na versão 1 e executa as migrações posteriores (como V2); por isso, o esquema legado precisa já corresponder ao conteúdo esperado após V1. Se o banco já possui a tabela flyway_schema_history, o histórico registrado é a referência para decidir quais migrações executar, e alterar baseline-version não reescreve esse histórico. Antes de reutilizar a aplicação em outro banco, confira o esquema e o histórico existentes; nunca edite uma migration que já tenha sido aplicada.

## Limitações funcionais
Esta entrega cobre autenticação administrativa e catálogo de filmes. Cadastro de clientes, recuperação de senha, revogação antecipada de JWT, salas, sessões, reservas, pagamento e emissão de ingressos ainda não estão implementados. O checkout do frontend é demonstrativo e não processa vendas reais.
