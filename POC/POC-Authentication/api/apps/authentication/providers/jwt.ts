import { HttpContext } from '@adonisjs/core/http'
import { JwtGuard, JwtGuardOptions } from '#apps/authentication/guards/jwt_guard'

export function jwtGuard<UserProvider>(
  config: JwtGuardOptions & {
    provider: {
      model: () => UserProvider
      tokens: string
      uids: string[]
    }
  }
) {
  return {
    async resolver() {
      const provider = config.provider

      const options: JwtGuardOptions = {
        getKey:        config.getKey,
        verifyOptions: config.verifyOptions,
      }
      return (ctx: HttpContext) => {
        return new JwtGuard(ctx, provider, options)
      }
    },
  }
}
