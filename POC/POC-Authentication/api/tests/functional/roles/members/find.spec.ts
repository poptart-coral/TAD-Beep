import { MemberFactory } from '#database/factories/member_factory'
import { RoleFactory } from '#database/factories/role_factory'
import { ServerFactory } from '#database/factories/server_factory'
import { test } from '@japa/runner'

test.group('Roles members find', () => {
  test('should return 200 and the members assigned to the role', async ({ client, assert }) => {
    const server = await ServerFactory.create()
    const role = await RoleFactory.merge({ serverId: server.id }).create()
    const members = await MemberFactory.merge({ serverId: server.id }).createMany(5)
    await members[0].load('user')
    await role.related('members').attach(members.map((member) => member.id))
    const result = await client
      .get(`/v1/servers/${server.id}/roles/${role.id}/members`)
      .loginAs(members[0].user)
    result.assertStatus(200)
    assert.containsSubset(
      result.body(),
      members.map((member) => ({ id: member.id }))
    )
  })
})
