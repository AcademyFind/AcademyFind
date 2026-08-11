'use client';

import { useMobileApp } from '@/hooks/useMobileApp';

export default function MobileAppProvider() {
  useMobileApp();
  return null;
}
