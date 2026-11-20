package br.com.cinetickets.config;

import br.com.cinetickets.usuario.Usuario;
import br.com.cinetickets.usuario.UsuarioRepository;
import io.jsonwebtoken.JwtException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import java.io.IOException;
import java.util.List;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {
    private final JwtService jwtService;
    private final UsuarioRepository usuarios;

    public JwtAuthenticationFilter(JwtService jwtService, UsuarioRepository usuarios) {
        this.jwtService = jwtService;
        this.usuarios = usuarios;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException {
        String header = request.getHeader("Authorization");
        if (header != null && header.startsWith("Bearer ")) {
            String token = header.substring(7).trim();
            try {
                String email = jwtService.extrairEmail(token);
                if (email != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                    usuarios.findByEmailIgnoreCase(email)
                            .filter(Usuario::isAtivo)
                            .filter(usuario -> "ADMIN".equals(usuario.getPerfil()))
                            .ifPresent(usuario -> {
                                var authentication = new UsernamePasswordAuthenticationToken(
                                        usuario.getEmail(), null,
                                        List.of(new SimpleGrantedAuthority("ROLE_" + usuario.getPerfil())));
                                SecurityContextHolder.getContext().setAuthentication(authentication);
                            });
                }
            } catch (JwtException | IllegalArgumentException ignored) {
                SecurityContextHolder.clearContext();
            }
        }
        chain.doFilter(request, response);
    }
}
