import Sidebar from '../components/Sidebar.jsx'
import FloatingOrb from '../components/FloatingOrb.jsx'

const FOOTER_ITEMS = [
  'Powered by RAG',
  'Auto-Sync',
  'Local LLM',
  'Privacy First',
]

export default function MainLayout({
  children,
}) {
  return (
   <div
  style={{
    display: 'flex',
    height: '100vh',
    width: '100%',
    overflowY: 'auto',
    overflowX: 'hidden',
  }}
>
      <Sidebar />

      <div
  style={{
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    minWidth: 0,
    minHeight: 0,
    overflowY: 'auto',
    overflowX: 'hidden',
  }}
>
        <main
          style={{
            flex: 1,
            padding: 20,
            minHeight: 0,
            overflowY: 'auto',
            overflowX: 'hidden',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {children}
        </main>

        <footer
          style={{
            padding: '8px 20px',
            borderTop:
              '1px solid var(--border)',
            background:
              'var(--bg-panel)',
            display: 'flex',
            alignItems: 'center',
            justifyContent:
              'center',
            gap: 16,
            flexShrink: 0,
          }}
        >
          {FOOTER_ITEMS.map(
            (item, i) => (
              <div
                key={i}
                style={{
                  display: 'flex',
                  alignItems:
                    'center',
                  gap: 5,
                  fontSize: 10,
                  color:
                    'var(--txt3)',
                }}
              >
                {i > 0 && (
                  <div
                    style={{
                      width: 4,
                      height: 4,
                      borderRadius:
                        '50%',
                      background:
                        'var(--purple2)',
                    }}
                  />
                )}
                {item}
              </div>
            )
          )}
        </footer>
      </div>

      <FloatingOrb />
    </div>
  )
}