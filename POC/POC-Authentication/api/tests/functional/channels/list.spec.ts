import { ChannelFactory } from '#database/factories/channel_factory'
import { MemberFromFactory } from '#database/factories/member_factory'
import { ServerFactory } from '#database/factories/server_factory'
import { UserFactory } from '#database/factories/user_factory'
import { test } from '@japa/runner'

test.group('Channels list', () => {
  test('must return 200 and channels of the user if the user is a member and has VIEW_CHANNEL permission', async ({
    client,
  }) => {
    const channel = await ChannelFactory.with('server').create()
    const user = await UserFactory.create()
    const member = await MemberFromFactory(channel.serverId, user.id).create()
    const response = await client.get(`/servers/${member.serverId}/channels`).loginAs(user)
    response.assertStatus(200)
    response.assertBodyContains([{ id: channel.id }, { id: channel.id }])
  })
  test('must return 401 if your are not login', async ({ client }) => {
    const server = await ServerFactory.create()
    const response = await client.get(`/servers/${server.id}/channels`)
    response.assertStatus(401)
  })
  test('must return 403 when the user is not a member of the server', async ({ client }) => {
    const server = await ServerFactory.create()
    await ChannelFactory.create()
    const user = await UserFactory.create()

    const response = await client.get(`/servers/${server.id}/channels`).loginAs(user)

    response.assertStatus(403)
  })
  test('must return 404 if the server does not exist', async ({ client }) => {
    const user = await UserFactory.create()

    const response = await client.get(`/servers/nonexistantServerId/channels`).loginAs(user)

    response.assertStatus(404)
  })
})
