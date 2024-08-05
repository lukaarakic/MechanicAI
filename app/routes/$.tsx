import { Link, useLocation } from '@remix-run/react'
import { GeneralErrorBoundary } from '~/components/error-boundary'
import { Button } from '~/components/ui/button'

export async function loader() {
  throw new Response('Not found', { status: 404 })
}

export default function NotFound() {
  return <ErrorBoundary />
}

export function ErrorBoundary() {
  const location = useLocation()
  return (
    <GeneralErrorBoundary
      statusHandlers={{
        404: () => (
          <div className="h-dvh flex flex-col gap-6 justify-center items-center">
            <div className="flex flex-col gap-3 text-slate-950">
              <h1>We can't find this page:</h1>
              <pre className="whitespace-pre-wrap break-all text-body-lg bg-slate-100 rounded-lg px-4 py-1">
                {location.pathname}
              </pre>
            </div>
            <Button>
              <Link to="/">Back to home</Link>
            </Button>
          </div>
        ),
      }}
    />
  )
}
