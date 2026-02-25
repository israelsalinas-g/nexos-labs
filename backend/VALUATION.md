# 💼 VALORACIÓN DE ACTIVO INTANGIBLE - LIS SYSTEM

## Sistema de Información Laboratorial (Laboratory Information System)

**Empresa:** [Tu Empresa]  
**Fecha de Valoración:** Noviembre 8, 2025  
**Valor Base del Activo:** USD $30,000.00  

---

## 📊 DESGLOSE POR MÓDULOS - HORAS-HOMBRE Y VALORACIÓN

### SUPUESTOS DE CÁLCULO

| Concepto | Valor |
|----------|-------|
| **Tarifa Horaria Promedio Developer** | $40/hora |
| **Tarifa Horaria Promedio Senior/Lead** | $60/hora |
| **Tarifa Horaria Promedio QA/Testing** | $35/hora |
| **Tarifa Horaria Promedio DevOps/Infra** | $50/hora |

---

## 📋 ANÁLISIS DETALLADO POR MÓDULO

### **MÓDULO 1: SISTEMA BÁSICO (Users, Patients, Doctors)**

| Actividad | Horas | Tarifa | Subtotal |
|-----------|-------|--------|----------|
| Diseño de Entidades y Schema BD | 8 | $60 | $480 |
| Implementación Entity Models (3) | 12 | $40 | $480 |
| Implementación Controladores (5 endpoints) | 20 | $40 | $800 |
| Implementación Servicios (business logic) | 16 | $40 | $640 |
| Autenticación JWT + bcrypt | 16 | $60 | $960 |
| Sistema de Avatares | 8 | $40 | $320 |
| DTOs y Validaciones | 12 | $40 | $480 |
| Testing Unitario | 12 | $35 | $420 |
| Documentación Swagger/OpenAPI | 8 | $40 | $320 |
| Integración con BD + Migrations | 8 | $50 | $400 |
| **SUBTOTAL MÓDULO 1** | **120** | | **$5,300** |

---

### **MÓDULO 2: PRUEBAS ESPECIALES iCHROMA II**

| Actividad | Horas | Tarifa | Subtotal |
|-----------|-------|--------|----------|
| Análisis de Especificación iChroma | 12 | $60 | $720 |
| Diseño de Entidades iChromaResult | 10 | $60 | $600 |
| Implementación Parseo de Datos del Equipo | 24 | $60 | $1,440 |
| Implementación API Recepción (/data) | 16 | $40 | $640 |
| Implementación CRUD iChroma Results | 16 | $40 | $640 |
| Asignación Paciente a Resultados | 12 | $40 | $480 |
| Búsqueda y Filtrado | 8 | $40 | $320 |
| Paginación (4 por página) | 6 | $40 | $240 |
| DTOs y Validaciones iChroma | 10 | $40 | $400 |
| Testing Unitario + Integración | 16 | $35 | $560 |
| Testing con Datos Reales del Equipo | 12 | $35 | $420 |
| Documentación Swagger | 8 | $40 | $320 |
| **SUBTOTAL MÓDULO 2** | **150** | | **$6,780** |

---

### **MÓDULO 3: HEMOGRAMAS (DYMIND DH36)**

| Actividad | Horas | Tarifa | Subtotal |
|-----------|-------|--------|----------|
| Análisis de Especificación Dymind | 12 | $60 | $720 |
| Diseño de Entidades DH36Result + Parameters | 12 | $60 | $720 |
| Implementación Parseo Parámetros (21 items) | 32 | $60 | $1,920 |
| Implementación API Recepción (/data) | 16 | $40 | $640 |
| Implementación CRUD DH36 Results | 16 | $40 | $640 |
| Gestión de Parámetros | 12 | $40 | $480 |
| Asignación Paciente a Hemogramas | 12 | $40 | $480 |
| Dashboard Estadísticas + Trends | 16 | $50 | $800 |
| Búsqueda y Filtrado por Parámetros | 10 | $40 | $400 |
| Paginación | 6 | $40 | $240 |
| DTOs y Validaciones DH36 | 12 | $40 | $480 |
| Testing Unitario + Integración | 18 | $35 | $630 |
| Testing con Datos Reales del Equipo | 14 | $35 | $490 |
| Documentación Swagger | 8 | $40 | $320 |
| **SUBTOTAL MÓDULO 3** | **176** | | **$8,540** |

---

### **MÓDULO 4: EXÁMENES CLÁSICOS (ORINA Y HECES)**

| Actividad | Horas | Tarifa | Subtotal |
|-----------|-------|--------|----------|
| Diseño Entidades UrineTest + StoolTest | 10 | $60 | $600 |
| Implementación Entity Models (2) | 12 | $40 | $480 |
| Implementación CRUD Urine Tests | 14 | $40 | $560 |
| Implementación CRUD Stool Tests | 14 | $40 | $560 |
| Campos Específicos + Enums | 10 | $40 | $400 |
| Asignación Paciente a Exámenes | 12 | $40 | $480 |
| Búsqueda y Filtrado | 8 | $40 | $320 |
| Paginación | 6 | $40 | $240 |
| DTOs y Validaciones | 12 | $40 | $480 |
| Testing Unitario | 12 | $35 | $420 |
| Documentación Swagger | 6 | $40 | $240 |
| **SUBTOTAL MÓDULO 4** | **116** | | **$4,380** |

---

## 🏗️ INFRAESTRUCTURA Y COMPONENTES TRANSVERSALES

| Actividad | Horas | Tarifa | Subtotal |
|-----------|-------|--------|----------|
| **Dashboard y Analytics** | | | |
| - Diseño de estructura | 8 | $60 | $480 |
| - Implementación 8 tarjetas | 16 | $40 | $640 |
| - Queries complejas + optimización | 12 | $60 | $720 |
| **Historial de Pacientes** | | | |
| - Diseño endpoint timeline | 6 | $60 | $360 |
| - Implementación getPatientWithExamsHistory | 12 | $40 | $480 |
| - Agregación de datos multi-tabla | 8 | $50 | $400 |
| **API REST + Documentación** | | | |
| - Swagger/OpenAPI setup | 6 | $40 | $240 |
| - Error handling + interceptors | 10 | $50 | $500 |
| - Validaciones DTOs (transversales) | 12 | $40 | $480 |
| - Paginación estandarizada | 8 | $40 | $320 |
| **Base de Datos** | | | |
| - Diseño schema PostgreSQL | 10 | $60 | $600 |
| - Configuración UUID + soft-delete | 8 | $50 | $400 |
| - Migrations setup | 6 | $50 | $300 |
| - Índices y optimización | 8 | $60 | $480 |
| **Configuración del Proyecto** | | | |
| - Setup NestJS + estructura modular | 8 | $60 | $480 |
| - Configuración TypeORM | 6 | $50 | $300 |
| - Environment config | 4 | $40 | $160 |
| - ESLint + Prettier + TSConfig | 6 | $40 | $240 |
| **Gestión de Versiones y Deployment** | | | |
| - Git workflow + commits semánticos | 4 | $50 | $200 |
| - Integración básica CI/CD | 8 | $60 | $480 |
| **Testing Transversal** | | | |
| - Setup Jest + configuración | 6 | $50 | $300 |
| - Tests E2E básicos | 10 | $35 | $350 |
| **SUBTOTAL INFRAESTRUCTURA** | **157** | | **$8,420** |

---

## 📊 RESUMEN CONSOLIDADO

| Módulo | Horas | Valor Hora Promedio | Total USD |
|--------|-------|---------------------|-----------|
| **Módulo 1: Sistema Básico** | 120 | $44.17 | $5,300 |
| **Módulo 2: iChroma II** | 150 | $45.20 | $6,780 |
| **Módulo 3: Hemogramas DH36** | 176 | $48.52 | $8,540 |
| **Módulo 4: Orina y Heces** | 116 | $37.76 | $4,380 |
| **Infraestructura Compartida** | 157 | $53.63 | $8,420 |
| **TOTAL PROYECTO** | **719 horas** | **$45.90/hora** | **$33,020** |

---

## 💰 VALORACIÓN FINAL

### Resumen Económico

```
Horas Totales de Desarrollo:     719 horas
Tarifa Horaria Promedio:         $45.90/hora
Valor Bruto de Desarrollo:       $33,020.00

Aplicar Factor de Ingeniería:    85% (conservador, por mejoras futuras)
Valor Neto de Valoración:        $28,067.00

Valor Recomendado (redondeado):  $30,000.00
```

### Justificación del Rango

| Escenario | Cálculo | Valor USD |
|-----------|---------|-----------|
| **Conservador (80% del total)** | 33,020 × 0.80 | $26,416 |
| **Moderado (90% del total)** | 33,020 × 0.90 | $29,718 |
| **Premium (100% del total)** | 33,020 × 1.00 | $33,020 |
| **Recomendado para Contabilidad** | - | **$30,000** |

---

## 📝 ASIENTO CONTABLE PROPUESTO

```
Fecha: Noviembre 8, 2025

DÉBITO:  Activos Intangibles - Software LIS        $30,000.00
  CRÉDITO: Capital Social / Patrimonio Neto                    $30,000.00
           (Capitalización de software desarrollado internamente)

Descripción: Reconocimiento de software LIS desarrollado
Módulos: Básico, iChroma II, Hemogramas, Orina/Heces
Estado: Operativo y en producción
```

---

## 📋 DEPRECIACIÓN CONTABLE (Método Lineal)

### Opción A: Período 5 Años (Norma NIIF Típica)
```
Depreciación Anual:        $30,000 ÷ 5 = $6,000.00/año
Depreciación Mensual:      $6,000 ÷ 12 = $500.00/mes
Valor Residual (Año 5):    $0.00
```

### Opción B: Período 7 Años (Más Conservador)
```
Depreciación Anual:        $30,000 ÷ 7 = $4,285.71/año
Depreciación Mensual:      $4,285.71 ÷ 12 = $357.14/mes
Valor Residual (Año 7):    $0.00
```

### Opción C: Período 3 Años (Tecnología de Rápida Obsolescencia)
```
Depreciación Anual:        $30,000 ÷ 3 = $10,000.00/año
Depreciación Mensual:      $10,000 ÷ 12 = $833.33/mes
Valor Residual (Año 3):    $0.00
```

**Recomendación:** Usar **5 años** (estándar de software empresarial)

---

## ✅ CRITERIOS CUMPLIDOS PARA CAPITALIZACIÓN

- ✅ **Identificable:** Software LIS con módulos bien definidos
- ✅ **Controlable:** Desarrollado internamente, propiedad exclusiva
- ✅ **Generador de Beneficios:** Mejora eficiencia operativa del laboratorio
- ✅ **Probable que genere flujos económicos:** Reduce costos operativos
- ✅ **Costo Determinable:** 719 horas × $45.90/hora = $33,020
- ✅ **Vida útil Identificable:** 5 años (periódica depreciación)
- ✅ **En Funcionamiento:** Operativo desde [fecha]

---

## 🔄 AUDITORÍA Y VERIFICACIÓN

### Documentación de Respaldo
1. ✅ Repositorio Git con histórico de commits
2. ✅ Código fuente versionado (GitHub)
3. ✅ Documentación técnica (Swagger/OpenAPI)
4. ✅ Configuración ProductIva
5. ✅ Testing framework configurado

### Criterios NIIF Cumplidos
- Definición de Activo Intangible: ✅
- Reconocimiento Inicial: ✅
- Medición Posterior: ✅ (Depreciación lineal)
- Revelación en EEFF: ✅

---

## 📌 NOTAS IMPORTANTES

1. **Horas estimadas** basadas en desarrollo típico de sistemas LIS integrados
2. **Tarifas** son promedios de mercado para desarrolladores en Latinoamérica
3. **Valor recomendado ($30,000)** es conservador y defensible en auditoría
4. **Componentes pendientes** (Orders, Profiles, Sections, Frontend) = valor adicional futuro
5. **Mantenimiento y soporte** NO incluido en esta valoración (es un gasto anual)
6. **Incrementos futuros** por nuevos módulos deben capitalizarse adicionalmente

---

**Preparado:** Análisis Técnico-Contable  
**Validez:** A partir de Noviembre 8, 2025  
**Revisión Recomendada:** Anualmente o ante cambios significativos en funcionalidad

