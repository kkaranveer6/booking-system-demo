import { describe, it, expect } from 'vitest'
import { getAvailableSlots } from './slots'

const monday = new Date('2025-01-06T00:00:00') // Monday
const tuesday = new Date('2025-01-07T00:00:00') // Tuesday

const windowMonday9to11 = { dayOfWeek: 1, startTime: '09:00', endTime: '11:00' }
const windowMonday14to15 = { dayOfWeek: 1, startTime: '14:00', endTime: '15:00' }

describe('getAvailableSlots', () => {
  it('returns empty array when no windows match the day', () => {
    const slots = getAvailableSlots([windowMonday9to11], [], tuesday)
    expect(slots).toEqual([])
  })

  it('generates 30-min slots for a matching window', () => {
    const slots = getAvailableSlots([windowMonday9to11], [], monday)
    expect(slots).toHaveLength(4)
    expect(slots[0].startsAt).toEqual(new Date('2025-01-06T09:00:00'))
    expect(slots[0].endsAt).toEqual(new Date('2025-01-06T09:30:00'))
    expect(slots[3].startsAt).toEqual(new Date('2025-01-06T10:30:00'))
    expect(slots[3].endsAt).toEqual(new Date('2025-01-06T11:00:00'))
  })

  it('excludes a slot that is already booked', () => {
    const booking = {
      startsAt: new Date('2025-01-06T09:00:00'),
      endsAt: new Date('2025-01-06T09:30:00'),
    }
    const slots = getAvailableSlots([windowMonday9to11], [booking], monday)
    expect(slots).toHaveLength(3)
    expect(slots[0].startsAt).toEqual(new Date('2025-01-06T09:30:00'))
  })

  it('excludes a slot that is partially overlapped by a booking', () => {
    // Booking covers 09:15–09:45, overlaps the 09:00 and 09:30 slots
    const booking = {
      startsAt: new Date('2025-01-06T09:15:00'),
      endsAt: new Date('2025-01-06T09:45:00'),
    }
    const slots = getAvailableSlots([windowMonday9to11], [booking], monday)
    expect(slots).toHaveLength(2)
    expect(slots[0].startsAt).toEqual(new Date('2025-01-06T10:00:00'))
  })

  it('combines slots from multiple windows on the same day', () => {
    const slots = getAvailableSlots(
      [windowMonday9to11, windowMonday14to15],
      [],
      monday,
    )
    // 4 slots from 09:00–11:00, 2 slots from 14:00–15:00
    expect(slots).toHaveLength(6)
    expect(slots[4].startsAt).toEqual(new Date('2025-01-06T14:00:00'))
  })

  it('returns empty array when all slots are booked', () => {
    const bookings = [
      { startsAt: new Date('2025-01-06T09:00:00'), endsAt: new Date('2025-01-06T11:00:00') },
    ]
    const slots = getAvailableSlots([windowMonday9to11], bookings, monday)
    expect(slots).toEqual([])
  })
})
