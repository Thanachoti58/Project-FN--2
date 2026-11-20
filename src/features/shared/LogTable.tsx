'use client';
import type { LogEntry } from '@/types';
import { useStore } from '@/hooks/useStore';
import { DataTable } from '@/components/ui/DataTable';

/** ตารางประวัติการใช้งาน (กรองด้วย filter ได้) */
export function LogTable({ filter }: { filter?: (l: LogEntry) => boolean }) {
  const { data } = useStore();
  const rows = data.L.filter(filter ?? (() => true));
  return <DataTable headers={['วันที่และเวลา', 'ผู้ใช้', 'รายการ']} rows={rows.map((l) => [l.t, l.u, l.a])} />;
}
