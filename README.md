# 🧪 NEXOS Labs - Sistema de Gestión de Laboratorios Clínicos (LIS)

NEXOS Labs es una plataforma integral de **Laboratory Information System (LIS)** diseñada para la automatización y gestión de laboratorios clínicos. El sistema facilita la administración de pacientes, órdenes de laboratorio, procesamiento de muestras e integración con equipos de diagnóstico clínico.

## 🚀 Filosofía del Proyecto
"Old School Logic, Modern Speed" - Robustez arquitectónica para datos críticos de salud, mantenimiento limpio y agilidad en el procesamiento de resultados.

## 🛠️ Stack Tecnológico

El proyecto está diseñado para garantizar la integridad de los datos y el alto rendimiento:

- **Backend**: NestJS (v10+) con arquitectura modular y soporte para procesamiento de protocolos de equipos médicos.
- **Frontend Web**: Angular (v20+) con Standalone Components y gestión reactiva de datos.
- **Base de Datos**: PostgreSQL 15 (Almacenamiento relacional de pacientes y resultados).
- **Infraestructura**: Docker & Docker Compose para entornos reproducibles.
- **Integraciones**: Scripts de simulación y procesamiento para equipos como iChroma y DH36.

## 📂 Estructura del Repositorio

```bash
├── backend/            # API REST y motores de procesamiento LIS (NestJS)
├── frontend/           # Interfaz de gestión para laboratoristas y médicos (Angular)
├── docker-compose.yml  # Orquestación de servicios (App + DB + pgAdmin)
├── .env.example        # Plantilla de configuración de entorno
└── .agent/             # Skills especializados para el dominio clínico
```

## ⚙️ Configuración del Entorno

### Requisitos Previos
- Docker y Docker Compose instalados.
- Node.js 20+ (para desarrollo local).

### Pasos para el Setup

1. **Clonar el repositorio:**
   ```bash
   git clone <repository-url>
   cd nexos-labs
   ```

2. **Configurar variables de entorno:**
   ```bash
   cp .env.example .env
   # Asegurar que las credenciales de DB sean correctas
   ```

3. **Lanzar la plataforma:**
   ```bash
   docker compose up --build
   ```

La plataforma estará disponible en:
- **Frontend**: http://localhost:4200
- **Backend (API)**: http://localhost:3000
- **Swagger Docs**: http://localhost:3000/api/docs
- **pgAdmin**: http://localhost:5050

## 🔬 Capacidades LIS
- **Gestión de Pacientes**: Registro y seguimiento histórico.
- **Órdenes de Trabajo**: Emisión y seguimiento de estados de muestras.
- **Integración de Equipos**: Procesamiento de datos crudos de analizadores clínicos.
- **Validación de Resultados**: Flujos de trabajo para revisión clínica.

## 📜 Estándares de Código
- **SOLID & Clean Architecture**: Aplicado rigurosamente para facilitar auditorías y mantenimiento.
- **Seguridad**: Validación estricta de DTOs y manejo seguro de información sensible.
- **Docker-First**: Infraestructura inmutable y portable.

---
© 2026 NEXOS Labs - Clinical Intelligence Solutions.
