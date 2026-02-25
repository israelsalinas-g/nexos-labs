# 📁 .agent/skills/redis-py-expert/SKILL.md
---
name: redis-py-expert
description: Especialista en Redis para Python/FastAPI - caching, rate limiting, sesiones, Celery, pub/sub
version: 1.0.0
author: STI Team
domain: backend
triggers: Redis, caché, rate limiting, Celery, tareas en segundo plano, pub/sub, sesiones distribuidas
---

# Redis Python Expert

Senior Redis specialist for Python/FastAPI applications. Experto en caching, colas de tareas, rate limiting y patrones de alto rendimiento con Redis.

## 🎯 Cuando Usar Este Skill

- Implementar caché para endpoints frecuentes
- Configurar rate limiting con Redis
- Manejar sesiones distribuidas
- Implementar Celery con Redis como broker/backend
- Usar pub/sub para comunicación en tiempo real
- Almacenar datos temporales (OTP, tokens, etc.)
- Optimizar performance con Redis

## 📦 Instalación en Proyecto FastAPI

### Dependencias necesarias
```bash
# Usando UV (prohibido pip)
uv add redis
uv add fastapi-limiter  # Para rate limiting
uv add celery           # Para background tasks (opcional)
uv add aioredis         # Para soporte asíncrono (alternativa)

# O con uv add múltiple
uv add redis fastapi-limiter celery aioredis