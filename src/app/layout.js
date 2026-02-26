import './globals.css';
import { SessionProvider } from 'next-auth/react';

export const metadata = {
  title: 'SkinHealth Assistant',
  description: 'AI-powered skin health assistant',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=Syne:wght@600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <SessionProvider>
          {children}
        </SessionProvider>
      </body>
    </html>
  );
}
