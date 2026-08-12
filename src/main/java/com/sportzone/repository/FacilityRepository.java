package com.sportzone.repository;

import com.sportzone.entity.Facility;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FacilityRepository extends JpaRepository<Facility, Integer> {
    List<Facility> findBySportIdAndIsActiveTrue(Integer sportId);
    List<Facility> findByIsActiveTrue();
    Optional<Facility> findByIdAndIsActiveTrue(Integer id);
}
