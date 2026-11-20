/**
 * DASHBOARD LAYOUT — ใช้กับทุกหน้าหลังล็อกอิน (home, users, onew ...)
 * Suspense จำเป็นเพราะบางหน้าอ่าน query string (useSearchParams)
 */
import { Suspense } from 'react';
import { AppShell } from '@/components/layout/AppShell';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppShell>
      <Suspense fallback={null}>{children}</Suspense>
    </AppShell>
  );
}
