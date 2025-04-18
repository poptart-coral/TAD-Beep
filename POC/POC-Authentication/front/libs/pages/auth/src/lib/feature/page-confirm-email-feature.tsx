import { NavigateFunction, useNavigate } from 'react-router-dom'
import PageConfirmEmail from '../ui/page-confirm-email'
import { AppDispatch } from '@beep/store'
import { useDispatch } from 'react-redux'
import { userActions } from '@beep/user'
import { useAuth } from 'react-oidc-context'
import { useEffect } from 'react'

export default function PageConfirmEmailFeature() {
  const navigate = useNavigate()
  const dispatch = useDispatch<AppDispatch>()
  const auth = useAuth()

  useEffect(() => {
    if (
      !auth.isLoading &&
      auth.user &&
      auth.user.profile &&
      auth.user.profile.email_verified
    ) {
      dispatch(
        userActions.setTokens({
          accessToken: auth.user.access_token || null,
          refreshToken: auth.user.refresh_token || null,
        })
      )
      navigate('/servers/discover')
    }
  })

  const onSignin = (navigation: NavigateFunction) => {
    auth.signinRedirect()
  }

  return <PageConfirmEmail onSignin={() => onSignin(navigate)} />
}
