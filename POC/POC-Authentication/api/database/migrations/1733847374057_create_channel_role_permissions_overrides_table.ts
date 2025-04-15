import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'channel_role_permissions_overrides'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.string('channel_id').notNullable()
      table.string('role_id').notNullable()
      table.string('permission_id').notNullable()
      table.foreign('channel_id').references('id').inTable('channels').onDelete('CASCADE')
      table.foreign('role_id').references('id').inTable('roles').onDelete('CASCADE')
      table
        .foreign('permission_id')
        .references('id')
        .inTable('permissions_overrides')
        .onDelete('CASCADE')
      table.primary(['channel_id', 'role_id', 'permission_id'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
