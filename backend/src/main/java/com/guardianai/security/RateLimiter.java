package com.guardianai.security;

import org.springframework.stereotype.Component;

import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

/**
 * Simple in-memory rate limiter (fixed window) suitable for a single-instance deployment/demo.
 */
@Component
public class RateLimiter {

    private static final long WINDOW_MS = 60_000;

    private final ConcurrentHashMap<String, Window> windows = new ConcurrentHashMap<>();

    private static class Window {
        long windowStart;
        AtomicInteger count = new AtomicInteger(0);

        Window(long windowStart) {
            this.windowStart = windowStart;
        }
    }

    public synchronized boolean isAllowed(String key, int maxRequestsPerMinute) {
        long now = System.currentTimeMillis();
        Window window = windows.computeIfAbsent(key, k -> new Window(now));

        if (now - window.windowStart > WINDOW_MS) {
            window.windowStart = now;
            window.count.set(0);
        }

        return window.count.incrementAndGet() <= maxRequestsPerMinute;
    }
}
