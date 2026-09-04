package com.guardianai.util;

import java.time.Duration;
import java.time.LocalDateTime;

public final class TimeUtils {

    private TimeUtils() {
    }

    public static boolean isOlderThanSeconds(LocalDateTime timestamp, long seconds) {
        if (timestamp == null) {
            return true;
        }
        return Duration.between(timestamp, LocalDateTime.now()).getSeconds() >= seconds;
    }

    public static long secondsBetween(LocalDateTime from, LocalDateTime to) {
        return Duration.between(from, to).getSeconds();
    }
}
