import router from '@adonisjs/core/services/router'

const HealthchecksController = () => import('#apps/healthcheck/controllers/healthchecks_controller')

router.group(() => {
  router.get('health', [HealthchecksController, 'health'])
  router.get('live', [HealthchecksController, 'live'])
})
