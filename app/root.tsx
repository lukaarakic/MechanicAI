import {
  json,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
} from '@remix-run/react'
import { LoaderFunctionArgs, redirect } from '@remix-run/node'

import { HoneypotProvider } from 'remix-utils/honeypot/react'
import { AuthenticityTokenProvider } from 'remix-utils/csrf/react'
import { csrf } from './utils/csrf.server'
import { sessionStorage } from './utils/session.server'
import { honeypot } from './utils/honeypot.server'
import { prisma } from './utils/db.server'
import { combineHeaders } from './utils/misc'

import { Toaster } from './components/ui/toaster'
import { GeneralErrorBoundary } from './components/error-boundary'

import '~/tailwind.css'

export async function loader({ request }: LoaderFunctionArgs) {
  const honeyProps = honeypot.getInputProps()
  const [csrfToken, csrfCookieHeader] = await csrf.commitToken(request)
  const cookieSession = await sessionStorage.getSession(
    request.headers.get('cookie')
  )

  const userId = cookieSession.get('userId')

  const user = userId
    ? await prisma.user.findUnique({
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          tokens: true,
          avatar: true,
        },
        where: {
          id: userId,
        },
      })
    : null

  if (userId && !user) {
    throw redirect('/login', {
      headers: {
        'set-cookie': await sessionStorage.destroySession(cookieSession),
      },
    })
  }

  return json(
    { honeyProps, csrfToken, user },
    {
      headers: combineHeaders(
        csrfCookieHeader ? { 'set-cookie': csrfCookieHeader } : null
      ),
    }
  )
}

export function Document({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  )
}

function App() {
  return (
    <Document>
      <Outlet />
      <Toaster />
    </Document>
  )
}

export default function AppWithProviders() {
  const data = useLoaderData<typeof loader>()

  return (
    <AuthenticityTokenProvider token={data.csrfToken}>
      <HoneypotProvider {...data.honeyProps}>
        <App />
      </HoneypotProvider>
    </AuthenticityTokenProvider>
  )
}

export function ErrorBoundary() {
  return (
    <Document>
      <GeneralErrorBoundary />
    </Document>
  )
}
