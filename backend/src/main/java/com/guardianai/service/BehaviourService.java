package com.guardianai.service;

import com.guardianai.ai.DigitalTwinService;
import com.guardianai.dto.BehaviourDataRequest;
import com.guardianai.model.BehaviourData;
import com.guardianai.model.DigitalTwin;
import com.guardianai.repository.BehaviourDataRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class BehaviourService {

    private final BehaviourDataRepository behaviourDataRepository;
    private final DigitalTwinService digitalTwinService;

    public BehaviourData record(String userId, BehaviourDataRequest request) {
        BehaviourData data = BehaviourData.builder()
                .userId(userId)
                .activityType(request.getActivityType())
                .timestamp(LocalDateTime.now())
                .latitude(request.getLatitude())
                .longitude(request.getLongitude())
                .movementDuration(request.getMovementDuration())
                .activityDuration(request.getActivityDuration())
                .metadata(request.getMetadata())
                .build();
        digitalTwinService.recordAndUpdate(data);
        return data;
    }

    public List<BehaviourData> history(String userId) {
        return behaviourDataRepository.findTop100ByUserIdOrderByTimestampDesc(userId);
    }

    public DigitalTwin baseline(String userId) {
        return digitalTwinService.getOrCreateTwin(userId);
    }
}
