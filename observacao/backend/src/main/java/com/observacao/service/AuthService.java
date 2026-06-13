package com.observacao.service;

import com.observacao.dto.request.AuthDTOs;
import com.observacao.dto.response.ResponseDTOs;
import com.observacao.entity.RefreshToken;
import com.observacao.entity.Usuario;
import com.observacao.exception.BusinessException;
import com.observacao.repository.RefreshTokenRepository;
import com.observacao.repository.UsuarioRepository;
import com.observacao.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UsuarioRepository usuarioRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    @Value("${jwt.refresh-expiration-ms}")
    private long refreshExpirationMs;

    @Transactional
    public ResponseDTOs.AuthResponse login(AuthDTOs.LoginRequest request) {
        var usuario = usuarioRepository.findByEmail(request.getEmail())
            .orElseThrow(() -> new BusinessException("Email ou senha incorretos"));

        if (!usuario.isAtivo()) throw new BusinessException("Conta desativada");
        if (!passwordEncoder.matches(request.getSenha(), usuario.getSenhaHash())) {
            throw new BusinessException("Email ou senha incorretos");
        }

        return buildAuthResponse(usuario);
    }

    @Transactional
    public ResponseDTOs.AuthResponse register(AuthDTOs.RegisterRequest request) {
        if (usuarioRepository.existsByEmail(request.getEmail())) {
            throw new BusinessException("Email já cadastrado");
        }

        var perfil = "ADMIN".equalsIgnoreCase(request.getPerfil())
            ? Usuario.Perfil.ADMIN
            : Usuario.Perfil.CIDADAO;

        var usuario = Usuario.builder()
            .nome(request.getNome())
            .email(request.getEmail())
            .senhaHash(passwordEncoder.encode(request.getSenha()))
            .perfil(perfil)
            .ativo(true)
            .build();

        usuarioRepository.save(usuario);
        return buildAuthResponse(usuario);
    }

    @Transactional
    public ResponseDTOs.AuthResponse refresh(AuthDTOs.RefreshRequest request) {
        var rt = refreshTokenRepository.findByTokenAndRevogadoFalse(request.getRefreshToken())
            .orElseThrow(() -> new BusinessException("Refresh token inválido ou expirado"));

        if (rt.getExpiraEm().isBefore(OffsetDateTime.now())) {
            rt.setRevogado(true);
            throw new BusinessException("Refresh token expirado");
        }

        // Rotação: revoga o atual, emite novo
        rt.setRevogado(true);
        return buildAuthResponse(rt.getUsuario());
    }

    @Transactional
    public void logout(Usuario usuario) {
        refreshTokenRepository.revogarTodosPorUsuario(usuario);
    }

    private ResponseDTOs.AuthResponse buildAuthResponse(Usuario usuario) {
        String accessToken = jwtUtil.generateToken(
            usuario.getId(), usuario.getEmail(), usuario.getPerfil().name()
        );

        String refreshTokenValue = UUID.randomUUID().toString() + UUID.randomUUID();
        var rt = RefreshToken.builder()
            .usuario(usuario)
            .token(refreshTokenValue)
            .expiraEm(OffsetDateTime.now().plusNanos(refreshExpirationMs * 1_000_000L))
            .build();
        refreshTokenRepository.save(rt);

        return ResponseDTOs.AuthResponse.builder()
            .accessToken(accessToken)
            .refreshToken(refreshTokenValue)
            .usuario(ResponseDTOs.UsuarioResponse.from(usuario))
            .build();
    }
}
