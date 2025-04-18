import { JwtPayloadContract } from '#apps/authentication/guards/jwt_guard'
import Channel from '#apps/channels/models/channel'
import ChannelService from '#apps/channels/services/channel_service'
import { inject } from '@adonisjs/core'
import { HttpContext } from '@adonisjs/core/http'

@inject()
export default class UserChannelsController {
  constructor(protected channelService: ChannelService) {}

  async index({ auth }: HttpContext) {
    console.log('UserChannelsController.index')
    const userPayload = auth.user as JwtPayloadContract
    console.log('userPayload: ', userPayload)
    let channels : Channel[] = []
    try {
      channels = await this.channelService.findPrivateOrderedForUserOrFail(userPayload.sub!)
    } catch (e) {
      console.log('channels not found', e)
      channels = []
    }
    console.log('channels: ', channels)
    return channels
  }
}
