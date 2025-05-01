import './globals.css'
import { SessionProviderWrapper } from './providers'
import SidebarLayout from '@/components/SidebarLayout'

export const metadata = {
  title: 'Career Discovery Platform',
  description: 'Discover your ideal career path through our interactive quiz',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased">
        <SessionProviderWrapper>
          <SidebarLayout>{children}</SidebarLayout>
        </SessionProviderWrapper>
      </body>
    </html>
  )
}
