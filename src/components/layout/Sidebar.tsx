'use client';
/** Sidebar — เมนูซ้ายตามบทบาทผู้ใช้ (บนมือถือเป็นแถบแนวนอน) */
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { IMAGES, ROLES } from '@/constants';
import { useStore } from '@/hooks/useStore';
import { Icon } from '@/components/ui/Icon';

export function Sidebar() {
  const { session } = useStore();
  const pathname = usePathname();
  const role = ROLES[session.role];
  const isCompany = session.role === 'company';

  return (
    <aside className="flex w-[250px] shrink-0 flex-col gap-1.5 border-r border-line bg-panel px-3 py-[18px] max-[800px]:w-full max-[800px]:flex-row max-[800px]:overflow-x-auto max-[800px]:p-2">
      {/* โลโก้ */}
      <div className="flex items-center gap-3 px-2 pb-4 pt-1 max-[800px]:hidden">
        <Image src={IMAGES.mark} alt="M-Bond" width={46} height={35} className="h-auto w-[46px] flex-none" />
        <div>
          <b className="block text-[17px]">M-Bond</b>
          <small className="text-[11px] text-muted">ระบบตราสารหนี้</small>
        </div>
      </div>

      {/* เมนู */}
      {role.menu.map((m) => {
        const active = pathname === '/' + m.view;
        return (
          <Link
            key={m.view}
            href={'/' + m.view}
            className={`flex w-full items-center gap-3 rounded-[10px] px-3 py-[11px] text-left hover:bg-card max-[800px]:w-auto max-[800px]:whitespace-nowrap ${
              active ? 'bg-brand font-semibold' : ''
            }`}
          >
            <Icon name={m.icon} />
            {m.label}
          </Link>
        );
      })}

      {/* กล่องบริษัท / หน่วยงาน */}
      <div className="mt-auto flex items-center gap-2.5 rounded-xl bg-card p-2.5 max-[800px]:hidden">
        <i className="grid h-[34px] w-[34px] place-items-center rounded-full bg-avatar text-xs not-italic">
          {isCompany ? 'CO' : 'DM'}
        </i>
        <div>
          {isCompany ? session.co : 'ระบบเอกสารตราสารหนี้'}
          <small className="block text-[11px] text-muted">{role.title}</small>
        </div>
      </div>
    </aside>
  );
}
