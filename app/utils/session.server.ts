import { createCookieSessionStorage } from '@remix-run/node'

export const sessionStorage = createCookieSessionStorage({
  cookie: {
    name: 'mai_session',
    sameSite: 'lax',
    path: '/',
    httpOnly: true,
    secrets: import.meta.env.VITE_SESSION_SECRET?.split(','),
    secure: false,
    // secure: import.meta.env.NODE_ENV === 'production',
  },
})
