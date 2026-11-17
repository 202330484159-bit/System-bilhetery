# CineTickets API

Backend REST em Java 21 + Spring Boot 3.5 + PostgreSQL.

## Requisitos
- JDK 21
- Maven 3.9+
- Docker e Docker Compose (para subir o PostgreSQL)

## Iniciar o banco
Na pasta `backend/`:

```bash
docker compose up -d
```

As credenciais acima são apenas para desenvolvimento local. Altere-as antes de qualquer implantação.

## Executar a API
Na pasta `backend/`:

```bash
mvn spring-boot:run
```

API: `http://localhost:8080`

O Flyway cria a tabela inicial e o Hibernate valida o esquema. Configure `DB_URL`, `DB_USERNAME`, `DB_PASSWORD` e `CORS_ALLOWED_ORIGINS` por variáveis de ambiente quando necessário.

## Endpoints iniciais

| Método | Endpoint | Ação |
|---|---|---|
| GET | /api/filmes | Lista filmes ativos |
| GET | /api/filmes?todos=true | Lista todos, inclusive inativos |
| GET | /api/filmes/{id} | Consulta um filme |
| POST | /api/filmes | Cadastra filme |
| PUT | /api/filmes/{id} | Atualiza filme |
| DELETE | /api/filmes/{id} | Desativa filme (exclusão lógica) |

Exemplo de JSON para POST/PUT:

```json
{
  "titulo": "Órbita Final",
  "genero": "Ficção",
  "duracaoMinutos": 128,
  "classificacaoIndicativa": "12 anos",
  "sinopse": "Uma missão além das estrelas.",
  "ativo": true
}
```

## Organização
- `filme/`: entidade, DTOs, repositório, serviço e controller do catálogo.
- `config/`: configuração CORS.
- `shared/`: tratamento padronizado de erros.
- `resources/db/migration/`: histórico versionado do banco.

## Próximas entregas
1. Salas e configuração de assentos.
2. Sessões, formatos e preços por categoria.
3. Reserva transacional de assentos.
4. Pedidos e emissão de ingressos.
5. Autenticação e autorização administrativa.

Ainda não há autenticação, integração com pagamento nem reserva de assentos nesta primeira etapa. Não exponha a API publicamente antes de implementar esses controles.