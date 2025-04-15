import factory from '@adonisjs/lucid/factories'
import Friend from '#apps/friends/models/friend'
import { UserFactory } from '#database/factories/user_factory'

export const FriendFactory = factory
  .define(Friend, async () => {
    const user1 = await UserFactory.create()
    const user2 = await UserFactory.create()
    return Friend.create({
      user_id: user1.id,
      friend_id: user2.id,
    })
  })
  .build()
