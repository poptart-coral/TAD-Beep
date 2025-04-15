import { MemberFromFactory } from '#database/factories/member_factory'
import { ServerFactory } from '#database/factories/server_factory'
import { UserFactory } from '#database/factories/user_factory'
import { WebhookFactory } from '#database/factories/webhook_factory'
import { test } from '@japa/runner'
test.group('Webhook create', () => {
  test('must return a 201 when create', async ({ client }) => {
    const user = await UserFactory.make()
    const server = await ServerFactory.make()
    await MemberFromFactory(server.id, user.id).make()

    const payload = {
      name: 'string',
      serverId: server.id,
      channelId: 'string',
      userId: 'string',
    }

    const result = await client
      .post(`/servers/${payload.serverId}/channels/${payload.channelId}/webhook`)
      .json(payload)
      .loginAs(user)
    result.assertStatus(201)
    result.assertBodyContains({
      name: payload.name,
      channelId: payload.channelId,
      serverId: payload.serverId,
    })
  }).tags(['webhook:create'])

  test('must throw an exception when creating a webhook with a duplicate name', async ({
    client,
  }) => {
    const user = await UserFactory.make()
    const server = await ServerFactory.make()
    await MemberFromFactory(server.id, user.id).make()

    // Créer un webhook avec le même nom
    const webhook = await WebhookFactory.make()

    const payload = {
      name: webhook.name,
      serverId: server.id,
      channelId: webhook.channelId,
    }

    const result = await client
      .post(`/servers/${server.id}/channels/${webhook.channelId}/webhook`)
      .json(payload)
      .loginAs(user)

    result.assertStatus(400)
    result.assertBodyContains({
      code: 'E_WEBHOOK_ALREADY_EXISTS',
    })
  }).tags(['webhook:create:exception'])
})
