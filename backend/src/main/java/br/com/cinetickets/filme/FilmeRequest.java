package br.com.cinetickets.filme;

import jakarta.validation.constraints.*;

public record FilmeRequest(
        @NotBlank @Size(max = 120) String titulo,
        @NotBlank @Size(max = 60) String genero,
        @NotNull @Min(1) @Max(600) Integer duracaoMinutos,
        @NotBlank @Size(max = 30) String classificacaoIndicativa,
        @NotBlank @Size(max = 2000) String sinopse,
        Boolean ativo
) {}