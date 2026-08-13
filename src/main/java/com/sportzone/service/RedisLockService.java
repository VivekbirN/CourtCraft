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
        try {
            Boolean result = redisTemplate.opsForValue()
                    .setIfAbsent("lock:" + key, "locked", Duration.ofSeconds(ttlSeconds));
            return Boolean.TRUE.equals(result);
        } catch (Exception e) {
            // Fallback: If Redis is not running or unreachable, allow lock to proceed without crashing
            return true;
        }
    }

    public void releaseLock(String key) {
        try {
            redisTemplate.delete("lock:" + key);
        } catch (Exception e) {
            // Fallback: Ignore Redis connection error on release
        }
    }
}

