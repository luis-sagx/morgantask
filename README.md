# Morgan Task

App full-stack para gestion de proyectos, tareas, notas y equipos.

## Tecnologias

- Backend: Node.js, Express, TypeScript, MongoDB, Mongoose, JWT, bcrypt, Morgan
- Frontend: React, Vite, TypeScript, Tailwind CSS, React Router, React Query, Axios
- Infra: Docker Compose (MongoDB + servicios Node)

## Requisitos

- Node.js 20+
- npm
- pnpm
- MongoDB local o via Docker Compose

## Instalacion local

```bash
cd morgantask_backend
npm install

cd ../morgantask_frontend
pnpm install
```

## Variables de entorno

### Backend

Crear [morgantask_backend/.env](morgantask_backend/.env) basado en [morgantask_backend/.env.local](morgantask_backend/.env.local):

```dotenv
DATABASE_URL=mongodb://morgantask:morgantask@localhost:27019/morgantask_mern?authSource=admin
FRONTEND_URL=http://localhost:5173
JWT_SECRET=palabrasupersecreta
# PORT=4000
```

### Frontend

Usa [morgantask_frontend/.env.local](morgantask_frontend/.env.local):

```dotenv
VITE_API_URL=http://localhost:4000/api
```

## Correr en desarrollo (local)

```bash
cd morgantask_backend
npm run dev

# en otra terminal
cd morgantask_frontend
pnpm run dev
```

- Backend: http://localhost:4000
- Frontend: http://localhost:5173

## Correr con Docker Compose

```bash
docker compose up --build
```

Servicios:
- MongoDB: localhost:27019
- Backend: localhost:4000
- Frontend: localhost:5173

# Pruebas Automatizadas

## Objetivo

Como parte del proceso de aseguramiento de la calidad del proyecto **MorganTask**, se implementaron pruebas automatizadas para validar funcionalidades críticas tanto en el backend como en el frontend, con el propósito de detectar errores tempranamente, mejorar la estabilidad del sistema y garantizar un comportamiento funcional correcto.

Las herramientas utilizadas fueron:

- **Jest** para pruebas unitarias del backend.
- **Vitest + React Testing Library** para pruebas del frontend.

---

# Backend Testing con Jest

## Configuración de pruebas

Para habilitar pruebas automatizadas en el backend se instalaron las siguientes dependencias:

```bash
npm install -D jest ts-jest @types/jest supertest @types/supertest mongodb-memory-server
```

Además, se configuraron los siguientes archivos:

- `jest.config.js`
- `tsconfig.json`
- carpeta `src/__tests__/`

### Evidencia

![Configuración inicial de Jest](screenshots_test/backend-jest-install.png)

**Figura 1.** Instalación y configuración inicial de Jest para pruebas unitarias del backend.

---

## Prueba inicial de validación

Se ejecutó una prueba básica inicial para verificar que el entorno de pruebas estuviera correctamente configurado.

Archivo creado:

```text
src/__tests__/basic.test.ts
```

Objetivo de la prueba:

- validar ejecución correcta de Jest
- verificar reconocimiento del entorno TypeScript
- confirmar funcionamiento del sistema de aserciones

### Evidencia

![Prueba básica Jest](screenshots_test/backend-jest-install.png)

**Figura 2.** Validación inicial del framework Jest funcionando correctamente.

---

## Corrección de error detectado en pruebas

Durante la construcción de las pruebas unitarias reales se detectó un error relacionado con el mock del repositorio de usuarios.

Problema detectado:

- la interfaz `IUserRepository` requería métodos adicionales no incluidos inicialmente
- `findByIdPublic`
- `findByEmailPublic`

Esto generó fallo en la ejecución de la suite de pruebas.

### Evidencia

![Error detectado en mock backend](screenshots_test/backend-mock-error.png)

**Figura 3.** Error detectado durante la simulación del repositorio de usuarios en backend.

---

## Pruebas unitarias del módulo de autenticación

Se desarrollaron pruebas unitarias reales para el caso de uso de autenticación.

Archivo implementado:

```text
src/__tests__/AuthUseCases.test.ts
```

### Casos probados

#### 1. Creación exitosa de cuenta

Se validó:

- usuario inexistente
- creación correcta del usuario
- cifrado de contraseña
- almacenamiento en repositorio

#### 2. Usuario ya registrado

Se validó:

- detección de usuario duplicado
- lanzamiento de excepción controlada
- bloqueo de creación

#### 3. Inicio de sesión exitoso

Se validó:

- búsqueda del usuario
- validación de contraseña
- generación de token JWT

### Evidencia parcial

![Pruebas AuthUseCases](screenshots_test/backend-auth-tests.png)

**Figura 4.** Ejecución parcial de pruebas unitarias del módulo de autenticación.

---

## Resultado final backend

Resultado consolidado:

- **2 suites ejecutadas**
- **4 pruebas exitosas**
- **0 errores**

### Evidencia final

![Resultado final backend](screenshots_test/backend-final-pass.png)

**Figura 5.** Resultado exitoso de pruebas unitarias del backend con Jest.

---

# Frontend Testing con Vitest

## Configuración de pruebas

Para implementar pruebas en frontend se instalaron las siguientes dependencias:

```bash
npm install -D vitest jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event
```

Archivos configurados:

- `vite.config.ts`
- `src/test/setup.ts`
- `tsconfig.json`

Estas configuraciones permitieron habilitar pruebas sobre componentes React con entorno DOM simulado.

---

## Prueba del componente LoginView

Archivo implementado:

```text
src/views/auth/LoginView.test.tsx
```

Validaciones realizadas:

- renderizado correcto del formulario de inicio de sesión
- visualización del campo email
- visualización del campo contraseña
- visualización del botón de inicio de sesión
- visualización del enlace de registro

### Evidencia

![Prueba LoginView](screenshots_test/frontend-login-test.png)

**Figura 6.** Ejecución exitosa de prueba del componente LoginView.

---

## Prueba del componente RegisterView

Archivo implementado:

```text
src/views/auth/RegisterView.test.tsx
```

Validaciones realizadas:

- renderizado correcto del formulario de registro
- visualización del campo email
- visualización del campo nombre
- visualización del campo contraseña
- visualización del botón de registro







---

## 🧪 2. Pruebas Unitarias Avanzadas — Core Business Logic

La estrategia de Aseguramiento de la Calidad se centra en el patrón **Domain-Driven Testing**, implementando **Mocking** con `jest.fn()` para aislar completamente la lógica de negocio de la infraestructura real (MongoDB).

> **¿Por qué Mocking?**
> 1. **Aislamiento total:** La lógica de negocio se prueba sin depender de MongoDB.
> 2. **Control de errores:** Permite forzar escenarios de fallo (null returns, accesos no autorizados) que serían imposibles de reproducir de forma confiable con datos reales.
> 3. **Velocidad:** Las 10 pruebas del proyecto se ejecutan en apenas **1.344 segundos**.

---

### Resultados Globales de Ejecución

```
Test Suites: 4 passed, 4 total
Tests:       10 passed, 10 total
Snapshots:   0 total
Time:        1.344 s
```

![Terminal con los PASS y la tabla de cobertura](screenshots_test/captura1.png)

> *Descripción: Resultado de ejecutar `docker compose exec backend sh -c "pnpm test -- --coverage"`. Se observan las 4 suites en verde y los 10 tests aprobados.*

**Comando de ejecución (entorno Dockerizado):**

```bash
docker compose exec backend sh -c "pnpm test -- --coverage"
```

---

### 📊 Tabla de Cobertura de Código

| Archivo | % Stmts | % Branch | % Funcs | % Lines | Líneas no cubiertas |
|---|---|---|---|---|---|
| **application/usecases** | 52.38 | 38.46 | 50 | 55.76 | — |
| `AuthUseCases.ts` | 41.17 | 22.22 | 50 | 48.14 | 27-50 |
| `ProjectUseCases.ts` | **80** | **100** | 57.14 | **75** | 12, 27-31 |
| `TaskUseCases.ts` | **50** | **0** | 42.85 | 53.84 | 22-32, 43 |
| **infrastructure/security** | **100** | **100** | **100** | **100** | — |
| `bcrypt.ts` | **100** | **100** | **100** | **100** | — |
| `jwt.ts` | **100** | **100** | **100** | **100** | — |

> La cobertura del **100% en Branch** para `ProjectUseCases.ts` significa que **todos los caminos lógicos** (validación de existencia, control de roles, acceso autorizado) fueron evaluados tanto en su escenario positivo como negativo.

---

## 📁 Módulo A — `ProjectUseCases.test.ts`

### Descripción General

Se simuló la interfaz completa `IProjectRepository` mediante `jest.Mocked<IProjectRepository>`, inyectando el mock en el constructor de `ProjectUseCases`. Esto garantiza que **ninguna prueba realiza conexiones reales a MongoDB**.

```typescript
// Declaración del Mock — simula IProjectRepository con sus 10 métodos
const projectRepositoryMock: jest.Mocked<IProjectRepository> = {
  create: jest.fn(),
  findByUser: jest.fn(),
  findById: jest.fn(),
  findByIdWithTasks: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  addTask: jest.fn(),
  removeTask: jest.fn(),
  addMember: jest.fn(),
  removeMember: jest.fn(),
  getTeamPopulated: jest.fn(),
};

// Limpieza de contadores antes de cada prueba — garantiza aislamiento
beforeEach(() => {
  jest.clearAllMocks();
});
```
![ primeras líneas del archivo `ProjectUseCases.test.ts](screenshots_test/captura2.png)

> *Descripción: Se muestra la declaración del objeto `projectRepositoryMock` con todos sus métodos asignados a `jest.fn()`, y el bloque `beforeEach` que limpia los contadores.*

---

### Mapa de Casos de Prueba

| # | Nombre del test | Mock configurado | Aserción clave | Tipo |
|---|---|---|---|---|
| 1 | Debe crear un proyecto correctamente | `create` → retorna objeto predefinido | `toHaveBeenCalledTimes(1)` | ✅ Happy path |
| 2 | Debe lanzar error si el proyecto no existe | `findByIdWithTasks` → `null` | `.rejects.toThrow("Proyecto no encontrado")` | ⚠️ Error handling |
| 3 | Debe bloquear acceso si el usuario no es manager ni equipo | Proyecto con `manager` y `team` distintos al usuario | `.rejects.toThrow("Acción no válida")` | 🔒 Seguridad RBAC |
| 4 | Debe permitir acceso si el usuario es el manager | Proyecto con `manager` coincidente | `expect(result).toEqual(mockProject)` | ✅ Happy path |

---

### Caso 1 — Creación exitosa de proyecto

```typescript
test("Caso 1: Debe crear un proyecto correctamente", async () => {
  const mockProject = {
    _id: "proj_123",
    projectName: "App de Notas",
    clientName: "ESPE",
    description: "Proyecto QA",
    manager: "user_1",
    tasks: [],
    team: []
  };
  projectRepositoryMock.create.mockResolvedValue(mockProject);

  const projectUseCases = new ProjectUseCases(projectRepositoryMock);
  const result = await projectUseCases.create({
    projectName: "App de Notas",
    clientName: "ESPE",
    description: "Proyecto QA",
    manager: "user_1"
  });

  expect(projectRepositoryMock.create).toHaveBeenCalledTimes(1);
  expect(result.projectName).toBe("App de Notas");
});
```

**¿Qué se validó?**
- `toHaveBeenCalledTimes(1)`: certifica que el sistema intenta persistir el proyecto **exactamente una vez**, evitando duplicados en la base de datos.
- `result.projectName`: los datos de salida coinciden exactamente con la entidad estructurada esperada.

---

### Caso 2 — Intercepción de entidad inexistente (Error HTTP 404)

```typescript
test("Caso 2: Debe lanzar error si el proyecto no existe al buscarlo", async () => {
  projectRepositoryMock.findByIdWithTasks.mockResolvedValue(null);
  const projectUseCases = new ProjectUseCases(projectRepositoryMock);

  await expect(
    projectUseCases.getById("id_invalido", "user_1")
  ).rejects.toThrow("Proyecto no encontrado");
});
```

**¿Qué se validó?**
- El mock devuelve `null`, simulando una búsqueda fallida en la base de datos.
- `.rejects.toThrow("Proyecto no encontrado")`: certifica que el sistema **no colapsa (crash)**, sino que lanza una excepción controlada que el controlador puede transformar en un error HTTP 404.

---

### Caso 3 — Control de acceso estricto (RBAC)

```typescript
test("Caso 3: Debe bloquear el acceso si el usuario no es el manager ni del equipo", async () => {
  projectRepositoryMock.findByIdWithTasks.mockResolvedValue({
    _id: "proj_123",
    manager: "manager_original",
    team: ["integrante_1"]
  });
  const projectUseCases = new ProjectUseCases(projectRepositoryMock);

  await expect(
    projectUseCases.getById("proj_123", "usuario_intruso")
  ).rejects.toThrow("Acción no válida");
});
```

**¿Qué se validó?**
- Se inyecta un proyecto cuyo `manager` y `team` **no coinciden** con el usuario que realiza la petición (simulando un intruso).
- El Caso de Uso intercepta la brecha de seguridad y bloquea el flujo lanzando `"Acción no válida"`.
- Esta es una prueba crítica de **confidencialidad**: el control de acceso por roles (RBAC) está implementado en la capa de dominio, no solo en la capa HTTP.

---

### Caso 4 — Acceso concedido al propietario

```typescript
test("Caso 4: Debe permitir el acceso si el usuario es el manager del proyecto", async () => {
  const mockProject = { _id: "proj_123", manager: "mi_usuario", team: [] };
  projectRepositoryMock.findByIdWithTasks.mockResolvedValue(mockProject);
  const projectUseCases = new ProjectUseCases(projectRepositoryMock);

  const result = await projectUseCases.getById("proj_123", "mi_usuario");
  expect(result).toEqual(mockProject);
});
```

**¿Qué se validó?**
- Cuando el ID del usuario coincide exactamente con el `manager` del proyecto, el sistema autoriza la lectura y retorna el objeto completo sin restricciones.
- Complementa al Caso 3: juntos prueban **ambas ramas** del condicional de autorización, logrando el 100% de Branch Coverage en esta lógica.


![ 4 checks verdes de ProjectUseCases.test.ts](screenshots_test/captura3.png)


> *Descripción: Terminal con `✓ Caso 1`, `✓ Caso 2`, `✓ Caso 3`, `✓ Caso 4` en verde bajo la línea `PASS src/__tests__/ProjectUseCases.test.ts`.*

---

## 📁 Módulo B — `TaskUseCases.test.ts`

### Descripción General

Este módulo presenta un nivel de complejidad arquitectónica superior: `TaskUseCases` orquesta **dos repositorios de forma simultánea** (`ITaskRepository` + `IProjectRepository`). Las pruebas validan la **integridad referencial** entre colecciones en una base de datos NoSQL como MongoDB.

```
                  ┌────────────────────────┐
                  │     TaskUseCases       │
                  │  (lógica de negocio)   │
                  └──────────┬─────────────┘
                             │ orquesta simultáneamente
               ┌─────────────┴──────────────┐
               ▼                            ▼
  ┌────────────────────┐      ┌──────────────────────────┐
  │  ITaskRepository   │      │   IProjectRepository     │
  │  · create          │      │   · addTask              │
  │  · findByProject   │      │   · removeTask           │
  │  · findById        │      │   · findById             │
  │  · findByIdWith... │      │   · addMember            │
  │  · update          │      │   · removeMember         │
  │  · updateStatus    │      │   · (+ 6 más)            │
  │  · delete          │      │                          │
  │  · addNote         │      │                          │
  │  · removeNote      │      │                          │
  └────────────────────┘      └──────────────────────────┘
```

```typescript
// Mock del repositorio de tareas — 9 métodos
const taskRepositoryMock: jest.Mocked<ITaskRepository> = {
  create: jest.fn(),
  findByProject: jest.fn(),
  findById: jest.fn(),
  findByIdWithDetails: jest.fn(),
  update: jest.fn(),
  updateStatus: jest.fn(),
  delete: jest.fn(),
  addNote: jest.fn(),
  removeNote: jest.fn(),
};

// Mock del repositorio de proyectos — 11 métodos
const projectRepositoryMock: jest.Mocked<IProjectRepository> = {
  create: jest.fn(), findByUser: jest.fn(), findById: jest.fn(),
  findByIdWithTasks: jest.fn(), update: jest.fn(), delete: jest.fn(),
  addTask: jest.fn(), removeTask: jest.fn(),
  addMember: jest.fn(), removeMember: jest.fn(), getTeamPopulated: jest.fn(),
};
```
![ primeras líneas del archivo `TaskUseCases.test.ts](screenshots_test/captura4.png)

> *Descripción: Se observan los dos mocks declarados (`taskRepositoryMock` y `projectRepositoryMock`) y cómo ambos se inyectan juntos en `new TaskUseCases(taskRepositoryMock, projectRepositoryMock)`.*

---

### Mapa de Casos de Prueba

| # | Nombre del test | Qué valida | Aserción crítica | Tipo |
|---|---|---|---|---|
| 1 | Crear tarea y asociarla automáticamente a su proyecto | Integridad referencial en creación | `toHaveBeenCalledWith("proj_1", "task_1")` | ✅ Integridad referencial |
| 2 | Al eliminar una tarea, debe desvincularse del proyecto | Eliminación en cascada sin datos huérfanos | `removeTask` llamado con los IDs correctos | 🔗 Cascada segura |

---

### Caso 1 — Creación con Asociación Automática (Integridad Referencial)

```typescript
test("Caso 1: Debe crear una tarea y asociarla automáticamente a su proyecto", async () => {
  const mockTask = {
    _id: "task_1",
    name: "Hacer Pruebas Unitarias",
    description: "Usar Jest",
    project: "proj_1",
    status: "pending" as const,
    completedBy: [],
    notes: []
  };

  taskRepositoryMock.create.mockResolvedValue(mockTask);
  projectRepositoryMock.addTask.mockResolvedValue(undefined);

  const taskUseCases = new TaskUseCases(taskRepositoryMock, projectRepositoryMock);
  const result = await taskUseCases.create({
    name: "Hacer Pruebas Unitarias",
    description: "Usar Jest",
    projectId: "proj_1"
  });

  expect(taskRepositoryMock.create).toHaveBeenCalledTimes(1);
  expect(projectRepositoryMock.addTask).toHaveBeenCalledWith("proj_1", "task_1"); // ← Relación garantizada
  expect(result).toEqual(mockTask);
});
```

**¿Qué se validó?**
- `toHaveBeenCalledWith("proj_1", "task_1")`: garantiza matemáticamente que **toda nueva tarea se vincula automáticamente al arreglo de tareas de su proyecto padre** en MongoDB.
- No basta con que la tarea exista; se valida que la referencia cruzada entre colecciones NoSQL se establezca correctamente en la misma operación.

---

### Caso 2 — Eliminación en Cascada Segura (sin datos huérfanos)

```typescript
test("Caso 2: Al eliminar una tarea, debe desvincularse del proyecto", async () => {
  taskRepositoryMock.delete.mockResolvedValue(undefined);
  projectRepositoryMock.removeTask.mockResolvedValue(undefined);

  const taskUseCases = new TaskUseCases(taskRepositoryMock, projectRepositoryMock);
  await taskUseCases.delete("task_1", "proj_1");

  expect(taskRepositoryMock.delete).toHaveBeenCalledWith("task_1");
  expect(projectRepositoryMock.removeTask).toHaveBeenCalledWith("proj_1", "task_1");
});
```

**¿Qué se validó?**
- Se verifica que al borrar la tarea (`delete`), el sistema ejecuta **en la misma operación** el método `removeTask` sobre el proyecto padre.
- Esto previene el problema de **"datos huérfanos"**: identificadores de tareas que ya no existen permaneciendo en el arreglo `tasks[]` del proyecto en MongoDB.
- Ambas aserciones juntas prueban que la eliminación es **atómica a nivel de lógica de negocio**.
- 
![ terminal mostrando los 2 checks verdes de TaskUseCases.test.ts](screenshots_test/captura3.png)

> *Descripción: Terminal con `✓ Caso 1` y `✓ Caso 2` en verde bajo la línea `PASS src/__tests__/TaskUseCases.test.ts`.*

---

## 📈 Reporte Final de Cobertura

**Comando ejecutado:**

```bash
docker compose exec backend sh -c "pnpm test -- --coverage"
```

### Interpretación de métricas clave

| Métrica | Significado | Resultado en ProjectUseCases |
|---|---|---|
| **% Stmts** | Porcentaje de sentencias ejecutadas | 80% |
| **% Branch** | Porcentaje de bifurcaciones (if/else) evaluadas en ambas ramas | **100%** ✅ |
| **% Funcs** | Porcentaje de funciones invocadas | 57.14% |
| **% Lines** | Porcentaje de líneas ejecutadas | 75% |

> El **100% de Branch Coverage** en `ProjectUseCases.ts` es el indicador más importante: significa que **cada decisión lógica del código** (¿existe el proyecto? ¿el usuario tiene permiso?) fue evaluada tanto cuando la condición es verdadera como cuando es falsa. No existe ningún camino lógico sin probar.


![ tabla de cobertura en la terminal](screenshots_test/captura5.png)

> 📸 **[FIGURA 6 — Insertar aquí: foto completa de la tabla de cobertura en la terminal]**
> *Descripción: Tabla con columnas File / % Stmts / % Branch / % Funcs / % Lines. Se resaltan las filas de `ProjectUseCases.ts` con 100% en Branch y las filas de `infrastructure/security` con 100% en todas las columnas.*

---










## Resultado final frontend

Resultado consolidado:

- **4 archivos de prueba ejecutados**
- **10 pruebas exitosas**
- **0 errores**

### Evidencia final

![Resultado final frontend](screenshots_test/captura7.png)

**Figura 7.** Resultado exitoso de pruebas del frontend con Vitest.

---

# Resumen General

## Resultados obtenidos

### Backend

Pruebas ejecutadas:

- validación inicial de Jest
- creación exitosa de cuenta
- validación de usuario duplicado
- inicio de sesión exitoso

Total:

```text
4 pruebas backend
```

---

### Frontend

Pruebas ejecutadas:

- renderizado de LoginView
- renderizado de RegisterView

Total:

```text
2 pruebas frontend
```

---

## Total global

```text
6 pruebas automatizadas exitosas
```

---

# Tecnologías utilizadas

- Node.js
- TypeScript
- Jest
- ts-jest
- Supertest
- Vitest
- React Testing Library
- React
- Vite
- MongoDB

---

# Conclusión

La incorporación de pruebas automatizadas fortaleció significativamente el proceso de aseguramiento de calidad del proyecto MorganTask.

Las pruebas implementadas permitieron validar funcionalidades críticas del sistema, detectar errores durante el desarrollo, corregir configuraciones defectuosas y garantizar estabilidad funcional tanto en backend como frontend.

El uso combinado de Jest y Vitest permitió establecer una base sólida para futuras pruebas, mantenimiento evolutivo y mejora continua del software.
