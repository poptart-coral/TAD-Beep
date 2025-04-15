import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'webhooks'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      //column token as nullable
      table.string('token').nullable().alter()
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.string('token').notNullable().alter()
    })
  }
}
