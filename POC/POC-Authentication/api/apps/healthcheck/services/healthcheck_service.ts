import { S3Driver } from '#apps/shared/drivers/s3_driver'
import redis from '@adonisjs/redis/services/main'
import env from '#start/env'
import db from '@adonisjs/lucid/services/db'

export default class HealthcheckService {
  BUCKET_NAME = env.get('S3_BUCKET_NAME') ?? 'app'
  S3Driver: S3Driver

  constructor() {
    this.S3Driver = S3Driver.getInstance()
  }

  async checkMinio(): Promise<boolean> {
    try {
      await this.S3Driver.uploadFile(this.BUCKET_NAME, 'healthcheck', 'ok', 2)
      return true
    } catch {
      return false
    }
  }
  async checkRedis(): Promise<boolean> {
    return redis
      .ping()
      ?.then(() => true)
      .catch(() => false)
  }
  async checkPg(): Promise<boolean> {
    try {
      await db.rawQuery('SELECT 1')
      return true
    } catch {
      return false
    }
  }
}
