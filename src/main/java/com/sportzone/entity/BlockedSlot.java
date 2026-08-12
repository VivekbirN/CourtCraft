package com.sportzone.entity;

import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "blocked_slots")
public class BlockedSlot {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "facility_id", nullable = false)
    private Facility facility;

    @Column(name = "start_time", nullable = false)
    private LocalDateTime startTime;

    @Column(name = "end_time", nullable = false)
    private LocalDateTime endTime;

    private String reason;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by", nullable = false)
    private User createdBy;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    public BlockedSlot() {}

    public BlockedSlot(Integer id, Facility facility, LocalDateTime startTime, LocalDateTime endTime, String reason, User createdBy, LocalDateTime createdAt) {
        this.id = id;
        this.facility = facility;
        this.startTime = startTime;
        this.endTime = endTime;
        this.reason = reason;
        this.createdBy = createdBy;
        if (createdAt != null) this.createdAt = createdAt;
    }

    public static BlockedSlotBuilder builder() {
        return new BlockedSlotBuilder();
    }

    public static class BlockedSlotBuilder {
        private Integer id;
        private Facility facility;
        private LocalDateTime startTime;
        private LocalDateTime endTime;
        private String reason;
        private User createdBy;
        private LocalDateTime createdAt = LocalDateTime.now();

        public BlockedSlotBuilder id(Integer id) { this.id = id; return this; }
        public BlockedSlotBuilder facility(Facility facility) { this.facility = facility; return this; }
        public BlockedSlotBuilder startTime(LocalDateTime startTime) { this.startTime = startTime; return this; }
        public BlockedSlotBuilder endTime(LocalDateTime endTime) { this.endTime = endTime; return this; }
        public BlockedSlotBuilder reason(String reason) { this.reason = reason; return this; }
        public BlockedSlotBuilder createdBy(User createdBy) { this.createdBy = createdBy; return this; }
        public BlockedSlotBuilder createdAt(LocalDateTime createdAt) { if (createdAt != null) this.createdAt = createdAt; return this; }

        public BlockedSlot build() {
            return new BlockedSlot(id, facility, startTime, endTime, reason, createdBy, createdAt);
        }
    }

    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }

    public Facility getFacility() { return facility; }
    public void setFacility(Facility facility) { this.facility = facility; }

    public LocalDateTime getStartTime() { return startTime; }
    public void setStartTime(LocalDateTime startTime) { this.startTime = startTime; }

    public LocalDateTime getEndTime() { return endTime; }
    public void setEndTime(LocalDateTime endTime) { this.endTime = endTime; }

    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }

    public User getCreatedBy() { return createdBy; }
    public void setCreatedBy(User createdBy) { this.createdBy = createdBy; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}

