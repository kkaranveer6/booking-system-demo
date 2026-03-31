import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockProviderFindUnique = vi.hoisted(() => vi.fn())
const mockBookingFindFirst = vi.hoisted(() => vi.fn())
const mockBookingCreate = vi.hoisted(() => vi.fn())
const mockSendEmail = vi.hoisted(() => vi.fn())

vi.mock('@/lib/db', () => ({
  db: {
    provider: { findUnique: mockProviderFindUnique },
    booking: {
      findFirst: mockBookingFindFirst,
      create: mockBookingCreate,
    },
  },
}))

vi.mock('@/lib/email', () => ({
  sendEmail: mockSendEmail,
}))

import { POST } from './route'
import { NextRequest } from 'next/server'

function makeRequest(body: Record<string, unknown>) {
  return new NextRequest('http://localhost:3000/api/bookings', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  })
}

const validBody = {
  providerSlug: 'jane-smith',
  startsAt: '2025-01-06T09:00:00',
  customerName: 'Alice Martin',
  customerEmail: 'alice@example.com',
}

const mockProvider = {
  id: 'provider_1',
  name: 'Jane Smith',
  slug: 'jane-smith',
  email: 'jane@example.com',
}

describe('POST /api/bookings', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockSendEmail.mockResolvedValue(undefined)
  })

  it('returns 400 when required fields are missing', async () => {
    const res = await POST(makeRequest({ providerSlug: 'jane-smith' }))
    expect(res.status).toBe(400)
  })

  it('returns 404 when provider does not exist', async () => {
    mockProviderFindUnique.mockResolvedValue(null)
    const res = await POST(makeRequest(validBody))
    expect(res.status).toBe(404)
  })

  it('returns 409 when slot is already booked', async () => {
    mockProviderFindUnique.mockResolvedValue(mockProvider)
    mockBookingFindFirst.mockResolvedValue({ id: 'existing_booking' })

    const res = await POST(makeRequest(validBody))
    expect(res.status).toBe(409)
  })

  it('creates booking and returns 201 with bookingId', async () => {
    mockProviderFindUnique.mockResolvedValue(mockProvider)
    mockBookingFindFirst.mockResolvedValue(null)
    mockBookingCreate.mockResolvedValue({ id: 'new_booking_123' })

    const res = await POST(makeRequest(validBody))

    expect(res.status).toBe(201)
    const body = await res.json()
    expect(body.bookingId).toBe('new_booking_123')
    expect(mockBookingCreate).toHaveBeenCalledWith({
      data: expect.objectContaining({
        providerId: 'provider_1',
        customerName: 'Alice Martin',
        customerEmail: 'alice@example.com',
      }),
    })
  })

  it('fires emails after booking is created', async () => {
    mockProviderFindUnique.mockResolvedValue(mockProvider)
    mockBookingFindFirst.mockResolvedValue(null)
    mockBookingCreate.mockResolvedValue({ id: 'new_booking_123' })

    await POST(makeRequest(validBody))

    // Allow the fire-and-forget promise to settle
    await new Promise((r) => setTimeout(r, 10))

    expect(mockSendEmail).toHaveBeenCalledTimes(2)
    const calls = mockSendEmail.mock.calls.map((c) => c[0].to)
    expect(calls).toContain('alice@example.com')
    expect(calls).toContain('jane@example.com')
  })
})
