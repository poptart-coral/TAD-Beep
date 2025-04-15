import { InvitationType } from '#apps/invitations/models/type'
import InvitationService from '#apps/invitations/services/invitation_service'
import { UserFactory } from '#database/factories/user_factory'
import { test } from '@japa/runner'
import app from '@adonisjs/core/services/app'

const invitationService = await app.container.make(InvitationService)

test.group('Invitations friends create', () => {
  test('must create an invitation', async ({ assert }) => {
    const user1 = await UserFactory.create()
    const user2 = await UserFactory.create()
    const createdInvitation = await invitationService.createFriend(user1.id, {
      targetId: user2.id,
      targetUsername: undefined,
    })
    assert.containsSubset(createdInvitation, {
      creatorId: user1.id,
      targetId: user2.id,
      type: InvitationType.FRIEND,
    })
  })
  test('must throw an exception if the creator user does not exist', async ({ assert }) => {
    const user = await UserFactory.create()
    try {
      await invitationService.createFriend('invalid-id', {
        targetId: user.id,
        targetUsername: undefined,
      })
    } catch (error) {
      assert.equal(error.status, 404)
      assert.equal(error.code, 'E_ROW_NOT_FOUND')
    }
  })
  test('must throw an exception if the target user does not exist', async ({ assert }) => {
    const user = await UserFactory.create()
    try {
      await invitationService.createFriend(user.id, {
        targetId: 'invalid-id',
        targetUsername: undefined,
      })
    } catch (error) {
      assert.equal(error.status, 404)
      assert.equal(error.code, 'E_ROW_NOT_FOUND')
    }
  })
})
