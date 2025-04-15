import { MemberFromFactory } from '#database/factories/member_factory'
import { ServerFactory } from '#database/factories/server_factory'
import { UserFactory } from '#database/factories/user_factory'
import { WebhookFactory } from '#database/factories/webhook_factory'
import { test } from '@japa/runner'
import { randomUUID } from 'node:crypto'

test.group('Webhook update', () => {
  test('must return a 200 when update', async ({ client }) => {
    const user = await UserFactory.make()
    const server = await ServerFactory.make()

    await MemberFromFactory(server.id, user.id).make()

    const webhook = await WebhookFactory.make()
    console.log(webhook)
    const updatePayload = {
      id: webhook.id,
      name: 'updated string',
      webhookId: webhook.id,
      serverId: webhook.serverId,
      channelId: 'string',
      token: 'string',
    }

    const result = await client
      .put(`/servers/${server.id}/channels/${webhook.channelId}/webhook/${webhook.id}`)
      .json(updatePayload)
      .loginAs(user)

    result.assertStatus(200)
    result.assertBodyContains({
      name: updatePayload.name,
    })
  }).tags(['webhook:update'])

  test('must throw an exception when updating a nonexistent webhook', async ({ client }) => {
    const user = await UserFactory.make()
    const server = await ServerFactory.make()
    const channelId = 'nonexistent-channel'
    const webhookId = randomUUID()
    await MemberFromFactory(server.id, user.id).make()

    const updatePayload = {
      id: webhookId,
      name: 'updated string',
      serverId: server.id,
      channelId: channelId,
      token: 'string',
    }

    const result = await client
      .put(`/servers/${server.id}/channels/${channelId}/webhook/${webhookId}`)
      .json(updatePayload)
      .loginAs(user)

    result.assertStatus(404)
    result.assertBodyContains({
      code: 'E_WEBHOOK_NOT_FOUND',
    })
  }).tags(['webhook:update:exception'])
})
