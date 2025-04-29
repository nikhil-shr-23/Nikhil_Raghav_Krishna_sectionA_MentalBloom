'use client';

import dynamic from 'next/dynamic';

// Use dynamic import to avoid hydration issues
const JournalPage = dynamic(() => import('@/components/Journal/JournalPage'), {
  ssr: false,
  loading: () => <div className="p-8 text-center">Loading journal...</div>
});

export default function Journal() {
  return (
    <div className="container mx-auto">
      <JournalPage />
    </div>
  );
}
