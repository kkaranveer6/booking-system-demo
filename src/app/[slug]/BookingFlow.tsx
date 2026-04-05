'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { getAvailableSlots, type AvailabilityWindow } from '@/lib/slots'

interface TimeSlot {
  startsAt: string
  endsAt: string
}

interface BookingFlowProps {
  providerSlug: string
  availability: AvailabilityWindow[]
}

function formatTime(isoString: string): string {
  return new Date(isoString).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function BookingFlow({ providerSlug, availability }: BookingFlowProps) {
  const router = useRouter()
  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [selectedDate, setSelectedDate] = useState('')
  const [slots, setSlots] = useState<TimeSlot[]>([])
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [notes, setNotes] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [today, setToday] = useState('')

  useEffect(() => {
    setToday(new Date().toLocaleDateString('en-CA'))
  }, [])

  const availableDaysOfWeek = [...new Set(availability.map((w) => w.dayOfWeek))].sort()

  function handleFindSlots() {
    if (!selectedDate) return
    const date = new Date(`${selectedDate}T00:00:00`)
    const rawSlots = getAvailableSlots(availability, [], date)
    setSlots(
      rawSlots.map((s) => ({
        startsAt: s.startsAt.toISOString(),
        endsAt: s.endsAt.toISOString(),
      })),
    )
    setStep(2)
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedSlot) return
    setSubmitting(true)
    try {
      const params = new URLSearchParams({
        provider: providerSlug,
        date: selectedDate,
        time: selectedSlot.startsAt,
        name,
        email,
        ...(notes ? { notes } : {}),
      })
      router.push(`/booking/confirm?${params}`)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="rounded-xl border bg-card p-6 shadow-sm">
      {/* Step 1: Pick a date */}
      {step === 1 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Pick a date</h2>
          <div className="space-y-1">
            <Label htmlFor="date">Date</Label>
            <Input
              id="date"
              type="date"
              min={today}
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
            />
            {availableDaysOfWeek.length > 0 && (
              <p className="text-xs text-muted-foreground">
                Available on:{' '}
                {availableDaysOfWeek
                  .map((d) => ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][d])
                  .join(', ')}
              </p>
            )}
          </div>
          <Button
            onClick={handleFindSlots}
            disabled={!selectedDate}
            className="w-full"
          >
            Find available times
          </Button>
        </div>
      )}

      {/* Step 2: Pick a slot */}
      {step === 2 && (
        <div className="space-y-4">
          <div className="flex flex-col items-start gap-2">
            <button
              onClick={() => setStep(1)}
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              ← Back
            </button>
            <h2 className="text-lg font-semibold">
              Available times for {selectedDate}
            </h2>
          </div>

          {slots.length === 0 ? (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                No available slots on this day. Please pick another date.
              </p>
              <Button variant="outline" onClick={() => setStep(1)}>
                Pick another date
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-2">
              {slots.map((slot) => (
                <button
                  key={slot.startsAt}
                  onClick={() => {
                    setSelectedSlot(slot)
                    setStep(3)
                  }}
                  className="rounded-md border border-input px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground transition-colors"
                >
                  {formatTime(slot.startsAt)}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Step 3: Enter details */}
      {step === 3 && selectedSlot && (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex flex-col items-start gap-2">
            <button
              type="button"
              onClick={() => setStep(2)}
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              ← Back
            </button>
            <h2 className="text-lg font-semibold">Your details</h2>
          </div>

          <p className="text-sm text-muted-foreground">
            Booking for{' '}
            <span className="font-medium text-foreground">
              {selectedDate} at {formatTime(selectedSlot.startsAt)}
            </span>
          </p>

          <div className="space-y-1">
            <Label htmlFor="name">Full name</Label>
            <Input
              id="name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Alice Martin"
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="alice@example.com"
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="notes">Notes (optional)</Label>
            <Input
              id="notes"
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Anything you'd like the provider to know"
            />
          </div>

          <Button type="submit" disabled={submitting} className="w-full">
            {submitting ? 'Confirming...' : 'Confirm booking'}
          </Button>
        </form>
      )}
    </div>
  )
}
