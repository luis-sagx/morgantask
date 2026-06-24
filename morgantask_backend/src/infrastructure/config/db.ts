import { exit } from 'node:process'

import colors from 'colors'
import mongoose from 'mongoose'

import { getErrorMessage } from '../../interfaces/utils/error'

const FALLBACK_URI = 'mongodb://morgantask:morgantask@127.0.0.1:27017/morgantask_mern?authSource=admin'

export const connectDB = async () => {
    try {
        const { connection } = await mongoose.connect(process.env.DATABASE_URL || FALLBACK_URI)
        const url = `${connection.host}:${connection.port}`
        console.log(colors.magenta.bold(`MongoDB Conectado en: ${url}`))
    } catch (error) {
        console.error(colors.red.bold(getErrorMessage(error, 'Error al conectar a MongoDB')))
        exit(1)
    }
}
