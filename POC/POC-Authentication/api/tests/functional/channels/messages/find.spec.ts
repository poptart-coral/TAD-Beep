import { ChannelFactory } from '#database/factories/channel_factory'
import { MemberFactory, MemberFactoryWithServer } from '#database/factories/member_factory'
import { MessageFactory } from '#database/factories/message_factory'
import { PermissionLessServerFactory } from '#database/factories/server_factory'
import { UserFactory } from '#database/factories/user_factory'
import { test } from '@japa/runner'

test.group('Channels messages find', () => {
  test('must return a 200 and messages if the user is in the server of the channel', async ({
    client,
  }) => {
    const member = await MemberFactory.create()
    const channel = await ChannelFactory.merge({ serverId: member.serverId }).create()
    const messages = await MessageFactory.merge({ channelId: channel.id }).createMany(5)
    await member.load('user')
    const response = await client.get(`/channels/${channel.id}/messages`).loginAs(member.user)
    response.assertStatus(200)
    response.assertBodyContains(messages.map(({ id, content }) => ({ id, content })))
  }).tags(['channels:messages:find'])

  test('must return a 200 and the messages if the user is a member of the channel', async ({
    client,
  }) => {
    const user = await UserFactory.create()
    const channel = await ChannelFactory.apply('private_channel').create()
    await channel.related('users').attach([user.id])
    const messages = await MessageFactory.merge({
      channelId: channel.id,
      ownerId: user.id,
    }).createMany(5)
    const response = await client.get(`/channels/${channel.id}/messages`).loginAs(user)
    response.assertStatus(200)
    response.assertBodyContains(messages.map(({ id, content }) => ({ id, content })))
  }).tags(['channels:messages:find'])

  test('must return a 200 and the message if the user is a member of the channel', async ({
    client,
  }) => {
    const user = await UserFactory.create()
    const channel = await ChannelFactory.apply('private_channel').create()
    await channel.related('users').attach([user.id])
    const message = await MessageFactory.merge({
      channelId: channel.id,
      ownerId: user.id,
    }).create()
    const response = await client
      .get(`/channels/${channel.id}/messages/${message.id}`)
      .loginAs(user)
    response.assertStatus(200)
    response.assertBodyContains({ id: message.id, content: message.content })
  }).tags(['channels:messages:find'])

  test('must return a 200 and the message if the user is in the server of the channel', async ({
    client,
  }) => {
    const member = await MemberFactory.create()
    const channel = await ChannelFactory.merge({ serverId: member.serverId }).create()
    const message = await MessageFactory.merge({ channelId: channel.id }).create()
    await member.load('user')
    const response = await client
      .get(`/channels/${channel.id}/messages/${message.id}`)
      .loginAs(member.user)
    response.assertStatus(200)
    response.assertBodyContains({ id: message.id, content: message.content })
  }).tags(['channels:messages:find'])

  test('must return a 401 if the user is not logged in when showing a specific message', async ({
    client,
  }) => {
    const channel = await ChannelFactory.create()
    const message = await MessageFactory.merge({ channelId: channel.id }).create()
    const response = await client.get(`/channels/${channel.id}/messages/${message.id}`)
    response.assertStatus(401)
  }).tags(['channels:messages:find'])
  test('must return a 401 if the user is not logged in', async ({ client }) => {
    const channel = await ChannelFactory.create()
    const response = await client.get(`/channels/${channel.id}/messages`)
    response.assertStatus(401)
  }).tags(['channels:messages:find'])

  test('must return 403 if the user does not have the VIEW_CHANNEL permission', async ({
    client,
  }) => {
    const server = await PermissionLessServerFactory.create()
    const member = await MemberFactoryWithServer(server.id).create()
    await member.load('user')
    const channel = await ChannelFactory.merge({ serverId: member.serverId }).create()
    const response = await client.get(`/channels/${channel.id}/messages`).loginAs(member.user)
    response.assertStatus(403)
  }).tags(['channels:messages:find'])

  test('must return a 403 if the user is not a member of the server of the channel', async ({
    client,
  }) => {
    const user = await UserFactory.create()
    const message = await MessageFactory.create()
    const response = await client
      .get(`/channels/${message.channelId}/messages/${message.id}`)
      .loginAs(user)
    response.assertStatus(403)
  }).tags(['channels:messages:find'])

  test('must return a 403 if the user is neither a member of the channel nor of the server the channel is in', async ({
    client,
  }) => {
    const user = await UserFactory.create()
    const channel = await ChannelFactory.create()
    const response = await client.get(`/channels/${channel.id}/messages`).loginAs(user)
    response.assertStatus(403)
  }).tags(['channels:messages:find'])

  test('must return a 404 when showing one message if the channel does not exist', async ({
    client,
  }) => {
    const user = await UserFactory.create()
    const message = await MessageFactory.merge({ ownerId: user.id }).create()
    const response = await client
      .get(`/channels/non-existant-id/messages/${message.id}`)
      .loginAs(user)
    response.assertStatus(404)
  }).tags(['channels:messages:find'])
  test('must return a 404 if the message does not exist in the channel', async ({ client }) => {
    const user = await UserFactory.create()
    const channel = await ChannelFactory.apply('private_channel').create()
    await channel.related('users').attach([user.id])
    const response = await client
      .get(`/channels/${channel.id}/messages/non-existant-id`)
      .loginAs(user)
    response.assertStatus(404)
  }).tags(['channels:messages:find'])

  test('must return a 404 if the message does not exist and the user is in the server of the channel', async ({
    client,
  }) => {
    const member = await MemberFactory.create()
    const channel = await ChannelFactory.merge({ serverId: member.serverId }).create()
    await member.load('user')
    const response = await client
      .get(`/channels/${channel.id}/messages/non-existant-id`)
      .loginAs(member.user)
    response.assertStatus(404)
  }).tags(['channels:messages:find'])
  test('must return a 404 if the channel does not exist', async ({ client }) => {
    const user = await UserFactory.create()
    const response = await client.get('/channels/non-existant-id/messages').loginAs(user)
    response.assertStatus(404)
  }).tags(['channels:messages:find'])
})
