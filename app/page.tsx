import type { Metadata } from 'next'
import { ExecutiveLoginGateway } from '@/components/auth/executive-login-gateway'

const OG_TITLE = 'بوابة القيادة التنفيذية — ASK CREW'
const OG_DESCRIPTION = 'بوابة الدخول الآمنة للوحة تحكم القيادة التنفيذية في منصة ASK CREW.'

export const metadata: Metadata = {
  title: 'ASK CREW — بوابة القيادة التنفيذية',
  description: OG_DESCRIPTION,
  openGraph: {
    type: 'website',
    siteName: 'ASK CREW',
    locale: 'ar_AR',
    title: OG_TITLE,
    description: OG_DESCRIPTION,
    images: [
      {
        url: '/ask-crew-og.png',
        width: 1328,
        height: 1328,
        alt: 'شعار ASK CREW',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: OG_TITLE,
    description: OG_DESCRIPTION,
    images: ['/ask-crew-og.png'],
  },
}

export default function LandingPage() {
  return <ExecutiveLoginGateway />
}
