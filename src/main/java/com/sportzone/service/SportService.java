package com.sportzone.service;

import com.sportzone.entity.Sport;
import com.sportzone.repository.SportRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class SportService {

    private final SportRepository sportRepository;

    public SportService(SportRepository sportRepository) {
        this.sportRepository = sportRepository;
    }


    public List<Sport> getAllActiveSports() {
        return sportRepository.findByIsActiveTrue();
    }
}
