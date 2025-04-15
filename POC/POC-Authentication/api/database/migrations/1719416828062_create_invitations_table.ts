import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'invitations'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.string('id').primary()
      table.string('creator_id').references('id').inTable('users').notNullable()
      table.string('server_id').references('id').inTable('servers').notNullable()
      table.boolean('is_unique').notNullable()
      table.timestamp('expiration').notNullable()
      table.enum('state', ['usable', 'unusable']).notNullable().defaultTo('usable')
      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
