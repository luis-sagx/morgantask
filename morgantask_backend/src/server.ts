import express from 'express'
import dotenv from 'dotenv'
import cors from 'cors'
import morgan from 'morgan'
import { corsConfig } from './infrastructure/config/cors'
import { connectDB } from './infrastructure/config/db'
import authRoutes from './interfaces/routes/authRoutes'
import projectRoutes from './interfaces/routes/projectRoutes'

dotenv.config()
connectDB()

const app = express()
app.use(cors(corsConfig))

// Logging
app.use(morgan('dev'))

// Leer datos de formularios
app.use(express.json())

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/projects', projectRoutes)

export default app