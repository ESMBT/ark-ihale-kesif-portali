import { useEffect, useState } from 'react'
import { Button } from '../../components/ui/Button'
import { Field, Input, Select, Textarea } from '../../components/ui/Field'
import { Icon } from '../../components/ui/Icon'
import { Modal } from '../../components/ui/Modal'
import { projeKartiAlanlari, personeller } from '../../data/mock'
import type { Proje, ProjeKartiAlani } from '../../data/types'
import { alanDegeri, alanZorunluMu } from '../../lib/proje'

const bloklar: { key: ProjeKartiAlani['blok']; baslik: string; ikon: string }[] = [
  { key: 'genel', baslik: 'Proje Genel Bilgileri', ikon: 'file-text' },
  { key: 'sozlesme', baslik: 'Proje Sözleşme Bilgileri', ikon: 'wallet' },
  { key: 'organizasyon', baslik: 'Proje Organizasyon Bilgileri', ikon: 'users' },
  { key: 'alan', baslik: 'Proje Alan Bilgileri', ikon: 'ruler' },
]

/**
 * Proje düzenleme penceresi — projeye ait girilen bilgiler gösterilir,
 * düzenlenebilir ve kaydedilir. SAP'tan gelen (kilitli) alanlar değiştirilemez.
 */
export function ProjectEditModal({
  open,
  proje,
  onClose,
  onKaydet,
}: {
  open: boolean
  proje: Proje | null
  onClose: () => void
  onKaydet: (kart: Record<string, string>) => void
}) {
  const [kart, setKart] = useState<Record<string, string>>({})

  useEffect(() => {
    if (open && proje) setKart(proje.kart)
  }, [open, proje])

  if (!proje) return null

  const degerGuncelle = (id: string, deger: string) => setKart((prev) => ({ ...prev, [id]: deger }))

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Projeyi Düzenle"
      description={`${proje.kart.projeKodu} · ${proje.ad}`}
      size="xl"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Vazgeç
          </Button>
          <Button
            variant="brand"
            icon="save"
            onClick={() => {
              onKaydet(kart)
              onClose()
            }}
          >
            Değişiklikleri Kaydet
          </Button>
        </>
      }
    >
      <div className="space-y-5">
        {bloklar.map((blok) => {
          const alanlar = projeKartiAlanlari.filter((a) => a.blok === blok.key && !a.gizli)
          return (
            <section key={blok.key}>
              <div className="mb-3 flex items-center gap-2 border-b border-line pb-2">
                <Icon name={blok.ikon} size={15} className="text-gray" />
                <h5 className="text-[15px] leading-5">{blok.baslik}</h5>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {alanlar.map((alan) => (
                  <AlanKontrolu
                    key={alan.id}
                    alan={alan}
                    deger={kart[alan.id] ?? ''}
                    zorunlu={alanZorunluMu(alan, kart)}
                    onChange={(v) => degerGuncelle(alan.id, v)}
                  />
                ))}
              </div>
            </section>
          )
        })}
      </div>
    </Modal>
  )
}

function AlanKontrolu({
  alan,
  deger,
  zorunlu,
  onChange,
}: {
  alan: ProjeKartiAlani
  deger: string
  zorunlu: boolean
  onChange: (v: string) => void
}) {
  const ortak = { label: alan.alan, required: zorunlu }

  /* Proje Kodu — yazılmaz, SAP'ten gelir (düzenlemede dolu) */
  if (alan.id === 'projeKodu') {
    return (
      <Field {...ortak}>
        <Input
          value={deger}
          readOnly
          disabled
          placeholder="SAP proje kartından gelir"
          className="bg-surface-muted text-gray"
        />
      </Field>
    )
  }

  /* Personel seçimi */
  if (alan.secimKaynagi === 'personel') {
    return (
      <Field {...ortak}>
        <Select value={deger} onChange={(e) => onChange(e.target.value)}>
          <option value="">Seçiniz…</option>
          {personeller.map((p) => (
            <option key={p.id} value={p.ad}>
              {p.ad} — {p.unvan}
            </option>
          ))}
        </Select>
      </Field>
    )
  }

  /* Manuel alanlar — düzenlenebilir */
  if (alan.tip === 'DATS') {
    return (
      <Field {...ortak}>
        <Input type="date" value={deger} onChange={(e) => onChange(e.target.value)} />
      </Field>
    )
  }

  if (alan.tip === 'QUAN') {
    return (
      <Field {...ortak}>
        <div className="relative">
          <Input value={deger} onChange={(e) => onChange(e.target.value)} placeholder="0" />
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[12px] text-gray">
            m²
          </span>
        </div>
      </Field>
    )
  }

  return (
    <Field {...ortak}>
      <Input
        value={alanDegeri(alan, deger)}
        onChange={(e) => onChange(e.target.value)}
        placeholder={alan.kaynak === 'sap-planli' ? 'SAP alanı eklendiğinde otomatik dolacak' : 'Değer giriniz'}
      />
    </Field>
  )
}

/** Proje kartındaki alanların salt okunur özeti (Proje Bilgileri sekmesi) */
export function ProjectInfoSummary({ proje }: { proje: Proje }) {
  const alanlar = projeKartiAlanlari.filter((a) => !a.gizli && (proje.kart[a.id] ?? '').trim())
  return (
    <div className="grid grid-cols-1 gap-x-8 gap-y-4 sm:grid-cols-2 lg:grid-cols-3">
      {alanlar.map((alan) => (
        <div key={alan.id}>
          <p className="text-[12px] text-muted-foreground">{alan.alan}</p>
          <p className="mt-0.5 text-[15px] font-medium whitespace-pre-line text-foreground">
            {alanDegeri(alan, proje.kart[alan.id]) || '—'}
          </p>
        </div>
      ))}
    </div>
  )
}

/** Proje notlarının düzenlenmesi için basit yardımcı (ileride kullanılabilir) */
export function ProjectNoteEditor({
  value,
  onChange,
}: {
  value: string
  onChange: (v: string) => void
}) {
  return (
    <Field label="Proje Notu">
      <Textarea value={value} onChange={(e) => onChange(e.target.value)} />
    </Field>
  )
}
