import { JwtPayloadContract } from '#apps/authentication/guards/jwt_guard'
import ChannelService from '#apps/channels/services/channel_service'
import { inject } from '@adonisjs/core'
import { HttpContext } from '@adonisjs/core/http'

@inject()
export default class UserChannelsController {
  constructor(protected channelService: ChannelService) {}

  async index({ auth }: HttpContext) {
    const userPayload = auth.user as JwtPayloadContract
    const channels = await this.channelService.findPrivateOrderedForUserOrFail(userPayload.sub!)
    return channels
  }
}
