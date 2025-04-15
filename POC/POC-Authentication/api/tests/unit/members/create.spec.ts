import WrongInvitationFormatException from '#apps/invitations/exceptions/wrong_invitation_format_exception'
import { InvitationStatus } from '#apps/invitations/models/status'
import { InvitationType } from '#apps/invitations/models/type'
import MemberService from '#apps/members/services/member_service'
import { InvitationFactory } from '#database/factories/invitation_factory'
import { UserFactory } from '#database/factories/user_factory'
import ExpiredInvitationException from '#apps/invitations/exceptions/expired_invitation_exception'
import UnusableInvitationException from '#apps/invitations/exceptions/unusable_invitation_exception'
import { test } from '@japa/runner'
import { DateTime } from 'luxon'
import { MemberFactory } from '#database/factories/member_factory'
import UserNotFoundException from '#apps/users/exceptions/user_not_found_exception'
import UserAlreadyMember from '#apps/members/exceptions/user_already_member_exception'
import { ServerFactory } from '#database/factories/server_factory'
import PrivateServerException from '#apps/invitations/exceptions/private_server_exception'
import ServerNotFoundException from '#apps/servers/exceptions/server_not_found_exception'
import app from '@adonisjs/core/services/app'

const memberService = await app.container.make(MemberService)

test.group('Members create', () => {
  test('must add a new member to a server from invitation', async ({ assert }) => {
    const invitation = await InvitationFactory.with('server').apply('expiration').create()
    const user = await UserFactory.create()
    const member = await memberService.createFromInvitation(invitation.id, user.id)
    assert.containsSubset(member, {
      nickname: user.username,
      serverId: invitation.serverId,
      userId: user.id,
    })
  })
  test('must add a new member when the invitation has a status', async ({ assert }) => {
    const invitation = await InvitationFactory.with('server')
      .apply('unique')
      .apply('expiration')
      .create()
    const user = await UserFactory.create()
    const member = await memberService.createFromInvitation(invitation.id, user.id)
    await invitation.refresh()
    assert.equal(invitation.status, InvitationStatus.Accepted)
    assert.containsSubset(member, {
      nickname: user.username,
      serverId: invitation.serverId,
      userId: user.id,
    })
  })

  test('must not add a new member when the invitation has a status', async ({ assert }) => {
    const invitation = await InvitationFactory.with('server')
      .merge({ status: InvitationStatus.Accepted })
      .create()
    const user = await UserFactory.create()
    let errorThrown = new UnusableInvitationException()
    await memberService
      .createFromInvitation(invitation.id, user.id)
      .catch((error: UnusableInvitationException) => {
        errorThrown = error
      })
    assert.containsSubset(errorThrown, {
      status: 400,
      code: 'E_UNUSABLE_INVITATION',
      message: 'Invitation is not usable',
    })
  })

  test('must not add a new member when the invitation is expired', async ({ assert }) => {
    const date = DateTime.now().minus({ days: 1 })
    const invitation = await InvitationFactory.with('server').merge({ expiration: date }).create()
    const user = await UserFactory.create()
    let errorThrown = new ExpiredInvitationException()
    await memberService
      .createFromInvitation(invitation.id, user.id)
      .catch((error: ExpiredInvitationException) => {
        errorThrown = error
      })
    assert.containsSubset(errorThrown, {
      status: 400,
      code: 'E_EXPIRED_INVITATION',
      message: 'Invitation is expired',
    })
  })

  test('must fail if the invitation does not exist', async ({ assert }) => {
    const user = await UserFactory.create()
    let errorThrown
    await memberService.createFromInvitation('non-existant-id', user.id).catch((error) => {
      errorThrown = error
    })
    assert.containsSubset(errorThrown, {
      status: 404,
      code: 'E_ROW_NOT_FOUND',
      message: 'Row not found',
    })
  })
  test('must fail if this is a friend invitation', async ({ assert }) => {
    const invitation = await InvitationFactory.with('target')
      .apply('unique')
      .merge({ type: InvitationType.FRIEND })
      .apply('expiration')
      .create()
    let errorThrown = new WrongInvitationFormatException()
    const user = await UserFactory.create()
    await memberService
      .createFromInvitation(invitation.id, user.id)
      .catch((error: WrongInvitationFormatException) => {
        errorThrown = error
      })
    assert.containsSubset(errorThrown, {
      status: 400,
      code: 'E_WRONG_INVITATION_FORMAT',
      message: 'Wrong invitation format',
    })
  })

  test('must add a new member to a server', async ({ assert }) => {
    const server = await ServerFactory.create()
    const user = await UserFactory.create()
    const member = await memberService.create(server.id, user.id)
    assert.containsSubset(member, {
      nickname: user.username,
      serverId: server.id,
      userId: user.id,
    })
  })

  test('must fail if the user is already a member of the server', async ({ assert }) => {
    const member = await MemberFactory.create()
    let errorThrown = new UserAlreadyMember()
    await memberService
      .create(member.serverId ?? '', member.userId)
      .catch((error: UserAlreadyMember) => {
        errorThrown = error
      })
    assert.containsSubset(errorThrown, {
      message: 'This user is already in the server',
      status: 400,
      code: 'E_USER_ALREADY_MEMBER',
    })
  })

  test('must fail if the user does not exists', async ({ assert }) => {
    const server = await ServerFactory.create()
    let errorThrown = new UserNotFoundException()
    await memberService
      .create(server.id, 'non-existant-id')
      .catch((error: UserNotFoundException) => {
        errorThrown = error
      })
    assert.containsSubset(errorThrown, {
      message: 'Row not found',
      status: 404,
      code: 'E_ROW_NOT_FOUND',
    })
  })
  test('must fail if the server is private', async ({ assert }) => {
    const server = await ServerFactory.merge({ visibility: 'private' }).create()
    const user = await UserFactory.create()
    let errorThrown = new PrivateServerException()
    await memberService
      .createForServer(user.id, server.id)
      .catch((error: PrivateServerException) => {
        errorThrown = error
      })
    assert.containsSubset(errorThrown, {
      message: 'Server is private',
      status: 403,
      code: 'E_PRIVATE_SERVER',
    })
  })

  test('must fail if the server does not exist', async ({ assert }) => {
    const user = await UserFactory.create()
    let errorThrown = new ServerNotFoundException()
    await memberService
      .createForServer(user.id, 'non-existant-id')
      .catch((error: ServerNotFoundException) => {
        errorThrown = error
      })
    assert.containsSubset(errorThrown, {
      message: 'Row not found',
      status: 404,
      code: 'E_ROW_NOT_FOUND',
    })
  })

  test('must create a member successfully', async ({ assert }) => {
    const server = await ServerFactory.merge({ visibility: 'public' }).create()
    const user = await UserFactory.create()
    const member = await memberService.createForServer(user.id, server.id)
    assert.containsSubset(member, {
      nickname: user.username,
      serverId: server.id,
      userId: user.id,
    })
  })
})
