import { useState } from 'react';
import DailyAzkarBar from '../DailyAzkarBar';
import type { PrayerSegment } from '@/lib/types';

export default function DailyAzkarBarExample() {
  const [selectedPrayer, setSelectedPrayer] = useState<PrayerSegment>('dhuhr');
  const today = new Date().toISOString().split('T')[0];

  // Пример данных для демо
  const exampleDailyAzkar = {
    userId: 'example',
    dateLocal: today,
    fajr: 99,
    dhuhr: 67,
    asr: 0,
    maghrib: 0,
    isha: 0,
    total: 166,
    isComplete: false,
  };

  return (
    <DailyAzkarBar
      dailyAzkar={exampleDailyAzkar}
      targetPerPrayer={99}
      selectedPrayer={selectedPrayer}
      onPrayerSelect={(prayer) => {
        setSelectedPrayer(prayer);
        console.log(`Selected prayer: ${prayer}`);
      }}
    />
  );
}
