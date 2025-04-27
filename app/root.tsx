// Remix Core Imports
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

// Utility Providers
import { HoneypotProvider } from 'remix-utils/honeypot/react'
import { AuthenticityTokenProvider } from 'remix-utils/csrf/react'

// Server Utilities
import { csrf } from './utils/csrf.server'
import { sessionStorage } from './utils/session.server'
import { honeypot } from './utils/honeypot.server'
import { prisma } from './utils/db.server'
import { combineHeaders } from './utils/misc'

// Components
import { Toaster } from './components/ui/toaster'
import { GeneralErrorBoundary } from './components/error-boundary'

// Styles
import '~/tailwind.css'

export async function loader({ request }: LoaderFunctionArgs) {
  const honeyProps = honeypot.getInputProps()
  const [csrfToken, csrfCookieHeader] = await csrf.commitToken(request)
  const cookieSession = await sessionStorage.getSession(
    request.headers.get('cookie'),
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
        csrfCookieHeader ? { 'set-cookie': csrfCookieHeader } : null,
      ),
    },
  )
}

export function Document({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/apple-touch-icon.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href="/favicon-32x32.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="16x16"
          href="/favicon-16x16.png"
        />
        <link rel="manifest" href="/site.webmanifest" />
        <link rel="mask-icon" href="/safari-pinned-tab.svg" color="#5bbad5" />
        <meta name="msapplication-TileColor" content="#65748b" />
        <meta name="theme-color" content="#ffffff"></meta>

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
