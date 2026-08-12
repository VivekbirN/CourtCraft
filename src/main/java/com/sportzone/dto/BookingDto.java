package com.sportzone.dto;

import com.sportzone.entity.BookingStatus;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDateTime;
import java.util.UUID;

public class BookingDto {

    public static class CreateBookingRequest {
        @NotNull(message = "Facility ID is required")
        private Integer facilityId;

        @NotNull(message = "Start time is required")
        private LocalDateTime startTime;

        @NotNull(message = "End time is required")
        private LocalDateTime endTime;

        public CreateBookingRequest() {}
        public CreateBookingRequest(Integer facilityId, LocalDateTime startTime, LocalDateTime endTime) {
            this.facilityId = facilityId;
            this.startTime = startTime;
            this.endTime = endTime;
        }

        public Integer getFacilityId() { return facilityId; }
        public void setFacilityId(Integer facilityId) { this.facilityId = facilityId; }

        public LocalDateTime getStartTime() { return startTime; }
        public void setStartTime(LocalDateTime startTime) { this.startTime = startTime; }

        public LocalDateTime getEndTime() { return endTime; }
        public void setEndTime(LocalDateTime endTime) { this.endTime = endTime; }
    }

    public static class BookingResponse {
        private UUID id;
        private UUID userId;
        private String userEmail;
        private String userName;
        private Integer facilityId;
        private String facilityName;
        private String sportName;
        private LocalDateTime startTime;
        private LocalDateTime endTime;
        private BookingStatus status;
        private LocalDateTime createdAt;

        public BookingResponse() {}
        public BookingResponse(UUID id, UUID userId, String userEmail, String userName, Integer facilityId, String facilityName, String sportName, LocalDateTime startTime, LocalDateTime endTime, BookingStatus status, LocalDateTime createdAt) {
            this.id = id;
            this.userId = userId;
            this.userEmail = userEmail;
            this.userName = userName;
            this.facilityId = facilityId;
            this.facilityName = facilityName;
            this.sportName = sportName;
            this.startTime = startTime;
            this.endTime = endTime;
            this.status = status;
            this.createdAt = createdAt;
        }

        public static BookingResponseBuilder builder() { return new BookingResponseBuilder(); }
        public static class BookingResponseBuilder {
            private UUID id;
            private UUID userId;
            private String userEmail;
            private String userName;
            private Integer facilityId;
            private String facilityName;
            private String sportName;
            private LocalDateTime startTime;
            private LocalDateTime endTime;
            private BookingStatus status;
            private LocalDateTime createdAt;

            public BookingResponseBuilder id(UUID id) { this.id = id; return this; }
            public BookingResponseBuilder userId(UUID userId) { this.userId = userId; return this; }
            public BookingResponseBuilder userEmail(String userEmail) { this.userEmail = userEmail; return this; }
            public BookingResponseBuilder userName(String userName) { this.userName = userName; return this; }
            public BookingResponseBuilder facilityId(Integer facilityId) { this.facilityId = facilityId; return this; }
            public BookingResponseBuilder facilityName(String facilityName) { this.facilityName = facilityName; return this; }
            public BookingResponseBuilder sportName(String sportName) { this.sportName = sportName; return this; }
            public BookingResponseBuilder startTime(LocalDateTime startTime) { this.startTime = startTime; return this; }
            public BookingResponseBuilder endTime(LocalDateTime endTime) { this.endTime = endTime; return this; }
            public BookingResponseBuilder status(BookingStatus status) { this.status = status; return this; }
            public BookingResponseBuilder createdAt(LocalDateTime createdAt) { this.createdAt = createdAt; return this; }

            public BookingResponse build() {
                return new BookingResponse(id, userId, userEmail, userName, facilityId, facilityName, sportName, startTime, endTime, status, createdAt);
            }
        }

        public UUID getId() { return id; }
        public void setId(UUID id) { this.id = id; }

        public UUID getUserId() { return userId; }
        public void setUserId(UUID userId) { this.userId = userId; }

        public String getUserEmail() { return userEmail; }
        public void setUserEmail(String userEmail) { this.userEmail = userEmail; }

        public String getUserName() { return userName; }
        public void setUserName(String userName) { this.userName = userName; }

        public Integer getFacilityId() { return facilityId; }
        public void setFacilityId(Integer facilityId) { this.facilityId = facilityId; }

        public String getFacilityName() { return facilityName; }
        public void setFacilityName(String facilityName) { this.facilityName = facilityName; }

        public String getSportName() { return sportName; }
        public void setSportName(String sportName) { this.sportName = sportName; }

        public LocalDateTime getStartTime() { return startTime; }
        public void setStartTime(LocalDateTime startTime) { this.startTime = startTime; }

        public LocalDateTime getEndTime() { return endTime; }
        public void setEndTime(LocalDateTime endTime) { this.endTime = endTime; }

        public BookingStatus getStatus() { return status; }
        public void setStatus(BookingStatus status) { this.status = status; }

        public LocalDateTime getCreatedAt() { return createdAt; }
        public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    }
}

