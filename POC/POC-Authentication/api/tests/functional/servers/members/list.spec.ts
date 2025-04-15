import { MemberFactoryWithServer, MemberFromFactory } from '#database/factories/member_factory'
import { ServerFactory } from '#database/factories/server_factory'
import { UserFactory } from '#database/factories/user_factory'
import { test } from '@japa/runner'

test.group('Servers members list', () => {
  test('should return 200 when the user is authenticated', async ({ client, expect, assert }) => {
    const user = await UserFactory.make()
    const server = await ServerFactory.make()
    await MemberFromFactory(server.id, user.id).make()

    const members = await MemberFactoryWithServer(server.id).makeMany(4)

    const response = await client.get(`/v1/servers/${server.id}/members`).loginAs(user)

    response.assertStatus(200)
    expect(response.body()).toHaveLength(5)
    assert.containsSubset(
      response.body(),
      members.map((m) => ({ id: m.id }))
    )
  }).tags(['servers:members'])

  test('should return 404 when server does not exist', async ({ client }) => {
    const response = await client.get(`/v1/servers/1/members`).loginAs(await UserFactory.make())

    response.assertStatus(404)
  }).tags(['servers:members'])

  test('should return 401 when user is not authenticated', async ({ client }) => {
    const response = await client.get(`/v1/servers/1/members`)

    response.assertStatus(401)
  }).tags(['servers:members'])

  test('should return 403 when user is not a member of the server', async ({ client, assert }) => {
    const user = await UserFactory.make()
    const server = await ServerFactory.make()

    const response = await client.get(`/v1/servers/${server.id}/members`).loginAs(user)

    response.assertStatus(403)

    assert.properties(response.body(), ['message', 'status', 'code'])
    assert.equal(response.body().status, 403)
    assert.equal(response.body().code, 'E_AUTHORIZATION_FAILURE')
  }).tags(['servers:members'])
})
