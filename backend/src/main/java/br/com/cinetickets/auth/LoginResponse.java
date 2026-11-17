package br.com.cinetickets.auth;

public record LoginResponse(String token, String tipo, long expiraEmSegundos, String email, String perfil) {}