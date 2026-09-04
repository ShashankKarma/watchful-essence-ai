package com.guardianai.ai;

import com.guardianai.model.BehaviourData;
import com.guardianai.model.DigitalTwin;
import com.guardianai.model.GeoPoint;
import com.guardianai.repository.BehaviourDataRepository;
import com.guardianai.repository.DigitalTwinRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class DigitalTwinService {

    private static final int MAX_LEARNING_SAMPLES = 100;
    private static final double CLUSTER_RADIUS_KM = 1.0;

    private final DigitalTwinRepository digitalTwinRepository;
    private final BehaviourDataRepository behaviourDataRepository;

    public DigitalTwin getOrCreateTwin(String userId) {
        return digitalTwinRepository.findByUserId(userId).orElseGet(() -> {
            DigitalTwin twin = DigitalTwin.builder()
                    .userId(userId)
                    .baselineActiveHours(new ArrayList<>())
                    .baselineMovementDuration(0)
                    .baselineActivityFrequency(new HashMap<>())
                    .usualLocations(new ArrayList<>())
                    .riskThreshold(60)
                    .learningProgress(0)
                    .lastUpdated(LocalDateTime.now())
                    .build();
            return digitalTwinRepository.save(twin);
        });
    }

    /**
     * Rebuilds baseline from historical behaviour data (up to 100 latest samples).
     */
    public DigitalTwin learnFromHistory(String userId) {
        DigitalTwin twin = getOrCreateTwin(userId);
        List<BehaviourData> history = behaviourDataRepository.findTop100ByUserIdOrderByTimestampDesc(userId);

        if (history.isEmpty()) {
            return twin;
        }

        List<Integer> hours = new ArrayList<>();
        Map<String, Integer> frequency = new HashMap<>();
        double totalDuration = 0;
        List<GeoPoint> clusters = new ArrayList<>();

        for (BehaviourData bd : history) {
            int hour = bd.getTimestamp().getHour();
            if (!hours.contains(hour)) {
                hours.add(hour);
            }
            frequency.merge(bd.getActivityType().name(), 1, Integer::sum);
            totalDuration += bd.getMovementDuration();

            boolean clustered = false;
            for (GeoPoint c : clusters) {
                double dist = com.guardianai.util.GeoUtils.haversineKm(bd.getLatitude(), bd.getLongitude(), c.getLat(), c.getLng());
                if (dist <= CLUSTER_RADIUS_KM) {
                    clustered = true;
                    break;
                }
            }
            if (!clustered && clusters.size() < 10) {
                clusters.add(GeoPoint.builder().lat(bd.getLatitude()).lng(bd.getLongitude()).label("Usual location").build());
            }
        }

        twin.setBaselineActiveHours(hours);
        twin.setBaselineActivityFrequency(frequency);
        twin.setBaselineMovementDuration(totalDuration / history.size());
        twin.setUsualLocations(clusters);
        twin.setLearningProgress(Math.min(100.0, (history.size() / (double) MAX_LEARNING_SAMPLES) * 100.0));
        twin.setLastUpdated(LocalDateTime.now());

        return digitalTwinRepository.save(twin);
    }

    public DigitalTwin recordAndUpdate(BehaviourData behaviourData) {
        behaviourDataRepository.save(behaviourData);
        return learnFromHistory(behaviourData.getUserId());
    }
}
