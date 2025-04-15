import vine from '@vinejs/vine'
import { Infer } from '@vinejs/vine/types'
// import { VineMultipartFile } from '#apps/shared/vineType/vine_multipart_file'

/**
 * Validator to validate the payload when creating
 * a new message.ts.
 */
export const createWebhookValidator = vine.compile(
  vine.object({
    name: vine.string(),
    webhookPicture: vine.file().optional().nullable(),
    token: vine.string().optional(),
  })
)

/**
 * Validator to validate the payload when updating
 * an existing message.ts.
 */
export const updateWebhookValidator = vine.compile(
  vine.object({
    id: vine.string().uuid({ version: [4] }),
    name: vine.string(),
    token: vine.string().optional(),
  })
)

export const triggerWebhookValidator = vine.compile(
  vine.object({
    data: vine.object({
      message: vine.string(),
    }),
  })
)

export const updateWebhookPictureValidator = vine.compile(
  vine.object({
    attachment: vine.file(),
    params: vine.object({
      webhookId: vine.string().uuid({ version: [4] }),
      serverId: vine.string().uuid({ version: [4] }),
    }),
  })
)

// export const pinMessageValidator = vine.compile(
//   vine.object({
//     action: vine.string().in(['pin', 'unpin']),
//   })
// )

// export const getMessagesValidator = vine.compile(
//   vine.object({
//     limit: vine.number().optional(),
//     before: vine.string().optional(),
//   })
// )
// export type GetMessagesValidator = Infer<typeof getMessagesValidator>
export type CreateWebhooksSchema = Infer<typeof createWebhookValidator>
export type UpdateWebhookSchema = Infer<typeof updateWebhookValidator>
export type UpdateWebhookPictureSchema = Infer<typeof updateWebhookPictureValidator>
export type TriggerWebhookSchema = Infer<typeof triggerWebhookValidator>
// export type PinMessagesSchema = Infer<typeof pinMessageValidator>
