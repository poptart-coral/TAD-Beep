import Member from '#apps/members/models/member'
import Server from '#apps/servers/models/server'
import { BaseModel, beforeCreate, belongsTo, column, manyToMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, ManyToMany } from '@adonisjs/lucid/types/relations'
import { DateTime } from 'luxon'
import { randomUUID } from 'node:crypto'

export default class Role extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

  @column()
  declare name: string

  @column()
  declare permissions: number // Permissions are hexadecimals

  @column()
  declare color: number

  @column()
  declare serverId: string

  @manyToMany(() => Member, {})
  declare members: ManyToMany<typeof Member>

  // Define the parent relationship (a role belongs to a server)
  @belongsTo(() => Server)
  declare server: BelongsTo<typeof Server>

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null

  // Generate a snowflake unique ID for the role.
  // Snowflake IDs can be sorted by creation date.
  @beforeCreate()
  public static async generateUuid(model: Role) {
    if (!model.id) model.id = randomUUID()
  }
}
