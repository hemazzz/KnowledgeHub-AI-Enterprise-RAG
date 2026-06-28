import API_BASE from './api'

export const askQuestion = async (
  question: string,
  sessionId: string = ''
) => {
  const response = await fetch(
    `${API_BASE}/chat/stream`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        session_id: sessionId,
        question,
        top_k: 5,
      }),
    }
  )

  if (!response.ok) {
    throw new Error('Chat request failed')
  }

  return response.body
}