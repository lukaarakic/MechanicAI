import { redirect } from '@remix-run/node'
import { sessionStorage } from '~/utils/session.server'

export async function loader() {
  return redirect('/login')
}

export async function action() {
  const cookieSession = await sessionStorage.getSession()

  return redirect('/login', {
    headers: {
      'set-cookie': await sessionStorage.destroySession(cookieSession),
    },
  })
}
