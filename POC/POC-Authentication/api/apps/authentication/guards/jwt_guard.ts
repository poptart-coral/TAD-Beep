import { AuthClientResponse, GuardContract } from '@adonisjs/auth/types'
import { errors, symbols } from '@adonisjs/auth'
import jwt, { JwtPayload } from 'jsonwebtoken'
import { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'
import User from '#apps/users/models/user'
//@ts-expect-error  Provider is not exported by the module
import { UserProviderContract } from '@adonisjs/auth/types/core'

export type JwtGuardOptions = {
  secret: string
}

export interface JwtPayloadContract extends JwtPayload {
  audited_account: boolean
}

export class JwtGuard<UserProvider extends UserProviderContract<User>>
  implements GuardContract<UserProvider[typeof symbols.PROVIDER_REAL_USER]>
{
  declare [symbols.GUARD_KNOWN_EVENTS]: object
  #userProvider: UserProvider
  #options: JwtGuardOptions
  #ctx: HttpContext
  payload?: JwtPayloadContract

  constructor(ctx: HttpContext, userProvider: UserProvider, options: JwtGuardOptions) {
    this.#userProvider = userProvider
    this.#options = options
    this.#ctx = ctx
  }

  driverName = 'jwt' as const

  authenticationAttempted: boolean = false
  isAuthenticated: boolean = false

  user?: UserProvider[typeof symbols.PROVIDER_REAL_USER]

  getUserProvider() {
    return this.#userProvider
  }

  async generate(user: User) {
    const payloadAccessToken = {
      sub: user.id,
      exp: Math.floor(
        DateTime.now()
          .plus({
            minute: 15,
          })
          .toMillis() / 1000
      ),
      resource_access: {
        roles: [], //user.roles.map((role: Role) => role.label),
      },
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      audited_account: !!user.verifiedAt,
    }

    const payloadRefreshToken = {
      sub: user.id,
      exp: Math.floor(
        DateTime.now()
          .plus({
            hour: 12,
          })
          .toMillis() / 1000
      ),
      scope: 'read write',
    }

    const accessToken = jwt.sign(payloadAccessToken, this.#options.secret)
    const refreshToken = jwt.sign(payloadRefreshToken, this.#options.secret)

    return {
      accessToken,
      refreshToken,
    }
  }

  async authenticate(): Promise<UserProvider[typeof symbols.PROVIDER_REAL_USER]> {
    const authHeader = this.#ctx.request.header('authorization')

    if (!authHeader) {
      throw new errors.E_UNAUTHORIZED_ACCESS('Acces refusé', {
        guardDriverName: this.driverName,
      })
    }

    const [, token] = authHeader.split('Bearer ')
    if (!token) {
      throw new errors.E_UNAUTHORIZED_ACCESS('Unauthorized access', {
        guardDriverName: this.driverName,
      })
    }

    //this.payload = await this.verifyToken(token)
    const payload = await this.verifyToken(token)
    this.user = payload
    this.payload = payload

    return payload
  }

  /**
   * Same as authenticate, but does not throw an exception
   */
  async check(): Promise<boolean> {
    await this.authenticate()
    return Promise.resolve(true)
  }

  async verifyToken(token: string): Promise<JwtPayloadContract> {
    try {
      const decodedToken = jwt.decode(token, { complete: true })

      const algorithm = decodedToken?.header.alg as jwt.Algorithm

      const verifyToken: JwtPayloadContract = jwt.verify(token, this.#options.secret, {
        algorithms: [algorithm],
      }) as JwtPayloadContract

      return verifyToken
    } catch {
      throw new errors.E_UNAUTHORIZED_ACCESS('Unauthorized access', {
        guardDriverName: this.driverName,
      })
    }
  }

  /**
   * Returns the authenticated user or throws an error
   */
  getUserOrFail(): UserProvider[typeof symbols.PROVIDER_REAL_USER] {
    return null
  }

  async createPayload(user: UserProvider[typeof symbols.PROVIDER_REAL_USER], roles: string[]) {
    return {
      sub: user.id,
      exp: Math.floor(
        DateTime.now()
          .plus({
            minute: 15,
          })
          .toMillis() / 1000
      ),
      resource_access: {
        roles: roles,
      },
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      audited_account: !!user.verifiedAt,
    }
  }

  async authenticateAsClient(
    user: UserProvider[typeof symbols.PROVIDER_REAL_USER],
    roles: string[]
  ): Promise<AuthClientResponse> {
    const payload = await this.createPayload(user, roles)

    const token = jwt.sign(payload, this.#options.secret)

    this.user = payload

    return {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  }

  GUARD_KNOWN_EVENTS: unknown
}
