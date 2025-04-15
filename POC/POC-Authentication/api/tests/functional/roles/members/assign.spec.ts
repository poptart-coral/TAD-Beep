import { Permissions } from '#apps/shared/enums/permissions'
import { MemberFactory } from '#database/factories/member_factory'
import { RoleFactory } from '#database/factories/role_factory'
import { ServerFactory } from '#database/factories/server_factory'
import { test } from '@japa/runner'

test.group('Roles members assign', () => {
  test('must return 200 and assign role to member', async ({ client }) => {
    const server = await ServerFactory.create()
    const member = await MemberFactory.merge({ serverId: server.id }).create()
    const memberRole = await RoleFactory.merge({
      permissions: Permissions.MANAGE_ROLES,
      serverId: server.id,
    }).create()
    await memberRole.related('members').attach([member.id])
    await member.load('user')
    const role = await RoleFactory.merge({ serverId: member.serverId }).create()
    const response = await client
      .post(`/v1/servers/${role.serverId}/members/${member.id}/roles/${role.id}`)
      .loginAs(member.user)

    response.assertStatus(201)
  })
  test('must return 401 if the user is not authenticated', async ({ client }) => {
    const member = await MemberFactory.create()
    await member.load('user')
    const role = await RoleFactory.merge({ serverId: member.serverId }).create()
    const response = await client.post(
      `/v1/servers/${role.serverId}/members/${member.id}/roles/${role.id}`
    )
    response.assertStatus(401)
  })
})
