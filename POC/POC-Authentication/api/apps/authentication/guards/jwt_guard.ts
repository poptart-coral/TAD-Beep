import { AuthClientResponse, GuardContract } from '@adonisjs/auth/types'
import { errors, symbols } from '@adonisjs/auth'
import jwt, { JwtHeader, JwtPayload, SigningKeyCallback } from 'jsonwebtoken'
import { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'
import User from '#apps/users/models/user'
//@ts-expect-error  Provider is not exported by the module
import { UserProviderContract } from '@adonisjs/auth/types/core'

export interface JwtGuardOptions {
  getKey: (header: JwtHeader, cb: SigningKeyCallback) => void
  verifyOptions: jwt.VerifyOptions
}

export interface JwtPayloadContract extends JwtPayload {
  email_verified: boolean
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

  // async generate(user: User) {
  //   const payloadAccessToken = {
  //     sub: user.id,
  //     exp: Math.floor(
  //       DateTime.now()
  //         .plus({
  //           minute: 15,
  //         })
  //         .toMillis() / 1000
  //     ),
  //     resource_access: {
  //       roles: [], //user.roles.map((role: Role) => role.label),
  //     },
  //     username: user.username,
  //     firstName: user.firstName,
  //     lastName: user.lastName,
  //     email: user.email,
  //     audited_account: !!user.verifiedAt,
  //   }

  //   const payloadRefreshToken = {
  //     sub: user.id,
  //     exp: Math.floor(
  //       DateTime.now()
  //         .plus({
  //           hour: 12,
  //         })
  //         .toMillis() / 1000
  //     ),
  //     scope: 'read write',
  //   }

  //   const accessToken = jwt.sign(payloadAccessToken, this.#options.secret)
  //   const refreshToken = jwt.sign(payloadRefreshToken, this.#options.secret)

  //   return {
  //     accessToken,
  //     refreshToken,
  //   }
  // }

  public async authenticate(): Promise<UserProvider[typeof symbols.PROVIDER_REAL_USER]> {

    const cookieHeader = this.#ctx.request.header('cookie') || ''
    const match = cookieHeader
      .split(';')
      .map((c) => c.trim())
      .find((c) => c.startsWith('beep.access_token='))
    const token = match?.split('=')[1]

    if (!token) {
      throw new errors.E_UNAUTHORIZED_ACCESS('Refused access : no token', {
        guardDriverName: this.driverName,
      })
    }

    // Check signature with jwks
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
    return new Promise((resolve, reject) => {
      jwt.verify(
        token,
        this.#options.getKey, // ← getKey JWKS
        this.#options.verifyOptions, // ← RS256 + issuer + audience
        (err, decoded) => {

          if (err) return reject(err)
          resolve(decoded as JwtPayloadContract)
        }
      )
    })
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

    const token = jwt.sign(payload, null)

    this.user = payload

    return {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  }

  GUARD_KNOWN_EVENTS: unknown
}
