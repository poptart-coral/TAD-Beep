import { InvitationStatus } from '#apps/invitations/models/status'
import { InvitationType } from '#apps/invitations/models/type'
import { FriendFactory } from '#database/factories/friend_factory'
import { UserFactory } from '#database/factories/user_factory'
import { test } from '@japa/runner'

test.group('Invitations create', () => {
  test('must return 200 when successfully create with userId', async ({ client, assert }) => {
    const user1 = await UserFactory.create()
    const friend = await UserFactory.create()
    const payload = {
      targetId: friend.id,
    }
    const response = await client.post('/invitations').loginAs(user1).json(payload)

    response.assertStatus(201)
    assert.containsSubset(response.body(), {
      creatorId: user1.id,
      targetId: friend.id,
      type: InvitationType.FRIEND,
      status: InvitationStatus.Pending,
    })
  })
  test('must return 200 when successfully create with targetUsername', async ({
    client,
    assert,
  }) => {
    const user1 = await UserFactory.create()
    const friend = await UserFactory.create()
    const payload = {
      targetUsername: friend.username,
    }
    const response = await client.post('/invitations').loginAs(user1).json(payload)

    response.assertStatus(201)
    assert.containsSubset(response.body(), {
      creatorId: user1.id,
      targetId: friend.id,
      type: InvitationType.FRIEND,
      status: InvitationStatus.Pending,
    })
  })
  test('must return 400 if already friends', async ({ client }) => {
    const friendShip = await FriendFactory.create()
    await friendShip.load('friend')
    await friendShip.load('user')
    const payload = {
      targetId: friendShip.friend.id,
    }
    const response = await client.post('/invitations').loginAs(friendShip.user).json(payload)

    response.assertStatus(400)
  })
  test('must return 401 if not logged in', async ({ client }) => {
    const friend = await UserFactory.create()
    const payload = {
      targetId: friend.id,
    }
    const response = await client.post('/invitations').json(payload)

    response.assertStatus(401)
  })
  test('must return 404 when the username of the user does not exist', async ({ client }) => {
    const user1 = await UserFactory.create()
    const payload = {
      targetUsername: 'nonexistentuser',
    }
    const response = await client.post('/invitations').loginAs(user1).json(payload)

    response.assertStatus(404)
  })
  test('must return 422 when no body is provided', async ({ client }) => {
    const user1 = await UserFactory.create()
    const response = await client.post('/invitations').loginAs(user1).json({})

    response.assertStatus(422)
  })
})
