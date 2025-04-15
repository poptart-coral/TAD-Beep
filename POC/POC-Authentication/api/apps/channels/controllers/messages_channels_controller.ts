import { Payload } from '#apps/authentication/contracts/payload'
import MessageChannelPolicy from '#apps/channels/policies/message_channel_policy'
import MessageService from '#apps/messages/services/message_service'
import {
  createMessageValidator,
  getMessagesValidator,
  pinMessageValidator,
  updateMessageValidator,
} from '#apps/messages/validators/message'
import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'
import { JwtPayload } from 'jsonwebtoken'
import MentionService from '#apps/notification/services/mention_service'

@inject()
export default class MessagesChannelsController {
  constructor(
    private readonly messageService: MessageService,
    private readonly mentionService: MentionService
  ) {}
  /**
   * Display a list of resource
   */
  async index({ params, request, bouncer }: HttpContext) {
    const channelId = params.channelId
    await bouncer.with(MessageChannelPolicy).authorize('index' as never, channelId)
    const queryStrings = await request.validateUsing(getMessagesValidator)
    if (!queryStrings?.before && !queryStrings?.limit) {
      return this.messageService.findAllByChannelId(channelId)
    } else {
      return this.messageService.getPaginated(channelId, queryStrings)
    }
  }

  /**
   * Get all pinned messages from a channel
   */
  async pinned({ params, bouncer }: HttpContext) {
    const channelId = params.channelId
    await bouncer.with(MessageChannelPolicy).authorize('index' as never, channelId)
    return this.messageService.findPinned(channelId)
  }

  /**
   * Pin a message
   */
  async pin({ params, bouncer, request, auth, response }: HttpContext) {
    const payload = auth.user as Payload
    const channelId = params.channelId
    const messageId = params.messageId
    const req = await request.validateUsing(pinMessageValidator)
    await bouncer.with(MessageChannelPolicy).authorize('pin' as never, channelId, messageId)
    const message = await this.messageService.pinning(messageId, req, payload.sub)
    return response.send(message)
  }

  /**
   * Handle form submission for the create action
   */
  async store({ auth, request, params, response, bouncer }: HttpContext) {
    const payload = auth.use('jwt').payload as JwtPayload
    const channelId: string = params.channelId
    await bouncer.with(MessageChannelPolicy).authorize('store' as never, channelId)
    const data = await request.validateUsing(createMessageValidator)

    const newMessage = await this.messageService.create(data, payload!.sub as string, channelId)
    await this.mentionService.notifyMentionedUsers(
      newMessage.content,
      payload!.sub as string,
      channelId
    )

    await this.messageService.notifyFriendMessage(auth.user as Payload, channelId)

    return response.created(newMessage)
  }

  /**
   * Handle form submission for the update action
   */
  async update({ request, params, bouncer }: HttpContext) {
    const { messageId, channelId } = params
    await bouncer.with(MessageChannelPolicy).authorize('update' as never, channelId, messageId)
    const receivedMessage = await request.validateUsing(updateMessageValidator)
    return this.messageService.update(receivedMessage, messageId)
  }

  /**
   * Show individual record
   */
  async show({ params, bouncer }: HttpContext) {
    const messageId = params.messageId
    await bouncer.with(MessageChannelPolicy).authorize('show' as never, params.channelId, messageId)
    return this.messageService.show(messageId)
  }

  /**
   * Delete record
   */
  async destroy({ params, bouncer, response }: HttpContext) {
    const messageId = params.messageId
    const channelId = params.channelId
    await bouncer.with(MessageChannelPolicy).authorize('destroy' as never, channelId, messageId)
    await this.messageService.destroy(messageId)
    return response.send({ message: 'Message deleted successfully' })
  }
}
