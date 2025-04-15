import RoleService from '#apps/roles/services/role_service'
import { MemberFactory } from '#database/factories/member_factory'
import { RoleFactory } from '#database/factories/role_factory'
import { ServerFactory } from '#database/factories/server_factory'
import { Exception } from '@adonisjs/core/exceptions'
import app from '@adonisjs/core/services/app'
import { test } from '@japa/runner'

const roleService = await app.container.make(RoleService)

test.group('Roles members assign', () => {
  test('must assign role to a member of the server', async ({ assert }) => {
    const server = await ServerFactory.create()
    const members = await MemberFactory.merge({ serverId: server.id }).createMany(3)
    const role = await RoleFactory.merge({ serverId: server.id }).create()
    await roleService.assignToMembers(
      role.id,
      members.map((m) => m.id)
    )
    await Promise.all(members.map((m) => m.load('roles')))
    assert.containsSubset(
      members,
      members.map(() => ({ roles: [{ id: role.id }] }))
    )
  })
  test('must fail if one user is not in the server', async ({ assert }) => {
    const server = await ServerFactory.create()
    const members = await MemberFactory.merge({ serverId: server.id }).createMany(2)
    const outsider = await MemberFactory.create()
    const role = await RoleFactory.merge({ serverId: server.id }).create()
    let error = new Exception()
    await roleService
      .assignToMembers(role.id, [...members.map((m) => m.id), outsider.id])
      .catch((e) => (error = e))
    assert.equal(error.message, 'Member is not in the server')
    assert.equal(error.code, 'E_MEMBER_NOT_IN_SERVER')
    assert.equal(error.status, 400)
  })
  test('must fail if the role does not exist', async ({ assert }) => {
    const server = await ServerFactory.create()
    const members = await MemberFactory.merge({ serverId: server.id }).createMany(3)
    const nonExistentRoleId = 'non-existent-role-id'
    let error = new Exception()
    await roleService
      .assignToMembers(
        nonExistentRoleId,
        members.map((m) => m.id)
      )
      .catch((e) => (error = e))
    assert.equal(error.message, 'Row not found')
    assert.equal(error.code, 'E_ROW_NOT_FOUND')
    assert.equal(error.status, 404)
  })
})
