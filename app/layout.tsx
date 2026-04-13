import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'NeuroRefine — AI-Powered MRI Artifact Reconstruction',
  description: 'Advanced motion mitigation for axial, coronal, and sagittal MRI brain slices. Recover diagnostic quality from motion-corrupted scans instantly.',
  keywords: 'MRI, motion artifacts, AI, medical imaging, brain MRI, radiology, image enhancement',
  icons: {
    icon: '/logoNeuroRefine.png',
    apple: '/logoNeuroRefine.png',
  },
  openGraph: {
    title: 'NeuroRefine',
    description: 'AI-Powered MRI Artifact Reconstruction',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/logoNeuroRefine.png" type="image/png" />
        <link rel="apple-touch-icon" href="/logoNeuroRefine.png" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="icon" href="/logoNeuroRefine.png" type="image/png" />
        <link rel="apple-touch-icon" href="/logoNeuroRefine.png" />
      </head>
      <body className="noise">
        {children}
      </body>
    </html>
  )
}
