import type { MetaFunction } from '@remix-run/node'
import { Link } from '@remix-run/react'
import { Button } from '~/components/ui/button'

export const meta: MetaFunction = () => {
  return [
    { title: 'MechanicAI' },
    {
      name: 'description',
      content:
        'Welcome to MechanicAI - the smart way to diagnose car problems. Get quick, accurate insights into your car issues by answering a few questions.',
    },
    {
      name: 'keywords',
      content:
        'MechanicAI, car diagnosis, car problems, automotive troubleshooting, car repair, car issues, car maintenance',
    },
  ]
}

export default function Index() {
  return (
    <div className="flex h-full w-full items-center justify-center">
      <Button>
        <Link to={'/problem/new'}>Solve new problem</Link>
      </Button>
    </div>
  )
}
