import { BaseSchema } from '@adonisjs/lucid/schema'
import Server from '#apps/servers/models/server'

export default class extends BaseSchema {
  protected tableName = 'roles'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.string('id').primary()
      table.string('label').unique()
      table.integer('power').defaultTo(1)
      table.string('server_id').references('id').inTable(Server.table).onDelete('CASCADE')
      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
