import Server from '#apps/servers/models/server'
import { DEFAULT_ROLE_SERVER_PERMISSION } from '#apps/shared/constants/default_role_permission'
import { DEFAULT_ROLE_SERVER } from '#apps/shared/constants/default_role_server'
import { UserFactory } from '#database/factories/user_factory'
import { test } from '@japa/runner'

test.group('Servers create', () => {
  test('must return a 201 when create', async ({ client, expect }) => {
    const payload = {
      name: 'My Server 123',
      visibility: 'public',
      description: 'This is a test server',
    }
    const user = await UserFactory.make()
    const result = await client.post('/servers').json(payload).loginAs(user)
    result.assertStatus(201)
    expect(result.body()).toEqual(
      expect.objectContaining({
        name: payload.name,
        description: payload.description,
      })
    )
  }).tags(['servers:create'])
  test('must add the user creating the server as member', async ({ client, assert }) => {
    const payload = {
      name: 'My Server 2',
      visibility: 'public',
      icon: null,
      description: 'This is a test server',
    }
    const user = await UserFactory.create()
    const resultServerCreation = await client.post('/servers').json(payload).loginAs(user)
    const server = await Server.findOrFail(resultServerCreation.body().id)
    await server.load('members')
    assert.equal(server.members.length, 1)
    assert.equal(server.members[0].userId, user.id)
  }).tags(['servers:create'])

  test('must return 201 and create the BasicRole', async ({ client, expect }) => {
    const payload = {
      name: 'My Server 12345',
      visibility: 'public',
      description: 'This is a test server',
    }
    const user = await UserFactory.create()
    const resultServerCreation = await client.post('/servers').json(payload).loginAs(user)
    const server = await Server.findOrFail(resultServerCreation.body().id)
    await server.load('roles')
    expect(server.roles.length).toBe(1)
    expect(server.roles[0].name).toEqual(DEFAULT_ROLE_SERVER)
    expect(server.roles[0].permissions).toEqual(DEFAULT_ROLE_SERVER_PERMISSION)

    resultServerCreation.assertStatus(201)
  }).tags(['servers:create'])
  test('must return a 201 when creating a server without description', async ({ client }) => {
    const user = await UserFactory.make()
    const payload = {
      name: 'My Server 3',
      visibility: 'public',
      icon: null,
    }
    const result = await client.post('/servers').json(payload).loginAs(user)
    result.assertStatus(201)
  }).tags(['servers:create'])
  test('must return a 401 when not authenticated', async ({ client }) => {
    const payload = {
      name: 'My Server 3',
      visibility: 'public',
      icon: null,
    }
    const result = await client.post('/servers').json(payload)
    result.assertStatus(401)
  }).tags(['servers:create'])
  test('must return a 422 when creating a server without name', async ({ client }) => {
    const user = await UserFactory.make()
    const payload = {
      desciption: 'This is a test server 4',
      visibility: 'public',
      icon: null,
    }
    const result = await client.post('/servers').json(payload).loginAs(user)
    result.assertStatus(422)
  }).tags(['servers:create'])
})
