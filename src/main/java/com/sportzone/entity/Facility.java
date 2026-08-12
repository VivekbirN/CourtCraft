package com.sportzone.entity;

import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "facilities")
public class Facility {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "sport_id", nullable = false)
    private Sport sport;

    @Column(nullable = false)
    private String name;

    private String description;

    @Column(nullable = false)
    private Integer capacity = 1;

    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    public Facility() {}

    public Facility(Integer id, Sport sport, String name, String description, Integer capacity, Boolean isActive, LocalDateTime createdAt) {
        this.id = id;
        this.sport = sport;
        this.name = name;
        this.description = description;
        if (capacity != null) this.capacity = capacity;
        if (isActive != null) this.isActive = isActive;
        if (createdAt != null) this.createdAt = createdAt;
    }

    public static FacilityBuilder builder() {
        return new FacilityBuilder();
    }

    public static class FacilityBuilder {
        private Integer id;
        private Sport sport;
        private String name;
        private String description;
        private Integer capacity = 1;
        private Boolean isActive = true;
        private LocalDateTime createdAt = LocalDateTime.now();

        public FacilityBuilder id(Integer id) { this.id = id; return this; }
        public FacilityBuilder sport(Sport sport) { this.sport = sport; return this; }
        public FacilityBuilder name(String name) { this.name = name; return this; }
        public FacilityBuilder description(String description) { this.description = description; return this; }
        public FacilityBuilder capacity(Integer capacity) { if (capacity != null) this.capacity = capacity; return this; }
        public FacilityBuilder isActive(Boolean isActive) { if (isActive != null) this.isActive = isActive; return this; }
        public FacilityBuilder createdAt(LocalDateTime createdAt) { if (createdAt != null) this.createdAt = createdAt; return this; }

        public Facility build() {
            return new Facility(id, sport, name, description, capacity, isActive, createdAt);
        }
    }

    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }

    public Sport getSport() { return sport; }
    public void setSport(Sport sport) { this.sport = sport; }

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

