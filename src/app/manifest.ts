import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Síndico Expert — Gestão e Cotações para Condomínios',
    short_name: 'Síndico Expert',
    description: 'Plataforma SaaS de dossiê técnico, cotações com blind bidding e mapas comparativos de preços para condomínios.',
    start_url: '/',
    display: 'standalone',
    background_color: '#020617',
    theme_color: '#0f172a',
    icons: [
      {
        src: '/favicon.ico',
        sizes: 'any',
        type: 'image/x-icon',
      },
    ],
  };
}
