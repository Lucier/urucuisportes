import { NewsHighlights } from '@/components/home/NewsHighlights'
import { MatchesSection } from '@/components/home/MatchesSection'
import { StandingsWidget } from '@/components/home/StandingsWidget'

export default function Home() {
  return (
    <div className="mx-auto max-w-7xl space-y-8 px-4 py-6 sm:space-y-12 sm:py-10">
      <NewsHighlights />
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3 lg:gap-10">
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
