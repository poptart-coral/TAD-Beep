import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'channels'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.string('server_id').nullable().alter()
    })
  }
}
