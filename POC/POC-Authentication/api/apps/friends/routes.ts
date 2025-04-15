import { middleware } from '#start/kernel'
import router from '@adonisjs/core/services/router'
const FriendsController = () => import('#apps/friends/controllers/friends_controller')

router
  .group(() => {
    router.group(() => {
      router.delete('/:friendId', [FriendsController, 'destroy'])
    })
  })
  .prefix('friends')
  .use(middleware.auth())
