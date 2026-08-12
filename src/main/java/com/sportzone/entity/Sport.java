package com.sportzone.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "sports")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Sport {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(nullable = false, unique = true)
    private String name;

    private String description;

    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private Boolean isActive = true;
}
