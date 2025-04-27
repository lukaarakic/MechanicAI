import { Link, useLocation } from '@remix-run/react'
import { GeneralErrorBoundary } from '~/components/error-boundary'
import Button from '~/components/ui/button'

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
          <div className="flex h-dvh flex-col items-center justify-center gap-6">
            <div className="text-slate-950 flex flex-col gap-3">
              <h1>We can't find this page:</h1>
              <pre className="text-body-lg bg-slate-100 whitespace-pre-wrap break-all rounded-lg px-4 py-1">
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
