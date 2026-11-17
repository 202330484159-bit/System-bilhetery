CREATE TABLE filmes (
    id UUID PRIMARY KEY,
    titulo VARCHAR(120) NOT NULL,
    genero VARCHAR(60) NOT NULL,
    duracao_minutos INTEGER NOT NULL CHECK (duracao_minutos BETWEEN 1 AND 600),
    classificacao_indicativa VARCHAR(30) NOT NULL,
    sinopse VARCHAR(2000) NOT NULL,
    ativo BOOLEAN NOT NULL DEFAULT TRUE,
    criado_em TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_filmes_ativos_titulo ON filmes (ativo, titulo);