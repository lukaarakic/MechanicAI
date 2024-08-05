import { createCookieSessionStorage } from '@remix-run/node'

export const verifySessionStorage = createCookieSessionStorage({
  cookie: {
    name: 'mai_verification',
    sameSite: 'lax',
    path: '/',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    secrets: process.env.SESSION_SECRET?.split(','),
    maxAge: 60 * 10,
  },
})
