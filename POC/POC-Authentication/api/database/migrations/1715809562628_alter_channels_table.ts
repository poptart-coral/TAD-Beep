import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'channels'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.string('server_id').notNullable()
      table.foreign('server_id').references('id').inTable('servers').onDelete('CASCADE')
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropForeign(['server_id'])
      table.dropColumn('server_id')
    })
  }
}
