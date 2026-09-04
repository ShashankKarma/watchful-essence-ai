package com.guardianai.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
@RequiredArgsConstructor
public class RateLimitingFilter extends OncePerRequestFilter {

    private final RateLimiter rateLimiter;

    @Override
    protected void doFilterInternal(@NonNull HttpServletRequest request,
                                     @NonNull HttpServletResponse response,
                                     @NonNull FilterChain filterChain) throws ServletException, IOException {
        String uri = request.getRequestURI();
        boolean limited = uri.equals("/api/auth/login") || uri.equals("/api/sos");

        if (limited) {
            String key = uri + ":" + request.getRemoteAddr();
            int limit = uri.equals("/api/sos") ? 10 : 20;
            if (!rateLimiter.isAllowed(key, limit)) {
                response.setStatus(429);
                response.setContentType("application/json");
                response.getWriter().write("{\"success\":false,\"message\":\"Too many requests, please try again later.\"}");
                return;
            }
        }

        filterChain.doFilter(request, response);
    }
}
