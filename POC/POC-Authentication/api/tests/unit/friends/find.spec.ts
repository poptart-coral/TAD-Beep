import FriendshipNotFoundException from '#apps/friends/exceptions/friendship_not_found_exception'
import FriendService from '#apps/friends/services/friend_service'
import UserNotFoundException from '#apps/users/exceptions/user_not_found_exception'
import { FriendFactory } from '#database/factories/friend_factory'
import { UserFactory } from '#database/factories/user_factory'
import app from '@adonisjs/core/services/app'
import { test } from '@japa/runner'

const friendService = await app.container.make(FriendService)
test.group('Friends find', () => {
  test('should return a frienship', async ({ assert }) => {
    const friendship = await FriendFactory.create()
    const foundFriendship = await friendService.findFriendship(
      friendship.user_id,
      friendship.friend_id
    )
    assert.equal(foundFriendship?.user_id, friendship.user_id)
    assert.equal(foundFriendship?.friend_id, friendship.friend_id)
  })

  test('should return a frienship even when props are reversed', async ({ assert }) => {
    const friendship = await FriendFactory.create()
    const foundFriendship = await friendService.findFriendship(
      friendship.friend_id,
      friendship.user_id
    )
    assert.equal(foundFriendship?.user_id, friendship.user_id)
    assert.equal(foundFriendship?.friend_id, friendship.friend_id)
  })
  test('should be null if the first user does not exist', async ({ assert }) => {
    const friendship = await FriendFactory.create()
    const nonExistentUserId = 'non-existent-user-id'
    const frienship = await friendService.findFriendship(nonExistentUserId, friendship.friend_id)
    assert.isNull(frienship)
  })

  test('should be null if the second user does not exist', async ({ assert }) => {
    const friendship = await FriendFactory.create()
    const nonExistentUserId = 'non-existent-user-id'
    const frienship = await friendService.findFriendship(friendship.friend_id, nonExistentUserId)
    assert.isNull(frienship)
  })

  test('should return a friendship or fail', async ({ assert }) => {
    const friendship = await FriendFactory.create()
    const foundFriendship = await friendService.findFriendshipOrFail(
      friendship.user_id,
      friendship.friend_id
    )
    assert.equal(foundFriendship.user_id, friendship.user_id)
    assert.equal(foundFriendship.friend_id, friendship.friend_id)
  })

  test('should throw UserNotFoundException if the first user does not exist', async ({
    assert,
  }) => {
    const friendship = await FriendFactory.create()
    const nonExistentUserId = 'non-existent-user-id'
    let errorThrown = new UserNotFoundException()
    await friendService
      .findFriendshipOrFail(nonExistentUserId, friendship.friend_id)
      .catch((error: UserNotFoundException) => {
        errorThrown = error
      })
    assert.containsSubset(errorThrown, {
      code: 'E_USER_NOT_FOUND',
      status: 404,
      message: 'User not found',
    })
  })

  test('should throw UserNotFoundException if the second user does not exist', async ({
    assert,
  }) => {
    const friendship = await FriendFactory.create()
    const nonExistentUserId = 'non-existent-user-id'
    let errorThrown = new UserNotFoundException()
    await friendService
      .findFriendshipOrFail(friendship.user_id, nonExistentUserId)
      .catch((error: UserNotFoundException) => {
        errorThrown = error
      })
    assert.containsSubset(errorThrown, {
      code: 'E_USER_NOT_FOUND',
      status: 404,
      message: 'User not found',
    })
  })

  test('should throw FriendshipNotFoundException if the friendship does not exist', async ({
    assert,
  }) => {
    const user1 = await UserFactory.create()
    const user2 = await UserFactory.create()
    let errorThrown = new FriendshipNotFoundException()
    await friendService
      .findFriendshipOrFail(user1.id, user2.id)
      .catch((error: FriendshipNotFoundException) => {
        errorThrown = error
      })
    assert.containsSubset(errorThrown, {
      code: 'E_FRIENDSHIP_NOT_FOUND',
      status: 404,
      message: 'Friendship not found',
    })
  })
})
