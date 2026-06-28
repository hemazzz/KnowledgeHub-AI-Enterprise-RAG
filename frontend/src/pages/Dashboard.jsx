import { useApp } from '../context/AppContext.jsx'
import StatCards from '../components/StatCards.jsx'
import QuickActions from '../components/QuickActions.jsx'
import {
  DonutChart,
  RecentUpdates,
} from '../components/RightPanel.jsx'

export default function DashboardPage() {
  const { stats } = useApp()

  return (
    <>
      <StatCards stats={stats} />

      <QuickActions />

      {/* Main Chat Card */}
      <div
        style={{
          marginBottom: 16,
        }}
      >
        <div
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: 16,
            minHeight: 450,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#64748b',
            fontSize: 22,
            fontWeight: 600,
          }}
        >
          Open the Chat section to ask questions about
          your uploaded documents.
        </div>
      </div>

      {/* Bottom Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 12,
        }}
      >
        <DonutChart />
        <RecentUpdates />
      
      </div>
    </>
  )
}