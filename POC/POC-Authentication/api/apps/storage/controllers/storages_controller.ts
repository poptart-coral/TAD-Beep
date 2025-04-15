import Server from '#apps/servers/models/server'
import Attachment from '#apps/storage/models/attachment'
import StoragePolicy from '#apps/storage/policies/storage_policy'
import StorageService from '#apps/storage/services/storage_service'
import { updateStorageValidator } from '#apps/storage/validators/storage'
import User from '#apps/users/models/user'
import Webhook from '#apps/webhooks/models/webhook'
import { inject } from '@adonisjs/core'
import { type HttpContext, type Response } from '@adonisjs/core/http'

@inject()
export default class StoragesController {
  constructor(private storageService: StorageService) {}
  /**
   * Handle form submission for the edit action
   */
  async update({ bouncer, auth, request, response }: HttpContext) {
    const payload = auth.use('jwt').payload
    if (payload && typeof payload.sub === 'string') {
      const data = await request.validateUsing(updateStorageValidator)
      await bouncer.with(StoragePolicy).authorize('edit' as never)
      return await this.storageService.update(data)
    }
    return response.unauthorized()
  }

  /**
   * Delete record
   */
  async destroy({ bouncer, params }: HttpContext) {
    await bouncer.with(StoragePolicy).authorize('delete' as never)
    return await this.storageService.destroy(params.id)
  }

  async transmitAttachment({ params, response }: HttpContext) {
    const attachment = await Attachment.findByOrFail('id', params.id)
    return await this.transmit(response, attachment.name)
  }

  async transmitProfilePicture({ params, response }: HttpContext) {
    const user = await User.findByOrFail('id', params.id)
    return await this.transmit(response, user.profilePicture)
  }

  async transmitBanner({ params, response }: HttpContext) {
    const server = await Server.findByOrFail('id', params.serverId)
    return await this.transmit(response, server.banner)
  }

  async transmitPicture({ params, response }: HttpContext) {
    const server = await Server.findByOrFail('id', params.serverId)
    return await this.transmit(response, server.icon)
  }

  async transmitWebhookPicture({ params, response }: HttpContext) {
    const webhook = await Webhook.findByOrFail('id', params.webhookId)
    return await this.transmit(response, webhook.webhookPicture)
  }

  async transmit(response: Response, id: string) {
    const payload = await this.storageService.transmit(id)
    if (payload.Body) {
      response.type('application/octet-stream')
      //@ts-expect-error Working fine from the beginning. Why changing a winning team ?
      return response.stream(payload.Body)
    }
    return response.notFound()
  }
}
