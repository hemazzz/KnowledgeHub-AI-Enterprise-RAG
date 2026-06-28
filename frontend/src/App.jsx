import { AppProvider, useApp } from './context/AppContext.jsx'
import MainLayout from './layouts/MainLayout.jsx'
import DashboardPage from './pages/Dashboard.jsx'
import SourcesPage from './pages/Sources.jsx'
import ChatPage from './pages/Chat.jsx'
import HealthPage from './pages/Health.jsx'
import AnalyticsPage from './pages/Analytics.jsx'
import './styles/globals.css'

function AppContent() {
  const {
    activeNav,
    chatHistory,
  } = useApp()

  const renderPage = () => {
    switch (activeNav) {
      case 'dashboard':
        return <DashboardPage />

      case 'chat':
        return <ChatPage />

      case 'sources':
        return <SourcesPage />

      case 'history':
        return (
          <div
            style={{
              color: '#fff',
              padding: 30,
            }}
          >
            <h1
              style={{
                marginBottom: 20,
              }}
            >
              Chat History
            </h1>

            {chatHistory.length === 0 ? (
              <p>No conversations yet.</p>
            ) : (
              chatHistory.map((item) => (
                <div
                  key={item.id}
                  style={{
                    background:
                      'var(--bg-card)',
                    border:
                      '1px solid var(--border)',
                    borderRadius: 14,
                    padding: 18,
                    marginBottom: 16,
                  }}
                >
                  <div
                    style={{
                      color: '#fff',
                      fontWeight: 700,
                      marginBottom: 10,
                    }}
                  >
                    {item.question}
                  </div>

                  <div
                    style={{
                      color: '#cbd5e1',
                      lineHeight: 1.6,
                    }}
                  >
                    {item.answer}
                  </div>

                  <div
                    style={{
                      color: '#64748b',
                      fontSize: 13,
                      marginTop: 12,
                    }}
                  >
                    {item.date}
                  </div>
                </div>
              ))
            )}
          </div>
        )

      case 'health':
        return <HealthPage />

      case 'analytics':
        return <AnalyticsPage />

      default:
        return <DashboardPage />
    }
  }

  return (
    <MainLayout>
      {renderPage()}
    </MainLayout>
  )
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  )
}