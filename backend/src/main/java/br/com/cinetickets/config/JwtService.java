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
    private final SecretKey key;
    private final long expirationSeconds;

    public JwtService(@Value("${app.jwt.secret}") String secret,
                      @Value("${app.jwt.expiration-minutes:60}") long expirationMinutes) {
        byte[] bytes = secret.getBytes(StandardCharsets.UTF_8);
        if (bytes.length < 32) throw new IllegalArgumentException("JWT_SECRET deve ter pelo menos 32 bytes.");
        this.key = Keys.hmacShaKeyFor(bytes);
        this.expirationSeconds = expirationMinutes * 60;
        if (expirationSeconds < 60) throw new IllegalArgumentException("A validade do JWT deve ser de pelo menos 1 minuto.");
    }
    public String gerar(String email, String perfil) {
        Instant agora = Instant.now();
        return Jwts.builder().subject(email).claim("perfil", perfil)
            .issuedAt(Date.from(agora)).expiration(Date.from(agora.plusSeconds(expirationSeconds)))
            .signWith(key).compact();
    }
    public String extrairEmail(String token) {
        return Jwts.parser().verifyWith(key).build().parseSignedClaims(token).getPayload().getSubject();
    }
    public long getExpirationSeconds() { return expirationSeconds; }
}