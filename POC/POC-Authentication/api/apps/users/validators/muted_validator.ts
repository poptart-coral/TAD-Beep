import vine from '@vinejs/vine'

export const mutedValidator = vine.compile(
  vine.object({
    muted: vine.boolean(),
    voiceMuted: vine.boolean(),
    camera: vine.boolean(),
  })
)
