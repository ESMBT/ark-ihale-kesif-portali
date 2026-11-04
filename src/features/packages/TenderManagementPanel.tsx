import { useState } from 'react'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { Field, Input, Select, Textarea } from '../../components/ui/Field'
import { Icon } from '../../components/ui/Icon'
import { Modal } from '../../components/ui/Modal'
import { SectionBox } from '../../components/ui/Shell'
import { ihaleSurecDurumlari, ihaleSurecDurumListesi } from '../../data/ihaleDurumlari'
import type { IhaleSurecDurumu, IhaleYonetimi, Teklif, TeklifDurumu } from '../../data/types'

/** ISO tarihi (yyyy-mm-dd) → gg.aa.yyyy */
function tarihGoster(deger?: string): string {
  if (!deger) return '—'
  if (/^\d{4}-\d{2}-\d{2}$/.test(deger)) {
    const [y, a, g] = deger.split('-')
    return `${g}.${a}.${y}`
  }
  return deger
}

/**
 * İHALE YÖNETİMİ PANELİ
 * İhalenin çıkışından kazananın belirlenmesine kadar geçen süreç yönetimi:
 *  · durum başlığı (1. tur teklifler bekleniyor / ihaleye çıkılacak …)
 *  · katılımcı teklifleri ve para birimleri (bilgi amaçlı, satır satır)
 *  · 3 aksiyon: İhaleyi Sonuçlandır · Bir Sonraki Tura Geç · Pazarlık Teklifi
 *  · tur seçimi: eski turlar ve tur bazlı kapanış notları
 */
export function TenderManagementPanel({
  ihale,
  goruntulenenTur,
  onTurSec,
  onDurumDegistir,
  onAksiyon,
}: {
  ihale: IhaleYonetimi
  goruntulenenTur: number
  onTurSec: (tur: number) => void
  onDurumDegistir: (durum: IhaleSurecDurumu) => void
  onAksiyon: (ihale: IhaleYonetimi) => void
}) {
  const [modal, setModal] = useState<'sonuc' | 'tur' | 'pazarlik' | null>(null)
  const [cevapVerilen, setCevapVerilen] = useState<Teklif | null>(null)
  const [turMenuOpen, setTurMenuOpen] = useState(false)
  const [durumMenuOpen, setDurumMenuOpen] = useState(false)

  const durum = ihaleSurecDurumlari[ihale.durum]
  const tur = goruntulenenTur
  const turTeklifleri = ihale.teklifler.filter((t) => t.tur === tur)
  const turNotu = ihale.turNotlari?.[String(tur)] ?? ''

  const teklifVerenler = ihale.teklifler.filter(
    (t) => t.durum === 'verdi' || t.durum === 'pazarlik-verdi',
  )
  const bekleyenler = ihale.teklifler.filter((t) => t.durum === 'bekliyor')

  const turBitti = [
    'ihale-cikilacak',
    'ilk-tur',
    'tur-2',
    'tur-3',
    'tur-4',
    'tur-5',
    'tur-6',
    'tur-7',
  ].includes(ihale.durum)


  return (
    <div className="space-y-5">
      {/* Durum başlığı */}
      <Card>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-[12px] font-bold tracking-wide text-muted-foreground uppercase">
              İhalenin Durumu
            </p>
            <div className="relative mt-1">
              <button
                onClick={() => setDurumMenuOpen((v) => !v)}
                className="inline-flex items-center gap-2 font-heading text-[24px] leading-8 font-bold text-black"
                aria-haspopup="listbox"
                aria-expanded={durumMenuOpen}
              >
                {durum.label}
                <Icon name="chevron-down" size={18} className="text-gray" />
              </button>
              {durumMenuOpen && (
                <div
                  role="listbox"
                  className="absolute left-0 top-10 z-30 w-72 overflow-hidden rounded-xl border border-line bg-surface py-1 shadow-lg"
                >
                  {ihaleSurecDurumListesi.map((d) => (
                    <button
                      key={d}
                      role="option"
                      aria-selected={d === ihale.durum}
                      onClick={() => {
                        onDurumDegistir(d)
                        setDurumMenuOpen(false)
                      }}
                      className={`flex w-full items-center gap-2 px-4 py-2 text-left text-[13px] hover:bg-surface-muted ${
                        d === ihale.durum ? 'font-bold' : ''
                      }`}
                    >
                      <span
                        className={`h-2 w-2 shrink-0 rounded-full ${
                          d === ihale.durum ? 'bg-black' : 'bg-line-strong bg-gray'
                        }`}
                      />
                      {ihaleSurecDurumlari[d].label}
                      {d === ihale.durum && <Icon name="check" size={13} className="ml-auto" />}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <Badge tone="info" size="sm">
                {ihale.tur}. Tur
              </Badge>
              <Badge tone="neutral" size="sm">
                {ihale.teklifler.length} katılımcı
              </Badge>
              {teklifVerenler.length > 0 && (
                <Badge tone="success" size="sm">
                  {teklifVerenler.length} teklif alındı
                </Badge>
              )}
              {bekleyenler.length > 0 && (
                <Badge tone="warning" size="sm">
                  {bekleyenler.length} teklif bekleniyor
                </Badge>
              )}
            </div>
          </div>

          <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <dt className="text-[12px] text-muted-foreground">Son Teklif Verme Tarihi</dt>
              <dd className="mt-0.5 text-[14px] font-medium text-foreground">{tarihGoster(ihale.teklifTarihi)}</dd>
            </div>
            <div>
              <dt className="text-[12px] text-muted-foreground">Soru / Cevap Tarihi</dt>
              <dd className="mt-0.5 text-[14px] font-medium text-foreground">{tarihGoster(ihale.soruCevapTarihi)}</dd>
            </div>
          </dl>
        </div>
      </Card>

      {/* Aksiyonlar */}
      <Card>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h4 className="text-[17px] leading-6">İhale Aksiyonları</h4>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="secondary"
              icon="handshake"
              disabled={!turBitti || ihale.teklifler.length === 0}
              onClick={() => setModal('pazarlik')}
            >
              Pazarlık Teklifi
            </Button>
            <Button
              variant="secondary"
              icon="arrow-right"
              disabled={!turBitti || teklifVerenler.length === 0}
              onClick={() => setModal('tur')}
            >
              Bir Sonraki Tura Geç
            </Button>
            <Button
              variant="brand"
              icon="check-circle"
              disabled={teklifVerenler.length === 0}
              onClick={() => setModal('sonuc')}
            >
              İhaleyi Sonuçlandır
            </Button>
          </div>
        </div>
      </Card>

      {/* Teklifler — bilgi amaçlı */}
      <Card padded={false}>
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-5 py-4">
          <h4 className="text-[17px] leading-6">Teklifler</h4>

          {/* Tur seçimi — sağ uçta */}
          <div className="relative">
            <button
              onClick={() => setTurMenuOpen((v) => !v)}
              className="inline-flex items-center gap-2 rounded-lg border border-line bg-white px-3 py-1.5 text-[13px] font-medium text-ink transition-colors hover:bg-surface-muted"
              aria-haspopup="listbox"
              aria-expanded={turMenuOpen}
            >
              {tur}. Tur
              <Icon name="chevron-down" size={14} className="text-gray" />
            </button>
            {turMenuOpen && (
              <div
                role="listbox"
                className="absolute right-0 top-10 z-30 w-48 overflow-hidden rounded-xl border border-line bg-surface py-1 shadow-lg"
              >
                {Array.from({ length: ihale.tur }, (_, i) => i + 1)
                  .reverse()
                  .map((t) => (
                    <button
                      key={t}
                      role="option"
                      aria-selected={t === tur}
                      onClick={() => {
                        onTurSec(t)
                        setTurMenuOpen(false)
                      }}
                      className={`flex w-full items-center gap-2 px-4 py-2 text-left text-[13px] hover:bg-surface-muted ${
                        t === tur ? 'font-bold' : ''
                      }`}
                    >
                      {t}. Tur
                      {t === ihale.tur && <Icon name="check" size={13} className="ml-auto" />}
                    </button>
                  ))}
              </div>
            )}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px] border-collapse text-[14px]">
            <thead>
              <tr className="border-b border-line bg-surface-muted">
                {['Alt Yüklenici', 'Tur', 'Teklif Tutarı', 'Para Birimi', 'Teklif Tarihi', 'Durum'].map((h, i) => (
                  <th
                    key={h}
                    className={`px-5 py-3 text-[12px] font-bold tracking-wide text-muted-foreground uppercase ${
                      i === 1 || i === 2 || i === 4 ? 'text-right' : 'text-left'
                    }`}
                  >
                    {h}
                  </th>
                ))}
                <th className="px-5 py-3 text-right text-[12px] font-bold tracking-wide text-muted-foreground uppercase">
                  Pazarlık
                </th>
              </tr>
            </thead>
            <tbody>
              {turTeklifleri.map((t) => (
                <tr
                  key={t.id}
                  className={`border-b border-border last:border-0 ${
                    t.durum === 'kazanan' ? 'bg-success-soft' : 'hover:bg-surface-muted'
                  }`}
                >
                  <td className="px-5 py-3.5">
                    <span className="flex items-center gap-2">
                      {t.durum === 'kazanan' && <Icon name="check-circle" size={15} className="text-success" />}
                      <span className="font-medium text-foreground">{t.firma}</span>
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-right text-muted-foreground">{t.tur}</td>
                  <td className="px-5 py-3.5 text-right font-bold tabular-nums text-foreground">
                    {t.tutar ? t.tutar.toLocaleString('tr-TR') : '—'}
                  </td>
                  <td className="px-5 py-3.5 text-muted-foreground">{t.paraBirimi}</td>
                  <td className="px-5 py-3.5 text-right text-muted-foreground">{t.teklifTarihi ?? '—'}</td>
                  <td className="px-5 py-3.5">
                    <TeklifDurumRozeti durum={t.durum} />
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    {t.durum === 'pazarlik-bekliyor' ? (
                      <Button variant="secondary" size="sm" icon="check" onClick={() => setCevapVerilen(t)}>
                        Cevabı İşle
                      </Button>
                    ) : t.pazarlikTutar ? (
                      <span className="tabular-nums text-[13px] font-bold text-foreground">
                        {t.pazarlikTutar.toLocaleString('tr-TR')} {t.pazarlikParaBirimi}
                      </span>
                    ) : (
                      <span className="text-gray">—</span>
                    )}
                  </td>
                </tr>
              ))}
              {turTeklifleri.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-5 py-10 text-center text-[14px] text-muted-foreground">
                    Bu tur için teklif bulunmuyor.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Tur notu */}
        <div className="border-t border-border px-5 py-4">
          <p className="text-[12px] font-bold tracking-wide text-muted-foreground uppercase">
            {tur}. Tur Süreç Notu
          </p>
          {turNotu && <p className="mt-1 text-[14px] text-foreground">{turNotu}</p>}
        </div>
      </Card>

      {/* Pazarlık geçmişi */}
      {ihale.pazarliklar.length > 0 && (
        <SectionBox title="Gönderilen Pazarlık Teklifleri">
          <ul className="space-y-2">
            {ihale.pazarliklar.map((pz, i) => (
              <li key={i} className="flex flex-wrap items-center gap-3 rounded-lg border border-border px-4 py-3">
                <Badge tone="info" size="sm">
                  {pz.tur}. tur
                </Badge>
                <span className="text-[14px] font-medium text-foreground">
                  {pz.tutar ? `${pz.tutar.toLocaleString('tr-TR')} ${pz.paraBirimi}` : '—'}
                </span>
                {pz.tarih && <span className="text-[12px] text-gray">{pz.tarih}</span>}
                {pz.not && <span className="text-[13px] text-muted-foreground">{pz.not}</span>}
              </li>
            ))}
          </ul>
        </SectionBox>
      )}

      {/* ---------------- MODALLAR ---------------- */}
      <SonuclandirModal
        open={modal === 'sonuc'}
        ihale={ihale}
        tur={ihale.tur}
        onClose={() => setModal(null)}
        onOnay={(kazanan, not) => {
          onAksiyon({
            ...ihale,
            durum: 'sonuclandi',
            kazanan,
            turNotlari: { ...ihale.turNotlari, [String(ihale.tur)]: not },
            teklifler: ihale.teklifler.map((t) => ({
              ...t,
              durum: t.firmaId === kazanan ? 'kazanan' : 'elendi',
            })),
          })
          setModal(null)
        }}
      />

      <SonrakiTurModal
        open={modal === 'tur'}
        ihale={ihale}
        onClose={() => setModal(null)}
        onOnay={(firmalar, not, teklifTarihi, soruCevapTarihi) => {
          const sonrakiTur = ihale.tur + 1
          const secilenSet = new Set(firmalar)

          /* Eski tur kayıtları korunur; seçilmeyenler elenir, seçilenler yeni tura aktarılır */
          const eskiTurKayitlari = ihale.teklifler.map((t) =>
            t.tur === ihale.tur && !secilenSet.has(t.firmaId) && t.durum !== 'elendi'
              ? { ...t, durum: 'elendi' as const }
              : t,
          )

          const yeniTurKayitlari = ihale.teklifler
            .filter((t) => t.tur === ihale.tur && secilenSet.has(t.firmaId))
            .map((t) => ({
              id: `${t.firmaId}-t${sonrakiTur}`,
              firmaId: t.firmaId,
              firma: t.firma,
              tur: sonrakiTur,
              paraBirimi: t.paraBirimi,
              durum: 'bekliyor' as const,
            }))

          onAksiyon({
            ...ihale,
            tur: sonrakiTur,
            durum: sonrakiTur === 2 ? 'tur-2' : (`tur-${sonrakiTur}` as IhaleYonetimi['durum']),
            /* Not, kapanan turun (mevcut tur) notlarına yazılır */
            turNotlari: { ...ihale.turNotlari, [String(ihale.tur)]: not },
            teklifTarihi,
            soruCevapTarihi,
            teklifler: [...eskiTurKayitlari, ...yeniTurKayitlari],
          })
          setModal(null)
        }}
      />

      <PazarlikModal
        open={modal === 'pazarlik'}
        ihale={ihale}
        onClose={() => setModal(null)}
        onOnay={(firmaId, tutar, paraBirimi, not) => {
          onAksiyon({
            ...ihale,
            pazarliklar: [
              ...ihale.pazarliklar,
              { tur: ihale.tur, tutar, paraBirimi, not, tarih: '30.10.2026' },
            ],
            teklifler: ihale.teklifler.map((t) =>
              t.firmaId === firmaId
                ? { ...t, durum: 'pazarlik-bekliyor' as const, pazarlikTutar: tutar, pazarlikParaBirimi: paraBirimi }
                : t,
            ),
          })
          setModal(null)
        }}
      />

      <PazarlikCevapModal
        teklif={cevapVerilen}
        onClose={() => setCevapVerilen(null)}
        onOnay={(tutar) => {
          if (!cevapVerilen) return
          onAksiyon({
            ...ihale,
            teklifler: ihale.teklifler.map((t) =>
              t.id === cevapVerilen.id
                ? { ...t, durum: 'pazarlik-verdi' as const, tutar, teklifTarihi: '30.10.2026' }
                : t,
            ),
          })
          setCevapVerilen(null)
        }}
      />
    </div>
  )
}

/* ---------------------------------------------------------------- */

function TeklifDurumRozeti({ durum }: { durum: TeklifDurumu }) {
  const map: Record<
    TeklifDurumu,
    { label: string; tone: 'neutral' | 'info' | 'success' | 'warning' | 'danger' }
  > = {
    bekliyor: { label: 'Teklif bekleniyor', tone: 'warning' },
    verdi: { label: 'Teklif verildi', tone: 'info' },
    'pazarlik-bekliyor': { label: 'Pazarlık cevabı bekleniyor', tone: 'warning' },
    'pazarlik-verdi': { label: 'Pazarlık teklifi alındı', tone: 'info' },
    kazanan: { label: 'Kazanan', tone: 'success' },
    elendi: { label: 'Elendi', tone: 'danger' },
  }
  const d = map[durum]
  return (
    <Badge tone={d.tone} size="sm" dot>
      {d.label}
    </Badge>
  )
}

function SonuclandirModal({
  open,
  ihale,
  tur,
  onClose,
  onOnay,
}: {
  open: boolean
  ihale: IhaleYonetimi
  tur: number
  onClose: () => void
  onOnay: (kazanan: string, not: string) => void
}) {
  const [kazanan, setKazanan] = useState('')
  const [not, setNot] = useState('')
  const secilebilir = ihale.teklifler.filter(
    (t) => (t.durum === 'verdi' || t.durum === 'pazarlik-verdi') && t.tur === tur,
  )

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="İhaleyi Sonuçlandır"
      description={`${tur}. tur teklifleri arasından kazanan alt yükleniciyi seçin ve sonucu notlandırın.`}
      size="lg"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Vazgeç
          </Button>
          <Button
            variant="brand"
            icon="check-circle"
            disabled={!kazanan || !not.trim()}
            onClick={() => onOnay(kazanan, not.trim())}
          >
            İhaleyi Sonuçlandır
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div>
          <p className="mb-2 text-[13px] font-bold text-ink">Kazanan Alt Yüklenici</p>
          <div className="space-y-2">
            {secilebilir.map((t) => (
              <label
                key={t.id}
                className={`flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 transition-colors ${
                  kazanan === t.firmaId ? 'border-black bg-info-bg' : 'border-border hover:bg-surface-muted'
                }`}
              >
                <input
                  type="radio"
                  name="kazanan"
                  checked={kazanan === t.firmaId}
                  onChange={() => setKazanan(t.firmaId)}
                  className="h-4 w-4 accent-black"
                />
                <span className="min-w-0 flex-1">
                  <span className="block text-[14px] font-medium text-foreground">{t.firma}</span>
                  <span className="block text-[12px] text-muted-foreground">
                    {t.tur}. tur teklif
                    {t.pazarlikTutar ? ' · pazarlık teklifi alındı' : ''}
                  </span>
                </span>
                <span className="shrink-0 text-right">
                  <span className="block text-[15px] font-bold tabular-nums text-foreground">
                    {(t.pazarlikTutar ?? t.tutar)?.toLocaleString('tr-TR') ?? '—'}
                  </span>
                  <span className="block text-[12px] text-muted-foreground">
                    {t.pazarlikTutar ? t.pazarlikParaBirimi : t.paraBirimi}
                  </span>
                </span>
              </label>
            ))}
            {secilebilir.length === 0 && (
              <p className="text-[13px] text-muted-foreground">Bu turda seçilebilir teklif bulunmuyor.</p>
            )}
          </div>
        </div>

        <Field label="Tur Kapanış Notu" required>
          <Textarea
            value={not}
            onChange={(e) => setNot(e.target.value)}
            placeholder="Örn. En uygun teklif ve ticari değerlendirmeler sonucunda seçilmiştir."
          />
        </Field>
      </div>
    </Modal>
  )
}

function SonrakiTurModal({
  open,
  ihale,
  onClose,
  onOnay,
}: {
  open: boolean
  ihale: IhaleYonetimi
  onClose: () => void
  onOnay: (firmalar: string[], not: string, teklifTarihi: string, soruCevapTarihi: string) => void
}) {
  const [firmalar, setFirmalar] = useState<string[]>([])
  const [not, setNot] = useState('')
  const [teklifTarihi, setTeklifTarihi] = useState('2026-12-20')
  const [soruCevapTarihi, setSoruCevapTarihi] = useState('2026-12-19')
  const adaylar = ihale.teklifler.filter(
    (t) => (t.durum === 'verdi' || t.durum === 'pazarlik-verdi') && t.tur === ihale.tur,
  )

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`${ihale.tur + 1}. Tura Geç`}
      description="Yeni tura katılacak alt yüklenicileri seçin; not ve tarihleri güncelleyin."
      size="lg"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Vazgeç
          </Button>
          <Button
            variant="brand"
            icon="arrow-right"
            disabled={
              firmalar.length === 0 ||
              !not.trim() ||
              !teklifTarihi ||
              !soruCevapTarihi ||
              soruCevapTarihi >= teklifTarihi
            }
            onClick={() => onOnay(firmalar, not.trim(), teklifTarihi, soruCevapTarihi)}
          >
            Sonraki Tura Geç
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div>
          <p className="mb-2 text-[13px] font-bold text-ink">Tura Katılacak Alt Yükleniciler</p>
          <div className="space-y-2">
            {adaylar.map((t) => (
              <label
                key={t.id}
                className={`flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 transition-colors ${
                  firmalar.includes(t.firmaId) ? 'border-black bg-info-bg' : 'border-border hover:bg-surface-muted'
                }`}
              >
                <input
                  type="checkbox"
                  checked={firmalar.includes(t.firmaId)}
                  onChange={() =>
                    setFirmalar((prev) =>
                      prev.includes(t.firmaId) ? prev.filter((x) => x !== t.firmaId) : [...prev, t.firmaId],
                    )
                  }
                  className="h-4 w-4 accent-black"
                />
                <span className="min-w-0 flex-1 truncate text-[14px] font-medium text-foreground">{t.firma}</span>
                <span className="shrink-0 text-[13px] tabular-nums text-muted-foreground">
                  {t.tutar?.toLocaleString('tr-TR')} {t.paraBirimi}
                </span>
              </label>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Son Teklif Verme Tarihi" required>
            <Input
              type="date"
              value={teklifTarihi}
              onChange={(e) => {
                setTeklifTarihi(e.target.value)
                if (soruCevapTarihi && soruCevapTarihi >= e.target.value) setSoruCevapTarihi('')
              }}
            />
          </Field>
          <Field
            label="Soru / Cevap Tarihi"
            required
            error={
              teklifTarihi && soruCevapTarihi && soruCevapTarihi >= teklifTarihi
                ? 'Soru/cevap tarihi son teklif tarihinden önce olmalıdır.'
                : undefined
            }
          >
            <Input
              type="date"
              value={soruCevapTarihi}
              min={teklifTarihi || undefined}
              onChange={(e) => setSoruCevapTarihi(e.target.value)}
            />
          </Field>
        </div>

        <Field label="Tur Kapanış Notu" required>
          <Textarea
            value={not}
            onChange={(e) => setNot(e.target.value)}
            placeholder="Örn. Teklifler revize edilerek 2. tura geçirildi."
          />
        </Field>
      </div>
    </Modal>
  )
}

function PazarlikModal({
  open,
  ihale,
  onClose,
  onOnay,
}: {
  open: boolean
  ihale: IhaleYonetimi
  onClose: () => void
  onOnay: (firmaId: string, tutar: number, paraBirimi: string, not: string) => void
}) {
  const [firmaId, setFirmaId] = useState('')
  const [tutar, setTutar] = useState('')
  const [paraBirimi, setParaBirimi] = useState('TRY')
  const [not, setNot] = useState('')
  const adaylar = ihale.teklifler.filter(
    (t) => (t.durum === 'verdi' || t.durum === 'pazarlik-verdi') && t.tur === ihale.tur,
  )

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Pazarlık Teklifi"
      description={`${ihale.tur}. tur için pazarlık teklifi gönderin — alt yükleniciden cevap beklenir.`}
      size="lg"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Vazgeç
          </Button>
          <Button
            variant="brand"
            icon="send"
            disabled={!firmaId || !tutar.trim()}
            onClick={() => onOnay(firmaId, Number(tutar.replace(',', '.')), paraBirimi, not.trim())}
          >
            Pazarlık Teklifini Gönder
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <Field label="Alt Yüklenici" required>
          <Select value={firmaId} onChange={(e) => setFirmaId(e.target.value)}>
            <option value="">Seçiniz…</option>
            {adaylar.map((t) => (
              <option key={t.id} value={t.firmaId}>
                {t.firma}
              </option>
            ))}
          </Select>
        </Field>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Pazarlık Teklif Tutarı" required>
            <Input
              value={tutar}
              inputMode="decimal"
              onChange={(e) => setTutar(e.target.value)}
              placeholder="0"
            />
          </Field>
          <Field label="Para Birimi" required>
            <Select value={paraBirimi} onChange={(e) => setParaBirimi(e.target.value)}>
              <option>TRY</option>
              <option>USD</option>
              <option>EUR</option>
            </Select>
          </Field>
        </div>

        <Field label="Not">
          <Textarea value={not} onChange={(e) => setNot(e.target.value)} placeholder="…" />
        </Field>

        <div className="rounded-xl border border-info-soft-2 bg-info-bg px-4 py-3 text-[13px] leading-5 text-ink">
          Pazarlık teklifi gönderildiğinde ilgili alt yüklenicinin durumu “Pazarlık cevabı bekleniyor” olur; cevap
          geldiğinde teklif tutarı güncellenir ve kazanan seçilebilir hâle gelir.
        </div>
      </div>
    </Modal>
  )
}

function PazarlikCevapModal({
  teklif,
  onClose,
  onOnay,
}: {
  teklif: Teklif | null
  onClose: () => void
  onOnay: (tutar: number) => void
}) {
  const [tutar, setTutar] = useState('')
  return (
    <Modal
      open={!!teklif}
      onClose={onClose}
      title="Pazarlık Cevabı"
      description={teklif?.firma}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Vazgeç
          </Button>
          <Button
            variant="brand"
            icon="check"
            disabled={!tutar.trim()}
            onClick={() => onOnay(Number(tutar.replace(',', '.')))}
          >
            Teklifi Güncelle
          </Button>
        </>
      }
    >
      <Field label="Revize Teklif Tutarı" required>
        <Input value={tutar} inputMode="decimal" onChange={(e) => setTutar(e.target.value)} placeholder="0" />
      </Field>
    </Modal>
  )
}
