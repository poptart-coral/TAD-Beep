import InvalidPermissionsMaskException from '#apps/roles/exceptions/invalid_permissions_mask_exception'
import Role from '#apps/roles/models/role'
import { CreateRoleSchema, UpdateRoleSchema } from '#apps/roles/validators/role'
import PermissionsService from '#apps/shared/services/permissions/permissions_service'
import Server from '#apps/servers/models/server'
import { inject } from '@adonisjs/core'
import { BasePolicy } from '@adonisjs/bouncer'
import Member from '#apps/members/models/member'
import MemberService from '#apps/members/services/member_service'
import MemberNotInServerException from '#apps/members/exceptions/member_not_in_server_exception'
import WrongChannelTypeException from '#apps/channels/exceptions/wrong_channel_type'
import { ChannelType } from '#apps/channels/models/channel_type'
import ChannelService from '#apps/channels/services/channel_service'
import CannotEditDefaultRoleException from '../exceptions/cannot_edit_default_role_exception.js'
import { Permissions } from '#apps/shared/enums/permissions'
import ServerService from '#apps/servers/services/server_service'

@inject()
export default class RoleService extends BasePolicy {
  constructor(
    protected permissionsService: PermissionsService,
    protected memberService: MemberService,
    protected channelService: ChannelService,
    protected serverService: ServerService
  ) {
    super()
  }

  async findById(roleId: string): Promise<Role> {
    return Role.findOrFail(roleId)
  }

  async findAllByServer(serverId: string): Promise<Role[]> {
    const server = await Server.findOrFail(serverId)
    await server.load('roles')
    return server.roles
  }

  async create(newRole: CreateRoleSchema, serverId: string): Promise<Role> {
    const permissions = newRole.permissions
    // Check for permissions validity
    if (!this.permissionsService.isValidMask(permissions)) {
      throw new InvalidPermissionsMaskException('Invalid permissions mask', {
        status: 400,
        code: 'E_INVALID_PERMISSIONS_MASK',
      })
    }

    const role = await Role.create({
      name: newRole.name,
      permissions: permissions,
      serverId: serverId,
    })
    return role.save()
  }

  async update(id: string, payload: UpdateRoleSchema): Promise<Role> {
    // Check for permissions validity
    if (!this.permissionsService.isValidMask(payload.permissions)) {
      throw new InvalidPermissionsMaskException('Invalid permissions mask', {
        status: 400,
        code: 'E_INVALID_PERMISSIONS_MASK',
      })
    }

    const role = await Role.findOrFail(id)
    if (role.id === role.serverId) role.merge({ permissions: payload.permissions })
    else role.merge(payload)

    return role.save()
  }

  async deleteById(roleId: string): Promise<void> {
    const role: Role = await Role.findOrFail(roleId)
    if (role.id === role.serverId)
      throw new CannotEditDefaultRoleException('Cannot delete the default role of the server', {
        status: 400,
        code: 'E_CANNOT_EDIT_DEFAULT_ROLE',
      })

    await role.delete()
  }

  async assign(roleId: string, memberId: string): Promise<void> {
    const role = await Role.findOrFail(roleId)
    if (role.id === role.serverId)
      throw new CannotEditDefaultRoleException('Cannot assign members to the default role', {
        status: 400,
        code: 'E_CANNOT_EDIT_DEFAULT_ROLE',
      })
    const member = await this.memberService.findById(memberId)
    if (member.serverId != role.serverId)
      throw new MemberNotInServerException('Member is not in the server', {
        code: 'E_MEMBER_NOT_IN_SERVER',
        status: 400,
      })
    await role.related('members').attach([memberId])
  }

  async unassign(roleId: string, memberId: string): Promise<void> {
    const role = await Role.findOrFail(roleId)
    await role.related('members').detach([memberId])
  }

  async findMembersByRoleId(roleId: string): Promise<Member[]> {
    const role = await Role.query().where('id', roleId).preload('members').firstOrFail()
    return role.members
  }

  async getMemberPermissionsFromChannel(userId: string, channelId: string): Promise<number> {
    const channel = await this.channelService.findByIdOrFail(channelId)

    if (channel.serverId === null || channel.type !== ChannelType.TEXT_SERVER)
      throw new WrongChannelTypeException('Wrong channel type', {
        status: 400,
        code: 'E_WRONG_CHANNEL_TYPE',
      })
    return this.getMemberPermissions(userId, channel.serverId)
  }

  async getMemberPermissions(userId: string, serverId: string) {
    const member = await Member.query()
      .where('user_id', userId)
      .where('server_id', serverId)
      .preload('roles')
      .firstOrFail()

    const isOwner = (await this.serverService.findOwner(serverId)) == userId
    let permissions: number = 0
    if (isOwner) permissions = Permissions.ADMINISTRATOR
    const role = await this.findById(serverId)
    permissions |= role.permissions

    member.roles.forEach((r) => {
      permissions |= r.permissions
    })
    return permissions
  }

  async getAssignedMembers(roleId: string) {
    const role = await this.findById(roleId)
    await role.load('members')
    return role.members
  }

  async assignToMembers(roleId: string, memberIds: string[]) {
    const role = await Role.findOrFail(roleId)
    if (role.id === role.serverId)
      throw new CannotEditDefaultRoleException('Cannot assign members to the default role', {
        status: 400,
        code: 'E_CANNOT_EDIT_DEFAULT_ROLE',
      })
    const members = await this.memberService.findFrom(memberIds)
    if (!members.every((m) => m.serverId === role.serverId))
      throw new MemberNotInServerException('Member is not in the server', {
        code: 'E_MEMBER_NOT_IN_SERVER',
        status: 400,
      })
    await role.related('members').attach(memberIds)
  }
}
