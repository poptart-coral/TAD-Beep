import UserService from '#apps/users/services/user_service'
import ChannelService from '#apps/channels/services/channel_service'
import { inject } from '@adonisjs/core'
import MessageService from '#apps/messages/services/message_service'
import User from '#apps/users/models/user'
import emitter from '@adonisjs/core/services/emitter'

@inject()
export default class MentionService {
  constructor(
    private readonly userService: UserService,
    private readonly channelService: ChannelService,
    private readonly messageService: MessageService
  ) {}

  async notifyMentionedUsers(content: string, senderId: string, channelId: string) {
    const userIds: string[] = this.messageService
      .extractMentionsFromMessage(content)
      .map((id) => id.replace(/^@/, '').replace(/^\$/, ''))

    const users: User[] = await this.userService.findFrom(userIds)
    const senderName = await this.userService.findById(senderId)

    const channel = await this.channelService.findByIdOrFail(channelId)
    await channel.load('server')

    await Promise.all(
      users.map(async (user) => {
        const msg = {
          receiverId: user.id,
          senderName: senderName.username,
          channelName: channel.name,
          serverName: channel.server.name,
        }

        if (user.id !== senderId) {
          await emitter.emit('user:mentioned', msg)
        }
      })
    )
  }
}
