import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'friends'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.string('user_id').notNullable()
      table.string('friend_id').notNullable()

      // Composite primary key
      table.primary(['user_id', 'friend_id'])

      // Foreign keys to reference the user table
      table.foreign('user_id').references('id').inTable('users').onDelete('CASCADE')
      table.foreign('friend_id').references('id').inTable('users').onDelete('CASCADE')
      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
