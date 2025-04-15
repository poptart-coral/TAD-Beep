import { ChannelFactory } from '#database/factories/channel_factory'
import { MemberFactory, MemberFactoryWithServer } from '#database/factories/member_factory'
import { PermissionLessServerFactory } from '#database/factories/server_factory'
import { UserFactory } from '#database/factories/user_factory'
import { test } from '@japa/runner'

test.group('Channels messages create', () => {
  test('must return 201 and messages if the user is in the server of the channel', async ({
    assert,
    client,
  }) => {
    const member = await MemberFactory.create()
    await member.load('user')
    const channel = await ChannelFactory.merge({ serverId: member.serverId }).create()
    const payload = { content: 'Hello, world!' }
    const response = await client
      .post(`/channels/${channel.id}/messages`)
      .loginAs(member.user)
      .json(payload)
    response.assertStatus(201)
    assert.equal(response.body().content, payload.content)
  }).tags(['channels:messages:create'])
  test('must return 201 and messages if the user is a member of the channel', async ({
    assert,
    client,
  }) => {
    const user = await UserFactory.create()
    const channel = await ChannelFactory.apply('private_channel').create()
    await channel.related('users').attach([user.id])
    const payload = { content: 'Hello, channel members!' }
    const response = await client
      .post(`/channels/${channel.id}/messages`)
      .loginAs(user)
      .json(payload)
    response.assertStatus(201)
    assert.equal(response.body().content, payload.content)
  }).tags(['channels:messages:create'])

  test('must return 401 if not logged in', async ({ client }) => {
    const channel = await ChannelFactory.create()
    const payload = { content: 'Unauthorized message' }
    const response = await client.post(`/channels/${channel.id}/messages`).json(payload)
    response.assertStatus(401)
  }).tags(['channels:messages:create'])
  test('must return 403 if the member of server has not SEND_MESSAGES & VIEW_CHANNELS permissions', async ({
    client,
  }) => {
    const server = await PermissionLessServerFactory.create()
    const member = await MemberFactoryWithServer(server.id).create()
    await member.load('user')
    const channel = await ChannelFactory.merge({ serverId: member.serverId }).create()
    const payload = { content: 'Forbidden message' }
    // Simulate the member not having SEND_MESSAGES & VIEW_CHANNELS permissions
    await member.related('roles').detach()
    const response = await client
      .post(`/channels/${channel.id}/messages`)
      .loginAs(member.user)
      .json(payload)
    response.assertStatus(403)
  }).tags(['channels:messages:create'])

  test('must return 403 if the user is neither in nor a user of the channel', async ({
    client,
  }) => {
    const user = await UserFactory.create()
    const channel = await ChannelFactory.create()
    const payload = { content: 'Forbidden message' }
    const response = await client
      .post(`/channels/${channel.id}/messages`)
      .loginAs(user)
      .json(payload)
    response.assertStatus(403)
  }).tags(['channels:messages:create'])

  test('must return 403 if the user is not a member in the server of the channel', async ({
    client,
  }) => {
    const user = await UserFactory.create()
    const channel = await ChannelFactory.with('server').create()
    const payload = { content: 'Forbidden message' }
    const response = await client
      .post(`/channels/${channel.id}/messages`)
      .loginAs(user)
      .json(payload)
    response.assertStatus(403)
  }).tags(['channels:messages:create'])
  test('must return 404 if the channel does not exist', async ({ client }) => {
    const user = await UserFactory.create()
    const payload = { content: 'Non-existent channel message' }
    const response = await client
      .post(`/channels/non-existant-id/messages`)
      .json(payload)
      .loginAs(user)
    response.assertStatus(404)
  }).tags(['channels:messages:create'])
})
