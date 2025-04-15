import env from '#start/env'

export const s3Config = {
  region: env.get('S3_REGION'),
  endpoint: env.get('S3_ENDPOINT'),
  forcePathStyle: true,
  credentials: {
    accessKeyId: env.get('S3_KEY'),
    secretAccessKey: env.get('S3_SECRET'),
  },
}
