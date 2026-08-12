package com.sportzone.controller;

import com.sportzone.dto.ApiResponse;
import com.sportzone.entity.Sport;
import com.sportzone.service.SportService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/v1/sports")
public class SportController {

    private final SportService sportService;

    public SportController(SportService sportService) {
        this.sportService = sportService;
    }


    @GetMapping
    public ResponseEntity<ApiResponse<List<Sport>>> getAllSports() {
        List<Sport> sports = sportService.getAllActiveSports();
        return ResponseEntity.ok(ApiResponse.success(sports, "Active sports retrieved successfully"));
    }
}
