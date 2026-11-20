package br.com.cinetickets.auth;

import br.com.cinetickets.config.JwtService;
import br.com.cinetickets.usuario.UsuarioRepository;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import java.nio.charset.StandardCharsets;

@Service
public class AuthService {
    private static final int BCRYPT_MAX_BYTES = 72;

    private final UsuarioRepository usuarios;
    private final PasswordEncoder encoder;
    private final JwtService jwt;

    public AuthService(UsuarioRepository usuarios, PasswordEncoder encoder, JwtService jwt) {
        this.usuarios = usuarios;
        this.encoder = encoder;
        this.jwt = jwt;
    }

    public LoginResponse login(LoginRequest request) {
        if (request.senha().getBytes(StandardCharsets.UTF_8).length > BCRYPT_MAX_BYTES) {
            throw new BadCredentialsException("E-mail ou senha inválidos.");
        }

        var usuario = usuarios.findByEmailIgnoreCase(request.email().trim())
                .filter(user -> user.isAtivo() && encoder.matches(request.senha(), user.getSenhaHash()))
                .orElseThrow(() -> new BadCredentialsException("E-mail ou senha inválidos."));

        return new LoginResponse(jwt.gerar(usuario.getEmail(), usuario.getPerfil()),
                "Bearer", jwt.getExpirationSeconds(), usuario.getEmail(), usuario.getPerfil());
    }
}
