import type { Metadata } from 'next';
import AIRecommendClient from './AIRecommendClient';

export const metadata: Metadata = {
  title: 'AI Device Recommender',
  description: 'Describe what you need in plain English and let AI recommend the best phones, tablets and laptops for you from AVSurge\'s device database.',
  alternates: {
    canonical: '/ai-recommend',
  },
  openGraph: {
    title: 'AI Device Recommender | AVSurge',
    description: 'Describe what you need in plain English and let AI recommend the best phones, tablets and laptops for you.',
    url: 'https://avsurge.com/ai-recommend',
  },
};

export default function AIRecommendPage() {
  return <AIRecommendClient />;
}
