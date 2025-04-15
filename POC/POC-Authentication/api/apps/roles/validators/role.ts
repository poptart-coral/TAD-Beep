import vine from '@vinejs/vine'
import { Infer } from '@vinejs/vine/types'
import { Permissions } from '#apps/shared/enums/permissions'

/**
 * Calculate the maximum value in the Permissions enum.
 */
const maxPermValue = Object.values(Permissions)
  .filter((value) => typeof value === 'number')
  .reduce((sum, permission) => sum + permission, 0)

/**
 * Validator to validate the payload when creating
 * a new role.ts.
 */
export const createRoleValidator = vine.compile(
  vine.object({
    name: vine.string(),
    permissions: vine.number().max(maxPermValue), // Permissions cannot exceed max existing value.
    color: vine.number().optional(), // Verify the min and max limits and add to service and test
  })
)

/**
 * Validator to validate the show action
 */
export const showRoleValidator = vine.compile(
  vine.object({
    name: vine.string().optional(),
    permissions: vine.boolean().optional(),
    color: vine.boolean().optional(),
    params: vine.object({
      id: vine.string().uuid({ version: [4] }),
    }),
  })
)

/**
 * Validator to validate the payload when updating
 * an existing role.ts.
 */
export const updateRoleValidator = vine.compile(
  vine.object({
    name: vine.string(),
    permissions: vine.number().max(maxPermValue), // Permissions cannot exceed max existing value.
  })
)

export const assignRoleValidator = vine.compile(
  vine.object({
    memberIds: vine.array(vine.string()),
  })
)

export type CreateRoleSchema = Infer<typeof createRoleValidator>
export type ShowRoleSchema = Infer<typeof showRoleValidator>
export type UpdateRoleSchema = Infer<typeof updateRoleValidator>
