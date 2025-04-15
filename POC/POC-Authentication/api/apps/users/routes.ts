import router from '@adonisjs/core/services/router'
import { middleware } from '#start/kernel'
const UserChannelsController = () => import('#apps/users/controllers/users_channels_controller')

const UsersFriendsController = () => import('#apps/users/controllers/users_friends_controller')
const UsersInvitationsController = () =>
  import('#apps/users/controllers/users_invitations_controller')
const UsersControllerV0 = () => import('#apps/users/controllers/users_v0_controller')
const UsersController = () => import('#apps/users/controllers/users_controller')
const UserServersController = () => import('#apps/users/controllers/user_servers_controller')
const OtpController = () => import('#apps/users/controllers/otp_controller')

router
  .group(() => {
    router
      .group(() => {
        router.get('/', [UsersController, 'index'])

        router
          .group(() => {
            router.get('channels', [UserChannelsController, 'index'])
            router.get('invitations', [UsersInvitationsController, 'index'])
            router.get('servers', [UserServersController, 'index'])
            router.get('friends', [UsersFriendsController, 'index'])
          })
          .prefix('@me')
      })
      .prefix('v1/users')

    router
      .group(() => {
        router.get('', [UsersControllerV0, 'index'])
        router.post('/connect', [UsersControllerV0, 'connectUser'])
        router.post('/disconnect', [UsersControllerV0, 'disconnectUser'])
        router.get('/onlines', [UsersControllerV0, 'onlines'])
        router.get('/display', [UsersControllerV0, 'all'])
        // route should look like /users/otp/[name of route]
        router
          .group(() => {
            router.post('/generate', [OtpController, 'generateOtp']) // Corrected OTP controller method
            router.post('/verify', [OtpController, 'verifyOtp']) // Corrected OTP controller method
          })
          .prefix('/otp')
        router
          .group(() => {
            router
              .group(() => {
                router.post('', [UsersControllerV0, 'createEmailToken'])
                // router.put('', [UsersControllerV0, 'confirmEmailUpdate'])
                router.post('/update', [UsersController, 'updateEmail'])
              })
              .prefix('/email')
            router.get('', [UsersControllerV0, 'findMe'])
            router.put('', [UsersController, 'update'])
          })
          .prefix('/@me')
        router.get('/:userId', [UsersControllerV0, 'show'])
      })
      .prefix('/users')
  })
  .use(middleware.auth())

// router.post('/register', [UsersController, 'register'])
