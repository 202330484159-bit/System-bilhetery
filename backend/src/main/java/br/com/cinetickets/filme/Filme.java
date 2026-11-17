package br.com.cinetickets.filme;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "filmes")
public class Filme {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, length = 120)
    private String titulo;

    @Column(nullable = false, length = 60)
    private String genero;

    @Column(nullable = false)
    private Integer duracaoMinutos;

    @Column(nullable = false, length = 30)
    private String classificacaoIndicativa;

    @Column(nullable = false, length = 2000)
    private String sinopse;

    @Column(nullable = false)
    private boolean ativo = true;

    @Column(nullable = false, updatable = false)
    private Instant criadoEm = Instant.now();

    protected Filme() {}

    public Filme(String titulo, String genero, Integer duracaoMinutos, String classificacaoIndicativa, String sinopse) {
        this.titulo = titulo;
        this.genero = genero;
        this.duracaoMinutos = duracaoMinutos;
        this.classificacaoIndicativa = classificacaoIndicativa;
        this.sinopse = sinopse;
    }

    public void atualizar(String titulo, String genero, Integer duracaoMinutos, String classificacaoIndicativa, String sinopse, boolean ativo) {
        this.titulo = titulo;
        this.genero = genero;
        this.duracaoMinutos = duracaoMinutos;
        this.classificacaoIndicativa = classificacaoIndicativa;
        this.sinopse = sinopse;
        this.ativo = ativo;
    }

    public UUID getId() { return id; }
    public String getTitulo() { return titulo; }
    public String getGenero() { return genero; }
    public Integer getDuracaoMinutos() { return duracaoMinutos; }
    public String getClassificacaoIndicativa() { return classificacaoIndicativa; }
    public String getSinopse() { return sinopse; }
    public boolean isAtivo() { return ativo; }
    public Instant getCriadoEm() { return criadoEm; }
}