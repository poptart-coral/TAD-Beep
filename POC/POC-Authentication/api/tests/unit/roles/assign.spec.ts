import MemberNotInServerException from '#apps/members/exceptions/member_not_in_server_exception'
import RoleService from '#apps/roles/services/role_service'
import { MemberFactory } from '#database/factories/member_factory'
import { RoleFactory } from '#database/factories/role_factory'
import app from '@adonisjs/core/services/app'
import { test } from '@japa/runner'

const roleService = await app.container.make(RoleService)

test.group('Roles assign', () => {
  test('must assign the member to the role', async ({ assert }) => {
    const role = await RoleFactory.create()
    const member = await MemberFactory.merge({ serverId: role.serverId }).create()
    await roleService.assign(role.id, member.id)
    await role.load('members')
    assert.isTrue(role.members.some((m) => m.id === member.id))
  }).tags(['roles:assign'])
  test('must fail if the member is not in the server', async ({ assert }) => {
    const role = await RoleFactory.create()
    const member = await MemberFactory.create()
    let error = new MemberNotInServerException()
    await roleService.assign(role.id, member.id).catch((e) => (error = e))
    assert.equal(error.code, 'E_MEMBER_NOT_IN_SERVER')
    assert.equal(error.status, 400)
    assert.equal(error.message, 'Member is not in the server')
  }).tags(['roles:assign'])
  test('must fail if the role does not exist', async ({ assert }) => {
    const member = await MemberFactory.create()
    let error = new MemberNotInServerException()
    await roleService.assign('non-existant-role', member.id).catch((e) => (error = e))
    assert.equal(error.code, 'E_ROW_NOT_FOUND')
    assert.equal(error.status, 404)
    assert.equal(error.message, 'Row not found')
  }).tags(['roles:assign'])
  test('must fail if the member does not exist', async ({ assert }) => {
    const role = await RoleFactory.create()
    let error = new MemberNotInServerException()
    await roleService.assign(role.id, 'non-existant-member').catch((e) => (error = e))
    assert.equal(error.code, 'E_ROW_NOT_FOUND')
    assert.equal(error.status, 404)
    assert.equal(error.message, 'Row not found')
  }).tags(['roles:assign'])
})
