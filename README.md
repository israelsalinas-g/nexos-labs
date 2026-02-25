# 🏥 Nexos Labs - Sistema Residencial Inteligente

Nexos Labs es una solución integral diseñada para la gestión moderna de complejos residenciales. Este ecosistema digital conecta a residentes, administradores y personal de seguridad para optimizar la comunicación, el control de acceso y la administración financiera.

## 🚀 Filosofía del Proyecto
"Old School Logic, Modern Speed" - Robustez arquitectónica, mantenimiento limpio y agilidad en el desarrollo.

## 🛠️ Stack Tecnológico

El proyecto está construido siguiendo los estándares de **Clean Architecture** y **Type-Safe Development**:

- **Backend**: NestJS (v10+) con arquitectura modular.
- **Frontend Web**: Angular (v20+) con Standalone Components y Zoneless architecture.
- **Base de Datos**: PostgreSQL 15.
- **Infraestructura**: Docker & Docker Compose.
- **ORM**: TypeORM con migraciones estructuradas.

## 📂 Estructura del Repositorio

```bash
├── backend/            # API REST modular desarrollada con NestJS
├── frontend/           # Aplicación web moderna con Angular
├── docker-compose.yml  # Orquestación de servicios
├── .env.example        # Plantilla de configuración de entorno
└── .agent/             # Configuraciones y skills del agente de IA
```

## ⚙️ Configuración del Entorno

### Requisitos Previos
- Docker y Docker Compose instalados.
- Node.js 20+ (para desarrollo local fuera de Docker).

### Pasos para el Setup

1. **Clonar el repositorio:**
   ```bash
   git clone <repository-url>
   cd nexos-labs
   ```

2. **Configurar variables de entorno:**
   ```bash
   cp .env.example .env
   # Ajustar valores en .env si es necesario
   ```

3. **Lanzar la plataforma con Docker:**
   ```bash
   docker compose up --build
   ```

La aplicación estará disponible en:
- **Frontend**: http://localhost:4200
- **Backend (API)**: http://localhost:3000
- **Swagger Docs**: http://localhost:3000/api/docs
- **pgAdmin**: http://localhost:5050 (Credenciales por defecto en `.env`)

## 🏗️ Guía de Desarrollo

### Backend (NestJS)
Para ejecutar el backend de forma local fuera de Docker:
```bash
cd backend
npm install
npm run start:dev
```

### Frontend (Angular)
Para ejecutar el frontend de forma local:
```bash
cd frontend
npm install
npm start
```

## 📜 Estándares de Código
- **SOLID & DRY**: Principios fundamentales en cada módulo.
- **Naming**: Variables y funciones semánticas y descriptivas.
- **Docker-First**: Todo servicio externo debe ejecutarse en contenedores.

---
© 2026 Nexos Labs - Partnered with STI Team.
