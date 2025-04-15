import { BasePolicy } from '@adonisjs/bouncer'
import { inject } from '@adonisjs/core'
import { JwtPayload } from 'jsonwebtoken'
import ServerService from '../services/server_service.js'
import RoleService from '#apps/roles/services/role_service'
import PermissionsService from '#apps/shared/services/permissions/permissions_service'
import { Permissions } from '#apps/shared/enums/permissions'

@inject()
export default class ServerPolicy extends BasePolicy {
  constructor(
    protected serverService: ServerService,
    protected roleService: RoleService,
    protected permissionsService: PermissionsService
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
  async view() {
    return true
  }
  async edit(payload: JwtPayload, serverId: string) {
    const permissions = await this.roleService.getMemberPermissions(payload.sub!, serverId)
    return this.permissionsService.has_permission(permissions, Permissions.MANAGE_SERVER)
  }
  async delete(payload: JwtPayload, serverId: string) {
    const permissions = await this.roleService.getMemberPermissions(payload.sub!, serverId)
    return this.permissionsService.has_permission(permissions, Permissions.MANAGE_SERVER)
  }
}
