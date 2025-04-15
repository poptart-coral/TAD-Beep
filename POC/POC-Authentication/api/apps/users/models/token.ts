import { BaseModel, belongsTo, column } from '@adonisjs/lucid/orm'
import User from '#apps/users/models/user'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import { DateTime } from 'luxon'

export default class Token extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare token: string

  @column()
  declare ownerId: string

  @belongsTo(() => User)
  declare owner: BelongsTo<typeof User>

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare desactivatedAt: DateTime
}
