/**
 * Field / Input / Select / Textarea — ช่องกรอกแบบมาตรฐาน (Tailwind)
 * ใช้ class เดียวกันทุกที่เพื่อให้หน้าตาสม่ำเสมอ
 */
import { forwardRef } from 'react';
import type { InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react';

export const controlClass =
  'rounded-lg border border-line bg-card px-2.5 py-[9px] text-ink outline-none focus:border-accent focus:shadow-[0_0_0_3px_rgba(47,230,166,.15)]';

/** ป้ายกำกับ + ช่องกรอก (children) */
export function Field({ label, children, className = '' }: { label: React.ReactNode; children: React.ReactNode; className?: string }) {
  return (
    <label className={`grid gap-1.5 text-xs text-muted ${className}`}>
      {label}
      {children}
    </label>
  );
}

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(function Input(
  { className = '', ...p },
  ref,
) {
  return <input ref={ref} className={`${controlClass} ${className}`} {...p} />;
});

export function Select({ className = '', ...p }: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select className={`${controlClass} ${className}`} {...p} />;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(function Textarea(
  { className = '', ...p },
  ref,
) {
  return <textarea ref={ref} className={`${controlClass} w-full ${className}`} {...p} />;
});
