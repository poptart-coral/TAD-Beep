import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'webhooks'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.string('id').primary()
      table.string('server_id').nullable()
      table.string('channel_id').notNullable()
      table.string('user_id').nullable()
      table.string('name').nullable()
      table.string('profile_picture').nullable()
      table.string('token').notNullable()
      table.unique(['channel_id', 'name'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
