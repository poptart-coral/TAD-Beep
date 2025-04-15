import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'roles'

  async up() {
    // Delete all rows in the table (these are old 'default roles')
    this.defer(async (db) => {
      await db.from(this.tableName).select('*').delete()
    })

    this.schema.alterTable(this.tableName, (table) => {
      table.string('name').notNullable()
      table.dropColumn('label')

      table.integer('permissions').unsigned().notNullable()
      table.dropColumn('power')
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.string('label').unique()
      table.dropColumn('name')

      table.integer('power').defaultTo(1)
      table.dropColumn('permissions')
    })

    // Re-add the old rows
    this.defer(async (db) => {
      await db.table(this.tableName).insert([
        {
          id: '1',
          label: 'Administrator',
          power: 100,
          created_at: new Date(),
          updated_at: new Date(),
        },
        { id: '2', label: 'Member', power: 1, created_at: new Date(), updated_at: new Date() },
      ])
    })
  }
}
