# SportZone – Full Project Generation Prompt

Use this prompt with Claude or any AI to generate the complete codebase.
Feed it the README.md, schema.sql, and technical_architecture.md alongside this prompt.

---

## PROMPT

You are a senior Java backend engineer. I need you to generate a complete, production-quality Spring Boot 3 project called **SportZone** — a multi-sport facility booking platform.

I am providing you with three reference documents:
1. `README.md` — full feature description, API endpoints, booking rules, RBAC
2. `schema.sql` — complete PostgreSQL schema with seed data
3. `technical_architecture.md` — every file, its purpose, and its interconnections

Generate the **complete codebase** following these instructions exactly:

---

### Tech Stack
- Java 21
- Spring Boot 3.3.x
- Spring Security 6 with JWT (JJWT library)
- Spring Data JPA + Hibernate
- PostgreSQL 16
- Redis (via Spring Data Redis + Lettuce)
- Lombok
- Maven
- React 18 + TypeScript + Vite + Tailwind CSS (frontend)
- Docker + Docker Compose

---

### Backend Generation Instructions

Generate every file listed in `technical_architecture.md` in the following order:

**1. `pom.xml`**
Include: spring-boot-starter-web, spring-boot-starter-security, spring-boot-starter-data-jpa, spring-boot-starter-data-redis, postgresql driver, jjwt-api + jjwt-impl + jjwt-jackson (0.11.5), lombok, spring-boot-starter-validation.

**2. `src/main/resources/application.yml`**
Include: server port 8080, PostgreSQL datasource config, HikariCP pool (max 10 connections), Redis host/port config, JPA settings (ddl-auto: none, show-sql: false), sql init mode always, JWT secret and expiry config, custom app properties for booking rules (max-duration-hours: 3, advance-booking-days: 7, max-active-bookings: 3, cancellation-cutoff-minutes: 30).

**3. `src/main/resources/schema.sql`**
Use the exact schema provided in schema.sql.

**4. `Dockerfile`**
Multi-stage: stage 1 uses `maven:3.9-eclipse-temurin-21` to build, stage 2 uses `eclipse-temurin:21-jre` to run. Expose port 8080.

**5. `docker-compose.yml`**
Three services: `app` (builds from Dockerfile, port 8080, depends on db and redis), `db` (postgres:16, port 5432, env vars for DB name/user/password, volume for persistence), `redis` (redis:7-alpine, port 6379). All on same network.

**6. Entity classes** (`src/main/java/com/sportzone/entity/`)
Generate all 5 entities: `User.java`, `Sport.java`, `Facility.java`, `Booking.java`, `BlockedSlot.java`.
- Use Lombok `@Data`, `@Builder`, `@NoArgsConstructor`, `@AllArgsConstructor`
- Use `@Entity`, `@Table`, `@Id`, `@GeneratedValue`, `@ManyToOne`, `@JoinColumn` correctly
- `User.java` must implement `UserDetails` from Spring Security
- Use enums for `UserRole` (USER, ADMIN), `UserStatus` (ACTIVE, INACTIVE), `BookingStatus` (CONFIRMED, CANCELLED)

**7. Repository interfaces** (`src/main/java/com/sportzone/repository/`)
Generate all 5 repositories extending `JpaRepository`.
For `BookingRepository.java`, include this exact JPQL query:
```java
@Query("SELECT b FROM Booking b WHERE b.facility.id = :facilityId " +
       "AND b.status = 'CONFIRMED' " +
       "AND b.startTime < :endTime " +
       "AND b.endTime > :startTime")
List<Booking> findOverlappingBookings(
    @Param("facilityId") Integer facilityId,
    @Param("startTime") LocalDateTime startTime,
    @Param("endTime") LocalDateTime endTime
);
```
For `BlockedSlotRepository.java`, include equivalent overlap query for blocked slots.

**8. DTO classes** (`src/main/java/com/sportzone/dto/`)
Generate `ApiResponse.java` (generic wrapper), `AuthDto.java`, `FacilityDto.java`, `BookingDto.java`, `BlockedSlotDto.java`.
Use Java Records or Lombok for all DTOs.

**9. Exception classes** (`src/main/java/com/sportzone/exception/`)
Generate `ResourceNotFoundException.java`, `BusinessRuleViolationException.java`, `UnauthorizedException.java`, `GlobalExceptionHandler.java`.
`GlobalExceptionHandler` must use `@RestControllerAdvice` and return `ApiResponse` with correct HTTP status codes (404, 409, 403, 400, 500).

**10. Security classes** (`src/main/java/com/sportzone/security/`)
Generate `JwtService.java` and `JwtAuthFilter.java`.
- `JwtService`: use JJWT 0.11.5 API — `Jwts.parserBuilder()`, `Keys.hmacShaKeyFor()`, store secret from `application.yml` via `@Value`
- `JwtAuthFilter`: extend `OncePerRequestFilter`, extract Bearer token, validate, set `UsernamePasswordAuthenticationToken` in `SecurityContextHolder`

**11. Config classes** (`src/main/java/com/sportzone/config/`)
Generate `SecurityConfig.java`, `RedisConfig.java`, `AppConfig.java`.
- `SecurityConfig`: stateless sessions, BCrypt encoder, permit `/v1/auth/**` and `GET /v1/sports` and `GET /v1/facilities` publicly, require auth for everything else, enable `@PreAuthorize` with `@EnableMethodSecurity`
- `RedisConfig`: `RedisTemplate<String, String>` with `StringRedisSerializer` for both key and value
- `AppConfig`: `RestTemplate` bean, `AuthenticationManager` bean

**12. Service classes** (`src/main/java/com/sportzone/service/`)
Generate all 6 services: `AuthService.java`, `SportService.java`, `FacilityService.java`, `BookingService.java`, `BlockedSlotService.java`, `RedisLockService.java`.

For `RedisLockService.java`:
```java
public boolean acquireLock(String key, long ttlSeconds) {
    Boolean result = redisTemplate.opsForValue()
        .setIfAbsent("lock:" + key, "locked", Duration.ofSeconds(ttlSeconds));
    return Boolean.TRUE.equals(result);
}

public void releaseLock(String key) {
    redisTemplate.delete("lock:" + key);
}
```

For `BookingService.java` — `createBooking()` must follow this exact sequence:
1. Validate user exists
2. Validate facility exists and is active
3. Check startTime is in future
4. Check duration ≤ 3 hours
5. Check startTime ≤ 7 days from now
6. Check user has < 3 active (CONFIRMED) bookings
7. Check no blocked slots overlap
8. Acquire Redis lock on facility (`facilityId`, TTL 10 seconds)
9. If lock not acquired → throw `BusinessRuleViolationException("Facility is busy, try again")`
10. Inside try block: check overlapping bookings in DB
11. If overlap → release lock, throw `BusinessRuleViolationException("Slot already booked")`
12. Save booking
13. Finally: release lock

For `FacilityService.java` — `getAvailability()` must:
1. Check Redis cache first (key: `availability:{facilityId}:{date}`)
2. On cache miss: query DB for bookings on that day
3. Store result in Redis with TTL 60 seconds
4. Invalidate this cache key when a booking is created or cancelled for this facility

**13. Controller classes** (`src/main/java/com/sportzone/controller/`)
Generate all 5 controllers: `AuthController.java`, `SportController.java`, `FacilityController.java`, `BookingController.java`, `BlockedSlotController.java`.
- All return `ResponseEntity<ApiResponse<T>>`
- Use `@PreAuthorize("hasRole('ADMIN')")` for admin-only endpoints
- Extract current user from `SecurityContextHolder.getContext().getAuthentication().getName()` (returns email)

**14. Main application class**
```java
@SpringBootApplication
public class SportZoneApplication {
    public static void main(String[] args) {
        SpringApplication.run(SportZoneApplication.class, args);
    }
}
```

---

### Frontend Generation Instructions

Generate a minimal React + TypeScript + Vite frontend in a `frontend/` directory.

**Setup files:**
- `package.json` with dependencies: react, react-dom, react-router-dom, axios, tailwindcss, @types/react, @types/react-dom, typescript, vite
- `vite.config.ts` with proxy: `/v1` → `http://localhost:8080`
- `tailwind.config.js`
- `tsconfig.json`
- `index.html`

**Source files (`frontend/src/`):**
- `main.tsx` — mounts App
- `index.css` — Tailwind directives only
- `App.tsx` — React Router with routes: `/login`, `/facilities`, `/book/:facilityId`, `/my-bookings`, `/admin`
- `api/apiClient.ts` — Axios instance with JWT interceptor reading token from localStorage
- `context/AppContext.tsx` — auth state (token, user, role), login/logout handlers
- `layouts/DashboardLayout.tsx` — sidebar with nav links filtered by role, logout button
- `pages/Login.tsx` — email/password form, calls `/v1/auth/login`, stores token in localStorage
- `pages/Facilities.tsx` — lists sports as tabs, shows facilities per sport, link to book
- `pages/BookSlot.tsx` — datetime pickers for start/end, submit button, shows error on conflict
- `pages/MyBookings.tsx` — table of own bookings, cancel button for CONFIRMED upcoming ones
- `pages/AdminDashboard.tsx` — tabs: All Bookings | Block Slots | Manage Facilities

**Keep the frontend minimal — functional HTML with basic Tailwind utility classes. No complex UI components. The CSS will be styled later.**

---

### Generation Rules

1. Generate every file completely — no `// TODO` comments, no placeholder methods
2. Use constructor injection everywhere — no `@Autowired` on fields
3. All endpoints return `ResponseEntity<ApiResponse<T>>`
4. Use `LocalDateTime` for all time fields
5. Package structure: `com.sportzone.*`
6. Every service method must have proper null checks and throw appropriate custom exceptions
7. The `BookingService.createBooking()` Redis lock flow must be implemented exactly as specified above
8. Include the `postman_collection.json` with pre-configured requests for all 15 endpoints

Generate all files now, one by one, in the order listed above.
