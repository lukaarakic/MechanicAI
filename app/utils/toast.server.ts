import { createCookieSessionStorage } from '@remix-run/node'

export const toastSessionStorage = createCookieSessionStorage({
  cookie: {
    name: 'mai_toast',
    sameSite: 'lax',
    path: '/',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    secrets: process.env.TOAST_SECRET?.split(','),
  },
})
