package com.sportzone.service;

import com.sportzone.dto.BookingDto;
import com.sportzone.entity.BlockedSlot;
import com.sportzone.entity.Booking;
import com.sportzone.entity.BookingStatus;
import com.sportzone.entity.Facility;
import com.sportzone.entity.User;
import com.sportzone.exception.BusinessRuleViolationException;
import com.sportzone.exception.ResourceNotFoundException;
import com.sportzone.exception.UnauthorizedException;
import com.sportzone.repository.BlockedSlotRepository;
import com.sportzone.repository.BookingRepository;
import com.sportzone.repository.FacilityRepository;
import com.sportzone.repository.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class BookingService {

    private final BookingRepository bookingRepository;
    private final FacilityRepository facilityRepository;
    private final UserRepository userRepository;
    private final BlockedSlotRepository blockedSlotRepository;
    private final RedisLockService redisLockService;
    private final FacilityService facilityService;

    public BookingService(BookingRepository bookingRepository, FacilityRepository facilityRepository, UserRepository userRepository, BlockedSlotRepository blockedSlotRepository, RedisLockService redisLockService, FacilityService facilityService) {
        this.bookingRepository = bookingRepository;
        this.facilityRepository = facilityRepository;
        this.userRepository = userRepository;
        this.blockedSlotRepository = blockedSlotRepository;
        this.redisLockService = redisLockService;
        this.facilityService = facilityService;
    }


    @Value("${app.booking.max-duration-hours:3}")
    private long maxDurationHours;

    @Value("${app.booking.advance-booking-days:7}")
    private long advanceBookingDays;

    @Value("${app.booking.max-active-bookings:3}")
    private long maxActiveBookings;

    @Value("${app.booking.cancellation-cutoff-minutes:30}")
    private long cancellationCutoffMinutes;

    @Transactional
    public BookingDto.BookingResponse createBooking(BookingDto.CreateBookingRequest request, String userEmail) {
        // 1. Validate user exists
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + userEmail));

        // 2. Validate facility exists and is active
        Facility facility = facilityRepository.findByIdAndIsActiveTrue(request.getFacilityId())
                .orElseThrow(() -> new ResourceNotFoundException("Facility not found or inactive with id: " + request.getFacilityId()));

        LocalDateTime now = LocalDateTime.now();

        // 3. Check startTime is in future
        if (!request.getStartTime().isAfter(now)) {
            throw new BusinessRuleViolationException("Booking start time must be in the future");
        }

        if (!request.getEndTime().isAfter(request.getStartTime())) {
            throw new BusinessRuleViolationException("Booking end time must be after start time");
        }

        // 4. Check duration <= 3 hours
        long durationHours = Duration.between(request.getStartTime(), request.getEndTime()).toHours();
        long durationMinutes = Duration.between(request.getStartTime(), request.getEndTime()).toMinutes();
        if (durationMinutes > maxDurationHours * 60) {
            throw new BusinessRuleViolationException("Booking duration cannot exceed " + maxDurationHours + " hours");
        }

        // 5. Check startTime <= 7 days from now
        if (request.getStartTime().isAfter(now.plusDays(advanceBookingDays))) {
            throw new BusinessRuleViolationException("Cannot book more than " + advanceBookingDays + " days in advance");
        }

        // 6. Check user has < 3 active (CONFIRMED) bookings
        long activeBookingsCount = bookingRepository.countByUserIdAndStatusAndStartTimeAfter(
                user.getId(), BookingStatus.CONFIRMED, now
        );
        if (activeBookingsCount >= maxActiveBookings) {
            throw new BusinessRuleViolationException("Maximum active bookings limit (" + maxActiveBookings + ") reached");
        }

        // 7. Check no blocked slots overlap
        List<BlockedSlot> blockedSlots = blockedSlotRepository.findOverlappingBlocks(
                facility.getId(), request.getStartTime(), request.getEndTime()
        );
        if (!blockedSlots.isEmpty()) {
            throw new BusinessRuleViolationException("Facility is blocked for maintenance or an event during this time");
        }

        // 8. Acquire Redis lock on facility (facilityId, TTL 10 seconds)
        String lockKey = String.valueOf(facility.getId());
        boolean lockAcquired = redisLockService.acquireLock(lockKey, 10);

        // 9. If lock not acquired -> throw BusinessRuleViolationException
        if (!lockAcquired) {
            throw new BusinessRuleViolationException("Facility is busy, try again");
        }

        try {
            // 10. Inside try block: check overlapping bookings in DB
            List<Booking> overlapping = bookingRepository.findOverlappingBookings(
                    facility.getId(), request.getStartTime(), request.getEndTime()
            );

            // 11. If overlap -> release lock, throw BusinessRuleViolationException
            if (!overlapping.isEmpty()) {
                throw new BusinessRuleViolationException("Slot already booked");
            }

            // 12. Save booking
            Booking booking = Booking.builder()
                    .user(user)
                    .facility(facility)
                    .startTime(request.getStartTime())
                    .endTime(request.getEndTime())
                    .status(BookingStatus.CONFIRMED)
                    .build();

            Booking saved = bookingRepository.save(booking);

            // Invalidate cache for this facility
            facilityService.invalidateFacilityCache(facility.getId());

            return mapToResponse(saved);
        } finally {
            // 13. Finally: release lock
            redisLockService.releaseLock(lockKey);
        }
    }

    public List<BookingDto.BookingResponse> getUserBookings(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + userEmail));
        return bookingRepository.findByUserIdOrderByStartTimeDesc(user.getId())
                .stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    public List<BookingDto.BookingResponse> getAllBookings() {
        return bookingRepository.findAll()
                .stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    public List<BookingDto.BookingResponse> getFacilityBookings(Integer facilityId) {
        return bookingRepository.findByFacilityIdOrderByStartTimeDesc(facilityId)
                .stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    @Transactional
    public void cancelBooking(UUID bookingId, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found with id: " + bookingId));

        // Check ownership unless user is ADMIN
        if (!user.getRole().name().equals("ADMIN") && !booking.getUser().getId().equals(user.getId())) {
            throw new UnauthorizedException("You are not authorized to cancel this booking");
        }

        if (booking.getStatus() == BookingStatus.CANCELLED) {
            throw new BusinessRuleViolationException("Booking is already cancelled");
        }

        LocalDateTime cutoffTime = booking.getStartTime().minusMinutes(cancellationCutoffMinutes);
        if (LocalDateTime.now().isAfter(cutoffTime)) {
            throw new BusinessRuleViolationException("Bookings can only be cancelled up to " + cancellationCutoffMinutes + " minutes before start time");
        }

        booking.setStatus(BookingStatus.CANCELLED);
        bookingRepository.save(booking);

        facilityService.invalidateFacilityCache(booking.getFacility().getId());
    }

    private BookingDto.BookingResponse mapToResponse(Booking booking) {
        return BookingDto.BookingResponse.builder()
                .id(booking.getId())
                .userId(booking.getUser().getId())
                .userEmail(booking.getUser().getEmail())
                .userName(booking.getUser().getFirstName() + " " + booking.getUser().getLastName())
                .facilityId(booking.getFacility().getId())
                .facilityName(booking.getFacility().getName())
                .sportName(booking.getFacility().getSport().getName())
                .startTime(booking.getStartTime())
                .endTime(booking.getEndTime())
                .status(booking.getStatus())
                .createdAt(booking.getCreatedAt())
                .build();
    }
}
