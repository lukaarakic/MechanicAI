import type { MetaFunction } from '@remix-run/node'
import { Link } from '@remix-run/react'
import { Button } from '~/components/ui/button'

export const meta: MetaFunction = () => {
  return [
    { title: 'MechanicAI' },
    { name: 'description', content: 'Welcome to Remix!' },
  ]
}

export default function Index() {
  return (
    <div className="h-full w-full flex items-center justify-center">
      <Button>
        <Link to={'/problem/new'}>Solve new problem</Link>
      </Button>
    </div>
  )
}
