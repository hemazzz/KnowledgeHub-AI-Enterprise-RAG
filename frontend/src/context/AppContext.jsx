import {
  createContext,
  useContext,
  useEffect,
  useState,
} from 'react'

const AppContext = createContext(null)

export function AppProvider({
  children,
}) {
  const [activeNav, setActiveNav] =
    useState('dashboard')

  const [sources, setSources] =
    useState([])

  const [documents, setDocuments] =
    useState([])

  // Current session chat only
  const [chatMessages, setChatMessages] =
    useState([])

  // Persistent history
  const [chatHistory, setChatHistory] =
    useState(() => {
      const saved =
        localStorage.getItem(
          'chatHistory'
        )

      return saved
        ? JSON.parse(saved)
        : []
    })

  const [stats, setStats] =
    useState({
      totalSources: 0,
      pdfDocuments: 0,
      webPages: 0,
      dataFiles: 0,
      lastSync: null,
      healthScore: 0,
    })

  const calculateHealth = (
    sourceCount,
    lastSync
  ) => {
    const coverage =
      sourceCount > 0 ? 100 : 0

    const freshness =
      lastSync ? 100 : 0

    const accuracy =
      sourceCount > 0 ? 95 : 0

    return Math.round(
      (coverage +
        freshness +
        accuracy) /
        3
    )
  }

  const loadStats = () => {
    const sourceCount =
      sources.length

    const pdfCount =
      sources.filter(
        (s) =>
          s.type === 'pdf'
      ).length

    const webCount =
      sources.filter(
        (s) =>
          s.type === 'web' ||
          s.type ===
            'website'
      ).length

    const dataFileCount =
      sources.filter(
        (s) =>
          s.type === 'csv' ||
          s.type === 'excel' ||
          s.type === 'data' ||
          s.type ===
            'database'
      ).length

    const lastSync =
      localStorage.getItem(
        'lastSync'
      ) || null

    const health =
      calculateHealth(
        sourceCount,
        lastSync
      )

    setStats({
      totalSources:
        sourceCount,
      pdfDocuments:
        pdfCount,
      webPages:
        webCount,
      dataFiles:
        dataFileCount,
      lastSync,
      healthScore:
        health,
    })
  }

  const loadDocuments =
    async () => {
      try {
        let allSources = []

        // PDF Documents
        const docsRes =
          await fetch(
            'http://127.0.0.1:8000/api/v1/stats/documents'
          )

        if (docsRes.ok) {
          const pdfDocs =
            await docsRes.json()

          setDocuments(
            pdfDocs
          )

          const mappedPdfs =
            pdfDocs.map(
              (doc) => ({
                id:
                  doc.source_id,
                documentId:
                  doc.id,
                name:
                  doc.file_name ||
                  doc.title,
                chunks:
                  doc.total_chunks ||
                  0,
                created_at:
                  doc.created_at,
                type: 'pdf',
              })
            )

          allSources = [
            ...mappedPdfs,
          ]
        }

        // Website / Data Sources
        const sourceRes =
          await fetch(
            'http://127.0.0.1:8000/api/v1/sources/'
          )

        if (sourceRes.ok) {
          const sourceData =
            await sourceRes.json()

          const otherSources =
            sourceData.map(
              (s) => ({
                id: s.id,
                name: s.name,
                created_at:
                  s.created_at,
                type: s.type,
                chunks: 0,
              })
            )

          allSources = [
            ...allSources,
            ...otherSources,
          ]
        }

        setSources(
          allSources
        )
      } catch (err) {
        console.error(
          'Failed loading sources:',
          err
        )
      }
    }

  useEffect(() => {
    loadDocuments()
  }, [])

  useEffect(() => {
    loadStats()
  }, [sources])

  useEffect(() => {
    localStorage.setItem(
      'chatHistory',
      JSON.stringify(
        chatHistory
      )
    )
  }, [chatHistory])

  return (
    <AppContext.Provider
      value={{
        activeNav,
        setActiveNav,

        sources,
        setSources,

        documents,
        setDocuments,

        chatMessages,
        setChatMessages,

        chatHistory,
        setChatHistory,

        stats,
        setStats,

        loadStats,
        loadDocuments,
      }}
    >
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const ctx =
    useContext(AppContext)

  if (!ctx) {
    throw new Error(
      'useApp must be used within AppProvider'
    )
  }

  return ctx
}