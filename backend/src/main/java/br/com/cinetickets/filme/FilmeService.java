package br.com.cinetickets.filme;

import br.com.cinetickets.shared.RecursoNaoEncontradoException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.UUID;

@Service
@Transactional
public class FilmeService {
    private final FilmeRepository repository;

    public FilmeService(FilmeRepository repository) { this.repository = repository; }

    @Transactional(readOnly = true)
    public List<FilmeResponse> listar(boolean todos) {
        return (todos ? repository.findAll() : repository.findAllByAtivoTrueOrderByTituloAsc())
                .stream().map(FilmeResponse::from).toList();
    }

    @Transactional(readOnly = true)
    public FilmeResponse buscar(UUID id) {
        return FilmeResponse.from(encontrar(id));
    }

    @Transactional(readOnly = true)
    public FilmeResponse buscarAtivo(UUID id) {
        Filme filme = repository.findByIdAndAtivoTrue(id)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Filme não encontrado: " + id));
        return FilmeResponse.from(filme);
    }

    public FilmeResponse criar(FilmeRequest request) {
        Filme filme = new Filme(request.titulo().trim(), request.genero().trim(),
                request.duracaoMinutos(), request.classificacaoIndicativa().trim(), request.sinopse().trim());
        if (Boolean.FALSE.equals(request.ativo())) {
            filme.atualizar(request.titulo().trim(), request.genero().trim(), request.duracaoMinutos(),
                    request.classificacaoIndicativa().trim(), request.sinopse().trim(), false);
        }
        return FilmeResponse.from(repository.save(filme));
    }

    public FilmeResponse atualizar(UUID id, FilmeRequest request) {
        Filme filme = encontrar(id);
        filme.atualizar(request.titulo().trim(), request.genero().trim(), request.duracaoMinutos(),
                request.classificacaoIndicativa().trim(), request.sinopse().trim(),
                request.ativo() == null || request.ativo());
        return FilmeResponse.from(filme);
    }

    public void excluir(UUID id) {
        Filme filme = encontrar(id);
        filme.atualizar(filme.getTitulo(), filme.getGenero(), filme.getDuracaoMinutos(),
                filme.getClassificacaoIndicativa(), filme.getSinopse(), false);
    }

    private Filme encontrar(UUID id) {
        return repository.findById(id).orElseThrow(() -> new RecursoNaoEncontradoException("Filme não encontrado: " + id));
    }
}