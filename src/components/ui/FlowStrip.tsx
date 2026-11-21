'use client';
import { useState } from 'react';
import type { Status } from '@/types';
import { FLOW, STATUS } from '@/constants';
import { countBy } from '@/lib/viewKpis';
import { scopeBonds } from '@/store/selectors';
import { BondTable } from '@/components/bond/BondTable';

/** FlowStrip — แถบนับจำนวนเอกสารแต่ละสถานะของ workflow */
export function FlowStrip({ highlight }: { highlight?: Status }) {
  const [selected, setSelected] = useState<Status | null>(null);
  const list = selected ? scopeBonds().filter((bond) => bond.s === selected) : [];

  return (
    <>
      <div className="mb-4 flex overflow-x-auto rounded-[14px] border border-line bg-card">
        {FLOW.map((s) => {
          const active = selected === s;
          return (
            <button
              key={s}
              type="button"
              aria-pressed={active}
              onClick={() => setSelected(active ? null : s)}
              className={`min-w-[92px] flex-1 border-r border-line p-3 text-center last:border-r-0 hover:bg-accent/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent ${
                active || (!selected && highlight === s) ? 'bg-accent/15 shadow-[inset_0_-3px_#2FE6A6]' : ''
              }`}
            >
              <b className="block text-xl">{countBy(s)}</b>
              <small className="text-[11px] text-muted">{STATUS[s][0]}</small>
            </button>
          );
        })}
      </div>
      {selected && (
        <section aria-live="polite">
          <h3>รายการสถานะ: {STATUS[selected][0]} <small className="text-muted">· คลิก Symbol เพื่อดูไฟล์แนบ</small></h3>
          <BondTable list={list} />
        </section>
      )}
    </>
  );
}
