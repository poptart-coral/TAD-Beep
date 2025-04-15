import vine from '@vinejs/vine'
import { Infer } from '@vinejs/vine/types'

/**
 * Validator to validate the payload when creating
 * a new message.ts.
 */
export const createMessageValidator = vine.compile(
  vine.object({
    content: vine.string().optional(),
    attachments: vine.array(vine.file()).optional().requiredIfMissing('content'),
    parentMessageId: vine.string().optional(),
    transmitClientId: vine.string().optional(),
  })
)

/**
 * Validator to validate the payload when updating
 * an existing message.ts.
 */
export const updateMessageValidator = vine.compile(
  vine.object({
    content: vine.string(),
    pinned: vine.boolean().optional(),
  })
)

export const pinMessageValidator = vine.compile(
  vine.object({
    action: vine.string().in(['pin', 'unpin']),
  })
)

export const getMessagesValidator = vine.compile(
  vine.object({
    limit: vine.number().optional(),
    before: vine.string().optional(),
  })
)
export type GetMessagesValidator = Infer<typeof getMessagesValidator>
export type CreateMessagesSchema = Infer<typeof createMessageValidator>
export type UpdateMessagesSchema = Infer<typeof updateMessageValidator>
export type PinMessagesSchema = Infer<typeof pinMessageValidator>
