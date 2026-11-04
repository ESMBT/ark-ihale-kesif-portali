import { useState } from 'react'
import { PillTabs } from '../../components/ui/PillTabs'

/* =================================================================
   EKİP YÖNETİMİ — ihale modülü
   -----------------------------------------------------------------
   Kabuk ekranı: başlık + 4 sekme. Sekme içerikleri sonraki
   aşamada tasarlanacak (ihale paketi kontrol, ihale ataması ve
   yönetimi, yönetici onayı ve kararlar, ihale takip ve kontrol).
   ================================================================= */

const sekmeler = [
  { key: 'ihale-paketi-kontrol', label: 'İhale Paketi Kontrol' },
  { key: 'ihale-atama-yonetimi', label: 'İhale Ataması ve Yönetimi' },
  { key: 'yonetici-onayi-kararlari', label: 'Yönetici Onayı ve Kararlar' },
  { key: 'ihale-takip-kontrol', label: 'İhale Takip ve Kontrol' },
]

export function EkipYonetimiPage() {
  const [sekme, setSekme] = useState(sekmeler[0].key)

  return (
    <>
      {/* Başlık */}
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <h2 className="font-heading text-[30px] leading-10 font-bold text-black">Ekip Yönetimi</h2>
      </div>

      {/* Sekmeler */}
      <div className="mb-6">
        <PillTabs active={sekme} onChange={setSekme} items={sekmeler} />
      </div>

      {/* Sekme içerikleri — sonraki aşamada tasarlanacak */}
      <div className="min-h-[320px]" aria-label={sekmeler.find((s) => s.key === sekme)?.label} />
    </>
  )
}
