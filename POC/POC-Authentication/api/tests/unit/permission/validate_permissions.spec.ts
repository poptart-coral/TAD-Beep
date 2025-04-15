import { test } from '@japa/runner'
import { Permissions } from '#apps/shared/enums/permissions'
import PermissionsService from '#apps/shared/services/permissions/permissions_service'

test.group('Permission validate permissions', () => {
  const permissionService = new PermissionsService()

  test('should return true for valid permission mask with single permission', async ({
    assert,
  }) => {
    const result = permissionService.validate_permissions(0x1, [Permissions.ADMINISTRATOR])
    assert.isTrue(result)
  })

  test('should return true for valid permission mask with multiple permissions', async ({
    assert,
  }) => {
    const result = permissionService.validate_permissions(0x3, [
      Permissions.ADMINISTRATOR,
      Permissions.MANAGE_SERVER,
    ])
    assert.isTrue(result)
  })
  test('should return true for permission that does not include all permission in the mask', async ({
    assert,
  }) => {
    const result = permissionService.validate_permissions(0x3, [Permissions.ADMINISTRATOR])
    assert.isTrue(result)
  })

  test('should return true for permission that does not include all permission in the mask with multiple permissions', async ({
    assert,
  }) => {
    const result = permissionService.validate_permissions(0x7, [
      Permissions.ADMINISTRATOR,
      Permissions.MANAGE_SERVER,
    ])
    assert.isTrue(result)
  })
  test('should return false for invalid permission mask', async ({ assert }) => {
    const result = permissionService.validate_permissions(-1, [Permissions.ADMINISTRATOR])
    assert.isFalse(result)
  })

  test('should return false when permission mask does not include required permission', async ({
    assert,
  }) => {
    const result = permissionService.validate_permissions(0x2, [Permissions.ADMINISTRATOR])
    assert.isFalse(result)
  })

  test('should return false when permission mask only includes some of required permissions', async ({
    assert,
  }) => {
    const result = permissionService.validate_permissions(0x1, [
      Permissions.ADMINISTRATOR,
      Permissions.MANAGE_SERVER,
    ])
    assert.isFalse(result)
  })
  test('should return false when permission mask includes invalid permissions', async ({
    assert,
  }) => {
    const result = permissionService.validate_permissions(0x1, [Permissions.ADMINISTRATOR, 0x2])
    assert.isFalse(result)
  })

  test('should return false when permission mask includes invalid permissions', async ({
    assert,
  }) => {
    const result = permissionService.validate_permissions(0x1, [Permissions.ADMINISTRATOR, 0x2])
    assert.isFalse(result)
  })

  test('should return true for mask with all permissions set', async ({ assert }) => {
    const allPermissionsMask = 0xfff // All 12 permission bits set
    const allPermissions = Object.values(Permissions).filter(
      (p) => typeof p === 'number'
    ) as Permissions[]
    const result = permissionService.validate_permissions(allPermissionsMask, allPermissions)
    assert.isTrue(result)
  })
})
