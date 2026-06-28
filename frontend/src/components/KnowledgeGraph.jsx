import { useApp } from '../context/AppContext.jsx'
import { Icons } from '../assets/icons.jsx'

const NODES = [
  {
    key: 'pdf',
    label: 'PDF',
    icon: 'pdf',
    color: 'var(--purple2)',
    bg: 'rgba(139,92,246,0.12)',
    border: 'rgba(139,92,246,0.3)',
    glow: 'rgba(139,92,246,0.2)',
    pos: {
      left: '3%',
      top: '50%',
      transform: 'translateY(-50%)',
    },
  },
  {
    key: 'web',
    label: 'Website',
    icon: 'web',
    color: 'var(--blue2)',
    bg: 'rgba(59,130,246,0.12)',
    border: 'rgba(59,130,246,0.3)',
    glow: 'rgba(59,130,246,0.2)',
    pos: {
      right: '3%',
      top: '50%',
      transform: 'translateY(-50%)',
    },
  },
  {
    key: 'db',
    label: 'Database',
    icon: 'db',
    color: 'var(--teal2)',
    bg: 'rgba(20,184,166,0.12)',
    border: 'rgba(20,184,166,0.3)',
    glow: 'rgba(20,184,166,0.2)',
    pos: {
      top: '0%',
      left: '50%',
      transform: 'translateX(-50%)',
    },
  },
]

export default function KnowledgeGraph() {
  const { stats } = useApp()

  return (
    <div
      style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: 16,
        padding: 22,
      }}
    >
      <div
        style={{
          fontSize: 18,
          fontWeight: 700,
          color: '#fff',
          marginBottom: 20,
          display: 'flex',
          alignItems: 'center',
          gap: 10,
        }}
      >
        <span
          style={{
            width: 22,
            height: 22,
            color: 'var(--purple2)',
          }}
        >
          {Icons.brain}
        </span>

        Knowledge Graph

        <span
          style={{
            marginLeft: 'auto',
            fontSize: 13,
            color: 'var(--txt3)',
            background: 'rgba(255,255,255,0.04)',
            padding: '4px 10px',
            borderRadius: 6,
            border: '1px solid var(--border)',
          }}
        >
          {stats.totalSources} nodes
        </span>
      </div>

      <div
        style={{
          position: 'relative',
          height: 260,
        }}
      >
        <svg
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            pointerEvents: 'none',
          }}
        >
          <defs>
            <marker
              id="arr"
              markerWidth="8"
              markerHeight="8"
              refX="4"
              refY="4"
              orient="auto"
            >
              <path
                d="M0,0 L0,8 L8,4 z"
                fill="rgba(139,92,246,0.3)"
              />
            </marker>
          </defs>

          <line
            x1="17%"
            y1="50%"
            x2="42%"
            y2="50%"
            stroke="rgba(139,92,246,0.25)"
            strokeWidth="2"
            strokeDasharray="5 4"
            markerEnd="url(#arr)"
          />

          <line
            x1="83%"
            y1="50%"
            x2="58%"
            y2="50%"
            stroke="rgba(59,130,246,0.25)"
            strokeWidth="2"
            strokeDasharray="5 4"
            markerEnd="url(#arr)"
          />

          <line
            x1="50%"
            y1="13%"
            x2="50%"
            y2="36%"
            stroke="rgba(20,184,166,0.25)"
            strokeWidth="2"
            strokeDasharray="5 4"
            markerEnd="url(#arr)"
          />
        </svg>

        {NODES.map((node) => (
          <div
            key={node.key}
            style={{
              position: 'absolute',
              ...node.pos,
            }}
          >
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <div
                style={{
                  width: 60,
                  height: 60,
                  borderRadius: 14,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: node.bg,
                  border: `1px solid ${node.border}`,
                  boxShadow: `0 0 16px ${node.glow}`,
                }}
              >
                <span
                  style={{
                    width: 28,
                    height: 28,
                    color: node.color,
                  }}
                >
                  {Icons[node.icon]}
                </span>
              </div>

              <div
                style={{
                  fontSize: 14,
                  fontWeight: 600,
                  color: node.color,
                  whiteSpace: 'nowrap',
                }}
              >
                {node.label}
              </div>
            </div>
          </div>
        ))}

        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
          }}
        >
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              position: 'relative',
            }}
          >
            <div
              style={{
                position: 'absolute',
                inset: -10,
                borderRadius: '50%',
                border: '1px solid rgba(139,92,246,0.3)',
                animation:
                  'spin-slow 6s linear infinite',
              }}
            />

            <div
              style={{
                width: 95,
                height: 95,
                borderRadius: '50%',
                background:
                  'radial-gradient(circle at 35% 35%, var(--purple2), var(--purple), #4c1d95)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow:
                  '0 0 35px rgba(139,92,246,0.5), 0 0 70px rgba(139,92,246,0.15)',
                animation:
                  'pulseGlow 2s infinite',
                position: 'relative',
                zIndex: 10,
              }}
            >
              <span
                style={{
                  width: 34,
                  height: 34,
                  color:
                    'rgba(255,255,255,0.95)',
                }}
              >
                {Icons.brain}
              </span>
            </div>

            <div
              style={{
                fontSize: 14,
                fontWeight: 600,
                color: 'var(--txt3)',
                marginTop: 10,
                textAlign: 'center',
                whiteSpace: 'nowrap',
              }}
            >
              AI Knowledge Core
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}