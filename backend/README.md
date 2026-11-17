# CineTickets API

Backend REST em Java 21 + Spring Boot 3.5 + PostgreSQL.

## Requisitos
- JDK 21
- Maven 3.9+
- Conta/projeto Supabase (ou PostgreSQL local para desenvolvimento offline)

## Conexão com Supabase (recomendado)

O banco hospedado substitui a necessidade de iniciar PostgreSQL localmente no Codespaces.

1. Abra o projeto [CineTickets no Supabase](https://supabase.com/dashboard/project/ngpyocrtflfrszqczikb).
2. Clique em **Connect**.
3. Em **Session pooler**, selecione a aba **JDBC** e copie a URL.
4. Confirme que a URL contém `sslmode=require`. Use Session Pooler na porta `5432`; não use Transaction Pooler (`6543`) como datasource principal do Hibernate.
5. No GitHub, abra **Settings → Secrets and variables → Codespaces → New repository secret** e crie:
   - Nome: `DB_URL`
   - Valor: a URL JDBC completa copiada do Supabase, substituindo o marcador de senha pela senha do banco.
6. Reinicie o Codespace para carregar o secret.

A URL completa contém usuário e senha. **Nunca** coloque esse valor no código, em commits, prints ou mensagens. Se a senha tiver caracteres reservados (por exemplo `@`, `#`, `&` ou espaços), faça percent-encoding antes de inseri-la na URL. Se não souber a senha, redefina-a em **Supabase → Project Settings → Database** e atualize o secret.

Para o backend publicado, configure o mesmo `DB_URL` como variável secreta no serviço de hospedagem do backend. Secrets do Codespaces não são automaticamente compartilhados com a hospedagem.

### Inicialização no Codespaces

Na pasta `backend/`:

```bash
mvn spring-boot:run
```

Não é necessário executar `docker compose up` quando `DB_URL` aponta para o Supabase. Sem `DB_URL`, a configuração mantém o fallback local `jdbc:postgresql://localhost:5432/cinetickets`.

### Flyway e banco já provisionado

As tabelas `filmes` e `usuarios` já foram criadas no projeto Supabase a partir das migrações V1 e V2 do repositório. Por isso, a configuração inicial do Flyway usa baseline na versão 2 para esse banco não tentar recriar tabelas existentes. Em um banco vazio, as migrações V1 e V2 continuam sendo executadas normalmente; migrações futuras (V3+) serão aplicadas pelo Flyway.

O Hibernate usa `ddl-auto: validate`: ele valida o mapeamento, mas não altera o esquema. O backend conecta com o usuário PostgreSQL do Session Pooler; não use chave `service_role` nem chave de API do Supabase como senha do banco.

## Configuração de segurança

Configure por variáveis de ambiente (não versione valores reais):

- `DB_URL`: URL JDBC completa do Session Pooler, com `sslmode=require`
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
