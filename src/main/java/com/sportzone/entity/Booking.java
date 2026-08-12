package com.sportzone.entity;

import jakarta.persistence.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "bookings")
public class Booking {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "facility_id", nullable = false)
    private Facility facility;

    @Column(name = "start_time", nullable = false)
    private LocalDateTime startTime;

    @Column(name = "end_time", nullable = false)
    private LocalDateTime endTime;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private BookingStatus status = BookingStatus.CONFIRMED;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    public Booking() {}

    public Booking(UUID id, User user, Facility facility, LocalDateTime startTime, LocalDateTime endTime, BookingStatus status, LocalDateTime createdAt) {
        this.id = id;
        this.user = user;
        this.facility = facility;
        this.startTime = startTime;
        this.endTime = endTime;
        if (status != null) this.status = status;
        if (createdAt != null) this.createdAt = createdAt;
    }

    public static BookingBuilder builder() {
        return new BookingBuilder();
    }

    public static class BookingBuilder {
        private UUID id;
        private User user;
        private Facility facility;
        private LocalDateTime startTime;
        private LocalDateTime endTime;
        private BookingStatus status = BookingStatus.CONFIRMED;
        private LocalDateTime createdAt = LocalDateTime.now();

        public BookingBuilder id(UUID id) { this.id = id; return this; }
        public BookingBuilder user(User user) { this.user = user; return this; }
        public BookingBuilder facility(Facility facility) { this.facility = facility; return this; }
        public BookingBuilder startTime(LocalDateTime startTime) { this.startTime = startTime; return this; }
        public BookingBuilder endTime(LocalDateTime endTime) { this.endTime = endTime; return this; }
        public BookingBuilder status(BookingStatus status) { if (status != null) this.status = status; return this; }
        public BookingBuilder createdAt(LocalDateTime createdAt) { if (createdAt != null) this.createdAt = createdAt; return this; }

        public Booking build() {
            return new Booking(id, user, facility, startTime, endTime, status, createdAt);
        }
    }

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public Facility getFacility() { return facility; }
    public void setFacility(Facility facility) { this.facility = facility; }

    public LocalDateTime getStartTime() { return startTime; }
    public void setStartTime(LocalDateTime startTime) { this.startTime = startTime; }

    public LocalDateTime getEndTime() { return endTime; }
    public void setEndTime(LocalDateTime endTime) { this.endTime = endTime; }

    public BookingStatus getStatus() { return status; }
    public void setStatus(BookingStatus status) { this.status = status; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}

