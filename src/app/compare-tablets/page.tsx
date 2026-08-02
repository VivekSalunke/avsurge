import type { Metadata } from 'next';
import CompareTabletsClient from './CompareTabletsClient';

export const metadata: Metadata = {
  title: 'Compare Tablets Side by Side',
  description: 'Compare specs, prices, display, battery and performance of any two tablets side by side. Get an AI-powered verdict on which tablet is better for you.',
  alternates: {
    canonical: '/compare-tablets',
  },
  openGraph: {
    title: 'Compare Tablets Side by Side | AVSurge',
    description: 'Compare specs, prices, display, battery and performance of any two tablets side by side.',
    url: 'https://avsurge.com/compare-tablets',
  },
};

export default function CompareTabletsPage() {
  return <CompareTabletsClient />;
}
