package com.sportzone.service;

import com.sportzone.dto.BlockedSlotDto;
import com.sportzone.entity.BlockedSlot;
import com.sportzone.entity.Facility;
import com.sportzone.entity.User;
import com.sportzone.exception.BusinessRuleViolationException;
import com.sportzone.exception.ResourceNotFoundException;
import com.sportzone.repository.BlockedSlotRepository;
import com.sportzone.repository.FacilityRepository;
import com.sportzone.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class BlockedSlotService {

    private final BlockedSlotRepository blockedSlotRepository;
    private final FacilityRepository facilityRepository;
    private final UserRepository userRepository;
    private final FacilityService facilityService;

    public BlockedSlotService(BlockedSlotRepository blockedSlotRepository, FacilityRepository facilityRepository, UserRepository userRepository, FacilityService facilityService) {
        this.blockedSlotRepository = blockedSlotRepository;
        this.facilityRepository = facilityRepository;
        this.userRepository = userRepository;
        this.facilityService = facilityService;
    }


    @Transactional
    public BlockedSlotDto.BlockedSlotResponse createBlockedSlot(BlockedSlotDto.CreateBlockedSlotRequest request, String adminEmail) {
        User admin = userRepository.findByEmail(adminEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Admin user not found"));

        Facility facility = facilityRepository.findById(request.getFacilityId())
                .orElseThrow(() -> new ResourceNotFoundException("Facility not found with id: " + request.getFacilityId()));

        if (!request.getEndTime().isAfter(request.getStartTime())) {
            throw new BusinessRuleViolationException("End time must be after start time");
        }

        List<BlockedSlot> overlapping = blockedSlotRepository.findOverlappingBlocks(
                facility.getId(), request.getStartTime(), request.getEndTime()
        );
        if (!overlapping.isEmpty()) {
            throw new BusinessRuleViolationException("A blocked slot already exists for this facility in the given time window");
        }

        BlockedSlot blockedSlot = BlockedSlot.builder()
                .facility(facility)
                .startTime(request.getStartTime())
                .endTime(request.getEndTime())
                .reason(request.getReason())
                .createdBy(admin)
                .build();

        BlockedSlot saved = blockedSlotRepository.save(blockedSlot);
        facilityService.invalidateFacilityCache(facility.getId());
        return mapToResponse(saved);
    }

    public List<BlockedSlotDto.BlockedSlotResponse> getAllBlockedSlots() {
        return blockedSlotRepository.findAll()
                .stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    @Transactional
    public void deleteBlockedSlot(Integer id) {
        BlockedSlot blockedSlot = blockedSlotRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Blocked slot not found with id: " + id));
        blockedSlotRepository.delete(blockedSlot);
        facilityService.invalidateFacilityCache(blockedSlot.getFacility().getId());
    }

    private BlockedSlotDto.BlockedSlotResponse mapToResponse(BlockedSlot slot) {
        return BlockedSlotDto.BlockedSlotResponse.builder()
                .id(slot.getId())
                .facilityId(slot.getFacility().getId())
                .facilityName(slot.getFacility().getName())
                .startTime(slot.getStartTime())
                .endTime(slot.getEndTime())
                .reason(slot.getReason())
                .createdByEmail(slot.getCreatedBy().getEmail())
                .createdAt(slot.getCreatedAt())
                .build();
    }
}
