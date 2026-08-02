import type { Metadata } from 'next';
import SearchClient from './SearchClient';

export const metadata: Metadata = {
  title: 'Search & Discover Phones, Tablets and Laptops',
  description: 'Search and filter phones, tablets and laptops by brand, budget, RAM, storage and more. Or use AI search to find the perfect device in plain English.',
  alternates: {
    canonical: '/search',
  },
  openGraph: {
    title: 'Search & Discover Devices | AVSurge',
    description: 'Search and filter phones, tablets and laptops by brand, budget, RAM, storage and more.',
    url: 'https://avsurge.com/search',
  },
};

export default function SearchPage() {
  return <SearchClient />;
}
