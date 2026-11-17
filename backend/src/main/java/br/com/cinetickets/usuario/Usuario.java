package br.com.cinetickets.usuario;

import jakarta.persistence.*;
import java.util.UUID;

@Entity
@Table(name = "usuarios")
public class Usuario {
    @Id @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    @Column(nullable = false, unique = true, length = 180)
    private String email;
    @Column(name = "senha_hash", nullable = false, length = 100)
    private String senhaHash;
    @Column(nullable = false, length = 20)
    private String perfil;
    @Column(nullable = false)
    private boolean ativo = true;

    protected Usuario() {}
    public Usuario(String email, String senhaHash, String perfil) {
        this.email = email.toLowerCase().trim();
        this.senhaHash = senhaHash;
        this.perfil = perfil;
    }
    public UUID getId() { return id; }
    public String getEmail() { return email; }
    public String getSenhaHash() { return senhaHash; }
    public String getPerfil() { return perfil; }
    public boolean isAtivo() { return ativo; }
}