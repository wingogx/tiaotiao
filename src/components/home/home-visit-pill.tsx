'use client';

import { useEffect, useState } from 'react';

export function HomeVisitPill({ initialCount }: { initialCount: number }) {
  const [visitCount, setVisitCount] = useState(initialCount);

  useEffect(() => {
    let isMounted = true;

    void fetch('/api/home-visit', {
      method: 'POST',
      cache: 'no-store',
    })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error('Failed to record home visit.');
        }

        return (await response.json()) as { visitCount?: number };
      })
      .then((payload) => {
        if (isMounted && typeof payload.visitCount === 'number') {
          setVisitCount(payload.visitCount);
        }
      })
      .catch(() => {
        // Ignore tracking failures so the homepage still renders normally.
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <span className="flex items-center gap-3">
      <span className="h-3 w-3 rounded-full bg-[#4abc91]" />
      累计访问 {visitCount.toLocaleString('zh-CN')}
    </span>
  );
}
