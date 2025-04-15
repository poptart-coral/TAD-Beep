import router from '@adonisjs/core/services/router'
import { middleware } from '#start/kernel'
const FilesController = () => import('#apps/storage/controllers/storages_controller')
router
  .group(() => {
    router
      .group(() => {
        router.put('/:id', [FilesController, 'update'])
        router.delete('/:id', [FilesController, 'destroy'])
        router
          .group(() => {
            router.get('attachment/:id', [FilesController, 'transmitAttachment'])
            router.get('profilePicture/:id', [FilesController, 'transmitProfilePicture'])
          })
          .prefix('/secure')
      })
      .prefix('/files')
  })
  .prefix('/storage')
  .use(
    middleware.auth({
      guards: ['jwt'],
    })
  )
