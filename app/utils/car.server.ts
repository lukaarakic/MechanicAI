import { createCookieSessionStorage } from '@remix-run/node'

export const carStorage = createCookieSessionStorage({
  cookie: {
    name: 'car_session',
    sameSite: 'lax',
    path: '/',
    httpOnly: true,
    secrets: process.env.VITE_SESSION_SECRET?.split(','),
    // secure: process.env.NODE_ENV === 'production',
    secure: false,
  },
})
