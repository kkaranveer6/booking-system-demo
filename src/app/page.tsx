import Link from 'next/link'
import { db } from '@/lib/db'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default async function HomePage() {
  const providers = await db.provider.findMany({
    orderBy: { name: 'asc' },
  })

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-4xl px-4 py-12">
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-foreground">Find a Provider</h1>
          <p className="mt-2 text-muted-foreground">
            Browse available providers and book your appointment in minutes.
          </p>
        </div>

        {providers.length === 0 ? (
          <p className="text-muted-foreground">No providers available yet.</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {providers.map((provider) => (
              <Card key={provider.id}>
                <CardHeader>
                  <CardTitle>{provider.name}</CardTitle>
                  <CardDescription className="line-clamp-3">{provider.bio}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button asChild className="w-full">
                    <Link href={`/${provider.slug}`}>Book</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
