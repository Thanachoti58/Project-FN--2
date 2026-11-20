import { Icon, type IconName } from './Icon';

/** KpiCard — การ์ดตัวเลขสรุป (clickable ถ้าส่ง onClick) */
export function KpiCard({
  label,
  value,
  color,
  icon,
  onClick,
}: {
  label: string;
  value: React.ReactNode;
  color: string;
  icon: IconName;
  onClick?: () => void;
}) {
  const cls =
    'relative flex flex-col gap-1.5 overflow-hidden rounded-2xl border border-line bg-card p-[18px] text-left text-muted transition after:pointer-events-none after:absolute after:-bottom-[30px] after:-right-5 after:h-[90px] after:w-[90px] after:rounded-full after:bg-[var(--c)] after:opacity-[.12] after:content-[""]';
  const inner = (
    <>
      <span
        className="grid h-9 w-9 place-items-center rounded-[10px]"
        style={{ color, background: `color-mix(in srgb, ${color} 16%, transparent)` }}
      >
        <Icon name={icon} />
      </span>
      <b className="text-[34px] leading-none" style={{ color }}>
        {value}
      </b>
      <small>{label}</small>
    </>
  );
  const style = { '--c': color } as React.CSSProperties;
  return onClick ? (
    <button type="button" onClick={onClick} style={style} className={`${cls} cursor-pointer hover:-translate-y-0.5 hover:border-[var(--c)]`}>
      {inner}
    </button>
  ) : (
    <div style={style} className={cls}>
      {inner}
    </div>
  );
}

export const KpiGrid = ({ children }: { children: React.ReactNode }) => (
  <div className="mb-5 grid grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-3.5">{children}</div>
);
