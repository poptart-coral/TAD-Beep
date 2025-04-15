import { middleware } from '#start/kernel'
import { throttleMessage } from '#start/limiter'
import router from '@adonisjs/core/services/router'
const MessagesChannelsController = () =>
  import('#apps/channels/controllers/messages_channels_controller')

router
  .group(() => {
    router
      .group(() => {
        router.post('', [MessagesChannelsController, 'store']).use(throttleMessage)
        router.get('', [MessagesChannelsController, 'index'])
        router.get('pinned', [MessagesChannelsController, 'pinned'])
        router.patch(':messageId/pinning', [MessagesChannelsController, 'pin'])
        router.delete(':messageId', [MessagesChannelsController, 'destroy'])
        router.get(':messageId', [MessagesChannelsController, 'show'])
        router.patch(':messageId', [MessagesChannelsController, 'update'])
      })
      .prefix(':channelId/messages')
  })
  .prefix('channels')
  .use(middleware.auth())
