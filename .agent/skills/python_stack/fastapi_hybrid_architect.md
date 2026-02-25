# Skill: FastAPI Hybrid Architect

## 🎯 Context
Expert in designing **Hybrid APIs** that serve both Web Clients (HTMX/Jinja2) and Mobile Clients (JSON/REST) from a single codebase, maintaining strict Clean Architecture principles.

## 🛠️ Technical Capabilities

### 1. Hybrid Response Strategy (The "Dichotomy")
*   **Context-Aware Routing**: Detects the `Accept` header or specific request flags to determine the response format.
    *   `text/html` -> Returns `templates.TemplateResponse` (Server-Side Rendering with Jinja2).
    *   `application/json` -> Returns Pydantic v2 Models (Strict JSON for Mobile/External Consumers).
*   **Dual-Purpose Endpoints**: Where possible, reuse the same Use Case logic for both views, only bifurcating at the Interface Adapter (Router) level.

### 2. Clean Architecture Enforcement
*   **Strict Layering**:
    *   **Entities (Domain)**: Pure Python dataclasses or SQLAlchemy models (Framework Agnostic where possible).
    *   **Use Cases (Application)**: Business logic, orchestration, and transaction management. **NO HTTP references here.**
    *   **Interface Adapters (Presentation)**:
        *   **Routers**: Controllers that handle HTTP requests, dependency injection, and response formatting.
        *   **ViewModels**: For complex UI logic.
*   **Dependency Injection**: Use `FastAPI.Depends` to inject Services into Routers, ensuring testability and loose coupling.

### 3. Modern SQLAlchemy (2.0+)
*   **Async First**: All database interactions must use `AsyncSession` and `await`.
*   **Type Safety**: Use `Mapped[]` and `mapped_column()` for robust type hinting.
*   **Repository Pattern**: Encapsulate DB queries in Repositories; Services should never call `db.execute` directly.

## 🧐 Expert Standards (Definition of Done)

### 🛡️ Robust Error Handling
*   **Centralized Exception Handling**: Implement `@app.exception_handler` to catch custom business exceptions.
*   **Adaptive Errors**:
    *   Web: Return a user-friendly HTML error page or HTMX fragment (e.g., toast notification).
    *   Mobile: Return a structured JSON problem detail (RFC 7807) with error codes.

### 🧪 Documentation & Testing
*   **Swagger/OpenAPI**:
    *   Use `response_model` to enforce JSON schema documentation even on hybrid endpoints.
    *   Annotate routes with `summary`, `description`, and `tags`.
*   **Testing Strategy**:
    *   Unit Tests for Services (Mocking DB).
    *   Integration Tests for Routers using `AsyncClient`.

### 🚀 Performance
*   **N+1 Prevention**: aggressively use `selectinload` or `joinedload` in Repositories.
*   **Pydantic V2**: Leverage the speed of Rust-based serialization.
