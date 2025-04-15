import Channel from '#apps/channels/models/channel'
import AlreadyFriendsException from '#apps/friends/exceptions/already_friends_exception'
import FriendService from '#apps/friends/services/friend_service'
import UserNotFoundException from '#apps/users/exceptions/user_not_found_exception'
import { UserFactory } from '#database/factories/user_factory'
import app from '@adonisjs/core/services/app'
import { test } from '@japa/runner'

const friendService = await app.container.make(FriendService)

test.group('Friends create', () => {
  test('should create a friendship', async ({ expect }) => {
    const users = await UserFactory.createMany(2)
    const friendship = await friendService.createFriendship(users[0].id, users[1].id)
    const channel = await Channel.query().where('name', `${users[0].id}, ${users[1].id}`).first()
    expect(channel).toBeTruthy()
    await channel?.load('users')
    expect(channel?.users.length).toBe(2)
    expect(channel?.users[0].id).toBe(users[0].id)
    expect(channel?.users[1].id).toBe(users[1].id)
    expect(friendship.user_id).toBe(users[0].id)
    expect(friendship.friend_id).toBe(users[1].id)
  })

  test('should not recreate a channel if the friendship has been deleted once', async ({
    expect,
  }) => {
    const users = await UserFactory.createMany(2)
    await friendService.createFriendship(users[0].id, users[1].id)
    const channel1 = await Channel.query().where('name', `${users[0].id}, ${users[1].id}`).first()
    expect(channel1).toBeTruthy()

    // Simulate friendship deletion
    await friendService.deleteFriendship(users[0].id, users[1].id)

    // Attempt to recreate friendship
    const newFriendship = await friendService.createFriendship(users[0].id, users[1].id)
    const channel2 = await Channel.query().where('name', `${users[0].id}, ${users[1].id}`).first()

    // Ensure the channel is not recreated
    expect(channel1?.id).toEqual(channel2?.id)
    expect(newFriendship.user_id).toBe(users[0].id)
    expect(newFriendship.friend_id).toBe(users[1].id)
  })
  test('should throw an error when creating a friendship with a non-existent user', async ({
    assert,
  }) => {
    const users = await UserFactory.createMany(1)
    const nonExistentUserId = 'non-existent-user-id'
    let errorThrown = new UserNotFoundException()
    await friendService
      .createFriendship(users[0].id, nonExistentUserId)
      .catch((error: UserNotFoundException) => {
        errorThrown = error
      })
    assert.containsSubset(errorThrown, {
      code: 'E_USER_NOT_FOUND',
      status: 404,
      message: 'User not found',
    })
  })

  test('should throw an error when creating a friendship with a non-existent friend', async ({
    assert,
  }) => {
    const user = await UserFactory.create()
    const nonExistentFriendId = 'non-existent-friend-id'
    let errorThrown = new UserNotFoundException()
    await friendService
      .createFriendship(nonExistentFriendId, user.id)
      .catch((error: UserNotFoundException) => {
        errorThrown = error
      })
    assert.containsSubset(errorThrown, {
      code: 'E_USER_NOT_FOUND',
      status: 404,
      message: 'User not found',
    })
  })

  test('should throw an error when users are already friends', async ({ assert }) => {
    const users = await UserFactory.createMany(2)
    await friendService.createFriendship(users[0].id, users[1].id)
    let errorThrown = new AlreadyFriendsException()
    await friendService
      .createFriendship(users[0].id, users[1].id)
      .catch((error: AlreadyFriendsException) => {
        errorThrown = error
      })
    assert.containsSubset(errorThrown, {
      code: 'E_ALREADY_FRIENDS',
      status: 400,
      message: 'Already friends',
    })
  })
})
