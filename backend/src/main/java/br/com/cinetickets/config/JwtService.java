package br.com.cinetickets.config;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Date;

@Service
public class JwtService {
    private static final long MAX_EXPIRATION_MINUTES = 24 * 60;
    private final SecretKey key;
    private final long expirationSeconds;

    public JwtService(@Value("${app.jwt.secret}") String secret,
                      @Value("${app.jwt.expiration-minutes:60}") long expirationMinutes) {
        byte[] bytes = secret.getBytes(StandardCharsets.UTF_8);
        if (bytes.length < 32)
            throw new IllegalArgumentException("JWT_SECRET deve ter pelo menos 32 bytes.");
        if (expirationMinutes < 1 || expirationMinutes > MAX_EXPIRATION_MINUTES)
            throw new IllegalArgumentException("JWT_EXPIRATION_MINUTES deve estar entre 1 e 1440.");
        this.key = Keys.hmacShaKeyFor(bytes);
        this.expirationSeconds = Math.multiplyExact(expirationMinutes, 60L);
    }

    public String gerar(String email, String perfil) {
        Instant agora = Instant.now();
        return Jwts.builder().subject(email).claim("perfil", perfil)
                .issuedAt(Date.from(agora))
                .expiration(Date.from(agora.plusSeconds(expirationSeconds)))
                .signWith(key).compact();
    }

    public String extrairEmail(String token) {
        return Jwts.parser().verifyWith(key).build().parseSignedClaims(token)
                .getPayload().getSubject();
    }

    public long getExpirationSeconds() { return expirationSeconds; }
}
