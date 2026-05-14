import { CorsOptions } from 'cors'

export const corsConfig: CorsOptions = {
    origin: function (origin, callback) {
        const whitelist = [process.env.FRONTEND_URL]

        // Allow requests without an Origin header, such as server-to-server checks,
        // Docker health probes, and CI readiness checks.
        if (!origin) {
            callback(null, true)
            return
        }

        if (whitelist.includes(origin)) {
            callback(null, true)
        } else {
            callback(new Error('Error de CORS'))
        }
    }
}
