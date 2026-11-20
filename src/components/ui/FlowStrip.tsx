'use client';
import type { Status } from '@/types';
import { FLOW, STATUS } from '@/constants';
import { countBy } from '@/lib/viewKpis';

/** FlowStrip — แถบนับจำนวนเอกสารแต่ละสถานะของ workflow */
export function FlowStrip({ highlight }: { highlight?: Status }) {
  return (
    <div className="mb-4 flex overflow-x-auto rounded-[14px] border border-line bg-card">
      {FLOW.map((s) => (
        <div
          key={s}
          className={`min-w-[92px] flex-1 border-r border-line p-3 text-center last:border-r-0 ${
            highlight === s ? 'bg-accent/15 shadow-[inset_0_-3px_#2FE6A6]' : ''
          }`}
        >
          <b className="block text-xl">{countBy(s)}</b>
          <small className="text-[11px] text-muted">{STATUS[s][0]}</small>
        </div>
      ))}
    </div>
  );
}
