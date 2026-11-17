package br.com.cinetickets.filme;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/filmes")
public class FilmeController {
    private final FilmeService service;
    public FilmeController(FilmeService service) { this.service = service; }

    @GetMapping
    public List<FilmeResponse> listar(@RequestParam(defaultValue = "false") boolean todos,
                                      Authentication authentication) {
        if (todos && (authentication == null || authentication.getAuthorities().stream()
                .noneMatch(a -> a.getAuthority().equals("ROLE_ADMIN")))) {
            throw new AccessDeniedException("A consulta de filmes inativos exige perfil ADMIN.");
        }
        return service.listar(todos);
    }
    @GetMapping("/{id}")
    public FilmeResponse buscar(@PathVariable UUID id) { return service.buscar(id); }
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public FilmeResponse criar(@Valid @RequestBody FilmeRequest request) { return service.criar(request); }
    @PutMapping("/{id}")
    public FilmeResponse atualizar(@PathVariable UUID id, @Valid @RequestBody FilmeRequest request) {
        return service.atualizar(id, request);
    }
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void excluir(@PathVariable UUID id) { service.excluir(id); }
}