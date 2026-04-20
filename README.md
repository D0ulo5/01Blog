# Blogging Platform

A full-stack blogging platform built with Angular and Spring Boot, focusing on clean REST architecture, separation of concerns, and scalable backend design.

## Overview

This project is a client-server web application where users can create, manage, and browse blog posts through a REST API.

The backend exposes structured endpoints for post management, while the frontend consumes these endpoints to render a dynamic, reactive user interface.

## Architecture

Two main applications:

| Layer      | Responsibility                                    |
| ---------- | ------------------------------------------------- |
| `frontend` | Angular SPA, UI rendering, HTTP client            |
| `backend`  | Spring Boot API, business logic, data persistence |

### Backend

* RESTful API design
* Controller → Service → Repository layering
* Handles validation, business logic, and database interaction

### Frontend

* Component-based UI with Angular
* Reactive data flow using RxJS
* HTTP services for API communication

## Features

* CRUD operations for blog posts
* REST API with structured endpoints
* Dynamic frontend with real-time updates from API
* Clean separation between frontend and backend

## API

```http
GET     /api/posts
GET     /api/posts/{id}
POST    /api/posts
PUT     /api/posts/{id}
DELETE  /api/posts/{id}
```

## Data Flow

1. User interacts with Angular UI
2. Frontend sends HTTP request to backend
3. Spring Boot processes request (controller → service → repository)
4. Database is queried/updated
5. Response returned as JSON
6. Frontend updates UI reactively

## Getting Started

```bash
git clone https://github.com/<your-username>/<repo-name>
cd <repo-name>
```

### Run Backend

```bash
cd backend
./mvnw spring-boot:run
```

### Run Frontend

```bash
cd frontend
npm install
ng serve
```

Frontend runs on `http://localhost:4200`
Backend runs on `http://localhost:8080`

## Built With

* Angular — frontend framework
* Spring Boot — backend framework
* Java — backend language
* TypeScript — frontend language
* REST — API design

## Notes

* Designed with scalability and maintainability in mind
* Backend structure follows standard layered architecture
* Frontend and backend are fully decoupled

---

## Future Work

* Authentication (JWT-based)
* Comments system
* Role-based access control
* Deployment with Docker
