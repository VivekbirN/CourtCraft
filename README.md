# SportZone – Multi-Sport Facility Booking Platform

**SportZone** is a full-stack sports facility booking platform for a multi-sport complex. Users can browse available facilities across 6 sports, book time slots with flexible start and end times, and manage their bookings. Admins manage facilities, view all bookings, and block slots for maintenance.

> Built using **Java 21**, **Spring Boot 3**, **PostgreSQL 16**, **Redis**, and **React SPA (TypeScript + Vite + Tailwind CSS)**.

![Java](https://img.shields.io/badge/Java-21-orange) ![Spring Boot](https://img.shields.io/badge/Spring_Boot-3.x-brightgreen) ![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-blue) ![Redis](https://img.shields.io/badge/Redis-Cache%20%26%20Lock-red) ![React](https://img.shields.io/badge/React-18.x-blue) ![Docker](https://img.shields.io/badge/Docker-Compose-blue)

---

## 🏛 System Architecture

```mermaid
flowchart TB
    classDef client fill:#3b82f6,stroke:#1d4ed8,color:#fff,font-weight:bold;
    classDef backend fill:#10b981,stroke:#047857,color:#fff,font-weight:bold;
    classDef database fill:#6366f1,stroke:#4338ca,color:#fff,font-weight:bold;
    classDef cache fill:#ef4444,stroke:#b91c1c,color:#fff,font-weight:bold;

    subgraph Client_Layer ["Client Layer (React SPA)"]
        React["React + TS + Vite"]:::client
        RBAC_Guard["Role-Based Route Guards"]:::client
    end

    subgraph Backend_Layer ["Enterprise Backend (Spring Boot 3)"]
        SpringBoot["Spring Boot REST API"]:::backend
        SpringSec["Spring Security + JWT"]:::backend
        Redis["Redis (Cache + Distributed Lock)"]:::cache
    end

    subgraph Data_Layer ["Persistence Layer"]
        PostgreSQL[("PostgreSQL DB (5 Relational Tables)")]:::database
    end

    React -->|HTTP REST API| SpringBoot
    SpringBoot <--> SpringSec
    SpringBoot <--> Redis
    SpringBoot <--> PostgreSQL

    style Client_Layer fill:#f0f7ff,stroke:#bfdbfe,stroke-width:2px;
    style Backend_Layer fill:#ecfdf5,stroke:#a7f3d0,stroke-width:2px;
    style Data_Layer fill:#eef2ff,stroke:#c7d2fe,stroke-width:2px;
```

### Stack Components:
- **React SPA**: Minimal dashboard with role-customized views, facility browsing, slot booking, and booking management.
- **Spring Boot 3 Backend**: Core engine handling JWT authentication, booking logic, concurrency control, and REST APIs.
- **PostgreSQL 16**: Relational storage for 5 core tables (`users`, `sports`, `facilities`, `bookings`, `blocked_slots`).
- **Redis**: Dual purpose — distributed locking for concurrent booking prevention, and caching facility availability queries.

---

## 🏟 The Sports Complex

| Sport | Facility Type | Units Available |
|---|---|---|
| Badminton | Courts | 4 courts |
| Cricket | Nets | 3 nets |
| Football | Grounds | 2 grounds |
| Swimming | Lanes | 6 lanes |
| Table Tennis | Tables | 5 tables |
| Pickleball | Courts | 3 courts |

---

## 🌟 Core Modules

| Module | Feature | Capability Description |
|---|---|---|
| **Module 1** | **Authentication** | JWT-based login and registration with BCrypt password encoding. |
| **Module 2** | **Facility Management** | Browse all sports, view individual facilities, check real-time availability for a given time window. |
| **Module 3** | **Slot Booking Engine** | Flexible time-window booking with overlap detection and Redis distributed locking to prevent double booking. |
| **Module 4** | **Booking Management** | Users view and cancel their bookings. Admins view all bookings across all facilities. |
| **Module 5** | **Slot Blocking** | Admins block specific facilities for a time window (maintenance, events) preventing user bookings. |
| **Module 6** | **Availability Cache** | Redis caches facility availability results to reduce repetitive PostgreSQL queries on high-traffic browse endpoints. |
| **Module 7** | **RBAC** | Strict privilege isolation across `USER` and `ADMIN` roles. |

---

## 🛡️ Role-Based Access Control (RBAC)

### 1. User (`USER`)
- **Permissions**: Register, login, browse all sports and facilities, check slot availability, book a facility for a flexible time window, view own bookings, cancel own upcoming bookings.
- **Restrictions**: Cannot view other users' bookings, cannot block slots, cannot manage facilities.

### 2. Administrator (`ADMIN`)
- **Permissions**: All USER permissions plus — view all bookings across all users and facilities, block a facility for a time window (maintenance), unblock slots, add new facilities, deactivate facilities.

---

## ⚙️ Booking Rules

- Users pick a **start time** and **end time** (max 3 hours per booking).
- System checks for **overlapping bookings** on the same facility — no two bookings can share any time overlap.
- **Redis distributed lock** is acquired per facility before processing a booking to prevent race conditions when two users book simultaneously.
- Bookings can be cancelled up to **30 minutes before** the start time.
- Advance booking allowed up to **7 days ahead**.
- Max **3 active bookings** per user at any time.

---

## 🔑 Concurrency Control — How Double Booking is Prevented

When two users try to book the same facility at the same time:

```mermaid
sequenceDiagram
    actor User_A
    actor User_B
    participant Spring as Spring Boot Backend
    participant Redis as Redis Lock
    participant DB as PostgreSQL

    User_A->>Spring: POST /bookings (Court 1, 3pm–5pm)
    User_B->>Spring: POST /bookings (Court 1, 3pm–5pm)
    Spring->>Redis: Acquire lock for facility_id=1
    Redis-->>Spring: Lock acquired (User A)
    Spring->>DB: Check overlapping bookings
    DB-->>Spring: No overlap found
    Spring->>DB: Insert booking for User A
    Spring->>Redis: Release lock
    Redis-->>Spring: Lock acquired (User B)
    Spring->>DB: Check overlapping bookings
    DB-->>Spring: Overlap found → reject
    Spring-->>User_B: 409 Conflict – Slot already booked
    Spring-->>User_A: 201 Created – Booking confirmed
```

---

## 🎬 Platform Flow

```mermaid
sequenceDiagram
    autonumber
    actor User
    participant UI as React UI
    participant Spring as Spring Boot Backend
    participant Redis as Redis
    participant DB as PostgreSQL

    Note over User, UI: Step 1: Authentication
    User->>UI: Login (email + password)
    UI->>Spring: POST /v1/auth/login
    Spring-->>UI: Return JWT token + role

    Note over User, UI: Step 2: Browse Facilities
    User->>UI: Opens Facilities page
    UI->>Spring: GET /v1/facilities?sport=BADMINTON
    Spring->>Redis: Check availability cache
    Redis-->>Spring: Cache miss → query DB
    Spring->>DB: Fetch facilities + active bookings
    DB-->>Spring: Return facility list
    Spring->>Redis: Store in cache (TTL 60s)
    Spring-->>UI: Return available facilities

    Note over User, UI: Step 3: Book a Slot
    User->>UI: Select Court 1, 3pm–5pm, Submit
    UI->>Spring: POST /v1/bookings
    Spring->>Redis: Acquire distributed lock (facility_id=1)
    Spring->>DB: Check time overlap on Court 1
    DB-->>Spring: No conflict found
    Spring->>DB: Insert booking record
    Spring->>Redis: Release lock + invalidate cache
    Spring-->>UI: 201 Booking Confirmed

    Note over User, UI: Step 4: Cancel Booking
    User->>UI: My Bookings → Cancel
    UI->>Spring: DELETE /v1/bookings/{id}
    Spring->>DB: Verify ownership + check 30min rule
    Spring->>DB: Update status = CANCELLED
    Spring-->>UI: 200 Booking Cancelled
```

---

## 📡 REST API Endpoints

### Auth
| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/v1/auth/register` | Public | Register new user |
| POST | `/v1/auth/login` | Public | Login, returns JWT |

### Sports & Facilities
| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/v1/sports` | Public | List all sports |
| GET | `/v1/facilities` | Public | List all facilities (filter by sport) |
| GET | `/v1/facilities/{id}` | Public | Get single facility details |
| GET | `/v1/facilities/{id}/availability` | USER, ADMIN | Check availability for a time window |
| POST | `/v1/facilities` | ADMIN | Add new facility |
| PATCH | `/v1/facilities/{id}/deactivate` | ADMIN | Deactivate a facility |

### Bookings
| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/v1/bookings` | USER, ADMIN | Create a new booking |
| GET | `/v1/bookings/my` | USER, ADMIN | Get own bookings |
| GET | `/v1/bookings/all` | ADMIN | Get all bookings (all users) |
| GET | `/v1/bookings/facility/{id}` | ADMIN | Get all bookings for a facility |
| DELETE | `/v1/bookings/{id}` | USER, ADMIN | Cancel a booking |

### Blocked Slots (Admin Only)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/v1/blocked-slots` | ADMIN | Block a facility for a time window |
| GET | `/v1/blocked-slots` | ADMIN | View all blocked slots |
| DELETE | `/v1/blocked-slots/{id}` | ADMIN | Unblock a slot |

---

## 🚀 Getting Started

### Prerequisites
- **Java**: JDK 21
- **Node.js**: v18+ (with npm)
- **Docker**: Docker Desktop

### Running with Docker Compose

```bash
# Clone the repository
git clone https://github.com/VivekbirN/sportzone.git
cd sportzone

# Start all services (Spring Boot + PostgreSQL + Redis)
docker-compose up --build
```

Access the API at **`http://localhost:8080`**

### Running Manually

#### 1. Backend (Spring Boot)
```bash
# Configure DB credentials in src/main/resources/application.yml
mvn clean package
mvn spring-boot:run
```

#### 2. Frontend (React + Vite)
```bash
cd frontend
npm install
npm run dev
```

Access the frontend at **`http://localhost:5173`**

---

### 🔑 Demo Login Credentials
- **Administrator**: `admin@sportzone.com` / `password123`
- **User**: `user@sportzone.com` / `password123`
