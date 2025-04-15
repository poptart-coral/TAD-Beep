import { InvitationStatus } from '#apps/invitations/models/status'
import { InvitationType } from '#apps/invitations/models/type'
import InvitationService from '#apps/invitations/services/invitation_service'
import { ServerFactory } from '#database/factories/server_factory'
import { UserFactory } from '#database/factories/user_factory'
import { test } from '@japa/runner'
import { DateTime } from 'luxon'
import app from '@adonisjs/core/services/app'

const invitationService = await app.container.make(InvitationService)

test.group('Invitations servers create', () => {
  test('must create an unique invitation for private server successfuly', async ({ assert }) => {
    const date = DateTime.now().plus({ days: 1 }).toJSDate()
    const user = await UserFactory.create()
    const server = await ServerFactory.merge({ visibility: 'private' }).create()
    const invitation = await invitationService.createForServer(
      { expiration: date, isUnique: true },
      user.id,
      server.id
    )
    assert.containsSubset(invitation, {
      serverId: server.id,
      creatorId: user.id,
      type: InvitationType.SERVER,
      status: InvitationStatus.Pending,
    })
  })
  test('must create a not unique invitation successfully', async ({ assert }) => {
    const date = DateTime.now().plus({ days: 1 }).toJSDate()
    const user = await UserFactory.create()
    const server = await ServerFactory.merge({ visibility: 'private' }).create()
    const invitation = await invitationService.createForServer(
      { expiration: date, isUnique: false },
      user.id,
      server.id
    )
    assert.containsSubset(invitation, {
      serverId: server.id,
      creatorId: user.id,
      type: InvitationType.SERVER,
    })
  })
  test('must fail if the server does not exist', async ({ assert }) => {
    const date = DateTime.now().plus({ days: 1 }).toJSDate()
    const user = await UserFactory.create()
    try {
      await invitationService.createForServer(
        { expiration: date, isUnique: true },
        user.id,
        'invalid-server-id'
      )
    } catch (error) {
      assert.equal(error.code, 'E_SERVER_NOT_FOUND')
      assert.equal(error.status, 404)
    }
  })
  test('must fail if the server is public', async ({ assert }) => {
    const date = DateTime.now().plus({ days: 1 }).toJSDate()
    const user = await UserFactory.create()
    const server = await ServerFactory.merge({ visibility: 'public' }).create()
    try {
      await invitationService.createForServer(
        { expiration: date, isUnique: true },
        user.id,
        server.id
      )
    } catch (error) {
      assert.equal(error.code, 'E_WRONG_INVITATION_FORMAT')
      assert.equal(error.status, 400)
    }
  })

  test('must throw an exception if the creator user does not exist', async ({ assert }) => {
    const date = DateTime.now().plus({ days: 1 }).toJSDate()
    const server = await ServerFactory.create()
    try {
      await invitationService.createForServer(
        { expiration: date, isUnique: true },
        'invalid-id',
        server.id
      )
    } catch (error) {
      assert.equal(error.code, 'E_USER_NOT_FOUND')
      assert.equal(error.status, 404)
    }
  })
})
