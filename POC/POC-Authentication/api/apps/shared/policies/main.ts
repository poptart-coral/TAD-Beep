/*
|--------------------------------------------------------------------------
| Bouncer policies
|--------------------------------------------------------------------------
|
| You may define a collection of policies inside this file and pre-register
| them when creating a new bouncer instance.
|
| Pre-registered policies and abilities can be referenced as a string by their
| name. Also they are must if want to perform authorization inside Edge
| templates.
|
*/

import { usersPolicies } from '#apps/users/policies'
import { storagePolicies } from '#apps/storage/policies'

export const policies = {
  ...usersPolicies,
  ...storagePolicies,
}
