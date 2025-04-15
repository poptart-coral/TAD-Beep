import { Exception } from '@adonisjs/core/exceptions'
import { HttpContext } from '@adonisjs/core/http'

export default class UserAlreadyMember extends Exception {
  async handle(error: this, ctx: HttpContext) {
    ctx.response.status(error.status).send({ message: error.message, error: error.code })
  }
}
