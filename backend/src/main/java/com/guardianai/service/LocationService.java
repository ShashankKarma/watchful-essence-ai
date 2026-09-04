package com.guardianai.service;

import com.guardianai.dto.LocationRequest;
import com.guardianai.exception.ResourceNotFoundException;
import com.guardianai.model.LocationData;
import com.guardianai.repository.LocationDataRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class LocationService {

    private final LocationDataRepository locationDataRepository;

    public LocationData record(String userId, LocationRequest request) {
        LocationData location = LocationData.builder()
                .userId(userId)
                .latitude(request.getLatitude())
                .longitude(request.getLongitude())
                .accuracy(request.getAccuracy())
                .timestamp(LocalDateTime.now())
                .build();
        return locationDataRepository.save(location);
    }

    public LocationData current(String userId) {
        return locationDataRepository.findTopByUserIdOrderByTimestampDesc(userId)
                .orElseThrow(() -> new ResourceNotFoundException("No location data available"));
    }

    public List<LocationData> history(String userId) {
        return locationDataRepository.findByUserIdOrderByTimestampDesc(userId);
    }
}
