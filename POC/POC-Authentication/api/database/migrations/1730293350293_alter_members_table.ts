import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'members'

  async up() {
    this.schema.alterTable('members', (table) => {
      table.unique(['user_id', 'server_id'])
    })
  }

  async down() {
    this.schema.alterTable('members', (table) => {
      table.dropUnique(['user_id', 'server_id'])
    })
  }
}
