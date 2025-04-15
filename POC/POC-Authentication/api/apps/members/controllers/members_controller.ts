import { inject } from '@adonisjs/core'
import MemberService from '#apps/members/services/member_service'

@inject()
export default class MembersController {
  constructor(protected memberService: MemberService) {}
}
