import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'servers_users'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.string('user_id').references('id').inTable('users').onDelete('CASCADE')
      table.string('server_id').references('id').inTable('servers').onDelete('CASCADE')
      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
