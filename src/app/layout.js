import './globals.css'
import { SessionProviderWrapper } from './providers'

export const metadata = {
  title: 'Career Discovery Platform',
  description: 'Discover your ideal career path through our interactive quiz',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <SessionProviderWrapper>{children}</SessionProviderWrapper>
      </body>
    </html>
  )
}
