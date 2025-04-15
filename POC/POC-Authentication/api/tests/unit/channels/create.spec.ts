import { ChannelType } from '#apps/channels/models/channel_type'
import ChannelService from '#apps/channels/services/channel_service'
import { ChannelFactory } from '#database/factories/channel_factory'
import { UserFactory } from '#database/factories/user_factory'
import app from '@adonisjs/core/services/app'
import { test } from '@japa/runner'

const channelService = await app.container.make(ChannelService)

test.group('Channels create', () => {
  test('must throw an error when creating a channel with parent and of type folder', async ({
    assert,
  }) => {
    const owner = await UserFactory.create()
    const parent = await ChannelFactory.apply('folder_channel').create()
    try {
      await channelService.create(
        {
          type: ChannelType.FOLDER_SERVER,
          parentId: parent.id,
          name: 'Test channel',
        },
        parent.serverId,
        owner.id
      )
    } catch (e) {
      assert.equal(e.message, "Channel with type folder_server can't have a parent channel")
    }
  })

  test('must throw an error when creating a channel of type private chat', async ({ assert }) => {
    const owner = await UserFactory.create()
    const parent = await ChannelFactory.apply('folder_channel').create()
    try {
      await channelService.create(
        {
          type: ChannelType.PRIVATE_CHAT,
          parentId: parent.id,
          name: 'Test channel',
        },
        parent.serverId,
        owner.id
      )
    } catch (e) {
      assert.equal(e.message, "Channel with type private_chat can't have a parent channel")
    }
  })

  test('must throw an error when creating a channel with parent that is not folder')
    .with(['text_channel', 'private_channel', 'voice_channel'])
    .run(async ({ assert }, channel_type) => {
      const owner = await UserFactory.create()
      const parent = await ChannelFactory.apply(
        channel_type as 'private_channel' | 'folder_channel' | 'voice_channel' | 'text_channel'
      ).create()
      try {
        await channelService.create(
          {
            type: ChannelType.TEXT_SERVER,
            parentId: parent.id,
            name: 'Test channel',
          },
          parent.serverId,
          owner.id
        )
      } catch (e) {
        assert.equal(e.message, 'Parent channel is not of type FOLDER_SERVER')
      }
    })
})
