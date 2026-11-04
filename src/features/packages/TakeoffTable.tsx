import { useRef, useState } from 'react'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { Icon } from '../../components/ui/Icon'
import { LabeledFilter } from '../../components/ui/FilterBar'
import { Modal } from '../../components/ui/Modal'
import { IconButton } from '../../components/ui/Shell'
import type { IhalePaketi, KesifSatiri } from '../../data/types'
import {
  KESIF_SABLON_BASLIKLARI,
  kesifDisaAktar,
  kesifDosyasiOku,
  kesifSablonuIndir,
  type ImportHatasi,
} from '../../lib/kesif'

/**
 * Conwize "Estimate / Bill of quantity" düzeni:
 *  · versiyon seçici + göster (Show) filtresi
 *  · mavi başlıklı, kolon filtreli hesap tablosu
 *  · ana gruplar kalın, alt kalemler girintili
 *  · alt barda "İhale Paketine Böl", İçe Aktar / Dışa Aktar
 */
export function TakeoffTable({
  paket,
  onKaydet,
}: {
  paket: IhalePaketi
  onKaydet: (satirlar: KesifSatiri[]) => void
}) {
  const [satirlar, setSatirlar] = useState<KesifSatiri[]>(paket.keşif)
  const [duzenle, setDuzenle] = useState(false)
  const [goster, setGoster] = useState('Tümü')
  const [versiyon, setVersiyon] = useState('#1 27.10.2026')
  const [importRaporu, setImportRaporu] = useState<{ hatalar: ImportHatasi[]; dosyaAdi: string } | null>(null)
  const [bekleyen, setBekleyen] = useState<KesifSatiri[] | null>(null)
  const dosyaRef = useRef<HTMLInputElement>(null)

  const toplamMiktar = satirlar
    .filter((s) => s.seviye === 2)
    .reduce((acc, s) => acc + s.miktar, 0)

  const satirGuncelle = (id: string, yama: Partial<KesifSatiri>) =>
    setSatirlar((prev) => prev.map((s) => (s.id === id ? { ...s, ...yama } : s)))

  const dosyaSec = async (file: File | undefined) => {
    if (!file) return
    const sonuc = await kesifDosyasiOku(file)
    setImportRaporu({ hatalar: sonuc.hatalar, dosyaAdi: sonuc.dosyaAdi })
    setBekleyen(sonuc.hatalar.some((h) => h.tip === 'hata') ? null : sonuc.satirlar)
  }

  return (
    <div className="space-y-4">
      {/* Araç çubuğu */}
      <Card padded={false}>
        <div className="flex flex-wrap items-center gap-3 p-4">
          <label className="relative flex flex-col">
            <span className="mb-1 text-[12px] font-medium text-muted-foreground">Versiyon</span>
            <span className="inline-flex h-11 min-w-[190px] items-center justify-between gap-3 rounded-xl border border-line bg-white px-4">
              <span className="text-[14px] font-medium text-ink">{versiyon}</span>
              <Icon name="chevron-down" size={15} className="text-gray" />
            </span>
            <select
              value={versiyon}
              onChange={(e) => setVersiyon(e.target.value)}
              className="absolute bottom-0 left-0 h-11 w-full cursor-pointer opacity-0"
              aria-label="Versiyon"
            >
              <option>#1 27.10.2026</option>
              <option>#2 28.10.2026</option>
              <option>#3 29.10.2026</option>
            </select>
          </label>

          <LabeledFilter
            label="Göster"
            value={goster}
            options={['Tümü', 'Sadece ana gruplar', 'Sadece kalemler']}
            onChange={setGoster}
          />

        </div>
      </Card>


      {/* Hesap tablosu */}
      <Card padded={false}>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[960px] border-collapse text-[14px]">
            <thead>
              <tr className="bg-info-bg/60">
                <th className="w-12 border-r border-border px-3 py-3 text-left">
                  <IconButton icon="plus" label="Satır ekle" size="sm" className="border-0 bg-transparent" />
                </th>
                {[
                  { h: 'No', w: 'w-[70px]', align: 'left' },
                  { h: 'Poz Tanımı', w: 'w-[360px]', align: 'left' },
                  { h: 'Birim', w: 'w-[100px]', align: 'left' },
                  { h: 'Miktar', w: 'w-[130px]', align: 'right' },
                  { h: 'Malzeme', w: 'w-[130px]', align: 'right' },
                  { h: 'İşçilik', w: 'w-[130px]', align: 'right' },
                  { h: 'GGK', w: 'w-[130px]', align: 'right' },
                  { h: 'Birim Fiyat', w: 'w-[140px]', align: 'right' },
                ].map((c) => (
                  <th
                    key={c.h}
                    className={`border-r border-border px-4 py-3 ${c.align === 'right' ? 'text-right' : 'text-left'}`}
                  >
                    <span
                      className={`inline-flex items-center gap-2 text-[13px] font-bold text-ink ${
                        c.align === 'right' ? 'flex-row-reverse' : ''
                      }`}
                    >
                      {c.h}
                      <Icon name="filter" size={13} className="text-gray" />
                    </span>
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {satirlar.map((s, i) => {
                const grupSatiri = s.seviye === 1
                const girintili = s.seviye === 3
                return (
                  <tr
                    key={s.id}
                    className={`border-b border-border ${
                      grupSatiri ? 'bg-surface-soft/70' : 'bg-surface'
                    } hover:bg-info-bg/40`}
                  >
                    <td className="border-r border-border px-3 py-2.5 text-center text-[13px] text-muted-foreground">
                      {i + 1}
                    </td>
                    <td className="border-r border-border px-4 py-2.5 font-mono text-[13px] whitespace-nowrap">
                      {s.pozNo}
                    </td>
                    <td
                      className={`border-r border-border px-4 py-2.5 ${
                        grupSatiri ? 'font-bold text-black' : girintili ? 'pl-9 text-ink' : 'text-ink'
                      }`}
                    >
                      {duzenle && !grupSatiri ? (
                        <input
                          value={s.pozTanimi}
                          onChange={(e) => satirGuncelle(s.id, { pozTanimi: e.target.value })}
                          placeholder="Poz tanımı zorunlu"
                          className={`h-8 w-full rounded border px-2 outline-none focus:border-black ${
                            s.pozTanimi ? 'border-line' : 'border-danger-strong bg-danger-soft'
                          }`}
                        />
                      ) : (
                        <span className={s.pozTanimi ? '' : 'text-danger'}>
                          {s.pozTanimi || 'Poz tanımı eksik'}
                        </span>
                      )}
                    </td>
                    <td className="border-r border-border px-4 py-2.5 text-muted-foreground">
                      {duzenle && !grupSatiri ? (
                        <input
                          value={s.birim}
                          onChange={(e) => satirGuncelle(s.id, { birim: e.target.value })}
                          className="h-8 w-20 rounded border border-line px-2 outline-none focus:border-black"
                        />
                      ) : (
                        s.birim || '—'
                      )}
                    </td>
                    <td className="border-r border-border px-4 py-2.5 text-right font-bold tabular-nums">
                      {duzenle && !grupSatiri ? (
                        <input
                          value={s.miktar}
                          type="number"
                          onChange={(e) => satirGuncelle(s.id, { miktar: Number(e.target.value) })}
                          className="h-8 w-28 rounded border border-line px-2 text-right outline-none focus:border-black"
                        />
                      ) : (
                        s.miktar ? s.miktar.toLocaleString('tr-TR') : ''
                      )}
                    </td>
                    {[s.malzeme, s.iscilik, s.ggk].map((f, idx) => (
                      <td key={idx} className="border-r border-border px-4 py-2.5 text-right text-muted-foreground tabular-nums">
                        {f ? f.toLocaleString('tr-TR') : <Icon name="lock" size={13} className="ml-auto text-gray" />}
                      </td>
                    ))}
                    <td className="border-r border-border px-4 py-2.5 text-right text-muted-foreground tabular-nums">
                      {s.birimFiyat ? s.birimFiyat.toLocaleString('tr-TR') : <Icon name="lock" size={13} className="ml-auto text-gray" />}
                    </td>
                  </tr>
                )
              })}

              {satirlar.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-[14px] text-muted-foreground">
                    Keşif satırı yok. Excel Keşif dosyasını içe aktarın.
                  </td>
                </tr>
              )}
            </tbody>

            <tfoot>
              <tr className="bg-surface-soft">
                <td className="border-r border-border px-4 py-3.5 text-[13px] font-bold text-muted-foreground">
                  {satirlar.length}
                </td>
                <td className="border-r border-border px-4 py-3.5 text-[13px] font-bold tracking-wide text-muted-foreground uppercase">
                  Toplam
                </td>
                <td className="border-r border-border px-4 py-3.5" />
                <td className="border-r border-border px-4 py-3.5 text-right text-[14px] font-bold tabular-nums">
                  {toplamMiktar.toLocaleString('tr-TR')}
                </td>
                <td colSpan={4} className="px-4 py-3.5 text-right text-[13px] text-muted-foreground">
                  Fiyat alanları teklif aşamasında doldurulur
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Alt aksiyon çubuğu */}
        <div className="flex flex-wrap items-center gap-3 border-t border-border px-4 py-3">
          <div className="ml-auto flex items-center gap-2">
            <Button
              variant="secondary"
              icon="upload"
              iconRight="chevron-down"
              onClick={() => dosyaRef.current?.click()}
            >
              İçe Aktar
            </Button>
            <input
              ref={dosyaRef}
              type="file"
              accept=".xlsx,.xls,.csv"
              className="hidden"
              onChange={(e) => {
                void dosyaSec(e.target.files?.[0])
                e.target.value = ''
              }}
            />
            <Button
              variant="secondary"
              icon="download"
              iconRight="chevron-down"
              onClick={() => kesifDisaAktar(satirlar, paket.ad)}
            >
              Dışa Aktar
            </Button>
            <Button variant="secondary" icon="file-spreadsheet" onClick={kesifSablonuIndir}>
              Şablon
            </Button>
            {duzenle ? (
              <Button
                variant="brand"
                icon="check"
                onClick={() => {
                  onKaydet(satirlar)
                  setDuzenle(false)
                }}
              >
                Kaydet
              </Button>
            ) : (
              <Button variant="brand" icon="edit" onClick={() => setDuzenle(true)}>
                Düzenle
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* İçe aktarma raporu */}
      <Modal
        open={!!importRaporu}
        onClose={() => {
          setImportRaporu(null)
          setBekleyen(null)
        }}
        title="Excel Keşif İçe Aktarma Raporu"
        description={importRaporu?.dosyaAdi}
        size="lg"
        footer={
          <>
            <Button
              variant="ghost"
              onClick={() => {
                setImportRaporu(null)
                setBekleyen(null)
              }}
            >
              Kapat
            </Button>
            <Button
              variant="brand"
              icon="upload"
              disabled={!bekleyen || bekleyen.length === 0}
              onClick={() => {
                if (!bekleyen) return
                setSatirlar((prev) => [...prev, ...bekleyen])
                setImportRaporu(null)
                setBekleyen(null)
                setDuzenle(true)
              }}
            >
              {bekleyen ? `${bekleyen.length} satırı içe aktar` : 'İçe aktarılamıyor'}
            </Button>
          </>
        }
      >
        {importRaporu && importRaporu.hatalar.length === 0 && bekleyen ? (
          <div className="rounded-xl border border-success/30 bg-success-soft px-4 py-3 text-[14px] text-success">
            <strong className="font-bold">Tüm satırlar geçerli.</strong> {bekleyen.length} satır içe aktarılmaya hazır.
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-border">
            <table className="w-full border-collapse text-[13px]">
              <thead>
                <tr className="border-b border-line bg-surface-muted">
                  {['Satır', 'Alan', 'Tip', 'Açıklama'].map((h) => (
                    <th key={h} className="px-4 py-2.5 text-left text-[11px] font-bold tracking-wide text-muted-foreground uppercase">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {importRaporu?.hatalar.map((h, i) => (
                  <tr key={i} className="border-b border-border last:border-0">
                    <td className="px-4 py-2.5 font-mono text-[12px]">{h.satir || '—'}</td>
                    <td className="px-4 py-2.5">{h.alan}</td>
                    <td className="px-4 py-2.5">
                      <span
                        className={`inline-block rounded-full px-2 py-0.5 text-[11px] font-bold ${
                          h.tip === 'hata' ? 'bg-danger-soft text-danger' : 'bg-warning-soft text-warning'
                        }`}
                      >
                        {h.tip === 'hata' ? 'Hata' : 'Uyarı'}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-muted-foreground">{h.mesaj}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="mt-4">
          <p className="mb-2 text-[13px] font-bold text-ink">Beklenen kolonlar</p>
          <div className="flex flex-wrap gap-2">
            {KESIF_SABLON_BASLIKLARI.map((b) => (
              <span key={b} className="rounded-lg border border-line bg-surface-muted px-2.5 py-1 font-mono text-[12px] text-ink">
                {b}
              </span>
            ))}
          </div>
        </div>
      </Modal>
    </div>
  )
}
