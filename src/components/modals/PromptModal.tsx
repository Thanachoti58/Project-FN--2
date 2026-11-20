'use client';
/** PromptModal — modal ถามข้อความ (ชื่อ / เหตุผล) ใช้ผ่าน ask() ใน store */
import { useEffect, useRef } from 'react';
import { closePrompt } from '@/store';
import type { PromptModalState } from '@/types';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input, Textarea } from '@/components/ui/Field';

export function PromptModal({ modal }: { modal: PromptModalState }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const areaRef = useRef<HTMLTextAreaElement>(null);
  useEffect(() => {
    (inputRef.current ?? areaRef.current)?.focus();
  }, []);
  const submit = () => closePrompt(true, (inputRef.current ?? areaRef.current)?.value ?? '');

  return (
    <Modal>
      <h3>{modal.title}</h3>
      {modal.area ? (
        <Textarea ref={areaRef} rows={4} defaultValue={modal.value} />
      ) : (
        <Input
          ref={inputRef}
          className="w-full"
          defaultValue={modal.value}
          onKeyDown={(e) => e.key === 'Enter' && submit()}
        />
      )}
      <div className="mt-3.5 text-right">
        <Button variant="outline" onClick={() => closePrompt(false, '')}>
          ยกเลิก
        </Button>
        <Button onClick={submit}>ยืนยัน</Button>
      </div>
    </Modal>
  );
}
