import { MemberFromFactory } from '#database/factories/member_factory'
import { ServerFactory } from '#database/factories/server_factory'
import { UserFactory } from '#database/factories/user_factory'
import { test } from '@japa/runner'

test.group('Users servers list', () => {
  test("must return the user's list of servers", async ({ assert, client }) => {
    const user = await UserFactory.make()
    const server = await ServerFactory.make()
    await MemberFromFactory(server.id, user.id).make()

    const response = await client.get('/v1/users/@me/servers').loginAs(user)
    response.assertStatus(200)

    assert.isArray(response.body())
    assert.lengthOf(response.body(), 1)
    assert.equal(response.body()[0].name, server.name)
  }).tags(['users:servers', 'users'])

  test('must return 200 if the user is logged in', async ({ assert, client }) => {
    const user = await UserFactory.make()

    const response = await client.get('/v1/users/@me/servers').loginAs(user)
    response.assertStatus(200)
    assert.isArray(response.body())
  }).tags(['users:servers', 'users'])

  test('must return 401 if the user is not logged in', async ({ assert, client }) => {
    const response = await client.get('/v1/users/@me/servers')
    response.assertStatus(401)

    assert.properties(response.body(), ['message', 'code', 'status'])
    assert.equal(response.body().status, 401)
    assert.equal(response.body().code, 'E_UNAUTHORIZED_ACCESS')
  }).tags(['users:servers', 'users'])
})
