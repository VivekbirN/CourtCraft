package com.sportzone.repository;

import com.sportzone.entity.Booking;
import com.sportzone.entity.BookingStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface BookingRepository extends JpaRepository<Booking, UUID> {

    @Query("SELECT b FROM Booking b WHERE b.facility.id = :facilityId " +
           "AND b.status = 'CONFIRMED' " +
           "AND b.startTime < :endTime " +
           "AND b.endTime > :startTime")
    List<Booking> findOverlappingBookings(
        @Param("facilityId") Integer facilityId,
        @Param("startTime") LocalDateTime startTime,
        @Param("endTime") LocalDateTime endTime
    );

    List<Booking> findByUserIdOrderByStartTimeDesc(UUID userId);

    List<Booking> findByFacilityIdOrderByStartTimeDesc(Integer facilityId);

    long countByUserIdAndStatusAndStartTimeAfter(UUID userId, BookingStatus status, LocalDateTime now);

    List<Booking> findByFacilityIdAndStatusAndStartTimeLessThanEqualAndEndTimeGreaterThanEqual(
        Integer facilityId, BookingStatus status, LocalDateTime endTime, LocalDateTime startTime
    );
}
