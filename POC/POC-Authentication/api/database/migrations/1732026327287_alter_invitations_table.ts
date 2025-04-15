import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'invitations'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('is_unique')
      table.dropColumn('state')
      table.setNullable('expiration')
      table.setNullable('server_id')
      table.string('target_id').nullable().references('id').inTable('users')
      table.integer('type').notNullable()
      table.integer('status').nullable()
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.string('is_unique').notNullable().defaultTo(false)
      table.enum('state', ['usable', 'unusable']).notNullable().defaultTo('usable')
      this.schema.raw('DELETE FROM invitations WHERE server_id IS NULL')
      table.dropColumn('target_id')
      table.dropColumn('type')
      table.dropColumn('status')
    })
  }
}
