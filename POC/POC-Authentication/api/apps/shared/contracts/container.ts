import { S3Driver } from '#apps/shared/drivers/s3_driver'

declare module '@adonisjs/core/types' {
  interface ContainerBindings {
    s3: S3Driver
  }
}
