import type { Metadata, Viewport } from 'next';
import { SiteHeader } from '@/components/SiteHeader';
import { SiteFooter } from '@/components/SiteFooter';
import { ContactRail } from '@/components/ContactRail';
import { SITE_URL } from '@/lib/site';

const DESCRIPTION =
  'A general hospital in Summit 72, Lemi Kura, Addis Ababa, offering 24/7 emergency care, consultant-led outpatient clinics, surgery, maternity, diagnostics and pharmacy services.';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'Summit General Hospital — good health has a home in Addis',
    template: '%s | Summit General Hospital',
  },
  description: DESCRIPTION,
  applicationName: 'Summit General Hospital',
  icons: {
    icon: [
      { url: '/assets/img/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon.ico', sizes: 'any' },
    ],
    apple: '/assets/img/apple-touch-icon.png',
  },
  openGraph: {
    type: 'website',
    siteName: 'Summit General Hospital',
    locale: 'en_ET',
    url: SITE_URL,
    title: 'Summit General Hospital — good health has a home in Addis',
    description: DESCRIPTION,
    images: [
      {
        url: '/assets/img/og.jpg',
        width: 1200,
        height: 630,
        alt: 'Summit General Hospital — good health has a home in Addis.',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Summit General Hospital — good health has a home in Addis',
    description: DESCRIPTION,
    images: ['/assets/img/og.jpg'],
  },
};

export const viewport: Viewport = {
  themeColor: '#0C3B33',
};

const HOSPITAL_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'Hospital',
  name: 'Summit General Hospital',
  url: `${SITE_URL}/`,
  logo: `${SITE_URL}/assets/img/logo-dark.svg`,
  image: `${SITE_URL}/assets/img/og.jpg`,
  description: DESCRIPTION,
  telephone: '+251-111-132-702',
  email: 'info@summitgh.com.et',
  address: {
    '@type': 'PostalAddress',
    streetAddress: 'Summit 72',
    addressLocality: 'Lemi Kura, Addis Ababa',
    addressCountry: 'ET',
  },
  openingHoursSpecification: {
    '@type': 'OpeningHoursSpecification',
    dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    opens: '00:00',
    closes: '23:59',
  },
  medicalSpecialty: [
    'Emergency',
    'InternalMedicine',
    'Pediatrics',
    'Obstetric',
    'Gynecologic',
    'Surgical',
    'Orthopedic',
    'Cardiovascular',
    'Radiology',
    'Dermatology',
    'Otolaryngologic',
    'Ophthalmologic',
    'Urologic',
    'Dentistry',
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <link rel="preload" href="/assets/fonts/montserrat-var.woff2" as="font" type="font/woff2" crossOrigin="" />
        <link rel="stylesheet" href="/assets/css/styles.css" precedence="default" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(HOSPITAL_SCHEMA) }}
        />

        <a className="skip-link" href="#main">Skip to main content</a>
        <SiteHeader />
        <main id="main">{children}</main>
        <SiteFooter />
        <ContactRail />
      </body>
    </html>
  );
}
