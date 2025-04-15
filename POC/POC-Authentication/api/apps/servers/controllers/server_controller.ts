import { Payload } from '#apps/authentication/contracts/payload'
import ServerService from '#apps/servers/services/server_service'
import {
  createServerValidator,
  indexServerValidator,
  updateBannerValidator,
  updatePictureValidator,
  updateServerValidator,
} from '#apps/servers/validators/server'
import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'
import ServerPolicy from '#apps/servers/policies/server_policy'

@inject()
export default class ServersController {
  constructor(private serverService: ServerService) {}

  /**
   * Display a list of resource
   */
  async index({ request, auth }: HttpContext) {
    const userPayload = auth.use('jwt').payload as Payload
    const payload = await request.validateUsing(indexServerValidator)
    const servers = await this.serverService.findByUserId(
      userPayload.sub,
      payload.page,
      payload.limit
    )
    return servers
  }

  /**
   * Display a list of discoverable servers -> servers that are public
   */
  async discover({ request }: HttpContext) {
    const payload = await request.validateUsing(indexServerValidator)
    if (payload.query) {
      const servers = await this.serverService.discoverAndSearch(
        payload.query,
        payload.page,
        payload.limit
      )
      return servers
    }
    const servers = await this.serverService.discover(payload.page, payload.limit)
    return servers
  }

  /**
   * Handle form submission for the create action
   */
  async store({ auth, request, response }: HttpContext) {
    const payload = await request.validateUsing(createServerValidator)
    const userPayload = auth.use('jwt').payload as Payload
    const server = await this.serverService.create(payload, userPayload.sub)
    return response.created(server)
  }

  /**
   * Show individual record
   */
  async show({ params, bouncer }: HttpContext) {
    await bouncer.with(ServerPolicy).authorize('view' as never, params.serverId)
    return this.serverService.findById(params.serverId)
  }

  /**
   * Mettre à jour un serveur (nom,description)
   */

  async update({ request, params, bouncer }: HttpContext) {
    const payload = await request.validateUsing(updateServerValidator)
    const server = await this.serverService.findById(params.serverId)
    await bouncer.with(ServerPolicy).authorize('edit' as never, server)
    return this.serverService.update(params.serverId, payload)
  }

  async getOwner({ params, bouncer }: HttpContext) {
    bouncer.with(ServerPolicy).authorize('view' as never, params.serverId)
    const ownerId = await this.serverService.getOwner(params.serverId)
    return { ownerId: ownerId }
  }

  async getAllUsers({ params, bouncer }: HttpContext) {
    bouncer.with(ServerPolicy).authorize('view' as never, params.serverId)
    return this.serverService.findUsersByServerId(params.serverId)
  }

  async updateBanner({ request, bouncer, params }: HttpContext) {
    await bouncer.with(ServerPolicy).authorize('edit' as never, params.serverId)
    const data = await request.validateUsing(updateBannerValidator)
    return this.serverService.updateBanner(data)
  }

  // update picture
  async updatePicture({ request, bouncer, params }: HttpContext) {
    await bouncer.with(ServerPolicy).authorize('edit' as never, params.serverId)
    const data = await request.validateUsing(updatePictureValidator)
    return this.serverService.updatePicture(data)
  }

  async destroy({ params, response, bouncer }: HttpContext) {
    bouncer.with(ServerPolicy).authorize('delete' as never, params.serverId)
    await this.serverService.delete(params.serverId)
    return response.send({ message: 'Server deleted successfully' })
  }
}
