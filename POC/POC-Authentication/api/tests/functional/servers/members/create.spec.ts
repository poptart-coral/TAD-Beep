import { InvitationFactory } from '#database/factories/invitation_factory'
import { UserFactory } from '#database/factories/user_factory'
import { test } from '@japa/runner'

test.group('Servers members create', () => {
  test('must return 201 from invitation', async ({ client, assert }) => {
    const invitation = await InvitationFactory.with('server').apply('expiration').create()
    const user = await UserFactory.create()
    const result = await client.post(`/v1/servers/join/${invitation.id}`).loginAs(user)
    assert.containsSubset(result.body(), {
      nickname: user.username,
      userId: user.id,
      serverId: invitation.serverId,
    })
  })
  test('must return 401 if not authenticated', async ({ client, assert }) => {
    const invitation = await InvitationFactory.with('server').create()
    const result = await client.post(`/v1/servers/join/${invitation.id}`)
    assert.equal(result.status(), 401)
  })
  test('must return 404 if the invitation does not exist', async ({ client, assert }) => {
    const user = await UserFactory.create()
    const result = await client.post('/v1/servers/join/999999').loginAs(user)
    assert.equal(result.status(), 404)
  })
})
