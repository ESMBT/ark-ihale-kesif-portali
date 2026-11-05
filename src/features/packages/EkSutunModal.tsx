import { useState } from 'react'
import { Button } from '../../components/ui/Button'
import { Modal } from '../../components/ui/Modal'
import type { KesifEkSutun } from '../../data/types'
import {
  ONERILEN_EK_SUTUNLAR,
  birimFiyatAciklamasi,
  maliyetBolgesi,
  yeniEkSutunAnahtari,
} from '../../lib/kesifSutunlar'

const inputCls =
  'h-9 w-full rounded-md border border-line bg-white px-2.5 text-[13px] text-ink outline-none focus:border-black focus:ring-2 focus:ring-black/10'

const SABIT_AD: Record<string, string> = { malzeme: 'Malzeme', iscilik: 'İşçilik', ggk: 'GGK' }

/**
 * Keşif tablosuna özel sütun ekleme / kaldırma. İki tür vardır:
 * - Maliyet (ör. Nakliye): Birim Fiyat toplamına eklenir.
 * - Katsayı (ör. Fittings): hemen solundaki sütunu çarpar; Birim Fiyat'ın solundaysa tüm maliyet toplamını çarpar (boş = 1).
 * Formül sütun sırasından tek yerden üretilir; hücre bazında formül yazılmaz.
 */
export function EkSutunModal({
  ekSutunlar,
  onUygula,
  onVazgec,
}: {
  ekSutunlar: KesifEkSutun[]
  onUygula: (yeni: KesifEkSutun[]) => void
  onVazgec: () => void
}) {
  const [liste, setListe] = useState<KesifEkSutun[]>(ekSutunlar)
  const [baslik, setBaslik] = useState('')
  const [tur, setTur] = useState<KesifEkSutun['tur']>('maliyet')
  const bolge = maliyetBolgesi(liste)
  const [sonra, setSonra] = useState<string>(bolge[bolge.length - 1] ?? 'ggk')

  const ad = (k: string) => liste.find((e) => e.key === k)?.baslik ?? SABIT_AD[k] ?? k
  const temizBaslik = baslik.trim()
  const cakisiyor = [...Object.values(SABIT_AD), 'Birim Fiyat', 'Toplam Tutar', 'Miktar', 'Birim', 'Level', 'Poz Kodu', 'Poz Tanımı', 'Marka / Model']
    .concat(liste.map((e) => e.baslik))
    .some((x) => x.toLocaleLowerCase('tr') === temizBaslik.toLocaleLowerCase('tr'))

  const ekle = () => {
    if (!temizBaslik || cakisiyor) return
    const yeni: KesifEkSutun = { key: yeniEkSutunAnahtari(liste), baslik: temizBaslik, tur, sonra: tur === 'metin' ? '' : sonra }
    const guncel = [...liste, yeni]
    setListe(guncel)
    setBaslik('')
    const b = maliyetBolgesi(guncel)
    setSonra(b[b.length - 1] ?? 'ggk')
  }

  const kaldir = (key: string) => {
    // Bağlı sütunlar bir önceki sütuna bağlanır
    const hedef = liste.find((e) => e.key === key)
    if (!hedef) return
    const guncel = liste
      .filter((e) => e.key !== key)
      .map((e) => (e.sonra === key ? { ...e, sonra: hedef.sonra } : e))
    setListe(guncel)
    const b = maliyetBolgesi(guncel)
    setSonra(b[b.length - 1] ?? 'ggk')
  }

  return (
    <Modal
      open
      onClose={onVazgec}
      size="md"
      title="Sütun ekle"
      description="Birim Fiyat'ı etkileyen ek maliyet ya da katsayı sütunları. Formül sütun sırasından otomatik kurulur."
      footer={
        <>
          <Button variant="ghost" onClick={onVazgec}>
            Vazgeç
          </Button>
          <Button variant="brand" icon="check" onClick={() => onUygula(liste)}>
            Uygula
          </Button>
        </>
      }
    >
      <div className="space-y-5">
        <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
          <label className="block">
            <span className="mb-1 block text-[12px] font-medium text-muted-foreground">Sütun adı</span>
            <input
              className={inputCls}
              value={baslik}
              list="ek-sutun-onerileri"
              placeholder="Örn. Nakliye, Fittings"
              onChange={(e) => {
                setBaslik(e.target.value)
                const oneri = ONERILEN_EK_SUTUNLAR.find((o) => o.baslik.toLocaleLowerCase('tr') === e.target.value.trim().toLocaleLowerCase('tr'))
                if (oneri) setTur(oneri.tur)
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') ekle()
              }}
            />
            <datalist id="ek-sutun-onerileri">
              {ONERILEN_EK_SUTUNLAR.map((o) => (
                <option key={o.baslik} value={o.baslik} />
              ))}
            </datalist>
          </label>
          <fieldset className="block">
            <legend className="mb-1 text-[12px] font-medium text-muted-foreground">Tür</legend>
            <div className="flex h-9 items-center gap-4 text-[13px]">
              <label className="flex cursor-pointer items-center gap-1.5">
                <input type="radio" name="ek-tur" checked={tur === 'maliyet'} onChange={() => setTur('maliyet')} />
                Maliyet
              </label>
              <label className="flex cursor-pointer items-center gap-1.5">
                <input type="radio" name="ek-tur" checked={tur === 'katsayi'} onChange={() => setTur('katsayi')} />
                Katsayı
              </label>
              <label className="flex cursor-pointer items-center gap-1.5">
                <input type="radio" name="ek-tur" checked={tur === 'metin'} onChange={() => setTur('metin')} />
                Metin
              </label>
            </div>
          </fieldset>
        </div>

        <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
          <label className="block">
            <span className="mb-1 block text-[12px] font-medium text-muted-foreground">Şu sütunun sağına</span>
            <select className={inputCls} value={sonra} disabled={tur === 'metin'} onChange={(e) => setSonra(e.target.value)}>
              {bolge.map((k) => (
                <option key={k} value={k}>
                  {ad(k)}
                </option>
              ))}
            </select>
          </label>
          <div className="flex items-end">
            <Button variant="secondary" icon="plus" disabled={!temizBaslik || cakisiyor} onClick={ekle}>
              Ekle
            </Button>
          </div>
        </div>
        {cakisiyor && temizBaslik && (
          <p className="-mt-3 text-[12px] text-danger">Bu ada sahip bir sütun zaten var.</p>
        )}

        <p className="rounded-xl border border-line bg-surface-soft px-3 py-2 text-[12px] leading-5 text-muted-foreground">
          <strong className="text-ink">Maliyet</strong> sütunu Birim Fiyat toplamına eklenir.{' '}
          <strong className="text-ink">Katsayı</strong> sütunu hemen solundaki sütunu çarpar; Birim Fiyat’ın hemen
          solundaysa tüm maliyet toplamını çarpar (boş bırakılırsa 1). <strong className="text-ink">Metin</strong>{' '}
          sütunu fiyatı etkilemez (ör. İşveren Kodu) ve Marka / Model’den sonra gelir.
        </p>

        <div>
          <span className="mb-1 block text-[12px] font-medium text-muted-foreground">Eklenen sütunlar</span>
          {liste.length === 0 ? (
            <p className="text-[13px] text-muted-foreground">Henüz özel sütun yok.</p>
          ) : (
            <ul className="divide-y divide-border rounded-xl border border-border">
              {liste.map((e) => (
                  <li key={e.key} className="flex items-center gap-3 px-3 py-2 text-[13px]">
                    <strong className="font-bold text-black">{e.baslik}</strong>
                    <span className="text-muted-foreground">
                      {e.tur === 'metin'
                        ? 'Metin · Marka / Model sağında'
                        : `${e.tur === 'katsayi' ? 'Katsayı' : 'Maliyet'} · ${ad(e.sonra)} sağında`}
                    </span>
                    <Button variant="ghost" size="sm" className="ml-auto" onClick={() => kaldir(e.key)}>
                      Kaldır
                    </Button>
                  </li>
                ))}
            </ul>
          )}
        </div>

        <p className="text-[12px] text-muted-foreground">
          Birim Fiyat = <span className="font-mono text-ink">{birimFiyatAciklamasi(liste)}</span>
        </p>
      </div>
    </Modal>
  )
}
