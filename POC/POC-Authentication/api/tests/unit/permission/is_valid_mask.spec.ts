import { test } from '@japa/runner'
import PermissionsService from '#apps/shared/services/permissions/permissions_service'

test.group('Permission is valid mask', () => {
  const permissionsService = new PermissionsService()

  test('should return true for valid mask', async ({ assert }) => {
    const validMask = 0xff
    assert.isTrue(permissionsService.isValidMask(validMask))
  })

  test('should return false for negative mask', async ({ assert }) => {
    const negativeMask = -1
    assert.isFalse(permissionsService.isValidMask(negativeMask))
  })

  test('should return false for mask exceeding max permission length', async ({ assert }) => {
    const maxLength = permissionsService.calculateMaxPermissionLength()
    const tooLongMask = Math.pow(2, maxLength + 1) - 1
    assert.isFalse(permissionsService.isValidMask(tooLongMask))
  })

  test('should return false when highest permission exceeds max allowed', async ({ assert }) => {
    const maxValue = permissionsService.calculateMaxPermissionValue()
    const invalidMask = maxValue << 1
    assert.isFalse(permissionsService.isValidMask(invalidMask))
  })

  test('should return true for zero mask', async ({ assert }) => {
    assert.isTrue(permissionsService.isValidMask(0))
  })

  test('should return true for mask equal to max permission value', async ({ assert }) => {
    const maxValue = permissionsService.calculateMaxPermissionValue()
    assert.isTrue(permissionsService.isValidMask(maxValue))
  })
})
