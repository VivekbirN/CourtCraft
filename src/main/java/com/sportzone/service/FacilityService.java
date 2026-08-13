package com.sportzone.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.sportzone.dto.FacilityDto;
import com.sportzone.entity.Booking;
import com.sportzone.entity.BookingStatus;
import com.sportzone.entity.Facility;
import com.sportzone.entity.Sport;
import com.sportzone.exception.ResourceNotFoundException;
import com.sportzone.repository.BookingRepository;
import com.sportzone.repository.FacilityRepository;
import com.sportzone.repository.SportRepository;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class FacilityService {

    private final FacilityRepository facilityRepository;
    private final SportRepository sportRepository;
    private final BookingRepository bookingRepository;
    private final RedisTemplate<String, String> redisTemplate;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public FacilityService(FacilityRepository facilityRepository, SportRepository sportRepository, BookingRepository bookingRepository, RedisTemplate<String, String> redisTemplate) {
        this.facilityRepository = facilityRepository;
        this.sportRepository = sportRepository;
        this.bookingRepository = bookingRepository;
        this.redisTemplate = redisTemplate;
    }


    public List<FacilityDto.FacilityResponse> getFacilities(Integer sportId) {
        List<Facility> facilities;
        if (sportId != null) {
            facilities = facilityRepository.findBySportIdAndIsActiveTrue(sportId);
        } else {
            facilities = facilityRepository.findByIsActiveTrue();
        }
        return facilities.stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    public FacilityDto.FacilityResponse getFacilityById(Integer id) {
        Facility facility = facilityRepository.findByIdAndIsActiveTrue(id)
                .orElseThrow(() -> new ResourceNotFoundException("Facility not found with id: " + id));
        return mapToResponse(facility);
    }

    @Transactional
    public FacilityDto.FacilityResponse createFacility(FacilityDto.CreateFacilityRequest request) {
        Sport sport = sportRepository.findById(request.getSportId())
                .orElseThrow(() -> new ResourceNotFoundException("Sport not found with id: " + request.getSportId()));

        Facility facility = Facility.builder()
                .sport(sport)
                .name(request.getName())
                .description(request.getDescription())
                .capacity(request.getCapacity() != null ? request.getCapacity() : 1)
                .isActive(true)
                .build();

        Facility saved = facilityRepository.save(facility);
        invalidateFacilityCache(saved.getId());
        return mapToResponse(saved);
    }

    @Transactional
    public void deactivateFacility(Integer id) {
        Facility facility = facilityRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Facility not found with id: " + id));
        facility.setIsActive(false);
        facilityRepository.save(facility);
        invalidateFacilityCache(id);
    }

    public FacilityDto.FacilityAvailabilityResponse getAvailability(Integer facilityId, LocalDate date) {
        Facility facility = facilityRepository.findByIdAndIsActiveTrue(facilityId)
                .orElseThrow(() -> new ResourceNotFoundException("Facility not found with id: " + facilityId));

        String cacheKey = "availability:" + facilityId + ":" + date.toString();
        String cachedData = null;
        try {
            cachedData = redisTemplate.opsForValue().get(cacheKey);
        } catch (Exception e) {
            // Ignore Redis exception, fallback to DB query
        }

        if (cachedData != null) {
            try {
                return objectMapper.readValue(cachedData, FacilityDto.FacilityAvailabilityResponse.class);
            } catch (JsonProcessingException e) {
                // Ignore fallback to DB
            }
        }

        LocalDateTime dayStart = date.atStartOfDay();
        LocalDateTime dayEnd = date.atTime(LocalTime.MAX);

        List<Booking> bookings = bookingRepository.findByFacilityIdAndStatusAndStartTimeLessThanEqualAndEndTimeGreaterThanEqual(
                facilityId, BookingStatus.CONFIRMED, dayEnd, dayStart
        );

        List<FacilityDto.TimeSlot> slots = new ArrayList<>();
        LocalTime current = LocalTime.of(6, 0); // Complex opens at 6 AM
        LocalTime closing = LocalTime.of(22, 0); // Complex closes at 10 PM

        while (current.isBefore(closing)) {
            LocalDateTime slotStart = date.atTime(current);
            LocalDateTime slotEnd = slotStart.plusHours(1);

            boolean isBooked = bookings.stream().anyMatch(b -> 
                b.getStartTime().isBefore(slotEnd) && b.getEndTime().isAfter(slotStart)
            );

            slots.add(FacilityDto.TimeSlot.builder()
                    .startTime(slotStart)
                    .endTime(slotEnd)
                    .available(!isBooked)
                    .build());

            current = current.plusHours(1);
        }

        FacilityDto.FacilityAvailabilityResponse response = FacilityDto.FacilityAvailabilityResponse.builder()
                .facilityId(facility.getId())
                .facilityName(facility.getName())
                .date(date.toString())
                .slots(slots)
                .build();

        try {
            redisTemplate.opsForValue().set(cacheKey, objectMapper.writeValueAsString(response), Duration.ofSeconds(60));
        } catch (Exception e) {
            // Ignore error writing cache
        }

        return response;
    }

    public void invalidateFacilityCache(Integer facilityId) {
        try {
            Set<String> keys = redisTemplate.keys("availability:" + facilityId + ":*");
            if (keys != null && !keys.isEmpty()) {
                redisTemplate.delete(keys);
            }
        } catch (Exception e) {
            // Ignore Redis connection errors
        }
    }


    private FacilityDto.FacilityResponse mapToResponse(Facility facility) {
        return FacilityDto.FacilityResponse.builder()
                .id(facility.getId())
                .sportId(facility.getSport().getId())
                .sportName(facility.getSport().getName())
                .name(facility.getName())
                .description(facility.getDescription())
                .capacity(facility.getCapacity())
                .isActive(facility.getIsActive())
                .createdAt(facility.getCreatedAt())
                .build();
    }
}
