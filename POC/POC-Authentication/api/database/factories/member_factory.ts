import factory from '@adonisjs/lucid/factories'
import Member from '#apps/members/models/member'
import { ServerFactory } from '#database/factories/server_factory'
import { UserFactory } from '#database/factories/user_factory'

export const MemberFactory = factory
  .define(Member, async ({ faker }) => {
    const server = await ServerFactory.create()
    const user = await UserFactory.create()

    return Member.create({
      nickname: faker.internet.username(),
      avatar: faker.image.avatar(),
      deaf: false,
      mute: false,
      pending: false,
      serverId: server.id,
      userId: user.id,
    })
  })
  .build()

export const MemberFactoryWithServer = (serverId: string) =>
  factory
    .define(Member, async ({ faker }) => {
      const user = await UserFactory.make()

      return Member.create({
        nickname: faker.internet.username(),
        avatar: faker.image.avatar(),
        deaf: false,
        mute: false,
        pending: false,
        joinedAt: null,
        timedOutUntil: null,
        serverId,
        userId: user.id,
      })
    })
    .build()

export const MemberFactoryWithUser = (userId: string) =>
  factory
    .define(Member, async ({ faker }) => {
      const server = await ServerFactory.make()

      return Member.create({
        nickname: faker.internet.username(),
        avatar: faker.image.avatar(),
        deaf: false,
        mute: false,
        pending: false,
        serverId: server.id,
        userId,
      })
    })
    .build()

export const MemberFromFactory = (serverId: string, userId: string) =>
  factory
    .define(Member, async ({ faker }) => {
      return Member.create({
        nickname: faker.internet.username(),
        avatar: faker.image.avatar(),
        deaf: false,
        mute: false,
        pending: false,
        serverId,
        userId,
      })
    })
    .build()
