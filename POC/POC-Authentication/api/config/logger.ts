import env from '#start/env'
import type { LokiOptions } from 'pino-loki'
import app from '@adonisjs/core/services/app'
import { defineConfig, targets } from '@adonisjs/core/logger'

const loggerConfig = defineConfig({
  default: 'app',

  /**
   * The loggers object can be used to define multiple loggers.
   * By default, we configure only one logger (named "app").
   */
  loggers: {
    app: {
      enabled: env.get('NODE_ENV') === 'test' ? false : true,
      name: env.get('APP_NAME'),
      level: env.get('LOG_LEVEL'),
      transport: {
        targets: targets()
          .pushIf(!app.inProduction, targets.pretty())
          .pushIf(app.inProduction, targets.file({ destination: 1 }))
          .pushIf(!(env.get('LOKI_HOST') === undefined), {
            target: 'pino-loki',
            level: env.get('LOKI_LOG_LEVEL') || env.get('LOG_LEVEL'),
            options: {
              labels: {
                application: 'beep-api',
                environment: env.get('ENVIRONMENT') || 'undefined',
              },
              host: env.get('LOKI_HOST') || '',
            } satisfies LokiOptions,
          })
          .toArray(),
      },
    },
  },
})

export default loggerConfig

/**
 * Inferring types for the list of loggers you have configured
 * in your application.
 */
declare module '@adonisjs/core/types' {
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  export interface LoggersList extends InferLoggers<typeof loggerConfig> {}
}
