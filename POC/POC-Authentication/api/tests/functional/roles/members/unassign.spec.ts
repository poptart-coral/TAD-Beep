import { Permissions } from '#apps/shared/enums/permissions'
import { MemberFactory } from '#database/factories/member_factory'
import { RoleFactory } from '#database/factories/role_factory'
import { ServerFactory } from '#database/factories/server_factory'
import { test } from '@japa/runner'

test.group('Roles members unassign', () => {
  test('must return 200 and unassign role', async ({ client }) => {
    const server = await ServerFactory.create()
    const member = await MemberFactory.merge({ serverId: server.id }).create()
    const role = await RoleFactory.merge({
      permissions: Permissions.MANAGE_ROLES,
      serverId: server.id,
    }).create()
    await role.related('members').attach([member.id])
    await member.load('user')
    const response = await client
      .delete(`v1/servers/${member.serverId}/members/${member.id}/roles/${role.id}`)
      .loginAs(member.user)
    response.assertStatus(200)
  })
  test('must return 401 if the user is not authenticated', async ({ client }) => {
    const member = await MemberFactory.create()
    await member.load('user')
    const role = await RoleFactory.merge({ serverId: member.serverId }).create()
    role.related('members').attach([member.id])
    const response = await client.delete(
      `v1/servers/${member.serverId}/members/${member.id}/roles/${role.id}`
    )
    response.assertStatus(401)
  })
})
