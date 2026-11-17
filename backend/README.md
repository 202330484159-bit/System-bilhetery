# CineTickets API

Backend REST em Java 21 + Spring Boot 3.5 + PostgreSQL.

## Requisitos
- JDK 21
- Maven 3.9+
- Docker e Docker Compose

## Banco e execução
Na pasta `backend/`:

```bash
docker compose up -d
mvn spring-boot:run
```

A API inicia em `http://localhost:8080`. Flyway aplica as migrações automaticamente.

## Configuração de segurança
Configure por variáveis de ambiente (não versione valores reais):

- `DB_URL`, `DB_USERNAME`, `DB_PASSWORD`
- `CORS_ALLOWED_ORIGINS`: origens exatas do frontend, separadas por vírgula
- `JWT_SECRET`: chave aleatória com pelo menos 32 bytes
- `JWT_EXPIRATION_MINUTES`: validade do token (padrão 60)
- `ADMIN_EMAIL` e `ADMIN_PASSWORD`: credenciais iniciais; senha com no mínimo 12 caracteres

Na primeira inicialização, se ADMIN_EMAIL e ADMIN_PASSWORD estiverem definidos, o sistema cria o administrador caso o e-mail ainda não exista. A senha é armazenada com BCrypt. A conta não é recriada nem tem a senha sobrescrita em inicializações seguintes.

Exemplo para gerar segredo local: `openssl rand -base64 48`. Não use os valores de exemplo em produção.

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

Após login, envie `Authorization: Bearer <token>` nas requisições administrativas. Tokens são stateless e expiram conforme JWT_EXPIRATION_MINUTES.

## Limitações desta etapa
A autenticação administrativa está implementada; cadastro público de clientes, recuperação de senha, revogação antecipada de JWT, salas, sessões, reservas e pagamentos ainda não fazem parte desta entrega. O fluxo de checkout continua demonstrativo e não deve ser tratado como venda real.
