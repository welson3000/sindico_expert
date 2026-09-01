import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from '@/components/ui/sonner';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'Síndico Expert — Gestão e Cotações para Condomínios',
  description: 'Plataforma SaaS para montagem de dossiês técnicos, cotações blind bidding de fornecedores e mapas comparativos de preços.',
  keywords: ['síndico', 'condomínio', 'manutenção predial', 'cotação', 'fornecedores', 'BOQ', 'blind bidding'],
  authors: [{ name: 'Síndico Expert Team' }],
  icons: {
    icon: '/favicon.ico',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#0E4B78',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-slate-100 text-slate-900 font-sans">
        {children}
        <Toaster position="top-right" richColors />
      </body>
    </html>
  );
}

