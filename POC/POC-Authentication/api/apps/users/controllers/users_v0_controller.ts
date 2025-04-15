import AuthenticationService from '#apps/authentication/services/authentication_service'
import User from '#apps/users/models/user'
import UserService from '#apps/users/services/user_service'
import {
  emailUpdateValidator,
  getMultipleUserValidator,
  updateUserValidator,
} from '#apps/users/validators/users'
import { inject } from '@adonisjs/core'
import { type HttpContext } from '@adonisjs/core/http'
import redis from '@adonisjs/redis/services/main'
import transmit from '@adonisjs/transmit/services/main'
import { JwtPayload } from 'jsonwebtoken'

@inject()
export default class UsersController {
  constructor(
    protected userService: UserService,
    protected authenticationService: AuthenticationService
  ) {}

  async index({ response, request }: HttpContext) {
    const userIds = await request.validateUsing(getMultipleUserValidator)

    let users: User[] = []
    if (userIds?.ids) {
      users = await this.userService.findFrom(userIds.ids)
    } else users = await this.userService.findAll({ page: 1, limit: 3000 })
    return response.send(users)
  }

  async findMe({ auth, response }: HttpContext) {
    const payload = auth.use('jwt').payload
    const user = await this.userService.findById(payload?.sub ?? '')
    type UserOmit = Omit<User, 'password'>
    const omittedUser: UserOmit = user
    return response.send(omittedUser)
  }

  async update({ request, auth, response }: HttpContext) {
    const payload = auth.use('jwt').payload
    const data = await request.validateUsing(updateUserValidator)
    if (data.email) return response.abort({ message: "You can't update the email with this route" })
    if (!payload?.sub) return response.abort({ message: "Can't update the user" })
    return this.userService.update(data, payload?.sub ?? '')
  }

  async show({ params, response }: HttpContext) {
    const user: User = await this.userService.findById(params.userId)

    return response.send({
      id: user.id,
      username: user.username,
      profilePicture: user.profilePicture,
    })
  }

  async connectUser({ response, auth }: HttpContext) {
    const payload = auth.use('jwt').payload as JwtPayload

    await redis.hset(
      'userStates',
      payload!.sub as string,
      JSON.stringify({
        id: payload!.sub,
        username: payload.username as string,
        expiresAt: Date.now() + 1200 * 1000, // Timestamp now + 20 minutes
      })
    )

    transmit.broadcast('users/state', {
      message: 'update user connected',
    })

    return response.send({
      message: 'User connected',
    })
  }

  async disconnectUser({ response, auth }: HttpContext) {
    const payload = auth.use('jwt').payload

    await redis.hdel('userStates', payload!.sub as string)

    transmit.broadcast('users/state', {
      message: 'new user disconnected',
    })

    return response.send({
      message: 'User disconnected',
    })
  }

  async all({ response }: HttpContext) {
    const users = await this.userService.findAllToDisplay()

    return response.send(users)
  }

  async onlines({ response }: HttpContext) {
    const userStates = await redis.hgetall('userStates')

    let isUpdateRedis: boolean = false

    for (const userKey in userStates) {
      const userData = JSON.parse(userStates[userKey])
      if (userData.expiresAt <= Date.now()) {
        await redis.hdel('userStates', userKey)
        isUpdateRedis = true
      }
    }

    if (isUpdateRedis) {
      transmit.broadcast('users/state', {
        message: 'update user connected',
      })
    }

    const users = Object.values(userStates).map((userState) => JSON.parse(userState))

    return response.send(users.filter((u) => u.expiresAt > Date.now()))
  }

  async createEmailToken({ request, auth, response }: HttpContext) {
    const payload = auth.use('jwt').payload
    const data = await request.validateUsing(emailUpdateValidator)
    if (!payload?.sub) return response.abort({ message: "Can't update email" })
    const token = await this.userService.storeEmailChangeToken(
      payload.sub,
      payload.email,
      data.email
    )
    return response.send({ token: token })
  }
}
