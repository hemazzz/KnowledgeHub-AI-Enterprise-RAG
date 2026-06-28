import { Icons } from '../assets/icons.jsx'
import { useApp } from '../context/AppContext.jsx'

const NAV_ITEMS = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: 'dashboard',
    group: 'main',
  },
  {
    id: 'chat',
    label: 'Chat',
    icon: 'chat',
    group: 'main',
    badge: 'New',
  },
  {
    id: 'sources',
    label: 'Sources',
    icon: 'sources',
    group: 'main',
  },
  {
    id: 'history',
    label: 'History',
    icon: 'history',
    group: 'main',
  },

  {
    id: 'health',
    label: 'Knowledge Health',
    icon: 'health',
    group: 'intelligence',
  },
  {
    id: 'analytics',
    label: 'Analytics',
    icon: 'analytics',
    group: 'intelligence',
  },
]

export default function Sidebar() {
  const { activeNav, setActiveNav } = useApp()

  return (
    <aside
      style={{
        width: 280,
        minWidth: 280,
        background: 'var(--bg-panel)',
        borderRight: '1px solid var(--border)',
        display: 'flex',
        flexDirection: 'column',
        overflowY: 'auto',
      }}
    >
      {/* Logo */}
      <div
        style={{
          padding: '30px 20px',
          borderBottom: '1px solid var(--border)',
        }}
      >
        <div
          style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: 22,
            fontWeight: 700,
            color: '#fff',
          }}
        >
          KnowledgeHub AI
        </div>

        <div
          style={{
            marginTop: 6,
            fontSize: 13,
            color: 'var(--txt3)',
          }}
        >
          Enterprise RAG Platform
        </div>
      </div>

      {/* Navigation */}
      <div
        style={{
          padding: '18px 12px',
          flex: 1,
        }}
      >
        <NavGroup
          label="Main"
          items={NAV_ITEMS.filter((n) => n.group === 'main')}
          active={activeNav}
          setActive={setActiveNav}
        />

        <NavGroup
          label="Intelligence"
          items={NAV_ITEMS.filter(
            (n) => n.group === 'intelligence'
          )}
          active={activeNav}
          setActive={setActiveNav}
        />
      </div>
    </aside>
  )
}

function NavGroup({
  label,
  items,
  active,
  setActive,
}) {
  return (
    <>
      <div
        style={{
          fontSize: 13,
          color: 'var(--txt3)',
          textTransform: 'uppercase',
          letterSpacing: '1px',
          marginBottom: 10,
          marginTop: 18,
          paddingLeft: 8,
          fontWeight: 600,
        }}
      >
        {label}
      </div>

      {items.map((item) => (
        <NavItem
          key={item.id}
          item={item}
          isActive={active === item.id}
          onClick={() => setActive(item.id)}
        />
      ))}
    </>
  )
}

function NavItem({
  item,
  isActive,
  onClick,
}) {
  return (
    <div
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '14px 14px',
        borderRadius: 10,
        cursor: 'pointer',
        marginBottom: 6,
        color: isActive
          ? 'var(--purple2)'
          : 'var(--txt2)',
        background: isActive
          ? 'linear-gradient(90deg, rgba(139,92,246,0.2), rgba(59,130,246,0.1))'
          : 'transparent',
        border: isActive
          ? '1px solid rgba(139,92,246,0.25)'
          : '1px solid transparent',
        fontSize: 16,
        fontWeight: 600,
        transition: 'all 0.2s ease',
      }}
    >
      <span
        style={{
          width: 22,
          height: 22,
          display: 'flex',
          alignItems: 'center',
        }}
      >
        {Icons[item.icon]}
      </span>

      {item.label}

      {item.badge && (
        <span
          style={{
            marginLeft: 'auto',
            padding: '3px 8px',
            fontSize: 11,
            borderRadius: 6,
            background:
              'rgba(139,92,246,0.15)',
            color: 'var(--purple2)',
          }}
        >
          {item.badge}
        </span>
      )}
    </div>
  )
}