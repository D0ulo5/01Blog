# 01Blog

A full-stack blogging platform built with Angular 17 and Spring Boot 3, featuring JWT authentication, real-time notifications, a subscription feed, media uploads, and a CRT terminal aesthetic.

## Architecture

| Layer      | Stack                                             |
| ---------- | ------------------------------------------------- |
| `frontend` | Angular 17 (standalone components, signals, RxJS) |
| `backend`  | Spring Boot 3, Spring Security, JPA, PostgreSQL   |

The backend follows a strict Controller → Service → Repository layering. Authorization is enforced both at the HTTP level (Spring Security) and at the method level (`@PreAuthorize`, `@EnableMethodSecurity`).

## Features

- **Auth** — JWT-based login/register, BCrypt password hashing, stateless sessions
- **Posts** — CRUD with optional image/video media attachments, paginated explore feed
- **Comments** — threaded comments per post
- **Likes** — per-post like/unlike with live counts
- **Subscriptions** — follow users, get a personalized feed of their posts
- **Notifications** — in-app notifications on new posts, batched for efficiency
- **Reports** — users can report posts/users; admins review and resolve
- **Admin panel** — ban/unban users, promote roles, delete content, manage reports
- **CRT aesthetic** — phosphor-green terminal UI with scanline overlay

## API

```
POST    /api/auth/register
POST    /api/auth/login

GET     /api/posts?page=0&size=20
GET     /api/posts/{id}
POST    /api/posts
PUT     /api/posts/{id}
DELETE  /api/posts/{id}

GET     /api/posts/feed
GET     /api/posts/feed/page?page=0&size=10

GET     /api/users/me
GET     /api/users/profile/{username}
PUT     /api/users/{id}

GET     /api/notifications
PATCH   /api/notifications/{id}/read
DELETE  /api/notifications

GET     /api/subscriptions
POST    /api/subscriptions/{userId}
DELETE  /api/subscriptions/{userId}

POST    /api/reports
GET     /api/reports              (admin)
PATCH   /api/reports/{id}/resolve (admin)
```

## Getting Started

```bash
git clone https://github.com/<your-username>/01Blog
cd 01Blog
```

### Configuration

Before running, set the JWT secret in `backend/src/main/resources/application.properties`:

```properties
jwt.secret=your_long_random_secret_here
```

In production, inject it via environment variable instead of hardcoding:

```properties
jwt.secret=${JWT_SECRET}
cors.allowed-origins=${CORS_ORIGINS}
```

### Run Backend

```bash
cd backend
./mvnw spring-boot:run
```

Requires PostgreSQL running at `localhost:5432` with database `blogdb` (see `application.properties`).

### Run Frontend

```bash
cd frontend
npm install
ng serve
```

Frontend: `http://localhost:4200` · Backend: `http://localhost:8080`

## Built With

- Angular 17 — standalone components, signals, lazy-loaded routes
- Spring Boot 3.5 — web, security, data JPA, validation
- PostgreSQL — primary database
- JWT (jjwt 0.11) — stateless authentication
- Lombok — backend boilerplate reduction
