import { prisma } from '~/utils/db.server'
import { generateTOTP, verifyTOTP } from '@epic-web/totp'
import { getDomainUrl } from '~/utils/misc'
import {
  codeQueryParam,
  redirectToQueryParam,
  targetQueryParam,
  typeQueryParam,
  VerificationTypes,
} from '~/routes/_auth+/verify'

export function getRedirectToUrl({
  request,
  type,
  target,
  redirectTo,
}: {
  request: Request
  type: VerificationTypes
  target: string
  redirectTo?: string
}) {
  const redirectToUrl = new URL(`${getDomainUrl(request)}/verify`)
  redirectToUrl.searchParams.set(typeQueryParam, type)
  redirectToUrl.searchParams.set(targetQueryParam, target)
  if (redirectTo) {
    redirectToUrl.searchParams.set(redirectToQueryParam, redirectTo)
  }
  return redirectToUrl
}

export async function prepareVerification({
  period,
  request,
  type,
  target,
  redirectTo: postVerificationRedirectTo,
}: {
  period: number
  request: Request
  type: VerificationTypes
  target: string
  redirectTo?: string
}) {
  const verifyUrl = getRedirectToUrl({
    request,
    type,
    target,
    redirectTo: postVerificationRedirectTo,
  })
  const redirectTo = new URL(verifyUrl.toString())

  const { otp, ...verificationConfig } = generateTOTP({
    algorithm: 'SHA256',
    period,
  })

  const verificationData = {
    type,
    target,
    ...verificationConfig,
    expiresAt: new Date(Date.now() + verificationConfig.period * 1000),
  }

  await prisma.verification.upsert({
    where: { target_type: { target, type } },
    create: verificationData,
    update: verificationData,
  })

  verifyUrl.searchParams.set(codeQueryParam, otp)

  return { otp, redirectTo, verifyUrl }
}

export async function isCodeValid({
  code,
  type,
  target,
}: {
  code: string
  type: VerificationTypes
  target: string
}) {
  const verification = await prisma.verification.findUnique({
    where: {
      target_type: { target, type },
      OR: [{ expiresAt: { gt: new Date() } }, { expiresAt: null }],
    },
    select: { algorithm: true, secret: true, period: true, charSet: true },
  })
  if (!verification) return false

  const result = verifyTOTP({
    otp: code,
    secret: verification.secret,
    algorithm: verification.algorithm,
    period: verification.period,
    charSet: verification.charSet,
  })
  if (!result) return false

  return true
}
