import Message from '#apps/messages/models/message'
import { allowGuest, BasePolicy } from '@adonisjs/bouncer'
import { AuthorizerResponse } from '@adonisjs/bouncer/types'
import { JwtPayload } from 'jsonwebtoken'
import { HttpContext } from '@adonisjs/core/http'
import { inject } from '@adonisjs/core'
import { createStorageValidator, updateStorageValidator } from '#apps/storage/validators/storage'

@inject()
export default class StoragePolicy extends BasePolicy {
  protected payload: JwtPayload

  constructor(protected ctx: HttpContext) {
    super()
    this.payload = ctx.auth.use('jwt').payload! as JwtPayload
  }

  @allowGuest()
  async edit(): Promise<AuthorizerResponse> {
    const data = await this.ctx.request.validateUsing(updateStorageValidator)
    const message = await Message.query()
      .join('attachments', 'messages.id', 'attachments.messageId')
      .where('attachments.id', data.params.id)
      .firstOrFail()
    return message.ownerId === this.payload.sub
  }

  @allowGuest()
  async delete(): Promise<AuthorizerResponse> {
    const message = await Message.query()
      .join('attachments', 'messages.id', 'attachments.messageId')
      .where('attachments.id', this.ctx.params.id)
      .firstOrFail()
    return message.ownerId === this.payload.sub
  }

  @allowGuest()
  async create(): Promise<AuthorizerResponse> {
    const data = await this.ctx.request.validateUsing(createStorageValidator)
    const message = await Message.findOrFail(data.messageId)
    return message.ownerId === this.payload.sub
  }
}
