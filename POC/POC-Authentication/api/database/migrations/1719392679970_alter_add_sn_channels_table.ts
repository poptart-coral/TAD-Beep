import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'channels'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.string('serial_number').unique()
    })

    // this.defer(async (db) => {
    //   const channels = await Channel.query().whereNull('serial_number')
    //   //const channels = await db.from('channels').select('*').whereNull('serial_number')
    //   await Promise.all(
    //     channels.map((channel) => {
    //       const sn = generateSnowflake()
    //       return channel.merge({ serialNumber: sn }).save()
    //     })
    //   )
    // })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('serial_number')
    })
  }
}
