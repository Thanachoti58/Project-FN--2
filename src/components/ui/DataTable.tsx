/** DataTable — ตารางทั่วไป (หัวตาราง + แถวเป็น ReactNode[]) */
export function DataTable({ headers, rows }: { headers: React.ReactNode[]; rows: React.ReactNode[][] }) {
  return (
    <div className="mb-5 overflow-x-auto rounded-[14px] border border-line bg-card">
      <table>
        <thead>
          <tr>
            {headers.map((h, i) => (
              <th key={i}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length ? (
            rows.map((r, i) => (
              <tr key={i}>
                {r.map((c, j) => (
                  <td key={j}>{c}</td>
                ))}
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={headers.length} className="text-muted">
                ไม่มีรายการ
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
