import { notFound } from 'next/navigation'
import Link from 'next/link'
import { db } from '@/lib/db'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

function formatDateTime(date: Date): string {
  return date.toLocaleString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function buildGoogleCalendarUrl(
  title: string,
  startsAt: Date,
  endsAt: Date,
): string {
  const fmt = (d: Date) =>
    d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: title,
    dates: `${fmt(startsAt)}/${fmt(endsAt)}`,
  })
  return `https://calendar.google.com/calendar/render?${params}`
}

export default async function ConfirmationPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const booking = await db.booking.findUnique({
    where: { id },
    include: { provider: true },
  })

  if (!booking || booking.status === 'cancelled') notFound()

  const calendarUrl = buildGoogleCalendarUrl(
    `Appointment with ${booking.provider.name}`,
    booking.startsAt,
    booking.endsAt,
  )

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-lg px-4 py-12">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary text-2xl">
            ✓
          </div>
          <h1 className="text-2xl font-bold text-foreground">Booking confirmed!</h1>
          <p className="mt-1 text-muted-foreground">
            A confirmation email has been sent to {booking.customerEmail}.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Booking details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Provider</span>
              <span className="font-medium">{booking.provider.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Date & time</span>
              <span className="font-medium">{formatDateTime(booking.startsAt)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Name</span>
              <span className="font-medium">{booking.customerName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Email</span>
              <span className="font-medium">{booking.customerEmail}</span>
            </div>
            {booking.notes && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Notes</span>
                <span className="font-medium">{booking.notes}</span>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="mt-6 flex flex-col gap-3">
          <Button asChild variant="outline">
            <a href={calendarUrl} target="_blank" rel="noopener noreferrer">
              Add to Google Calendar
            </a>
          </Button>
          <Button asChild variant="ghost">
            <Link href="/">Browse other providers</Link>
          </Button>
        </div>
      </div>
    </main>
  )
}
