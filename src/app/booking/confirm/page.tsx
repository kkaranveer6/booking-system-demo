'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

function formatDateTime(isoString: string): string {
  return new Date(isoString).toLocaleString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function buildGoogleCalendarUrl(title: string, startsAt: string): string {
  const start = new Date(startsAt)
  const end = new Date(start.getTime() + 30 * 60 * 1000)
  const fmt = (d: Date) =>
    d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: title,
    dates: `${fmt(start)}/${fmt(end)}`,
  })
  return `https://calendar.google.com/calendar/render?${params}`
}

function ConfirmContent() {
  const params = useSearchParams()
  const providerSlug = params.get('provider') ?? ''
  const name = params.get('name') ?? ''
  const email = params.get('email') ?? ''
  const time = params.get('time') ?? ''
  const notes = params.get('notes')

  const providerName = providerSlug
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')

  const calendarUrl = buildGoogleCalendarUrl(
    `Appointment with ${providerName}`,
    time,
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
            This is a demo — no real appointment was booked.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Booking details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Provider</span>
              <span className="font-medium">{providerName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Date & time</span>
              <span className="font-medium">
                {time ? formatDateTime(time) : '—'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Name</span>
              <span className="font-medium">{name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Email</span>
              <span className="font-medium">{email}</span>
            </div>
            {notes && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Notes</span>
                <span className="font-medium">{notes}</span>
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

export default function ConfirmPage() {
  return (
    <Suspense>
      <ConfirmContent />
    </Suspense>
  )
}
