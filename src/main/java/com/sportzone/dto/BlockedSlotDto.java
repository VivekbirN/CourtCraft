package com.sportzone.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDateTime;

public class BlockedSlotDto {

    public static class CreateBlockedSlotRequest {
        @NotNull(message = "Facility ID is required")
        private Integer facilityId;

        @NotNull(message = "Start time is required")
        private LocalDateTime startTime;

        @NotNull(message = "End time is required")
        private LocalDateTime endTime;

        @NotBlank(message = "Reason is required")
        private String reason;

        public CreateBlockedSlotRequest() {}
        public CreateBlockedSlotRequest(Integer facilityId, LocalDateTime startTime, LocalDateTime endTime, String reason) {
            this.facilityId = facilityId;
            this.startTime = startTime;
            this.endTime = endTime;
            this.reason = reason;
        }

        public Integer getFacilityId() { return facilityId; }
        public void setFacilityId(Integer facilityId) { this.facilityId = facilityId; }

        public LocalDateTime getStartTime() { return startTime; }
        public void setStartTime(LocalDateTime startTime) { this.startTime = startTime; }

        public LocalDateTime getEndTime() { return endTime; }
        public void setEndTime(LocalDateTime endTime) { this.endTime = endTime; }

        public String getReason() { return reason; }
        public void setReason(String reason) { this.reason = reason; }
    }

    public static class BlockedSlotResponse {
        private Integer id;
        private Integer facilityId;
        private String facilityName;
        private LocalDateTime startTime;
        private LocalDateTime endTime;
        private String reason;
        private String createdByEmail;
        private LocalDateTime createdAt;

        public BlockedSlotResponse() {}
        public BlockedSlotResponse(Integer id, Integer facilityId, String facilityName, LocalDateTime startTime, LocalDateTime endTime, String reason, String createdByEmail, LocalDateTime createdAt) {
            this.id = id;
            this.facilityId = facilityId;
            this.facilityName = facilityName;
            this.startTime = startTime;
            this.endTime = endTime;
            this.reason = reason;
            this.createdByEmail = createdByEmail;
            this.createdAt = createdAt;
        }

        public static BlockedSlotResponseBuilder builder() { return new BlockedSlotResponseBuilder(); }
        public static class BlockedSlotResponseBuilder {
            private Integer id;
            private Integer facilityId;
            private String facilityName;
            private LocalDateTime startTime;
            private LocalDateTime endTime;
            private String reason;
            private String createdByEmail;
            private LocalDateTime createdAt;

            public BlockedSlotResponseBuilder id(Integer id) { this.id = id; return this; }
            public BlockedSlotResponseBuilder facilityId(Integer facilityId) { this.facilityId = facilityId; return this; }
            public BlockedSlotResponseBuilder facilityName(String facilityName) { this.facilityName = facilityName; return this; }
            public BlockedSlotResponseBuilder startTime(LocalDateTime startTime) { this.startTime = startTime; return this; }
            public BlockedSlotResponseBuilder endTime(LocalDateTime endTime) { this.endTime = endTime; return this; }
            public BlockedSlotResponseBuilder reason(String reason) { this.reason = reason; return this; }
            public BlockedSlotResponseBuilder createdByEmail(String createdByEmail) { this.createdByEmail = createdByEmail; return this; }
            public BlockedSlotResponseBuilder createdAt(LocalDateTime createdAt) { this.createdAt = createdAt; return this; }

            public BlockedSlotResponse build() {
                return new BlockedSlotResponse(id, facilityId, facilityName, startTime, endTime, reason, createdByEmail, createdAt);
            }
        }

        public Integer getId() { return id; }
        public void setId(Integer id) { this.id = id; }

        public Integer getFacilityId() { return facilityId; }
        public void setFacilityId(Integer facilityId) { this.facilityId = facilityId; }

        public String getFacilityName() { return facilityName; }
        public void setFacilityName(String facilityName) { this.facilityName = facilityName; }

        public LocalDateTime getStartTime() { return startTime; }
        public void setStartTime(LocalDateTime startTime) { this.startTime = startTime; }

        public LocalDateTime getEndTime() { return endTime; }
        public void setEndTime(LocalDateTime endTime) { this.endTime = endTime; }

        public String getReason() { return reason; }
        public void setReason(String reason) { this.reason = reason; }

        public String getCreatedByEmail() { return createdByEmail; }
        public void setCreatedByEmail(String createdByEmail) { this.createdByEmail = createdByEmail; }

        public LocalDateTime getCreatedAt() { return createdAt; }
        public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    }
}

