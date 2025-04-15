import { ChannelFactory } from '#database/factories/channel_factory'
import { MemberFactory, MemberFromFactory } from '#database/factories/member_factory'
import { MessageFactory } from '#database/factories/message_factory'
import { ServerFactory } from '#database/factories/server_factory'
import { UserFactory } from '#database/factories/user_factory'
import { WebhookFactory } from '#database/factories/webhook_factory'
import { test } from '@japa/runner'

test.group('Webhook trigger', () => {
  test('must return a 20 when trigger', async ({ client, expect }) => {
    const user = await UserFactory.create()
    const server = await ServerFactory.create()
    let channel = await ChannelFactory.create()
    const member = await MemberFactory.create()

    channel = await ChannelFactory.merge({ serverId: member.serverId }).create()

    await MemberFromFactory(server.id, user.id).create()

    const webhook = await WebhookFactory.create()
    webhook.userId = user.id
    webhook.channelId = channel.id
    await webhook.save() // Save the changes to the webhook

    // Test payload
    const payload = {
      data: {
        message: 'Hello world',
      },
    }

    // Trigger the webhook
    const result = await client
      .post(`/servers/${server.id}/channels/${webhook.channelId}/webhook/${webhook.id}/trigger`)
      .json(payload)
      .loginAs(user)

    result.assertStatus(200)

    let messages = await MessageFactory.merge({ channelId: channel.id }).createMany(5)
    await member.load('user')
    const response = await client.get(`/channels/${channel.id}/messages`).loginAs(member.user)

    messages = response.body()

    const message = messages.find((message) => message.webhookId === webhook.id)

    expect(message).not.toBeNull()
  }).tags(['webhook:trigger'])

  test('must return a 404 when trigger with invalid webhook', async ({ client }) => {
    const user = await UserFactory.create()
    const server = await ServerFactory.create()
    const channel = await ChannelFactory.create()
    await MemberFromFactory(server.id, user.id).create()

    const webhook = await WebhookFactory.create()
    webhook.userId = user.id
    webhook.channelId = channel.id
    await webhook.save() // Save the changes to the webhook

    const payload = {
      data: {
        message: 'Hello world',
      },
    }

    const result = await client
      .post(`/servers/${server.id}/channels/${webhook.channelId}/webhook/123/trigger`)
      .json(payload)
      .loginAs(user)

    result.assertStatus(404)
  }).tags(['webhook:trigger'])
})
