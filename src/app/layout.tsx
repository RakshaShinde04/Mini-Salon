import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'LUXE Hair Studio | Your Hair. Your Era.',
  description:
    'Experience luxury hair styling, precision cuts, radiant colors, and blowouts at LUXE Hair Studio. Book your appointment online.',
  keywords: ['salon', 'luxe hair studio', 'haircut', 'balayage', 'hair color', 'blowout', 'salon booking'],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Italiana&family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=Playfair+Display:ital,wght@0,500;0,700;0,900;1,600&family=Great+Vibes&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full flex flex-col bg-[#F8F3ED] text-[#1A1412] selection:bg-[#E892A2] selection:text-white">
        {children}
      </body>
    </html>
  );
}
