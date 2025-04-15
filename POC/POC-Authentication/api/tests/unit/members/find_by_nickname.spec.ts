import MemberService from '#apps/members/services/member_service'
import { MemberFactory } from '#database/factories/member_factory'
import { ServerFactory } from '#database/factories/server_factory'
import { Exception } from '@adonisjs/core/exceptions'
import app from '@adonisjs/core/services/app'
import { test } from '@japa/runner'

const memberService = await app.container.make(MemberService)

test.group('Members find by nickname', () => {
  test('must return users that are matching', async ({ assert }) => {
    const server = await ServerFactory.create()
    const members = await MemberFactory.merge({
      nickname: 'jondoe',
      serverId: server.id,
    }).createMany(3)
    const foundMembers = await memberService.findFromNickname(server.id, 'jond')
    assert.equal(foundMembers.length, 3)
    assert.containsSubset(
      foundMembers,
      members.map((member) => {
        return { id: member.id }
      })
    )
  })
  test('must fail if the server does not exist', async ({ assert }) => {
    let error = new Exception()
    await memberService.findFromNickname('non-existant-server', 'jond').catch((e) => (error = e))
    assert.equal(error.message, 'Row not found')
    assert.equal(error.status, 404)
    assert.equal(error.code, 'E_ROW_NOT_FOUND')
  })
})
