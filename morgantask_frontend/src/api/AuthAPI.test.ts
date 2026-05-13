import api from '@/lib/axios'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { authenticateUser, checkPassword, createAccount, getUser } from './AuthAPI'

vi.mock('@/lib/axios')

describe('AuthAPI', () => {
  const axiosErr = (message: string) => ({
    isAxiosError: true,
    response: { data: { error: message } }
  })

  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
  })

  it('createAccount retorna data', async () => {
    vi.mocked(api.post).mockResolvedValue({ data: 'created' })
    const result = await createAccount({ name: 'A', email: 'a@a.com', password: '12345678', password_confirmation: '12345678' })
    expect(result).toBe('created')
  })

  it('createAccount lanza error si axios response existe', async () => {
    vi.mocked(api.post).mockRejectedValue(axiosErr('create failed'))
    await expect(createAccount({ name: 'A', email: 'a@a.com', password: '12345678', password_confirmation: '12345678' })).rejects.toThrow('create failed')
  })

  it('authenticateUser guarda token', async () => {
    vi.mocked(api.post).mockResolvedValue({ data: 'token123' })
    const result = await authenticateUser({ email: 'a@a.com', password: '12345678' })
    expect(result).toBe('token123')
    expect(localStorage.getItem('AUTH_TOKEN')).toBe('token123')
  })

  it('authenticateUser lanza error si axios response existe', async () => {
    vi.mocked(api.post).mockRejectedValue(axiosErr('login failed'))
    await expect(authenticateUser({ email: 'a@a.com', password: '12345678' })).rejects.toThrow('login failed')
  })

  it('getUser retorna usuario parseado', async () => {
    vi.mocked(api).mockResolvedValue({ data: { _id: 'u1', name: 'Test', email: 't@t.com' } })
    const result = await getUser()
    expect(result?._id).toBe('u1')
  })


  it('getUser lanza error si axios response existe', async () => {
    vi.mocked(api).mockRejectedValue(axiosErr('user failed'))
    await expect(getUser()).rejects.toThrow('user failed')
  })
  it('getUser retorna undefined si schema invalido', async () => {
    vi.mocked(api).mockResolvedValue({ data: { bad: true } })
    const result = await getUser()
    expect(result).toBeUndefined()
  })


  it('checkPassword lanza error si axios response existe', async () => {
    vi.mocked(api.post).mockRejectedValue(axiosErr('check failed'))
    await expect(checkPassword({ password: '12345678' })).rejects.toThrow('check failed')
  })
  it('checkPassword retorna data', async () => {
    vi.mocked(api.post).mockResolvedValue({ data: 'ok' })
    const result = await checkPassword({ password: '12345678' })
    expect(result).toBe('ok')
  })
})