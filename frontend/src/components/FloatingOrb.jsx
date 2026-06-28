import { Icons } from '../assets/icons.jsx'

export default function FloatingOrb() {
  return (
    <div
      title="AI Assistant"
      style={{
        position: 'fixed', bottom: 20, right: 20,
        width: 48, height: 48, borderRadius: '50%',
        background: 'linear-gradient(135deg, var(--purple), var(--blue))',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        cursor: 'pointer',
        boxShadow: '0 0 25px rgba(139,92,246,0.5), 0 0 50px rgba(139,92,246,0.2)',
        zIndex: 100, animation: 'orb-float 3s ease-in-out infinite',
        transition: 'transform 0.2s',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.boxShadow = '0 0 35px rgba(139,92,246,0.7), 0 0 70px rgba(139,92,246,0.3)'
      }}
      onMouseLeave={e => {
        e.currentTarget.style.boxShadow = '0 0 25px rgba(139,92,246,0.5), 0 0 50px rgba(139,92,246,0.2)'
      }}
    >
      <div style={{
        position: 'absolute', inset: -6, borderRadius: '50%',
        border: '1px solid rgba(139,92,246,0.3)',
        animation: 'spin-slow 4s linear infinite',
        pointerEvents: 'none',
      }} />
      <span style={{ width: 22, height: 22, color: 'white', position: 'relative', zIndex: 1 }}>
        {Icons.brain}
      </span>
    </div>
  )
}
