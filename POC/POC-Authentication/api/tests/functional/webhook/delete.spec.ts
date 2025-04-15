import Message from '#apps/messages/models/message'
import { ChannelFactory } from '#database/factories/channel_factory'
import { MemberFromFactory } from '#database/factories/member_factory'
import { MessageFactory } from '#database/factories/message_factory'
import { ServerFactory } from '#database/factories/server_factory'
import { UserFactory } from '#database/factories/user_factory'
import { WebhookFactory } from '#database/factories/webhook_factory'
import { test } from '@japa/runner'

test.group('Webhook delete', () => {
  test('must return a 200 when deleted', async ({ client, expect }) => {
    const user = await UserFactory.make()
    const server = await ServerFactory.make()
    await MemberFromFactory(server.id, user.id).make()

    const webhook = await WebhookFactory.make()
    const channel = await ChannelFactory.create()

    await MessageFactory.merge({ channelId: channel.id, webhookId: webhook.id }).create()
    await MessageFactory.merge({ channelId: channel.id, webhookId: webhook.id }).create()

    const result = await client
      .delete(`/servers/${server.id}/channels/${webhook.channelId}/webhook/${webhook.id}`)
      .loginAs(user)
    result.assertStatus(200)

    const messages = await Message.query().where('webhookId', webhook.id).first()
    expect(messages).not.toBeNull()
  }).tags(['webhook:delete'])

  test('must return a 403 if user not in the server', async ({ client }) => {
    const user = await UserFactory.make()
    const server = await ServerFactory.make()
    const webhook = await WebhookFactory.make()
    const channel = await ChannelFactory.create()

    await MessageFactory.merge({ channelId: channel.id, webhookId: webhook.id }).create()
    await MessageFactory.merge({ channelId: channel.id, webhookId: webhook.id }).create()

    const result = await client
      .delete(`/servers/${server.id}/channels/${webhook.channelId}/webhook/${webhook.id}`)
      .loginAs(user)
    result.assertStatus(403)
  }).tags(['webhook:delete'])
})
