import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'members'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.string('nickname')
      table.text('avatar')
      table.boolean('deaf')
      table.boolean('mute')
      table.boolean('pending')
      table.timestamp('timed_out_until')
      table.string('server_id').references('id').inTable('servers').onDelete('CASCADE')
      table.string('user_id').references('id').inTable('users').onDelete('CASCADE')
      table.timestamp('joined_at')
      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
