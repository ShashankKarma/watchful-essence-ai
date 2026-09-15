package com.guardianai.controller;

import com.guardianai.dto.ApiResponse;
import com.guardianai.dto.TrustedContactRequest;
import com.guardianai.model.TrustedContact;
import com.guardianai.model.User;
import com.guardianai.service.TrustedContactService;
import com.guardianai.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/contacts")
@RequiredArgsConstructor
public class TrustedContactController {
    private final TrustedContactService contactService;
    private final UserService userService;

    private String userId(Principal principal) {
        User user = userService.getUserByEmail(principal.getName());
        return user.getId();
    }

    @GetMapping
    public ApiResponse<List<TrustedContact>> list(Principal principal) {
        return ApiResponse.ok(contactService.list(userId(principal)));
    }

    @PostMapping
    public ApiResponse<TrustedContact> create(Principal principal,
                                               @Valid @RequestBody TrustedContactRequest request) {
        return ApiResponse.ok(contactService.create(userId(principal), request));
    }

    @PutMapping("/{id}")
    public ApiResponse<TrustedContact> update(Principal principal, @PathVariable String id,
                                               @RequestBody TrustedContactRequest request) {
        return ApiResponse.ok(contactService.update(userId(principal), id, request));
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Map<String, Boolean>> delete(Principal principal, @PathVariable String id) {
        contactService.delete(userId(principal), id);
        return ApiResponse.ok(Map.of("success", true));
    }
}