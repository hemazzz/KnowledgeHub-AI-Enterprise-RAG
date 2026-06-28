import { useApp } from '../context/AppContext.jsx'
import { Line } from 'react-chartjs-2'

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
} from 'chart.js'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend
)

function BottomCard({ children }) {
  return (
    <div
      style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: 18,
        padding: 22,
      }}
    >
      {children}
    </div>
  )
}

function SectionHead({ children }) {
  return (
    <div
      style={{
        fontSize: 20,
        fontWeight: 800,
        color: '#ffffff',
        marginBottom: 20,
        display: 'flex',
        alignItems: 'center',
        gap: 12,
      }}
    >
      {children}

      <div
        style={{
          flex: 1,
          height: 1,
          background: 'var(--border)',
        }}
      />
    </div>
  )
}

export function HealthCard() {
  const { stats, sources } = useApp()

  const coverage =
    stats.totalSources > 0 ? 100 : 0

  const freshness =
    stats.lastSync ? 100 : 0

  const accuracy =
    sources.length > 0 ? 95 : 0

  const data = {
    labels: [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
    ],
    datasets: [
      {
        label: 'Coverage',
        data: [
          75,
          80,
          85,
          90,
          95,
          coverage,
        ],
        borderColor: '#8b5cf6',
        backgroundColor:
          'rgba(139,92,246,0.2)',
        tension: 0.4,
      },
      {
        label: 'Freshness',
        data: [
          70,
          78,
          82,
          88,
          94,
          freshness,
        ],
        borderColor: '#3b82f6',
        backgroundColor:
          'rgba(59,130,246,0.2)',
        tension: 0.4,
      },
      {
        label: 'Accuracy',
        data: [
          65,
          72,
          80,
          85,
          90,
          accuracy,
        ],
        borderColor: '#14b8a6',
        backgroundColor:
          'rgba(20,184,166,0.2)',
        tension: 0.4,
      },
    ],
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: '#e2e8f0',
        },
      },
    },
    scales: {
      x: {
        ticks: {
          color: '#94a3b8',
        },
        grid: {
          color:
            'rgba(255,255,255,0.05)',
        },
      },
      y: {
        min: 0,
        max: 100,
        ticks: {
          color: '#94a3b8',
        },
        grid: {
          color:
            'rgba(255,255,255,0.05)',
        },
      },
    },
  }

  return (
    <BottomCard>
      <SectionHead>
        Knowledge Health Trend
      </SectionHead>

      <div
  style={{
    height: '65vh',
    width: '100%',
  }}
>
  <Line data={data} options={options} />
</div>
    </BottomCard>
  )
}

export function AnalyticsCard() {
  const {
    chatHistory,
    stats,
  } = useApp()

  const metrics = [
    {
      num: chatHistory.length,
      label: 'Questions',
    },
    {
      num: stats.totalSources,
      label: 'Sources',
    },
    {
      num:
        (stats.pdfDocuments || 0) +
        (stats.dataFiles || 0),
      label: 'Files Processed',
    },
  ]

  return (
    <BottomCard>
      <SectionHead>
        Analytics Overview
      </SectionHead>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns:
            'repeat(3,1fr)',
          gap: 16,
        }}
      >
        {metrics.map((m) => (
          <div
            key={m.label}
            style={{
              background:
                'rgba(255,255,255,0.03)',
              border:
                '1px solid var(--border)',
              borderRadius: 14,
              padding: 20,
              textAlign: 'center',
            }}
          >
            <div
              style={{
                fontSize: 42,
                fontWeight: 800,
                color: '#fff',
              }}
            >
              {m.num}
            </div>

            <div
              style={{
                color: '#cbd5e1',
                marginTop: 8,
              }}
            >
              {m.label}
            </div>
          </div>
        ))}
      </div>

      <div
        style={{
          marginTop: 24,
          textAlign: 'center',
          color: '#cbd5e1',
        }}
      >
        Last Sync:{' '}
        {stats.lastSync || 'Never'}
      </div>
    </BottomCard>
  )
}

export function HistoryVersionCard() {
  const { chatHistory } = useApp()

  return (
    <BottomCard>
      <SectionHead>
        History
      </SectionHead>

      {chatHistory.length === 0 ? (
        <div
          style={{
            textAlign: 'center',
            color: '#cbd5e1',
            padding: '20px 0',
          }}
        >
          No conversations yet.
        </div>
      ) : (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
            maxHeight: 300,
            overflowY: 'auto',
          }}
        >
          {chatHistory
            .slice(0, 5)
            .map((item) => (
              <div
                key={item.id}
                style={{
                  background:
                    'rgba(255,255,255,0.03)',
                  border:
                    '1px solid var(--border)',
                  borderRadius: 12,
                  padding: 14,
                }}
              >
                <div
                  style={{
                    color: '#fff',
                    fontWeight: 700,
                    marginBottom: 6,
                  }}
                >
                  {item.question}
                </div>

                <div
                  style={{
                    color: '#94a3b8',
                    fontSize: 13,
                  }}
                >
                  {item.date}
                </div>
              </div>
            ))}
        </div>
      )}
    </BottomCard>
  )
}