// Remix imports
import { LoaderFunctionArgs, MetaFunction } from '@remix-run/node'
import { Link, useLoaderData } from '@remix-run/react'

// Components
import { GeneralErrorBoundary } from '~/components/error-boundary'

// Utilities
import { prisma } from '~/utils/db.server'
import { invariantResponse } from '~/utils/misc'

// Libraries
import Markdown from 'react-markdown'
import Button from '~/components/ui/button'
import ArrowLeft from '~/assets/icons/arrow-left.svg?react'
import LogoWhite from '~/assets/logo-white.svg?react'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '~/components/ui/accordion'
import { Link as LinkIcon } from 'lucide-react'
import { useToast } from '~/components/ui/use-toast'

export async function loader({ params, request }: LoaderFunctionArgs) {
  const { solutionId } = params
  const { origin, pathname } = new URL(request.url)

  const solution = await prisma.solution.findUnique({
    where: {
      id: solutionId,
    },
    select: {
      solution: true,
      solutionTitle: true,
      problem: true,
      diagnostic: true,
      dashboardLights: true,
      car: {
        select: {
          carBrand: true,
          carModel: true,
          engineSize: true,
          fuel: true,
          power: true,
          year: true,
          shifter: true,
        },
      },
    },
  })

  invariantResponse(solution, 'Solution not found', { status: 404 })

  return { solution, url: { origin, pathname } }
}

const Solution = () => {
  const { solution, url } = useLoaderData<typeof loader>()
  const { toast } = useToast()

  return (
    <div className="mx-auto mt-50 flex flex-col px-20 pb-120 lg:px-70">
      <div className="sticky top-10 mb-20 flex items-center gap-10 lg:top-20">
        <Link
          to="/"
          className="-z-0 block h-40 w-40 rounded-full bg-light-gray p-5 transition-colors duration-200 ease-in-out hover:bg-blue-700"
        >
          <ArrowLeft className="h-full w-full fill-white" />
        </Link>
        <Button
          className="block h-40 w-40 rounded-full bg-light-gray p-5"
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(
                `${url.origin + url.pathname}`,
              )
              toast({
                title: 'Copied to clipboard',
                description:
                  'The link to the solution has been copied to your clipboard',
                duration: 2000,
              })
            } catch (error) {
              toast({
                title: 'Failed to copy',
                description:
                  error instanceof Error
                    ? error.message
                    : 'An unknown error occurred',
                duration: 2000,
              })
              console.log('Failed to copy: ', error)
            }
          }}
        >
          <LinkIcon />
        </Button>
      </div>

      <div className="flex w-full flex-col justify-center gap-30">
        <div className="flex h-60 w-60 items-center justify-center rounded-full bg-light-gray p-10">
          <LogoWhite className="w-ful h-full" />
        </div>

        <Markdown className="markdown max-w-4xl grow-0">
          {solution.solution}
        </Markdown>

        <div className="relative lg:w-[31.25rem]">
          <div className="sticky top-20 w-full">
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="item-1">
                <AccordionTrigger>Described problem</AccordionTrigger>
                <AccordionContent>
                  {solution.problem ?? 'No problem was described'}
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-2">
                <AccordionTrigger>Diagnostic problems</AccordionTrigger>
                <AccordionContent>
                  {solution.diagnostic ?? 'No diagnostic problems were found'}
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-3">
                <AccordionTrigger>Dashboard lights</AccordionTrigger>
                <AccordionContent>
                  {solution.dashboardLights ?? 'No dashboard lights were found'}
                </AccordionContent>
              </AccordionItem>
            </Accordion>

            <div className="grid w-full grid-cols-2 gap-y-5 rounded-7 border border-white/15 p-20">
              {solution.car !== null ? (
                <>
                  <p className="text-16">
                    Brand:{' '}
                    <span className="text-white/50">
                      {solution.car?.carBrand}
                    </span>
                  </p>
                  <p className="text-16">
                    Model:{' '}
                    <span className="text-white/50">
                      {solution.car?.carModel}
                    </span>
                  </p>
                  <p className="text-16">
                    Year:{' '}
                    <span className="text-white/50">{solution.car?.year}</span>
                  </p>
                  <p className="text-16">
                    Fuel Type:{' '}
                    <span className="text-white/50">{solution.car?.fuel}</span>
                  </p>
                  <p className="text-16">
                    Engine Size:{' '}
                    <span className="text-white/50">
                      {solution.car?.engineSize}cc
                    </span>
                  </p>
                  <p className="text-16">
                    Power:{' '}
                    <span className="text-white/50">
                      {solution.car?.power}kW
                    </span>
                  </p>
                  <p className="text-16">
                    Transmission:{' '}
                    <span className="text-white/50">
                      {solution.car?.shifter}
                    </span>
                  </p>
                </>
              ) : (
                <p>The car has been deleted</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
export default Solution

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  const solutionTitle = data?.solution.solutionTitle ?? 'Solution'
  const solution = data?.solution.solution.slice(0, 125) ?? 'No solution found'

  return [
    { title: `${solutionTitle} | MechanicAI` },
    {
      property: 'og:tittle',
      content: `${solutionTitle} | MechanicAI`,
    },
    {
      property: 'og:description',
      content: solution,
    },
    {
      name: 'description',
      content: solution,
    },
    {
      name: 'keywords',
      content:
        'MechanicAI ,car diagnosis, car problems, car repair, automotive troubleshooting',
    },
  ]
}

export function ErrorBoundary() {
  return (
    <GeneralErrorBoundary
      statusHandlers={{
        404: ({ params }) => {
          return <p>No solution by ID ({params.solutionId}) was found</p>
        },
      }}
    />
  )
}
