import { kesifSatirSayisi } from '../../lib/kesifSatir'
import { useState } from 'react'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { Icon } from '../../components/ui/Icon'
import { EmptyState, PageHeader } from '../../components/ui/Feedback'
import { SectionBox } from '../../components/ui/Shell'
import { sozlesmeyeDonusmusKesifler } from '../../data/mock'
import type { SozlesmeyeDonusmusKesif } from '../../data/types'

const durumTone: Record<SozlesmeyeDonusmusKesif['durum'], 'success' | 'info' | 'warning'> = {
  'Sozleşmeli': 'success',
  'Devam Ediyor': 'info',
  Tamamlandı: 'warning',
}

/**
 * SÖZLEŞMEYE DÖNÜŞMÜŞ KEŞİFLER
 * Sözleşmeye bağlanmış keşif kayıtları — proje erişim kapsamından bağımsız,
 * herkese görüntülenebilir.
 */
export function ContractedTakeoffPage() {
  const [seciliId, setSeciliId] = useState<string | null>(sozlesmeyeDonusmusKesifler[0]?.id ?? null)
  const secili = sozlesmeyeDonusmusKesifler.find((k) => k.id === seciliId) ?? null

  const toplamTutar = sozlesmeyeDonusmusKesifler.reduce(
    (acc, k) => acc + Number(k.sozlesmeTutari.replace(/\./g, '')),
    0,
  )

  return (
    <>
      <PageHeader
        title="Sözleşmeye Dönüşmüş Keşifler"
        description="Sözleşmeye dönüşmüş keşif kayıtları ve metraj detayları — tüm portal kullanıcılarına açıktır."
      />

      <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {[
          { label: 'Kayıt', value: String(sozlesmeyeDonusmusKesifler.length), ikon: 'layers' },
          { label: 'Toplam Sözleşme Tutarı', value: `${toplamTutar.toLocaleString('tr-TR')} TL`, ikon: 'wallet' },
          { label: 'Sözleşmeli', value: String(sozlesmeyeDonusmusKesifler.filter((k) => k.durum === 'Sozleşmeli').length), ikon: 'check-circle' },
        ].map((s) => (
          <Card key={s.label} className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[12px] uppercase tracking-wide text-muted-foreground">{s.label}</p>
              <p className="mt-1 font-heading text-[24px] leading-8 font-bold text-black">{s.value}</p>
            </div>
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-surface-muted text-ink">
              <Icon name={s.ikon} size={18} />
            </span>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(320px,420px)_1fr]">
        {/* Kayıt listesi */}
        <Card padded={false} className="min-w-0">
          <div className="border-b border-border px-5 py-4">
            <h4 className="text-[17px] leading-6">Sözleşme Kayıtları</h4>
          </div>

          {sozlesmeyeDonusmusKesifler.length === 0 ? (
            <EmptyState icon="layers" title="Kayıt yok" />
          ) : (
            <ul className="divide-y divide-border">
              {sozlesmeyeDonusmusKesifler.map((k) => (
                <li key={k.id}>
                  <button
                    onClick={() => setSeciliId(k.id)}
                    className={`flex w-full flex-col gap-2 px-5 py-4 text-left transition-colors ${
                      seciliId === k.id ? 'bg-info-bg' : 'hover:bg-surface-muted'
                    }`}
                  >
                    <span className="flex items-center justify-between gap-3">
                      <span className="font-mono text-[13px] font-bold text-foreground">{k.sozlesmeNo}</span>
                      <Badge tone={durumTone[k.durum]} size="sm" dot>
                        {k.durum}
                      </Badge>
                    </span>
                    <span className="text-[13px] text-muted-foreground">
                      {k.sozlesmeTarihi} · {k.sozlesmeTutari} {k.paraBirimi}
                    </span>
                    <span className="text-[12px] text-gray">{kesifSatirSayisi(k.keşif)} poz satırı</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </Card>

        {/* Detay */}
        {secili ? (
          <div className="min-w-0 space-y-5">
            <Card padded={false}>
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-5 py-4">
                <div>
                  <h4 className="text-[17px] leading-6">{secili.sozlesmeNo}</h4>
                </div>
                <Badge tone={durumTone[secili.durum]} dot>
                  {secili.durum}
                </Badge>
              </div>

              <dl className="grid grid-cols-2 gap-5 px-5 py-5 sm:grid-cols-4">
                {[
                  ['Sözleşme No', secili.sozlesmeNo],
                  ['Sözleşme Tarihi', secili.sozlesmeTarihi],
                  ['Sözleşme Tutarı', `${secili.sozlesmeTutari} ${secili.paraBirimi}`],
                  ['Poz Sayısı', String(kesifSatirSayisi(secili.keşif))],
                ].map(([k, v]) => (
                  <div key={k}>
                    <dt className="text-[12px] text-muted-foreground">{k}</dt>
                    <dd className="mt-0.5 text-[14px] font-medium text-foreground">{v}</dd>
                  </div>
                ))}
              </dl>
            </Card>

            <SectionBox title="Keşif Metrajı" description="Sözleşmeye dönüşen keşif kalemleri — salt okunur.">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[640px] border-collapse text-[14px]">
                  <thead>
                    <tr className="border-b border-line bg-surface-muted">
                      {['No', 'Poz Tanımı', 'Birim', 'Miktar'].map((h, i) => (
                        <th
                          key={h}
                          className={`px-4 py-2.5 text-[11px] font-bold uppercase tracking-wide text-muted-foreground ${
                            i === 3 ? 'text-right' : 'text-left'
                          }`}
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {secili.keşif.map((r) => (
                      <tr key={r.id} className="border-b border-border last:border-0">
                        <td className="px-4 py-2.5 font-mono text-[13px] text-muted-foreground">{r.pozNo}</td>
                        <td
                          className={`px-4 py-2.5 ${
                            r.yorum
                              ? 'pl-8 text-[13px] text-muted-foreground italic'
                              : r.seviye === 1
                                ? 'font-bold text-black'
                                : r.seviye === 3
                                  ? 'pl-8 text-ink'
                                  : 'text-ink'
                          }`}
                        >
                          {r.pozTanimi}
                        </td>
                        <td className="px-4 py-2.5 text-muted-foreground">{r.birim || '—'}</td>
                        <td className="px-4 py-2.5 text-right font-medium tabular-nums text-foreground">
                          {r.miktar ? r.miktar.toLocaleString('tr-TR') : '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-2">
                <Button variant="secondary" size="sm" icon="download">
                  Metrajı Dışa Aktar (Excel)
                </Button>
                <Button variant="secondary" size="sm" icon="file-text">
                  Sözleşme Dosyası
                </Button>
              </div>
            </SectionBox>
          </div>
        ) : (
          <Card>
            <EmptyState icon="layers" title="Kayıt seçilmedi" />
          </Card>
        )}
      </div>
    </>
  )
}
