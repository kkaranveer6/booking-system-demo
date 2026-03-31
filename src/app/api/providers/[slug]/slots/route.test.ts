import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockProviderFindUnique = vi.hoisted(() => vi.fn())
const mockBookingFindMany = vi.hoisted(() => vi.fn())

vi.mock('@/lib/db', () => ({
  db: {
    provider: { findUnique: mockProviderFindUnique },
    booking: { findMany: mockBookingFindMany },
  },
}))

import { GET } from './route'
import { NextRequest } from 'next/server'

function makeRequest(slug: string, date?: string) {
  const url = `http://localhost:3000/api/providers/${slug}/slots${date ? `?date=${date}` : ''}`
  return new NextRequest(url)
}

const mockProvider = {
  id: 'provider_1',
  slug: 'jane-smith',
  availability: [{ dayOfWeek: 1, startTime: '09:00', endTime: '11:00' }],
}

describe('GET /api/providers/[slug]/slots', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockBookingFindMany.mockResolvedValue([])
  })

  it('returns 400 when date param is missing', async () => {
    const res = await GET(makeRequest('jane-smith'), {
      params: Promise.resolve({ slug: 'jane-smith' }),
    })
    expect(res.status).toBe(400)
  })

  it('returns 400 when date param is not YYYY-MM-DD format', async () => {
    const res = await GET(makeRequest('jane-smith', '06-01-2025'), {
      params: Promise.resolve({ slug: 'jane-smith' }),
    })
    expect(res.status).toBe(400)
  })

  it('returns 404 when provider is not found', async () => {
    mockProviderFindUnique.mockResolvedValue(null)
    const res = await GET(makeRequest('unknown', '2025-01-06'), {
      params: Promise.resolve({ slug: 'unknown' }),
    })
    expect(res.status).toBe(404)
  })

  it('returns available slots for a valid date', async () => {
    mockProviderFindUnique.mockResolvedValue(mockProvider)

    const res = await GET(makeRequest('jane-smith', '2025-01-06'), {
      params: Promise.resolve({ slug: 'jane-smith' }),
    })

    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.slots).toHaveLength(4)
    expect(body.slots[0].startsAt).toBe('2025-01-05T22:30:00.000Z')
  })

  it('excludes slots that are already booked', async () => {
    mockProviderFindUnique.mockResolvedValue(mockProvider)
    mockBookingFindMany.mockResolvedValue([
      {
        startsAt: new Date('2025-01-06T09:00:00'),
        endsAt: new Date('2025-01-06T09:30:00'),
      },
    ])

    const res = await GET(makeRequest('jane-smith', '2025-01-06'), {
      params: Promise.resolve({ slug: 'jane-smith' }),
    })

    const body = await res.json()
    expect(body.slots).toHaveLength(3)
  })
})
