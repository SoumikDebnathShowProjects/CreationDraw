import type { Metadata } from 'next';
import './globals.css';
import { ErrorBoundary } from '@/components/ErrorBoundary';

const appName = process.env.NEXT_PUBLIC_APP_NAME || 'DrawBoard';

export const metadata: Metadata = {
  title: `${appName} - Collaborative Drawing Platform`,
  description: 'Collaborative drawing platform for teams',
  keywords: ['collaboration', 'drawing', 'whiteboard', 'team', 'canvas'],
  authors: [{ name: 'DrawBoard Team' }],
  viewport: 'width=device-width, initial-scale=1',
  themeColor: '#3B82F6',
  openGraph: {
    title: `${appName} - Collaborative Drawing Platform`,
    description: 'Collaborative drawing platform for teams',
    type: 'website',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body>
        <ErrorBoundary>
          {children}
        </ErrorBoundary>
      </body>
    </html>
  );
}
