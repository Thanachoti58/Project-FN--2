'use client';
/** SearchResults — ผลการค้นหาจากช่องค้นหาด้านบน (แทนที่เนื้อหาหน้าเมื่อมีคำค้น) */
import { useStore } from '@/hooks/useStore';
import { scopeBonds } from '@/store/selectors';
import { issuerLabel } from '@/lib/format';
import { BondTable } from '@/components/bond/BondTable';
import { PageHeader } from '@/components/ui/PageHeader';

export function SearchResults() {
  const { ui } = useStore();
  const q = ui.q.trim().toLowerCase();
  const list = scopeBonds().filter((d) =>
    (d.id + d.symbol + d.n + d.co + d.kind + d.tenor + d.termGroup + issuerLabel(d) + (d.date || '')).toLowerCase().includes(q),
  );
  return (
    <div>
      <PageHeader title="ผลการค้นหา" subtitle={`"${ui.q.trim()}"`} />
      <BondTable list={list} />
    </div>
  );
}
