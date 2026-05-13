import api from '@/lib/axios'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { changePassword, updateProfile } from './ProfileAPI'

vi.mock('@/lib/axios')

describe('ProfileAPI', () => {
  const axiosErr = (message: string) => ({
    isAxiosError: true,
    response: { data: { error: message } }
  })

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('updateProfile retorna data', async () => {
    vi.mocked(api.put).mockResolvedValue({ data: 'updated' } as any)
    const result = await updateProfile({ name: 'John', email: 'john@test.com' })
    expect(result).toBe('updated')
  })

  it('updateProfile lanza error si axios response existe', async () => {
    vi.mocked(api.put).mockRejectedValue(axiosErr('profile failed') as any)
    await expect(updateProfile({ name: 'John', email: 'john@test.com' })).rejects.toThrow('profile failed')
  })


  it('changePassword lanza error si axios response existe', async () => {
    vi.mocked(api.post).mockRejectedValue(axiosErr('change failed') as any)
    await expect(changePassword({ current_password: 'old', password: '12345678', password_confirmation: '12345678' })).rejects.toThrow('change failed')
  })
  it('changePassword retorna data', async () => {
    vi.mocked(api.post).mockResolvedValue({ data: 'changed' } as any)
    const result = await changePassword({ current_password: 'old', password: '12345678', password_confirmation: '12345678' })
    expect(result).toBe('changed')
  })
})
