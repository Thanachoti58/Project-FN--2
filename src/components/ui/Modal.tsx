'use client';
/** Modal — หน้าต่างลอยกลางจอ (overlay ดำโปร่ง) */
export function Modal({ children, maxWidth = 440 }: { children: React.ReactNode; maxWidth?: number }) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-[#000a] p-4" role="dialog" aria-modal="true">
      <div
        className="max-h-[90vh] w-full overflow-auto rounded-[14px] border border-line bg-card p-5"
        style={{ maxWidth }}
      >
        {children}
      </div>
    </div>
  );
}
