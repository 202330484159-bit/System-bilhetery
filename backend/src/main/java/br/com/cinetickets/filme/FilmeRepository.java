package br.com.cinetickets.filme;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface FilmeRepository extends JpaRepository<Filme, UUID> {
    List<Filme> findAllByAtivoTrueOrderByTituloAsc();
    Optional<Filme> findByIdAndAtivoTrue(UUID id);
}