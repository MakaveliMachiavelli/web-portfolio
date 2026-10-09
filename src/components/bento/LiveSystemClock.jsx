import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

export default function LiveSystemClock() {
  const [time, setTime] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(
        new Intl.DateTimeFormat('en-US', {
          timeZone: 'Asia/Manila',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true,
        }).format(now)
      );
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-black/50 border border-white/10 text-[#FF8C33]">
      <Clock className="w-3.5 h-3.5 text-[#FF6B00]" />
      <span>GMT+8 {time || '08:00 AM'}</span>
    </div>
  );
}
