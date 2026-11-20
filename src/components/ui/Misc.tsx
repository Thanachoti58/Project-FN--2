/** องค์ประกอบเล็ก ๆ ที่ใช้ซ้ำ: SectionTitle, Notice, ProgressBar, Muted, KeyValue */
export function SectionTitle({ children, muted = false, className = '' }: { children: React.ReactNode; muted?: boolean; className?: string }) {
  return <h3 className={`${muted ? '!text-muted' : ''} ${className}`}>{children}</h3>;
}

export function Notice({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-5 flex items-start gap-2.5 rounded-xl border border-brand bg-deep px-3.5 py-3 text-[#bcebdc]">
      <b className="text-accent">{title}</b>
      <span>{children}</span>
    </div>
  );
}

export function ProgressBar({ value, className = '' }: { value: number; className?: string }) {
  return (
    <div className={`h-1.5 min-w-[80px] rounded-[3px] bg-line ${className}`}>
      <i className="block h-1.5 rounded-[3px] bg-accent" style={{ width: `${value}%` }} />
    </div>
  );
}

export const Muted = ({ children }: { children: React.ReactNode }) => <p className="m-0 text-muted">{children}</p>;

/** แถว "ชื่อ — ค่า" ในหน้ารายละเอียด */
export function KeyValue({ k, v }: { k: React.ReactNode; v: React.ReactNode }) {
  return (
    <div className="flex justify-between gap-4 border-b border-line py-2">
      <span className="text-muted">{k}</span>
      <span className="text-right">{v}</span>
    </div>
  );
}
