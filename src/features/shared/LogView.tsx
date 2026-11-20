'use client';
/** LOG — ประวัติการใช้งาน (admin ดูทั้งหมด / manager ไม่เห็นรายการเข้าสู่ระบบ) */
import { useStore } from '@/hooks/useStore';
import { PageShell } from '@/components/ui/PageHeader';
import { LogTable } from './LogTable';

export function LogView() {
  const { session } = useStore();
  const manager = session.role === 'manager';
  return (
    <PageShell
      view="log"
      title={manager ? 'ประวัติการดำเนินการ' : 'ประวัติการใช้งาน'}
      subtitle="บันทึกทุกการดำเนินการในระบบ"
    >
      <LogTable filter={manager ? (l) => l.c !== 'sys' : undefined} />
    </PageShell>
  );
}
