import Channel from '#apps/channels/models/channel'
import factory from '@adonisjs/lucid/factories'
import { ServerFactory } from '#database/factories/server_factory'
import { ChannelType } from '#apps/channels/models/channel_type'
import { UserFactory } from './user_factory.js'

export const ChannelFactory = factory
  .define(Channel, async ({ faker }) => {
    return Channel.create({
      name: faker.internet.username(),
      description: faker.lorem.sentence(),
      type: ChannelType.TEXT_SERVER,
    })
  })
  .state('private_channel', async (channel) => {
    channel.type = ChannelType.PRIVATE_CHAT
  })
  .state('folder_channel', async (channel) => {
    channel.type = ChannelType.FOLDER_SERVER
  })
  .state('voice_channel', async (channel) => {
    channel.type = ChannelType.VOICE_SERVER
  })
  .state('text_channel', async (channel) => {
    //for declarative setup
    channel.type = ChannelType.TEXT_SERVER
  })
  .relation('server', () => ServerFactory)
  .relation('users', () => UserFactory)
  .build()

export const ChannelFactoryWithServer = (serverId: string) =>
  factory
    .define(Channel, async ({ faker }) => {
      return Channel.create({
        name: faker.internet.username(),
        description: faker.lorem.sentence(),
        type: ChannelType.TEXT_SERVER,
        serverId: serverId,
      })
    })
    .state('folder_channel', async (channel) => {
      channel.type = ChannelType.FOLDER_SERVER
    })
    .build()
