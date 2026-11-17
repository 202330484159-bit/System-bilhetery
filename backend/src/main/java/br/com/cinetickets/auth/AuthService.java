package br.com.cinetickets.auth;

import br.com.cinetickets.config.JwtService;
import br.com.cinetickets.usuario.UsuarioRepository;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {
    private final UsuarioRepository usuarios;
    private final PasswordEncoder encoder;
    private final JwtService jwt;

    public AuthService(UsuarioRepository usuarios, PasswordEncoder encoder, JwtService jwt) {
        this.usuarios = usuarios; this.encoder = encoder; this.jwt = jwt;
    }
    public LoginResponse login(LoginRequest request) {
        var usuario = usuarios.findByEmailIgnoreCase(request.email().trim())
            .filter(u -> u.isAtivo() && encoder.matches(request.senha(), u.getSenhaHash()))
            .orElseThrow(() -> new BadCredentialsException("E-mail ou senha inválidos."));
        return new LoginResponse(jwt.gerar(usuario.getEmail(), usuario.getPerfil()),
            "Bearer", jwt.getExpirationSeconds(), usuario.getEmail(), usuario.getPerfil());
    }
}