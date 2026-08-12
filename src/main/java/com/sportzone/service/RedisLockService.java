package com.sportzone.service;

import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;

@Service
public class RedisLockService {

    private final RedisTemplate<String, String> redisTemplate;

    public RedisLockService(RedisTemplate<String, String> redisTemplate) {
        this.redisTemplate = redisTemplate;
    }


    public boolean acquireLock(String key, long ttlSeconds) {
        Boolean result = redisTemplate.opsForValue()
                .setIfAbsent("lock:" + key, "locked", Duration.ofSeconds(ttlSeconds));
        return Boolean.TRUE.equals(result);
    }

    public void releaseLock(String key) {
        redisTemplate.delete("lock:" + key);
    }
}
