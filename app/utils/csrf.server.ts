import { createCookie } from '@remix-run/node'
import { CSRF, CSRFError } from 'remix-utils/csrf/server'

const cookie = createCookie('csrf', {
  httpOnly: true,
  path: '/',
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  secrets: process.env.SESSION_SECRET?.split(','),
})

export const csrf = new CSRF({ cookie })

export async function checkCSRF(formData: FormData, request: Request) {
  try {
    await csrf.validate(formData, request.headers)
  } catch (error) {
    if (error instanceof CSRFError) {
      throw new Response('Invalid CSRF token', { status: 403 })
    }
    throw error
  }
}
