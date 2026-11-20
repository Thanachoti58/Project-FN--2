'use client';
import type { Bond } from '@/types';
import { openDetail } from '@/store';

/** ลิงก์ Symbol — คลิกเพื่อเปิดหน้ารายละเอียดตราสารหนี้ */
export function SymbolLink({ bond }: { bond: Bond }) {
  return (
    <button
      type="button"
      className="cursor-pointer border-0 bg-transparent p-0 font-semibold text-accent underline underline-offset-[3px] hover:text-white"
      title="ดูรายละเอียดตราสารหนี้"
      onClick={() => openDetail(bond.id)}
    >
      {bond.symbol || '-'}
    </button>
  );
}
