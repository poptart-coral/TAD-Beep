import FriendService from '#apps/friends/services/friend_service'
import { FriendFactory } from '#database/factories/friend_factory'
import app from '@adonisjs/core/services/app'
import { test } from '@japa/runner'

const friendService = await app.container.make(FriendService)
test.group('Friends delete', () => {
  test('must delete friendship from users', async ({ assert }) => {
    const friendship = await FriendFactory.create()
    await friendService.deleteFriendship(friendship.user_id, friendship.friend_id)
    const foundFriendship = await friendService.findFriendship(
      friendship.user_id,
      friendship.friend_id
    )
    assert.isNull(foundFriendship)
  })
})
