import { NewsHighlights } from '@/components/home/NewsHighlights'
import { MatchesSection } from '@/components/home/MatchesSection'
import { StandingsWidget } from '@/components/home/StandingsWidget'

export default function Home() {
  return (
    <div className="mx-auto max-w-7xl space-y-12 px-4 py-10">
      <NewsHighlights />
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <MatchesSection />
        </div>
        <div className="lg:col-span-1">
          <StandingsWidget />
        </div>
      </div>
    </div>
  )
}
