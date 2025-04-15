import { RoleFactory } from '#database/factories/role_factory'
import { MemberFactory } from '#database/factories/member_factory'
import { ServerFactory } from '#database/factories/server_factory'
import { UserFactory } from '#database/factories/user_factory'
import { test } from '@japa/runner'
import { Permissions } from '#apps/shared/enums/permissions'

test.group('Roles list', () => {
  test('must return 200 and roles of the server', async ({ client }) => {
    const server = await ServerFactory.create()
    const member = await MemberFactory.merge({ serverId: server.id }).create()
    const role = await RoleFactory.merge({
      permissions: Permissions.MANAGE_ROLES,
      serverId: server.id,
    }).create()
    await role.related('members').attach([member.id])
    await member.load('user')

    const response = await client.get(`/servers/${member.serverId}/roles`).loginAs(member.user)

    response.assertStatus(200)
    response.assertBodyContains([{ id: role.id }])
  }).tags(['roles:index'])
  test('must return 200 and the given role of the server', async ({ client }) => {
    const server = await ServerFactory.create()
    const member = await MemberFactory.merge({ serverId: server.id }).create()
    const role = await RoleFactory.merge({
      permissions: Permissions.MANAGE_ROLES,
      serverId: server.id,
    }).create()
    await role.related('members').attach([member.id])
    await member.load('user')

    const response = await client
      .get(`/servers/${member.serverId}/roles/${role.id}`)
      .loginAs(member.user)

    response.assertStatus(200)
    response.assertBodyContains({ id: role.id })
  }).tags(['roles:index'])
  test('must return 401 if your are not login', async ({ client }) => {
    const server = await ServerFactory.create()
    const response = await client.get(`/servers/${server.id}/roles`)
    response.assertStatus(401)
  }).tags(['roles:index'])

  test('must return 403 when user is not a member of the server', async ({ client }) => {
    const user = await UserFactory.make()
    const server = await ServerFactory.create()

    const result = await client.get(`/servers/${server.id}/roles`).loginAs(user)
    result.assertStatus(403)
  }).tags(['roles:index'])

  test('must return 404 if the server does not exist', async ({ client }) => {
    const user = await UserFactory.create()

    const response = await client.get(`/servers/nonexistantServerId/roles`).loginAs(user)

    response.assertStatus(404)
  }).tags(['roles:index'])
  test('must return 403 if the member has not the permission MANAGE_ROLE', async ({ client }) => {
    const server = await ServerFactory.create()
    const member = await MemberFactory.merge({ serverId: server.id }).create()
    await member.load('user')

    const response = await client.get(`/servers/${member.serverId}/roles`).loginAs(member.user)

    response.assertStatus(403)
  }).tags(['roles:index'])
})
