/** TreeRow — แถวหัวข้อของ Template (เลขหัวข้อ + ชื่อ + ส่วนท้าย) ย่อหน้าตามความลึก */
export function TreeRow({
  no,
  depth,
  title,
  children,
  hint,
}: {
  no: string;
  depth: number;
  title: React.ReactNode;
  /** ปุ่ม/สถานะด้านขวา */
  children?: React.ReactNode;
  /** ข้อความเล็กต่อจากชื่อ */
  hint?: React.ReactNode;
}) {
  return (
    <div
      className="flex flex-wrap items-center gap-2.5 rounded-[10px] border border-line bg-card px-3 py-[9px]"
      style={{ marginLeft: depth * 24 }}
    >
      <b className="min-w-[34px] text-accent">{no}</b>
      <span className="min-w-[140px] flex-1">{title}</span>
      {hint ? <em className="text-xs not-italic text-muted">{hint}</em> : null}
      {children}
    </div>
  );
}

/** กลุ่มปุ่มชิดขวาของแถว */
export const RowActions = ({ children }: { children: React.ReactNode }) => (
  <span className="ml-auto flex flex-wrap gap-1.5 [&>button+button]:ml-0">{children}</span>
);
