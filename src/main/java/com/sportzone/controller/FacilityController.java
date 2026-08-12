package com.sportzone.controller;

import com.sportzone.dto.ApiResponse;
import com.sportzone.dto.FacilityDto;
import com.sportzone.service.FacilityService;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/v1/facilities")
public class FacilityController {

    private final FacilityService facilityService;

    public FacilityController(FacilityService facilityService) {
        this.facilityService = facilityService;
    }


    @GetMapping
    public ResponseEntity<ApiResponse<List<FacilityDto.FacilityResponse>>> getFacilities(
            @RequestParam(required = false) Integer sportId
    ) {
        List<FacilityDto.FacilityResponse> facilities = facilityService.getFacilities(sportId);
        return ResponseEntity.ok(ApiResponse.success(facilities, "Facilities retrieved successfully"));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<FacilityDto.FacilityResponse>> getFacilityById(@PathVariable Integer id) {
        FacilityDto.FacilityResponse facility = facilityService.getFacilityById(id);
        return ResponseEntity.ok(ApiResponse.success(facility, "Facility retrieved successfully"));
    }

    @GetMapping("/{id}/availability")
    public ResponseEntity<ApiResponse<FacilityDto.FacilityAvailabilityResponse>> getAvailability(
            @PathVariable Integer id,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date
    ) {
        FacilityDto.FacilityAvailabilityResponse availability = facilityService.getAvailability(id, date);
        return ResponseEntity.ok(ApiResponse.success(availability, "Facility availability retrieved successfully"));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<FacilityDto.FacilityResponse>> createFacility(
            @Valid @RequestBody FacilityDto.CreateFacilityRequest request
    ) {
        FacilityDto.FacilityResponse response = facilityService.createFacility(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(response, "Facility created successfully"));
    }

    @PatchMapping("/{id}/deactivate")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deactivateFacility(@PathVariable Integer id) {
        facilityService.deactivateFacility(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Facility deactivated successfully"));
    }
}
