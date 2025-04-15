import vine from '@vinejs/vine'
import { Infer } from '@vinejs/vine/types'
import { InvitationStatus } from '#apps/invitations/models/status'

/**
 * Validator to validate the payload when creating
 * a new invitation.ts.
 */
export const createServerInvitationValidator = vine.compile(
  vine.object({
    isUnique: vine.boolean(),
    expiration: vine.date({
      formats: { utc: true },
    }),
  })
)

export const createFriendInvitationValidator = vine.compile(
  vine.object({
    targetId: vine.string().optional().requiredIfMissing('targetUsername'),
    targetUsername: vine.string().optional().requiredIfMissing('targetId'),
  })
)

export const answerInvitationValidator = vine.compile(
  vine.object({
    answer: vine.enum(InvitationStatus),
  })
)

export type AnswerInvitationSchema = Infer<typeof answerInvitationValidator>
export type CreateServerInvitationsSchema = Infer<typeof createServerInvitationValidator>
export type CreateFriendInvitationsSchema = Infer<typeof createFriendInvitationValidator>
