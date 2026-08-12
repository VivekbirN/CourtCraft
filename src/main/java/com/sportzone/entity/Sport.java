package com.sportzone.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "sports")
public class Sport {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(nullable = false, unique = true)
    private String name;

    private String description;

    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;

    public Sport() {}

    public Sport(Integer id, String name, String description, Boolean isActive) {
        this.id = id;
        this.name = name;
        this.description = description;
        if (isActive != null) this.isActive = isActive;
    }

    public static SportBuilder builder() {
        return new SportBuilder();
    }

    public static class SportBuilder {
        private Integer id;
        private String name;
        private String description;
        private Boolean isActive = true;

        public SportBuilder id(Integer id) { this.id = id; return this; }
        public SportBuilder name(String name) { this.name = name; return this; }
        public SportBuilder description(String description) { this.description = description; return this; }
        public SportBuilder isActive(Boolean isActive) { if (isActive != null) this.isActive = isActive; return this; }

        public Sport build() {
            return new Sport(id, name, description, isActive);
        }
    }

    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public Boolean getIsActive() { return isActive; }
    public void setIsActive(Boolean isActive) { this.isActive = isActive; }
}

