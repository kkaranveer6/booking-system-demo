export interface TimeSlot {
  startsAt: Date
  endsAt: Date
}

interface AvailabilityWindow {
  dayOfWeek: number
  startTime: string
  endTime: string
}

interface Booking {
  startsAt: Date
  endsAt: Date
}

const SLOT_DURATION_MS = 30 * 60 * 1000

/**
 * Returns available 30-min slots for `date`, excluding windows that overlap existing bookings.
 *
 * IMPORTANT: `date` must be constructed with a local-time component (e.g. `new Date(\`${dateParam}T00:00:00\`)`)
 * to ensure getDay() and date extraction reflect the correct local calendar day.
 * Do NOT pass a date-only ISO string (e.g. `new Date('2025-01-06')`) as it parses as UTC midnight.
 */
export function getAvailableSlots(
  windows: AvailabilityWindow[],
  bookings: Booking[],
  date: Date,
): TimeSlot[] {
  const dayOfWeek = date.getDay()
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const dateStr = `${year}-${month}-${day}`

  const matchingWindows = windows.filter((w) => w.dayOfWeek === dayOfWeek)
  const slots: TimeSlot[] = []

  for (const window of matchingWindows) {
    const windowStart = new Date(`${dateStr}T${window.startTime}:00`)
    const windowEnd = new Date(`${dateStr}T${window.endTime}:00`)

    let current = new Date(windowStart)
    while (current.getTime() + SLOT_DURATION_MS <= windowEnd.getTime()) {
      const slotStart = new Date(current)
      const slotEnd = new Date(current.getTime() + SLOT_DURATION_MS)

      const isBooked = bookings.some(
        (b) => b.startsAt < slotEnd && b.endsAt > slotStart,
      )

      if (!isBooked) {
        slots.push({ startsAt: slotStart, endsAt: slotEnd })
      }

      current = slotEnd
    }
  }

  return slots
}
