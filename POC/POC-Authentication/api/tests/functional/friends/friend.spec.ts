import { test } from '@japa/runner'
import { UserFactory } from '#database/factories/user_factory'
import { FriendFactory } from '#database/factories/friend_factory'

test.group('Friends', () => {
  test('must return a 200 when listing friends', async ({ client }) => {
    const user1 = await UserFactory.create()

    // Creating relationships that are both ways
    // user1 -> userX0
    // userX1 -> user1
    const friendShips1 = await FriendFactory.merge({ user_id: user1.id }).createMany(3)

    const friends1 = friendShips1.map(async (friend) => {
      await friend.load('friend')
      return {
        id: friend.friend_id,
        username: friend.friend.username,
        profilePicture: friend.friend.profilePicture,
      }
    })

    const friendShips2 = await FriendFactory.merge({ friend_id: user1.id }).createMany(3)

    const friends2 = friendShips2.map(async (friend) => {
      await friend.load('user')
      return {
        id: friend.friend_id,
        username: friend.user.username,
        profilePicture: friend.user.profilePicture,
      }
    })

    const friends = friends1.concat(friends2)
    const response = await client.get('/v1/users/@me/friends').loginAs(user1).send()
    response.assertStatus(200)
    response.assertBodyContains(friends)
  }).tags(['friends:index'])

  test('must return a 401 when listing friends for a user that does not exist', async ({
    client,
  }) => {
    const response = await client.get('/v1/users/@me/friends').send()
    response.assertStatus(401)
  }).tags(['friends:index'])

  test('must return a 200 when deleting a friend', async ({ client }) => {
    const friendship = await FriendFactory.create()
    await friendship.load('user')
    const response = await client
      .delete(`/friends/${friendship.friend_id}`)
      .loginAs(friendship.user)
      .send()
    response.assertStatus(200)
    response.assertBodyContains({ message: 'Friend deleted successfully' })
  }).tags(['friends:delete'])

  test('must return a 404 when deleting a non-existent friend', async ({ client }) => {
    const user1 = await UserFactory.make()
    const response = await client.delete(`/friends/1`).loginAs(user1).send()
    response.assertStatus(404)
  }).tags(['friends:delete'])
})
