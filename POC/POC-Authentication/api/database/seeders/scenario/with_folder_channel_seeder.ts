import Server from '#apps/servers/models/server'
import { BaseSeeder } from '@adonisjs/lucid/seeders'
import { ChannelType } from '#apps/channels/models/channel_type'
import logger from '@adonisjs/core/services/logger'
import Channel from '#apps/channels/models/channel'

export default class extends BaseSeeder {
  async run() {
    const server = await Server.findBy('name', 'Beep')

    const channel = await Channel.findBy('name', 'Folder Channel')
    const channel2 = await Channel.findBy('name', 'Children')

    if (channel || channel2) {
      logger.info('Channels already exists')
      return
    }

    if (!server) {
      throw new Error('Server not found')
    }

    try {
      const parent = await Channel.create({
        name: 'Folder Channel',
        type: ChannelType.FOLDER_SERVER,
        serverId: server.id,
        serialNumber: '1',
        position: 0,
      })

      logger.info('Parent channel created', parent.id)

      await Channel.create({
        name: 'Children',
        type: ChannelType.TEXT_SERVER,
        serverId: server.id,
        serialNumber: '2',
        position: 0,
        parentId: parent.id,
      })
    } catch (e) {
      logger.error(e)
    }
  }
}
