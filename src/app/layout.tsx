/**
 * ROOT LAYOUT — ครอบทุกหน้า
 *  - โหลดฟอนต์ Noto Sans Thai (ใช้ <link> เพราะโปรเจคใช้ Babel/twin.macro จึงใช้ next/font ไม่ได้)
 *  - StyledComponentsRegistry สำหรับ twin.macro
 *  - AppGate โหลดข้อมูลจาก localStorage ก่อนแสดงหน้าที่ต้องใช้ session
 *  - Toast แสดงข้อความแจ้งเตือนทุกหน้า
 */
import type { Metadata, Viewport } from 'next';
// @ts-ignore Next.js handles this global stylesheet side-effect import.
import './globals.css';
import StyledComponentsRegistry from '@/lib/registry';
import { AppGate } from '@/components/layout/AppGate';
import { Toast } from '@/components/ui/Toast';

export const metadata: Metadata = {
  title: 'M-Bond ระบบตราสารหนี้',
  description: 'ระบบจัดการตราสารหนี้และเอกสาร (Thai Bond Management System)',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="th">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link
          href="https://fonts.googleapis.com/css2?family=Noto+Sans+Thai:wght@400;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <StyledComponentsRegistry>
          <AppGate>{children}</AppGate>
          <Toast />
        </StyledComponentsRegistry>
      </body>
    </html>
  );
}
