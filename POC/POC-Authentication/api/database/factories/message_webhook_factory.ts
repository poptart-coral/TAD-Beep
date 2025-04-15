import Message from '#apps/messages/models/message'
import { UserFactory } from '#database/factories/user_factory'
import factory from '@adonisjs/lucid/factories'

export const MessageFactory = factory
  .define(Message, async ({ faker }) => {
    return Message.create({
      content: faker.lorem.sentence(),
    })
  })
  .relation('owner', () => UserFactory)
  .build()
