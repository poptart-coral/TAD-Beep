import { Permissions } from '#apps/shared/enums/permissions'
import { MemberFactory } from '#database/factories/member_factory'
import { RoleFactory } from '#database/factories/role_factory'
import { ServerFactory } from '#database/factories/server_factory'
import { UserFactory } from '#database/factories/user_factory'
import { test } from '@japa/runner'

test.group('Roles create', async () => {
  test('must return a 201 when creating a role with permission MANAGE_ROLE', async ({ client }) => {
    const server = await ServerFactory.create()
    const member = await MemberFactory.merge({ serverId: server.id }).create()
    const role = await RoleFactory.merge({
      permissions: Permissions.MANAGE_ROLES,
      serverId: server.id,
    }).create()
    await role.related('members').attach([member.id])
    await member.load('user')
    const payload = {
      name: 'My role',
      permissions:
        Permissions.MANAGE_MESSAGES + Permissions.SEND_MESSAGES + Permissions.ATTACH_FILES,
    }
    const result = await client
      .post(`/servers/${server.id}/roles`)
      .json(payload)
      .loginAs(member.user)
    result.assertStatus(201)
    result.assertBodyContains({
      name: payload.name,
      permissions: payload.permissions,
      serverId: server.id,
    })
  }).tags(['roles:create'])

  test('must return 401 if your are not login', async ({ client }) => {
    const server = await ServerFactory.create()

    const payload = {
      name: 'My role',
      permissions: Permissions.MANAGE_MESSAGES,
    }
    const response = await client.post(`/servers/${server.id}/roles`).json(payload)
    response.assertStatus(401)
  }).tags(['roles:create'])

  test('must return 403 when user is not a member of the server', async ({ client }) => {
    const user = await UserFactory.make()
    const server = await ServerFactory.create()

    const payload = {
      name: 'My role',
      permissions: Permissions.MANAGE_MESSAGES,
    }
    const result = await client.post(`/servers/${server.id}/roles`).json(payload).loginAs(user)
    result.assertStatus(403)
  }).tags(['roles:create'])
  test('must return 403 if the member has not the permission MANAGE_ROLE', async ({ client }) => {
    const server = await ServerFactory.create()
    const member = await MemberFactory.merge({ serverId: server.id }).create()
    await member.load('user')

    const payload = {
      name: 'My role',
      permissions: Permissions.MANAGE_MESSAGES,
    }
    const result = await client
      .post(`/servers/${server.id}/roles`)
      .json(payload)
      .loginAs(member.user)
    result.assertStatus(403)
  }).tags(['roles:create'])

  test('must return 422 when creating a role without name', async ({ client }) => {
    const server = await ServerFactory.create()
    const member = await MemberFactory.merge({ serverId: server.id }).create()
    const role = await RoleFactory.merge({
      permissions: Permissions.MANAGE_ROLES,
      serverId: server.id,
    }).create()
    await role.related('members').attach([member.id])
    await member.load('user')

    const payload = {
      permissions: Permissions.MANAGE_MESSAGES,
    }
    const result = await client
      .post(`/servers/${server.id}/roles`)
      .json(payload)
      .loginAs(member.user)
    result.assertStatus(422)
  }).tags(['roles:create'])

  test('must return 422 when creating a role without permissions', async ({ client }) => {
    const server = await ServerFactory.create()
    const member = await MemberFactory.merge({ serverId: server.id }).create()
    const role = await RoleFactory.merge({
      permissions: Permissions.MANAGE_ROLES,
      serverId: server.id,
    }).create()
    await role.related('members').attach([member.id])
    await member.load('user')

    const payload = {
      name: 'My role',
    }
    const result = await client
      .post(`/servers/${server.id}/roles`)
      .json(payload)
      .loginAs(member.user)
    result.assertStatus(422)
  }).tags(['roles:create'])
})
