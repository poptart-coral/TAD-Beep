import factory from '@adonisjs/lucid/factories'
import Webhook from '#apps/webhooks/models/webhook'
import jwt from 'jsonwebtoken'
import env from '#start/env'

export const WebhookFactory = factory
  .define(Webhook, async ({ faker }) => {
    const name = faker.lorem.words(2)
    return Webhook.create({
      name,
      webhookPicture: faker.image.avatar(),
      userId: faker.lorem.word(),
      token: jwt.sign({ name }, env.get('APP_KEY')),
      channelId: faker.lorem.word(),
      serverId: faker.lorem.word(),
    })
  })
  .build()
