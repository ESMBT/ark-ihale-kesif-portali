import { useMemo, useRef, useState } from 'react'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Icon } from '../../components/ui/Icon'
import { Modal } from '../../components/ui/Modal'
import type { KesifSatiri } from '../../data/types'
import {
  ExcelServisHatasi,
  kesifEslemeIleIceAktar,
  kesifOnizle,
  type SurveyDocumentDto,
  type SurveyRoleInfo,
  type SurveyWorkbookPreview,
} from '../../lib/kesif'
import { BOS_KESIF, useKesifDogrulama } from '../../lib/kesifDogrulama'
import {
  baslikPozAyrimi,
  belgeyiSatirlaraCevir,
  eslemeOnerisi,
  eslemeSorgusu,
  hucreBos,
  hucreMetin,
  sayfaVerisi,
  sutunHarfi,
  type AktarimModu,
  type Esleme,
  type IceAktarAyar,
  type SayfaVerisi,
} from '../../lib/kesifImport'

const ADIMLAR = ['Dosya', 'Aralık', 'Sütun Eşleme', 'Önizleme'] as const
const ONIZLEME_SATIR_LIMITI = 80

type Props = {
  mevcutSatirSayisi: number
  onClose: () => void
  onTamam: (satirlar: KesifSatiri[], mod: AktarimModu) => void
}

const selectCls =
  'h-9 w-full rounded-md border border-line bg-white px-2.5 text-[13px] text-ink outline-none focus:border-black focus:ring-2 focus:ring-black/10'
const numInputCls =
  'h-9 w-24 rounded-md border border-line bg-white px-2.5 text-[13px] text-ink outline-none focus:border-black focus:ring-2 focus:ring-black/10'

function baslangicAyari(onizleme: SurveyWorkbookPreview, sayfa: SayfaVerisi): IceAktarAyar {
  const ham = onizleme.sheets.find((s) => s.name === sayfa.ad)
  const baslikSatiri = ham?.suggestedHeaderRow ?? 0
  return {
    baslikSatiri,
    ilkSatir: baslikSatiri + 1,
    sonSatir: null,
    esleme: eslemeOnerisi(ham?.suggestedColumnMap ?? {}, sayfa.sutunSayisi),
    birimNormalize: true,
    kokBasligi: '',
  }
}

export function ImportWizard({ mevcutSatirSayisi, onClose, onTamam }: Props) {
  const [adim, setAdim] = useState(0)
  const [dosya, setDosya] = useState<File | null>(null)
  const [onizleme, setOnizleme] = useState<SurveyWorkbookPreview | null>(null)
  const [sayfaAdi, setSayfaAdi] = useState('')
  const [ayar, setAyar] = useState<IceAktarAyar | null>(null)
  const [mod, setMod] = useState<AktarimModu>('degistir')
  const [okunuyor, setOkunuyor] = useState(false)
  const [dosyaHatasi, setDosyaHatasi] = useState('')
  const [belge, setBelge] = useState<SurveyDocumentDto | null>(null)
  const [belgeYukleniyor, setBelgeYukleniyor] = useState(false)
  const [belgeHatasi, setBelgeHatasi] = useState('')
  const [sadeceSorunlu, setSadeceSorunlu] = useState(false)
  const dosyaRef = useRef<HTMLInputElement>(null)

  const sayfalar = useMemo(() => onizleme?.sheets.map(sayfaVerisi) ?? [], [onizleme])
  const sayfa = sayfalar.find((s) => s.ad === sayfaAdi) ?? null
  const roller = useMemo(() => onizleme?.roles ?? [], [onizleme])

  const sonuc = useMemo(
    () => (belge && ayar ? belgeyiSatirlaraCevir(belge, ayar) : null),
    [belge, ayar],
  )

  const guncelle = (kismi: Partial<IceAktarAyar>) =>
    setAyar((a) => (a ? { ...a, ...kismi } : a))

  /* ------------------------------ Dosya ------------------------------ */

  const dosyaSec = async (file: File | undefined) => {
    if (!file) return
    setOkunuyor(true)
    setDosyaHatasi('')
    try {
      const o = await kesifOnizle(file)
      const hamSayfalar = o.sheets.map(sayfaVerisi)
      const ad = o.suggestedSheet ?? hamSayfalar[0]?.ad ?? ''
      const s = hamSayfalar.find((x) => x.ad === ad)
      if (!s) {
        setDosyaHatasi('Dosyada okunabilir sayfa bulunamadı.')
        return
      }
      setDosya(file)
      setOnizleme(o)
      setSayfaAdi(ad)
      setAyar(baslangicAyari(o, s))
      setBelge(null)
    } catch (e) {
      setDosyaHatasi(e instanceof Error ? e.message : 'Dosya okunamadı.')
    } finally {
      setOkunuyor(false)
    }
  }

  const sayfaDegistir = (ad: string) => {
    const s = sayfalar.find((x) => x.ad === ad)
    if (!s || !onizleme) return
    setSayfaAdi(ad)
    setAyar(baslangicAyari(onizleme, s))
    setBelge(null)
  }

  /* ------------------------------ Aralık ----------------------------- */

  const baslikSatiriDegistir = (satir: number) => {
    if (!sayfa) return
    const baslik = Math.max(0, Math.min(satir, sayfa.toplamSatir))
    guncelle({ baslikSatiri: baslik, ilkSatir: baslik + 1 })
  }

  /* ----------------------------- Doğrulama --------------------------- */

  const eslemeKontrol = useMemo(() => {
    const sayac = new Map<string, number>()
    for (const r of ayar?.esleme ?? []) if (r) sayac.set(r, (sayac.get(r) ?? 0) + 1)
    const etiket = (k: string) => roller.find((r) => r.key === k)?.label ?? k
    // Level / Poz No sütunu isteğe bağlıdır; ne gelirse Level'a çevrilir (sütun türü içerikten çözülür)
    return {
      eksik: roller.filter((r) => r.required && !sayac.has(r.key)).map((r) => r.label),
      tekrar: [...sayac.entries()].filter(([, n]) => n > 1).map(([k]) => k),
      tekrarEtiketleri: [...sayac.entries()].filter(([, n]) => n > 1).map(([k]) => etiket(k)),
    }
  }, [ayar, roller])

  const aralikGecerli =
    !!ayar && ayar.ilkSatir >= 1 && (ayar.sonSatir === null || ayar.sonSatir >= ayar.ilkSatir)

  const ileriHazir =
    adim === 0
      ? !!onizleme && !!sayfa
      : adim === 1
        ? aralikGecerli
        : adim === 2
          ? eslemeKontrol.eksik.length === 0 && eslemeKontrol.tekrar.length === 0
          : false

  /** 3. adımdan 4.'ye geçerken Ark.Excel ile seçilen eşleme/aralık üzerinden ayrıştırır */
  const belgeGetir = async (kaynak: IceAktarAyar | null = ayar) => {
    if (!dosya || !kaynak || !sayfa) return
    const ayarKaynagi = kaynak
    setBelgeYukleniyor(true)
    setBelgeHatasi('')
    setBelge(null)
    try {
      const b = await kesifEslemeIleIceAktar(dosya, {
        sheetName: sayfa.ad,
        headerRow: ayarKaynagi.baslikSatiri,
        firstDataRow: ayarKaynagi.ilkSatir,
        lastDataRow: ayarKaynagi.sonSatir,
        columnMap: eslemeSorgusu(ayarKaynagi.esleme),
        rootTitle: ayarKaynagi.kokBasligi,
      })
      setBelge(b)
    } catch (e) {
      setBelgeHatasi(
        e instanceof ExcelServisHatasi || e instanceof Error
          ? e.message
          : 'Dosya ayrıştırılamadı.',
      )
    } finally {
      setBelgeYukleniyor(false)
    }
  }

  const ileri = () => {
    if (adim === 2) {
      setAdim(3)
      void belgeGetir()
    } else {
      setAdim((a) => a + 1)
    }
  }

  const aktarilabilir = !!sonuc && sonuc.satirlar.length > 0 && !belgeYukleniyor

  const uygula = () => {
    if (!sonuc || sonuc.satirlar.length === 0) return
    onTamam(sonuc.satirlar, mevcutSatirSayisi === 0 ? 'degistir' : mod)
  }

  /* ------------------------------- Render ---------------------------- */

  return (
    <Modal
      open
      onClose={onClose}
      size="xl"
      title="Excel İçe Aktarma Sihirbazı"
      description={
        dosya
          ? `${dosya.name}${sayfa ? ` · ${sayfa.ad}` : ''}`
          : 'Excel dosyasını seçin, sütunları eşleyin ve tabloya aktarın'
      }
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Vazgeç
          </Button>
          <div className="ml-auto flex items-center gap-2">
            {adim > 0 && (
              <Button variant="secondary" icon="chevron-left" onClick={() => setAdim((a) => a - 1)}>
                Geri
              </Button>
            )}
            {adim < 3 ? (
              <Button variant="primary" iconRight="chevron-right" disabled={!ileriHazir} onClick={ileri}>
                İleri
              </Button>
            ) : (
              <Button variant="brand" icon="upload" disabled={!aktarilabilir} onClick={uygula}>
                {belgeYukleniyor
                  ? 'Ayrıştırılıyor…'
                  : sonuc
                    ? mod === 'ekle' && mevcutSatirSayisi > 0
                      ? `Sona Ekle (${sonuc.satirlar.length} satır)`
                      : `Tabloya Aktar (${sonuc.satirlar.length} satır)`
                    : 'Aktar'}
              </Button>
            )}
          </div>
        </>
      }
    >
      <Stepper adim={adim} />

      <div className="mt-5">
        {adim === 0 && (
          <DosyaAdimi
            dosyaAdi={dosya?.name}
            sayfalar={onizleme?.sheets ?? []}
            sayfaAdi={sayfaAdi}
            sayfa={sayfa}
            okunuyor={okunuyor}
            hata={dosyaHatasi}
            dosyaRef={dosyaRef}
            onDosya={(f) => void dosyaSec(f)}
            onSayfa={sayfaDegistir}
          />
        )}

        {adim === 1 && sayfa && ayar && (
          <AralikAdimi
            sayfa={sayfa}
            ayar={ayar}
            gecersiz={!aralikGecerli}
            onBaslik={baslikSatiriDegistir}
            onIlk={(n) => guncelle({ ilkSatir: Math.max(1, n) })}
            onSon={(n) => guncelle({ sonSatir: n })}
          />
        )}

        {adim === 2 && sayfa && ayar && onizleme && (
          <EslemeAdimi
            sayfa={sayfa}
            ayar={ayar}
            roller={roller}
            kontrol={eslemeKontrol}
            onEsleme={(c, rol) => {
              const yeni: Esleme = [...ayar.esleme]
              yeni[c] = rol
              guncelle({ esleme: yeni })
            }}
            onOtomatik={() => {
              const ham = onizleme.sheets.find((s) => s.name === sayfa.ad)
              guncelle({ esleme: eslemeOnerisi(ham?.suggestedColumnMap ?? {}, sayfa.sutunSayisi) })
            }}
            onTemizle={() => guncelle({ esleme: ayar.esleme.map(() => '') })}
          />
        )}

        {adim === 3 && ayar && (
          <OnizlemeAdimi
            ayar={ayar}
            sonuc={sonuc}
            belge={belge}
            yukleniyor={belgeYukleniyor}
            hata={belgeHatasi}
            mevcutSatirSayisi={mevcutSatirSayisi}
            mod={mod}
            onMod={setMod}
            onAyar={guncelle}
            sadeceSorunlu={sadeceSorunlu}
            onSadeceSorunlu={setSadeceSorunlu}
            onTekrar={() => void belgeGetir()}
            onYenidenGetir={(kismi) => {
              guncelle(kismi)
              void belgeGetir({ ...ayar, ...kismi })
            }}
          />
        )}
      </div>
    </Modal>
  )
}

/* ============================== Stepper ============================== */

function Stepper({ adim }: { adim: number }) {
  return (
    <ol className="flex items-center gap-2">
      {ADIMLAR.map((ad, i) => {
        const aktif = i === adim
        const tamam = i < adim
        return (
          <li key={ad} className="flex flex-1 items-center gap-2 last:flex-none">
            <span
              className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[12px] font-bold ${
                aktif
                  ? 'bg-black text-white'
                  : tamam
                    ? 'bg-success text-white'
                    : 'bg-surface-muted text-muted-foreground'
              }`}
            >
              {tamam ? <Icon name="check" size={14} /> : i + 1}
            </span>
            <span className={`text-[13px] ${aktif ? 'font-bold text-black' : 'text-muted-foreground'}`}>
              {ad}
            </span>
            {i < ADIMLAR.length - 1 && <span className="h-px flex-1 bg-line" />}
          </li>
        )
      })}
    </ol>
  )
}

/* ============================ 1. Dosya adımı ========================= */

function DosyaAdimi({
  dosyaAdi,
  sayfalar,
  sayfaAdi,
  sayfa,
  okunuyor,
  hata,
  dosyaRef,
  onDosya,
  onSayfa,
}: {
  dosyaAdi?: string
  sayfalar: Array<{ name: string; rowCount: number; columnCount: number; detectedColumnCount: number }>
  sayfaAdi: string
  sayfa: SayfaVerisi | null
  okunuyor: boolean
  hata: string
  dosyaRef: React.RefObject<HTMLInputElement | null>
  onDosya: (f: File | undefined) => void
  onSayfa: (ad: string) => void
}) {
  return (
    <div className="space-y-5">
      <div
        onClick={() => dosyaRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault()
          onDosya(e.dataTransfer.files?.[0])
        }}
        className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-line bg-surface-muted px-6 py-8 text-center transition-colors hover:border-black"
      >
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-ink">
          <Icon name="file-spreadsheet" size={20} />
        </span>
        <p className="mt-2 text-[14px] font-medium text-foreground">
          {okunuyor
            ? 'Ark.Excel dosyayı okuyor…'
            : dosyaAdi
              ? `${dosyaAdi} — başka dosya seçmek için tıklayın`
              : 'Excel dosyasını sürükleyin veya seçmek için tıklayın'}
        </p>
        <p className="mt-0.5 text-[12px] text-muted-foreground">.xlsx dosyaları · Ark.Excel servisi ile okunur</p>
        <input
          ref={dosyaRef}
          type="file"
          accept=".xlsx,.xlsm"
          className="hidden"
          onChange={(e) => {
            onDosya(e.target.files?.[0])
            e.target.value = ''
          }}
        />
      </div>

      {hata && (
        <div className="rounded-xl border border-danger/30 bg-danger-soft px-4 py-3 text-[14px] text-danger">
          {hata}
        </div>
      )}

      {sayfalar.length > 0 && (
        <div>
          <p className="mb-2 text-[13px] font-bold text-ink">
            Hangi sayfadan aktarılsın?{' '}
            <span className="font-normal text-muted-foreground">({sayfalar.length} sayfa)</span>
          </p>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {sayfalar.map((s) => {
              const secili = s.name === sayfaAdi
              return (
                <button
                  key={s.name}
                  type="button"
                  onClick={() => onSayfa(s.name)}
                  className={`rounded-xl border px-3.5 py-3 text-left transition-colors ${
                    secili ? 'border-black bg-surface-muted' : 'border-line bg-white hover:bg-surface-muted'
                  }`}
                >
                  <span className="flex items-center justify-between gap-2">
                    <span className="truncate text-[14px] font-medium text-black">{s.name}</span>
                    {s.detectedColumnCount >= 4 && (
                      <Badge tone="success" size="sm">
                        Keşif tablosu
                      </Badge>
                    )}
                  </span>
                  <span className="mt-0.5 block text-[12px] text-muted-foreground">
                    {s.rowCount} satır · {s.columnCount} sütun
                  </span>
                </button>
              )
            })}
          </div>
        </div>
      )}

      {sayfa && (
        <div>
          <p className="mb-2 text-[13px] font-bold text-ink">Sayfa önizlemesi</p>
          <Izgara sayfa={sayfa} satirLimiti={10} />
        </div>
      )}
    </div>
  )
}

/* ============================ 2. Aralık adımı ======================== */

function AralikAdimi({
  sayfa,
  ayar,
  gecersiz,
  onBaslik,
  onIlk,
  onSon,
}: {
  sayfa: SayfaVerisi
  ayar: IceAktarAyar
  gecersiz: boolean
  onBaslik: (n: number) => void
  onIlk: (n: number) => void
  onSon: (n: number | null) => void
}) {
  const toplam = sayfa.toplamSatir
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-4 rounded-xl border border-line bg-surface-soft p-4">
        <label className="block">
          <span className="mb-1 block text-[12px] font-medium text-muted-foreground">Başlık satırı</span>
          <input
            type="number"
            min={0}
            max={toplam}
            value={ayar.baslikSatiri}
            onChange={(e) => onBaslik(Number(e.target.value) || 0)}
            className={numInputCls}
          />
          <span className="mt-1 block text-[11px] text-muted-foreground">0 = başlık yok</span>
        </label>
        <label className="block">
          <span className="mb-1 block text-[12px] font-medium text-muted-foreground">İlk veri satırı</span>
          <input
            type="number"
            min={1}
            max={toplam}
            value={ayar.ilkSatir}
            onChange={(e) => onIlk(Number(e.target.value) || 1)}
            className={numInputCls}
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-[12px] font-medium text-muted-foreground">Son veri satırı</span>
          <input
            type="number"
            min={1}
            max={toplam}
            value={ayar.sonSatir ?? ''}
            placeholder={String(toplam)}
            onChange={(e) => onSon(e.target.value === '' ? null : Number(e.target.value))}
            className={numInputCls}
          />
          <span className="mt-1 block text-[11px] text-muted-foreground">Boş = sona kadar</span>
        </label>
        <p className="min-w-[220px] flex-1 text-[12px] leading-5 text-muted-foreground">
          Tablodaki bir <strong className="text-ink">satır numarasına tıklayarak</strong> o satırı başlık
          olarak seçebilirsiniz. Başlığın üstündeki satırlar (firma, proje, tarih künyesi) ve aralık
          dışındaki satırlar aktarılmaz.
        </p>
      </div>

      {gecersiz && (
        <div className="rounded-xl border border-danger/30 bg-danger-soft px-4 py-2.5 text-[13px] text-danger">
          Son satır, ilk veri satırından küçük olamaz.
        </div>
      )}

      <Izgara
        sayfa={sayfa}
        satirLimiti={200}
        baslikSatiri={ayar.baslikSatiri}
        ilkSatir={ayar.ilkSatir}
        sonSatir={ayar.sonSatir}
        onSatirTikla={onBaslik}
      />
    </div>
  )
}

/* ============================ 3. Eşleme adımı ======================== */

function EslemeAdimi({
  sayfa,
  ayar,
  roller,
  kontrol,
  onEsleme,
  onOtomatik,
  onTemizle,
}: {
  sayfa: SayfaVerisi
  ayar: IceAktarAyar
  roller: SurveyRoleInfo[]
  kontrol: { eksik: string[]; tekrar: string[]; tekrarEtiketleri: string[] }
  onEsleme: (c: number, rol: string) => void
  onOtomatik: () => void
  onTemizle: () => void
}) {
  // Örnek değerler: veri aralığındaki ilk 3 dolu hücre
  const ornekler = useMemo(() => {
    const son = Math.min(ayar.sonSatir ?? sayfa.satirlar.length, sayfa.satirlar.length)
    return Array.from({ length: sayfa.sutunSayisi }, (_, c) => {
      const o: string[] = []
      for (let r = ayar.ilkSatir; r <= son && o.length < 3; r++) {
        const h = sayfa.satirlar[r - 1]?.[c]
        if (!hucreBos(h)) o.push(hucreMetin(h))
      }
      return o
    })
  }, [sayfa, ayar.ilkSatir, ayar.sonSatir])

  const eslenen = ayar.esleme.filter(Boolean).length
  const ayrim = useMemo(() => baslikPozAyrimi(sayfa, ayar), [sayfa, ayar])
  const tanimEslendi = ayar.esleme.includes('description')

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <p className="text-[13px] text-muted-foreground">
          Her Excel sütunu için tablodaki karşılığını seçin. Boş bırakılan sütunlar aktarılmaz.{' '}
          <strong className="text-ink">{eslenen}</strong> / {sayfa.sutunSayisi} sütun eşlendi.
        </p>
        <div className="ml-auto flex gap-2">
          <Button variant="secondary" size="sm" onClick={onOtomatik} title="Ark.Excel'in tespit ettiği eşlemeyi geri yükler">
            Otomatik Eşle
          </Button>
          <Button variant="ghost" size="sm" onClick={onTemizle}>
            Temizle
          </Button>
        </div>
      </div>

      {kontrol.eksik.length > 0 && (
        <div className="rounded-xl border border-warning/30 bg-warning-soft px-4 py-2.5 text-[13px] text-warning">
          Zorunlu alan eşlenmedi: <strong>{kontrol.eksik.join(', ')}</strong>
        </div>
      )}
      {kontrol.tekrar.length > 0 && (
        <div className="rounded-xl border border-danger/30 bg-danger-soft px-4 py-2.5 text-[13px] text-danger">
          Aynı alana birden fazla sütun eşlenmiş: <strong>{kontrol.tekrarEtiketleri.join(', ')}</strong>
        </div>
      )}

      {tanimEslendi && (
        <div className="rounded-xl border border-line bg-surface-soft px-4 py-3 text-[13px]">
          <p className="font-bold text-ink">Başlık ve poz ayrımı</p>
          <p className="mt-0.5 text-[12px] leading-5 text-muted-foreground">
            “Poz Tanımı” sütunu hem başlıkları hem pozları içerebilir. Birim ve miktarı olmayan satırlar{' '}
            <strong className="text-ink">başlık</strong> olarak ayrılır; yalnızca birim/miktarı olan satırlar{' '}
            <strong className="text-ink">poz</strong> tanımı olur. Bu, tahmini bir ayrımdır; kesin sonuç son adımda
            görünür.
          </p>
          <div className="mt-2 grid gap-3 sm:grid-cols-2">
            <AyrimKutusu
              baslik="Başlık"
              sayi={ayrim.baslikSayisi}
              ornekler={ayrim.baslikOrnekleri}
              ipucu="Birim ve miktarı boş"
            />
            <AyrimKutusu
              baslik="Poz"
              sayi={ayrim.pozSayisi}
              ornekler={ayrim.pozOrnekleri}
              ipucu="Birim veya miktarı dolu"
            />
          </div>
        </div>
      )}

      <div className="overflow-hidden rounded-xl border border-border">
        <div className="max-h-[40vh] overflow-auto">
          <table className="w-full border-collapse text-[13px]">
            <thead className="sticky top-0 z-10">
              <tr className="border-b border-line bg-surface-muted">
                {['Excel sütunu', 'Örnek değerler', '', 'Tablodaki alan'].map((h, i) => (
                  <th
                    key={i}
                    className="px-3 py-2.5 text-left text-[11px] font-bold tracking-wide text-muted-foreground uppercase"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: sayfa.sutunSayisi }, (_, c) => {
                const baslik = ayar.baslikSatiri ? hucreMetin(sayfa.satirlar[ayar.baslikSatiri - 1]?.[c]) : ''
                const rol = ayar.esleme[c] ?? ''
                const tekrar = rol !== '' && kontrol.tekrar.includes(rol)
                const bos = ornekler[c].length === 0 && !baslik
                return (
                  <tr
                    key={c}
                    className={`border-b border-border last:border-0 ${bos ? 'opacity-50' : ''} ${rol ? '' : 'bg-surface-soft/50'}`}
                  >
                    <td className="w-[200px] px-3 py-2 align-middle">
                      <span className="inline-flex items-center gap-2">
                        <span className="flex h-6 min-w-6 items-center justify-center rounded bg-surface-muted px-1 font-mono text-[11px] font-bold text-ink">
                          {sutunHarfi(c)}
                        </span>
                        <span className="truncate font-medium text-black">{baslik || '—'}</span>
                      </span>
                    </td>
                    <td className="max-w-[320px] px-3 py-2 align-middle">
                      <div className="flex flex-wrap gap-1.5">
                        {ornekler[c].length === 0 ? (
                          <span className="text-[12px] text-muted-foreground">(boş)</span>
                        ) : (
                          ornekler[c].map((o, i) => (
                            <span
                              key={i}
                              className="max-w-[140px] truncate rounded border border-line bg-white px-1.5 py-0.5 text-[12px] text-ink"
                              title={o}
                            >
                              {o}
                            </span>
                          ))
                        )}
                      </div>
                    </td>
                    <td className="w-8 px-1 text-muted-foreground">
                      <Icon name="arrow-right" size={15} />
                    </td>
                    <td className="w-[250px] px-3 py-2 align-middle">
                      <select
                        value={rol}
                        onChange={(e) => onEsleme(c, e.target.value)}
                        className={`${selectCls} ${tekrar ? 'border-danger-strong' : ''}`}
                        aria-label={`${sutunHarfi(c)} sütunu hedef alanı`}
                      >
                        <option value="">— Aktarma —</option>
                        {roller.map((r) => (
                          <option key={r.key} value={r.key}>
                            {r.label}
                            {r.required ? ' *' : ''}
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

/* =========================== 4. Önizleme adımı ======================= */

function OnizlemeAdimi({
  ayar,
  sonuc,
  belge,
  yukleniyor,
  hata,
  mevcutSatirSayisi,
  mod,
  onMod,
  onAyar,
  sadeceSorunlu,
  onSadeceSorunlu,
  onTekrar,
  onYenidenGetir,
}: {
  ayar: IceAktarAyar
  sonuc: ReturnType<typeof belgeyiSatirlaraCevir> | null
  belge: SurveyDocumentDto | null
  yukleniyor: boolean
  hata: string
  mevcutSatirSayisi: number
  mod: AktarimModu
  onMod: (m: AktarimModu) => void
  onAyar: (k: Partial<IceAktarAyar>) => void
  sadeceSorunlu: boolean
  onSadeceSorunlu: (b: boolean) => void
  onTekrar: () => void
  /** Backend ayrıştırmasını etkileyen bir seçenek değişti: ayarı güncelle ve yeniden ayrıştır */
  onYenidenGetir: (kismi: Partial<IceAktarAyar>) => void
}) {
  const [kokGirdi, setKokGirdi] = useState(ayar.kokBasligi)
  // F6: aktarılacak satırlar (birim düzeltme vb. seçenekler uygulanmış haliyle) kurallara göre doğrulanır.
  // Bu bilgilendiricidir; içe aktarmayı ENGELLEMEZ — sorunlar aktarım sonrası tabloda "Düzelt" ile giderilir.
  const dogrulama = useKesifDogrulama(sonuc?.satirlar ?? BOS_KESIF, { bekleMs: 150 })
  const sorunHaritasi = useMemo(() => {
    const harita = new Map<string, string[]>()
    if (!dogrulama.guncel) return harita
    for (const i of dogrulama.sonuc?.issues ?? []) {
      if (!i.rowId) continue
      const liste = harita.get(i.rowId) ?? []
      liste.push(`${i.code}: ${i.message}`)
      harita.set(i.rowId, liste)
    }
    return harita
  }, [dogrulama.guncel, dogrulama.sonuc])
  const satirlarEfektif = useMemo(
    () =>
      (sonuc?.onizleme ?? []).map((o) => {
        const ek = sorunHaritasi.get(o.satir.id) ?? []
        const mesajlar = [...o.mesajlar, ...ek]
        return { ...o, mesajlar, durum: mesajlar.length > 0 ? ('uyari' as const) : ('tamam' as const) }
      }),
    [sonuc, sorunHaritasi],
  )

  if (yukleniyor) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-line bg-surface-soft px-6 py-14 text-[14px] text-muted-foreground">
        <Icon name="file-spreadsheet" size={22} />
        Ark.Excel seçtiğiniz eşleme ile dosyayı ayrıştırıyor…
      </div>
    )
  }

  if (hata) {
    return (
      <div className="space-y-3">
        <div className="rounded-xl border border-danger/30 bg-danger-soft px-4 py-3 text-[14px] text-danger">
          <strong className="font-bold">İçe aktarılamadı.</strong> {hata}
        </div>
        <p className="text-[13px] text-muted-foreground">
          Önceki adımlara dönüp başlık satırını, veri aralığını veya sütun eşlemesini düzeltebilirsiniz.
        </p>
        <Button variant="secondary" size="sm" onClick={onTekrar}>
          Tekrar Dene
        </Button>
      </div>
    )
  }

  if (!sonuc) return null

  const sorunluSatirlar = satirlarEfektif.filter((o) => (sadeceSorunlu ? o.durum !== 'tamam' : true))
  const gorunen = sorunluSatirlar.slice(0, ONIZLEME_SATIR_LIMITI)
  const toplamTutar = belge?.computedTotals?.totalTl ?? null

  return (
    <div className="space-y-4">
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        {/* Seçenekler */}
        <div className="space-y-4 rounded-xl border border-line bg-surface-soft p-4">
          <label className="flex cursor-pointer items-center gap-2.5 text-[13px] text-black">
            <input
              type="checkbox"
              className="h-4 w-4 accent-black"
              checked={ayar.birimNormalize}
              onChange={(e) => onAyar({ birimNormalize: e.target.checked })}
            />
            Birimleri düzelt (m2 → m², m3 → m³)
          </label>

          <div className="space-y-2 border-t border-line pt-3">
            {belge?.sections.some((b) => b.isGenerated) && (
              <label className="block">
                <span className="mb-1 block text-[12px] font-medium text-muted-foreground">
                  Üst satır (01) açıklaması
                </span>
                <input
                  type="text"
                  value={kokGirdi}
                  placeholder={belge.sections.find((b) => b.isGenerated)?.title}
                  onChange={(e) => setKokGirdi(e.target.value)}
                  onBlur={() => {
                    if (kokGirdi.trim() !== ayar.kokBasligi) onYenidenGetir({ kokBasligi: kokGirdi.trim() })
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') e.currentTarget.blur()
                  }}
                  className={selectCls}
                />
                <span className="mt-1 block text-[11px] text-muted-foreground">
                  Dosyada üst satır yoktu (ör. V.1., V.2. bölümlerinin “V” üstü); projenin / keşfin açıklaması
                  olarak 01 numaralı satır eklendi. Değiştirip Enter’a basın.
                </span>
              </label>
            )}
          </div>

          <p className="text-[12px] leading-5 text-muted-foreground">
            Dosyada ne varsa (Level, Poz No, Sıra No, etiket) otomatik olarak{' '}
            <strong className="text-ink">Level 1–9</strong>’a çevrilir ve 01 → 01.01 → 01.01.0010 düzeninde yeniden
            numaralanır; özgün kod “Poz Kodu” sütununda korunur. Level’ı <strong className="text-ink">C</strong>{' '}
            olan satırlar açıklama (yorum) satırıdır. Başlık/poz ayrımı Ark.Excel tarafından yapılır: birim veya miktarı olan satırlar{' '}
            <strong className="text-ink">poz</strong>, birim ve miktarı olmayan kodlu satırlar{' '}
            <strong className="text-ink">başlık</strong> (ana grup) olur. <strong className="text-ink">Numarası
            olmayan satırlar</strong> (çok satırlı açıklamalar, notlar) önceki satırın devamı olarak ayrı
            satırlar halinde tabloya eklenir; toplam satırı aktarılmaz.
          </p>
        </div>

        {/* Hedef + özet */}
        <div className="space-y-4">
          <div className="rounded-xl border border-line p-4">
            <p className="mb-2 text-[12px] font-bold tracking-wide text-muted-foreground uppercase">
              Nereye aktarılsın?
            </p>
            <div className="space-y-1.5">
              <label
                className={`flex items-start gap-2.5 rounded-lg px-2 py-1.5 ${mevcutSatirSayisi === 0 ? 'opacity-40' : 'cursor-pointer hover:bg-surface-muted'}`}
              >
                <input
                  type="radio"
                  name="aktarimModu"
                  className="mt-1 accent-black"
                  checked={mod === 'ekle' && mevcutSatirSayisi > 0}
                  disabled={mevcutSatirSayisi === 0}
                  onChange={() => onMod('ekle')}
                />
                <span>
                  <span className="block text-[13px] text-black">Mevcut tablonun sonuna ekle</span>
                  <span className="block text-[12px] text-muted-foreground">
                    Tabloda şu an {mevcutSatirSayisi} satır var, bunlar korunur
                  </span>
                </span>
              </label>
              <label className="flex cursor-pointer items-start gap-2.5 rounded-lg px-2 py-1.5 hover:bg-surface-muted">
                <input
                  type="radio"
                  name="aktarimModu"
                  className="mt-1 accent-black"
                  checked={mod === 'degistir' || mevcutSatirSayisi === 0}
                  onChange={() => onMod('degistir')}
                />
                <span>
                  <span className="block text-[13px] text-black">Tabloyu bu veriyle değiştir</span>
                  <span className="block text-[12px] text-muted-foreground">
                    {mevcutSatirSayisi > 0 ? `Mevcut ${mevcutSatirSayisi} satır silinir` : 'Tablo şu an boş'}
                  </span>
                </span>
              </label>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
            <Ozet etiket="Başlık" deger={sonuc.ozet.grup} />
            <Ozet etiket="Poz" deger={sonuc.ozet.kalem} />
            <Ozet etiket="Açıklama satırı" deger={sonuc.ozet.yorum} />
            <Ozet etiket="Uyarı" deger={sonuc.ozet.uyari} ton={sonuc.ozet.uyari ? 'warning' : undefined} />
            <Ozet
              etiket="Hesaplanan toplam"
              metin={
                toplamTutar
                  ? toplamTutar.toLocaleString('tr-TR', { maximumFractionDigits: 0 })
                  : '—'
              }
            />
          </div>

          {sonuc.satirlar.length === 0 && (
            <div className="rounded-xl border border-danger/30 bg-danger-soft px-4 py-2.5 text-[13px] text-danger">
              Aktarılabilecek satır yok. Aralığı veya sütun eşlemesini kontrol edin.
            </div>
          )}
        </div>
      </div>

      {/* F6: aktarım sonrası tablo doğrulaması (bilgilendirici; içe aktarmayı engellemez) */}
      <DogrulamaOzeti durum={dogrulama} satirlar={sonuc.satirlar} />

      {sonuc.genelUyarilar.length > 0 && (
        <div className="rounded-xl border border-warning/30 bg-warning-soft px-4 py-3 text-[13px] text-warning">
          <p className="mb-1 font-bold">Ark.Excel uyarıları</p>
          <ul className="list-disc space-y-0.5 pl-5">
            {sonuc.genelUyarilar.map((m, i) => (
              <li key={i}>{m}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Önizleme tablosu */}
      <div>
        <div className="mb-2 flex items-center gap-3">
          <p className="text-[13px] font-bold text-ink">Önizleme</p>
          <span className="text-[12px] text-muted-foreground">
            {sorunluSatirlar.length > ONIZLEME_SATIR_LIMITI
              ? `İlk ${ONIZLEME_SATIR_LIMITI} / ${sorunluSatirlar.length} satır`
              : `${sorunluSatirlar.length} satır`}
          </span>
          <label className="ml-auto flex cursor-pointer items-center gap-2 text-[12px] text-ink">
            <input
              type="checkbox"
              className="accent-black"
              checked={sadeceSorunlu}
              onChange={(e) => onSadeceSorunlu(e.target.checked)}
            />
            Sadece uyarılı satırlar
          </label>
        </div>
        <div className="max-h-[38vh] overflow-auto rounded-xl border border-border">
          <table className="w-full border-collapse text-[12px]">
            <thead className="sticky top-0 z-10">
              <tr className="border-b border-line bg-surface-muted">
                {['Excel', 'Durum', 'Level', 'Poz Kodu', 'Başlık', 'Poz Tanımı', 'Birim', 'Miktar', 'Malzeme', 'İşçilik', 'GGK', 'Birim Fiyat', 'Not'].map(
                  (h) => (
                    <th
                      key={h}
                      className="px-2.5 py-2 text-left text-[11px] font-bold tracking-wide whitespace-nowrap text-muted-foreground uppercase"
                    >
                      {h}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody>
              {gorunen.length === 0 && (
                <tr>
                  <td colSpan={13} className="px-3 py-6 text-center text-muted-foreground">
                    Gösterilecek satır yok.
                  </td>
                </tr>
              )}
              {gorunen.map((o, i) => {
                const s = o.satir
                const grup = s.seviye === 1
                const yorum = Boolean(s.yorum)
                return (
                  <tr
                    key={`${o.kaynakSatir}-${i}`}
                    className={`border-b border-border last:border-0 ${grup ? 'bg-surface-soft font-bold' : ''} ${yorum ? 'text-muted-foreground italic' : ''}`}
                  >
                    <td className="px-2.5 py-1.5 font-mono text-muted-foreground">{o.kaynakSatir || '—'}</td>
                    <td className="px-2.5 py-1.5">
                      <span
                        className={`inline-block rounded-full px-2 py-0.5 text-[11px] font-bold ${
                          o.durum === 'uyari' ? 'bg-warning-soft text-warning' : 'bg-success-soft text-success'
                        }`}
                      >
                        {o.durum === 'uyari' ? 'Uyarı' : 'Tamam'}
                      </span>
                    </td>
                    <td className="px-2.5 py-1.5 font-mono whitespace-nowrap">{yorum ? 'C' : (s.level ?? '')}</td>
                    <td className="px-2.5 py-1.5 font-mono whitespace-nowrap text-muted-foreground">{s.kaynakKodu ?? ''}</td>
                    <td className="max-w-[240px] truncate px-2.5 py-1.5" title={grup ? s.pozTanimi : undefined}>
                      {grup ? s.pozTanimi : ''}
                    </td>
                    <td className="max-w-[280px] truncate px-2.5 py-1.5 font-normal" title={grup ? undefined : s.pozTanimi}>
                      {yorum && <span className="mr-1 not-italic">↳</span>}
                      {grup ? '' : s.pozTanimi}
                    </td>
                    <td className="px-2.5 py-1.5">{s.birim}</td>
                    <td className="px-2.5 py-1.5 text-right tabular-nums">{grup || yorum ? '' : sayiGoster(s.miktar)}</td>
                    <td className="px-2.5 py-1.5 text-right tabular-nums">{sayiGoster(s.malzeme)}</td>
                    <td className="px-2.5 py-1.5 text-right tabular-nums">{sayiGoster(s.iscilik)}</td>
                    <td className="px-2.5 py-1.5 text-right tabular-nums">{sayiGoster(s.ggk)}</td>
                    <td className="px-2.5 py-1.5 text-right tabular-nums">{sayiGoster(s.birimFiyat)}</td>
                    <td className="max-w-[240px] px-2.5 py-1.5 text-muted-foreground">
                      {o.mesajlar.join(' · ')}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

function AyrimKutusu({
  baslik,
  sayi,
  ornekler,
  ipucu,
}: {
  baslik: string
  sayi: number
  ornekler: string[]
  ipucu: string
}) {
  return (
    <div className="rounded-lg border border-line bg-white px-3 py-2">
      <div className="flex items-baseline gap-2">
        <span className="text-[16px] font-bold text-black tabular-nums">{sayi}</span>
        <span className="text-[13px] font-bold text-ink">{baslik}</span>
        <span className="text-[11px] text-muted-foreground">· {ipucu}</span>
      </div>
      <ul className="mt-1 space-y-0.5">
        {ornekler.length === 0 ? (
          <li className="text-[12px] text-muted-foreground">(örnek yok)</li>
        ) : (
          ornekler.map((o, i) => (
            <li key={i} className="truncate text-[12px] text-ink" title={o}>
              {o}
            </li>
          ))
        )}
      </ul>
    </div>
  )
}

/** Sihirbazın önizleme adımında, aktarılacak satırların kural doğrulaması özeti (F6) */
function DogrulamaOzeti({
  durum,
  satirlar,
}: {
  durum: ReturnType<typeof useKesifDogrulama>
  satirlar: KesifSatiri[]
}) {
  const { sonuc, guncel, hata } = durum
  const etiket = useMemo(() => {
    const harita = new Map<string, string>()
    for (const s of satirlar) harita.set(s.id, (s.pozTanimi?.trim() || s.pozNo?.trim() || '—').slice(0, 42))
    return harita
  }, [satirlar])

  if (hata) {
    return (
      <div className="rounded-xl border border-line bg-surface-soft px-4 py-2.5 text-[13px] text-muted-foreground" role="status">
        Aktarılacak satırlar doğrulanamadı ({hata}). İçe aktarma yine de yapılabilir; aktardıktan sonra tabloda
        “Keşfi Kontrol Et” ile kontrol edin.
      </div>
    )
  }
  if (!guncel || !sonuc) {
    return (
      <div className="rounded-xl border border-line bg-surface-soft px-4 py-2.5 text-[13px] text-muted-foreground" role="status">
        Aktarılacak satırlar doğrulanıyor…
      </div>
    )
  }
  if (sonuc.issues.length === 0) {
    return (
      <div className="rounded-xl border border-success/30 bg-success-soft px-4 py-2.5 text-[13px] text-success" role="status">
        <strong className="font-bold">Doğrulama geçti.</strong> Aktarılacak satırlar kurallara uygun.
      </div>
    )
  }

  const hataVar = sonuc.errorCount > 0
  const gorunen = [...sonuc.issues]
    .sort((a, b) => Number(b.severity === 'Error') - Number(a.severity === 'Error'))
    .slice(0, 6)
  return (
    <div
      className={`rounded-xl border px-4 py-3 text-[13px] ${
        hataVar ? 'border-danger/30 bg-danger-soft text-danger' : 'border-warning/30 bg-warning-soft text-warning'
      }`}
      role="status"
    >
      <p className="font-bold">
        Doğrulama: {sonuc.errorCount > 0 && `${sonuc.errorCount} hata`}
        {sonuc.errorCount > 0 && sonuc.warningCount > 0 && ' · '}
        {sonuc.warningCount > 0 && `${sonuc.warningCount} uyarı`}
      </p>
      <p className="mt-0.5 text-[12px] opacity-90">
        Bu sorunlar içe aktarmayı engellemez. Aktardıktan sonra tabloda “Düzelt” ile giderebilirsiniz; hatalar
        giderilmeden paket yayınlanamaz.
      </p>
      <ul className="mt-2 space-y-0.5 text-ink">
        {gorunen.map((i, n) => (
          <li key={`${i.code}-${i.rowId ?? 'genel'}-${n}`} className="flex gap-2">
            <span className="shrink-0 font-mono text-[12px] font-bold">{i.code}</span>
            <span className="min-w-0 flex-1 truncate" title={i.message}>
              {i.message}
            </span>
            {i.rowId && <span className="shrink-0 font-mono text-[12px] text-muted-foreground">{etiket.get(i.rowId)}</span>}
          </li>
        ))}
        {sonuc.issues.length > gorunen.length && (
          <li className="text-[12px] text-muted-foreground">… ve {sonuc.issues.length - gorunen.length} sorun daha</li>
        )}
      </ul>
    </div>
  )
}

function sayiGoster(n: number | undefined): string {
  return n == null ? '' : n.toLocaleString('tr-TR', { maximumFractionDigits: 2 })
}

function Ozet({
  etiket,
  deger,
  metin,
  ton,
}: {
  etiket: string
  deger?: number
  metin?: string
  ton?: 'warning' | 'danger'
}) {
  const renk = ton === 'warning' ? 'text-warning' : ton === 'danger' ? 'text-danger' : 'text-black'
  return (
    <div className="rounded-xl border border-line bg-white px-3 py-2.5">
      <div className={`truncate text-[20px] leading-6 font-bold tabular-nums ${renk}`}>
        {metin ?? deger}
      </div>
      <div className="text-[11px] text-muted-foreground">{etiket}</div>
    </div>
  )
}

/* ============================ Ortak ızgara =========================== */

function Izgara({
  sayfa,
  satirLimiti,
  baslikSatiri,
  ilkSatir,
  sonSatir,
  onSatirTikla,
}: {
  sayfa: SayfaVerisi
  satirLimiti: number
  baslikSatiri?: number
  ilkSatir?: number
  sonSatir?: number | null
  onSatirTikla?: (satir: number) => void
}) {
  const satirlar = sayfa.satirlar.slice(0, satirLimiti)
  const sutunlar = Math.min(sayfa.sutunSayisi, 14)
  const aralikVar = ilkSatir !== undefined

  return (
    <div className="max-h-[46vh] overflow-auto rounded-xl border border-border">
      <table className="border-collapse text-[12px]">
        <thead className="sticky top-0 z-10">
          <tr className="bg-surface-muted">
            <th className="sticky left-0 z-20 w-12 border-r border-b border-line bg-surface-muted" />
            {Array.from({ length: sutunlar }, (_, c) => (
              <th
                key={c}
                className="min-w-[96px] border-r border-b border-line px-2 py-1.5 text-center font-mono text-[11px] font-bold text-muted-foreground"
              >
                {sutunHarfi(c)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {satirlar.map((r, i) => {
            const no = i + 1
            const baslik = baslikSatiri === no
            const disinda =
              aralikVar && !baslik && (no < (ilkSatir ?? 1) || (sonSatir != null && no > sonSatir))
            return (
              <tr
                key={no}
                className={
                  baslik
                    ? 'bg-info-soft font-bold'
                    : disinda
                      ? 'bg-surface-muted/60 text-muted-foreground'
                      : 'bg-white'
                }
              >
                <td
                  onClick={onSatirTikla ? () => onSatirTikla(no) : undefined}
                  className={`sticky left-0 z-10 border-r border-b border-line px-2 py-1 text-center font-mono text-[11px] ${
                    baslik ? 'bg-info-soft text-black' : 'bg-surface-muted text-muted-foreground'
                  } ${onSatirTikla ? 'cursor-pointer hover:bg-line-faint' : ''}`}
                  title={onSatirTikla ? 'Bu satırı başlık yap' : undefined}
                >
                  {no}
                </td>
                {Array.from({ length: sutunlar }, (_, c) => (
                  <td
                    key={c}
                    className="max-w-[180px] truncate border-r border-b border-border px-2 py-1 whitespace-nowrap"
                    title={hucreMetin(r[c])}
                  >
                    {hucreMetin(r[c])}
                  </td>
                ))}
              </tr>
            )
          })}
        </tbody>
      </table>
      {sayfa.toplamSatir > Math.min(satirLimiti, sayfa.satirlar.length) && (
        <p className="border-t border-border bg-surface-soft px-3 py-1.5 text-[11px] text-muted-foreground">
          İlk {Math.min(satirLimiti, sayfa.satirlar.length)} satır gösteriliyor · toplam {sayfa.toplamSatir} satır
        </p>
      )}
    </div>
  )
}
