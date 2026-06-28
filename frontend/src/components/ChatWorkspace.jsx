
import {
  useState,
  useRef,
  useEffect,
} from 'react'
import { askQuestion } from '../services/chatService'
import { useApp } from '../context/AppContext.jsx'

export default function ChatWorkspace({
  fullScreen = false,
}) {
  const {
    
    setChatHistory,
  } = useApp()

  const [input, setInput] = useState('')
  const [messages, setMessages] =
    useState([])

  const [loading, setLoading] =
    useState(false)

  const [sessionId, setSessionId] =
    useState('')

  const bottomRef = useRef(null)

  const updateMessages = (
  updater
) => {
  setMessages((prev) =>
    typeof updater ===
    'function'
      ? updater(prev)
      : updater
  )
}

  useEffect(() => {
    bottomRef.current?.scrollIntoView(
      {
        behavior: 'smooth',
      }
    )
  }, [messages])

  const handleSend = async () => {
    if (!input.trim() || loading)
      return

    const question = input

    updateMessages((prev) => [
      ...prev,
      {
        role: 'user',
        content: question,
      },
      {
        role: 'assistant',
        content: 'Thinking...',
      },
    ])

    setInput('')
    setLoading(true)

    try {
      const stream =
        await askQuestion(
          question,
          sessionId
        )

      if (!stream) {
        throw new Error(
          'No stream received'
        )
      }

      const reader =
        stream.getReader()

      const decoder =
        new TextDecoder()

      let answer = ''

      while (true) {
        const { done, value } =
          await reader.read()

        if (done) break

        const chunk =
          decoder.decode(value)

        const lines =
          chunk.split('\n')

        for (const line of lines) {
          if (
            !line.startsWith(
              'data:'
            )
          )
            continue

          const text = line
            .replace(
              'data:',
              ''
            )
            .trim()

          if (!text) continue

          if (
            text.startsWith(
              '[SESSION_ID:'
            )
          ) {
            const id = text
              .replace(
                '[SESSION_ID:',
                ''
              )
              .replace(
                ']',
                ''
              )

            setSessionId(id)
            continue
          }

          if (
            text === '[DONE]'
          )
            continue

          answer += text + ' '

          updateMessages(
            (prev) => {
              const updated = [
                ...prev,
              ]

              updated[
                updated.length -
                  1
              ] = {
                role:
                  'assistant',
                content:
                  answer,
              }

              return updated
            }
          )
        }
      }

      if (answer.trim()) {
        const historyItem = {
          id: Date.now(),
          question,
          answer:
            answer.trim(),
          date:
            new Date().toLocaleString(),
        }

        setChatHistory(
          (prev) => [
            historyItem,
            ...prev,
          ]
        )

        localStorage.setItem(
          'lastSync',
          new Date().toISOString()
        )
      }
    } catch (err) {
      console.log(err)

      updateMessages(
        (prev) => {
          const updated = [
            ...prev,
          ]

          updated[
            updated.length -
              1
          ] = {
            role:
              'assistant',
            content:
              'Something went wrong.',
          }

          return updated
        }
      )
    }

    setLoading(false)
  }

  return (
    <div
      style={{
        background:
          'var(--bg-card)',
        border:
          '1px solid var(--border)',
        borderRadius: 16,
        overflow:
          'hidden',
        display: 'flex',
        flexDirection:
          'column',
        width: '100%',
        flex: 1,
        height:
          fullScreen
            ? 'calc(100vh - 220px)'
            : '650px',
        minHeight:
          fullScreen
            ? '650px'
            : '500px',
      }}
    >
      <div
        style={{
          padding:
            '20px 22px',
          borderBottom:
            '1px solid var(--border)',
          background:
            'linear-gradient(90deg, rgba(139,92,246,0.05), transparent)',
        }}
      >
        <div
          style={{
            fontSize: 20,
            fontWeight: 700,
            color: '#fff',
          }}
        >
          Knowledge Chat
        </div>
      </div>

      <div
        style={{
          flex: 1,
          padding: 20,
          overflowY:
            'auto',
          display: 'flex',
          flexDirection:
            'column',
          gap: 16,
        }}
      >
        {messages.length ===
        0 ? (
          <div
            style={{
              flex: 1,
              display:
                'flex',
              justifyContent:
                'center',
              alignItems:
                'center',
              color: '#888',
            }}
          >
            Ask questions
            about your
            uploaded
            documents.
          </div>
        ) : (
          <>
            {messages.map(
              (
                msg,
                index
              ) => (
                <div
                  key={
                    index
                  }
                  style={{
                    display:
                      'flex',
                    width:
                      '100%',
                    justifyContent:
                      msg.role ===
                      'user'
                        ? 'flex-end'
                        : 'flex-start',
                  }}
                >
                  <div
                    style={{
                      maxWidth:
                        '80%',
                      padding:
                        '14px 16px',
                      borderRadius: 14,
                      background:
                        msg.role ===
                        'user'
                          ? 'var(--purple)'
                          : 'rgba(255,255,255,0.06)',
                      color:
                        '#fff',
                      whiteSpace:
                        'pre-wrap',
                      wordBreak:
                        'break-word',
                      overflowWrap:
                        'anywhere',
                    }}
                  >
                    {
                      msg.content
                    }
                  </div>
                </div>
              )
            )}

            <div
              ref={
                bottomRef
              }
            />
          </>
        )}
      </div>

      <div
        style={{
          padding:
            '18px 20px',
          borderTop:
            '1px solid var(--border)',
          display: 'flex',
          gap: 12,
          background:
            'var(--bg-card2)',
        }}
      >
        <input
          style={{
            flex: 1,
            background:
              'rgba(255,255,255,0.04)',
            border:
              '1px solid var(--border2)',
            borderRadius: 12,
            padding:
              '14px 18px',
            color:
              'var(--txt)',
            fontSize: 16,
            outline:
              'none',
          }}
          placeholder="Ask anything..."
          value={input}
          disabled={
            loading
          }
          onChange={(e) =>
            setInput(
              e.target
                .value
            )
          }
          onKeyDown={(
            e
          ) =>
            e.key ===
              'Enter' &&
            handleSend()
          }
        />

        <button
          onClick={
            handleSend
          }
          disabled={
            loading
          }
          style={{
            width: 48,
            height: 48,
            borderRadius: 12,
            border:
              'none',
            cursor:
              'pointer',
            background:
              'linear-gradient(135deg,var(--purple),var(--blue))',
            color:
              'white',
            fontSize: 20,
          }}
        >
          {loading
            ? '...'
            : '➤'}
        </button>
      </div>
    </div>
  )
}
