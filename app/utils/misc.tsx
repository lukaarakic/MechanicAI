import { useFormAction, useNavigation } from '@remix-run/react'

/**
 * Provide a condition and if that condition is falsey, this throws a 400
 * Response with the given message.
 *
 * inspired by invariant from 'tiny-invariant'
 *
 * @example
 * invariantResponse(typeof value === 'string', `value must be a string`)
 *
 * @param condition The condition to check
 * @param message The message to throw (or a callback to generate the message)
 * @param responseInit Additional response init options if a response is thrown
 *
 * @throws {Response} if condition is falsey
 */
export function invariantResponse(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  condition: any,
  message: string | (() => string),
  responseInit?: ResponseInit
): asserts condition {
  if (!condition) {
    throw new Response(typeof message === 'function' ? message() : message, {
      status: 400,
      ...responseInit,
    })
  }
}

/**
 * Provide a condition and if that condition is falsey, this throws an error
 * with the given message.
 *
 * inspired by invariant from 'tiny-invariant' except will still include the
 * message in production.
 *
 * @example
 * invariant(typeof value === 'string', `value must be a string`)
 *
 * @param condition The condition to check
 * @param message The message to throw (or a callback to generate the message)
 * @param responseInit Additional response init options if a response is thrown
 *
 * @throws {Error} if condition is falsey
 */
export function invariant(
  condition: any,
  message: string | (() => string)
): asserts condition {
  if (!condition) {
    throw new Error(typeof message === 'function' ? message() : message)
  }
}

/**
 * Merge multiple headers objects into one (uses set so headers are overridden)
 */
export function mergeHeaders(
  ...headers: Array<ResponseInit['headers'] | null>
) {
  const merged = new Headers()
  for (const header of headers) {
    if (!header) continue
    for (const [key, value] of new Headers(header).entries()) {
      merged.set(key, value)
    }
  }
  return merged
}

/**
 * Combine multiple header objects into one (uses append so headers are not overridden)
 */
export function combineHeaders(
  ...headers: Array<ResponseInit['headers'] | null>
) {
  const combined = new Headers()
  for (const header of headers) {
    if (!header) continue
    for (const [key, value] of new Headers(header).entries()) {
      combined.append(key, value)
    }
  }
  return combined
}

/**
 * Does its best to get a string error message from an unknown error.
 */
export function getErrorMessage(error: unknown) {
  if (typeof error === 'string') return error
  if (
    error &&
    typeof error === 'object' &&
    'message' in error &&
    typeof error.message === 'string'
  ) {
    return error.message
  }
  console.error('Unable to get error message for error', error)
  return 'Unknown Error'
}

/**
 * Returns true if the current navigation is submitting the current route's
 * form. Defaults to the current route's form action and method POST.
 *
 * Defaults state to 'non-idle'
 *
 * NOTE: the default formAction will include query params, but the
 * navigation.formAction will not, so don't use the default formAction if you
 * want to know if a form is submitting without specific query params.
 */
export function useIsPending({
  formAction,
  formMethod = 'POST',
  state = 'non-idle',
}: {
  formAction?: string
  formMethod?: 'POST' | 'GET' | 'PUT' | 'PATCH' | 'DELETE'
  state?: 'submitting' | 'loading' | 'non-idle'
} = {}) {
  const contextualFormAction = useFormAction()
  const navigation = useNavigation()
  const isPendingState =
    state === 'non-idle'
      ? navigation.state !== 'idle'
      : navigation.state === state
  return (
    isPendingState &&
    navigation.formAction === (formAction ?? contextualFormAction) &&
    navigation.formMethod === formMethod
  )
}

export function getDomainUrl(request: Request) {
  const host =
    request.headers.get('X-Forwarded-Host') ?? request.headers.get('host')
  if (!host) {
    throw new Error('Could not determine domain URL.')
  }
  const protocol = host.includes('localhost') ? 'http' : 'https'
  return `${protocol}://${host}`
}
