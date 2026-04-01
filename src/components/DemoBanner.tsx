export function DemoBanner() {
  if (process.env.NEXT_PUBLIC_DEMO_BANNER !== 'true') return null

  return (
    <div className="w-full bg-neutral-900 py-2 text-center text-xs text-neutral-400">
      This is a demo project — providers and bookings are sample data
    </div>
  )
}
