import Message from '#apps/messages/models/message'
import { UserFactory } from '#database/factories/user_factory'
import factory from '@adonisjs/lucid/factories'
import { ChannelFactory } from '#database/factories/channel_factory'

export const MessageFactory = factory
  .define(Message, async ({ faker }) => {
    const channel = await ChannelFactory.create()
    return Message.create({
      content: faker.lorem.sentence(),
      channelId: channel.id,
    })
  })
  .relation('owner', () => UserFactory)
  .build()
