import { useEffect, useMemo, useState } from 'react'
import { Button } from '../../components/ui/Button'
import { Field, Input, Select, Textarea } from '../../components/ui/Field'
import { Icon } from '../../components/ui/Icon'
import { Modal } from '../../components/ui/Modal'
import { personeller } from '../../data/mock'
import { ihaleAlaniKategorileri, ihaleAlaniKategorilerSirasi } from '../../data/ihaleAlanlari'
import { sozlesmeTurleri, turAlanlari, turZorunluAlanlari } from '../../data/sozlesmeTurleri'
import type { IhalePaketi } from '../../data/types'

/**
 * İHALE PAKETİ OLUŞTURMA / DÜZENLEME
 * Sözleşme türü seçilince alan listesi ve zorunlu alanlar buna göre gelir.
 * Eksik zorunlu alan olsa da paket kaydedilebilir; uyarı gösterilir.
 */
export function PackageCreateModal({
  open,
  onClose,
  onSubmit,
  paket,
}: {
  open: boolean
  onClose: () => void
  onSubmit: (
    ad: string,
    isTipi: IhalePaketi['isTipi'],
    alanlar: Record<string, string>,
    sozlesmeTuru: IhalePaketi['sozlesmeTuru'],
    sorumluId: string,
  ) => void
  paket?: IhalePaketi
}) {
  const duzenleme = !!paket
  const [ad, setAd] = useState('')
  const [sozlesmeTuru, setSozlesmeTuru] = useState<string>(paket?.sozlesmeTuru ?? 'alt-yuklenici')
  const [sorumluId, setSorumluId] = useState(paket?.sorumluId ?? '')
  const [degerler, setDegerler] = useState<Record<string, string>>({})

  useEffect(() => {
    if (!open) return
    setAd(paket?.ad ?? '')
    setSozlesmeTuru(paket?.sozlesmeTuru ?? 'alt-yuklenici')
    setSorumluId(paket?.sorumluId ?? '')
    setDegerler(paket?.alanlar ?? {})
  }, [open, paket])

  const turAlanlariListesi = useMemo(() => turAlanlari(sozlesmeTuru), [sozlesmeTuru])

  const gruplar = useMemo(
    () =>
      ihaleAlaniKategorilerSirasi
        .map((kategori) => ({
          kategori,
          baslik: ihaleAlaniKategorileri[kategori],
          alanlar: turAlanlariListesi.filter((a) => a.kategori === kategori),
        }))
        .filter((g) => g.alanlar.length > 0),
    [turAlanlariListesi],
  )

  const eksikZorunlu = useMemo(
    () =>
      turZorunluAlanlari(sozlesmeTuru)
        .filter((a) => !(degerler[a.id] ?? '').trim())
        .map((a) => a.ad),
    [sozlesmeTuru, degerler],
  )

  const gonder = () => {
    const dolu = Object.fromEntries(Object.entries(degerler).filter(([, v]) => v !== ''))
    const sekil = dolu.ihIhaleSekli
    const isTipi: IhalePaketi['isTipi'] =
      sekil === 'Götürü' ? 'Götürü' : sekil === 'Malzeme + İşçilik' ? 'Malzeme + İşçilik' : 'Birim Fiyatlı'
    onSubmit(ad.trim(), isTipi, dolu, sozlesmeTuru as IhalePaketi['sozlesmeTuru'], sorumluId)
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="xl"
      footer={
        <>
          <span className="mr-auto flex items-center gap-2 text-[12px] text-muted-foreground">
            {eksikZorunlu.length > 0 ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-warning-soft px-2 py-0.5 font-bold text-warning">
                <Icon name="alert-triangle" size={11} />
                {eksikZorunlu.length} eksik alan
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 rounded-full bg-success-soft px-2 py-0.5 font-bold text-success">
                <Icon name="check-circle" size={11} />
                Zorunlu alanlar tamam
              </span>
            )}
          </span>
          <Button variant="ghost" onClick={onClose}>
            Vazgeç
          </Button>
          <Button variant="brand" icon={duzenleme ? 'check' : 'plus'} disabled={!ad.trim()} onClick={gonder}>
            {duzenleme ? 'Değişiklikleri Kaydet' : 'İhale Paketini Oluştur'}
          </Button>
        </>
      }
    >
      <div className="space-y-5">
        {/* Paket bilgileri */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Field label="İhale Paketi Adı" required>
            <Input
              value={ad}
              onChange={(e) => setAd(e.target.value)}
              placeholder="Örn. Mekanik İşleri"
              autoFocus
            />
          </Field>

          <Field label="Sözleşme Türü" required>
            <Select value={sozlesmeTuru} onChange={(e) => setSozlesmeTuru(e.target.value)}>
              {sozlesmeTurleri.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.ad}
                </option>
              ))}
            </Select>
          </Field>

          <Field label="Sorumlu" required>
            <Select value={sorumluId} onChange={(e) => setSorumluId(e.target.value)}>
              <option value="">Seçiniz…</option>
              {personeller.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.ad} — {p.unvan}
                </option>
              ))}
            </Select>
          </Field>
        </div>

        {/* Alan bilgileri — seçilen sözleşme türüne göre */}
        <div className="rounded-xl border border-border">
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <span className="text-[13px] font-bold text-black">Alan Bilgileri</span>
            <span className="text-[12px] text-muted-foreground">
              {sozlesmeTurleri.find((t) => t.id === sozlesmeTuru)?.ad}
            </span>
          </div>

          <div className="space-y-5 p-4">
            {gruplar.map((g) => (
              <div key={g.kategori}>
                <p className="mb-3 text-[11px] font-bold tracking-wide text-muted-foreground uppercase">
                  {g.baslik}
                </p>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {g.alanlar.map((alan) => (
                    <AlanFormu
                      key={alan.id}
                      alan={alan}
                      deger={degerler[alan.id] ?? ''}
                      zorunlu={turZorunluAlanlari(sozlesmeTuru).some((z) => z.id === alan.id)}
                      onChange={(v) => setDegerler((prev) => ({ ...prev, [alan.id]: v }))}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Modal>
  )
}

function AlanFormu({
  alan,
  deger,
  zorunlu,
  onChange,
}: {
  alan: { id: string; ad: string; tip: string; sistem?: boolean; secenekler?: string[] }
  deger: string
  zorunlu: boolean
  onChange: (v: string) => void
}) {
  const ortak = { label: alan.ad, required: zorunlu }

  if (alan.sistem) {
    return (
      <Field {...ortak}>
        <div className="flex h-11 items-center gap-2 rounded-md border border-line bg-surface-muted px-3 text-[14px] text-gray">
          <Icon name="lock" size={13} />
          Proje Kartı
        </div>
      </Field>
    )
  }

  if (alan.tip === 'dropdown') {
    return (
      <Field {...ortak}>
        <Select value={deger} onChange={(e) => onChange(e.target.value)}>
          <option value="">Seçiniz…</option>
          {alan.secenekler?.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </Select>
      </Field>
    )
  }

  if (alan.tip === 'uzun-metin') {
    return (
      <Field {...ortak} className="sm:col-span-2">
        <Textarea value={deger} onChange={(e) => onChange(e.target.value)} placeholder="…" />
      </Field>
    )
  }

  if (alan.tip === 'tarih') {
    return (
      <Field {...ortak}>
        <Input type="date" value={deger} onChange={(e) => onChange(e.target.value)} />
      </Field>
    )
  }

  if (alan.tip === 'yuzde') {
    return (
      <Field {...ortak}>
        <div className="relative">
          <Input value={deger} inputMode="decimal" onChange={(e) => onChange(e.target.value)} placeholder="0" />
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[12px] text-gray">%</span>
        </div>
      </Field>
    )
  }

  if (alan.tip === 'sayi') {
    return (
      <Field {...ortak}>
        <Input value={deger} type="number" onChange={(e) => onChange(e.target.value)} placeholder="0" />
      </Field>
    )
  }

  return (
    <Field {...ortak}>
      <Input value={deger} onChange={(e) => onChange(e.target.value)} placeholder="Değer giriniz" />
    </Field>
  )
}
