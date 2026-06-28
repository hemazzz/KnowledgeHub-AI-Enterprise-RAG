import ChatWorkspace from '../components/ChatWorkspace.jsx'

export default function ChatPage() {
  return (
    <div
      style={{
        minHeight: '100%',
        display: 'flex',
        flexDirection: 'column',
        flex: 1,
      }}
    >
      <h1
        style={{
          color: '#fff',
          fontSize: 42,
          fontWeight: 800,
          marginBottom: 10,
        }}
      >
        Chat
      </h1>

      <p
        style={{
          color: '#94a3b8',
          marginBottom: 25,
          fontSize: 18,
        }}
      >
        Ask questions about your uploaded documents.
      </p>

      <div
        style={{
          flex: 1,
          display: 'flex',
          minHeight: 0,
        }}
      >
        <ChatWorkspace fullScreen />
      </div>
    </div>
  )
}