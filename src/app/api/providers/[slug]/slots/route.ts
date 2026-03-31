import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getAvailableSlots } from '@/lib/slots'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params
  const dateParam = req.nextUrl.searchParams.get('date')

  if (!dateParam || !/^\d{4}-\d{2}-\d{2}$/.test(dateParam)) {
    return NextResponse.json(
      { error: 'date query param required (YYYY-MM-DD)' },
      { status: 400 },
    )
  }

  const provider = await db.provider.findUnique({
    where: { slug },
    include: { availability: true },
  })

  if (!provider) {
    return NextResponse.json({ error: 'Provider not found' }, { status: 404 })
  }

  const date = new Date(`${dateParam}T00:00:00`)
  const startOfDay = new Date(`${dateParam}T00:00:00`)
  const endOfDay = new Date(`${dateParam}T23:59:59`)

  const bookings = await db.booking.findMany({
    where: {
      providerId: provider.id,
      status: 'confirmed',
      startsAt: { gte: startOfDay, lte: endOfDay },
    },
  })

  const slots = getAvailableSlots(provider.availability, bookings, date)

  return NextResponse.json({
    slots: slots.map((s) => ({
      startsAt: s.startsAt.toISOString(),
      endsAt: s.endsAt.toISOString(),
    })),
  })
}
