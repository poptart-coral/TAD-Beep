import { inject } from '@adonisjs/core'
import { HttpContext } from '@adonisjs/core/http'
import UserService from '#apps/users/services/user_service'
import UserPolicy from '#apps/users/policies/user_policy'
import { oldEmailUpdateValidator, updateUserValidator } from '#apps/users/validators/users'

@inject()
export default class UsersController {
  constructor(protected userService: UserService) {}

  async index({ bouncer }: HttpContext) {
    await bouncer.with(UserPolicy).authorize('view' as never)
  }

  //updating a user
  async update({ request, auth, response }: HttpContext) {
    const payload = auth.use('jwt').payload
    const data = await request.validateUsing(updateUserValidator)
    if (!payload?.sub) return response.abort({ message: "Can't update the user" })
    return this.userService.update(data, payload?.sub ?? '')
  }

  //updatig email user with a password verification
  async updateEmail({ request }: HttpContext) {
    // ,auth, response
    // const payload = auth.use('jwt').payload
    const data = await request.validateUsing(oldEmailUpdateValidator)
    // if (!payload?.sub) return response.abort({ message: "Can't update the user" })

    return this.userService.updateEmail(data)
  }
}
