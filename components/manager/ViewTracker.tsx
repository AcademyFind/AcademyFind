'use client';
import { trackInstituteView, startVisitTracker, updateVisitDuration } from '@/lib/User/manager/track';
import { useEffect, useRef } from 'react';

export default function ViewTracker({ instituteId }: { instituteId: string }) {
  const visitIdRef = useRef<string | null>(null);

  useEffect(() => {
    // 1. Existing View Count increment (Legacy)
    trackInstituteView(instituteId);

    // 2. Detailed Analytics (City, Device)
    const initDetailedTracking = async () => {
      const vId = await startVisitTracker(instituteId);
      if (vId) {
        visitIdRef.current = vId;
      }
    };
    initDetailedTracking();

    // 3. Heartbeat for time spent (Every 10 seconds)
    const heartbeatInterval = setInterval(() => {
      if (visitIdRef.current) {
        updateVisitDuration(visitIdRef.current, 10);
      }
    }, 10000);

    return () => clearInterval(heartbeatInterval);
  }, [instituteId]);

  return null;
}