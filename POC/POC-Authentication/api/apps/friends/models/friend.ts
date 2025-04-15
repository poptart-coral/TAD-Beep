import User from '#apps/users/models/user'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import { BaseModel, belongsTo, column } from '@adonisjs/lucid/orm'

export default class Friend extends BaseModel {
  @column({ isPrimary: true })
  declare user_id: string

  @column({ isPrimary: true })
  declare friend_id: string

  @belongsTo(() => User, {
    foreignKey: 'user_id',
  })
  declare user: BelongsTo<typeof User>

  @belongsTo(() => User, {
    foreignKey: 'friend_id',
  })
  declare friend: BelongsTo<typeof User>
}
