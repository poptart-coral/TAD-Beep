import Role from '#apps/roles/models/role'
import Server from '#apps/servers/models/server'
import User from '#apps/users/models/user'
import { BaseModel, beforeCreate, belongsTo, column, manyToMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, ManyToMany } from '@adonisjs/lucid/types/relations'
import { DateTime } from 'luxon'
import { randomUUID } from 'node:crypto'

export default class Member extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

  @column()
  declare nickname: string

  @column()
  declare avatar: string

  @column()
  declare deaf: boolean

  @column()
  declare mute: boolean

  @column()
  declare pending: boolean

  @column.dateTime()
  declare timedOutUntil: DateTime | null

  @column()
  declare serverId: string

  @column()
  declare userId: string

  @column()
  declare joinedAt: DateTime | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null

  @belongsTo(() => User, {
    foreignKey: 'userId',
  })
  declare user: BelongsTo<typeof User>

  @belongsTo(() => Server, {
    foreignKey: 'serverId',
  })
  declare server: BelongsTo<typeof Server>

  @manyToMany(() => Role)
  declare roles: ManyToMany<typeof Role>

  @beforeCreate()
  static async generateUuid(model: Member) {
    model.id = randomUUID()
  }
}
