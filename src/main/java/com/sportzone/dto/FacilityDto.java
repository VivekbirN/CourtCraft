package com.sportzone.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

public class FacilityDto {

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CreateFacilityRequest {
        @NotNull(message = "Sport ID is required")
        private Integer sportId;

        @NotBlank(message = "Facility name is required")
        private String name;

        private String description;

        @Min(value = 1, message = "Capacity must be at least 1")
        private Integer capacity;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class FacilityResponse {
        private Integer id;
        private Integer sportId;
        private String sportName;
        private String name;
        private String description;
        private Integer capacity;
        private Boolean isActive;
        private LocalDateTime createdAt;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TimeSlot {
        private LocalDateTime startTime;
        private LocalDateTime endTime;
        private Boolean available;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class FacilityAvailabilityResponse {
        private Integer facilityId;
        private String facilityName;
        private String date;
        private List<TimeSlot> slots;
    }
}
