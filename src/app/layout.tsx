import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Lumière Salon & Spa | Luxury Hair, Skin & Bridal Studio',
  description:
    'Experience premier salon care: Haircuts, Beard Styling, Hair Spa, Glow Facials, and Bridal Makeup. Book your appointment online with instant slot confirmation.',
  keywords: ['salon', 'booking', 'haircut', 'hair spa', 'facial', 'bridal makeup', 'mumbai salon'],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-slate-950 text-slate-100 font-sans selection:bg-amber-500 selection:text-black">
        {children}
      </body>
    </html>
  );
}
