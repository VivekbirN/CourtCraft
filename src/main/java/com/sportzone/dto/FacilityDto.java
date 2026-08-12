package com.sportzone.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDateTime;
import java.util.List;

public class FacilityDto {

    public static class CreateFacilityRequest {
        @NotNull(message = "Sport ID is required")
        private Integer sportId;

        @NotBlank(message = "Facility name is required")
        private String name;

        private String description;

        @Min(value = 1, message = "Capacity must be at least 1")
        private Integer capacity;

        public CreateFacilityRequest() {}
        public CreateFacilityRequest(Integer sportId, String name, String description, Integer capacity) {
            this.sportId = sportId;
            this.name = name;
            this.description = description;
            this.capacity = capacity;
        }

        public Integer getSportId() { return sportId; }
        public void setSportId(Integer sportId) { this.sportId = sportId; }

        public String getName() { return name; }
        public void setName(String name) { this.name = name; }

        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }

        public Integer getCapacity() { return capacity; }
        public void setCapacity(Integer capacity) { this.capacity = capacity; }
    }

    public static class FacilityResponse {
        private Integer id;
        private Integer sportId;
        private String sportName;
        private String name;
        private String description;
        private Integer capacity;
        private Boolean isActive;
        private LocalDateTime createdAt;

        public FacilityResponse() {}
        public FacilityResponse(Integer id, Integer sportId, String sportName, String name, String description, Integer capacity, Boolean isActive, LocalDateTime createdAt) {
            this.id = id;
            this.sportId = sportId;
            this.sportName = sportName;
            this.name = name;
            this.description = description;
            this.capacity = capacity;
            this.isActive = isActive;
            this.createdAt = createdAt;
        }

        public static FacilityResponseBuilder builder() { return new FacilityResponseBuilder(); }
        public static class FacilityResponseBuilder {
            private Integer id;
            private Integer sportId;
            private String sportName;
            private String name;
            private String description;
            private Integer capacity;
            private Boolean isActive;
            private LocalDateTime createdAt;

            public FacilityResponseBuilder id(Integer id) { this.id = id; return this; }
            public FacilityResponseBuilder sportId(Integer sportId) { this.sportId = sportId; return this; }
            public FacilityResponseBuilder sportName(String sportName) { this.sportName = sportName; return this; }
            public FacilityResponseBuilder name(String name) { this.name = name; return this; }
            public FacilityResponseBuilder description(String description) { this.description = description; return this; }
            public FacilityResponseBuilder capacity(Integer capacity) { this.capacity = capacity; return this; }
            public FacilityResponseBuilder isActive(Boolean isActive) { this.isActive = isActive; return this; }
            public FacilityResponseBuilder createdAt(LocalDateTime createdAt) { this.createdAt = createdAt; return this; }
            public FacilityResponse build() {
                return new FacilityResponse(id, sportId, sportName, name, description, capacity, isActive, createdAt);
            }
        }

        public Integer getId() { return id; }
        public void setId(Integer id) { this.id = id; }

        public Integer getSportId() { return sportId; }
        public void setSportId(Integer sportId) { this.sportId = sportId; }

        public String getSportName() { return sportName; }
        public void setSportName(String sportName) { this.sportName = sportName; }

        public String getName() { return name; }
        public void setName(String name) { this.name = name; }

        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }

        public Integer getCapacity() { return capacity; }
        public void setCapacity(Integer capacity) { this.capacity = capacity; }

        public Boolean getIsActive() { return isActive; }
        public void setIsActive(Boolean isActive) { this.isActive = isActive; }

        public LocalDateTime getCreatedAt() { return createdAt; }
        public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    }

    public static class TimeSlot {
        private LocalDateTime startTime;
        private LocalDateTime endTime;
        private Boolean available;

        public TimeSlot() {}
        public TimeSlot(LocalDateTime startTime, LocalDateTime endTime, Boolean available) {
            this.startTime = startTime;
            this.endTime = endTime;
            this.available = available;
        }

        public static TimeSlotBuilder builder() { return new TimeSlotBuilder(); }
        public static class TimeSlotBuilder {
            private LocalDateTime startTime;
            private LocalDateTime endTime;
            private Boolean available;

            public TimeSlotBuilder startTime(LocalDateTime startTime) { this.startTime = startTime; return this; }
            public TimeSlotBuilder endTime(LocalDateTime endTime) { this.endTime = endTime; return this; }
            public TimeSlotBuilder available(Boolean available) { this.available = available; return this; }
            public TimeSlot build() { return new TimeSlot(startTime, endTime, available); }
        }

        public LocalDateTime getStartTime() { return startTime; }
        public void setStartTime(LocalDateTime startTime) { this.startTime = startTime; }

        public LocalDateTime getEndTime() { return endTime; }
        public void setEndTime(LocalDateTime endTime) { this.endTime = endTime; }

        public Boolean getAvailable() { return available; }
        public void setAvailable(Boolean available) { this.available = available; }
    }

    public static class FacilityAvailabilityResponse {
        private Integer facilityId;
        private String facilityName;
        private String date;
        private List<TimeSlot> slots;

        public FacilityAvailabilityResponse() {}
        public FacilityAvailabilityResponse(Integer facilityId, String facilityName, String date, List<TimeSlot> slots) {
            this.facilityId = facilityId;
            this.facilityName = facilityName;
            this.date = date;
            this.slots = slots;
        }

        public static FacilityAvailabilityResponseBuilder builder() { return new FacilityAvailabilityResponseBuilder(); }
        public static class FacilityAvailabilityResponseBuilder {
            private Integer facilityId;
            private String facilityName;
            private String date;
            private List<TimeSlot> slots;

            public FacilityAvailabilityResponseBuilder facilityId(Integer facilityId) { this.facilityId = facilityId; return this; }
            public FacilityAvailabilityResponseBuilder facilityName(String facilityName) { this.facilityName = facilityName; return this; }
            public FacilityAvailabilityResponseBuilder date(String date) { this.date = date; return this; }
            public FacilityAvailabilityResponseBuilder slots(List<TimeSlot> slots) { this.slots = slots; return this; }
            public FacilityAvailabilityResponse build() { return new FacilityAvailabilityResponse(facilityId, facilityName, date, slots); }
        }

        public Integer getFacilityId() { return facilityId; }
        public void setFacilityId(Integer facilityId) { this.facilityId = facilityId; }

        public String getFacilityName() { return facilityName; }
        public void setFacilityName(String facilityName) { this.facilityName = facilityName; }

        public String getDate() { return date; }
        public void setDate(String date) { this.date = date; }

        public List<TimeSlot> getSlots() { return slots; }
        public void setSlots(List<TimeSlot> slots) { this.slots = slots; }
    }
}

