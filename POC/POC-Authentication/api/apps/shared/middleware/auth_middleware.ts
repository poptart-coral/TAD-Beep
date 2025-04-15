import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'
import type { Authenticators } from '@adonisjs/auth/types'
import { errors as authErrors } from '@adonisjs/auth'
import { JwtPayloadContract } from '#apps/authentication/guards/jwt_guard'
/**
 * Auth middleware is used authenticate HTTP requests and deny
 * access to unauthenticated users.
 */
export default class AuthMiddleware {
  /**
   * The URL to redirect to, when authentication fails
   */
  redirectTo = '/authentication/signin'

  async userIsAudited(jwt: JwtPayloadContract) {
    if (!jwt.audited_account) {
      throw new authErrors.E_UNAUTHORIZED_ACCESS('Account is not audited', {
        guardDriverName: 'jwt',
      })
    }
  }

  async handle(
    ctx: HttpContext,
    next: NextFn,
    options: {
      guards?: (keyof Authenticators)[]
    } = {}
  ) {
    await ctx.auth.authenticateUsing(options.guards, { loginRoute: this.redirectTo })

    const jwt = ctx.auth.user as JwtPayloadContract

    if (!jwt) {
      throw new authErrors.E_INVALID_CREDENTIALS()
    }
    await this.userIsAudited(jwt)
    return next()
  }
}
