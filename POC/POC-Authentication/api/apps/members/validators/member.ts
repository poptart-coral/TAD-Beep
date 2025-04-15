import vine from '@vinejs/vine'
import { Infer } from '@vinejs/vine/types'

/**
 * Validator to validate the payload when creating
 * a new member.ts.
 */
export const createMemberValidator = vine.compile(
  vine.object({
    nick: vine.string().trim(),
  })
)

/**
 * Validator to validate the payload when updating
 * an existing member.ts.
 */
export const updateNicknameMemberValidator = vine.compile(
  vine.object({
    nickname: vine.string().trim().optional(),
  })
)

export const getMemberByNicknameValidator = vine.compile(
  vine.object({
    nickname_starts_with: vine.string().optional(),
  })
)

export type CreateMembersSchema = Infer<typeof createMemberValidator>
export type UpdateNicknameMembersSchema = Infer<typeof updateNicknameMemberValidator>
