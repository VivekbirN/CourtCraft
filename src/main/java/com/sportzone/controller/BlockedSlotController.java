package com.sportzone.controller;

import com.sportzone.dto.ApiResponse;
import com.sportzone.dto.BlockedSlotDto;
import com.sportzone.service.BlockedSlotService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/v1/blocked-slots")
@PreAuthorize("hasRole('ADMIN')")
public class BlockedSlotController {

    private final BlockedSlotService blockedSlotService;

    public BlockedSlotController(BlockedSlotService blockedSlotService) {
        this.blockedSlotService = blockedSlotService;
    }


    @PostMapping
    public ResponseEntity<ApiResponse<BlockedSlotDto.BlockedSlotResponse>> createBlockedSlot(
            @Valid @RequestBody BlockedSlotDto.CreateBlockedSlotRequest request
    ) {
        String adminEmail = getCurrentUserEmail();
        BlockedSlotDto.BlockedSlotResponse response = blockedSlotService.createBlockedSlot(request, adminEmail);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(response, "Blocked slot created successfully"));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<BlockedSlotDto.BlockedSlotResponse>>> getAllBlockedSlots() {
        List<BlockedSlotDto.BlockedSlotResponse> slots = blockedSlotService.getAllBlockedSlots();
        return ResponseEntity.ok(ApiResponse.success(slots, "Blocked slots retrieved successfully"));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteBlockedSlot(@PathVariable Integer id) {
        blockedSlotService.deleteBlockedSlot(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Blocked slot unblocked successfully"));
    }

    private String getCurrentUserEmail() {
        return SecurityContextHolder.getContext().getAuthentication().getName();
    }
}
