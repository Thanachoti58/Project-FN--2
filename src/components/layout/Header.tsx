'use client';
/** Header — ช่องค้นหา (Ctrl+K) / แจ้งเตือน / ข้อมูลผู้ใช้ / ออกจากระบบ */
import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ROLES } from '@/constants';
import { logout, setSearch } from '@/store';
import { useStore } from '@/hooks/useStore';
import { Icon } from '@/components/ui/Icon';
import { Button } from '@/components/ui/Button';

export function Header() {
  const { session, ui } = useStore();
  const router = useRouter();
  const searchRef = useRef<HTMLInputElement>(null);
  const role = ROLES[session.role];

  // Ctrl/⌘ + K = โฟกัสช่องค้นหา
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        searchRef.current?.focus();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  const bellTarget = ['officer', 'company'].includes(session.role) ? '/otrk' : '/log';

  return (
    <header className="flex items-center gap-4 border-b border-line px-6 py-3.5">
      <div className="flex max-w-[560px] flex-1 items-center gap-2 rounded-[10px] bg-card px-3">
        <Icon name="srch" />
        <input
          ref={searchRef}
          className="!flex-1 !border-0 !bg-transparent !px-0 !py-[11px] outline-none focus:!shadow-none"
          placeholder="ค้นหาเอกสาร / เลขที่เอกสาร / บริษัท ..."
          value={ui.q}
          onChange={(e) => setSearch(e.target.value)}
        />
        <kbd className="rounded-[5px] bg-line px-1.5 py-0.5 text-[11px] text-muted max-[800px]:hidden">Ctrl K</kbd>
      </div>

      <button
        type="button"
        aria-label="การแจ้งเตือน"
        onClick={() => router.push(bellTarget)}
        className="relative ml-auto min-h-[44px] min-w-[44px] cursor-pointer border-0 bg-transparent text-ink"
      >
        <Icon name="bell" />
        <u className="absolute right-2.5 top-2 h-2 w-2 rounded-full bg-accent" />
      </button>

      <div className="flex items-center gap-2.5">
        <i className="grid h-9 w-9 place-items-center rounded-full bg-avatar not-italic">
          <Icon name="user" />
        </i>
        <div>
          <b>{session.user?.n}</b>
          <small className="block text-[11px] text-muted max-[800px]:hidden">
            {role.name}
            {session.role === 'company' ? ' · ' + session.co : ''}
          </small>
        </div>
        <Button variant="outline" onClick={logout}>
          ออกจากระบบ
        </Button>
      </div>
    </header>
  );
}
