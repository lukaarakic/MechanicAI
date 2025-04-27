import { createCookieSessionStorage } from '@remix-run/node'

export const sessionStorage = createCookieSessionStorage({
  cookie: {
    name: 'mai_session',
    sameSite: 'lax',
    path: '/',
    httpOnly: true,
    secrets: process.env.VITE_SESSION_SECRET?.split(','),
    secure: false,
    // secure: process.env.NODE_ENV === 'production',
  },
})
