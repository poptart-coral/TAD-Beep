import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'channel_user_permissions_overrides'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.string('channel_id').notNullable()
      table.string('user_id').notNullable()
      table.string('permission_id').notNullable()
      table.foreign('channel_id').references('id').inTable('channels').onDelete('CASCADE')
      table.foreign('user_id').references('id').inTable('users').onDelete('CASCADE')
      table
        .foreign('permission_id')
        .references('id')
        .inTable('permissions_overrides')
        .onDelete('CASCADE')
      table.primary(['channel_id', 'user_id', 'permission_id'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
