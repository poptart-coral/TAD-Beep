import Role from '#apps/roles/models/role'
import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'member_role'

  async up() {
    this.schema.createTable('member_role_transition', (table) => {
      table
        .string('member_id')
        .notNullable()
        .references('id')
        .inTable('members')
        .onDelete('CASCADE')
      table.string('role_id').notNullable().references('id').inTable('roles').onDelete('CASCADE')
      table.primary(['member_id', 'role_id'])
      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
    const role = await Role.query().preload('members')
    for (const r of role) {
      for (const m of r.members) {
        await this.db.table('member_role_transition').insert({ member_id: m.id, role_id: r.id })
      }
    }
    this.schema.dropTable(this.tableName)
    this.schema.renameTable('member_role_transition', 'member_role')
  }

  async down() {
    this.schema.alterTable('member_role', (table) => {
      table.string('id')
    })
  }
}
