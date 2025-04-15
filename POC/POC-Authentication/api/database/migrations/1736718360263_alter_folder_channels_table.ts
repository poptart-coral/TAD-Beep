import Channel from '#apps/channels/models/channel'
import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'channels'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table
        .string('parent_id')
        .references('id')
        .inTable(Channel.table)
        .onDelete('CASCADE')
        .onUpdate('CASCADE')
        .nullable() // if null then "leaf" of the folder tree
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('parent_id')
    })
  }
}
