import env from '#start/env'
import { defineConfig, stores } from '@adonisjs/limiter'

const limiterConfig = defineConfig({
  default: env.get('LIMITER_STORE'),

  stores: {
    redis: stores.redis({
      connectionName: 'main',
      keyPrefix: 'limiter:',
    }),
    memory: stores.memory({}),
  },
})

export default limiterConfig

declare module '@adonisjs/limiter/types' {
  export interface LimitersList extends InferLimiters<typeof limiterConfig> {
    // Add a member to the interface to avoid the empty object type error
    [key: string]: ReturnType<typeof stores.redis> | ReturnType<typeof stores.memory>
  }
}
