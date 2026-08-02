import type { Metadata } from 'next';
import CompareLaptopsClient from './CompareLaptopsClient';

export const metadata: Metadata = {
  title: 'Compare Laptops Side by Side',
  description: 'Compare specs, prices, performance, graphics and battery life of any two laptops side by side. Get an AI-powered verdict on which laptop is better for you.',
  alternates: {
    canonical: '/compare-laptops',
  },
  openGraph: {
    title: 'Compare Laptops Side by Side | AVSurge',
    description: 'Compare specs, prices, performance, graphics and battery life of any two laptops side by side.',
    url: 'https://avsurge.com/compare-laptops',
  },
};

export default function CompareLaptopsPage() {
  return <CompareLaptopsClient />;
}
