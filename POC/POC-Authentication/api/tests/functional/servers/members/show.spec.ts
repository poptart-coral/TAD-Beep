import { MemberFactory } from '#database/factories/member_factory'
import { RoleFactory } from '#database/factories/role_factory'
import { UserFactory } from '#database/factories/user_factory'
import { test } from '@japa/runner'

test.group('Servers members show', () => {
  test('must return 200 and a user with its roles', async ({ client, assert }) => {
    const member = await MemberFactory.create()
    await member.load('user')
    const role = await RoleFactory.merge({ serverId: member.serverId }).create()
    await role.related('members').attach([member.id])
    await member.load('roles')
    const response = await client
      .get(`/v1/servers/${member.serverId}/members/${member.userId}`)
      .loginAs(member.user)

    response.assertStatus(200)
    response.assertBodyContains({
      avatar: member.avatar,
      nickname: member.nickname,
      serverId: member.serverId,
      userId: member.userId,
    })
    assert.lengthOf(response.body().roles, 1)
    assert.containsSubset(response.body().roles, [
      {
        id: role.id,
        name: role.name,
        permissions: role.permissions,
        serverId: role.serverId,
      },
    ])
  }).tags(['servers:members'])

  test('must return 200 and my member with roles', async ({ client, assert }) => {
    const member = await MemberFactory.create()
    await member.load('user')
    const role = await RoleFactory.merge({ serverId: member.serverId }).create()
    await role.related('members').attach([member.id])
    await member.load('roles')
    const response = await client
      .get(`/v1/servers/${member.serverId}/members/@me`)
      .loginAs(member.user)
    response.assertStatus(200)

    response.assertBodyContains({
      avatar: member.avatar,
      nickname: member.nickname,
      serverId: member.serverId,
      userId: member.userId,
    })
    assert.lengthOf(response.body().roles, 1)
    assert.containsSubset(response.body().roles, [
      {
        id: role.id,
        name: role.name,
        permissions: role.permissions,
        serverId: role.serverId,
      },
    ])
  }).tags(['servers:members'])
  test('must return 404 if the server does not exist', async ({ client }) => {
    const user = await UserFactory.create()

    const response = await client.get(`/v1/servers/non-existant-id/members/1`).loginAs(user)

    response.assertStatus(404)
  }).tags(['servers:members'])

  test('must return 401 if the user is not logged in', async ({ client }) => {
    const response = await client.get('/v1/servers/1/members/1')
    response.assertStatus(401)
  }).tags(['servers:members'])

  test('must return 403 if the user is not a member of the server', async ({ client, assert }) => {
    const user = await UserFactory.make()
    const member = await MemberFactory.make()

    const response = await client
      .get(`/v1/servers/${member.serverId}/members/${member.userId}`)
      .loginAs(user)

    response.assertStatus(403)
    assert.properties(response.body(), ['message', 'status', 'code'])
    assert.equal(response.body().status, 403)
    assert.equal(response.body().code, 'E_AUTHORIZATION_FAILURE')
  }).tags(['servers:members'])
})
