import transmit from '@adonisjs/transmit/services/main'
import type { HttpContext } from '@adonisjs/core/http'
import redis from '@adonisjs/redis/services/main'
// import { JwtPayload } from 'jsonwebtoken'

transmit.authorize<{ token: string }>('qr-code/:token', async (_ctx: HttpContext, { token }) => {
  try {
    const state = await redis.get(`qr-code:${token}`)
    if (state !== 'generated') {
      return false
    }
    await redis.set(`qr-code:${token}`, 'pending', 'EX', 300)
    return true
  } catch {
    return false
  }
})

/*transmit.authorize<{ id: string }>('notifications/users/:id', async (ctx: HttpContext, { id }) => {
  const user = (await ctx.auth.authenticate()) as JwtPayload

  return user.sub === id
})*/
