'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface TimeSlot {
  startsAt: string
  endsAt: string
}

interface BookingFlowProps {
  providerSlug: string
  availableDaysOfWeek: number[]
}

function formatTime(isoString: string): string {
  return new Date(isoString).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function BookingFlow({ providerSlug, availableDaysOfWeek }: BookingFlowProps) {
  const router = useRouter()
  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [selectedDate, setSelectedDate] = useState('')
  const [slots, setSlots] = useState<TimeSlot[]>([])
  const [loadingSlots, setLoadingSlots] = useState(false)
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [notes, setNotes] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleFindSlots() {
    if (!selectedDate) return
    setLoadingSlots(true)
    setError(null)
    try {
      const res = await fetch(
        `/api/providers/${providerSlug}/slots?date=${selectedDate}`,
      )
      const data = await res.json()
      setSlots(data.slots ?? [])
      setStep(2)
    } catch {
      setError('Failed to load available times. Please try again.')
    } finally {
      setLoadingSlots(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedSlot) return
    setSubmitting(true)
    setError(null)
    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          providerSlug,
          startsAt: selectedSlot.startsAt,
          customerName: name,
          customerEmail: email,
          notes: notes || undefined,
        }),
      })
      if (res.status === 409) {
        setError('This slot was just taken. Please go back and pick another time.')
        return
      }
      if (!res.ok) {
        setError('Something went wrong. Please try again.')
        return
      }
      const { bookingId } = await res.json()
      router.push(`/booking/${bookingId}`)
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  // Today's date as YYYY-MM-DD for min attribute
  const today = new Date().toISOString().split('T')[0]

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
                  .map((d) =>
                    ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][d],
                  )
                  .join(', ')}
              </p>
            )}
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button
            onClick={handleFindSlots}
            disabled={!selectedDate || loadingSlots}
            className="w-full"
          >
            {loadingSlots ? 'Loading...' : 'Find available times'}
          </Button>
        </div>
      )}

      {/* Step 2: Pick a slot */}
      {step === 2 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
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
          <div className="flex items-center gap-2">
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

          {error && <p className="text-sm text-destructive">{error}</p>}

          <Button type="submit" disabled={submitting} className="w-full">
            {submitting ? 'Confirming...' : 'Confirm booking'}
          </Button>
        </form>
      )}
    </div>
  )
}
