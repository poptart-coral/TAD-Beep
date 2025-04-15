import { InvitationStatus } from '#apps/invitations/models/status'
import { InvitationType } from '#apps/invitations/models/type'
import { InvitationFactory } from '#database/factories/invitation_factory'
import { UserFactory } from '#database/factories/user_factory'
import { test } from '@japa/runner'

test.group('Users invitations list', () => {
  test('must return 200 and the invitations', async ({ client }) => {
    const user = await UserFactory.create()
    const response = await client.get('v1/users/@me/invitations').loginAs(user)
    response.assertStatus(200)
  })
  test('must return 200 and the invitations', async ({ client, assert }) => {
    const user = await UserFactory.create()
    const invitations = await InvitationFactory.merge({
      creatorId: user.id,
      type: InvitationType.FRIEND,
      status: InvitationStatus.Pending,
    })
      .with('target')
      .createMany(15)
    invitations.sort((a, b) => b.createdAt.toMillis() - a.createdAt.toMillis())
    const response = await client.get('v1/users/@me/invitations').loginAs(user)
    response.assertStatus(200)
    assert.containsSubset(
      response.body(),
      invitations.map((invitation) => ({
        createdAt: invitation.createdAt.toISO(),
        creatorId: invitation.creatorId,
        id: invitation.id,
        status: invitation.status,
        targetId: invitation.targetId,
        type: invitation.type,
      }))
    )
  })

  test('must return 200 and not declined invitations', async ({ client, assert }) => {
    const user = await UserFactory.create()
    await InvitationFactory.merge({
      creatorId: user.id,
      type: InvitationType.FRIEND,
      status: InvitationStatus.Declined,
    })
      .with('target')
      .createMany(5)
    const invitations = await InvitationFactory.merge({
      creatorId: user.id,
      type: InvitationType.FRIEND,
      status: InvitationStatus.Pending,
    })
      .with('target')
      .createMany(10)
    invitations.sort((a, b) => b.createdAt.toMillis() - a.createdAt.toMillis())
    const response = await client.get('v1/users/@me/invitations').loginAs(user)
    response.assertStatus(200)
    assert.containsSubset(
      response.body(),
      invitations.map((invitation) => ({
        createdAt: invitation.createdAt.toISO(),
        creatorId: invitation.creatorId,
        id: invitation.id,
        status: invitation.status,
        targetId: invitation.targetId,
        type: invitation.type,
      }))
    )
  })

  test('must return 200 and not accepted invitations', async ({ client, assert }) => {
    const user = await UserFactory.create()
    await InvitationFactory.merge({
      creatorId: user.id,
      type: InvitationType.FRIEND,
      status: InvitationStatus.Accepted,
    })
      .with('target')
      .createMany(5)
    const invitations = await InvitationFactory.merge({
      creatorId: user.id,
      type: InvitationType.FRIEND,
      status: InvitationStatus.Pending,
    })
      .with('target')
      .createMany(10)
    invitations.sort((a, b) => b.createdAt.toMillis() - a.createdAt.toMillis())
    const response = await client.get('v1/users/@me/invitations').loginAs(user)
    response.assertStatus(200)
    assert.containsSubset(
      response.body(),
      invitations.map((invitation) => ({
        createdAt: invitation.createdAt.toISO(),
        creatorId: invitation.creatorId,
        id: invitation.id,
        status: invitation.status,
        targetId: invitation.targetId,
        type: invitation.type,
      }))
    )
  })
  test('must return 401 if not logged in', async ({ client }) => {
    const response = await client.get('v1/users/@me/invitations')
    response.assertStatus(401)
  })
})
