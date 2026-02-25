# 📁 .agent/skills/redis-ts-expert/SKILL.md
---
name: redis-ts-expert
description: Especialista en Redis para TypeScript/NestJS - caching, BullMQ, rate limiting, sesiones, pub/sub
version: 1.0.0
author: STI Team
domain: backend
triggers: Redis, caché, BullMQ, rate limiting, sesiones, pub/sub, tareas en segundo plano, colas
---

# Redis TypeScript Expert

Senior Redis specialist for NestJS/TypeScript applications. Experto en caching, colas de tareas con BullMQ, rate limiting, sesiones distribuidas y patrones de alto rendimiento.

## 🎯 Cuando Usar Este Skill

- Implementar caché para endpoints frecuentes [citation:3]
- Configurar BullMQ para background jobs [citation:5][citation:10]
- Rate limiting con Redis [citation:8]
- Manejo de sesiones distribuidas
- Pub/Sub para comunicación en tiempo real entre servicios [citation:1]
- Almacenamiento de datos temporales (OTP, tokens, rate counters)
- Optimizar performance de APIs con estrategias de caché [citation:3]
- Procesamiento asíncrono de tareas largas (reportes, emails, notificaciones) [citation:5][citation:9]

## 📦 Instalación en Proyecto NestJS

### Dependencias necesarias
```bash
# Usando pnpm (recomendado para el stack TS)
pnpm add @nestjs/bullmq bullmq ioredis
pnpm add @nestjs/cache-manager cache-manager cache-manager-redis-yet
pnpm add -D @types/ioredis

# O con npm
npm install @nestjs/bullmq bullmq ioredis @nestjs/cache-manager cache-manager cache-manager-redis-yet
npm install -D @types/ioredis