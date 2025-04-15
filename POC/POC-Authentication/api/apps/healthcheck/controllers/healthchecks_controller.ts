// import type { HttpContext } from '@adonisjs/core/http'

import { HttpContext } from '@adonisjs/core/http'
import HealthcheckService from '#apps/healthcheck/services/healthcheck_service'
import { inject } from '@adonisjs/core'

@inject()
export default class HealthchecksController {
  constructor(private healthcheckService: HealthcheckService) {}

  async health({ response }: HttpContext) {
    const pgHealthy = await this.healthcheckService.checkPg()
    const redisHealthy = await this.healthcheckService.checkRedis()
    const minioHealthy = await this.healthcheckService.checkMinio()
    return response.send({
      pg: pgHealthy ? 'ok' : 'error',
      redis: redisHealthy ? 'ok' : 'error',
      minio: minioHealthy ? 'ok' : 'error',
    })
  }

  async live({ response }: HttpContext) {
    return response.status(200).send('ok')
  }
}
