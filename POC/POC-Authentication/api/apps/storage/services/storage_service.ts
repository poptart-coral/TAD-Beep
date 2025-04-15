import { S3Driver } from '#apps/shared/drivers/s3_driver'
import { CreateStorageSchema, UpdateStorageSchema } from '#apps/storage/validators/storage'
import Message from '#apps/messages/models/message'
import { readFileSync } from 'node:fs'
import Attachment from '#apps/storage/models/attachment'
import env from '#start/env'
import { MultipartFile } from '@adonisjs/core/bodyparser'
import FileNotFoundException from '#apps/storage/exceptions/file_not_found_exception'

export default class StorageService {
  S3Driver: S3Driver
  BUCKET_NAME = env.get('S3_BUCKET_NAME') ?? 'app'

  constructor() {
    this.S3Driver = S3Driver.getInstance()
  }

  async store(values: CreateStorageSchema, message: Message) {
    const key = message.channelId + '/' + message.id + '/' + values.attachment.clientName
    if (values.attachment.tmpPath) {
      const realFile = readFileSync(values.attachment.tmpPath)
      const buffer = Buffer.from(realFile)

      await this.S3Driver.uploadFile(this.BUCKET_NAME, key, buffer, buffer.length)
      return await message.related('attachments').create({
        name: key,
        contentType: values.attachment.headers['content-type'],
        messageId: message.id,
      })
    }
    throw new Error('File not found')
  }

  async update(values: UpdateStorageSchema) {
    const attachment = await Attachment.findOrFail(values.params.id)
    attachment.load('message')
    const message = await Message.findOrFail(attachment.messageId)
    const key = message.channelId + '/' + message.id + '/' + values.attachment.clientName
    if (values.attachment.tmpPath) {
      const realFile = readFileSync(values.attachment.tmpPath)
      const buffer = Buffer.from(realFile)
      await this.S3Driver.uploadFile(this.BUCKET_NAME, key, buffer, buffer.length)
      const newAttachment = await Attachment.findByOrFail('name', key)
      return newAttachment
        .merge({ name: key, contentType: values.attachment.headers['content-type'] })
        .save()
    }
    throw new Error('File not found')
  }

  async destroy(id: string) {
    const attachment = await Attachment.findOrFail(id)
    await this.S3Driver.deleteFile(this.BUCKET_NAME, attachment.name)
    return attachment.delete()
  }

  async transmit(fileName: string) {
    try {
      const file = await this.S3Driver.getObjects(this.BUCKET_NAME, fileName)
      return file
    } catch {
      throw new FileNotFoundException('File not found', { status: 404 })
    }
  }

  async storeProfilePicture(profilePicture: MultipartFile, id: string) {
    const key = 'profilePictures/' + id + '/' + profilePicture.clientName
    if (profilePicture.tmpPath) {
      const buffer = Buffer.from(readFileSync(profilePicture.tmpPath))
      await this.S3Driver.uploadFile(this.BUCKET_NAME, key, buffer, buffer.length)
      return key
    }
    throw new Error('File not found')
  }

  //banner
  async updateBanner(banner: MultipartFile, id_server: string): Promise<string> {
    const key = id_server + '/' + 'banner' + '/' + banner.clientName

    if (banner.tmpPath) {
      const realFile = readFileSync(banner.tmpPath)
      const buffer = Buffer.from(realFile)
      await this.S3Driver.uploadFile(this.BUCKET_NAME, key, buffer, buffer.length)
      return key
    }
    throw new Error('File not found')
  }

  //picture

  async updatePicture(picture: MultipartFile, id_server: string): Promise<string> {
    const key = id_server + '/' + 'picture' + '/' + picture.clientName

    if (picture.tmpPath) {
      const realFile = readFileSync(picture.tmpPath)
      const buffer = Buffer.from(realFile)
      await this.S3Driver.uploadFile(this.BUCKET_NAME, key, buffer, buffer.length)
      return key
    }
    throw new Error('File not found')
  }
}
