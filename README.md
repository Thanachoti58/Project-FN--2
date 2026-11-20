# M-Bond · ระบบตราสารหนี้ (Next.js)

แปลงจากไฟล์ HTML เดี่ยว (`M-Bond_ระบบตราสารหนี้.html`) เป็นโปรเจค **Next.js 14 (App Router) + React + TypeScript**
ใช้สไตล์ด้วย **Tailwind CSS + twin.macro (styled-components)** และเตรียมโครงรองรับ **TailGrids**

## เริ่มใช้งาน

```bash
npm install
npm run dev        # http://localhost:3000
npm run build && npm start
npm run typecheck
```

บัญชีทดลอง (รหัสผ่าน `pass` ทุกบัญชี):
`admin` · `document` · `manager` · `user` (บริษัท xxx) · `user2` (บริษัท yyy)

## โครงสร้างโฟลเดอร์

```
public/images/            โลโก้และภาพประกอบ
src/
├─ app/                   ── ROUTING (Next.js App Router)
│  ├─ layout.tsx          Root layout: ฟอนต์, Registry (twin), AppGate, Toast
│  ├─ globals.css         Tailwind + base style + สไตล์หน้า Login + print
│  ├─ page.tsx            "/" → redirect /login
│  ├─ login/page.tsx      หน้าเข้าสู่ระบบ
│  └─ (dashboard)/        กลุ่มหน้าหลังล็อกอิน (ใช้ AppShell เดียวกัน)
│     ├─ layout.tsx       AppShell + Suspense
│     └─ <view>/page.tsx  1 โฟลเดอร์ = 1 หน้า (home, users, onew, rapp ...) — ไฟล์สั้น ๆ ชี้ไป features
├─ features/              ── หน้าจอแยกตามบทบาท
│  ├─ shared/   HomeView, LogView, TrackView, LogTable
│  ├─ admin/    UsersView, PublishedDocsView
│  ├─ officer/  ReceiveDocsView, ReceiveTable
│  ├─ company/  NewBondView(+Fields, AttachTree), TemplatesView, ProjectsView, ReopenView,
│  │            EditListView, UploadDocsView, SendView, HistoryView
│  └─ reviewer/ ReviewData/Attachments, Return, Approve, Publish, Template(New/Edit/Format/Versions)
├─ components/            ── ชิ้นส่วน UI ใช้ซ้ำ
│  ├─ ui/       Button, Badge, Card (twin.macro) · Field, Modal, Toast, KpiCard, PageHeader, DataTable ...
│  ├─ layout/   AppGate, AppShell, Sidebar, Header, SearchResults
│  ├─ bond/     BondTable, SymbolLink
│  ├─ template/ TreeRow, TemplatePreview, DocChecklist
│  └─ modals/   Prompt, Version, Archive, BondDetail, FilePreview, GlobalModals
├─ store/                 ── ข้อมูลและ logic ทางธุรกิจ (ไม่ผูกกับ React)
│  ├─ seed.ts             ข้อมูลตัวอย่าง
│  ├─ store.ts            state กลาง + localStorage/IndexedDB + subscribe/emit
│  ├─ selectors.ts        ฟังก์ชันอ่าน/คำนวณ (need, missingDocs, crossCheck, bondView ...)
│  └─ actions/            ui · auth · users · templates · bonds (workflow เอกสาร)
├─ hooks/       useStore (useSyncExternalStore), useQueryParam
├─ lib/         tree, format, blobs, viewKpis, registry (styled-components SSR)
├─ constants/   roles+เมนู, status, bondFields, bondTerms
└─ types/       ชนิดข้อมูลทั้งหมด
```

## แนวคิดสำคัญ

- **1 view เดิม = 1 route** เช่น `/orecv`, `/onew` — สิทธิ์เข้าหน้าตรวจใน `AppShell` ด้วย `canAccess(role, view)`
- **State**: store กลางแก้ข้อมูลแบบ in-place แล้ว `emit()` ให้ React render ใหม่ (`useStore()`).
  ทุก View ต้องเรียก `useStore()` เพื่อ subscribe. ข้อมูลระบบบันทึกใน `localStorage` และเนื้อหาไฟล์แนบจริงบันทึกใน `IndexedDB`
- ไฟล์ PDF ที่แนบเปิดดูได้จริงในหน้าพรีวิว ส่วน ZIP ดาวน์โหลดเพื่อเปิดดูได้; ไฟล์เก็บในเบราว์เซอร์เครื่อง/โปรไฟล์ที่แนบ
- ส่งค่าระหว่างหน้าใช้ query string: `/onew?tpl=TPL-01`, `/oup?doc=DB-015`, `/tfmt?tpl=TPL-05`
- แสดงผลเฉพาะฝั่ง client หลัง `AppGate` โหลดข้อมูลแล้ว (กัน hydration mismatch)

## สไตล์: Tailwind / twin.macro / TailGrids

- **Tailwind**: ใช้ `className` เป็นหลัก — design token อยู่ใน `tailwind.config.js`
  (`bg-surface`, `bg-card`, `border-line`, `text-accent`, `text-muted` ...)
- **twin.macro**: ใช้ใน `components/ui/{Button,Badge,Card}.tsx` (`tw` + `styled`) ตั้งค่าที่ `.babelrc`,
  `package.json > babelMacros`, `twin.d.ts`, `lib/registry.tsx`.
  ข้อควรรู้: twin ต้องใช้ Babel จึงใช้ `next/font` ไม่ได้ (ฟอนต์โหลดผ่าน `<link>`) และ twin อ่านได้เฉพาะ `tailwind.config.js`
- **TailGrids**: `tailwind.config.js` มี token มาตรฐานของ TailGrids (`primary`, `dark`, `body-color`, `stroke`)
  และ content glob ครอบ `src/**` — วาง component จาก TailGrids ที่ `src/components/tailgrids/` ได้เลย

## สิ่งที่ต่างจากไฟล์ HTML เดิม (ตั้งใจ)

- รหัสรายการใหม่ไม่ซ้ำกับของเดิมแม้เคยลบรายการ
- ไฟล์ที่แนบในหน้า "กรอกเอกสาร" มีลิงก์ดาวน์โหลดไฟล์จริงในหน้าต่างดูไฟล์
- ไม่ติ๊ก "จดจำการเข้าระบบ" เก็บเซสชันใน sessionStorage (รีเฟรชไม่หลุด) / ติ๊ก = localStorage
- ประวัติการลบเอกสาร (DEL) ถูกบันทึกลง localStorage ด้วย
