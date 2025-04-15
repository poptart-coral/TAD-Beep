import { MemberFromFactory } from '#database/factories/member_factory'
import { ServerFactory } from '#database/factories/server_factory'
import { UserFactory } from '#database/factories/user_factory'
import { WebhookFactory } from '#database/factories/webhook_factory'
import { test } from '@japa/runner'
test.group('Webhook create', () => {
  test('must list all webhooks in a channel', async ({ client }) => {
    const user = await UserFactory.make()
    const server = await ServerFactory.make()

    const webhook = await WebhookFactory.make()
    await MemberFromFactory(server.id, user.id).make()

    const result = await client
      .get(`/servers/${server.id}/channels/${webhook.channelId}/webhooks`)
      .loginAs(user)
    result.assertStatus(200)
    result.assertBodyContains([
      {
        name: webhook.name,
        webhookPicture: webhook.webhookPicture,
        channelId: webhook.channelId,
        userId: webhook.userId,
        token: webhook.token,
      },
    ])
  }).tags(['webhook:listChannel'])

  test('must list all webhooks in a server', async ({ client }) => {
    const user = await UserFactory.make()
    const server = await ServerFactory.make()

    const webhook = await WebhookFactory.merge({ serverId: server.id }).create()
    await MemberFromFactory(server.id, user.id).make()

    const result = await client.get(`/servers/${server.id}/webhooks`).loginAs(user)

    result.assertStatus(200)
    result.assertBodyContains([
      {
        name: webhook.name,
        webhookPicture: webhook.webhookPicture,
        channelId: webhook.channelId,
        userId: webhook.userId,
        token: webhook.token,
      },
    ])
  }).tags(['webhook:listServer'])

  // must list the webhook by ID
  test('must list the webhook by ID', async ({ client }) => {
    const user = await UserFactory.make()
    const server = await ServerFactory.make()

    const webhook = await WebhookFactory.merge({ serverId: server.id }).create()
    await MemberFromFactory(server.id, user.id).make()

    const result = await client
      .get(`/servers/${server.id}/channels/${webhook.channelId}/webhook/${webhook.id}`)
      .loginAs(user)

    result.assertStatus(200)
    result.assertBodyContains({
      name: webhook.name,
      webhookPicture: webhook.webhookPicture,
      channelId: webhook.channelId,
      userId: webhook.userId,
      token: webhook.token,
    })
  }).tags(['webhook:listById'])
})
