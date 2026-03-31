import { Resend } from 'resend'

interface SendEmailParams {
  to: string
  subject: string
  body: string
}

let _resend: Resend | null = null

function getResendClient(): Resend {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) throw new Error('RESEND_API_KEY is not set')
  if (!_resend) _resend = new Resend(apiKey)
  return _resend
}

export async function sendEmail({ to, subject, body }: SendEmailParams): Promise<void> {
  const from = process.env.RESEND_FROM_EMAIL
  if (!from) throw new Error('RESEND_FROM_EMAIL is not set')

  const resend = getResendClient()
  const { error } = await resend.emails.send({ from, to, subject, text: body })

  if (error) throw new Error(error.message)
}
