import { test } from '@japa/runner'
import { Permissions } from '#apps/shared/enums/permissions'
import PermissionsService from '#apps/shared/services/permissions/permissions_service'

test.group('Permission has permission', () => {
  const permissionsService = new PermissionsService()

  test('should return true when mask matches permissions', async ({ assert }) => {
    const mask = 1 // e.g. READ permission
    const permission = Permissions.ADMINISTRATOR // e.g. READ + WRITE permissions

    const result = permissionsService.has_permission(mask, permission)

    assert.isTrue(result)
  })

  test('should return false when mask does not match permissions', async ({ assert }) => {
    const mask = 3 // e.g. DELETE permission
    const permissions = Permissions.MANAGE_WEBHOOKS // e.g. READ + WRITE permissions
    const result = permissionsService.has_permission(mask, permissions)

    assert.isFalse(result)
  })

  test('should return false for invalid mask values', async ({ assert }) => {
    const invalidMask = -1
    const permissions = 1

    const result = permissionsService.has_permission(invalidMask, permissions)

    assert.isFalse(result)
  })

  test('should return false for mask larger than max permission value', async ({ assert }) => {
    const maxValue = permissionsService.calculateMaxPermissionSum()
    const invalidMask = maxValue + 1
    const permissions = Permissions.ADMINISTRATOR

    const result = permissionsService.has_permission(invalidMask, permissions)

    assert.isFalse(result)
  })
})
