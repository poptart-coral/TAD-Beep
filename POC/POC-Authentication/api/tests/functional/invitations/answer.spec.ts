import { InvitationStatus } from '#apps/invitations/models/status'
import { InvitationFactory } from '#database/factories/invitation_factory'
import { UserFactory } from '#database/factories/user_factory'
import { test } from '@japa/runner'

test.group('Invitations answer', () => {
  test('should return 200 when accepting', async ({ client }) => {
    const invitation = await InvitationFactory.apply('friend').with('target').create()
    await invitation.load('target')
    const payload = { answer: InvitationStatus.Accepted }
    const response = await client
      .patch(`/invitations/${invitation.id}`)
      .loginAs(invitation.target)
      .json(payload)
    response.assertStatus(200)
    response.assertBody({ message: 'Invitation accepted' })
  })
  test('should return 200 when declining', async ({ client }) => {
    const invitation = await InvitationFactory.apply('friend').with('target').create()
    await invitation.load('target')
    const payload = { answer: InvitationStatus.Declined }
    const response = await client
      .patch(`/invitations/${invitation.id}`)
      .loginAs(invitation.target)
      .json(payload)
    response.assertStatus(200)
    response.assertBody({ message: 'Invitation declined' })
  })
  test('should return 404 if the invitation does not exist', async ({ client }) => {
    const user = await UserFactory.create()
    const payload = { answer: InvitationStatus.Accepted }
    const response = await client
      .patch('/invitations/non-existing-invitation')
      .loginAs(user)
      .json(payload)
    response.assertStatus(404)
    response.assertBody({ message: 'Invitation not found', code: 'E_INVITATION_NOT_FOUND' })
  })
  test('should return 403 if the user answering the invitation is not the target', async ({
    client,
  }) => {
    const invitation = await InvitationFactory.apply('friend').with('target').create()
    const otherUser = await UserFactory.create()
    const payload = { answer: InvitationStatus.Accepted }
    const response = await client
      .patch(`/invitations/${invitation.id}`)
      .loginAs(otherUser)
      .json(payload)
    response.assertStatus(403)
  })
  test('should return 422 when sending the wrong invitation status', async ({ client }) => {
    const invitation = await InvitationFactory.apply('friend').with('target').create()
    await invitation.load('target')
    const payload = { answer: 'invalid_status' }
    const response = await client
      .patch(`/invitations/${invitation.id}`)
      .loginAs(invitation.target)
      .json(payload)
    response.assertStatus(422)
  })
})
