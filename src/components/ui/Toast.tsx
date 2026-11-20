'use client';
import { useStore } from '@/hooks/useStore';

/** Toast — ข้อความแจ้งเตือนมุมล่าง (อ่านจาก store.ui.toast) */
export function Toast() {
  const { ui } = useStore();
  if (!ui.toast) return null;
  return (
    <div
      role="status"
      className="fixed bottom-6 left-1/2 z-[10000] -translate-x-1/2 rounded-[10px] bg-accent px-5 py-2.5 font-semibold text-[#04130A]"
    >
      {ui.toast}
    </div>
  );
}
