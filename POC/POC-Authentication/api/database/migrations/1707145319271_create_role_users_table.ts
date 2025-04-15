import { BaseSchema } from '@adonisjs/lucid/schema'
import Role from '#apps/roles/models/role'
import User from '#apps/users/models/user'

export default class extends BaseSchema {
  protected tableName = 'role_user'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.string('role_id').references('id').inTable(Role.table).onDelete('CASCADE')

      table.string('user_id').references('id').inTable(User.table).onDelete('CASCADE')

      table.unique(['role_id', 'user_id'])

      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
