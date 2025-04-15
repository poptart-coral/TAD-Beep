import Server from '#apps/servers/models/server'
import User from '#apps/users/models/user'
import { DateTime } from 'luxon'
import { randomUUID } from 'node:crypto'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import { BaseModel, beforeCreate, belongsTo, column } from '@adonisjs/lucid/orm'

export default class Invitation extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

  @column()
  declare creatorId: string

  @column()
  declare serverId: string | null

  @column()
  declare targetId: string | null

  @column()
  declare type: number

  @column()
  declare status: number

  @column()
  declare expiration: DateTime

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null

  @beforeCreate()
  static async generateUuid(model: Invitation) {
    model.id = randomUUID()
  }

  @belongsTo(() => User, {
    foreignKey: 'creatorId',
  })
  declare creator: BelongsTo<typeof User>

  @belongsTo(() => Server, {
    foreignKey: 'serverId',
  })
  declare server: BelongsTo<typeof Server>

  @belongsTo(() => User, {
    foreignKey: 'targetId',
  })
  declare target: BelongsTo<typeof User>
}
