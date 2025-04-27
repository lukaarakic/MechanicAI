import { createCookieSessionStorage } from '@remix-run/node'

export const carStorage = createCookieSessionStorage({
  cookie: {
    name: 'car_session',
    sameSite: 'lax',
    path: '/',
    httpOnly: true,
    secrets: import.meta.env.VITE_SESSION_SECRET?.split(','),
    // secure: import.meta.env.NODE_ENV === 'production',
    secure: false,
  },
})
