import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'member_roles'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      /*
      table.string('member_id').references('id').inTable('members').onDelete('CASCADE')
      table.string('role_id').references('id').inTable('roles').onDelete('CASCADE')
      */
      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
