import User from '#apps/users/models/user'
import { allowGuest, BasePolicy } from '@adonisjs/bouncer'
import { AuthorizerResponse } from '@adonisjs/bouncer/types'
import { inject } from '@adonisjs/core'

@inject()
export default class UserPolicy extends BasePolicy {
  constructor() {
    super()
  }

  async view(): Promise<AuthorizerResponse> {
    return false
  }

  async store(): Promise<AuthorizerResponse> {
    return false
  }

  async delete(): Promise<AuthorizerResponse> {
    return false
  }

  @allowGuest()
  async updateEmail(
    _user: User | null,
    senderId: string,
    userId: string
  ): Promise<AuthorizerResponse> {
    return senderId === userId
  }
}
