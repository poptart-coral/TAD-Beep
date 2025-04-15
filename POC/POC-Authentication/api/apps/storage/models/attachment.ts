import Message from '#apps/messages/models/message'
import { BaseModel, beforeCreate, belongsTo, column } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import { DateTime } from 'luxon'
import { randomUUID } from 'node:crypto'

export default class Attachment extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null

  @column()
  declare name: string

  @column()
  declare contentType: string

  @column()
  declare messageId: string

  @belongsTo(() => Message)
  declare message: BelongsTo<typeof Message>

  @beforeCreate()
  static async generateUuid(model: Attachment) {
    model.id = randomUUID()
  }

  // fix this
  // @afterCreate()
  // @afterUpdate()
  // @afterSave()
  // @afterFind()
  // static async generateUrl(model: Attachment) {
  //   model.url = 'http://localhost:3333/storage/files/secure/' + model.id
  //   // model.url = await S3Driver.getInstance().getSignedUrl(
  //   //   env.get('S3_BUCKET_NAME') ?? 'app',
  //   //   model.name
  //   // )
  // }

  // @afterFetch()
  // static async generateUrlFetch(model: Attachment[]) {
  //   for (const attachment of model) {
  //     attachment.url = 'http://localhost:3333/storage/files/secure/' + attachment.id
  //     // attachment.url = await S3Driver.getInstance().getSignedUrl(
  //     //   env.get('S3_BUCKET_NAME') ?? 'app',
  //     //   attachment.name
  //     // )
  //   }
  // }

  // @afterPaginate()
  // static async generateUrlPaginate(model: querybuilder.SimplePaginatorContract<Attachment>) {
  //   for (const attachment of model.all()) {
  //     attachment.url = 'http://localhost:3333/storage/files/secure/' + attachment.id
  //     // attachment.url = await S3Driver.getInstance().getSignedUrl(
  //     //   env.get('S3_BUCKET_NAME') ?? 'app',
  //     //   attachment.name
  //     // )
  //   }
  // }
}
