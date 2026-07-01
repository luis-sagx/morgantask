import { beforeEach, describe, expect, it, vi } from 'vitest'

const interceptorUse = vi.fn()
const createMock = vi.hoisted(() =>
  vi.fn(() => ({
    interceptors: {
      request: {
        use: interceptorUse,
      },
    },
  })),
)

vi.mock('axios', () => ({
  default: {
    create: createMock,
  },
}))

describe('axios lib', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
    vi.resetModules()
  })

  it('creates axios client and attaches auth header interceptor', async () => {
    localStorage.setItem('AUTH_TOKEN', 'token-123')
    const module = await import('@/lib/axios')
    expect(module.default).toBeDefined()
    expect(createMock).toHaveBeenCalled()
    const requestInterceptor = interceptorUse.mock.calls[0][0]
    const config = requestInterceptor({ headers: {} as Record<string, string> })
    expect(config.headers.Authorization).toBe('Bearer token-123')
  })

  it('leaves headers unchanged when token is absent', async () => {
    await import('@/lib/axios')
    const requestInterceptor = interceptorUse.mock.calls.at(-1)?.[0]
    const config = requestInterceptor({ headers: {} as Record<string, string> })
    expect(config.headers.Authorization).toBeUndefined()
  })
})
