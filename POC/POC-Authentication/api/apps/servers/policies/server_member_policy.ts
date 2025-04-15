import { Permissions } from '#apps/shared/enums/permissions'
import UserService from '#apps/users/services/user_service'
import { BasePolicy } from '@adonisjs/bouncer'
import { inject } from '@adonisjs/core'
import { JwtPayload } from 'jsonwebtoken'
import ServerService from '#apps/servers/services/server_service'
import PermissionsService from '#apps/shared/services/permissions/permissions_service'
import RoleService from '#apps/roles/services/role_service'
import MemberService from '#apps/members/services/member_service'

@inject()
export default class ServerMemberPolicy extends BasePolicy {
  constructor(
    protected userService: UserService,
    protected roleService: RoleService,
    protected serverService: ServerService,
    protected permissionsService: PermissionsService,
    protected memberService: MemberService
  ) {
    super()
  }
  async before(payload: JwtPayload, _action: string, ...params: never[]) {
    const serverId: string | undefined = params[0]
    const isPresent = await this.serverService.userPartOfServer(payload.sub!, serverId!)
    if (!isPresent) return false

    const permissions = await this.roleService.getMemberPermissions(payload.sub!, serverId!)
    const isAdministrator = this.permissionsService.has_permission(
      permissions,
      Permissions.ADMINISTRATOR
    )
    if (isAdministrator) return true
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async view(_payload: JwtPayload) {
    return true
  }

  async updateNickname(payload: JwtPayload, serverId: string, memberId: string) {
    const permissions = await this.roleService.getMemberPermissions(payload.sub!, serverId!)
    const canManageNicknames = this.permissionsService.has_permission(
      permissions,
      Permissions.MANAGE_NICKNAMES
    )
    if (canManageNicknames) return true

    const canChangeNickname = this.permissionsService.has_permission(
      permissions,
      Permissions.CHANGE_NICKNAME
    )
    const members = await this.memberService.findById(memberId)
    if (canChangeNickname && payload.sub === members.userId) return true

    return false
  }
}
