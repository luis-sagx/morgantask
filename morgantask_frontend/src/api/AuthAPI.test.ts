import api from '@/lib/axios'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { authenticateUser, checkPassword, createAccount, getUser } from './AuthAPI'

vi.mock('@/lib/axios')

describe('AuthAPI', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
  })

  it('createAccount retorna data', async () => {
    vi.mocked(api.post).mockResolvedValue({ data: 'created' } as any)
    const result = await createAccount({ name: 'A', email: 'a@a.com', password: '12345678', password_confirmation: '12345678' })
    expect(result).toBe('created')
  })

  it('authenticateUser guarda token', async () => {
    vi.mocked(api.post).mockResolvedValue({ data: 'token123' } as any)
    const result = await authenticateUser({ email: 'a@a.com', password: '12345678' })
    expect(result).toBe('token123')
    expect(localStorage.getItem('AUTH_TOKEN')).toBe('token123')
  })

  it('getUser retorna usuario parseado', async () => {
    vi.mocked(api).mockResolvedValue({ data: { _id: 'u1', name: 'Test', email: 't@t.com' } } as any)
    const result = await getUser()
    expect(result?._id).toBe('u1')
  })

  it('getUser retorna undefined si schema invalido', async () => {
    vi.mocked(api).mockResolvedValue({ data: { bad: true } } as any)
    const result = await getUser()
    expect(result).toBeUndefined()
  })

  it('checkPassword retorna data', async () => {
    vi.mocked(api.post).mockResolvedValue({ data: 'ok' } as any)
    const result = await checkPassword({ password: '12345678' })
    expect(result).toBe('ok')
  })
})
