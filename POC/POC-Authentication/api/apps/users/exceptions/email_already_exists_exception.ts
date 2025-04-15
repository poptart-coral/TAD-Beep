import { Exception } from '@adonisjs/core/exceptions'
import { HttpContext } from '@adonisjs/core/http'

export default class EmailAlreadyExistsExeption extends Exception {
  async handle(error: this, ctx: HttpContext) {
    ctx.response.status(error.status).send({ message: error.message, code: error.code })
  }
}
