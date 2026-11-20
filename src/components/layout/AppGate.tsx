'use client';
/**
 * AppGate — โหลดข้อมูลที่บันทึกไว้ก่อนแสดงหน้าที่ต้องใช้ session
 * หน้า login แสดงได้ทันทีโดยไม่ต้องรอ localStorage
 * ทำให้ SSR กับ Client ตรงกัน (ไม่มี hydration mismatch)
 */
import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { hydrate } from '@/store';
import { useStore } from '@/hooks/useStore';

export function AppGate({ children }: { children: React.ReactNode }) {
  const store = useStore();
  const pathname = usePathname();
  useEffect(() => {
    hydrate();
  }, []);

  if (!store.hydrated && pathname !== '/login') {
    return <div className="grid h-screen place-items-center text-muted">กำลังโหลด...</div>;
  }
  return <>{children}</>;
}
