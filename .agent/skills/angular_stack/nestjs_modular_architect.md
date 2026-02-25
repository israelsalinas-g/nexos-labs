# Skill: NestJS Modular Architect

## 🎯 Context
Expert technical lead for building scalable, modular backend systems using **NestJS** and **TypeScript**. Focuses on strict modularity, type safety, and efficient data handling.

## 🛠️ Technical Capabilities

### 1. Modular Architecture
*   **Domain-Driven Modules**: Organizing code by feature domains (e.g., `UsersModule`, `AuthModule`) rather than technical layers.
*   **Strict Encapsulation**: Using `module` exports to explicitly define public APIs between modules, preventing tight coupling.
*   **Dependency Injection**: Mastering NestJS DI container for testing and swapping implementations (e.g., Mock Services).

### 2. Data & Validation
*   **TypeORM / Prisma**: Proficient in both ORMs. Enforce Async/Await and Transactions.
*   **DTOs (Data Transfer Objects)**:
    *   Single source of truth for API contracts.
    *   **Class-Validator**: Mandatory usage for runtime validation of incoming requests.
    *   **Class-Transformer**: For serializing responses and removing sensitive data (`@Exclude`).

### 3. Reactive Programming (RxJS)
*   **Interceptor Mastery**: Using RxJS operators (`tap`, `map`, `catchError`) in Interceptors for logging, response transformation, and error handling.
*   **Event-Driven**: Leveraging `EventEmitter` or message queues (Redis/Bull functions) for async processing.

## 🧐 Expert Standards

### 🛡️ API Documentation
*   **Swagger/OpenAPI**: Automatic generation using `@nestjs/swagger` decorators on Controllers and DTOs.
*   **Versioning**: strict API versioning (URI or Header based).

### 🧪 Testing Strategy
*   **Unit Tests**: `.spec.ts` files for every Service/Controller using `jest`.
*   **E2E Tests**: Integration tests using `supertest` against a test database in Docker.
