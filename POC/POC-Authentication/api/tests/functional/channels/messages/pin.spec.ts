import { ChannelFactory } from '#database/factories/channel_factory'
import { MemberFactory, MemberFactoryWithServer } from '#database/factories/member_factory'
import { MessageFactory } from '#database/factories/message_factory'
import { PermissionLessServerFactory } from '#database/factories/server_factory'
import { UserFactory } from '#database/factories/user_factory'
import { test } from '@japa/runner'

test.group('Channels messages pin', () => {
  test('must return 200 and the message that was pinned if the user is member of the server', async ({
    client,
  }) => {
    const member = await MemberFactory.create()
    await member.load('user')
    const channel = await ChannelFactory.merge({ serverId: member.serverId }).create()
    const message = await MessageFactory.merge({
      channelId: channel.id,
      ownerId: member.userId,
    }).create()
    const data = { action: 'pin' }
    const response = await client
      .patch(`/channels/${channel.id}/messages/${message.id}/pinning`)
      .loginAs(member.user)
      .json(data)
    response.assertStatus(200)
    response.assertBodyContains({ id: message.id, pinned: true })
  })
  test('must return 200 and the message that was pinned if the user is in the channel', async ({
    client,
  }) => {
    const user = await UserFactory.create()
    const channel = await ChannelFactory.apply('private_channel').create()
    await channel.related('users').attach([user.id])
    const message = await MessageFactory.merge({
      channelId: channel.id,
      ownerId: user.id,
    }).create()
    const data = { action: 'pin' }
    const response = await client
      .patch(`/channels/${channel.id}/messages/${message.id}/pinning`)
      .loginAs(user)
      .json(data)
    response.assertStatus(200)
    response.assertBodyContains({ id: message.id, pinned: true })
  })

  test('must return 401 if not logged in', async ({ client }) => {
    const channel = await ChannelFactory.create()
    const message = await MessageFactory.create()
    const response = await client
      .patch(`/channels/${channel.id}/messages/${message.id}/pinning`)
      .json({ action: 'pin' })
    response.assertStatus(401)
  })

  test('must return 403 if the user has not permission SEND_MESSAGES & VIEW_CHANNELS, in server', async ({
    client,
  }) => {
    const server = await PermissionLessServerFactory.create()
    const member = await MemberFactoryWithServer(server.id).createMany(2)
    await Promise.all(member.map(async (m) => await m.load('user')))
    const channel = await ChannelFactory.merge({ serverId: member[0].serverId }).create()
    const message = await MessageFactory.merge({
      channelId: channel.id,
      ownerId: member[1].userId,
    }).create()
    // Simulate the user not having the required permissions
    const response = await client
      .patch(`/channels/${channel.id}/messages/${message.id}/pinning`)
      .loginAs(member[0].user)
      .json({ action: 'pin' })
    response.assertStatus(403)
  }).tags(['channels:messages:update'])

  test('must return 403 if the user is not in the server of the channel', async ({ client }) => {
    const user = await UserFactory.create()
    const channel = await ChannelFactory.with('server').create()
    const message = await MessageFactory.merge({ channelId: channel.id }).create()
    const response = await client
      .patch(`/channels/${channel.id}/messages/${message.id}/pinning`)
      .loginAs(user)
      .json({ action: 'pin' })
    response.assertStatus(403)
  })

  test('must return 403 if the user is not in the channel', async ({ client }) => {
    const member = await MemberFactory.create()
    await member.load('user')
    const channel = await ChannelFactory.apply('private_channel').create()
    const message = await MessageFactory.merge({ channelId: channel.id }).create()
    const response = await client
      .patch(`/channels/${channel.id}/messages/${message.id}/pinning`)
      .loginAs(member.user)
      .json({ action: 'pin' })
    response.assertStatus(403)
  })

  test('must return 404 if the message does not exist', async ({ client }) => {
    const member = await MemberFactory.create()
    await member.load('user')
    const channel = await ChannelFactory.merge({ serverId: member.serverId }).create()
    const response = await client
      .patch(`/channels/${channel.id}/messages/nonexistantMessageId/pinning`)
      .loginAs(member.user)
      .json({ action: 'pin' })
    response.assertStatus(404)
  })

  test('must return 409 if the message is already pinned', async ({ client }) => {
    const member = await MemberFactory.create()
    await member.load('user')
    const channel = await ChannelFactory.merge({ serverId: member.serverId }).create()
    const message = await MessageFactory.merge({
      channelId: channel.id,
      ownerId: member.userId,
      pinned: true,
    }).create()
    const response = await client
      .patch(`/channels/${channel.id}/messages/${message.id}/pinning`)
      .loginAs(member.user)
      .json({ action: 'pin' })
    response.assertStatus(409)
  })
})
