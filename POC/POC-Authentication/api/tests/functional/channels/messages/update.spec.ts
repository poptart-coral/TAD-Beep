import { Permissions } from '#apps/shared/enums/permissions'
import { ChannelFactory } from '#database/factories/channel_factory'
import { MemberFactory, MemberFactoryWithServer } from '#database/factories/member_factory'
import { MessageFactory } from '#database/factories/message_factory'
import { PermissionLessServerFactory } from '#database/factories/server_factory'
import { UserFactory } from '#database/factories/user_factory'
import { test } from '@japa/runner'

test.group('Channels messages update', () => {
  test('must return 200 when updating message of a channel in a server', async ({ client }) => {
    const member = await MemberFactory.create()
    await member.load('user')
    const channel = await ChannelFactory.merge({ serverId: member.serverId }).create()
    const message = await MessageFactory.merge({
      channelId: channel.id,
      ownerId: member.userId,
    }).create()
    const data = { content: 'new content' }
    const response = await client
      .patch(`/channels/${channel.id}/messages/${message.id}`)
      .loginAs(member.user)
      .json(data)
    response.assertStatus(200)
    response.assertBodyContains(data)
  }).tags(['channels:messages:update'])

  test('must return 200 when updating message of a channel in a server with only SEND_MESSAGES & VIEW_CHANNEL permission', async ({
    client,
  }) => {
    const server = await PermissionLessServerFactory.create()
    await server.load('roles')
    const role = server.roles[0]
    role.permissions = Permissions.SEND_MESSAGES | Permissions.VIEW_CHANNELS
    await role.save()
    const members = await MemberFactoryWithServer(server.id).createMany(2)
    await Promise.all(members.map(async (m) => await m.load('user')))
    const channel = await ChannelFactory.merge({ serverId: members[1].serverId }).create()
    const message = await MessageFactory.merge({
      channelId: channel.id,
      ownerId: members[0].userId,
    }).create()

    const data = { content: 'new content' }

    const response = await client
      .patch(`/channels/${channel.id}/messages/${message.id}`)
      .loginAs(members[1].user)
      .json(data)
    response.assertStatus(200)
    response.assertBodyContains(data)
  }).tags(['channels:messages:update'])

  test('must return 200 when updating message of a channel if the user is a member', async ({
    client,
  }) => {
    const user = await UserFactory.create()
    const channel = await ChannelFactory.apply('private_channel').create()
    await channel.related('users').attach([user.id])
    const message = await MessageFactory.merge({
      channelId: channel.id,
      ownerId: user.id,
    }).create()
    const data = { content: 'updated content' }
    const response = await client
      .patch(`/channels/${channel.id}/messages/${message.id}`)
      .loginAs(user)
      .json(data)
    response.assertStatus(200)
    response.assertBodyContains(data)
  })

  test('must return 401 if not logged in', async ({ client }) => {
    const channel = await ChannelFactory.create()
    const message = await MessageFactory.create()
    const response = await client
      .patch(`/channels/${channel.id}/messages/${message.id}`)
      .json({ content: 'Unauthorized message' })
    response.assertStatus(401)
  }).tags(['channels:messages:update'])

  test('must return 403 if the user is not in the server of the channel', async ({ client }) => {
    const user = await UserFactory.create()
    const channel = await ChannelFactory.with('server').create()
    const message = await MessageFactory.merge({ channelId: channel.id }).create()
    const response = await client
      .patch(`/channels/${channel.id}/messages/${message.id}`)
      .loginAs(user)
      .json({ content: 'Forbidden message' })
    response.assertStatus(403)
  }).tags(['channels:messages:update'])

  test('must return 403 if the user has not permission MANAGE_MESSAGES && VIEW_CHANNELS || SEND_MESSAGES in server', async ({
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
    const data = { content: 'new content' }
    // Simulate the user not having the required permissions
    const response = await client
      .patch(`/channels/${channel.id}/messages/${message.id}`)
      .loginAs(member[0].user)
      .json(data)
    response.assertStatus(403)
  }).tags(['channels:messages:update'])

  test('must return 403 if the user is not in the channel', async ({ client }) => {
    const member = await MemberFactory.create()
    await member.load('user')
    const channel = await ChannelFactory.apply('private_channel').create()
    const message = await MessageFactory.merge({ channelId: channel.id }).create()
    const response = await client
      .patch(`/channels/${channel.id}/messages/${message.id}`)
      .loginAs(member.user)
      .json({ content: 'Forbidden message' })
    response.assertStatus(403)
  }).tags(['channels:messages:update'])

  test('must return 404 if the message does not exist', async ({ client }) => {
    const member = await MemberFactory.create()
    await member.load('user')
    const channel = await ChannelFactory.merge({ serverId: member.serverId }).create()
    const response = await client
      .patch(`/channels/${channel.id}/messages/nonexistantMessageId`)
      .loginAs(member.user)
      .json({ content: 'Forbidden message' })
    response.assertStatus(404)
  }).tags(['channels:messages:update'])

  test('must return 404 if the channel does not exist', async ({ client }) => {
    const user = await UserFactory.create()
    const message = await MessageFactory.create()
    const response = await client
      .patch(`/channels/nonexistantChannelId/messages/${message.id}`)
      .loginAs(user)
      .json({ content: 'Forbidden message' })
    response.assertStatus(404)
  }).tags(['channels:messages:update'])
})
