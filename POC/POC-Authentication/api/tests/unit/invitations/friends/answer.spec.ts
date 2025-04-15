import UnusableInvitationException from '#apps/invitations/exceptions/unusable_invitation_exception'
import WrongInvitationFormatException from '#apps/invitations/exceptions/wrong_invitation_format_exception'
import { InvitationStatus } from '#apps/invitations/models/status'
import { InvitationType } from '#apps/invitations/models/type'
import InvitationService from '#apps/invitations/services/invitation_service'
import { InvitationFactory } from '#database/factories/invitation_factory'
import { UserFactory } from '#database/factories/user_factory'
import app from '@adonisjs/core/services/app'
import { test } from '@japa/runner'

const invitationService = await app.container.make(InvitationService)

test.group('Invitations friends answer', async () => {
  test('should create the frienship when accepting the invitation', async ({ assert }) => {
    const user = await UserFactory.create()
    const invitation = await InvitationFactory.merge({ creatorId: user.id })
      .apply('friend')
      .with('target')
      .create()
    const invitationResult = await invitationService.answerFriendInvitation(invitation.id, {
      answer: InvitationStatus.Accepted,
    })
    assert.containsSubset(invitationResult, {
      id: invitation.id,
      status: InvitationStatus.Accepted,
    })
  })
  test('should fail if the invitation is not a friend invitation', async ({ assert }) => {
    const user = await UserFactory.create()
    const invitation = await InvitationFactory.merge({
      creatorId: user.id,
      type: InvitationType.SERVER,
    })
      .with('server')
      .create()
    let errorThrown = new WrongInvitationFormatException()
    await invitationService
      .answerFriendInvitation(invitation.id, { answer: InvitationStatus.Accepted })
      .catch((error: WrongInvitationFormatException) => {
        errorThrown = error
      })
    assert.containsSubset(errorThrown, {
      code: 'E_WRONG_INVITATION_FORMAT',
      status: 400,
      message: 'Wrong invitation type',
    })
  })

  test('should fail if the invitation is not pending', async ({ assert }) => {
    const user = await UserFactory.create()
    const invitation = await InvitationFactory.merge({
      creatorId: user.id,
      type: InvitationType.FRIEND,
      status: InvitationStatus.Accepted,
    })
      .with('target')
      .create()
    let errorThrown = new UnusableInvitationException()
    await invitationService
      .answerFriendInvitation(invitation.id, { answer: InvitationStatus.Accepted })
      .catch((error) => {
        errorThrown = error
      })
    assert.containsSubset(errorThrown, {
      code: 'E_UNUSABLE_INVITATION',
      status: 400,
      message: 'Invitation already answered',
    })
  })
})
