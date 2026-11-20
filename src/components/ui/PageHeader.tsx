import { KpiGrid, KpiCard } from './KpiCard';
import { FlowStrip } from './FlowStrip';
import { VIEW_KPIS, FLOW_VIEWS, HIGHLIGHT } from '@/lib/viewKpis';

/** PageHeader — หัวข้อหน้า (การ์ดมีแถบเขียวด้านซ้าย) */
export function PageHeader({ title, subtitle, actions }: { title: React.ReactNode; subtitle?: React.ReactNode; actions?: React.ReactNode }) {
  return (
    <div className="mb-4 flex flex-wrap items-start justify-between gap-4 rounded-2xl border border-line border-l-4 border-l-accent bg-[linear-gradient(135deg,#0E2F2B,#0E2624)] px-[22px] py-[18px]">
      <div>
        <h2 className="mb-1 mt-0 text-[22px]">{title}</h2>
        {subtitle ? <p className="m-0 text-muted">{subtitle}</p> : null}
      </div>
      {actions ? <div>{actions}</div> : null}
    </div>
  );
}

/**
 * PageShell — โครงมาตรฐานของทุกหน้า:
 *   หัวข้อ → แถบ KPI (ตาม view) → แถบสถานะ workflow (บางหน้า) → เนื้อหา
 */
export function PageShell({
  view,
  title,
  subtitle,
  actions,
  children,
  hideDeck = false,
}: {
  view: string;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  actions?: React.ReactNode;
  children: React.ReactNode;
  hideDeck?: boolean;
}) {
  const kpis = hideDeck ? [] : VIEW_KPIS[view]?.() ?? [];
  return (
    <div className="flex flex-col">
      <PageHeader title={title} subtitle={subtitle} actions={actions} />
      {kpis.length > 0 && (
        <KpiGrid>
          {kpis.map((k) => (
            <KpiCard key={k.label} label={k.label} value={k.value} color={k.color} icon={k.icon} />
          ))}
        </KpiGrid>
      )}
      {!hideDeck && FLOW_VIEWS.has(view) && <FlowStrip highlight={HIGHLIGHT[view]} />}
      {children}
    </div>
  );
}
