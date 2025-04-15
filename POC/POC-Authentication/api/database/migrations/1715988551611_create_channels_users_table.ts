import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'channels_users'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.string('user_id').references('id').inTable('users').onDelete('CASCADE')
      table.string('channel_id').references('id').inTable('channels').onDelete('CASCADE')
      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
