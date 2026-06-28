export default function StatCards({ stats }) {
  const lastSync =
    stats.lastSync || '—'

  const cards = [
    {
      label: 'Total Sources',
      value: stats.totalSources,
      sub: 'Connected sources',
      accent: 'purple',
    },
    {
      label: 'PDF Documents',
      value: stats.pdfDocuments,
      sub: 'Uploaded PDF files',
      accent: '',
    },
    {
      label: 'Web Pages',
      value: stats.webPages,
      sub: 'Indexed pages',
      accent: 'teal',
    },
    {
      label: 'Data Files',
      value: stats.dataFiles || 0,
      sub: 'CSV / Excel files',
      accent: '',
    },
    {
      label: 'Last Sync',
      value: lastSync,
      sub: stats.lastSync
        ? 'Latest update'
        : 'Never synced',
      accent: 'purple',
    },
  ]

  const accentMap = {
    purple:
      'linear-gradient(90deg,var(--purple),var(--blue))',

    teal:
      'linear-gradient(90deg,var(--teal),var(--blue))',

    '':
      'linear-gradient(90deg,var(--border2),var(--border))',
  }

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns:
          'repeat(5,1fr)',
        gap: 16,
        marginBottom: 24,
      }}
    >
      {cards.map((card, i) => (
        <div
          key={i}
          style={{
            background:
              'var(--bg-card)',
            border:
              '1px solid var(--border)',
            borderRadius: 16,
            padding: 22,
            position: 'relative',
            overflow: 'hidden',
            minHeight: 145,
          }}
        >
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: 3,
              background:
                accentMap[
                  card.accent
                ],
            }}
          />

          <div
            style={{
              fontSize: 15,
              fontWeight: 700,
              color: '#cbd5e1',
              textTransform:
                'uppercase',
              letterSpacing: '1px',
              marginBottom: 14,
            }}
          >
            {card.label}
          </div>

          <div
            style={{
              fontFamily:
                "'Space Grotesk', sans-serif",

              fontSize:
                card.label ===
                'Last Sync'
                  ? 14
                  : 42,

              fontWeight: 800,
              color: '#ffffff',
              lineHeight: 1.3,
              whiteSpace:
                card.label ===
                'Last Sync'
                  ? 'pre-wrap'
                  : 'normal',
            }}
          >
            {card.value}
          </div>

          <div
            style={{
              fontSize: 15,
              fontWeight: 500,
              color: '#94a3b8',
              marginTop: 14,
              lineHeight: 1.6,
            }}
          >
            {card.sub}
          </div>
        </div>
      ))}
    </div>
  )
}