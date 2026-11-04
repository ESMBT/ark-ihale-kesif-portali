import { useEffect, useMemo, useRef, useState } from 'react'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { Field, Input, Textarea } from '../../components/ui/Field'
import { Icon } from '../../components/ui/Icon'
import { Modal } from '../../components/ui/Modal'
import { EmptyState } from '../../components/ui/Feedback'
import { StatusPill, type PillTone } from '../../components/ui/Shell'
import { ihaleBelgeleri, sozlesmeBelgeleri, zorunluDavetEklari } from '../../data/sozlesmeBelgeleri'
import { sozlesmeTurleri } from '../../data/sozlesmeTurleri'
import { ornekAltYukleniciler, personeller } from '../../data/mock'
import type { AltYuklenici, DegerlendirmeDurumu, IhalePaketi } from '../../data/types'

/* ------------------------------------------------------------------
   İki ayrı durum ekseni
   1) Ön değerlendirme (finansal) — mavi / sarı / kırmızı / gri işaret
   2) Onay durumu (ihale yöneticileri / direktör) — onay bekleniyor → onaylandı → davet edildi
------------------------------------------------------------------ */

const onayDurumu: Record<AltYuklenici['durum'], { label: string; tone: PillTone }> = {
  'onaya-gonderilmedi': { label: 'Onaya gönderilmedi', tone: 'gray' },
  'onaya-gonderildi': { label: 'Onay bekleniyor', tone: 'orange' },
  onaylandi: { label: 'Onaylandı', tone: 'blue' },
  'davet-edildi': { label: 'Davet edildi', tone: 'green' },
  reddedildi: { label: 'Reddedildi', tone: 'red' },
}

const degerlendirmeBilgi: Record<
  DegerlendirmeDurumu,
  { label: string; ikon: string; renk: string }
> = {
  basarili: { label: 'Başarılı', ikon: 'check-circle', renk: 'text-info' },
  basarisiz: { label: 'Başarısız', ikon: 'x-circle', renk: 'text-danger' },
  bekliyor: { label: 'Tamamlanmadı', ikon: 'alert-circle', renk: 'text-warning' },
  'portalda-yok': { label: 'Portal kaydı yok', ikon: 'user-plus', renk: 'text-gray' },
}

/** Ekranda gösterilecek tarih — duruma göre tek bir tarih hizası */
function tarihBilgisi(a: AltYuklenici): { tarih?: string; etiket: string } {
  if (a.durum === 'davet-edildi') return { tarih: a.davetTarihi, etiket: 'Davet tarihi' }
  if (a.durum === 'onaylandi') return { tarih: a.onaylanmaTarihi, etiket: 'Onaylanma' }
  if (a.durum === 'onaya-gonderildi')
    return { tarih: a.onayaGonderilmeTarihi, etiket: 'Gönderilme' }
  return { etiket: '—' }
}

/** Onay makamları — proje kartındaki yönetim kadrosu + pakete atanmış ihale ekibi */
function onayMakamlariniCoz(projeKart: Record<string, string>, ihaleEkibi?: string) {
  const adaylar: { id: string; ad: string; unvan: string }[] = []

  const ekle = (ad?: string, unvan?: string) => {
    if (!ad) return
    const kisi = personeller.find((p) => p.ad === ad)
    if (adaylar.some((a) => a.ad === ad)) return
    adaylar.push({ id: kisi?.id ?? `ad-${ad}`, ad, unvan: unvan ?? kisi?.unvan ?? 'Proje Ekibi' })
  }

  ekle(projeKart.koordinator ?? projeKart.koordinatör, 'Koordinatör')
  ekle(projeKart.direktor, 'Direktör')
  ekle(projeKart.projeMuduru, 'Proje Müdürü')
  ekle(ihaleEkibi, 'İhale Ekibi')

  return adaylar
}

function sorumluAd(id?: string): string {
  if (!id) return '—'
  const p = personeller.find((x) => x.id === id)
  return p?.ad ?? '—'
}

export function InviteCompaniesTab({
  proje,
  paket,
  onKaldir,
  onDavet,
  onOnayaGonder,
  onOnayTamamla,
  onYaklasikBedel,
}: {
  proje: { kart: Record<string, string>; ihaleEkipAtanan?: string }
  paket: IhalePaketi
  onKaldir: (firmaId: string) => void
  onDavet: (firmaId: string) => void
  onOnayaGonder: (firma: AltYuklenici, onaylayanlar: string[]) => void
  onOnayTamamla: (onayId: string) => void
  onYaklasikBedel: (deger: { tutar: string; paraBirimi: string; avansOrani: string }) => void
}) {
  const [arama, setArama] = useState('')
  /* Arama sonuçları arama kutusunun altında açılan panelde gösterilir */
  const [aramaPaneli, setAramaPaneli] = useState(false)
  const [onayaGonderilen, setOnayaGonderilen] = useState<AltYuklenici | null>(null)
  const [detayFirma, setDetayFirma] = useState<AltYuklenici | null>(null)
  const [davetModal, setDavetModal] = useState(false)
  const [davetAlicilari, setDavetAlicilari] = useState<string[]>([])

  /* Yaklaşık ihale bedeli (paket bazlı) — tutar ihale ekibi tarafından girilir */
  const [tutar, setTutar] = useState(paket.yaklasikIhaleBedeli?.tutar ?? '')
  /* Kayıt geri bildirimi — kaydedildiğinde yeşil işaret bir süre görünür */
  const [kaydedildi, setKaydedildi] = useState(false)
  const kaydetZaman = useRef<number | null>(null)

  useEffect(
    () => () => {
      if (kaydetZaman.current) window.clearTimeout(kaydetZaman.current)
    },
    [],
  )

  const bedeliKaydet = () => {
    onYaklasikBedel({
      tutar,
      paraBirimi: paket.yaklasikIhaleBedeli?.paraBirimi ?? 'TRY',
      avansOrani: paket.yaklasikIhaleBedeli?.avansOrani ?? '',
    })
    setKaydedildi(true)
    if (kaydetZaman.current) window.clearTimeout(kaydetZaman.current)
    kaydetZaman.current = window.setTimeout(() => setKaydedildi(false), 4000)
  }

  /* Onaya gönderim modalı */
  const [onaylayanlar, setOnaylayanlar] = useState<string[]>([])
  const [onayKonu, setOnayKonu] = useState('Onay — İhale Paketi İçin Alt Yüklenici Önerisi')
  const [onayCc, setOnayCc] = useState('')
  const [onayNot, setOnayNot] = useState('')

  /* Davet maili */
  const [konu, setKonu] = useState(`İhale Daveti — ${paket.ad}`)
  const [cc, setCc] = useState('')
  const [mesaj, setMesaj] = useState(
    'Sayın Yetkili,\n\nŞirketimize ait aşağıdaki ihale için tekliflerinizi rica ederiz. Keşif, ihale dosyası ve teknik şartnamalar ekte yer almaktadır.\n\nSaygılarımızla,\nİhale Ekibi',
  )
  const [seciliEkler, setSeciliEkler] = useState<string[]>(
    sozlesmeBelgeleri.filter((b) => zorunluDavetEklari.includes(b.ekNo)).map((b) => b.ekNo),
  )

  const onerilenler = paket.onerilenFirmalar ?? []

  /** Onay makamları: koordinatör, direktör, proje müdürü + pakete atanmış ihale ekibi */
  const makamlar = useMemo(
    () => onayMakamlariniCoz(proje.kart ?? {}, proje.ihaleEkipAtanan),
    [proje],
  )

  /** Onay mailine giden veri özeti — tüm paket verileri dahil */
  const onayOzeti = useMemo(() => {
    const bedel = paket.yaklasikIhaleBedeli
    const avansOrani = paket.alanlar?.ihAvans
    const kesinTeminat = paket.alanlar?.ihKesinTeminatOrani
    const sozlesmeEkleri = sozlesmeBelgeleri.length
    const belgeler = paket.belgeler.length
    const pozSayisi = paket.keşif.length
    const sozlesmeTuru = sozlesmeTurleri.find((t) => t.id === paket.sozlesmeTuru)?.ad ?? '—'

    return [
      {
        etiket: 'Yaklaşık İhale Bedeli',
        deger: bedel?.tutar ? `${bedel.tutar} ${bedel.paraBirimi}` : '—',
      },
      { etiket: 'Avans Oranı', deger: avansOrani ? `%${avansOrani}` : '—' },
      { etiket: 'Kesin Teminat Oranı', deger: kesinTeminat ? `%${kesinTeminat}` : '—' },
      { etiket: 'Sözleşme Türü', deger: sozlesmeTuru },
      { etiket: 'İhale Şekli', deger: paket.alanlar?.ihIhaleSekli ?? '—' },
      { etiket: 'Sözleşme Ekleri', deger: `${sozlesmeEkleri} ek` },
      { etiket: 'İhale Belgeleri', deger: `${belgeler} belge` },
      { etiket: 'Keşif', deger: `${pozSayisi} poz` },
      { etiket: 'Sorumlu', deger: sorumluAd(paket.sorumluId) },
    ]
  }, [paket])

  const aramaSonuclari = useMemo(() => {
    const q = arama.trim().toLocaleLowerCase('tr')
    if (!q) return []
    return ornekAltYukleniciler.filter(
      (a) =>
        a.firma.toLocaleLowerCase('tr').includes(q) ||
        a.uzmanlik.toLocaleLowerCase('tr').includes(q),
    )
  }, [arama])

  /** Tablo — paketteki firmalar + şantiyeci önerileri */
  const liste = paket.altYukleniciler
  /** Arama sonuçlarından pakete eklenmemiş olanlar (açılır panelde gösterilir) */
  const aramaSonuclariYeni = aramaSonuclari.filter(
    (a) => !paket.altYukleniciler.some((p) => p.id === a.id),
  )
  /** Davet gönderilebilecek firmalar — yalnızca onaylanmış olanlar */
  const davetEdilecekler = liste.filter((a) => a.durum === 'onaylandi')

  /** Seçili firmanın onay kaydı (onay makamları) */
  const detayOnay = useMemo(
    () => (paket.onaylar ?? []).find((o) => o.firmaId === detayFirma?.id),
    [paket.onaylar, detayFirma],
  )

  const acilanDavet = (firmaIdler: string[]) => {
    setDavetAlicilari(firmaIdler)
    setDavetModal(true)
  }

  return (
    <div className="space-y-4">
      {/* ---------------- ALT YÜKLENİCİLER — TEK TABLO ---------------- */}
      <Card padded={false} className="min-w-0">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border px-4 py-3">
          <h4 className="text-[17px] leading-6">Alt Yükleniciler</h4>
          <Button
            variant="brand"
            size="sm"
            icon="send"
            disabled={davetEdilecekler.length === 0}
            onClick={() => acilanDavet(davetEdilecekler.map((a) => a.id))}
          >
            Davet Et
          </Button>
        </div>

        {/* Arama + Yaklaşık Proje İhale Bedeli — aynı şerit */}
        <div className="flex flex-wrap items-end justify-between gap-3 border-b border-border px-4 py-3">
          <div className="relative min-w-[240px] flex-1">
            <Icon
              name="search"
              size={16}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray"
            />
            <Input
              value={arama}
              onFocus={() => setAramaPaneli(true)}
              onBlur={() => window.setTimeout(() => setAramaPaneli(false), 150)}
              onChange={(e) => {
                setArama(e.target.value)
                setAramaPaneli(true)
              }}
              placeholder="Firma veya uzmanlık ile ara..."
              className="pl-9 text-[13px]"
              aria-expanded={aramaPaneli && arama.trim() !== ''}
            />

            {/* Arama sonuçları — arama kutusunun altında açılan panel */}
            {aramaPaneli && arama.trim() !== '' && (
              <div className="absolute top-full left-0 z-20 mt-1 max-h-[320px] w-full overflow-y-auto rounded-lg border border-line bg-white shadow-lg">
                {aramaSonuclariYeni.length === 0 ? (
                  <p className="px-3 py-3 text-[13px] text-muted-foreground">
                    {aramaSonuclari.length === 0
                      ? 'Firma bulunamadı.'
                      : 'Bu firma zaten pakete eklendi.'}
                  </p>
                ) : (
                  aramaSonuclariYeni.map((a) => {
                    const d = degerlendirmeBilgi[a.degerlendirme ?? 'bekliyor']
                    return (
                      <button
                        key={a.id}
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => {
                          setOnayaGonderilen(a)
                          setOnaylayanlar(makamlar.map((m) => m.id))
                          setAramaPaneli(false)
                        }}
                        className="flex w-full items-center gap-3 border-b border-border px-3 py-2.5 text-left last:border-0 hover:bg-surface-muted"
                      >
                        <span className="min-w-0 flex-1">
                          <span className="flex items-center gap-1.5">
                            <Icon name={d.ikon} size={14} className={`shrink-0 ${d.renk}`} />
                            <span className="truncate text-[14px] font-medium text-foreground">
                              {a.firma}
                            </span>
                          </span>
                          <span className="block truncate text-[12px] text-muted-foreground">
                            {a.uzmanlik} · {a.iletisim}
                          </span>
                        </span>
                        <span className="shrink-0 text-[13px] font-bold text-foreground">{a.skor}</span>
                        <Icon name="star" size={14} className="shrink-0 text-gray" />
                        <Icon name="arrow-right" size={14} className="shrink-0 text-ink" />
                      </button>
                    )
                  })
                )}
              </div>
            )}
          </div>

          <div className="flex items-end gap-2">
            <div>
              <div className="mb-1 flex items-center gap-2">
                <p className="text-[11px] font-bold tracking-wide text-muted-foreground uppercase">
                  Yaklaşık Proje İhale Bedeli
                </p>
                {kaydedildi ? (
                  <span className="inline-flex items-center gap-1 rounded-md border border-success/30 bg-success-soft px-1.5 py-0.5 text-[11px] font-bold text-success">
                    <Icon name="check-circle" size={12} />
                    Kaydedildi
                  </span>
                ) : paket.yaklasikIhaleBedeli?.tutar ? (
                  <span className="inline-flex items-center gap-1 text-[11px] font-medium text-muted-foreground">
                    <Icon name="check-circle" size={12} className="text-success" />
                    Kayıtlı
                  </span>
                ) : null}
              </div>
              <div className="w-[200px]">
                <Input
                  value={tutar}
                  onChange={(e) => {
                    setTutar(e.target.value)
                    setKaydedildi(false)
                  }}
                  placeholder="Tutar"
                  inputMode="decimal"
                  className={kaydedildi ? 'border-success focus:border-success' : ''}
                />
              </div>
            </div>
            <Button
              variant={kaydedildi ? 'primary' : 'secondary'}
              icon={kaydedildi ? 'check-circle' : 'save'}
              onClick={bedeliKaydet}
            >
              {kaydedildi ? 'Kaydedildi' : 'Kaydet'}
            </Button>
          </div>
        </div>

        {/* Tek tablo — paketteki firmalar + arama sonuçları + öneriler */}
        {liste.length === 0 && onerilenler.length === 0 ? (
          <EmptyState
            icon="search"
            title={arama ? 'Firma bulunamadı' : 'Firma veya uzmanlık ile arayın'}
            description={
              arama
                ? 'Farklı bir ifade deneyin veya Genel Bakış → “Firma Öner” ile yeni firma önerin.'
                : 'Sistemde tanımlı firmalar arama sonucu olarak listelenir. Firma yoksa Genel Bakış → “Firma Öner” ile bildirin.'
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full table-fixed border-collapse">
              <thead>
                <tr className="border-b border-border text-[11px] font-bold tracking-wide text-muted-foreground uppercase">
                  <th className="w-8 px-3 py-2" />
                  <th className="px-1 py-2 text-left whitespace-nowrap">Firma</th>
                  <th className="w-[150px] px-2 py-2 text-left whitespace-nowrap">Uzmanlık</th>
                  <th className="w-[72px] px-2 py-2 text-left whitespace-nowrap">Skor</th>
                  <th className="w-[158px] px-2 py-2 text-left whitespace-nowrap">Değerlendirme</th>
                  <th className="w-[150px] px-2 py-2 text-left whitespace-nowrap">Onay Durumu</th>
                  <th className="w-[100px] px-2 py-2 text-left whitespace-nowrap">Tarih</th>
                  <th className="w-[60px] px-3 py-2" />
                </tr>
              </thead>
              <tbody>
                {/* Paketteki firmalar */}
                {liste.map((a) => {
                  const d = degerlendirmeBilgi[a.degerlendirme ?? 'bekliyor']
                  const o = onayDurumu[a.durum]
                  const t = tarihBilgisi(a)
                  const davetAktif = a.durum === 'onaylandi'
                  return (
                    <tr key={a.id} className="border-b border-border last:border-0">
                      {/* Çarpı — listeden çıkar */}
                      <td className="px-3 py-2.5">
                        <button
                          onClick={() => onKaldir(a.id)}
                          className="flex h-6 w-6 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-danger-soft hover:text-danger"
                          title="Listeden çıkar"
                          aria-label={`${a.firma} listesinden çıkar`}
                        >
                          <Icon name="x" size={13} />
                        </button>
                      </td>

                      {/* Firma — detaya açılır */}
                      <td className="px-1 py-2.5">
                        <button
                          onClick={() => setDetayFirma(a)}
                          title={`${a.firma} — detay`}
                          className="block w-full truncate text-left text-[14px] font-medium text-foreground hover:underline"
                        >
                          {a.firma}
                        </button>
                      </td>

                      <td className="px-2 py-2.5">
                        <span className="block truncate text-[13px] text-muted-foreground">
                          {a.uzmanlik}
                        </span>
                      </td>

                      <td className="px-2 py-2.5">
                        <span className="text-[13px] font-bold text-foreground">{a.skor}</span>
                      </td>

                      {/* Ön değerlendirme */}
                      <td className="px-2 py-2.5">
                        <span
                          className="inline-flex max-w-full items-center gap-1.5 text-[13px] text-foreground"
                          title={`${d.label}${a.degerlendirmePuani !== undefined ? ` · ${a.degerlendirmePuani} puan` : ''}`}
                        >
                          <Icon name={d.ikon} size={15} className={`shrink-0 ${d.renk}`} />
                          <span className="truncate">{d.label}</span>
                          {a.degerlendirmePuani !== undefined && (
                            <span className="shrink-0 text-[12px] text-muted-foreground">
                              {a.degerlendirmePuani}
                            </span>
                          )}
                        </span>
                      </td>

                      {/* Onay durumu */}
                      <td className="px-2 py-2.5">
                        <StatusPill label={o.label} tone={o.tone} />
                      </td>

                      {/* Tarih — tek hizada */}
                      <td className="px-2 py-2.5">
                        <span className="block text-[12px] text-foreground">{t.tarih ?? '—'}</span>
                        <span className="block text-[11px] text-muted-foreground">{t.etiket}</span>
                      </td>

                      {/* Davet gönder — yalnızca onaylandıysa */}
                      <td className="px-3 py-2.5 text-right">
                        <button
                          onClick={() => acilanDavet([a.id])}
                          disabled={!davetAktif}
                          title={
                            davetAktif
                              ? 'Davet gönder'
                              : 'Onaylandıktan sonra davet gönderilebilir'
                          }
                          aria-label={`${a.firma} firmasına davet gönder`}
                          className={`flex h-7 w-7 items-center justify-center rounded-lg border border-line transition-colors ${
                            davetAktif
                              ? 'bg-white text-ink hover:bg-surface-muted'
                              : 'cursor-not-allowed bg-surface-muted text-gray opacity-60'
                          }`}
                        >
                          <Icon name="send" size={14} />
                        </button>
                      </td>
                    </tr>
                  )
                })}

                {/* Şantiyecinin önerdiği firmalar */}
                {onerilenler.map((a) => (
                  <tr key={a.id} className="border-b border-border last:border-0">
                    <td className="px-3 py-2.5" />
                    <td className="px-1 py-2.5">
                      <span className="block truncate text-[14px] font-medium text-foreground">
                        {a.firma}
                      </span>
                      <span className="block truncate text-[11px] text-muted-foreground">
                        Şantiyeci önerisi
                      </span>
                    </td>
                    <td className="px-2 py-2.5">
                      <span className="block truncate text-[13px] text-muted-foreground">
                        {a.iletisim}
                      </span>
                    </td>
                    <td className="px-2 py-2.5">—</td>
                    <td className="px-2 py-2.5">
                      <span className="inline-flex items-center gap-1.5 text-[13px] text-foreground">
                        <Icon name="user-plus" size={15} className="shrink-0 text-gray" />
                        <span>Portal kaydı yok</span>
                      </span>
                    </td>
                    <td className="px-2 py-2.5">
                      <Badge tone="warning" size="sm">
                        Önerildi
                      </Badge>
                    </td>
                    <td className="px-2 py-2.5">—</td>
                    <td className="px-3 py-2.5" />
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* ---------------- FİRMA DETAYI ---------------- */}
      <Modal
        open={!!detayFirma}
        onClose={() => setDetayFirma(null)}
        title="Firma Detayı"
        description={detayFirma?.firma}
        size="lg"
        footer={
          <>
            <Button variant="ghost" onClick={() => setDetayFirma(null)}>
              Kapat
            </Button>
            {detayFirma?.durum === 'onaya-gonderildi' && detayOnay && (
              <Button
                variant="brand"
                icon="check-circle"
                onClick={() => {
                  onOnayTamamla(detayOnay.id)
                  setDetayFirma(null)
                }}
              >
                Onayı Tamamla
              </Button>
            )}
            {detayFirma?.durum === 'onaylandi' && (
              <Button
                variant="brand"
                icon="send"
                onClick={() => {
                  const id = detayFirma.id
                  setDetayFirma(null)
                  acilanDavet([id])
                }}
              >
                Davet Gönder
              </Button>
            )}
          </>
        }
      >
        {detayFirma && (
          <div className="space-y-4">
            {/* Başlık */}
            <div className="rounded-xl border border-line bg-surface-muted px-4 py-3">
              <p className="text-[14px] font-medium text-foreground">{detayFirma.firma}</p>
              <p className="text-[12px] text-muted-foreground">
                {detayFirma.uzmanlik} · {detayFirma.iletisim}
              </p>
            </div>

            {/* Durumlar */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-line p-3">
                <p className="text-[11px] font-bold tracking-wide text-muted-foreground uppercase">
                  Ön Değerlendirme
                </p>
                <p className="mt-1.5 flex items-center gap-1.5 text-[14px] font-medium text-foreground">
                  <Icon
                    name={degerlendirmeBilgi[detayFirma.degerlendirme ?? 'bekliyor'].ikon}
                    size={16}
                    className={degerlendirmeBilgi[detayFirma.degerlendirme ?? 'bekliyor'].renk}
                  />
                  {degerlendirmeBilgi[detayFirma.degerlendirme ?? 'bekliyor'].label}
                  {detayFirma.degerlendirmePuani !== undefined && (
                    <span className="text-[13px] font-normal text-muted-foreground">
                      · {detayFirma.degerlendirmePuani} puan
                    </span>
                  )}
                </p>
              </div>
              <div className="rounded-xl border border-line p-3">
                <p className="text-[11px] font-bold tracking-wide text-muted-foreground uppercase">
                  Onay Durumu
                </p>
                <div className="mt-1.5">
                  <StatusPill
                    label={onayDurumu[detayFirma.durum].label}
                    tone={onayDurumu[detayFirma.durum].tone}
                  />
                </div>
              </div>
            </div>

            {/* Bilgiler */}
            <dl className="grid grid-cols-1 gap-x-6 gap-y-2 rounded-lg border border-line bg-surface-muted p-3 sm:grid-cols-2">
              <div className="flex items-center justify-between gap-3">
                <dt className="text-[12px] text-muted-foreground">Skor</dt>
                <dd className="text-[13px] font-medium text-foreground">{detayFirma.skor}</dd>
              </div>
              <div className="flex items-center justify-between gap-3">
                <dt className="text-[12px] text-muted-foreground">Yetki Belgesi</dt>
                <dd className="text-[13px] font-medium text-foreground">{detayFirma.yetkiBelgesi}</dd>
              </div>
              <div className="flex items-center justify-between gap-3">
                <dt className="text-[12px] text-muted-foreground">Vergi Levhası</dt>
                <dd className="text-[13px] font-medium text-foreground">{detayFirma.vergiLevhasi}</dd>
              </div>
              <div className="flex items-center justify-between gap-3">
                <dt className="text-[12px] text-muted-foreground">Onaya Gönderilme</dt>
                <dd className="text-[13px] font-medium text-foreground">
                  {detayFirma.onayaGonderilmeTarihi ?? '—'}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-3">
                <dt className="text-[12px] text-muted-foreground">Onaylanma</dt>
                <dd className="text-[13px] font-medium text-foreground">
                  {detayFirma.onaylanmaTarihi ?? '—'}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-3">
                <dt className="text-[12px] text-muted-foreground">Davet Tarihi</dt>
                <dd className="text-[13px] font-medium text-foreground">
                  {detayFirma.davetTarihi ?? '—'}
                </dd>
              </div>
            </dl>

            {/* Onay makamları */}
            <div>
              <p className="mb-2 text-[13px] font-medium text-black">Onay Makamları</p>
              {detayOnay ? (
                <>
                  <div className="flex flex-wrap gap-1.5">
                    {detayOnay.onaylayanlar.map((id) => {
                      const kisi = personeller.find((p) => p.id === id)
                      return (
                        <span
                          key={id}
                          className="rounded-md border border-line bg-surface-muted px-2 py-1 text-[12px] text-foreground"
                        >
                          {kisi?.ad ?? id}
                          <span className="text-muted-foreground"> · {kisi?.unvan ?? 'Onay Makamı'}</span>
                        </span>
                      )
                    })}
                  </div>
                  <p className="mt-2 text-[12px] text-muted-foreground">
                    Onaya gönderilme: {detayOnay.tarih}
                    {detayOnay.onaylanmaTarihi ? ` · Onaylanma: ${detayOnay.onaylanmaTarihi}` : ''}
                  </p>
                </>
              ) : (
                <p className="text-[12px] text-muted-foreground">Onaya gönderilmemiş.</p>
              )}
            </div>

            {detayFirma.not && (
              <div>
                <p className="mb-1 text-[13px] font-medium text-black">Not</p>
                <p className="text-[13px] text-foreground">{detayFirma.not}</p>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* ---------------- ONAYA GÖNDER ---------------- */}
      <Modal
        open={!!onayaGonderilen}
        onClose={() => setOnayaGonderilen(null)}
        title="Onaya Gönder"
        description={onayaGonderilen ? `${onayaGonderilen.firma} için onay makamlarını seçin` : ''}
        size="lg"
        footer={
          <>
            <Button variant="ghost" onClick={() => setOnayaGonderilen(null)}>
              Vazgeç
            </Button>
            <Button
              variant="brand"
              icon="send"
              disabled={onaylayanlar.length === 0}
              onClick={() => {
                if (!onayaGonderilen) return
                onOnayaGonder(onayaGonderilen, onaylayanlar)
                setOnayaGonderilen(null)
              }}
            >
              Onaya Gönder
            </Button>
          </>
        }
      >
        {onayaGonderilen && (
          <div className="space-y-4">
            <div className="rounded-xl border border-line bg-surface-muted px-4 py-3">
              <p className="text-[14px] font-medium text-foreground">{onayaGonderilen.firma}</p>
              <p className="text-[12px] text-muted-foreground">
                {onayaGonderilen.uzmanlik} · {onayaGonderilen.iletisim}
              </p>
            </div>

            <div>
              <p className="mb-2 text-[14px] font-medium text-black">Onaylayacak Kişiler</p>
              <div className="grid grid-cols-1 gap-1 rounded-lg border border-border p-3 sm:grid-cols-2">
                {makamlar.map((p) => (
                  <label key={p.id} className="flex items-center gap-2.5 text-[13px]">
                    <input
                      type="checkbox"
                      checked={onaylayanlar.includes(p.id)}
                      onChange={(e) =>
                        setOnaylayanlar((prev) =>
                          e.target.checked ? [...prev, p.id] : prev.filter((x) => x !== p.id),
                        )
                      }
                      className="h-4 w-4 rounded-sm border-line accent-black"
                    />
                    <span className="min-w-0 flex-1 truncate">{p.ad}</span>
                    <span className="shrink-0 text-[11px] text-gray">{p.unvan}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Onaya giden veriler */}
            <div>
              <p className="mb-2 text-[14px] font-medium text-black">Onaya Giden Veriler</p>
              <dl className="grid grid-cols-1 gap-x-6 gap-y-2 rounded-lg border border-line bg-surface-muted p-3 sm:grid-cols-2">
                {onayOzeti.map((o) => (
                  <div key={o.etiket} className="flex items-center justify-between gap-3">
                    <dt className="text-[12px] text-muted-foreground">{o.etiket}</dt>
                    <dd className="text-[13px] font-medium text-foreground">{o.deger}</dd>
                  </div>
                ))}
              </dl>
            </div>

            <Field label="Mail Başlığı" required>
              <Input value={onayKonu} onChange={(e) => setOnayKonu(e.target.value)} />
            </Field>

            <Field label="Cc">
              <Input value={onayCc} onChange={(e) => setOnayCc(e.target.value)} placeholder="ornek@arkinsaat.com.tr" />
            </Field>

            <Field label="Not">
              <Textarea value={onayNot} onChange={(e) => setOnayNot(e.target.value)} placeholder="…" />
            </Field>
          </div>
        )}
      </Modal>

      {/* ---------------- DAVET MAİLİ ---------------- */}
      <Modal
        open={davetModal}
        onClose={() => setDavetModal(false)}
        title="Davet Maili"
        description={`${davetAlicilari.length} firmaya gönderilecek taslak`}
        size="lg"
        footer={
          <>
            <Button variant="ghost" onClick={() => setDavetModal(false)}>
              Vazgeç
            </Button>
            <Button
              variant="brand"
              icon="send"
              onClick={() => {
                davetAlicilari.forEach((id) => onDavet(id))
                setDavetModal(false)
              }}
            >
              Davetleri Gönder
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="rounded-xl border border-line bg-surface-muted p-4">
            <p className="text-[12px] font-semibold tracking-wide text-muted-foreground uppercase">Alıcılar</p>
            <ul className="mt-2 space-y-1">
              {liste
                .filter((a) => davetAlicilari.includes(a.id))
                .map((a) => (
                  <li key={a.id} className="text-[13px] text-foreground">
                    {a.firma}
                    <span className="text-muted-foreground"> · {a.iletisim}</span>
                  </li>
                ))}
            </ul>
          </div>

          <Field label="Mail Başlığı" required>
            <Input value={konu} onChange={(e) => setKonu(e.target.value)} />
          </Field>

          <Field label="Cc">
            <Input value={cc} onChange={(e) => setCc(e.target.value)} placeholder="ornek@arkinsaat.com.tr" />
          </Field>

          <Field label="Gövde" required>
            <Textarea value={mesaj} onChange={(e) => setMesaj(e.target.value)} className="min-h-40" />
          </Field>

          {/* Davet ekleri */}
          <div>
            <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
              <p className="text-[14px] font-medium text-black">Davet Ekleri</p>
              <span className="text-[12px] text-muted-foreground">{seciliEkler.length} belge seçili</span>
            </div>
            <div className="max-h-56 overflow-y-auto rounded-lg border border-border p-3">
              <p className="mb-2 text-[12px] font-bold tracking-wide text-muted-foreground uppercase">
                Sözleşme Belgeleri (zorunlu)
              </p>
              {sozlesmeBelgeleri.map((b) => (
                <label key={b.ekNo + b.dosyaAdi} className="flex items-center gap-2.5 py-1.5 text-[13px]">
                  <input
                    type="checkbox"
                    checked={seciliEkler.includes(b.ekNo)}
                    onChange={(e) =>
                      setSeciliEkler((prev) =>
                        e.target.checked ? [...prev, b.ekNo] : prev.filter((x) => x !== b.ekNo),
                      )
                    }
                    className="h-4 w-4 rounded-sm border-line accent-black"
                  />
                  <span className="min-w-0 flex-1 truncate">Ek-{b.ekNo} · {b.ad}</span>
                  {zorunluDavetEklari.includes(b.ekNo) && (
                    <span className="shrink-0 text-[11px] font-bold text-danger">Zorunlu</span>
                  )}
                </label>
              ))}

              <p className="mb-2 mt-3 text-[12px] font-bold tracking-wide text-muted-foreground uppercase">
                İhale Belgeleri (paket dosyaları)
              </p>
              {ihaleBelgeleri
                .filter((b) => b.grup === 'ihale')
                .map((b) => (
                  <label key={b.ekNo + b.dosyaAdi} className="flex items-center gap-2.5 py-1.5 text-[13px]">
                    <input
                      type="checkbox"
                      checked={seciliEkler.includes(b.ekNo)}
                      onChange={(e) =>
                        setSeciliEkler((prev) =>
                          e.target.checked ? [...prev, b.ekNo] : prev.filter((x) => x !== b.ekNo),
                        )
                      }
                      className="h-4 w-4 rounded-sm border-line accent-black"
                    />
                    <span className="min-w-0 flex-1 truncate">Ek-{b.ekNo} · {b.ad}</span>
                  </label>
                ))}
            </div>
          </div>
        </div>
      </Modal>
    </div>
  )
}
