package com.guardianai.service;

import com.guardianai.model.*;
import com.guardianai.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.*;

@Slf4j
@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final UserSettingsRepository userSettingsRepository;
    private final TrustedContactRepository trustedContactRepository;
    private final BehaviourDataRepository behaviourDataRepository;
    private final DigitalTwinRepository digitalTwinRepository;
    private final RiskAssessmentRepository riskAssessmentRepository;
    private final SafetyAlertRepository safetyAlertRepository;
    private final EmergencyEventRepository emergencyEventRepository;
    private final LocationDataRepository locationDataRepository;
    private final SafetyTipRepository safetyTipRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        if (userRepository.count() > 0) {
            log.info("Data already seeded, skipping.");
            return;
        }

        User demo = userRepository.save(User.builder()
                .name("Demo User").email("demo@guardianai.local").phone("+911234567890")
                .password(passwordEncoder.encode("Demo@1234")).role(Role.USER).emergencyPin("1234")
                .monitoringEnabled(true).createdAt(LocalDateTime.now()).updatedAt(LocalDateTime.now()).build());

        User admin = userRepository.save(User.builder()
                .name("Admin").email("admin@guardianai.local").phone("+911234567891")
                .password(passwordEncoder.encode("Admin@1234")).role(Role.ADMIN)
                .monitoringEnabled(false).createdAt(LocalDateTime.now()).updatedAt(LocalDateTime.now()).build());

        User contact = userRepository.save(User.builder()
                .name("Trusted Contact").email("contact@guardianai.local").phone("+911234567892")
                .password(passwordEncoder.encode("Contact@1234")).role(Role.TRUSTED_CONTACT)
                .monitoringEnabled(false).createdAt(LocalDateTime.now()).updatedAt(LocalDateTime.now()).build());

        for (User u : List.of(demo, admin, contact)) {
            userSettingsRepository.save(UserSettings.builder()
                    .userId(u.getId()).riskSensitivity(60).alertTimeoutSeconds(30)
                    .locationSharing(true).monitoringEnabled(u.isMonitoringEnabled())
                    .notificationPreferences(Map.of("inApp", true, "sms", true, "email", true))
                    .privacyLevel("STANDARD").build());
        }

        trustedContactRepository.save(TrustedContact.builder()
                .userId(demo.getId()).name("Trusted Contact").relationship("Friend")
                .phone("+911234567892").email("contact@guardianai.local").priority(1)
                .notificationEnabled(true).createdAt(LocalDateTime.now()).build());
        trustedContactRepository.save(TrustedContact.builder()
                .userId(demo.getId()).name("Mom").relationship("Family")
                .phone("+911234567899").email("mom@example.com").priority(2)
                .notificationEnabled(true).createdAt(LocalDateTime.now()).build());

        double baseLat = 28.6139, baseLng = 77.2090;
        Random random = new Random(42);
        List<Integer> activeHours = new ArrayList<>();
        Map<String, Integer> freq = new HashMap<>();
        for (int i = 0; i < 60; i++) {
            ActivityType type = ActivityType.values()[random.nextInt(ActivityType.values().length - 1)];
            int hour = 7 + random.nextInt(14);
            activeHours.add(hour);
            freq.merge(type.name(), 1, Integer::sum);
            behaviourDataRepository.save(BehaviourData.builder()
                    .userId(demo.getId()).activityType(type)
                    .timestamp(LocalDateTime.now().minusHours(60 - i).withHour(hour))
                    .latitude(baseLat + (random.nextDouble() - 0.5) * 0.01)
                    .longitude(baseLng + (random.nextDouble() - 0.5) * 0.01)
                    .movementDuration(5 + random.nextInt(20))
                    .activityDuration(5 + random.nextInt(20))
                    .metadata(Map.of("seed", true))
                    .build());
        }

        digitalTwinRepository.save(DigitalTwin.builder()
                .userId(demo.getId())
                .baselineActiveHours(activeHours.stream().distinct().toList())
                .baselineMovementDuration(12)
                .baselineActivityFrequency(freq)
                .usualLocations(List.of(GeoPoint.builder().lat(baseLat).lng(baseLng).label("Home").build()))
                .riskThreshold(60).learningProgress(60).lastUpdated(LocalDateTime.now()).build());

        RiskAssessment assessment = riskAssessmentRepository.save(RiskAssessment.builder()
                .userId(demo.getId()).anomalyScore(72).riskLevel(RiskLevel.HIGH)
                .reasons(List.of("Location is 6.0 km from any usual location")).confidence(0.6)
                .source(RiskSource.LOCAL).timestamp(LocalDateTime.now()).build());

        SafetyAlert alert = safetyAlertRepository.save(SafetyAlert.builder()
                .userId(demo.getId()).riskAssessmentId(assessment.getId()).riskScore(72)
                .riskLevel(RiskLevel.HIGH).reasons(assessment.getReasons())
                .response(AlertResponse.PENDING).status(AlertStatus.OPEN)
                .createdAt(LocalDateTime.now()).simulated(false).build());

        LocationData location = locationDataRepository.save(LocationData.builder()
                .userId(demo.getId()).latitude(baseLat).longitude(baseLng).accuracy(5)
                .timestamp(LocalDateTime.now()).build());

        emergencyEventRepository.save(EmergencyEvent.builder()
                .userId(demo.getId()).triggerType(TriggerType.MANUAL_SOS).riskLevel(RiskLevel.CRITICAL)
                .locationId(location.getId()).status(EmergencyStatus.RESOLVED)
                .notifiedContactIds(trustedContactRepository.findByUserId(demo.getId()).stream().map(TrustedContact::getId).toList())
                .timeline(List.of(
                        TimelineEntry.builder().stage("Detection").detail("Seeded scenario").at(LocalDateTime.now()).build(),
                        TimelineEntry.builder().stage("Emergency Trigger").detail("Manual SOS triggered").at(LocalDateTime.now()).build(),
                        TimelineEntry.builder().stage("Contact Notification").detail("Contacts notified").at(LocalDateTime.now()).build(),
                        TimelineEntry.builder().stage("Resolution").detail("Resolved by user").at(LocalDateTime.now()).build()))
                .simulated(false).timestamp(LocalDateTime.now().minusHours(2)).build());

        seedSafetyTips();

        log.info("Seed data created: demo@guardianai.local / Demo@1234, admin@guardianai.local / Admin@1234, contact@guardianai.local / Contact@1234");
    }

    private void seedSafetyTips() {
        String[][] tips = {
                {"Share your live location", "Always share your live location with a trusted contact when travelling alone.", "Travel", "map-pin"},
                {"Avoid isolated routes at night", "Prefer well-lit, populated routes especially after dark.", "Travel", "moon"},
                {"Keep your phone charged", "Ensure your phone battery is sufficiently charged before heading out.", "Preparedness", "battery"},
                {"Save emergency contacts", "Keep at least 3 trusted contacts saved and reachable.", "Preparedness", "phonebook"},
                {"Use the SOS button confidently", "Do not hesitate to use the SOS feature if you feel unsafe.", "App Usage", "alert-triangle"},
                {"Enable monitoring while travelling", "Turn on AI monitoring so anomalies are detected automatically.", "App Usage", "activity"},
                {"Trust your instincts", "If a situation feels wrong, leave immediately and seek help.", "Personal Safety", "shield"},
                {"Learn basic self-defense", "Basic self-defense techniques can help in dangerous situations.", "Personal Safety", "shield-check"},
                {"Verify cab details", "Always verify the driver and vehicle number before boarding a cab.", "Transport", "car"},
                {"Sit behind the driver", "When in a cab, prefer sitting behind the driver for better visibility of exits.", "Transport", "car-front"},
                {"Know nearby safe places", "Identify police stations, hospitals, and safe public places on your route.", "Community", "building"},
                {"Join community safety groups", "Stay connected with local safety groups for real-time alerts.", "Community", "users"}
        };
        for (String[] t : tips) {
            safetyTipRepository.save(SafetyTip.builder()
                    .title(t[0]).description(t[1]).category(t[2]).icon(t[3]).createdAt(LocalDateTime.now()).build());
        }
    }
}
