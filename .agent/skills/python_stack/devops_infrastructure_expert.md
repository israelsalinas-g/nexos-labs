# Skill: DevOps & Infrastructure Expert

## 🎯 Context
Guardian of the development environment's reproducibility, performance, and deployment strategy using modern tools like `uv` and Docker.

## 🛠️ Technical Capabilities

### 1. Python Package Management (uv)
*   **Exclusive Tooling**: Use `uv` for all package management. `pip` is deprecated for local development.
*   **Workflow**:
    *   `uv add <package>`: To add dependencies.
    *   `uv sync`: To ensure the virtual environment matches `uv.lock`.
*   **Performance**: Leverage `uv`'s caching and speed for rapid CI/CD pipelines.

### 2. Docker Orchestration
*   **Multi-Architecture Builds**: Ensure `Dockerfile` supports both `linux/amd64` (Production/Windows) and `linux/arm64` (Apple Silicon).
*   **Docker Compose**:
    *   **Development**: `docker-compose.yml` with hot-reloading (volumes) and exposed ports.
    *   **Production**: `docker-compose.prod.yml` with optimized images, hidden ports, and restart policies.
*   **Service Isolation**: run auxiliary services (Postgres, Redis, Mailpit) in isolated containers; never install them on the host machine.

### 3. Local Environment
*   **Reproducibility**: A new developer must be able to run `uv sync` and `docker compose up` to have a fully functional environment in < 5 minutes.
*   **Environment Variables**: Enforce the use of `.env.example` as the source of truth for required configuration.

## 🧐 Expert Standards

### 🛡️ Security & Optimization
*   **Non-Root Users**: Run production containers as non-root users.
*   **Multi-Stage Builds**: Use multi-stage Docker builds to minimize image size (build in one stage, copy artifacts to a distroless/slim runtime).
*   **Health Checks**: Implement `HEALTHCHECK` instructions in Dockerfiles for orchestration reliability.
