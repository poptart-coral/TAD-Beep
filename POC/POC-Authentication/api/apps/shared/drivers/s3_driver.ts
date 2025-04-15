import {
  GetObjectCommand,
  PutObjectCommand,
  DeleteObjectCommand,
  S3Client,
  S3ClientConfig,
} from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { s3Config } from '#config/s3_config'

export class MyS3Config implements S3ClientConfig {
  region: string
  endpoint: string
  credentials: { accessKeyId: string; secretAccessKey: string }
  forcePathStyle: boolean

  constructor(config: {
    endpoint: string
    credentials: { accessKeyId: string; secretAccessKey: string }
    region: string
    forcePathStyle: boolean
  }) {
    this.region = config.region
    this.endpoint = config.endpoint
    this.credentials = config.credentials
    this.forcePathStyle = config.forcePathStyle
  }
}
export class S3Driver {
  private static instance: S3Driver
  private readonly s3: S3Client

  constructor() {
    this.s3 = new S3Client(new MyS3Config(s3Config))
  }

  static getInstance(): S3Driver {
    if (!S3Driver.instance) {
      S3Driver.instance = new S3Driver()
    }
    return S3Driver.instance
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async uploadFile(bucket: string, key: string, body: any, length: number) {
    const command = new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: body,
      ContentLength: length,
    })

    return await this.s3.send(command)
  }

  async downloadFile(bucket: string, key: string) {
    const command = new GetObjectCommand({
      Bucket: bucket,
      Key: key,
    })

    return await this.s3.send(command)
  }

  async getSignedUrl(bucket: string, key: string) {
    const command = new GetObjectCommand({
      Bucket: bucket,
      Key: key,
    })

    // Expires in 1 hour (3600 seconds)
    return await getSignedUrl(this.s3, command, { expiresIn: 3600 })
  }

  async getObjects(bucket: string, key: string) {
    const command = new GetObjectCommand({
      Bucket: bucket,
      Key: key,
    })

    return await this.s3.send(command)
  }

  async deleteFile(bucket: string, key: string) {
    const command = new DeleteObjectCommand({
      Bucket: bucket,
      Key: key,
    })

    return await this.s3.send(command)
  }

  // async getHeadObject(bucket: string, key: string) {
  //   return s3.headObject({ Bucket: bucket, Key: key }).promise()
  // }
}
