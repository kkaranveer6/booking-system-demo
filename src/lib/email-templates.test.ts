import { describe, it, expect } from 'vitest'
import {
  getCustomerConfirmationEmail,
  getProviderNotificationEmail,
} from './email-templates'

const vars = {
  providerName: 'Jane Smith',
  customerName: 'Alice Martin',
  customerEmail: 'alice@example.com',
  dateTime: 'Monday, January 6, 2025 at 09:00 AM',
  bookingUrl: 'http://localhost:3000/booking/abc123',
}

describe('getCustomerConfirmationEmail', () => {
  it('includes provider name in subject', () => {
    const { subject } = getCustomerConfirmationEmail(vars)
    expect(subject).toContain('Jane Smith')
  })

  it('includes customer name, date/time, and booking URL in body', () => {
    const { body } = getCustomerConfirmationEmail(vars)
    expect(body).toContain('Alice Martin')
    expect(body).toContain('Monday, January 6, 2025 at 09:00 AM')
    expect(body).toContain('http://localhost:3000/booking/abc123')
  })
})

describe('getProviderNotificationEmail', () => {
  it('includes customer name in subject', () => {
    const { subject } = getProviderNotificationEmail(vars)
    expect(subject).toContain('Alice Martin')
  })

  it('includes customer name, email, date/time, and booking URL in body', () => {
    const { body } = getProviderNotificationEmail(vars)
    expect(body).toContain('Alice Martin')
    expect(body).toContain('alice@example.com')
    expect(body).toContain('Monday, January 6, 2025 at 09:00 AM')
    expect(body).toContain('http://localhost:3000/booking/abc123')
  })
})
