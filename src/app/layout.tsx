import type { Metadata } from 'next'
import { ClerkProvider } from '@clerk/nextjs'
import { Plus_Jakarta_Sans } from 'next/font/google'
import './globals.css'

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-jakarta',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Cadence — LinkedIn Voice Engine for Sales Teams',
  description: 'Your AI content engine. Open it. See your post. Approve it. Done in 60 seconds.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={`${jakarta.variable} font-sans antialiased bg-bg`}>
          {children}
        </body>
      </html>
    </ClerkProvider>
  )
}