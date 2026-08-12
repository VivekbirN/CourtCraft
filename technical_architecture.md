# Technical Architecture: SportZone – Multi-Sport Facility Booking Platform

Complete file-by-file architecture reference. Every file listed with its purpose and exact interconnections.

---

## 1. Root Configuration

| File | Purpose | Interconnections |
|---|---|---|
| `pom.xml` | Maven build config defining Java 21, Spring Boot 3, Spring Security, JPA, PostgreSQL driver, Redis (Lettuce), Lombok dependencies. | Build manifest consumed by Maven to compile the entire backend. |
| `docker-compose.yml` | Orchestrates three containers — Spring Boot app (port 8080), PostgreSQL 16 (port 5432), Redis (port 6379). | References `Dockerfile` for the app image; sets environment variables consumed by `application.yml`. |
| `Dockerfile` | Multi-stage Docker build — Maven build stage + JRE runtime stage producing a lean production image. | Packages the Spring Boot JAR from `target/` into a runnable container image. |

---

## 2. Database & Application Configuration (`src/main/resources`)

| File | Purpose | Interconnections |
|---|---|---|
| `schema.sql` | DDL script creating 5 PostgreSQL tables (`users`, `sports`, `facilities`, `bookings`, `blocked_slots`) and seeding demo data. | Auto-executed by Spring Boot on startup; defines the schema that all JPA entities in `entity/` map to. |
| `application.yml` | Configures server port (8080), PostgreSQL connection, HikariCP pool, Redis host, JWT secret, and booking business rules (max duration, advance window, max active bookings). | Loaded at startup; values injected via `@Value` in `JwtService.java`, `BookingService.java`, and `RedisLockService.java`. |

---

## 3. Java Backend (`src/main/java/com/sportzone`)

### 3.1 Main Application & Config

| File | Purpose | Interconnections |
|---|---|---|
| `SportZoneApplication.java` | Spring Boot entry point annotated with `@SpringBootApplication`. Launches the IoC container and initializes all beans. | Triggers component scanning across all packages. |
| `config/SecurityConfig.java` | Configures Spring Security — BCrypt password encoder, stateless session, CORS, public vs protected route rules. | Registers `JwtAuthFilter.java` in the filter chain before `UsernamePasswordAuthenticationFilter`. |
| `config/RedisConfig.java` | Defines `RedisTemplate<String, String>` bean configured with Lettuce connection factory. | Injected into `RedisLockService.java` and `FacilityService.java` for lock operations and caching. |
| `config/AppConfig.java` | Defines `RestTemplate` bean and `AuthenticationManager` bean. | `AuthenticationManager` injected into `AuthService.java`. |

---

### 3.2 Security Layer (`security/`)

| File | Purpose | Interconnections |
|---|---|---|
| `security/JwtAuthFilter.java` | `OncePerRequestFilter` that extracts `Authorization: Bearer <token>`, validates it, and populates `SecurityContextHolder`. | Uses `JwtService.java` to parse tokens; runs on every protected request before the controller. |
| `security/JwtService.java` | Generates and validates HMAC-SHA256 signed JWTs containing user email and role. Reads secret and expiry from `application.yml`. | Injected into `AuthService.java` (token generation) and `JwtAuthFilter.java` (token validation). |

---

### 3.3 Entities (`entity/`)

| File | Purpose | Interconnections |
|---|---|---|
| `entity/User.java` | JPA entity mapping the `users` table. Fields: id (UUID), email, passwordHash, firstName, lastName, role (enum), status, createdAt. | Implements `UserDetails` for Spring Security; referenced by `UserRepository.java`, `AuthService.java`, `BookingService.java`. |
| `entity/Sport.java` | JPA entity mapping the `sports` table. Fields: id, name, description, isActive. | Referenced by `Facility.java` via `@ManyToOne`; fetched by `SportRepository.java`. |
| `entity/Facility.java` | JPA entity mapping the `facilities` table. Fields: id, sport (ManyToOne), name, description, capacity, isActive, createdAt. | Central entity referenced by `Booking.java` and `BlockedSlot.java` via `@ManyToOne`. |
| `entity/Booking.java` | JPA entity mapping the `bookings` table. Fields: id (UUID), user (ManyToOne), facility (ManyToOne), startTime, endTime, status (enum: CONFIRMED/CANCELLED), createdAt. | Core transactional entity; used by `BookingService.java` for all booking operations. |
| `entity/BlockedSlot.java` | JPA entity mapping the `blocked_slots` table. Fields: id, facility (ManyToOne), startTime, endTime, reason, createdBy (ManyToOne User), createdAt. | Used by `BlockedSlotService.java`; checked during booking overlap detection in `BookingService.java`. |

---

### 3.4 Repositories (`repository/`)

| File | Purpose | Interconnections |
|---|---|---|
| `repository/UserRepository.java` | Spring Data JPA repository for `User`. Custom method: `findByEmail(String email)`. | Used by `AuthService.java` and `JwtAuthFilter.java` for user lookup. |
| `repository/SportRepository.java` | Spring Data JPA repository for `Sport`. Standard CRUD + `findByIsActiveTrue()`. | Used by `SportService.java`. |
| `repository/FacilityRepository.java` | Spring Data JPA repository for `Facility`. Custom methods: `findBySportIdAndIsActiveTrue()`, `findByIdAndIsActiveTrue()`. | Used by `FacilityService.java` and `BookingService.java`. |
| `repository/BookingRepository.java` | Spring Data JPA repository for `Booking`. Key custom method: `findOverlappingBookings(facilityId, startTime, endTime)` — JPQL query checking time overlap on CONFIRMED bookings. | Core query used by `BookingService.java` for overlap detection before every booking insert. |
| `repository/BlockedSlotRepository.java` | Spring Data JPA repository for `BlockedSlot`. Custom method: `findOverlappingBlocks(facilityId, startTime, endTime)`. | Used by `BookingService.java` to reject bookings during blocked periods. |

---

### 3.5 Services (`service/`)

| File | Purpose | Interconnections |
|---|---|---|
| `service/AuthService.java` | Handles registration (BCrypt hash + save) and login (authenticate + generate JWT). Returns `AuthResponse` DTO. | Uses `UserRepository.java`, `JwtService.java`, `BCryptPasswordEncoder` from `SecurityConfig.java`. |
| `service/SportService.java` | Returns list of all active sports. Simple pass-through to repository. | Uses `SportRepository.java`; called by `SportController.java`. |
| `service/FacilityService.java` | Fetches facilities by sport, checks availability for a time window (with Redis cache), adds new facilities, deactivates facilities. | Uses `FacilityRepository.java`, `BookingRepository.java`, `RedisLockService.java`. Caches availability with TTL 60s. |
| `service/BookingService.java` | **Core service.** Creates bookings with full validation: future time check, max duration (3hrs), advance window (7 days), max active bookings (3), blocked slot check, overlap check. Acquires Redis distributed lock before DB write. Handles cancellation with 30-min rule. | Uses `BookingRepository.java`, `FacilityRepository.java`, `BlockedSlotRepository.java`, `RedisLockService.java`. Throws `BusinessRuleViolationException` on rule violations. |
| `service/BlockedSlotService.java` | Admin-only service to create, list, and delete blocked slots. | Uses `BlockedSlotRepository.java`, `FacilityRepository.java`. |
| `service/RedisLockService.java` | Utility service implementing distributed locking using Redis `SETNX` with TTL. Methods: `acquireLock(key, ttl)` and `releaseLock(key)`. | Uses `RedisTemplate` from `RedisConfig.java`; called by `BookingService.java` before every booking write. |

---

### 3.6 Controllers (`controller/`)

| File | Purpose | Interconnections |
|---|---|---|
| `controller/AuthController.java` | Exposes `POST /v1/auth/register` and `POST /v1/auth/login`. Public endpoints, no auth required. | Delegates to `AuthService.java`; returns `ApiResponse` wrapping `AuthResponse` DTO. |
| `controller/SportController.java` | Exposes `GET /v1/sports`. Public endpoint returning all active sports. | Delegates to `SportService.java`. |
| `controller/FacilityController.java` | Exposes facility CRUD and availability endpoints. `GET /v1/facilities`, `GET /v1/facilities/{id}`, `GET /v1/facilities/{id}/availability`, `POST /v1/facilities` (ADMIN), `PATCH /v1/facilities/{id}/deactivate` (ADMIN). | Delegates to `FacilityService.java`; uses `@PreAuthorize` for admin-only endpoints. |
| `controller/BookingController.java` | Exposes booking endpoints. `POST /v1/bookings`, `GET /v1/bookings/my`, `GET /v1/bookings/all` (ADMIN), `GET /v1/bookings/facility/{id}` (ADMIN), `DELETE /v1/bookings/{id}`. | Delegates to `BookingService.java`; extracts authenticated user from `SecurityContextHolder`. |
| `controller/BlockedSlotController.java` | Exposes `POST /v1/blocked-slots`, `GET /v1/blocked-slots`, `DELETE /v1/blocked-slots/{id}`. All ADMIN only. | Delegates to `BlockedSlotService.java`; protected with `@PreAuthorize("hasRole('ADMIN')")`. |

---

### 3.7 DTOs (`dto/`)

| File | Purpose | Interconnections |
|---|---|---|
| `dto/ApiResponse.java` | Generic wrapper `ApiResponse<T>` with fields: success (boolean), message (String), data (T). Used as standard response envelope across all controllers. | Returned by every controller method. |
| `dto/AuthDto.java` | Contains `LoginRequest`, `RegisterRequest`, and `AuthResponse` (token + user summary). | Used by `AuthController.java` and `AuthService.java`. |
| `dto/FacilityDto.java` | Contains `FacilityResponse`, `FacilityAvailabilityResponse`, `CreateFacilityRequest`. | Used by `FacilityController.java` and `FacilityService.java`. |
| `dto/BookingDto.java` | Contains `CreateBookingRequest` (facilityId, startTime, endTime) and `BookingResponse` (full booking details with facility and user info). | Used by `BookingController.java` and `BookingService.java`. |
| `dto/BlockedSlotDto.java` | Contains `CreateBlockedSlotRequest` and `BlockedSlotResponse`. | Used by `BlockedSlotController.java` and `BlockedSlotService.java`. |

---

### 3.8 Exception Handling (`exception/`)

| File | Purpose | Interconnections |
|---|---|---|
| `exception/GlobalExceptionHandler.java` | `@RestControllerAdvice` catching all unhandled exceptions and returning standardized `ApiResponse` error payloads with correct HTTP status codes. | Intercepts `ResourceNotFoundException`, `BusinessRuleViolationException`, `UnauthorizedException`, and Spring validation errors. |
| `exception/ResourceNotFoundException.java` | Thrown when a queried entity (Facility, Booking, Sport) does not exist. Returns HTTP 404. | Thrown by `FacilityService.java`, `BookingService.java`, `BlockedSlotService.java`. |
| `exception/BusinessRuleViolationException.java` | Thrown when a booking violates business rules (overlap, max duration, blocked slot, cancellation window). Returns HTTP 409. | Thrown exclusively by `BookingService.java`. |
| `exception/UnauthorizedException.java` | Thrown when a user attempts an action outside their role permissions. Returns HTTP 403. | Thrown by services when ownership checks fail (e.g. user tries to cancel another user's booking). |

---

## 4. Frontend Client (`frontend/src`)

### 4.1 Entry Point & State

| File | Purpose | Interconnections |
|---|---|---|
| `main.tsx` | React root entry point mounting `<App />` into DOM. | Imports `App.tsx` and `index.css`. |
| `App.tsx` | Configures React Router routes and role-based route protection. | Uses `AppContext.tsx`; wraps protected routes in `DashboardLayout.tsx`. |
| `api/apiClient.ts` | Axios instance with base URL (`http://localhost:8080`) and JWT Bearer token interceptor. | Imported by all page components for API calls. |
| `context/AppContext.tsx` | Global auth state — stores JWT token, user info, role. Provides `useApp()` hook. | Consumed by `DashboardLayout.tsx`, `Login.tsx`, and all page components. |
| `index.css` | Global Tailwind CSS directives and base styles. | Imported by `main.tsx`. |

---

### 4.2 Layout

| File | Purpose | Interconnections |
|---|---|---|
| `layouts/DashboardLayout.tsx` | Sidebar navigation with role-filtered menu items, top header with user info and logout. | Wraps all protected routes; reads role from `AppContext.tsx`. |

---

### 4.3 Pages

| File | Purpose | Interconnections |
|---|---|---|
| `pages/Login.tsx` | Login and registration forms. Submits to `/v1/auth/login` and `/v1/auth/register`. | Updates auth state in `AppContext.tsx` on success. |
| `pages/Facilities.tsx` | Browses all sports and their facilities. Filter by sport. Shows availability status. | Calls `GET /v1/sports` and `GET /v1/facilities`. |
| `pages/BookSlot.tsx` | Booking form — select facility, pick start and end time, submit booking. | Calls `POST /v1/bookings`; shows conflict error on 409. |
| `pages/MyBookings.tsx` | Lists user's own bookings with status badges. Cancel button for upcoming confirmed bookings. | Calls `GET /v1/bookings/my` and `DELETE /v1/bookings/{id}`. |
| `pages/AdminDashboard.tsx` | Admin-only view — all bookings across facilities, blocked slots management, facility deactivation. | Calls `GET /v1/bookings/all`, `POST /v1/blocked-slots`, `DELETE /v1/blocked-slots/{id}`. Protected by role guard. |

---

## 5. Key Design Decisions

### Why Redis for locking instead of DB-level locking?
A PostgreSQL transaction lock would work but creates a bottleneck — the DB connection is held open for the duration of the lock. Redis `SETNX` with TTL is lighter, faster, and releases automatically even if the app crashes mid-operation.

### Why separate `blocked_slots` table instead of fake bookings?
Keeping admin blocks separate from user bookings keeps the data model clean. Reporting on actual bookings vs maintenance windows becomes trivial.

### Why overlap detection in JPQL rather than application code?
The overlap check — `start_time < :endTime AND end_time > :startTime` — is a single indexed DB query. Pulling all bookings into memory and checking in Java would be expensive and not thread-safe.

### Why stateless JWT instead of sessions?
Consistent with the stateless REST API design. No session store needed, scales horizontally without sticky sessions.
