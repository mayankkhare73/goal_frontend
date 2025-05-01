import './globals.css'
import { SessionProviderWrapper } from './providers'
import SidebarLayout from '@/components/SidebarLayout'

export const metadata = {
  title: 'CareerPathfinder - Discover Your Ideal Career Path with AI',
  description: 'Find the perfect career match using our AI-powered career assessment tools. Take our personalized quiz and get tailored career recommendations based on your skills and interests.',
  keywords: 'career finder, job recommendation, career quiz, AI career guidance, career assessment tool, professional development, job matching, skills assessment, career planning',
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
