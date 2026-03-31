/**
 * Seed script: creates 3 providers with weekly availability windows.
 *
 * Run:   npm run seed
 * Reset: npm run seed:reset
 */

import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

import { PrismaClient } from '@prisma/client'

const db = new PrismaClient()

const providers = [
  {
    name: 'Jane Smith',
    slug: 'jane-smith',
    bio: 'Licensed therapist with 10 years of experience in cognitive behavioural therapy.',
    email: 'jane@example.com',
    imageUrl: null,
    availability: [
      // Mon–Fri 9am–12pm
      { dayOfWeek: 1, startTime: '09:00', endTime: '12:00' },
      { dayOfWeek: 2, startTime: '09:00', endTime: '12:00' },
      { dayOfWeek: 3, startTime: '09:00', endTime: '12:00' },
      { dayOfWeek: 4, startTime: '09:00', endTime: '12:00' },
      { dayOfWeek: 5, startTime: '09:00', endTime: '12:00' },
    ],
  },
  {
    name: 'Marcus Lee',
    slug: 'marcus-lee',
    bio: 'Personal trainer specialising in strength and conditioning for all fitness levels.',
    email: 'marcus@example.com',
    imageUrl: null,
    availability: [
      // Mon/Wed/Fri 7am–9am and 5pm–7pm
      { dayOfWeek: 1, startTime: '07:00', endTime: '09:00' },
      { dayOfWeek: 1, startTime: '17:00', endTime: '19:00' },
      { dayOfWeek: 3, startTime: '07:00', endTime: '09:00' },
      { dayOfWeek: 3, startTime: '17:00', endTime: '19:00' },
      { dayOfWeek: 5, startTime: '07:00', endTime: '09:00' },
      { dayOfWeek: 5, startTime: '17:00', endTime: '19:00' },
    ],
  },
  {
    name: 'Sofia Reyes',
    slug: 'sofia-reyes',
    bio: 'Certified life coach helping professionals navigate career transitions and set goals.',
    email: 'sofia@example.com',
    imageUrl: null,
    availability: [
      // Tue/Thu 10am–4pm
      { dayOfWeek: 2, startTime: '10:00', endTime: '16:00' },
      { dayOfWeek: 4, startTime: '10:00', endTime: '16:00' },
    ],
  },
]

async function reset() {
  for (const p of providers) {
    const existing = await db.provider.findUnique({ where: { slug: p.slug } })
    if (!existing) continue
    await db.booking.deleteMany({ where: { providerId: existing.id } })
    await db.availabilityWindow.deleteMany({ where: { providerId: existing.id } })
    await db.provider.delete({ where: { slug: p.slug } })
  }
  console.log('Seed data deleted.')
}

async function seed() {
  for (const { availability, ...providerData } of providers) {
    const provider = await db.provider.upsert({
      where: { slug: providerData.slug },
      update: providerData,
      create: providerData,
    })

    await db.availabilityWindow.deleteMany({ where: { providerId: provider.id } })
    await db.availabilityWindow.createMany({
      data: availability.map((w) => ({ ...w, providerId: provider.id })),
    })

    console.log(`Seeded: ${provider.name} (${availability.length} windows)`)
  }

  console.log(`\nSeeded ${providers.length} providers.`)
}

async function main() {
  const doReset = process.argv.includes('--reset')
  if (doReset) {
    await reset()
  } else {
    await seed()
  }
  await db.$disconnect()
}

main().catch(async (err) => {
  console.error(err)
  await db.$disconnect()
  process.exit(1)
})
