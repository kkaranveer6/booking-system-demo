import { notFound } from 'next/navigation'
import Link from 'next/link'
import { db } from '@/lib/db'
import { BookingFlow } from './BookingFlow'

export default async function ProviderPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params

  const provider = await db.provider.findUnique({
    where: { slug },
    include: { availability: true },
  })

  if (!provider) notFound()

  const availableDaysOfWeek = [
    ...new Set(provider.availability.map((w) => w.dayOfWeek)),
  ].sort()

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-2xl px-4 py-12">
        <Link
          href="/"
          className="mb-8 inline-block text-sm text-muted-foreground hover:text-foreground"
        >
          ← All providers
        </Link>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">{provider.name}</h1>
          <p className="mt-3 text-muted-foreground">{provider.bio}</p>
        </div>

        <BookingFlow
          providerSlug={provider.slug}
          availableDaysOfWeek={availableDaysOfWeek}
        />
      </div>
    </main>
  )
}
