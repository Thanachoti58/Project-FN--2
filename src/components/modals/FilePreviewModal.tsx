'use client';
/** FilePreviewModal — แสดงไฟล์ PDF ที่แนบจริง หรือดาวน์โหลดไฟล์ ZIP */
import { useEffect, useState } from 'react';
import { closePreview } from '@/store';
import type { FilePreview } from '@/store/store';
import { Button } from '@/components/ui/Button';
import { getBlob } from '@/lib/blobs';

export function FilePreviewModal({ preview }: { preview: FilePreview }) {
  const [href, setHref] = useState<string>();
  const [error, setError] = useState('');
  useEffect(() => {
    let active = true;
    setHref(preview.href);
    setError('');
    if (!preview.href && preview.blobKey) {
      getBlob(preview.blobKey).then((url) => {
        if (!active) return;
        if (url) setHref(url);
        else setError('ไม่พบไฟล์จริง กรุณาแนบเอกสารนี้ใหม่');
      }).catch(() => {
        if (active) setError('เปิดไฟล์ไม่สำเร็จ กรุณาลองใหม่หรือติดต่อผู้ดูแลระบบ');
      });
    } else if (!preview.href) {
      setError('ไม่มีข้อมูลไฟล์จริง กรุณาแนบเอกสารนี้ใหม่');
    }
    return () => { active = false; };
  }, [preview.href, preview.blobKey]);
  const isPdf = /\.pdf$/i.test(preview.name);

  return (
    <div className="fixed inset-0 z-[9999] flex flex-col bg-surface">
      <div className="flex flex-wrap items-center gap-2 border-b border-line px-4 py-2.5">
        <b className="min-w-[120px] flex-1 truncate">{preview.name}</b>
        {href && (
          <a className="inline-flex" href={href} download={preview.name}>
            <span className="rounded-lg border border-line px-3.5 py-2 text-ink">ดาวน์โหลดไฟล์ที่แนบ</span>
          </a>
        )}
        <Button onClick={closePreview}>ปิด</Button>
      </div>
      <div className="flex-1 overflow-auto bg-white p-4 text-center text-slate-900">
        {!href && !error && <p>กำลังเปิดไฟล์...</p>}
        {error && <p role="alert">{error}</p>}
        {href && isPdf && <iframe src={href} title={preview.name} className="h-full min-h-[70vh] w-full border-0" />}
        {href && !isPdf && <p>ไฟล์ ZIP ไม่สามารถแสดงเนื้อหาในเบราว์เซอร์ได้ กรุณาดาวน์โหลดไฟล์เพื่อเปิดดู</p>}
      </div>
    </div>
  );
}
