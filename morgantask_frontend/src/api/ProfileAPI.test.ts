import api from '@/lib/axios'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { changePassword, updateProfile } from './ProfileAPI'

vi.mock('@/lib/axios')

describe('ProfileAPI', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('updateProfile retorna data', async () => {
    vi.mocked(api.put).mockResolvedValue({ data: 'updated' } as any)
    const result = await updateProfile({ name: 'John', email: 'john@test.com' })
    expect(result).toBe('updated')
  })

  it('changePassword retorna data', async () => {
    vi.mocked(api.post).mockResolvedValue({ data: 'changed' } as any)
    const result = await changePassword({ current_password: 'old', password: '12345678', password_confirmation: '12345678' })
    expect(result).toBe('changed')
  })
})
