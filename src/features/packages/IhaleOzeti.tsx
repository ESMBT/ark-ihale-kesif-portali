import { useMemo, useState } from 'react'
import { Icon } from '../../components/ui/Icon'
import {
  ihaleAlaniKategorileri,
  ihaleAlaniKategorilerSirasi,
  ihaleAlanlari,
  type IhaleAlanKategori,
} from '../../data/ihaleAlanlari'

const kategoriIkonlari: Record<IhaleAlanKategori, string> = {
  proje: 'file-text',
  finansal: 'wallet',
  sure: 'calendar',
  santiye: 'hard-hat',
}

/**
 * İHALE ÖZETİ — Excel checklist'indeki gibi iki sütun:
 * solda alan adları, sağda karşılık değerleri.
 */
export function IhaleOzeti({
  alanlar,
  baslik = 'İhale Özeti',
}: {
  alanlar: Record<string, string>
  baslik?: string
}) {
  const [boslarGoster, setBoslarGoster] = useState(false)

  const { dolu, bos } = useMemo(() => {
    const doluList = ihaleAlanlari.filter((a) => !a.sistem && (alanlar[a.id] ?? '').trim())
    const bosList = ihaleAlanlari.filter((a) => !a.sistem && !(alanlar[a.id] ?? '').trim())
    return { dolu: doluList, bos: bosList }
  }, [alanlar])

  const gruplu = useMemo(
    () =>
      ihaleAlaniKategorilerSirasi
        .map((kategori) => ({
          kategori,
          baslik: ihaleAlaniKategorileri[kategori],
          alanlar: dolu.filter((a) => a.kategori === kategori),
        }))
        .filter((g) => g.alanlar.length > 0),
    [dolu],
  )

  if (dolu.length === 0) {
    return (
      <div className="rounded-2xl border border-border bg-surface">
        <div className="border-b border-border px-5 py-4">
          <div className="flex items-center justify-between gap-3">
            <h4 className="text-[17px] leading-6">{baslik}</h4>
            <span className="rounded-full bg-surface-muted px-2.5 py-1 text-[12px] font-bold text-ink">0 alan</span>
          </div>
        </div>
        <p className="px-5 py-10 text-center text-[13px] text-muted-foreground">
          Bu ihale paketi için henüz ihale bilgisi girilmemiş.
        </p>
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-surface">
      {/* Başlık */}
      <div className="flex items-center justify-between gap-3 border-b border-border px-5 py-4">
        <div>
          <h4 className="text-[17px] leading-6">{baslik}</h4>
        </div>
        <span className="rounded-full bg-surface-muted px-2.5 py-1 text-[12px] font-bold text-ink">
          {dolu.length} alan
        </span>
      </div>

      {/* Kategori grupları — solda alan adı, sağda değer */}
      {gruplu.map((g) => (
        <section key={g.kategori}>
          <div className="flex items-center gap-2 border-b border-line bg-surface-muted/60 px-5 py-2">
            <Icon name={kategoriIkonlari[g.kategori]} size={14} className="text-gray" />
            <span className="text-[12px] font-bold tracking-wide text-muted-foreground uppercase">
              {g.baslik}
            </span>
            <span className="ml-auto text-[12px] text-gray">{g.alanlar.length} alan</span>
          </div>

          <dl className="divide-y divide-border">
            {g.alanlar.map((alan) => (
              <div
                key={alan.id}
                className="grid grid-cols-1 items-start gap-1 px-5 py-3 transition-colors hover:bg-surface-muted/40 sm:grid-cols-[minmax(200px,300px)_1fr] sm:gap-6"
              >
                <dt className="flex items-center gap-2 text-[13px] text-muted-foreground">
                  <Icon name="check" size={13} className="shrink-0 text-success" />
                  {alan.ad}
                </dt>
                <dd className="text-[14px] leading-6 font-medium whitespace-pre-line text-foreground sm:pl-6">
                  {alanlar[alan.id] || '—'}
                </dd>
              </div>
            ))}
          </dl>
        </section>
      ))}

      {/* Boş alanlar — checklist tamamlama */}
      {bos.length > 0 && (
        <div className="border-t border-line px-5 py-3">
          <button
            onClick={() => setBoslarGoster((v) => !v)}
            className="inline-flex items-center gap-2 text-[13px] font-medium text-muted-foreground transition-colors hover:text-black"
          >
            <Icon name={boslarGoster ? 'chevron-up' : 'chevron-down'} size={14} />
            {boslarGoster ? 'Boş alanları gizle' : `Boş alanlar (${bos.length})`}
          </button>

          {boslarGoster && (
            <div className="mt-3 grid grid-cols-1 gap-x-6 gap-y-2 sm:grid-cols-2">
              {bos.map((alan) => (
                <span key={alan.id} className="flex items-center gap-2 text-[13px] text-gray">
                  <span className="h-3.5 w-3.5 shrink-0 rounded border border-line" />
                  {alan.ad}
                </span>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
