import { useRef, useState } from 'react'
import { useApp } from '../context/AppContext.jsx'

export default function SourcesPage() {
  const {
    sources,
    loadDocuments,
    loadStats,
  } = useApp()

  const [websiteName, setWebsiteName] =
    useState('')

  const [websiteUrl, setWebsiteUrl] =
    useState('')

  const dataFileRef = useRef(null)

  const inputStyle = {
    width: '100%',
    padding: 12,
    marginBottom: 12,
    borderRadius: 10,
    border: '1px solid var(--border)',
    background:
      'rgba(255,255,255,0.05)',
    color: '#fff',
    outline: 'none',
  }

  const handleDelete = async (id) => {
    try {
      const res = await fetch(
        `http://127.0.0.1:8000/api/v1/sources/${id}`,
        {
          method: 'DELETE',
        }
      )

      if (!res.ok) {
        throw new Error('Delete failed')
      }

      await loadDocuments()
      await loadStats()

      alert(
        'Source deleted successfully'
      )
    } catch (err) {
      console.error(err)
      alert('Delete failed')
    }
  }

  const connectWebsite = async () => {
    if (
      !websiteName.trim() ||
      !websiteUrl.trim()
    ) {
      alert(
        'Please enter website name and URL'
      )
      return
    }

    try {
      const res = await fetch(
        'http://127.0.0.1:8000/api/v1/sources/connect-web',
        {
          method: 'POST',
          headers: {
            'Content-Type':
              'application/json',
          },
          body: JSON.stringify({
            name: websiteName,
            url: websiteUrl,
            max_pages: 10,
          }),
        }
      )

      if (!res.ok) {
        throw new Error(
          'Website connection failed'
        )
      }

      await loadDocuments()
      await loadStats()

      setWebsiteName('')
      setWebsiteUrl('')

      alert(
        'Website connected successfully'
      )
    } catch (err) {
      console.error(err)
      alert(
        'Website connection failed'
      )
    }
  }

  const uploadDataFile = async (e) => {
    const file = e.target.files[0]

    if (!file) return

    try {
      const formData = new FormData()

      formData.append('file', file)
      formData.append(
        'name',
        file.name.split('.')[0]
      )

      const res = await fetch(
        'http://127.0.0.1:8000/api/v1/sources/upload-data',
        {
          method: 'POST',
          body: formData,
        }
      )

      if (!res.ok) {
        throw new Error(
          'Upload failed'
        )
      }

      await loadDocuments()
      await loadStats()

      alert(
        'Data file uploaded successfully'
      )
    } catch (err) {
      console.error(err)
      alert(
        'Failed to upload file'
      )
    }

    e.target.value = ''
  }

  return (
    <div>
      <h1
        style={{
          color: '#fff',
          marginBottom: 24,
          fontSize: 30,
          fontWeight: 700,
        }}
      >
        Knowledge Sources
      </h1>

      {/* Website */}
      <div
        style={{
          background:
            'var(--bg-card)',
          border:
            '1px solid var(--border)',
          borderRadius: 16,
          padding: 20,
          marginBottom: 25,
        }}
      >
        <h3
          style={{
            color: '#fff',
            marginBottom: 15,
          }}
        >
          Connect Website
        </h3>

        <input
          value={websiteName}
          onChange={(e) =>
            setWebsiteName(
              e.target.value
            )
          }
          placeholder="Website Name"
          style={inputStyle}
        />

        <input
          value={websiteUrl}
          onChange={(e) =>
            setWebsiteUrl(
              e.target.value
            )
          }
          placeholder="https://example.com"
          style={inputStyle}
        />

        <button
          onClick={
            connectWebsite
          }
          style={{
            background:
              'linear-gradient(135deg,var(--purple),var(--blue))',
            border: 'none',
            color: '#fff',
            padding:
              '12px 20px',
            borderRadius: 10,
            cursor: 'pointer',
            fontWeight: 600,
          }}
        >
          Connect Website
        </button>
      </div>

      {/* Data Files */}
      <div
        style={{
          background:
            'var(--bg-card)',
          border:
            '1px solid var(--border)',
          borderRadius: 16,
          padding: 20,
          marginBottom: 25,
        }}
      >
        <h3
          style={{
            color: '#fff',
            marginBottom: 15,
          }}
        >
          Upload Data Files
        </h3>

        <p
          style={{
            color: '#94a3b8',
            marginBottom: 18,
          }}
        >
          Upload CSV and Excel
          files to chat with your
          data.
        </p>

        <input
          type="file"
          accept=".csv,.xlsx,.xls"
          ref={dataFileRef}
          style={{
            display: 'none',
          }}
          onChange={
            uploadDataFile
          }
        />

        <button
          onClick={() =>
            dataFileRef.current?.click()
          }
          style={{
            background:
              'linear-gradient(135deg,var(--teal),var(--blue))',
            border: 'none',
            color: '#fff',
            padding:
              '12px 20px',
            borderRadius: 10,
            cursor: 'pointer',
            fontWeight: 600,
          }}
        >
          Upload CSV / Excel
        </button>
      </div>

      {/* Sources */}
      {sources.length === 0 ? (
        <div
          style={{
            background:
              'var(--bg-card)',
            border:
              '1px solid var(--border)',
            borderRadius: 16,
            padding: 50,
            textAlign: 'center',
            color: '#94a3b8',
            fontSize: 18,
          }}
        >
          No sources uploaded yet.
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gap: 16,
          }}
        >
          {sources.map(
            (source) => (
              <div
                key={source.id}
                style={{
                  background:
                    'var(--bg-card)',
                  border:
                    '1px solid var(--border)',
                  borderRadius: 16,
                  padding: 22,
                  display: 'flex',
                  justifyContent:
                    'space-between',
                  alignItems:
                    'center',
                }}
              >
                <div>
                  <div
                    style={{
                      color:
                        '#fff',
                      fontSize: 18,
                      fontWeight: 700,
                      marginBottom: 8,
                    }}
                  >
                    {source.name}
                  </div>

                  <div
                    style={{
                      color:
                        '#94a3b8',
                      fontSize: 14,
                    }}
                  >
                    Type:{' '}
                    {source.type}
                  </div>

                  {source.uri && (
                    <div
                      style={{
                        color:
                          '#60a5fa',
                        fontSize: 14,
                        marginTop: 5,
                        wordBreak:
                          'break-all',
                      }}
                    >
                      {
                        source.uri
                      }
                    </div>
                  )}

                  <div
                    style={{
                      color:
                        '#94a3b8',
                      fontSize: 14,
                      marginTop: 5,
                    }}
                  >
                    Uploaded:{' '}
                    {source.created_at
                      ? new Date(
                          source.created_at
                        ).toLocaleString()
                      : '-'}
                  </div>
                </div>

                <button
                  onClick={() =>
                    handleDelete(
                      source.id
                    )
                  }
                  style={{
                    background:
                      '#ef4444',
                    border:
                      'none',
                    color:
                      '#fff',
                    padding:
                      '10px 18px',
                    borderRadius: 10,
                    cursor:
                      'pointer',
                    fontWeight: 600,
                  }}
                >
                  Remove
                </button>
              </div>
            )
          )}
        </div>
      )}
    </div>
  )
}