import { Metadata } from 'next';

export const defaultMetadata: Metadata = {
  title: {
    default: 'BUSYBEES - SDA Youth Ministry Platform',
    template: '%s | BUSYBEES',
  },
  description: 'Connect, grow, and serve with the BUSYBEES SDA Youth Ministry community. Track your spiritual journey, earn badges, and participate in events.',
  keywords: ['SDA', 'Youth Ministry', 'Church', 'Community', 'Spiritual Growth', 'Adventist'],
  authors: [{ name: 'BUSYBEES Team' }],
  creator: 'BUSYBEES',
  publisher: 'BUSYBEES SDA Youth Ministry',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://busybees.church',
    siteName: 'BUSYBEES',
    title: 'BUSYBEES - SDA Youth Ministry Platform',
    description: 'Connect, grow, and serve with the BUSYBEES SDA Youth Ministry community.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'BUSYBEES - SDA Youth Ministry',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'BUSYBEES - SDA Youth Ministry Platform',
    description: 'Connect, grow, and serve with the BUSYBEES SDA Youth Ministry community.',
    images: ['/og-image.png'],
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/manifest.json',
  alternates: {
    canonical: 'https://busybees.church',
  },
};

export function generateMetadata(title?: string, description?: string): Metadata {
  return {
    ...defaultMetadata,
    title: title || defaultMetadata.title,
    description: description || defaultMetadata.description,
  };
}
