import { type ReactElement } from 'react'
import { Resend } from 'resend'

const resend = new Resend(import.meta.env.VITE_RESEND_API_KEY)

export async function sendEmail({
  to,
  subject,
  react,
}: {
  to: string
  subject: string
  react: ReactElement
}) {
  const from = 'team@mechanicai.app'

  const { error } = await resend.emails.send({
    from,
    to,
    subject,
    react,
  })

  if (error) return { status: 'error', error: error }

  return { status: 'success' } as const
}
