import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'servers_users'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.unique(['server_id', 'user_id'])
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropUnique(['server_id', 'user_id'])
    })
  }
}
