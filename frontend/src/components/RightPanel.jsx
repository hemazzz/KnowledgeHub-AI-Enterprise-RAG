import { Icons } from '../assets/icons.jsx'
import { useApp } from '../context/AppContext.jsx'

function PanelCard({
  title,
  icon,
  iconColor,
  children,
}) {
  return (
    <div
      style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: 16,
        padding: 20,
      }}
    >
      <div
        style={{
          fontSize: 17,
          fontWeight: 700,
          color: '#fff',
          marginBottom: 18,
          display: 'flex',
          alignItems: 'center',
          gap: 10,
        }}
      >
        <span
          style={{
            width: 20,
            height: 20,
            color: iconColor,
          }}
        >
          {Icons[icon]}
        </span>

        {title}
      </div>

      {children}
    </div>
  )
}

export function DonutChart() {
  const { stats } = useApp()

  const total =
    stats.totalSources || 1

  const pdf =
    Math.round(
      (stats.pdfDocuments /
        total) *
        100
    ) || 0

  const web =
    Math.round(
      (stats.webPages /
        total) *
        100
    ) || 0

  const data =
    Math.round(
      ((stats.dataFiles || 0) /
        total) *
        100
    ) || 0

  return (
    <PanelCard
      title="Knowledge Sources"
      icon="sources"
      iconColor="var(--purple2)"
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
        }}
      >
        <SourceBar
          label="PDF Documents"
          value={pdf}
          color="var(--purple)"
        />

        <SourceBar
          label="Web Pages"
          value={web}
          color="var(--blue)"
        />

        <SourceBar
          label="Data Files"
          value={data}
          color="var(--teal)"
        />

        <div
          style={{
            textAlign: 'center',
            color: '#cbd5e1',
            marginTop: 10,
          }}
        >
          Total Sources:{' '}
          {stats.totalSources}
        </div>
      </div>
    </PanelCard>
  )
}

function SourceBar({
  label,
  value,
  color,
}) {
  return (
    <div>
      <div
        style={{
          display: 'flex',
          justifyContent:
            'space-between',
          marginBottom: 6,
          color: '#fff',
          fontSize: 13,
        }}
      >
        <span>{label}</span>
        <span>{value}%</span>
      </div>

      <div
        style={{
          height: 8,
          background:
            'rgba(255,255,255,0.08)',
          borderRadius: 999,
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            width: `${value}%`,
            height: '100%',
            background: color,
          }}
        />
      </div>
    </div>
  )
}

export function RecentUpdates() {
  const { sources } = useApp()

  const recent = [...sources]
    .reverse()
    .slice(0, 4)

  return (
    <PanelCard
      title="Recent Updates"
      icon="refresh"
      iconColor="var(--blue2)"
    >
      {recent.length === 0 ? (
        <div
          style={{
            color: '#94a3b8',
            textAlign: 'center',
            padding: '20px 0',
          }}
        >
          No recent activity.
        </div>
      ) : (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 14,
          }}
        >
          {recent.map((item) => (
            <div
              key={item.id}
              style={{
                background:
                  'rgba(255,255,255,0.03)',
                border:
                  '1px solid var(--border)',
                borderRadius: 12,
                padding: 12,
              }}
            >
              <div
                style={{
                  color: '#fff',
                  fontWeight: 600,
                  marginBottom: 4,
                }}
              >
                {item.name}
              </div>

              <div
                style={{
                  color: '#94a3b8',
                  fontSize: 12,
                }}
              >
                {item.created_at
                  ? new Date(
                      item.created_at
                    ).toLocaleString()
                  : 'Recently uploaded'}
              </div>
            </div>
          ))}
        </div>
      )}
    </PanelCard>
  )
}