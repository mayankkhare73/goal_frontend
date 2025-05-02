import './globals.css'
import { SessionProviderWrapper } from './providers'
import SidebarLayout from '@/components/SidebarLayout'

export const metadata = {
  title: 'MatchCareer360 - Find Your Perfect Career Match with AI',
  description: 'Discover your ideal career path with MatchCareer360. Our AI-powered career matching tools provide a comprehensive 360° view of potential career paths based on your skills and interests.',
  keywords: 'career match, job matching, AI career guidance, 360 career assessment, career quiz, professional development, career planning, skills assessment, matchcareer360',
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
