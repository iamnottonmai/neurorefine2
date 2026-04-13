'use client'
import { useState, useRef, useCallback, useEffect } from 'react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

interface ReconstructResult {
  reconstructed_url: string
  metrics: {
    processing_time_ms: number
    model_weights: Record<string, number>
    tta_enabled: boolean
  }
}

const TEST_IMAGES = [
  { id: 1, filename: 'wHAeqcBVrVtZwAAAABJRU5ErkJggg.png', label: 'Sample 1' },
  { id: 2, filename: '3sjeF0FsgKEAAAAASUVORK5CYII.png',   label: 'Sample 2' },
  { id: 3, filename: '8AnbNpGvGyAXIAAAAASUVORK5CYII.png', label: 'Sample 3' },
  { id: 4, filename: 'AOn4bayBhO7iAAAAAElFTkSuQmCC.png',  label: 'Sample 4' },
  { id: 5, filename: 'geZo4GK07zdAAAAABJRU5ErkJggg.png',  label: 'Sample 5' },
  { id: 6, filename: 'tuT23f3t7dkbP7bk9tf23P7t7f8BXF4FdZ8IqwAAAAAASUVORK5CYII.png', label: 'Sample 6' },
  { id: 7, filename: 'uAAAAAElFTkSuQmCC.png',             label: 'Sample 7' },
  { id: 8, filename: 'wAYfkhXSg2a8QAAAABJRU5ErkJggg.png', label: 'Sample 8' },
]

function BeforeAfterSlider({ before, after }: { before: string; after: string }) {
  const [sliderX, setSliderX] = useState(50)
  const containerRef = useRef<HTMLDivElement>(null)
  const isDragging = useRef(false)

  const updateSlider = useCallback((clientX: number) => {
    if (!containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    const x = Math.max(0, Math.min(100, ((clientX - rect.left) / rect.width) * 100))
    setSliderX(x)
  }, [])

  const onMouseUp = () => { isDragging.current = false }
  const onMouseMove = (e: MouseEvent) => { if (isDragging.current) updateSlider(e.clientX) }

  useEffect(() => {
    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseup', onMouseUp)
    return () => {
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mouseup', onMouseUp)
    }
  })

  return (
    <div
      ref={containerRef}
      className="relative w-full aspect-square cursor-ew-resize overflow-hidden mri-frame select-none"
      onMouseDown={() => { isDragging.current = true }}
      onTouchMove={(e) => updateSlider(e.touches[0].clientX)}
    >
      <img src={after} alt="Reconstructed MRI"
        className="absolute inset-0 w-full h-full object-cover"
        style={{ filter: 'grayscale(100%)' }} />
      <div className="absolute inset-0 overflow-hidden"
        style={{ clipPath: `inset(0 ${100 - sliderX}% 0 0)` }}>
        <img src={before} alt="Corrupted MRI"
          className="absolute inset-0 w-full h-full object-cover"
          style={{ filter: 'grayscale(100%)' }} />
      </div>
      <div className="absolute top-3 left-3 text-xs px-2 py-1 rounded font-semibold"
        style={{ background: 'rgba(220,38,38,0.85)', color: 'white', fontFamily: 'DM Mono, monospace' }}>
        CORRUPTED
      </div>
      <div className="absolute top-3 right-3 text-xs px-2 py-1 rounded font-semibold"
        style={{ background: 'rgba(0,119,182,0.85)', color: 'white', fontFamily: 'DM Mono, monospace' }}>
        RECONSTRUCTED
      </div>
      <div className="absolute top-0 bottom-0 z-10 pointer-events-none"
        style={{ left: `${sliderX}%`, transform: 'translateX(-50%)' }}>
        <div style={{ position: 'absolute', top: 0, bottom: 0, left: '50%', width: '2px', background: 'white', transform: 'translateX(-50%)', boxShadow: '0 0 8px rgba(0,0,0,0.4)' }} />
        <div style={{
          position: 'absolute', top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '36px', height: '36px', borderRadius: '50%',
          background: 'white', boxShadow: '0 2px 12px rgba(0,0,0,0.3)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#0077b6', fontSize: '13px', fontWeight: 'bold', pointerEvents: 'none',
        }}>
          ⟨⟩
        </div>
      </div>
    </div>
  )
}

export default function DemoPage() {
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [result, setResult] = useState<ReconstructResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [dragOver, setDragOver] = useState(false)
  const [selectedTestImage, setSelectedTestImage] = useState<number | null>(null)
  const [activeTab, setActiveTab] = useState<'upload' | 'test'>('upload')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFile = (f: File) => {
    if (!f.type.startsWith('image/')) {
      setError('Please upload an image file (PNG, JPG, JPEG)')
      return
    }
    setFile(f)
    setError(null)
    setResult(null)
    setSelectedTestImage(null)
    const reader = new FileReader()
    reader.onload = (e) => setPreview(e.target?.result as string)
    reader.readAsDataURL(f)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const f = e.dataTransfer.files[0]
    if (f) handleFile(f)
  }

  const handleTestImageSelect = async (img: typeof TEST_IMAGES[0]) => {
    setSelectedTestImage(img.id)
    setError(null)
    setResult(null)
    try {
      const res = await fetch(`/test-images/${img.filename}`)
      if (!res.ok) throw new Error('Could not load test image')
      const blob = await res.blob()
      const testFile = new File([blob], img.filename, { type: 'image/png' })
      setFile(testFile)
      setPreview(URL.createObjectURL(blob))
    } catch {
      setError('Failed to load test image. Make sure test images are placed in /public/test-images/')
    }
  }

  const handleSubmit = async () => {
    if (!file) return
    setLoading(true)
    setError(null)
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('use_tta', 'true')
      const response = await fetch(`${API_URL}/reconstruct`, {
        method: 'POST',
        body: formData,
      })
      if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        throw new Error(data.detail || `Server error: ${response.status}`)
      }
      const data: ReconstructResult = await response.json()
      setResult(data)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to connect to backend'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  const reset = () => {
    setFile(null)
    setPreview(null)
    setResult(null)
    setError(null)
    setSelectedTestImage(null)
  }

  return (
    <div className="min-h-screen" style={{ background: '#f0f4f8' }}>
      <Navbar />

      <div className="pt-20" style={{ background: 'linear-gradient(135deg, #023e8a 0%, #001219 100%)', paddingBottom: '3rem' }}>
        <div className="max-w-5xl mx-auto px-6 pt-10">
          <div className="badge-live mb-4 inline-flex"
            style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.25)', color: 'white' }}>
            <span className="dot" style={{ background: '#48cae4' }} />
            MRI Reconstruction
          </div>
          <h1 className="text-4xl font-bold text-white mb-3"
            style={{ fontFamily: 'DM Sans, sans-serif', letterSpacing: '-0.02em' }}>
            MRI Reconstruction
          </h1>
          <p className="text-base" style={{ color: 'rgba(255,255,255,0.7)' }}>
            Upload a motion-corrupted brain MRI scan — or try one of our 8 test images — and get an enhanced reconstruction instantly.
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-12">
        {!result ? (
          <div className="max-w-2xl mx-auto">

            {/* Tab switcher */}
            <div className="flex rounded-xl overflow-hidden mb-6 border"
              style={{ borderColor: '#e2e8f0', background: 'white' }}>
              <button
                onClick={() => { setActiveTab('upload'); setSelectedTestImage(null); setPreview(null); setFile(null); setError(null) }}
                className="flex-1 py-3 text-sm font-semibold transition-all"
                style={{
                  background: activeTab === 'upload' ? '#023e8a' : 'transparent',
                  color: activeTab === 'upload' ? 'white' : '#4a5568',
                  fontFamily: 'DM Sans, sans-serif',
                  borderRight: '1px solid #e2e8f0',
                }}
              >
                ↑ Upload Your Image
              </button>
              <button
                onClick={() => { setActiveTab('test'); setFile(null); setPreview(null); setError(null); setSelectedTestImage(null) }}
                className="flex-1 py-3 text-sm font-semibold transition-all"
                style={{
                  background: activeTab === 'test' ? '#023e8a' : 'transparent',
                  color: activeTab === 'test' ? 'white' : '#4a5568',
                  fontFamily: 'DM Sans, sans-serif',
                }}
              >
                🧪 Try a Test Image
              </button>
            </div>

            {/* Upload tab */}
            {activeTab === 'upload' && (
              <div className="card p-8 mb-6">
                <h2 className="text-lg font-semibold mb-6" style={{ color: '#023e8a', fontFamily: 'DM Sans, sans-serif' }}>
                  Upload MRI Scan
                </h2>
                <div
                  className={`upload-zone p-10 text-center ${dragOver ? 'drag-over' : ''}`}
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={handleDrop}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
                  />
                  {preview ? (
                    <div>
                      <img src={preview} alt="Preview"
                        className="max-h-56 mx-auto rounded-lg mb-4"
                        style={{ filter: 'grayscale(80%)', border: '1px solid #e2e8f0' }} />
                      <p className="text-sm font-medium" style={{ color: '#0077b6', fontFamily: 'DM Mono, monospace' }}>
                        {file?.name}
                      </p>
                      <p className="text-xs mt-1" style={{ color: '#a0aec0' }}>Click to change image</p>
                    </div>
                  ) : (
                    <div>
                      <div className="w-14 h-14 mx-auto mb-4 rounded-full flex items-center justify-center"
                        style={{ background: 'rgba(0,119,182,0.08)', border: '2px dashed rgba(0,119,182,0.3)' }}>
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="#0077b6" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                        </svg>
                      </div>
                      <p className="text-base font-medium mb-1" style={{ color: '#1a202c' }}>Drop MRI scan here</p>
                      <p className="text-sm" style={{ color: '#a0aec0' }}>PNG, JPG, JPEG supported</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Test images tab */}
            {activeTab === 'test' && (
              <div className="card p-8 mb-6">
                <h2 className="text-lg font-semibold mb-2" style={{ color: '#023e8a', fontFamily: 'DM Sans, sans-serif' }}>
                  Choose a Test Image
                </h2>
                <p className="text-sm mb-6" style={{ color: '#718096' }}>
                  Select one of 8 motion-corrupted brain MRI scans to try the model.
                </p>
                <div className="grid grid-cols-4 gap-3">
                  {TEST_IMAGES.map((img) => (
                    <button
                      key={img.id}
                      onClick={() => handleTestImageSelect(img)}
                      className="relative rounded-xl overflow-hidden transition-all group"
                      style={{
                        border: selectedTestImage === img.id ? '2px solid #0077b6' : '2px solid #e2e8f0',
                        background: '#f7fafc',
                        aspectRatio: '1',
                        outline: 'none',
                        boxShadow: selectedTestImage === img.id ? '0 0 0 3px rgba(0,119,182,0.2)' : 'none',
                      }}
                    >
                      <img
                        src={`/test-images/${img.filename}`}
                        alt={img.label}
                        className="w-full h-full object-cover"
                        style={{ filter: 'grayscale(100%)' }}
                      />
                      <div
                        className="absolute inset-0 flex items-end justify-center pb-2 opacity-0 group-hover:opacity-100 transition-opacity"
                        style={{ background: 'linear-gradient(to top, rgba(2,62,138,0.7) 0%, transparent 60%)' }}
                      >
                        <span className="text-white text-xs font-semibold" style={{ fontFamily: 'DM Mono, monospace' }}>
                          {img.label}
                        </span>
                      </div>
                      {selectedTestImage === img.id && (
                        <div
                          className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full flex items-center justify-center"
                          style={{ background: '#0077b6' }}
                        >
                          <svg className="w-3 h-3" fill="white" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 00-1.414 0L8 12.586 4.707 9.293a1 1 0 00-1.414 1.414l4 4a1 1 0 001.414 0l8-8a1 1 0 000-1.414z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                    </button>
                  ))}
                </div>

                {preview && selectedTestImage && (
                  <div className="mt-6 flex items-center gap-4 p-4 rounded-xl" style={{ background: '#f0f4f8', border: '1px solid #e2e8f0' }}>
                    <img
                      src={preview}
                      alt="Selected"
                      className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                      style={{ filter: 'grayscale(80%)', border: '1px solid #e2e8f0' }}
                    />
                    <div>
                      <p className="text-sm font-semibold" style={{ color: '#023e8a', fontFamily: 'DM Sans, sans-serif' }}>
                        {TEST_IMAGES.find(i => i.id === selectedTestImage)?.label} selected
                      </p>
                      <p className="text-xs mt-0.5" style={{ color: '#718096', fontFamily: 'DM Mono, monospace' }}>
                        Ready to reconstruct
                      </p>
                    </div>
                    <button
                      onClick={() => { setSelectedTestImage(null); setPreview(null); setFile(null) }}
                      className="ml-auto text-xs px-3 py-1.5 rounded-lg"
                      style={{ color: '#718096', background: 'white', border: '1px solid #e2e8f0' }}
                    >
                      Clear
                    </button>
                  </div>
                )}
              </div>
            )}

            {error && (
              <div className="rounded-lg p-4 mb-4"
                style={{ background: '#fff5f5', border: '1px solid #fed7d7' }}>
                <p className="text-sm" style={{ color: '#c53030' }}>⚠ {error}</p>
              </div>
            )}

            <button
              onClick={handleSubmit}
              disabled={!file || loading}
              className="btn-primary w-full text-base py-4 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-3">
                  <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Processing...
                </span>
              ) : 'Reconstruct'}
            </button>

            {loading && (
              <div className="mt-3">
                <div className="progress-bar w-full" />
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            <div className="card p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold" style={{ color: '#023e8a', fontFamily: 'DM Sans, sans-serif' }}>
                  Reconstruction Complete
                </h2>
                <span className="badge-live">Drag to Compare</span>
              </div>
              <div className="max-w-md mx-auto">
                <BeforeAfterSlider before={preview!} after={result.reconstructed_url} />
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <a
                href={result.reconstructed_url}
                download="neurorefine_reconstructed.png"
                className="btn-primary text-center flex-1 py-3"
              >
                ↓ Download Reconstructed Image
              </a>
              <button onClick={reset} className="btn-outline flex-1 py-3">
                ↺ New Reconstruction
              </button>
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  )
}
