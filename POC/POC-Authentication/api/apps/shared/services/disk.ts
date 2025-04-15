import { DriveManager } from 'flydrive'
import env from '#start/env'
import { S3Driver } from 'flydrive/drivers/s3'

const drive = new DriveManager({
  default: 's3',
  services: {
    s3: () =>
      new S3Driver({
        credentials: {
          accessKeyId: env.get('S3_KEY'),
          secretAccessKey: env.get('S3_SECRET'),
        },
        endpoint: env.get('S3_ENDPOINT'),
        region: env.get('S3_REGION'),
        bucket: env.get('S3_BUCKET_NAME'),
        visibility: 'private',
      }),
  },
})

export default drive.use()
