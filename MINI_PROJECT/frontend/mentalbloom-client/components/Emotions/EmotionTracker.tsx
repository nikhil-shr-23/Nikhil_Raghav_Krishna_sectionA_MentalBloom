'use client';

import React, { useState } from 'react';
import { EmotionLogger } from './EmotionLogger';
import { EmotionChart } from './EmotionChart';

export function EmotionTracker() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleEmotionLogged = () => {
    // Increment the refresh trigger to cause the chart to reload
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <div className="space-y-6">
      <EmotionLogger onEmotionLogged={handleEmotionLogged} />
      <EmotionChart refreshTrigger={refreshTrigger} />
    </div>
  );
}
