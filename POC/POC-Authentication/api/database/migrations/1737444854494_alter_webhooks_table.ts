import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'webhooks'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.renameColumn('profile_picture', 'webhook_picture')
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.renameColumn('webhook_picture', 'profile_picture')
    })
  }
}
