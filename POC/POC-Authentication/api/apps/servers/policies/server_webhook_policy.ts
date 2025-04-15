import UserService from '#apps/users/services/user_service'
import { BasePolicy } from '@adonisjs/bouncer'
import { inject } from '@adonisjs/core'
import { JwtPayload } from 'jsonwebtoken'
import Server from '#apps/servers/models/server'
import ServerNotFoundException from '../exceptions/server_not_found_exception.js'

@inject()
export default class ServerWebhookPolicy extends BasePolicy {
  constructor(protected userService: UserService) {
    super()
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async before(payload: JwtPayload, _action: string, ...params: any[]) {
    const serverId = params[0] as string | null | undefined

    if (serverId && serverId !== undefined) {
      const server = await Server.findOrFail(serverId).catch(() => {
        throw new ServerNotFoundException('Server not found', {
          status: 404,
          code: 'E_ROWNOTFOUND',
        })
      })
      if (!server) return false
      await server.load('members')
      const member = server.members.find((m) => m.userId === payload.sub)
      if (!member) return false
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async view(_payload: JwtPayload, _serverId: string) {
    return true
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async create(_payload: JwtPayload, _serverId: string) {
    return true
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async update(_payload: JwtPayload, _serverId: string) {
    return true
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async delete(_payload: JwtPayload, _serverId: string) {
    return true
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async trigger(_payload: JwtPayload, _serverId: string) {
    return true
  }
}
