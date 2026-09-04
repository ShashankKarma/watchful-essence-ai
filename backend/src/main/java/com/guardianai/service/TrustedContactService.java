package com.guardianai.service;

import com.guardianai.dto.TrustedContactRequest;
import com.guardianai.exception.ResourceNotFoundException;
import com.guardianai.model.TrustedContact;
import com.guardianai.repository.TrustedContactRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class TrustedContactService {

    private final TrustedContactRepository trustedContactRepository;

    public List<TrustedContact> list(String userId) {
        return trustedContactRepository.findByUserIdOrderByPriorityAsc(userId);
    }

    public TrustedContact create(String userId, TrustedContactRequest request) {
        TrustedContact contact = TrustedContact.builder()
                .userId(userId)
                .name(request.getName())
                .relationship(request.getRelationship())
                .phone(request.getPhone())
                .email(request.getEmail())
                .priority(request.getPriority())
                .notificationEnabled(request.isNotificationEnabled())
                .createdAt(LocalDateTime.now())
                .build();
        return trustedContactRepository.save(contact);
    }

    public TrustedContact update(String userId, String id, TrustedContactRequest request) {
        TrustedContact contact = trustedContactRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Trusted contact not found"));
        if (!contact.getUserId().equals(userId)) {
            throw new ResourceNotFoundException("Trusted contact not found");
        }
        contact.setName(request.getName());
        contact.setRelationship(request.getRelationship());
        contact.setPhone(request.getPhone());
        contact.setEmail(request.getEmail());
        contact.setPriority(request.getPriority());
        contact.setNotificationEnabled(request.isNotificationEnabled());
        return trustedContactRepository.save(contact);
    }

    public void delete(String userId, String id) {
        TrustedContact contact = trustedContactRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Trusted contact not found"));
        if (!contact.getUserId().equals(userId)) {
            throw new ResourceNotFoundException("Trusted contact not found");
        }
        trustedContactRepository.deleteById(id);
    }
}
