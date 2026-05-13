# Morgan Task

App full-stack para gestion de proyectos, tareas, notas y equipos.

## Tecnologias

- Backend: Node.js, Express, TypeScript, MongoDB, Mongoose, JWT, bcrypt, Morgan
- Frontend: React, Vite, TypeScript, Tailwind CSS, React Router, React Query, Axios
- Infra: Docker Compose (MongoDB + servicios Node)

## Requisitos

- Node.js 20+
- npm
- MongoDB local o via Docker Compose

## Instalacion local

```bash
cd morgantask_backend
npm install

cd ../morgantask_frontend
npm install
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
npm run dev
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
