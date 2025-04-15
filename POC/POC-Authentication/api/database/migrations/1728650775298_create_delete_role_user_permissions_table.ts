import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'member_role'
  async up() {
    this.schema.dropTableIfExists('role_user')
    this.schema.dropTableIfExists('role_permissions')
    this.schema.dropTableIfExists('member_roles')

    this.schema.alterTable('members', (table) => {
      table.dropColumn('id')
    })

    this.schema.alterTable('members', (table) => {
      table.string('id').primary()
    })

    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')

      table.string('member_id').references('id').inTable('members').onDelete('CASCADE')
      table.string('role_id').references('id').inTable('roles').onDelete('CASCADE')

      table.unique(['member_id', 'role_id'])

      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down(): Promise<void> {
    this.schema.createTable('role_user', () => {})
    this.schema.createTable('role_permissions', () => {})
    this.schema.createTable('member_roles', () => {})

    this.schema.dropTableIfExists(this.tableName)
  }
}
