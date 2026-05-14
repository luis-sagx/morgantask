export function getErrorMessage(error: unknown, fallback = 'Hubo un error') {
    if (error instanceof Error && error.message) {
        return error.message
    }

    return fallback
}
