package com.guardianai.service;

import com.guardianai.model.MonitoringSession;
import com.guardianai.model.User;
import com.guardianai.repository.MonitoringSessionRepository;
import com.guardianai.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class MonitoringService {

    private final MonitoringSessionRepository monitoringSessionRepository;
    private final UserRepository userRepository;

    public MonitoringSession start(String userId) {
        return monitoringSessionRepository.findByUserIdAndActiveTrue(userId).orElseGet(() -> {
            User user = userRepository.findById(userId).orElseThrow();
            user.setMonitoringEnabled(true);
            userRepository.save(user);

            MonitoringSession session = MonitoringSession.builder()
                    .userId(userId)
                    .startedAt(LocalDateTime.now())
                    .active(true)
                    .behaviourCount(0)
                    .build();
            return monitoringSessionRepository.save(session);
        });
    }

    public MonitoringSession stop(String userId) {
        MonitoringSession session = monitoringSessionRepository.findByUserIdAndActiveTrue(userId).orElse(null);
        User user = userRepository.findById(userId).orElseThrow();
        user.setMonitoringEnabled(false);
        userRepository.save(user);

        if (session == null) {
            return null;
        }
        session.setActive(false);
        session.setEndedAt(LocalDateTime.now());
        return monitoringSessionRepository.save(session);
    }

    public MonitoringSession status(String userId) {
        return monitoringSessionRepository.findByUserIdAndActiveTrue(userId).orElse(null);
    }
}
