# Plantilla de Proyecto PDCA — MorganTask

| | |
|---|---|
| **Nombre del proyecto** | MorganTask — API REST de Gestión de Tareas |
| **Proceso** | Migración MVC → Clean Architecture + Aseguramiento de Calidad (McCall) |
| **Líder de equipo** | Sebastián Parra |
| **Total de ciclos** | 2 |

---

# CICLO 1 — Implementación Base + Línea de Calidad

| **Gerente del proyecto** | **Horas esperadas** | **Progreso** | **Período** |
|---|---|---|---|
| Sebastián Parra | 32 h | 78% | 28/04/2026 – 17/05/2026 |

```
        Actuar  │  Planificar
         20%    │    100%
        ────────┼────────
        Verificar│  Hacer
          71%   │    71%
```

## Tabla de Seguimiento — Ciclo 1

| Etapa | Acciones | Responsable | Fecha límite | Duración (h) | % Completo | Estado | Factor McCall / Notas |
|---|---|---|---|---|---|---|---|
| **Planificar** | Definir problema y alcance (MorganTask): CRUD de tareas, proyectos, notas, equipos con JWT | Sebastián Parra | 28/04/2026 | 2.0 | 100% | ✅ Completado | Correctness — requisitos funcionales claros y documentados |
| **Planificar** | Mapear requisitos a factores de calidad McCall (tabla de trazabilidad) | Luis Sagnay | 28/04/2026 | 1.5 | 100% | ✅ Completado | Integrity→JWT, Testability→Coverage, Correctness→Tests, Portability→Docker |
| **Planificar** | Diseñar arquitectura Clean Architecture (4 capas: domain/application/infrastructure/interfaces) | Jefferson Yepez | 29/04/2026 | 3.0 | 100% | ✅ Completado | Maintainability + Reusability — regla de dependencia aplicada |
| **Planificar** | Configurar entorno: Node.js 20, TypeScript strict, MongoDB, Docker Compose | Wilmer Buestan | 29/04/2026 | 2.0 | 100% | ✅ Completado | Portability — docker-compose.yml con mongo + backend + frontend |
| **Hacer** | Implementar capa Domain: entidades ITask, IProject, IUser, INote + puertos (interfaces) | Jefferson Masapanta | 01/05/2026 | 3.0 | 100% | ✅ Completado | Correctness — entidades puras sin dependencias de frameworks |
| **Hacer** | Implementar capa Application: 5 use cases (Auth, Task, Project, Note, Team) | Sebastián Parra | 03/05/2026 | 5.0 | 100% | ✅ Completado | Reusability — lógica de negocio desacoplada e inyectable |
| **Hacer** | Implementar capa Infrastructure: repositorios Mongo, modelos Mongoose, JWT, bcrypt | Luis Sagnay | 05/05/2026 | 4.0 | 100% | ✅ Completado | Portability — implementaciones intercambiables vía interfaces |
| **Hacer** | Implementar capa Interfaces: controllers Express, middleware, rutas, validaciones | Jefferson Yepez | 07/05/2026 | 4.0 | 100% | ✅ Completado | Interoperability — controllers delgados, validación express-validator |
| **Hacer** | Migrar MVC → Clean Architecture: eliminar archivos viejos, 0 errores TypeScript | Wilmer Buestan | 08/05/2026 | 3.0 | 100% | ✅ Completado | tsc --noEmit: 0 errores. Eliminados controllers/, models/, routes/ MVC |
| **Hacer** | Crear pipeline DevSecOps en GitHub Actions: build → test → SonarCloud → Docker | Wilmer Buestan | 16/05/2026 | 2.5 | 0% | ❌ Sin iniciar | Portability + Integrity — CI/CD continuo en cada push a main |
| **Hacer** | Configurar Vitest + @testing-library/react en el frontend (vite.config.ts) | Jefferson Yepez | 15/05/2026 | 1.5 | 0% | ❌ Sin iniciar | Testability — entorno de pruebas frontend con jsdom |
| **Verificar** | Configurar Jest + ts-jest + umbrales de cobertura (jest.config.js) | Jefferson Masapanta | 10/05/2026 | 1.5 | 100% | ✅ Completado | Testability — umbral mínimo 85%, reportes lcov generados |
| **Verificar** | Escribir 46 tests unitarios backend para los 5 use cases con mocks | Sebastián Parra | 11/05/2026 | 5.0 | 100% | ✅ Completado | Correctness + Reliability — 46/46 passed, 100% cobertura |
| **Verificar** | Escribir pruebas frontend con Vitest: utils, policies, componentes UI | Sebastián Parra | 17/05/2026 | 3.0 | 0% | ❌ Sin iniciar | Testability + Correctness — objetivo cobertura > 85% frontend |
| **Verificar** | Ejecutar análisis ESLint + eslint-plugin-security | Luis Sagnay | 12/05/2026 | 1.0 | 100% | ✅ Completado | Maintainability — 0 errores, 28 warnings (tipos any, unused vars) |
| **Verificar** | Integrar SonarCloud: SAST + Quality Gate (Bugs 0, deuda < 5%) | Luis Sagnay | 16/05/2026 | 1.5 | 0% | ❌ Sin iniciar | Maintainability + Integrity — sonar-project.properties + SONAR_TOKEN |
| **Verificar** | Ejecutar npm audit --audit-level=high | Jefferson Yepez | 12/05/2026 | 0.5 | 100% | ✅ Completado | Integrity — 2 vulnerabilidades en tar (dep. de build de bcrypt, no runtime) |
| **Verificar** | Calcular Quality Score McCall con motor QualityScore.ts | Wilmer Buestan | 12/05/2026 | 1.0 | 100% | ✅ Completado | Score Ciclo 1: **68.8/100** — Testability:100 Correctness:100 Maint:44 Integrity:0 |
| **Actuar** | Documentar hallazgos, métricas reales y plan de mejora para Ciclo 2 | Jefferson Masapanta | 13/05/2026 | 2.0 | 80% | 🔄 En curso | Evidencia de mejora continua — este documento |
| **Actuar** | Identificar 28 code smells (`any`) y 2 vulnerabilidades como objetivos del Ciclo 2 | Sebastián Parra | 15/05/2026 | 1.0 | 80% | 🔄 En curso | Maintainability 44 pts + Integrity 0 pts → plan de corrección documentado |

---

## Panel por Etapa — Ciclo 1

### 🔴 Planificar — 100%

| Acción | % |
|---|---|
| Definir problema y alcance | 100% |
| Mapear requisitos → McCall | 100% |
| Diseñar Clean Architecture | 100% |
| Configurar entorno Docker | 100% |

### 🔵 Hacer — 71%

| Acción | % |
|---|---|
| Capa Domain (entidades + puertos) | 100% |
| Capa Application (5 use cases) | 100% |
| Capa Infrastructure (repos + seguridad) | 100% |
| Capa Interfaces (controllers + rutas) | 100% |
| Migración MVC → Clean Architecture | 100% |
| Pipeline CI/CD GitHub Actions | 0% |
| Configurar Vitest frontend | 0% |

### 🟡 Verificar — 71%

| Acción | % |
|---|---|
| Configurar Jest + cobertura backend | 100% |
| 46 tests unitarios backend | 100% |
| ESLint + security plugin | 100% |
| npm audit (seguridad) | 100% |
| Quality Score McCall: **68.8/100** | 100% |
| Tests frontend con Vitest | 0% |
| SonarCloud análisis + Quality Gate | 0% |

### 🟢 Actuar — 20%

| Acción | % |
|---|---|
| Documentar hallazgos + plan Ciclo 2 | 80% |
| Identificar objetivos de mejora | 80% |

---

## Métricas McCall — Ciclo 1

| Factor McCall | Herramienta | Resultado | Umbral | ¿Cumple? |
|---|---|---|---|---|
| Testability | Jest --coverage | 100% cobertura backend | ≥ 85% | ✅ |
| Testability | Vitest (frontend) | — pendiente — | ≥ 85% | ⏳ |
| Correctness | Jest (46 tests) | 0 defectos funcionales | 0 bugs | ✅ |
| Maintainability | ESLint | 28 warnings (any, unused vars) | < 5% deuda | ⚠️ |
| Maintainability | SonarCloud Quality Gate | — pendiente — | Grado A | ⏳ |
| Integrity | npm audit | 2 high (build dep., no runtime) | 0 CVEs críticos | ⚠️ |
| Portability | Docker Compose | Build exitoso local | CI verde | ⚠️ |
| Portability | GitHub Actions CI/CD | — pendiente — | Pipeline verde | ⏳ |

**Quality Score Ciclo 1: 68.8 / 100 — Nivel: Aceptable**

> Fórmula: (Testability×0.30) + (Correctness×0.30) + (Maintainability×0.20) + (Integrity×0.20)
> = (100×0.30) + (100×0.30) + (44×0.20) + (0×0.20) = **68.8**

---
---

# CICLO 2 — Mejora Continua + Calidad Objetivo

| **Gerente del proyecto** | **Horas esperadas** | **Progreso** | **Período** |
|---|---|---|---|
| Sebastián Parra | 18 h | 0% | 17/05/2026 – 05/06/2026 |

```
        Actuar  │  Planificar
          0%    │     0%
        ────────┼────────
        Verificar│  Hacer
          0%    │    0%
```

> **Objetivo:** Elevar Quality Score de 68.8 → 96/100 (Nivel Excelente)
> Mejoras proyectadas: Maintainability 44→80 (+7.2 pts) · Integrity 0→100 (+20 pts) · Portability y Testability completados

## Tabla de Seguimiento — Ciclo 2

| Etapa | Acciones | Responsable | Fecha límite | Duración (h) | % Completo | Estado | Factor McCall / Notas |
|---|---|---|---|---|---|---|---|
| **Planificar** | Definir objetivos Ciclo 2: Quality Score 96/100 basado en hallazgos del Ciclo 1 | Jefferson Masapanta | 17/05/2026 | 1.0 | 0% | ❌ Sin iniciar | Score proyectado: (100×0.30)+(100×0.30)+(80×0.20)+(100×0.20) = 96/100 |
| **Planificar** | Priorizar acciones por impacto en Quality Score (Integrity +20, Maintainability +7.2) | Sebastián Parra | 17/05/2026 | 0.5 | 0% | ❌ Sin iniciar | Integrity es el de mayor impacto individual (20 puntos) |
| **Hacer** | Corregir 28 code smells: reemplazar `any` con tipos concretos en ports y repositorios | Sebastián Parra / Luis Sagnay | 20/05/2026 | 3.0 | 0% | ❌ Sin iniciar | Maintainability — proyectado: 44 → 80 pts (+7.2 en score total) |
| **Hacer** | Resolver 2 vulnerabilidades: ejecutar `npm audit fix` en bcrypt/tar | Jefferson Yepez | 19/05/2026 | 0.5 | 0% | ❌ Sin iniciar | Integrity — proyectado: 0 → 100 pts (+20 en score total) |
| **Hacer** | Crear pipeline GitHub Actions (.github/workflows/ci.yml): build, Jest, Vitest, SonarCloud, Docker | Wilmer Buestan | 22/05/2026 | 2.5 | 0% | ❌ Sin iniciar | Portability + Integrity — pipeline DevSecOps completo |
| **Hacer** | Configurar Vitest + Testing Library en frontend, escribir tests de utils/policies/componentes | Jefferson Yepez / Sebastián Parra | 24/05/2026 | 4.5 | 0% | ❌ Sin iniciar | Testability — cobertura frontend > 85% |
| **Hacer** | Agregar pruebas de carga con Artillery en endpoints críticos (/api/tasks, /api/projects) | Wilmer Buestan | 28/05/2026 | 3.0 | 0% | ❌ Sin iniciar | Efficiency — objetivo: latencia p95 < 200 ms |
| **Verificar** | Re-ejecutar ESLint post-correcciones: objetivo 0 warnings `any` | Luis Sagnay | 21/05/2026 | 0.5 | 0% | ❌ Sin iniciar | Maintainability — confirmar reducción de deuda técnica |
| **Verificar** | Re-ejecutar npm audit: objetivo 0 vulnerabilidades de severidad alta | Jefferson Yepez | 20/05/2026 | 0.3 | 0% | ❌ Sin iniciar | Integrity — confirmar 0 CVEs antes de calcular score |
| **Verificar** | Verificar pipeline CI/CD verde en GitHub Actions (todos los jobs pasan) | Wilmer Buestan | 23/05/2026 | 0.5 | 0% | ❌ Sin iniciar | Portability — artefacto Docker generado como evidencia |
| **Verificar** | Verificar SonarCloud Quality Gate: Grado A, 0 Bugs críticos, deuda < 5% | Luis Sagnay | 25/05/2026 | 0.5 | 0% | ❌ Sin iniciar | Maintainability + Integrity — captura de pantalla como evidencia |
| **Verificar** | Ejecutar pruebas Artillery y analizar reporte p95 | Wilmer Buestan / Jefferson Masapanta | 29/05/2026 | 1.0 | 0% | ❌ Sin iniciar | Efficiency — registrar latencia real en el informe final |
| **Verificar** | Recalcular Quality Score McCall Ciclo 2 con métricas corregidas | Sebastián Parra | 30/05/2026 | 0.5 | 0% | ❌ Sin iniciar | Objetivo: 96/100 Excelente — (100×0.30)+(100×0.30)+(80×0.20)+(100×0.20) |
| **Actuar** | Comparar métricas Ciclo 1 vs Ciclo 2: evidencia de mejora continua | Jefferson Masapanta | 01/06/2026 | 1.5 | 0% | ❌ Sin iniciar | Demostrar reducción de deuda técnica y cierre de vulnerabilidades |
| **Actuar** | Redactar informe final PDF (11 secciones según guía del Ing. Gamboa) | Sebastián Parra | 03/06/2026 | 3.0 | 0% | ❌ Sin iniciar | Documento PDF obligatorio: Intro + Metodología + Resultados + Discusión + Conclusiones |
| **Actuar** | Planificar iteración futura: ISO 25010, caching Redis, pruebas E2E con Playwright | Jefferson Masapanta | 05/06/2026 | 1.0 | 0% | ❌ Sin iniciar | Trabajo futuro — expandir cobertura de factores McCall no cubiertos |

---

## Panel por Etapa — Ciclo 2

### 🔴 Planificar — 0%

| Acción | % |
|---|---|
| Definir objetivos Ciclo 2 (Score 96/100) | 0% |
| Priorizar acciones por impacto | 0% |

### 🔵 Hacer — 0%

| Acción | % |
|---|---|
| Corregir 28 code smells (`any`) | 0% |
| Resolver 2 vulnerabilidades (npm audit fix) | 0% |
| Pipeline CI/CD GitHub Actions | 0% |
| Vitest frontend + tests componentes | 0% |
| Artillery pruebas de carga | 0% |

### 🟡 Verificar — 0%

| Acción | % |
|---|---|
| Re-ejecutar ESLint (objetivo: 0 warnings `any`) | 0% |
| Re-ejecutar npm audit (objetivo: 0 CVEs) | 0% |
| Pipeline CI/CD verde en GitHub | 0% |
| SonarCloud Quality Gate Grado A | 0% |
| Reporte Artillery p95 < 200ms | 0% |
| Recalcular Quality Score (objetivo: 96/100) | 0% |

### 🟢 Actuar — 0%

| Acción | % |
|---|---|
| Comparativa Ciclo 1 vs Ciclo 2 | 0% |
| Informe final PDF (11 secciones) | 0% |
| Planificación iteración futura | 0% |

---

## Métricas McCall — Proyección Ciclo 2

| Factor McCall | Herramienta | Resultado Ciclo 1 | Objetivo Ciclo 2 | Impacto en Score |
|---|---|---|---|---|
| Testability | Jest + Vitest | 100% backend / 0% frontend | 100% ambos | +0 (ya en 100%) |
| Correctness | Jest + Vitest | 0 defectos | 0 defectos | +0 (ya cumple) |
| Maintainability | ESLint + SonarCloud | 44 pts (28 warnings) | 80 pts (0 warnings) | **+7.2 pts** |
| Integrity | npm audit + SonarCloud | 0 pts (2 vulns) | 100 pts (0 vulns) | **+20 pts** |
| Portability | Docker + CI/CD | Build local | Pipeline CI verde | Cualitativo |
| Efficiency | Artillery | — | p95 < 200ms | Cualitativo |

**Quality Score Ciclo 1: 68.8 / 100 — Nivel: Aceptable**
**Quality Score Proyectado Ciclo 2: 96.0 / 100 — Nivel: Excelente**

> Mejora total proyectada: **+27.2 puntos** en dos iteraciones PDCA
