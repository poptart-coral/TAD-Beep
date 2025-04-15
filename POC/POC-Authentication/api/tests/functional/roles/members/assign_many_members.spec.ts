import { Permissions } from '#apps/shared/enums/permissions'
import { MemberFactory } from '#database/factories/member_factory'
import { RoleFactory } from '#database/factories/role_factory'
import { ServerFactory } from '#database/factories/server_factory'
import { test } from '@japa/runner'

test.group('Roles members assign many members', () => {
  test('must return 201 and add the role', async ({ assert, client }) => {
    const server = await ServerFactory.create()
    const members = await MemberFactory.merge({ serverId: server.id }).createMany(3)
    await members[0].load('user')
    const role = await RoleFactory.merge({ serverId: server.id }).create()
    const member = await MemberFactory.merge({ serverId: server.id }).create()
    const memberRole = await RoleFactory.merge({
      permissions: Permissions.MANAGE_ROLES,
      serverId: server.id,
    }).create()
    await memberRole.related('members').attach([member.id])
    await member.load('user')

    const result = await client
      .post(`/v1/servers/${server.id}/roles/${role.id}/assignation`)
      .json({ memberIds: members.map((m) => m.id) })
      .loginAs(member.user)
    result.assertStatus(201)
    await Promise.all(members.map((m) => m.load('roles')))
    assert.containsSubset(
      members,
      members.map(() => ({ roles: [{ id: role.id }] }))
    )
  }).tags(['roles:assign'])
})
