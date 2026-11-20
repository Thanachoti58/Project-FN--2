'use client';
/**
 * AppShell — โครงหน้าหลังล็อกอิน: Sidebar + Header + เนื้อหา + Modal กลาง
 * ทำหน้าที่ป้องกันสิทธิ์: ยังไม่ล็อกอิน → /login, เข้าหน้าที่บทบาทไม่มีสิทธิ์ → /home
 */
import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { canAccess } from '@/constants';
import { setSearch } from '@/store';
import { useStore } from '@/hooks/useStore';
import { GlobalModals } from '@/components/modals/GlobalModals';
import { Header } from './Header';
import { SearchResults } from './SearchResults';
import { Sidebar } from './Sidebar';

export function AppShell({ children }: { children: React.ReactNode }) {
  const { session, ui } = useStore();
  const pathname = usePathname();
  const router = useRouter();
  const view = pathname.replace(/^\//, '');

  const allowed = !!session.user && canAccess(session.role, view);

  useEffect(() => {
    if (!session.user) router.replace('/login');
    else if (!canAccess(session.role, view)) router.replace('/home');
  }, [session.user, session.role, view, router]);

  // เปลี่ยนหน้า = ล้างคำค้น
  useEffect(() => {
    setSearch('');
  }, [pathname]);

  if (!allowed) return null;

  return (
    <div className="flex h-full max-[800px]:flex-col">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Header />
        <main className="flex-1 overflow-auto p-6">{ui.q.trim() ? <SearchResults /> : children}</main>
      </div>
      <GlobalModals />
    </div>
  );
}
