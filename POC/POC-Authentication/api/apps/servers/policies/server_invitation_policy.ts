import { BasePolicy } from '@adonisjs/bouncer'
import { inject } from '@adonisjs/core'
import { JwtPayload } from 'jsonwebtoken'
import ServerService from '../services/server_service.js'
import RoleService from '#apps/roles/services/role_service'
import PermissionsService from '#apps/shared/services/permissions/permissions_service'
import { Permissions } from '#apps/shared/enums/permissions'

@inject()
export default class ServerInvitationPolicy extends BasePolicy {
  constructor(
    protected serverService: ServerService,
    protected roleService: RoleService,
    protected permissionsService: PermissionsService
  ) {
    super()
  }
  async before(payload: JwtPayload, _action: string, ...params: unknown[]) {
    const serverId = params[0] as string | null | undefined

    if (serverId && serverId !== undefined) {
      const isPresent = await this.serverService.userPartOfServer(payload.sub!, serverId)
      if (!isPresent) return false
      const userPermissions = await this.roleService.getMemberPermissions(payload.sub!, serverId)
      const isAdmin = this.permissionsService.has_permission(
        userPermissions,
        Permissions.ADMINISTRATOR
      )
      if (isAdmin) return true
    }
  }
  async create(payload: JwtPayload, serverId: string) {
    const userPermissions = await this.roleService.getMemberPermissions(payload.sub!, serverId)
    return this.permissionsService.has_permission(userPermissions, Permissions.CREATE_INVITATION)
  }
}
