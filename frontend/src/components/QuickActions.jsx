import { useRef } from 'react'
import { useApp } from '../context/AppContext.jsx'
import { Icons } from '../assets/icons.jsx'

const ACTIONS = [
  {
    icon: 'upload',
    iconColor: 'var(--purple2)',
    bg: 'linear-gradient(135deg, rgba(139,92,246,0.2), rgba(59,130,246,0.1))',
    border: 'rgba(139,92,246,0.3)',
    glow: 'rgba(139,92,246,0.2)',
    title: 'Upload PDF',
    desc: 'Drag & drop or browse PDF files',
  },
  {
    icon: 'link',
    iconColor: 'var(--blue2)',
    bg: 'linear-gradient(135deg, rgba(59,130,246,0.2), rgba(20,184,166,0.1))',
    border: 'rgba(59,130,246,0.3)',
    glow: 'rgba(59,130,246,0.2)',
    title: 'Connect Website',
    desc: 'Sync any web URL or sitemap',
  },
  {
    icon: 'db',
    iconColor: 'var(--teal2)',
    bg: 'linear-gradient(135deg, rgba(20,184,166,0.2), rgba(59,130,246,0.1))',
    border: 'rgba(20,184,166,0.3)',
    glow: 'rgba(20,184,166,0.2)',
    title: 'Upload Data Files',
    desc: 'CSV and Excel (.xlsx) files',
  },
]

export default function QuickActions() {
  const pdfInputRef = useRef(null)
  const dataInputRef = useRef(null)

  const {
    loadStats,
    loadDocuments,
    setSources,
    setStats,
    setActiveNav,
  } = useApp()

  const handlePdfUpload = () => {
    pdfInputRef.current?.click()
  }

  const handleDataUpload = () => {
    dataInputRef.current?.click()
  }

  const uploadFile = async (
    file,
    endpoint,
    type
  ) => {
    try {
      const formData = new FormData()

      formData.append('file', file)
      formData.append(
        'name',
        file.name.split('.')[0]
      )

      const response = await fetch(
        endpoint,
        {
          method: 'POST',
          body: formData,
        }
      )

      if (!response.ok) {
        throw new Error(
          'Upload failed'
        )
      }

      const data =
        await response.json()

      const newSource = {
        id:
          data.source_id ||
          Date.now(),
        name: file.name,
        type,
        created_at:
          new Date().toISOString(),
      }

      setSources((prev) => [
        ...prev,
        newSource,
      ])

      setStats((prev) => ({
        ...prev,
        lastSync:
          new Date().toISOString(),
      }))

      await loadDocuments()
      await loadStats()

      alert(
        `${file.name} uploaded successfully`
      )
    } catch (err) {
      console.error(err)
      alert(
        `${file.name} upload failed`
      )
    }
  }

  const handlePdfChange =
    async (e) => {
      const file =
        e.target.files[0]

      if (!file) return

      await uploadFile(
        file,
        'http://127.0.0.1:8000/api/v1/sources/upload-pdf',
        'pdf'
      )

      e.target.value = ''
    }

  const handleDataChange =
    async (e) => {
      const file =
        e.target.files[0]

      if (!file) return

      await uploadFile(
        file,
        'http://127.0.0.1:8000/api/v1/sources/upload-data',
        'data'
      )

      e.target.value = ''
    }

  const handleAction = (
    title
  ) => {
    if (
      title === 'Upload PDF'
    ) {
      handlePdfUpload()
      return
    }

    if (
      title ===
      'Upload Data Files'
    ) {
      handleDataUpload()
      return
    }

    if (
      title ===
      'Connect Website'
    ) {
      setActiveNav('sources')
      return
    }
  }

  return (
    <>
      <input
        type="file"
        accept=".pdf"
        ref={pdfInputRef}
        style={{
          display: 'none',
        }}
        onChange={
          handlePdfChange
        }
      />

      <input
        type="file"
        accept=".csv,.xlsx,.xls"
        ref={dataInputRef}
        style={{
          display: 'none',
        }}
        onChange={
          handleDataChange
        }
      />

      <div
        style={{
          display: 'grid',
          gridTemplateColumns:
            'repeat(3,1fr)',
          gap: 14,
          marginBottom: 24,
        }}
      >
        {ACTIONS.map(
          (a, i) => (
            <button
              key={i}
              onClick={() =>
                handleAction(
                  a.title
                )
              }
              style={{
                display:
                  'flex',
                alignItems:
                  'center',
                gap: 16,
                background:
                  'var(--bg-card)',
                border:
                  '1px solid var(--border)',
                borderRadius: 14,
                padding: 20,
                cursor:
                  'pointer',
                transition:
                  'all 0.25s',
                position:
                  'relative',
                overflow:
                  'hidden',
                textAlign:
                  'left',
                minHeight: 95,
              }}
            >
              <div
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: 14,
                  flexShrink: 0,
                  display:
                    'flex',
                  alignItems:
                    'center',
                  justifyContent:
                    'center',
                  background:
                    a.bg,
                  border: `1px solid ${a.border}`,
                  boxShadow: `0 0 20px ${a.glow}`,
                }}
              >
                <span
                  style={{
                    width: 26,
                    height: 26,
                    color:
                      a.iconColor,
                  }}
                >
                  {
                    Icons[
                      a.icon
                    ]
                  }
                </span>
              </div>

              <div
                style={{
                  flex: 1,
                }}
              >
                <div
                  style={{
                    fontSize: 18,
                    fontWeight: 700,
                    color:
                      '#fff',
                    marginBottom: 6,
                  }}
                >
                  {a.title}
                </div>

                <div
                  style={{
                    fontSize: 14,
                    color:
                      'var(--txt3)',
                    lineHeight: 1.5,
                  }}
                >
                  {a.desc}
                </div>
              </div>

              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  background:
                    'rgba(255,255,255,0.06)',
                  display:
                    'flex',
                  alignItems:
                    'center',
                  justifyContent:
                    'center',
                }}
              >
                <span
                  style={{
                    width: 16,
                    height: 16,
                    color:
                      'var(--txt2)',
                  }}
                >
                  {Icons.plus}
                </span>
              </div>
            </button>
          )
        )}
      </div>
    </>
  )
}