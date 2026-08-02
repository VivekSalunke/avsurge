import type { Metadata } from 'next';
import CompareClient from './CompareClient';

export const metadata: Metadata = {
  title: 'Compare Phones Side by Side',
  description: 'Compare specs, prices, camera, battery and performance of any two phones side by side. Get an AI-powered verdict on which phone is better for you.',
  alternates: {
    canonical: '/compare',
  },
  openGraph: {
    title: 'Compare Phones Side by Side | AVSurge',
    description: 'Compare specs, prices, camera, battery and performance of any two phones side by side.',
    url: 'https://avsurge.com/compare',
  },
};

export default function ComparePage() {
  return <CompareClient />;
}
