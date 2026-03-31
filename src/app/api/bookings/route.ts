import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { sendEmail } from '@/lib/email'
import {
  getCustomerConfirmationEmail,
  getProviderNotificationEmail,
} from '@/lib/email-templates'

const SLOT_DURATION_MS = 30 * 60 * 1000

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { providerSlug, startsAt, customerName, customerEmail, notes } = body

  if (!providerSlug || !startsAt || !customerName || !customerEmail) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const provider = await db.provider.findUnique({ where: { slug: providerSlug } })
  if (!provider) {
    return NextResponse.json({ error: 'Provider not found' }, { status: 404 })
  }

  const start = new Date(startsAt)
  if (isNaN(start.getTime())) {
    return NextResponse.json({ error: 'startsAt must be a valid ISO date string' }, { status: 400 })
  }
  const end = new Date(start.getTime() + SLOT_DURATION_MS)

  const conflict = await db.booking.findFirst({
    where: {
      providerId: provider.id,
      status: 'confirmed',
      startsAt: { lt: end },
      endsAt: { gt: start },
    },
  })

  if (conflict) {
    return NextResponse.json(
      { error: 'This slot is no longer available' },
      { status: 409 },
    )
  }

  const booking = await db.booking.create({
    data: {
      providerId: provider.id,
      customerName,
      customerEmail,
      startsAt: start,
      endsAt: end,
      notes: notes ?? null,
    },
  })

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL
  if (!baseUrl) throw new Error('NEXT_PUBLIC_BASE_URL is not set')
  const bookingUrl = `${baseUrl}/booking/${booking.id}`
  const dateTime = start.toLocaleString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

  const emailVars = {
    providerName: provider.name,
    customerName,
    customerEmail,
    dateTime,
    bookingUrl,
  }

  Promise.all([
    sendEmail({ to: customerEmail, ...getCustomerConfirmationEmail(emailVars) }),
    sendEmail({ to: provider.email, ...getProviderNotificationEmail(emailVars) }),
  ]).catch((err) => console.error('Email send failed:', err))

  return NextResponse.json({ bookingId: booking.id }, { status: 201 })
}
