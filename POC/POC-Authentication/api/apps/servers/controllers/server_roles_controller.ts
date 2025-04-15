import RoleService from '#apps/roles/services/role_service'
import {
  assignRoleValidator,
  createRoleValidator,
  updateRoleValidator,
} from '#apps/roles/validators/role'
import ServerRolePolicy from '#apps/servers/policies/server_role_policy'
import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'

@inject()
export default class ServerRolesController {
  constructor(private roleService: RoleService) {}

  /**
   * Create a new role.
   */
  async create({ request, params, response, bouncer }: HttpContext) {
    //const server = await this.serverService.findById(params.serverId)
    await bouncer.with(ServerRolePolicy).authorize('create' as never, params.serverId)
    const payload = await request.validateUsing(createRoleValidator)
    const role = await this.roleService.create(payload, params.serverId)
    return response.created(role)
  }

  /**
   * Return list of all roles by server ID.
   */
  async index({ params, bouncer }: HttpContext) {
    await bouncer.with(ServerRolePolicy).authorize('view' as never, params.serverId)
    return this.roleService.findAllByServer(params.serverId)
  }

  /**
   * Display a single role by id.
   */
  async show({ params, bouncer }: HttpContext) {
    await bouncer.with(ServerRolePolicy).authorize('view' as never, params.serverId)
    return this.roleService.findById(params.roleId)
  }

  /**
   * Handle the form submission to update a specific role by id
   */
  async update({ params, request, response, bouncer }: HttpContext) {
    const receivedRole = await request.validateUsing(updateRoleValidator)
    await bouncer.with(ServerRolePolicy).authorize('update' as never, params.serverId)
    const role = await this.roleService.update(params.roleId, receivedRole)
    return response.send(role)
  }

  /**
   * Handle the form submission to delete a specific role by id.
   */
  async destroy({ params, bouncer }: HttpContext) {
    const roleId = params.roleId
    await bouncer.with(ServerRolePolicy).authorize('destroy' as never, params.serverId)
    await this.roleService.deleteById(roleId)
    return { message: 'Role deleted successfully' }
  }

  async assignRole({ params, bouncer, response }: HttpContext) {
    await bouncer.with(ServerRolePolicy).authorize('assignation' as never, params.serverId)
    const { memberId } = params
    await this.roleService.assign(params.roleId, memberId)
    return response.created()
  }

  async unassignRole({ params, bouncer }: HttpContext) {
    await bouncer.with(ServerRolePolicy).authorize('assignation' as never, params.serverId)
    const { memberId } = params
    return this.roleService.unassign(params.roleId, memberId)
  }

  async getAssignedMembers({ params, bouncer }: HttpContext) {
    await bouncer.with(ServerRolePolicy).authorize('assignation' as never, params.serverId)
    return this.roleService.getAssignedMembers(params.roleId)
  }

  async assignToMembers({ params, request, bouncer, response }: HttpContext) {
    await bouncer.with(ServerRolePolicy).authorize('assignation' as never, params.serverId)
    const { memberIds } = await request.validateUsing(assignRoleValidator)
    await this.roleService.assignToMembers(params.roleId, memberIds)
    return response.created()
  }
}
