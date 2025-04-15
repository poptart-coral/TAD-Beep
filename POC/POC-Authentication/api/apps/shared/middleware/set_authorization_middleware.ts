import { HttpContext } from '@adonisjs/core/http'

export default class SetAuthorizationHeader {
  async handle({ request }: HttpContext, next: () => Promise<void>) {
    const token = request.cookie('beep.access_token')

    if (token) {
      request.headers().authorization = `Bearer ${token}`
    }

    await next()
  }
}
