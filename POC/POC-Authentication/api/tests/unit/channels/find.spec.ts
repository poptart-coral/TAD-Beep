import { ChannelType } from '#apps/channels/models/channel_type'
import ChannelService from '#apps/channels/services/channel_service'
import { ChannelFactory, ChannelFactoryWithServer } from '#database/factories/channel_factory'
import { ServerFactory } from '#database/factories/server_factory'
import { UserFactory } from '#database/factories/user_factory'
import app from '@adonisjs/core/services/app'
import { test } from '@japa/runner'

const channelService = await app.container.make(ChannelService)

test.group('Channels find', () => {
  test('must return a channel with the given id', async ({ expect }) => {
    const channelCreated = await ChannelFactory.create()
    const channel = await channelService.findByIdOrFail(channelCreated.id)
    expect(channel.id).toBe(channelCreated.id)
    expect(channel.name).toBe(channelCreated.name)
    expect(channel.position).toBe(0)
  })

  test('must return the correct structure with a folder api', async ({ expect }) => {
    const owner = await UserFactory.create()
    const server = await ServerFactory.create()
    const channelCreated = await ChannelFactoryWithServer(server.id)
      .apply('folder_channel')
      .create()
    const child = await channelService.create(
      {
        type: ChannelType.TEXT_SERVER,
        parentId: channelCreated.id,
        name: 'Test channel',
      },
      channelCreated.serverId,
      owner.id
    )

    const channels = await channelService.findAllChannelsByServerWithChildren(server.id)
    const channel = channels[0]
    expect(channel.id).toBe(channelCreated.id)
    expect(channel.name).toBe(channelCreated.name)
    expect(channel.position).toBe(0)
    expect(channel.childrens.length).toBe(1)
    expect(channel.childrens[0].id).toBe(child.id)
  }).tags(['channels:find'])
})
