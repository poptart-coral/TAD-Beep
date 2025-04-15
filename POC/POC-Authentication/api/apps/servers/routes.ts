const StoragesController = () => import('#apps/storage/controllers/storages_controller')
import { middleware } from '#start/kernel'
import { throttleCreation } from '#start/limiter'
import router from '@adonisjs/core/services/router'

const ServerController = () => import('#apps/servers/controllers/server_controller')
const ServerChannelsController = () =>
  import('#apps/servers/controllers/server_channels_controller')
const ServerRolesController = () => import('#apps/servers/controllers/server_roles_controller')
const ServerInvitationsController = () =>
  import('#apps/servers/controllers/server_invitations_controller')
const ServerMembersController = () => import('#apps/servers/controllers/server_members_controller')
const ServerWebhooksController = () =>
  import('#apps/servers/controllers/server_webhooks_controller')

/**
 * Routes publiques (aucune authentification requise)
 */
router.group(() => {
  router
    .group(() => {
      router
        .group(() => {
          router
            .group(() => {
              router.post('/trigger', [ServerWebhooksController, 'triggerWebhook'])
            })
            .prefix('/webhook/:webhookId')
        })
        .prefix('/channels/:channelId')
    })
    .prefix('/servers/:serverId')
})

router
  .group(() => {
    router
      .group(() => {
        router
          .group(() => {
            router.post('join', [ServerMembersController, 'joinPublic'])
            router.post('invitation', [ServerInvitationsController, 'createInvitation'])
            router
              .group(() => {
                router
                  .group(() => {
                    router
                      .group(() => {
                        router.post(':roleId', [ServerRolesController, 'assignRole'])
                        router.delete(':roleId', [ServerRolesController, 'unassignRole'])
                      })
                      .prefix('roles')
                    router.put('nickname', [ServerMembersController, 'updateNickname'])
                  })
                  .prefix(':memberId')
                router.get('', [ServerMembersController, 'index'])
                router.get('@me', [ServerMembersController, 'showMe'])
                router.get(':userId', [ServerMembersController, 'show'])
              })
              .prefix('members')
            router
              .group(() => {
                router
                  .group(() => {
                    router.get('members', [ServerRolesController, 'getAssignedMembers'])
                    router.post('assignation', [ServerRolesController, 'assignToMembers'])
                  })
                  .prefix(':roleId')
              })
              .prefix('roles')
          })
          .prefix(':serverId')
        router.post('join/:invitationId', [ServerMembersController, 'joinPrivate'])
      })
      .prefix('v1/servers')
  })
  .use(middleware.auth())

router
  .group(() => {
    router
      .group(() => {
        router.get('/', [ServerController, 'index'])
        router.get('/discover', [ServerController, 'discover'])
        router.post('/', [ServerController, 'store']).use(throttleCreation)
        router.post('/leave', [ServerChannelsController, 'leaveChannel']).prefix('channels')
        router
          .group(() => {
            router
              .group(() => {
                router.post('/', [ServerRolesController, 'create'])
                router.get('/', [ServerRolesController, 'index'])
                router.get('/:roleId', [ServerRolesController, 'show'])
                router.put('/:roleId', [ServerRolesController, 'update'])
                router.delete('/:roleId', [ServerRolesController, 'destroy'])
              })
              .prefix('roles')
            router
              .group(() => {
                router.get('/', [ServerChannelsController, 'findByServerId'])
                router.post('/', [ServerChannelsController, 'createChannel']).use(throttleCreation)
                router.put('/:channelId', [ServerChannelsController, 'updateChannel'])
                router.delete('/:channelId', [ServerChannelsController, 'deleteChannel'])
                router.get('/:channelId', [ServerChannelsController, 'findByChannelId'])
                router
                  .group(() => {
                    router.post('/join', [ServerChannelsController, 'joinChannel'])
                    router.get('/webhooks', [ServerWebhooksController, 'findByChannelId'])

                    router
                      .group(() => {
                        router.post('/', [ServerWebhooksController, 'createWebhook'])

                        router
                          .group(() => {
                            router.put('/', [ServerWebhooksController, 'updateWebhook'])
                            router.get('/', [ServerWebhooksController, 'findByWebhookId'])
                            router.delete('/', [ServerWebhooksController, 'deleteWebhook'])
                            router.get('/webhookPicture', [
                              StoragesController,
                              'transmitWebhookPicture',
                            ])
                            router.put('/webhookPicture', [
                              ServerWebhooksController,
                              'updateWebhookPicture',
                            ])
                          })
                          .prefix('/:webhookId')
                      })
                      .prefix('webhook')
                  })
                  .prefix('/:channelId')
              })
              .prefix('channels')
            router
              .group(() => {
                router.get('/', [StoragesController, 'transmitBanner'])
                router.put('/', [ServerController, 'updateBanner'])
              })
              .prefix('banner')
            router
              .group(() => {
                router.get('/', [StoragesController, 'transmitPicture'])
                router.put('/', [ServerController, 'updatePicture'])
              })
              .prefix('picture')
            router.get('/', [ServerController, 'show'])
            router.patch('/', [ServerController, 'update'])
            router.get('/owner', [ServerController, 'getOwner'])
            router.get('/users', [ServerController, 'getAllUsers'])
            router.get('/streaming/users', [ServerChannelsController, 'streamingUsers'])
            router.delete('/', [ServerController, 'destroy'])
            router.post('/mic', [ServerChannelsController, 'changeMutedStatus']).prefix('users')
            router.get('/webhooks', [ServerWebhooksController, 'findByServerId'])
          })
          .prefix('/:serverId')
      })
      .prefix('servers')
  })
  .use(middleware.auth())
