import { useMemo, useRef, useState } from 'react'
import { Button } from '../../components/ui/Button'
import { Modal } from '../../components/ui/Modal'
import type { KesifEkSutun, KesifSatiri } from '../../data/types'
import {
  etkinFormul,
  formulDogrula,
  formulOrnegi,
  kesifSutunlari,
  type FormulluSutun,
  type KesifSutunFormulleri,
} from '../../lib/kesifSutunlar'

const BASLIK: Record<FormulluSutun, string> = { birimFiyat: 'Birim Fiyat', toplam: 'Toplam Tutar' }

/**
 * Sütun formülü: Birim Fiyat / Toplam Tutar hesabı bir kez girilir, tüm poz satırlarına uygulanır.
 * Başka sütunlara `[Sütun Adı]` ile başvurulur (A1 adresi değil: sütun eklenince harfler kayar).
 */
export function SutunFormulModal({
  sutun,
  ekSutunlar,
  formuller,
  ornekSatir,
  onUygula,
  onVazgec,
}: {
  sutun: FormulluSutun
  ekSutunlar: KesifEkSutun[]
  formuller: KesifSutunFormulleri
  /** Örnek sonucu göstermek için ilk poz satırı */
  ornekSatir?: KesifSatiri
  /** Yeni formül; `null` = varsayılana dön */
  onUygula: (formul: string | null) => void
  onVazgec: () => void
}) {
  const varsayilan = useMemo(() => etkinFormul(sutun, ekSutunlar, {}), [sutun, ekSutunlar])
  const [formul, setFormul] = useState(() => etkinFormul(sutun, ekSutunlar, formuller))
  const alanRef = useRef<HTMLTextAreaElement>(null)

  // Başvurulabilir sütunlar: sayısal olanlar; kendisi ve (Birim Fiyat için) Toplam Tutar döngü yaratacağından çıkar
  const sutunlar = useMemo(
    () =>
      kesifSutunlari(ekSutunlar, formuller)
        .filter((c) => typeof c.title === 'string')
        .filter((c) => !['level', 'pozKodu', 'pozTanimi', 'markaModel', 'birim', sutun].includes(c.key as string))
        .filter((c) => !(sutun === 'birimFiyat' && c.key === 'toplam'))
        .filter((c) => !ekSutunlar.some((e) => e.key === c.key && e.tur === 'metin')),
    [ekSutunlar, formuller, sutun],
  )

  const hata = formulDogrula(sutun, formul, ekSutunlar, formuller)
  const ornek = useMemo(
    () => (ornekSatir && !hata ? formulOrnegi(sutun, formul, ekSutunlar, formuller, ornekSatir) : null),
    [ornekSatir, hata, sutun, formul, ekSutunlar, formuller],
  )
  const ozelVar = Boolean(formuller[sutun])

  const ekle = (baslik: string) => {
    const alan = alanRef.current
    const metin = `[${baslik}]`
    if (!alan) {
      setFormul((f) => f + metin)
      return
    }
    const bas = alan.selectionStart ?? formul.length
    const son = alan.selectionEnd ?? formul.length
    setFormul(formul.slice(0, bas) + metin + formul.slice(son))
    requestAnimationFrame(() => {
      alan.focus()
      alan.setSelectionRange(bas + metin.length, bas + metin.length)
    })
  }

  return (
    <Modal
      open
      onClose={onVazgec}
      size="md"
      title={`${BASLIK[sutun]} formülü`}
      description="Formül bir kez girilir ve tüm poz satırlarına uygulanır. Sütunlara [Sütun Adı] ile başvurun."
      footer={
        <>
          <Button variant="ghost" onClick={onVazgec}>
            Vazgeç
          </Button>
          <Button variant="secondary" disabled={!ozelVar && formul === varsayilan} onClick={() => onUygula(null)}>
            Varsayılana dön
          </Button>
          <Button
            variant="brand"
            icon="check"
            disabled={Boolean(hata)}
            onClick={() => onUygula(formul.trim() === varsayilan ? null : formul.trim())}
          >
            Uygula
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <label className="block">
          <span className="mb-1 block text-[12px] font-medium text-muted-foreground">{BASLIK[sutun]} =</span>
          <textarea
            ref={alanRef}
            value={formul}
            onChange={(e) => setFormul(e.target.value)}
            rows={3}
            spellCheck={false}
            aria-label={`${BASLIK[sutun]} formülü`}
            className="w-full rounded-md border border-line bg-white px-2.5 py-2 font-mono text-[13px] text-ink outline-none focus:border-black focus:ring-2 focus:ring-black/10"
          />
        </label>

        <div>
          <span className="mb-1 block text-[12px] font-medium text-muted-foreground">Sütun ekle (tıklayın)</span>
          <div className="flex flex-wrap gap-1.5">
            {sutunlar.map((c) => (
              <button
                key={c.key}
                type="button"
                onClick={() => ekle(String(c.title))}
                className="rounded-md border border-line bg-surface-soft px-2 py-1 text-[12px] text-ink hover:border-black"
              >
                [{String(c.title)}]
              </button>
            ))}
          </div>
        </div>

        {hata ? (
          <p className="rounded-xl border border-danger/30 bg-danger-soft px-3 py-2 text-[13px] text-danger" role="alert">
            {hata}
          </p>
        ) : ornek?.deger !== undefined ? (
          <p className="rounded-xl border border-success/30 bg-success-soft px-3 py-2 text-[13px] text-success">
            Örnek ({ornekSatir?.pozTanimi?.slice(0, 40)}): <strong className="font-bold">{ornek.deger.toLocaleString('tr-TR', { maximumFractionDigits: 4 })}</strong>
          </p>
        ) : null}

        <p className="rounded-xl border border-line bg-surface-soft px-3 py-2 text-[12px] leading-5 text-muted-foreground">
          Kullanılabilir: <span className="font-mono">+ − * /</span>, parantez, sayılar (ondalık için nokta: 1.1) ve{' '}
          <span className="font-mono">SUM ROUND MAX MIN ABS AVERAGE</span>. Örn.{' '}
          <span className="font-mono">ROUND(([Malzeme] + [İşçilik]) * 1.1, 2)</span>.
          {sutun === 'birimFiyat' &&
            ' Bu formül her poz satırında Birim Fiyat’ı hesaplar; elle girilmiş birim fiyatların yerine geçer ve hücreler düzenlenemez olur.'}
        </p>
      </div>
    </Modal>
  )
}
