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

## Resultado final frontend

Resultado consolidado:

- **2 archivos de prueba ejecutados**
- **2 pruebas exitosas**
- **0 errores**

### Evidencia final

![Resultado final frontend](screenshots_test/frontend-final-pass.png)

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