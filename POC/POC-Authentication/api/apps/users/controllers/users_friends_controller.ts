import { inject } from '@adonisjs/core'
import { HttpContext } from '@adonisjs/core/http'
import { JwtPayloadContract } from '#apps/authentication/guards/jwt_guard'
import FriendService from '#apps/friends/services/friend_service'

@inject()
export default class UsersFriendsController {
  constructor(protected friendService: FriendService) {}

  async index({ auth }: HttpContext) {
    const id = (auth.user as JwtPayloadContract).sub!
    return this.friendService.findByUser(id)
  }
}
