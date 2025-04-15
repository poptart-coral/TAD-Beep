import { column, BaseModel, belongsTo, beforeCreate } from '@adonisjs/lucid/orm'
import { DateTime } from 'luxon'
import * as nodeCrypto from 'node:crypto'
import User from '#apps/users/models/user'
import Channel from '#apps/channels/models/channel'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'

export default class Webhook extends BaseModel {
  // Column for webhook ID as UUID
  @column({ isPrimary: true, columnName: 'id' })
  declare id: string

  // Column for creation date
  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  // Column for update date
  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null

  // Column for server ID (nullable)
  @column({ columnName: 'server_id' })
  declare serverId: string | null

  // Column for channel ID (nullable)
  @column({ columnName: 'channel_id' })
  declare channelId: string

  // Column for user ID (nullable)
  @column({ columnName: 'user_id' })
  declare userId: string | null

  // Column for the webhook name
  @column()
  declare name: string | null

  // Column for the webhook picture
  @column()
  declare webhookPicture: string

  // Column for the secure token
  @column()
  declare token: string | null

  // Define the parent relationship (a webhook belongs to a user)
  @belongsTo(() => User, {
    foreignKey: 'userId',
  })
  declare user: BelongsTo<typeof User>

  // Define the parent relationship (a webhook belongs to a channel)
  @belongsTo(() => Channel, {
    foreignKey: 'channelId',
  })
  declare channel: BelongsTo<typeof Channel>

  // Generate a UUID for the webhook ID before creating
  @beforeCreate()
  static async generateUuid(model: Webhook) {
    model.id = nodeCrypto.randomUUID()
  }
}
