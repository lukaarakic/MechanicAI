import { createCookieSessionStorage } from '@remix-run/node'

export const verifySessionStorage = createCookieSessionStorage({
  cookie: {
    name: 'mai_verification',
    sameSite: 'lax',
    path: '/',
    httpOnly: true,
    secure: false,
    // secure: import.meta.env.NODE_ENV === 'production',
    secrets: import.meta.env.VITE_SESSION_SECRET?.split(','),
    maxAge: 60 * 10,
  },
})
