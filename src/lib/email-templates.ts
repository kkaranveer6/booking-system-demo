interface BookingEmailVars {
  providerName: string
  customerName: string
  customerEmail: string
  dateTime: string
  bookingUrl: string
}

export function getCustomerConfirmationEmail(
  vars: BookingEmailVars,
): { subject: string; body: string } {
  return {
    subject: `Your booking with ${vars.providerName} is confirmed`,
    body: `Hi ${vars.customerName},

Your appointment with ${vars.providerName} has been confirmed.

Date & Time: ${vars.dateTime}

View your booking: ${vars.bookingUrl}

See you soon!`,
  }
}

export function getProviderNotificationEmail(
  vars: BookingEmailVars,
): { subject: string; body: string } {
  return {
    subject: `New booking from ${vars.customerName}`,
    body: `You have a new booking.

Customer: ${vars.customerName} (${vars.customerEmail})
Date & Time: ${vars.dateTime}

View booking: ${vars.bookingUrl}`,
  }
}
