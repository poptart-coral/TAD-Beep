import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'users'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.boolean('TOTPAuthentication').defaultTo(false)
      table.string('TOTPSecret').nullable().defaultTo(null)
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('TOTPAuthentication')
      table.dropColumn('TOTPSecret')
    })
  }
}
