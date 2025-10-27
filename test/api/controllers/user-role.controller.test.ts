import { describe, it, expect, vi } from 'vitest'
import { UserRoleController } from '../../../src/api/controllers/user-role.controller.js'

describe('UserRoleController', () => {
  it('should return 400 for invalid role', async () => {
    const mockService = { generateRegisterKey: vi.fn() }
    const ctrl = new UserRoleController(mockService as any)

    const ctx = {
      req: { param: (k: string) => undefined },
      json: (body: any, status?: number) => ({ body, status })
    }

    const res = await ctrl.generateRegisterKey(ctx as any)
    expect(res).toEqual({ body: { error: 'Укажите ?role=MANAGER или ?role=WORKER' }, status: 400 })
    expect(mockService.generateRegisterKey).not.toHaveBeenCalled()
  })

  it('should return key for valid role', async () => {
    const mockService = { generateRegisterKey: vi.fn().mockResolvedValue('KEY123') }
  const ctrl = new UserRoleController(mockService as any)

    const ctx = {
      req: { param: (k: string) => 'MANAGER' },
      json: (body: any) => body
    }

    const res = await ctrl.generateRegisterKey(ctx as any)
    expect(res).toEqual({ data: { key: 'KEY123' } })
    expect(mockService.generateRegisterKey).toHaveBeenCalledWith('MANAGER')
  })
})
