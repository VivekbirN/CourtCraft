package com.sportzone.controller;

import com.sportzone.dto.ApiResponse;
import com.sportzone.dto.BookingDto;
import com.sportzone.service.BookingService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/v1/bookings")
public class BookingController {

    private final BookingService bookingService;

    public BookingController(BookingService bookingService) {
        this.bookingService = bookingService;
    }


    @PostMapping
    public ResponseEntity<ApiResponse<BookingDto.BookingResponse>> createBooking(
            @Valid @RequestBody BookingDto.CreateBookingRequest request
    ) {
        String currentUserEmail = getCurrentUserEmail();
        BookingDto.BookingResponse response = bookingService.createBooking(request, currentUserEmail);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(response, "Booking created successfully"));
    }

    @GetMapping("/my")
    public ResponseEntity<ApiResponse<List<BookingDto.BookingResponse>>> getMyBookings() {
        String currentUserEmail = getCurrentUserEmail();
        List<BookingDto.BookingResponse> bookings = bookingService.getUserBookings(currentUserEmail);
        return ResponseEntity.ok(ApiResponse.success(bookings, "User bookings retrieved successfully"));
    }

    @GetMapping("/all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<BookingDto.BookingResponse>>> getAllBookings() {
        List<BookingDto.BookingResponse> bookings = bookingService.getAllBookings();
        return ResponseEntity.ok(ApiResponse.success(bookings, "All bookings retrieved successfully"));
    }

    @GetMapping("/facility/{facilityId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<BookingDto.BookingResponse>>> getFacilityBookings(@PathVariable Integer facilityId) {
        List<BookingDto.BookingResponse> bookings = bookingService.getFacilityBookings(facilityId);
        return ResponseEntity.ok(ApiResponse.success(bookings, "Facility bookings retrieved successfully"));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> cancelBooking(@PathVariable UUID id) {
        String currentUserEmail = getCurrentUserEmail();
        bookingService.cancelBooking(id, currentUserEmail);
        return ResponseEntity.ok(ApiResponse.success(null, "Booking cancelled successfully"));
    }

    private String getCurrentUserEmail() {
        return SecurityContextHolder.getContext().getAuthentication().getName();
    }
}
