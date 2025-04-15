import { column, BaseModel, belongsTo, hasMany, beforeCreate } from '@adonisjs/lucid/orm'
import { DateTime } from 'luxon'
import { randomUUID } from 'node:crypto'
import User from '#apps/users/models/user'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import Attachment from '#apps/storage/models/attachment'
import Channel from '#apps/channels/models/channel'
import Webhook from '#apps/webhooks/models/webhook'

export default class Message extends BaseModel {
  // Column for message ID
  @column({ isPrimary: true })
  declare id: string

  // Column for creation date
  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  // Column for update date
  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null

  // Column for message content
  @column()
  declare content: string

  // Column for owner user ID
  @column()
  declare ownerId: string

  // Column for channel ID
  @column()
  declare channelId: string

  // Column for pinned status
  @column()
  declare pinned: boolean

  // Column for reply to message ID, adjusted to allow null
  @column()
  declare parentMessageId: string | null

  // Column for webhook ID
  @column({ columnName: 'webhookId' })
  declare webhookId: string

  // Define the parent relationship (a message belongs to a user)
  @belongsTo(() => User, {
    foreignKey: 'ownerId',
  })
  declare owner: BelongsTo<typeof User>

  // Define the parent relationship (a message belongs to a channel)
  @belongsTo(() => Channel)
  declare channel: BelongsTo<typeof Channel>

  // Define the relationship for attachments (a message can have many attachments)
  @hasMany(() => Attachment)
  declare attachments: HasMany<typeof Attachment>

  // Define the parent relationship (a message belongs to another message)
  @belongsTo(() => Message, {
    foreignKey: 'parentMessageId',
  })
  declare parentMessage: BelongsTo<typeof Message>

  // Define the parent relationship (a message can belong to a webhook)
  @belongsTo(() => Webhook)
  declare webhook: BelongsTo<typeof Webhook>

  // Generate a UUID for the message ID before creating
  @beforeCreate()
  static async generateUuid(model: Message) {
    model.id = randomUUID()
  }
}
