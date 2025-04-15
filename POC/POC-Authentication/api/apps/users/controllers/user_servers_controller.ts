import { inject } from '@adonisjs/core'
import { HttpContext } from '@adonisjs/core/http'
import { JwtPayloadContract } from '#apps/authentication/guards/jwt_guard'
import ServerService from '#apps/servers/services/server_service'

@inject()
export default class UserServersController {
  constructor(protected serverService: ServerService) {}

  async index({ auth }: HttpContext) {
    const id = (auth.user as JwtPayloadContract).sub!
    return this.serverService.getByUserId(id)
  }
}
