package com.sg.reparos.config;

import com.sg.reparos.security.JwtAuthenticationFilter;
import com.sg.reparos.service.UsuarioDetailsServiceImpl;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpMethod;
import org.springframework.web.cors.CorsConfiguration;

import java.util.List;

@Configuration
public class SecurityConfig {

    @Autowired
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    @Autowired
    private UsuarioDetailsServiceImpl userDetailsService;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable())
                // .cors(cors -> cors.configurationSource(request -> {
                // CorsConfiguration config = new CorsConfiguration();
                // config.setAllowedOriginPatterns(List.of("*"));
                // config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE"));
                // config.setAllowCredentials(true);
                // config.setAllowedHeaders(List.of("*"));
                // return config;
                // }))
                .cors(cors -> cors.configurationSource(request -> {
                    CorsConfiguration config = new CorsConfiguration();
                    config.setAllowedOrigins(List.of(
                            "https://plf-es-2025-1-ti3-898110-grupo-8-sg-sigma.vercel.app",
                            "http://localhost:3000" // adicione localhost aqui
                    ));
                    config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
                    config.setAllowedHeaders(List.of("Authorization", "Content-Type"));
                    config.setExposedHeaders(List.of("Authorization"));
                    config.setAllowCredentials(true);
                    return config;
                }))

                .authorizeHttpRequests(auth -> auth
                        // Swagger & Auth
                        .requestMatchers("/v3/api-docs/**", "/swagger-ui/**", "/swagger-ui.html").permitAll()
                        .requestMatchers("/api/auth/login", "/api/auth/logout").permitAll()

                        // Cadastro de usuários
                        .requestMatchers(HttpMethod.POST, "/api/usuarios").permitAll()

                        .requestMatchers("/").permitAll()

                        // Perfil do usuário
                        .requestMatchers("/api/usuarios/perfil").authenticated()

                        // Landing Page - públicos
                        .requestMatchers(HttpMethod.GET, "/api/tiposervico", "/api/avaliacoes").permitAll()

                        // Serviços (requer autenticação)
                        .requestMatchers(HttpMethod.GET, "/api/servicos/**").authenticated()

                        .requestMatchers(HttpMethod.POST, "/api/servicos").hasRole("CLIENTE")
                        .requestMatchers(HttpMethod.PUT, "/api/servicos/**").hasAnyRole("ADMIN", "CLIENTE")
                        .requestMatchers(HttpMethod.DELETE, "/api/servicos/**").hasRole("ADMIN")

                        // Painéis específicos
                        .requestMatchers("/api/admin/**").hasRole("ADMIN")
                        .requestMatchers("/api/cliente/**").hasRole("CLIENTE")
                        .requestMatchers("/api/notificacao/**").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/usuarios/cadastro").permitAll()
                        .anyRequest().authenticated())
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authConfig) throws Exception {
        return authConfig.getAuthenticationManager();
    }
}
