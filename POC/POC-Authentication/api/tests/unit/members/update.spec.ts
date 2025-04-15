import MemberService from '#apps/members/services/member_service'
import { MemberFactory } from '#database/factories/member_factory'
import { Exception } from '@adonisjs/core/exceptions'
import app from '@adonisjs/core/services/app'
import { test } from '@japa/runner'

const memberService = await app.container.make(MemberService)

test.group('Member update', () => {
  test('should update the member', async ({ assert }) => {
    const member = await MemberFactory.create()
    await memberService.update(member.id, { nickname: 'newNickname' })
    const memberFromDb = await memberService.findFrom([member.id])
    assert.equal(memberFromDb[0].nickname, 'newNickname')
  })

  test('should throw if the member does not exist', async ({ assert }) => {
    let error = new Exception()
    await memberService.update('9999', { nickname: 'nonExistentNickname' }).catch((e) => {
      error = e
    })
    assert.equal(error.message, 'Row not found')
    assert.equal(error.status, 404)
    assert.equal(error.code, 'E_ROW_NOT_FOUND')
  })
})
