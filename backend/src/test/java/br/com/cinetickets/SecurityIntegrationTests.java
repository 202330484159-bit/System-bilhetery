package br.com.cinetickets;

import br.com.cinetickets.usuario.Usuario;
import br.com.cinetickets.usuario.UsuarioRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import java.util.Map;
import java.util.UUID;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class SecurityIntegrationTests {
    @Autowired private MockMvc mockMvc;
    @Autowired private ObjectMapper objectMapper;
    @Autowired private UsuarioRepository usuarios;
    @Autowired private PasswordEncoder passwordEncoder;

    @Test
    void catalogoAtivoPermanecePublico() throws Exception {
        mockMvc.perform(get("/api/filmes")).andExpect(status().isOk());
    }

    @Test
    void operacaoAdministrativaSemTokenRetorna401() throws Exception {
        mockMvc.perform(post("/api/filmes").contentType(MediaType.APPLICATION_JSON).content(filmeValido()))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void tokenInvalidoRetorna401() throws Exception {
        mockMvc.perform(post("/api/filmes").header("Authorization", "Bearer token-invalido")
                        .contentType(MediaType.APPLICATION_JSON).content(filmeValido()))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void administradorAutenticadoPodeCadastrarFilme() throws Exception {
        String token = criarAdminEObterToken();
        mockMvc.perform(post("/api/filmes").header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON).content(filmeValido()))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.titulo").value("Filme de integração"));
    }

    @Test
    void tokenDeUsuarioDesativadoDeixaDeAutorizar() throws Exception {
        String email = "inativo-" + UUID.randomUUID() + "@cinetickets.local";
        String senha = "SenhaDeTesteSegura123!";
        Usuario usuario = usuarios.save(new Usuario(email, passwordEncoder.encode(senha), "ADMIN"));
        String token = obterToken(email, senha);
        usuario.desativar();
        usuarios.save(usuario);

        mockMvc.perform(post("/api/filmes").header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON).content(filmeValido()))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void dadosInvalidosRetornam400() throws Exception {
        String token = criarAdminEObterToken();
        mockMvc.perform(post("/api/filmes").header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"titulo":"","genero":"Drama","duracaoMinutos":0,
                                 "classificacaoIndicativa":"12 anos","sinopse":"Teste"}
                                """))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.erro").value("Dados inválidos"));
    }

    @Test
    void consultaDeInativosSemAdminRetorna403() throws Exception {
        mockMvc.perform(get("/api/filmes").param("todos", "true"))
                .andExpect(status().isForbidden());
    }

    private String criarAdminEObterToken() throws Exception {
        String email = "admin-" + UUID.randomUUID() + "@cinetickets.local";
        String senha = "SenhaDeTesteSegura123!";
        usuarios.save(new Usuario(email, passwordEncoder.encode(senha), "ADMIN"));
        return obterToken(email, senha);
    }

    private String obterToken(String email, String senha) throws Exception {
        MvcResult result = mockMvc.perform(post("/api/auth/login").contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of("email", email, "senha", senha))))
                .andExpect(status().isOk()).andReturn();
        JsonNode body = objectMapper.readTree(result.getResponse().getContentAsString());
        return body.get("token").asText();
    }

    private String filmeValido() {
        return """
                {"titulo":"Filme de integração","genero":"Drama","duracaoMinutos":110,
                 "classificacaoIndicativa":"12 anos","sinopse":"Filme usado nos testes automatizados.",
                 "ativo":true}
                """;
    }
}
