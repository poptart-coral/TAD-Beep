import { UserFactoryWithPassord } from '#database/factories/user_factory'
import { test } from '@japa/runner'

// TEST : RETURN OK
test.group('Authentication updatePassword', () => {
  test('Must return 200 when password is updated successfully', async ({ client, expect }) => {
    const password = 'password123'
    const user = await UserFactoryWithPassord(password).create()

    const payload = {
      oldPassword: password,
      newPassword: 'newPassword123',
    }

    const token = await client
      .post('/authentication/signin')
      .json({
        email: user.email,
        password: payload.oldPassword,
      })
      .then((res) => res.body().tokens.accessToken)

    const result = await client
      .patch('/authentication/password')
      .header('Authorization', `Bearer ${token}`)
      .json(payload)

    result.assertStatus(200)
    expect(result.body()).toEqual(
      expect.objectContaining({
        message: 'Password updated successfully.',
      })
    )
  }).tags(['authentication:updatePassword'])

  // TEST : RETURN 400 - PASSWORD NOT MATCH
  test('Must return 400 when current password does not match', async ({ client }) => {
    const password = 'password123'
    const user = await UserFactoryWithPassord(password).create()

    const payload = {
      oldPassword: 'wrongPassword',
      newPassword: 'newPassword123',
    }

    const token = await client
      .post('/authentication/signin')
      .json({
        email: user.email,
        password: password,
      })
      .then((res) => res.body().tokens.accessToken)

    const result = await client
      .patch('/authentication/password')
      .header('Authorization', `Bearer ${token}`)
      .json(payload)

    result.assertStatus(400)
    result.assertBodyContains({ code: 'E_CURRENT_PASSWORD_MISMATCHING' })
  }).tags(['authentication:updatePassword'])

  // TEST : RETURN 401 - UNAUTHORIZED
  test('Must return 401 when unauthorized', async ({ client }) => {
    const payload = {
      oldPassword: 'wrongPassword',
      newPassword: 'newPassword123',
    }

    const result = await client.patch('/authentication/password').json(payload)

    result.assertStatus(401)
  }).tags(['authentication:updatePassword'])
})
