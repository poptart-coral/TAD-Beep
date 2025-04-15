import { test } from '@japa/runner'
import { RoleFactory } from '#database/factories/role_factory'
import { MemberFactory, MemberFromFactory } from '#database/factories/member_factory'
import { UserFactory } from '#database/factories/user_factory'
import { ServerFactory } from '#database/factories/server_factory'
import { Permissions } from '#apps/shared/enums/permissions'

test.group('Roles delete', () => {
  test('must return 200 when deleted successfully with permission MANAGE_ROLE', async ({
    client,
  }) => {
    const server = await ServerFactory.create()
    const member = await MemberFactory.merge({ serverId: server.id }).create()
    const role = await RoleFactory.merge({
      permissions: Permissions.MANAGE_ROLES,
      serverId: server.id,
    }).create()
    await role.related('members').attach([member.id])
    await member.load('user')
    const response = await client
      .delete(`/servers/${role.serverId}/roles/${role.id}`)
      .loginAs(member.user)
    response.assertStatus(200)
  }).tags(['roles:destroy'])

  test('must return 401 if your are not login', async ({ client }) => {
    const role = await RoleFactory.create()
    const user = await UserFactory.create()
    await MemberFromFactory(role.serverId, user.id).create()
    const response = await client.delete(`/servers/${role.serverId}/roles/${role.id}`)
    response.assertStatus(401)
  }).tags(['roles:destroy'])

  test('must return 403 when user is not a member of the server', async ({ client }) => {
    const role = await RoleFactory.create()
    const user = await UserFactory.create()
    const response = await client.delete(`/servers/${role.serverId}/roles/${role.id}`).loginAs(user)
    response.assertStatus(403)
  }).tags(['roles:destroy'])

  test('must return 404 if the server does not exist', async ({ client }) => {
    const role = await RoleFactory.create()
    const user = await UserFactory.create()
    await MemberFromFactory(role.serverId, user.id).create()
    const response = await client
      .delete(`/servers/nonexistantServerId/roles/${role.id}`)
      .loginAs(user)
    response.assertStatus(404)
  }).tags(['roles:destroy'])

  test('must return 403 if the role does not exist', async ({ client }) => {
    const role = await RoleFactory.create()
    const user = await UserFactory.create()
    await MemberFromFactory(role.serverId, user.id).create()
    const response = await client
      .delete(`/servers/${role.serverId}/roles/nonexistantRoleId`)
      .loginAs(user)
    response.assertStatus(403)
  }).tags(['roles:destroy'])
})
