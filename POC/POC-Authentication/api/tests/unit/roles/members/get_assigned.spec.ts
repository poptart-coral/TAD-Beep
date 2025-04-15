import RoleService from '#apps/roles/services/role_service'
import { MemberFactory } from '#database/factories/member_factory'
import { RoleFactory } from '#database/factories/role_factory'
import { Exception } from '@adonisjs/core/exceptions'
import app from '@adonisjs/core/services/app'
import { test } from '@japa/runner'

const roleService = await app.container.make(RoleService)

test.group('Roles members get assigned', () => {
  test('must return a list of members that are assigned to a role', async ({ assert }) => {
    const role = await RoleFactory.create()
    const members = await MemberFactory.merge({ serverId: role.serverId }).createMany(3)
    await role.related('members').attach(members.map((member) => member.id))
    const assignedMembers = await roleService.getAssignedMembers(role.id)
    assert.equal(assignedMembers.length, 3)
    assert.containsSubset(
      assignedMembers,
      members.map((member) => ({ id: member.id }))
    )
  })
  test('must fail if the role does not exist', async ({ assert }) => {
    let error = new Exception()
    await roleService.getAssignedMembers('non-existant-role').catch((e) => (error = e))
    assert.equal(error.message, 'Row not found')
    assert.equal(error.status, 404)
    assert.equal(error.code, 'E_ROW_NOT_FOUND')
  })
})
