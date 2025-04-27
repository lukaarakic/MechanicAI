import { Honeypot, SpamError } from 'remix-utils/honeypot/server'

export const honeypot = new Honeypot({
  validFromFieldName: import.meta.env.TESTING ? null : undefined,
  encryptionSeed: import.meta.env.HONEYPOT_SECRET,
})

export function checkHoneypot(formData: FormData) {
  try {
    honeypot.check(formData)
  } catch (error) {
    if (error instanceof SpamError) {
      throw new Response('Invalid form', { status: 400 })
    }
    throw error
  }
}
