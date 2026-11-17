package br.com.cinetickets.filme;

import java.time.Instant;
import java.util.UUID;

public record FilmeResponse(
        UUID id, String titulo, String genero, Integer duracaoMinutos,
        String classificacaoIndicativa, String sinopse, boolean ativo, Instant criadoEm
) {
    public static FilmeResponse from(Filme filme) {
        return new FilmeResponse(filme.getId(), filme.getTitulo(), filme.getGenero(),
                filme.getDuracaoMinutos(), filme.getClassificacaoIndicativa(),
                filme.getSinopse(), filme.isAtivo(), filme.getCriadoEm());
    }
}