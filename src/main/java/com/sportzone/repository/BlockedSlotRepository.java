package com.sportzone.repository;

import com.sportzone.entity.BlockedSlot;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface BlockedSlotRepository extends JpaRepository<BlockedSlot, Integer> {

    @Query("SELECT bs FROM BlockedSlot bs WHERE bs.facility.id = :facilityId " +
           "AND bs.startTime < :endTime " +
           "AND bs.endTime > :startTime")
    List<BlockedSlot> findOverlappingBlocks(
        @Param("facilityId") Integer facilityId,
        @Param("startTime") LocalDateTime startTime,
        @Param("endTime") LocalDateTime endTime
    );

    List<BlockedSlot> findByFacilityId(Integer facilityId);
}
