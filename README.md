# Morgan Task

App full-stack para gestión de proyectos, tareas, notas y equipos.

## Stack

- **Backend**: Node.js, Express, TypeScript, MongoDB, Mongoose, JWT, bcrypt, Morgan
- **Frontend**: React, Vite, TypeScript, Tailwind CSS, React Router, React Query, Axios
- **Infra**: Docker Compose, Nginx

---

## Desarrollo local con Docker

### Requisitos

- Docker + Docker Compose

### Levantar

```bash
docker compose -f docker-compose.yml -f docker-compose.dev.yml up
```

Servicios accesibles:
- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:4000/api`
- MongoDB: `localhost:27019` (para conectar desde Compass o Studio 3T)

### Bajar

```bash
docker compose -f docker-compose.yml -f docker-compose.dev.yml down
```

- Mantiene datos de MongoDB: `down`
- Borra datos de MongoDB: `down -v`

---

## Desarrollo local sin Docker (opcional)

Si preferís correr los servicios directamente en tu máquina:

```bash
# Backend
cd morgantask_backend
pnpm install
pnpm run dev

# Frontend (en otra terminal)
cd morgantask_frontend
pnpm install
pnpm run dev
```

---

## Producción (VPS Hostinger)

### Levantar

```bash
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build
```

App queda disponible en: `http://IP_DEL_VPS:80`

### Bajar

```bash
docker compose -f docker-compose.yml -f docker-compose.prod.yml down
```

- Mantiene datos: `down`
- Borra datos: `down -v`

---

## Archivos de entorno

| Archivo | Propósito | Gitignored |
|---|---|---|
| `.env` | Credenciales MongoDB para Docker Compose | Sí |
| `.env.development` | Vars para desarrollo Docker | Sí |
| `.env.production` | Vars para producción VPS | Sí |

Los archivos `.env` dentro de `morgantask_backend/` y `morgantask_frontend/` ya no se usan — Docker los sobreescribe.

---

## Deploy en VPS — Pasos antes de subir

1. **Editar `.env.production`** — el archivo ya tiene valores placeholder para el `JWT_SECRET`. Si querés cambiarlos:

   ```bash
   # Generar nuevo JWT_SECRET
   openssl rand -base64 48

   # Editar manualmente .env.production
   ```

2. **Subir el proyecto a la VPS** (git clone o scp)

3. **Ejecutar en la VPS**:
   ```bash
   docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build
   ```

4. **Acceder**: `http://IP_DE_TU_VPS:80`

### Notas importantes para producción

- **MongoDB no está expuesto al host** — solo es accesible desde contenedores internos. Esto es por seguridad.
- **Puerto único** — todo entra por el `:80` de nginx. El backend no tiene puerto expuesto.
- **Datos persistentes** — el volumen `mongo_data` mantiene los datos entre despliegues. Para borrar todo: `down -v`.
- **Logs** — ver logs de un contenedor:
  ```bash
  docker logs morgantask_backend
  docker logs morgantask_frontend
  docker logs morgantask_mongo
  ```

---

## Testing

### Backend (Jest)

```bash
cd morgantask_backend
pnpm run test
```

### Frontend (Vitest)

```bash
cd morgantask_frontend
pnpm run test
```

---

## GitHub Actions

Se agregaron estos workflows:

- `ci.yml`: install, lint, tests, coverage, audit, sonar-scanner y k6.
- `security.yml`: scans de Trivy para filesystem y configuración.
- `deploy.yml`: despliegue automático a VPS por SSH usando `git pull` y Docker Compose.

### Secrets requeridos

Para `ci.yml`:

- `SONAR_TOKEN`
- Variable `SONAR_ORGANIZATION`
- Variable `SONAR_PROJECT_KEY`

Para `deploy.yml`:

- `VPS_HOST`
- `VPS_PORT`
- `VPS_USER` (o `VPS_USERNAME` como fallback)
- `VPS_SSH_KEY`
- `VPS_APP_PATH`
- `VPS_ENV_PRODUCTION`

`VPS_ENV_PRODUCTION` debe contener el contenido completo de `.env.production`, por ejemplo:

```env
DATABASE_URL=mongodb://morgantask:morgantask@mongo:27017/morgantask_mern?authSource=admin
FRONTEND_URL=http://localhost
JWT_SECRET=tu_jwt_super_secreto
PORT=4000
VITE_API_URL=/api
```

Antes del primer deploy automático, el repo debe existir en la VPS en la ruta configurada en `VPS_APP_PATH` y ese servidor debe poder ejecutar `git fetch/pull origin main`. Si el repositorio es privado, configurá previamente acceso SSH o credenciales de lectura en la VPS.

### Comportamiento de k6

- En `pull_request`: corre `smoke`.
- En `push`: corre `smoke` y `load`.
- En `workflow_dispatch`: puede correr también `stress` y `spike` si activás `run_full_k6_suite=true`.

### SonarCloud

Para usar SonarCloud con este pipeline:

1. Crear o importar el proyecto en SonarCloud.
2. Guardar `SONAR_TOKEN` en `Settings > Secrets and variables > Actions > Secrets`.
3. Guardar estas variables en `Settings > Secrets and variables > Actions > Variables`:

- `SONAR_ORGANIZATION`
- `SONAR_PROJECT_KEY`

`SONAR_HOST_URL` ya queda fijo en el workflow como `https://sonarcloud.io`.

---

## Arquitectura de archivos Docker

```
docker/
├── backend/Dockerfile       # Multi-stage: dev (nodemon) | builder | prod (node)
├── frontend/Dockerfile      # Multi-stage: dev (vite) | builder | prod (nginx)
└── nginx/
    ├── nginx.conf           # Gzip, worker config
    └── conf.d/default.conf  # SPA fallback + reverse proxy /api → backend:4000
```
