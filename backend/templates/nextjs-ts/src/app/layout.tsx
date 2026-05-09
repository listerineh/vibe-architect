// TODO: Customize metadata and providers based on project requirements
import './globals.css'

export const metadata = {
  title: '{{PROJECT_NAME}}',
  description: '{{PROJECT_DESCRIPTION}}',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        {/* TODO: Add global providers (Auth, Theme, etc.) */}
        {children}
      </body>
    </html>
  )
}
