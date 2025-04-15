import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'channels'

  async up() {
    // Alter the table structure
    await this.schema.alterTable(this.tableName, (table) => {
      table.renameColumn('type', 'type_old')
    })

    // Add new column
    await this.schema.alterTable(this.tableName, (table) => {
      table.integer('type').notNullable().defaultTo(0)
    })

    // Ajouter le CHECK avec un nom explicite
    this.db.raw(
      `ALTER TABLE ${this.tableName} ADD CONSTRAINT check_type_values CHECK (type IN (0, 1, 2))`
    )

    // Migrate the data
    await this.db.from(this.tableName).where('type_old', 'text').update({ type: 0 })
    await this.db.from(this.tableName).where('type_old', 'voice').update({ type: 1 })

    // Drop the old column
    await this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('type_old')
    })
  }

  async down() {
    // Revert changes
    await this.schema.alterTable(this.tableName, (table) => {
      table.renameColumn('type', 'type_old')
    })

    // Add old column
    await this.schema.alterTable(this.tableName, (table) => {
      table.enum('type', ['voice', 'text']).notNullable().defaultTo('text')
    })

    // Migrate the data
    await this.db.from(this.tableName).where('type_old', 0).update({ type: 'text' })
    await this.db.from(this.tableName).where('type_old', 1).update({ type: 'voice' })

    // Drop the old column
    await this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('type_old')
    })
  }
}
