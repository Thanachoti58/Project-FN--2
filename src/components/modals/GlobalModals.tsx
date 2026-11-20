'use client';
/** GlobalModals — รวม modal ทั้งหมดที่เปิดได้จากทุกหน้า (ควบคุมด้วย store.ui) */
import { useStore } from '@/hooks/useStore';
import { ArchiveModal } from './ArchiveModal';
import { BondDetailModal } from './BondDetailModal';
import { FilePreviewModal } from './FilePreviewModal';
import { PromptModal } from './PromptModal';
import { VersionModal } from './VersionModal';

export function GlobalModals() {
  const { ui } = useStore();
  return (
    <>
      {ui.dm && <BondDetailModal id={ui.dm} />}
      {ui.vm && <VersionModal vm={ui.vm} />}
      {ui.av && <ArchiveModal id={ui.av.id} version={ui.av.v} />}
      {ui.modal && <PromptModal modal={ui.modal} />}
      {ui.preview && <FilePreviewModal preview={ui.preview} />}
    </>
  );
}
