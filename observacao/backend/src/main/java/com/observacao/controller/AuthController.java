package com.observacao.controller;

import com.observacao.dto.request.AuthDTOs;
import com.observacao.dto.response.ResponseDTOs;
import com.observacao.entity.Usuario;
import com.observacao.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<ResponseDTOs.AuthResponse> login(
            @Valid @RequestBody AuthDTOs.LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    public ResponseDTOs.AuthResponse register(
            @Valid @RequestBody AuthDTOs.RegisterRequest request) {
        return authService.register(request);
    }

    @PostMapping("/refresh")
    public ResponseEntity<ResponseDTOs.AuthResponse> refresh(
            @Valid @RequestBody AuthDTOs.RefreshRequest request) {
        return ResponseEntity.ok(authService.refresh(request));
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(@AuthenticationPrincipal Usuario usuario) {
        if (usuario != null) authService.logout(usuario);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/me")
    public ResponseDTOs.UsuarioResponse me(@AuthenticationPrincipal Usuario usuario) {
        return ResponseDTOs.UsuarioResponse.from(usuario);
    }
}
