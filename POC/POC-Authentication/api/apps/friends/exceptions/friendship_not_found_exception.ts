import { Exception } from '@adonisjs/core/exceptions'
import { HttpContext } from '@adonisjs/core/http'

export default class FriendshipNotFoundException extends Exception {
  async handle(error: this, ctx: HttpContext) {
    ctx.response.status(error.status).send(error.message)
  }
}
