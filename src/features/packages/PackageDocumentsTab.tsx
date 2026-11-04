import { useMemo, useState } from 'react'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Icon } from '../../components/ui/Icon'
import { Modal } from '../../components/ui/Modal'
import { SplitPane } from '../../components/ui/DropZone'
import {
  ihaleBelgeleri,
  sozlesmeBelgeleri,
  standartKlasorler,
  type BelgeGrubu,
  type SozlesmeBelgesi,
} from '../../data/sozlesmeBelgeleri'
import type { IhalePaketi } from '../../data/types'

/**
 * BELGELER — iki kulakçık:
 *  · İhale Belgeleri    : klasör klasör yapısı (Keşif ve Teklif · BFT · Şartnameler · Çizimler · İş Programı)
 *  · Sözleşme Belgeleri : standart sözleşme ekleri (İndir · Aç)
 * Her belgede İndir · Aç · (Yükle) aksiyonları vardır.
 */
export function PackageDocumentsTab({
  paket,
  klasorler,
  onKlasorEkle,
  onKlasorYenidenAdlandir,
}: {
  paket: IhalePaketi
  klasorler: { id: string; ad: string }[]
  onKlasorEkle: (ad: string) => void
  onKlasorYenidenAdlandir: (id: string, ad: string) => void
}) {
  const [grup, setGrup] = useState<BelgeGrubu>('ihale')
  const [aktifKlasor, setAktifKlasor] = useState('kesif-teklif')
  const [onizleme, setOnizleme] = useState<SozlesmeBelgesi | null>(null)
  const [yeniKlasor, setYeniKlasor] = useState(false)
  const [yeniKlasorAdi, setYeniKlasorAdi] = useState('')
  const [duzenlenen, setDuzenlenen] = useState<{ id: string; ad: string } | null>(null)
  const [duzenlenenAd, setDuzenlenenAd] = useState('')

  const tumKlasorler = useMemo(() => {
    const standartAdlar = new Map(klasorler.map((k) => [k.id, k.ad]))
    const standart = standartKlasorler.map((k) => ({
      id: k.id,
      ad: standartAdlar.get(k.id) ?? k.ad,
    }))
    const ek = klasorler.filter((k) => !standartKlasorler.some((s) => s.id === k.id))
    return [...standart, ...ek]
  }, [klasorler])

  const klasor = tumKlasorler.find((k) => k.id === aktifKlasor) ?? tumKlasorler[0]

  const ihaleListesi = ihaleBelgeleri.filter((b) => b.klasor === (klasor?.id ?? ''))
  const sozlesmeListesi = sozlesmeBelgeleri

  const yüklenen = paket.belgeler.length
  const toplamBoyut = paket.belgeler.reduce(
    (acc, b) => acc + (Number.parseFloat(b.boyut.replace(',', '.')) || 0),
    0,
  )

  const klasorBelgeleri = ihaleListesi.length
    ? ihaleListesi
    : ihaleBelgeleri.filter((b) => b.grup === 'ihale' && !b.klasor)

  return (
    <SplitPane
      solBaslik="Belge Grupları"
      solGenislik="w-[360px]"
      solIstatistik={
        <div className="flex items-center justify-between gap-3 rounded-xl border border-line bg-surface px-4 py-3">
          <span className="text-[12px] text-muted-foreground">Yüklenen belge: {yüklenen}</span>
          <span className="text-[12px] font-bold text-ink">Toplam boyut: {toplamBoyut.toFixed(1)} MB</span>
        </div>
      }
      solCocuklar={
        <div className="space-y-1">
          {/* Kulakçık 1 — İhale Belgeleri */}
          <button
            onClick={() => setGrup('ihale')}
            className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-[14px] transition-colors ${
              grup === 'ihale' ? 'bg-surface-muted font-bold text-black' : 'text-ink hover:bg-surface-muted'
            }`}
          >
            <Icon name="folder" size={17} className="shrink-0 text-gray" />
            <span className="flex-1">İhale Belgeleri</span>
            <Badge tone="info" size="sm">
              {ihaleBelgeleri.filter((b) => b.grup === 'ihale').length}
            </Badge>
            <Icon name={grup === 'ihale' ? 'chevron-up' : 'chevron-down'} size={14} className="text-gray" />
          </button>

          {grup === 'ihale' && (
            <ul className="ml-3 space-y-0.5 border-l border-[#242424] pl-3">
              {tumKlasorler.map((k) => {
                const adet = ihaleBelgeleri.filter((b) => b.klasor === k.id).length
                return (
                  <li key={k.id} className="group flex items-center gap-1">
                    <button
                      onClick={() => setAktifKlasor(k.id)}
                      className={`flex min-w-0 flex-1 items-center gap-2.5 rounded-lg px-3 py-2 text-left text-[13px] transition-colors ${
                        aktifKlasor === k.id
                          ? 'bg-surface-muted font-bold'
                          : 'text-muted-foreground hover:bg-surface-muted'
                      }`}
                    >
                      <Icon name="folder" size={15} className="shrink-0 text-gray" />
                      <span className="min-w-0 flex-1 truncate">{k.ad}</span>
                      <span className="shrink-0 text-[12px]">{adet}</span>
                    </button>
                    <button
                      onClick={() => {
                        setDuzenlenenAd(k.ad)
                        setDuzenlenen(k)
                      }}
                      title="Klasörü yeniden adlandır"
                      aria-label={`${k.ad} klasörünü yeniden adlandır`}
                      className="rounded p-1 text-gray opacity-0 transition-opacity group-hover:opacity-100 hover:text-black"
                    >
                      <Icon name="pencil" size={13} />
                    </button>
                  </li>
                )
              })}

              <li>
                <button
                  onClick={() => {
                    setYeniKlasorAdi('')
                    setYeniKlasor(true)
                  }}
                  className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-[13px] text-gray transition-colors hover:bg-surface-muted hover:text-black"
                >
                  <Icon name="plus" size={15} className="shrink-0" />
                  Yeni Klasör Ekle
                </button>
              </li>
            </ul>
          )}

          {/* Kulakçık 2 — Sözleşme Belgeleri */}
          <button
            onClick={() => setGrup('sozlesme')}
            className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-[14px] transition-colors ${
              grup === 'sozlesme' ? 'bg-surface-muted font-bold text-black' : 'text-ink hover:bg-surface-muted'
            }`}
          >
            <Icon name="folder" size={17} className="shrink-0 text-gray" />
            <span className="flex-1">Sözleşme Belgeleri</span>
            <Badge tone="neutral" size="sm">
              {sozlesmeBelgeleri.length}
            </Badge>
            <Icon name={grup === 'sozlesme' ? 'chevron-up' : 'chevron-down'} size={14} className="text-gray" />
          </button>
        </div>
      }
      sagBaslik={
        <span>
          {grup === 'ihale' ? 'İhale Belgeleri' : 'Sözleşme Belgeleri'}
          {grup === 'ihale' && (
            <>
              {' '}
              <span className="text-gray">/</span> <span className="text-ink">{klasor?.ad}</span>
            </>
          )}
        </span>
      }
      sagIkonlar={
        grup === 'ihale' ? (
          <>
            <IconButton2 icon="download" label="Klasörü indir" />
            <IconButton2 icon="upload" label="Belge yükle" />
          </>
        ) : (
          <IconButton2 icon="download" label="Tümünü indir" />
        )
      }
    >
      {grup === 'ihale' ? (
        <BelgeListesi
          belgeler={klasorBelgeleri}
          onAç={setOnizleme}
          yukleGoster
        />
      ) : (
        <BelgeListesi belgeler={sozlesmeListesi} onAç={setOnizleme} />
      )}

      {/* Yeni klasör */}
      <Modal
        open={yeniKlasor}
        onClose={() => setYeniKlasor(false)}
        title="Yeni Klasör"
        footer={
          <>
            <Button variant="ghost" onClick={() => setYeniKlasor(false)}>
              Vazgeç
            </Button>
            <Button
              variant="brand"
              icon="plus"
              disabled={!yeniKlasorAdi.trim()}
              onClick={() => {
                onKlasorEkle(yeniKlasorAdi.trim())
                setYeniKlasor(false)
              }}
            >
              Klasörü Ekle
            </Button>
          </>
        }
      >
        <input
          value={yeniKlasorAdi}
          onChange={(e) => setYeniKlasorAdi(e.target.value)}
          placeholder="Klasör adı"
          className="h-11 w-full rounded-md border border-line px-3 text-[15px] outline-none placeholder:text-gray focus:border-black"
        />
      </Modal>

      {/* Klasörü yeniden adlandır */}
      <Modal
        open={!!duzenlenen}
        onClose={() => setDuzenlenen(null)}
        title="Klasörü Yeniden Adlandır"
        footer={
          <>
            <Button variant="ghost" onClick={() => setDuzenlenen(null)}>
              Vazgeç
            </Button>
            <Button
              variant="brand"
              icon="save"
              disabled={!duzenlenenAd.trim()}
              onClick={() => {
                if (duzenlenen) onKlasorYenidenAdlandir(duzenlenen.id, duzenlenenAd.trim())
                setDuzenlenen(null)
              }}
            >
              Kaydet
            </Button>
          </>
        }
      >
        <input
          value={duzenlenenAd}
          onChange={(e) => setDuzenlenenAd(e.target.value)}
          placeholder="Klasör adı"
          className="h-11 w-full rounded-md border border-line px-3 text-[15px] outline-none placeholder:text-gray focus:border-black"
        />
      </Modal>

      {/* Belge önizleme */}
      <Modal
        open={!!onizleme}
        onClose={() => setOnizleme(null)}
        title={onizleme ? `Ek-${onizleme.ekNo} · ${onizleme.ad}` : ''}
        description={onizleme?.dosyaAdi}
        size="lg"
        footer={
          <>
            <Button variant="ghost" onClick={() => setOnizleme(null)}>
              Kapat
            </Button>
            <Button variant="secondary" icon="download">
              Belgeyi İndir
            </Button>
          </>
        }
      >
        {onizleme && (
          <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-line bg-surface-muted px-6 py-14 text-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-ink">
              <Icon name="file-text" size={22} />
            </span>
            <p className="text-[14px] font-medium text-ink">{onizleme.ad}</p>
            <p className="text-[12px] text-muted-foreground">{onizleme.dosyaAdi} · Belge önizlemesi</p>
          </div>
        )}
      </Modal>
    </SplitPane>
  )
}

/* ---------------------------------------------------------------- */
/*  Belge listesi — İndir · Aç · (Yükle)                               */
/* ---------------------------------------------------------------- */

function BelgeListesi({
  belgeler,
  onAç,
  yukleGoster,
}: {
  belgeler: SozlesmeBelgesi[]
  onAç: (b: SozlesmeBelgesi) => void
  yukleGoster?: boolean
}) {
  if (belgeler.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-line px-6 py-14 text-center text-[13px] text-muted-foreground">
        Bu klasörde belge yok.
      </p>
    )
  }

  return (
    <ul className="divide-y divide-border rounded-xl border border-border">
      {belgeler.map((b) => (
        <li key={b.ekNo + b.dosyaAdi} className="flex flex-wrap items-center gap-3 px-4 py-3">
          <span className="flex h-7 w-12 shrink-0 items-center justify-center rounded-md bg-surface-muted text-[12px] font-bold text-ink">
            Ek-{b.ekNo}
          </span>
          <span className="min-w-[180px] flex-1 truncate text-[14px] text-foreground">{b.ad}</span>
          <Badge tone="neutral" size="sm">
            {b.dosyaAdi.split('.').pop()?.toUpperCase()}
          </Badge>
          <span className="flex items-center gap-1.5">
            <Button variant="ghost" size="sm" icon="download">
              İndir
            </Button>
            <Button variant="secondary" size="sm" icon="eye" onClick={() => onAç(b)}>
              Aç
            </Button>
            {yukleGoster && (
              <Button variant="ghost" size="sm" icon="upload">
                Yükle
              </Button>
            )}
          </span>
        </li>
      ))}
    </ul>
  )
}

function IconButton2({ icon, label }: { icon: string; label: string }) {
  return (
    <button
      title={label}
      aria-label={label}
      className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-surface-muted hover:text-black"
    >
      <Icon name={icon} size={15} />
    </button>
  )
}
