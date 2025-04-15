import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'messages'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.string('id').primary()
      table.text('content').notNullable()
      table.string('owner_id').references('id').inTable('users').nullable()
      table
        .string('channel_id')
        .references('id')
        .inTable('channels')
        .onDelete('CASCADE')
        .notNullable()
      table
        .string('reply_to_message_id')
        .references('id')
        .inTable('messages')
        .onDelete('SET NULL')
        .nullable()
      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
