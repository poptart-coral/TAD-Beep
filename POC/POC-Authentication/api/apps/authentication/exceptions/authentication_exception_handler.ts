import { ExceptionHandler, HttpContext } from '@adonisjs/core/http'

export default class AuthenticationExceptionHandler extends ExceptionHandler {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async handle(error: any, ctx: HttpContext) {
    ctx.response.status(error.status).send({ message: error.message, name: error.name })
  }
}
