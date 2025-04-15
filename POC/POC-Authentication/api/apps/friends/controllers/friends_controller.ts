import { JwtPayload } from 'jsonwebtoken'
import UserService from '#apps/users/services/user_service'
import FriendService from '#apps/friends/services/friend_service'
import type { HttpContext } from '@adonisjs/core/http'
import { inject } from '@adonisjs/core'

@inject()
export default class FriendsController {
  constructor(
    private readonly friendService: FriendService,
    private readonly userService: UserService
  ) {}

  async destroy({ auth, params }: HttpContext) {
    const friendId: string = params.friendId
    const userPayload: JwtPayload = auth.user as JwtPayload
    await this.friendService.deleteFriendship(userPayload.sub ?? '', friendId)
    return { message: 'Friend deleted successfully' }
  }

  async index({ auth }: HttpContext) {
    const payload: JwtPayload = auth.user as JwtPayload
    const user = await this.userService.findById(payload?.sub ?? '')
    return this.friendService.findByUser(user.id)
  }
}
