import { useState } from 'react'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { Field, Input, Select, Textarea } from '../../components/ui/Field'
import { Icon } from '../../components/ui/Icon'
import { Modal } from '../../components/ui/Modal'
import { EmptyState, PageHeader } from '../../components/ui/Feedback'
import { useStore } from '../../data/store'
import type {
  Ekip,
  EslesmeDurumu,
  Kullanicilar,
  Rol,
  RolYetkiEslesmesi,
  Yetki,
} from '../../data/kullanim'

type Sekme = 'kullanicilar' | 'ekipler' | 'yetkiler' | 'roller' | 'eslesmeler'

const sekmeler: { key: Sekme; label: string; ikon: string }[] = [
  { key: 'kullanicilar', label: 'Kullanıcılar', ikon: 'users' },
  { key: 'ekipler', label: 'Ekipler', ikon: 'building' },
  { key: 'yetkiler', label: 'Yetkiler', ikon: 'key' },
  { key: 'roller', label: 'Roller', ikon: 'shield-check' },
  { key: 'eslesmeler', label: 'Rol–Yetki Eşleştirme', ikon: 'link' },
]

export function UserManagementPage() {
  const {
    kullanicilar,
    ekipler,
    yetkiler,
    roller,
    eslesmeler,
    kullaniciSil,
    ekipSil,
    yetkiSil,
    rolSil,
    eslemeSil,
  } = useStore()

  const [sekme, setSekme] = useState<Sekme>('kullanicilar')
  const [modal, setModal] = useState<{ tip: Sekme; kayit?: unknown } | null>(null)
  const [silinecek, setSilinecek] = useState<{ tip: Sekme; id: string; ad: string } | null>(null)

  const ekipAdi = (id: string) => ekipler.find((e) => e.id === id)?.ad ?? '—'
  const kullaniciAdi = (id: string) => {
    const k = kullanicilar.find((x) => x.id === id)
    return k ? `${k.ad} ${k.soyad}` : id
  }
  const rolAdi = (id: string) => roller.find((r) => r.id === id)?.ad ?? '—'
  const yetkiAdi = (id: string) => yetkiler.find((y) => y.id === id)?.ad ?? '—'

  const sil = () => {
    if (!silinecek) return
    if (silinecek.tip === 'kullanicilar') kullaniciSil(silinecek.id)
    if (silinecek.tip === 'ekipler') ekipSil(silinecek.id)
    if (silinecek.tip === 'yetkiler') yetkiSil(silinecek.id)
    if (silinecek.tip === 'roller') rolSil(silinecek.id)
    if (silinecek.tip === 'eslesmeler') eslemeSil(silinecek.id)
    setSilinecek(null)
  }

  return (
    <>
      <PageHeader
        title="Kullanıcı ve Ekip Yönetimi"
        description="Kullanıcı, ekip, yetki ve rol kayıtlarının yönetimi; kullanıcıların ekiplere ve rollere bağlanması."
      />

      {/* Sekmeler */}
      <div className="mb-5 flex flex-wrap items-center gap-2">
        {sekmeler.map((s) => (
          <button
            key={s.key}
            onClick={() => setSekme(s.key)}
            className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-[14px] transition-colors ${
              sekme === s.key
                ? 'bg-black font-bold text-white'
                : 'border border-line bg-surface text-ink hover:bg-surface-muted'
            }`}
          >
            <Icon name={s.ikon} size={15} />
            {s.label}
            <span
              className={`rounded-full px-1.5 py-0.5 text-[11px] ${
                sekme === s.key ? 'bg-white/20' : 'bg-surface-muted'
              }`}
            >
              {s.key === 'kullanicilar'
                ? kullanicilar.length
                : s.key === 'ekipler'
                  ? ekipler.length
                  : s.key === 'yetkiler'
                    ? yetkiler.length
                    : s.key === 'roller'
                      ? roller.length
                      : eslesmeler.length}
            </span>
          </button>
        ))}
      </div>

      {/* ---------------- KULLANICILAR ---------------- */}
      {sekme === 'kullanicilar' && (
        <Card padded={false}>
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-5 py-4">
            <div>
              <h4 className="text-[17px] leading-6">Kullanıcı Listesi</h4>
            </div>
            <Button variant="brand" size="sm" icon="plus" onClick={() => setModal({ tip: 'kullanicilar' })}>
              Yeni Kullanıcı
            </Button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[980px] border-collapse text-[14px]">
              <thead>
                <tr className="border-b border-line bg-surface-muted">
                  {['Kullanıcı ID', 'Ad Soyad', 'Ekip', 'Rol', 'Mail Adresi', ''].map((h, i) => (
                    <th
                      key={h}
                      className={`px-5 py-3 text-[12px] font-bold uppercase tracking-wide text-muted-foreground ${
                        i === 4 ? 'text-right' : 'text-left'
                      }`}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {kullanicilar.map((k) => (
                  <tr key={k.id} className="border-b border-border last:border-0 hover:bg-surface-muted">
                    <td className="px-5 py-3.5 font-mono text-[13px] text-foreground">{k.id}</td>
                    <td className="px-5 py-3.5">
                      <span className="block font-medium text-foreground">
                        {k.ad} {k.soyad}
                      </span>
                      {k.unvan && <span className="block text-[12px] text-muted-foreground">{k.unvan}</span>}
                    </td>
                    <td className="px-5 py-3.5">
                      <Badge tone="info" size="sm">
                        {ekipAdi(k.ekipId)}
                      </Badge>
                    </td>
                    <td className="px-5 py-3.5">
                      <Badge tone="neutral" size="sm">
                        {rolAdi(k.rolId ?? '')}
                      </Badge>
                    </td>
                    <td className="px-5 py-3.5 text-muted-foreground">{k.mail}</td>
                    <td className="px-5 py-3.5 text-right">
                      <SatirAksiyonlari
                        onDuzenle={() => setModal({ tip: 'kullanicilar', kayit: k })}
                        onSil={() => setSilinecek({ tip: 'kullanicilar', id: k.id, ad: `${k.ad} ${k.soyad}` })}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* ---------------- EKİPLER ---------------- */}
      {sekme === 'ekipler' && (
        <Card padded={false}>
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-5 py-4">
            <div>
              <h4 className="text-[17px] leading-6">Ekip Listesi</h4>
            </div>
            <Button variant="brand" size="sm" icon="plus" onClick={() => setModal({ tip: 'ekipler' })}>
              Yeni Ekip
            </Button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] border-collapse text-[14px]">
              <thead>
                <tr className="border-b border-line bg-surface-muted">
                  {['Ekip ID', 'Ekip Adı', 'Açıklama', 'Kullanıcı', ''].map((h, i) => (
                    <th
                      key={h}
                      className={`px-5 py-3 text-[12px] font-bold uppercase tracking-wide text-muted-foreground ${
                        i === 4 ? 'text-right' : 'text-left'
                      }`}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {ekipler.map((e) => {
                  const ekipKullanicilari = kullanicilar.filter((k) => k.ekipId === e.id)
                  return (
                    <tr key={e.id} className="border-b border-border last:border-0 hover:bg-surface-muted">
                      <td className="px-5 py-3.5 font-mono text-[13px] text-foreground">{e.id}</td>
                      <td className="px-5 py-3.5 font-medium text-foreground">{e.ad}</td>
                      <td className="px-5 py-3.5 text-muted-foreground">{e.aciklama}</td>
                      <td className="px-5 py-3.5 text-[13px] text-muted-foreground">
                        {ekipKullanicilari.length > 0
                          ? ekipKullanicilari.map((k) => `${k.ad} ${k.soyad}`).join(', ')
                          : '—'}
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <SatirAksiyonlari
                          onDuzenle={() => setModal({ tip: 'ekipler', kayit: e })}
                          onSil={() => setSilinecek({ tip: 'ekipler', id: e.id, ad: e.ad })}
                        />
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* ---------------- YETKİLER ---------------- */}
      {sekme === 'yetkiler' && (
        <Card padded={false}>
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-5 py-4">
            <div>
              <h4 className="text-[17px] leading-6">Yetki Listesi</h4>
            </div>
            <Button variant="brand" size="sm" icon="plus" onClick={() => setModal({ tip: 'yetkiler' })}>
              Yeni Yetki
            </Button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[880px] border-collapse text-[14px]">
              <thead>
                <tr className="border-b border-line bg-surface-muted">
                  {['Yetki ID', 'Yetki Adı', 'Açıklama', 'Bağlı Kullanıcılar', ''].map((h, i) => (
                    <th
                      key={h}
                      className={`px-5 py-3 text-[12px] font-bold uppercase tracking-wide text-muted-foreground ${
                        i === 4 ? 'text-right' : 'text-left'
                      }`}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {yetkiler.map((y) => (
                  <tr key={y.id} className="border-b border-border last:border-0 hover:bg-surface-muted">
                    <td className="px-5 py-3.5 font-mono text-[13px] text-foreground">{y.id}</td>
                    <td className="px-5 py-3.5 font-medium text-foreground">{y.ad}</td>
                    <td className="px-5 py-3.5 text-muted-foreground">{y.aciklama}</td>
                    <td className="px-5 py-3.5">
                      <span className="flex flex-wrap gap-1.5">
                        {y.kullanicilar.length > 0 ? (
                          y.kullanicilar.map((k) => (
                            <Badge key={k} tone="neutral" size="sm">
                              {kullaniciAdi(k)}
                            </Badge>
                          ))
                        ) : (
                          <span className="text-[13px] text-gray">—</span>
                        )}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <SatirAksiyonlari
                        onDuzenle={() => setModal({ tip: 'yetkiler', kayit: y })}
                        onSil={() => setSilinecek({ tip: 'yetkiler', id: y.id, ad: y.ad })}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* ---------------- ROLLER ---------------- */}
      {sekme === 'roller' && (
        <Card padded={false}>
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-5 py-4">
            <div>
              <h4 className="text-[17px] leading-6">Rol Listesi</h4>
            </div>
            <Button variant="brand" size="sm" icon="plus" onClick={() => setModal({ tip: 'roller' })}>
              Yeni Rol
            </Button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] border-collapse text-[14px]">
              <thead>
                <tr className="border-b border-line bg-surface-muted">
                  {['Rol ID', 'Rol Adı', 'Açıklama', 'Bağlı Yetki', ''].map((h, i) => (
                    <th
                      key={h}
                      className={`px-5 py-3 text-[12px] font-bold uppercase tracking-wide text-muted-foreground ${
                        i === 4 ? 'text-right' : 'text-left'
                      }`}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {roller.map((r) => {
                  const rolYetkileri = eslesmeler.filter((e) => e.rolId === r.id)
                  return (
                    <tr key={r.id} className="border-b border-border last:border-0 hover:bg-surface-muted">
                      <td className="px-5 py-3.5 font-mono text-[13px] text-foreground">{r.id}</td>
                      <td className="px-5 py-3.5 font-medium text-foreground">{r.ad}</td>
                      <td className="px-5 py-3.5 text-muted-foreground">{r.aciklama}</td>
                      <td className="px-5 py-3.5 text-[13px] text-muted-foreground">
                        {rolYetkileri.length > 0
                          ? rolYetkileri.map((e) => yetkiAdi(e.yetkiId)).join(', ')
                          : '—'}
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <SatirAksiyonlari
                          onDuzenle={() => setModal({ tip: 'roller', kayit: r })}
                          onSil={() => setSilinecek({ tip: 'roller', id: r.id, ad: r.ad })}
                        />
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* ---------------- ROL–YETKİ EŞLEŞTİRME ---------------- */}
      {sekme === 'eslesmeler' && (
        <Card padded={false}>
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-5 py-4">
            <div>
              <h4 className="text-[17px] leading-6">Rol–Yetki Eşleştirmeleri</h4>
            </div>
            <Button variant="brand" size="sm" icon="plus" onClick={() => setModal({ tip: 'eslesmeler' })}>
              Yeni Eşleştirme
            </Button>
          </div>

          {eslesmeler.length === 0 ? (
            <EmptyState icon="link" title="Eşleştirme yok" description="Rol ve yetki eşleştirmesi ekleyin." />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[820px] border-collapse text-[14px]">
                <thead>
                  <tr className="border-b border-line bg-surface-muted">
                    {['Rol Adı', 'Rol ID', 'Yetki Adı', 'Yetki ID', ''].map((h, i) => (
                      <th
                        key={h}
                        className={`px-5 py-3 text-[12px] font-bold uppercase tracking-wide text-muted-foreground ${
                          i === 4 ? 'text-right' : 'text-left'
                        }`}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {eslesmeler.map((e) => (
                    <tr key={e.id} className="border-b border-border last:border-0 hover:bg-surface-muted">
                      <td className="px-5 py-3.5 font-medium text-foreground">{rolAdi(e.rolId)}</td>
                      <td className="px-5 py-3.5 font-mono text-[13px] text-muted-foreground">{e.rolId}</td>
                      <td className="px-5 py-3.5 font-medium text-foreground">{yetkiAdi(e.yetkiId)}</td>
                      <td className="px-5 py-3.5 font-mono text-[13px] text-muted-foreground">{e.yetkiId}</td>
                      <td className="px-5 py-3.5 text-right">
                        <SatirAksiyonlari
                          onDuzenle={() => setModal({ tip: 'eslesmeler', kayit: e })}
                          onSil={() =>
                            setSilinecek({ tip: 'eslesmeler', id: e.id, ad: `${rolAdi(e.rolId)} → ${yetkiAdi(e.yetkiId)}` })
                          }
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}

      {/* ---------------- MODALLAR ---------------- */}
      <KayitModal modal={modal} onClose={() => setModal(null)} />

      <Modal
        open={!!silinecek}
        onClose={() => setSilinecek(null)}
        title="Kaydı Sil"
        description={silinecek?.ad}
        footer={
          <>
            <Button variant="ghost" onClick={() => setSilinecek(null)}>
              Vazgeç
            </Button>
            <Button variant="danger" icon="trash" onClick={sil}>
              Sil
            </Button>
          </>
        }
      >
        <p className="text-[14px] leading-6 text-foreground">
          <strong>{silinecek?.ad}</strong> kaydı kalıcı olarak silinecek. Bu işlem geri alınamaz.
        </p>
      </Modal>
    </>
  )
}

/* ---------------------------------------------------------------- */
/*  Satır aksiyonları                                                 */
/* ---------------------------------------------------------------- */

function SatirAksiyonlari({ onDuzenle, onSil }: { onDuzenle: () => void; onSil: () => void }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <Button variant="secondary" size="sm" icon="pencil" onClick={onDuzenle}>
        Düzenle
      </Button>
      <Button variant="ghost" size="sm" icon="trash" onClick={onSil} aria-label="Sil" title="Sil" />
    </span>
  )
}

/* ---------------------------------------------------------------- */
/*  Kayıt ekle / düzenle modalı                                        */
/* ---------------------------------------------------------------- */

type FormDegerler = {
  ad: string
  soyad: string
  ekipId: string
  mail: string
  unvan: string
  aciklama: string
  kullanicilar: string[]
  rolId: string
  yetkiId: string
  durum: EslesmeDurumu
}

type FormAlan = (d: FormDegerler, setD: (k: keyof FormDegerler, v: unknown) => void) => React.ReactNode

function KayitFormu({
  baslik,
  initial,
  alanlar,
  onKaydet,
  onClose,
}: {
  baslik: string
  initial: Partial<FormDegerler>
  alanlar: FormAlan
  onKaydet: (d: FormDegerler) => void
  onClose: () => void
}) {
  const [deger, setDeger] = useState<FormDegerler>({
    ad: '',
    soyad: '',
    ekipId: '',
    mail: '',
    unvan: '',
    aciklama: '',
    kullanicilar: [],
    rolId: '',
    yetkiId: '',
    durum: 'eslesti',
    ...initial,
  })

  const setD = (k: keyof FormDegerler, v: unknown) => setDeger((prev) => ({ ...prev, [k]: v }))

  return (
    <Modal
      open
      onClose={onClose}
      title={baslik}
      size="lg"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Vazgeç
          </Button>
          <Button variant="brand" icon="save" onClick={() => onKaydet(deger)}>
            Kaydet
          </Button>
        </>
      }
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">{alanlar(deger, setD)}</div>
    </Modal>
  )
}

function KayitModal({
  modal,
  onClose,
}: {
  modal: { tip: Sekme; kayit?: unknown } | null
  onClose: () => void
}) {
  const store = useStore()
  const { kullanicilar, ekipler, yetkiler, roller, eslesmeler } = store
  /* Hook'lar koşulsuz çağrılmalı — dalların hepsinde aynı sırada */
  const [yetkiAra, setYetkiAra] = useState('')

  if (!modal) return null
  const { tip, kayit } = modal

  /* ---------------- KULLANICI ---------------- */
  if (tip === 'kullanicilar') {
    const k = (kayit as Kullanicilar | undefined) ?? { id: '', ad: '', soyad: '', ekipId: '', mail: '' }
    return (
      <KayitFormu
        baslik={kayit ? 'Kullanıcıyı Düzenle' : 'Yeni Kullanıcı'}
        initial={{ ad: k.ad, soyad: k.soyad, ekipId: k.ekipId, mail: k.mail, unvan: k.unvan ?? '', rolId: k.rolId ?? '' }}
        onClose={onClose}
        onKaydet={(d) => {
          store.kullaniciKaydet({
            ...k,
            id: k.id || `K-${String(kullanicilar.length + 1).padStart(3, '0')}`,
            ad: d.ad,
            soyad: d.soyad,
            ekipId: d.ekipId,
            mail: d.mail,
            unvan: d.unvan,
            rolId: d.rolId,
          })
          onClose()
        }}
        alanlar={(d, setD) => (
          <>
            <Field label="Ad" required>
              <Input value={d.ad} onChange={(e) => setD('ad', e.target.value)} placeholder="Furkan" />
            </Field>
            <Field label="Soyad" required>
              <Input value={d.soyad} onChange={(e) => setD('soyad', e.target.value)} placeholder="Aydın" />
            </Field>
            <Field label="Ekip" required>
              <Select value={d.ekipId} onChange={(e) => setD('ekipId', e.target.value)}>
                <option value="">Seçiniz…</option>
                {ekipler.map((x) => (
                  <option key={x.id} value={x.id}>
                    {x.ad}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Mail Adresi" required>
              <Input
                value={d.mail}
                onChange={(e) => setD('mail', e.target.value)}
                placeholder="ad.soyad@arkinsaat.com.tr"
              />
            </Field>
            <Field label="Ünvan">
              <Input
                value={d.unvan}
                onChange={(e) => setD('unvan', e.target.value)}
                placeholder="Şantiye Şefi"
              />
            </Field>
            <Field label="Rol" required>
              <Select value={d.rolId} onChange={(e) => setD('rolId', e.target.value)}>
                <option value="">Seçiniz…</option>
                {roller.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.ad}
                  </option>
                ))}
              </Select>
            </Field>
          </>
        )}
      />
    )
  }

  /* ---------------- EKİP ---------------- */
  if (tip === 'ekipler') {
    const e = (kayit as Ekip | undefined) ?? { id: '', ad: '', aciklama: '' }
    const ekipId = e.id || `EK-${String(ekipler.length + 1).padStart(2, '0')}`
    const mevcutUyeIds = kullanicilar.filter((k) => k.ekipId === ekipId).map((k) => k.id)

    return (
      <KayitFormu
        baslik={kayit ? 'Ekibi Düzenle' : 'Yeni Ekip'}
        initial={{ ad: e.ad, aciklama: e.aciklama, kullanicilar: mevcutUyeIds }}
        onClose={onClose}
        onKaydet={(d) => {
          store.ekipKaydet({
            ...e,
            id: ekipId,
            ad: d.ad,
            aciklama: d.aciklama,
          })
          /* Ekip üyeliği: seçilenler bu ekibe, çıkarılanlar ekipsiz kalır */
          kullanicilar.forEach((k) => {
            const secili = d.kullanicilar.includes(k.id)
            if (secili && k.ekipId !== ekipId) {
              store.kullaniciKaydet({ ...k, ekipId })
            } else if (!secili && k.ekipId === ekipId) {
              store.kullaniciKaydet({ ...k, ekipId: '' })
            }
          })
          onClose()
        }}
        alanlar={(d, setD) => (
          <>
            <Field label="Ekip Adı" required className="sm:col-span-2">
              <Input value={d.ad} onChange={(e) => setD('ad', e.target.value)} placeholder="Şantiye İşleri Ekibi" />
            </Field>
            <Field label="Ekip Açıklaması" required className="sm:col-span-2">
              <Textarea
                value={d.aciklama}
                onChange={(e) => setD('aciklama', e.target.value)}
                placeholder="Ekibin görev tanımı…"
              />
            </Field>

            <div className="sm:col-span-2">
              <div className="mb-2 flex items-center justify-between gap-3">
                <p className="text-[14px] font-medium text-black">Ekip Üyeleri</p>
                <span className="text-[12px] text-muted-foreground">
                  {d.kullanicilar.length} kullanıcı seçili
                </span>
              </div>
              <div className="max-h-56 overflow-y-auto rounded-lg border border-border p-3">
                {kullanicilar.map((k) => (
                  <label key={k.id} className="flex items-center gap-2.5 py-1.5 text-[13px]">
                    <input
                      type="checkbox"
                      checked={d.kullanicilar.includes(k.id)}
                      onChange={(e) =>
                        setD(
                          'kullanicilar',
                          e.target.checked
                            ? [...d.kullanicilar, k.id]
                            : d.kullanicilar.filter((x) => x !== k.id),
                        )
                      }
                      className="h-4 w-4 rounded-sm border-line accent-black"
                    />
                    <span className="font-medium text-foreground">
                      {k.ad} {k.soyad}
                    </span>
                    <span className="text-[12px] text-gray">{k.mail}</span>
                    {k.ekipId && k.ekipId !== ekipId && (
                      <span className="text-[11px] text-warning">
                        {ekipler.find((x) => x.id === k.ekipId)?.ad ?? 'başka ekip'}
                      </span>
                    )}
                  </label>
                ))}
              </div>
            </div>
          </>
        )}
      />
    )
  }

  /* ---------------- YETKİ ---------------- */
  if (tip === 'yetkiler') {
    const y = (kayit as Yetki | undefined) ?? { id: '', ad: '', aciklama: '', kullanicilar: [] }
    return (
      <KayitFormu
        baslik={kayit ? 'Yetkiyi Düzenle' : 'Yeni Yetki'}
        initial={{ ad: y.ad, aciklama: y.aciklama, kullanicilar: y.kullanicilar }}
        onClose={onClose}
        onKaydet={(d) => {
          store.yetkiKaydet({
            ...y,
            id: y.id || `YT-${String(yetkiler.length + 1).padStart(2, '0')}`,
            ad: d.ad,
            aciklama: d.aciklama,
            kullanicilar: d.kullanicilar,
          })
          onClose()
        }}
        alanlar={(d, setD) => (
          <>
            <Field label="Yetki Adı" required>
              <Input value={d.ad} onChange={(e) => setD('ad', e.target.value)} placeholder="Keşif Yükleme" />
            </Field>
            <Field label="Açıklama" required>
              <Input value={d.aciklama} onChange={(e) => setD('aciklama', e.target.value)} />
            </Field>
            <div className="sm:col-span-2">
              <div className="mb-2 flex flex-wrap items-center justify-between gap-3">
                <p className="text-[14px] font-medium text-black">Bağlı Kullanıcılar</p>
                <span className="text-[12px] text-muted-foreground">{d.kullanicilar.length} kullanıcı seçili</span>
              </div>

              <div className="relative mb-2">
                <Icon
                  name="search"
                  size={15}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray"
                />
                <Input
                  value={yetkiAra}
                  onChange={(e) => setYetkiAra(e.target.value)}
                  placeholder="Kullanıcı adı, soyadı veya e-posta ile ara..."
                  className="h-9 pl-9 text-[13px]"
                />
              </div>

              <div className="grid max-h-56 grid-cols-1 gap-1 overflow-y-auto rounded-lg border border-border p-3 sm:grid-cols-2">
                {kullanicilar
                  .filter((k) => {
                    const q = yetkiAra.trim().toLocaleLowerCase('tr')
                    if (!q) return true
                    return (
                      `${k.ad} ${k.soyad}`.toLocaleLowerCase('tr').includes(q) ||
                      k.mail.toLocaleLowerCase('tr').includes(q)
                    )
                  })
                  .map((k) => (
                    <label key={k.id} className="flex items-center gap-2.5 text-[13px]">
                      <input
                        type="checkbox"
                        checked={d.kullanicilar.includes(k.id)}
                        onChange={(e) =>
                          setD(
                            'kullanicilar',
                            e.target.checked
                              ? [...d.kullanicilar, k.id]
                              : d.kullanicilar.filter((x) => x !== k.id),
                          )
                        }
                        className="h-4 w-4 rounded-sm border-line accent-black"
                      />
                      <span className="min-w-0 truncate">
                        {k.ad} {k.soyad}
                      </span>
                    </label>
                  ))}
                {kullanicilar.filter((k) => {
                  const q = yetkiAra.trim().toLocaleLowerCase('tr')
                  if (!q) return false
                  return (
                    `${k.ad} ${k.soyad}`.toLocaleLowerCase('tr').includes(q) ||
                    k.mail.toLocaleLowerCase('tr').includes(q)
                  )
                }).length === 0 && (
                  <span className="py-3 text-[13px] text-muted-foreground">Kullanıcı bulunamadı.</span>
                )}
              </div>
            </div>
          </>
        )}
      />
    )
  }

  /* ---------------- ROL ---------------- */
  if (tip === 'roller') {
    const r = (kayit as Rol | undefined) ?? { id: '', ad: '', aciklama: '' }
    return (
      <KayitFormu
        baslik={kayit ? 'Rolü Düzenle' : 'Yeni Rol'}
        initial={{ ad: r.ad, aciklama: r.aciklama }}
        onClose={onClose}
        onKaydet={(d) => {
          store.rolKaydet({
            ...r,
            id: r.id || `RL-${String(roller.length + 1).padStart(2, '0')}`,
            ad: d.ad,
            aciklama: d.aciklama,
          })
          onClose()
        }}
        alanlar={(d, setD) => (
          <>
            <Field label="Rol Adı" required>
              <Input value={d.ad} onChange={(e) => setD('ad', e.target.value)} placeholder="Şantiyeci" />
            </Field>
            <Field label="Açıklama" required>
              <Input value={d.aciklama} onChange={(e) => setD('aciklama', e.target.value)} />
            </Field>
          </>
        )}
      />
    )
  }

  /* ---------------- EŞLEŞTİRME ---------------- */
  const e = (kayit as RolYetkiEslesmesi | undefined) ?? {
    id: '',
    rolId: '',
    yetkiId: '',
    durum: 'eslesti' as EslesmeDurumu,
  }
  return (
    <KayitFormu
      baslik={kayit ? 'Eşleştirmeyi Düzenle' : 'Yeni Eşleştirme'}
      initial={{ rolId: e.rolId, yetkiId: e.yetkiId, durum: e.durum }}
      onClose={onClose}
      onKaydet={(d) => {
        const varOlan = eslesmeler.find(
          (x) => x.rolId === d.rolId && x.yetkiId === d.yetkiId && x.id !== e.id,
        )
        store.eslemeKaydet({
          ...e,
          id: e.id || `ES-${String(eslesmeler.length + 1).padStart(2, '0')}`,
          rolId: d.rolId,
          yetkiId: d.yetkiId,
          durum: varOlan ? 'eslesmedi' : d.durum,
        })
        onClose()
      }}
      alanlar={(d, setD) => (
        <>
          <Field label="Rol" required>
            <Select value={d.rolId} onChange={(ev) => setD('rolId', ev.target.value)}>
              <option value="">Seçiniz…</option>
              {roller.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.ad} ({r.id})
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Yetki" required>
            <Select value={d.yetkiId} onChange={(ev) => setD('yetkiId', ev.target.value)}>
              <option value="">Seçiniz…</option>
              {yetkiler.map((y) => (
                <option key={y.id} value={y.id}>
                  {y.ad} ({y.id})
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Durum" required className="sm:col-span-2">
            <Select value={d.durum} onChange={(ev) => setD('durum', ev.target.value)}>
              <option value="eslesti">Eşleşti</option>
              <option value="eslesmedi">Eşleşmedi</option>
            </Select>
          </Field>
          <p className="sm:col-span-2 text-[12px] text-muted-foreground">
            Seçilen rol–yetki çifti zaten tanımlıysa yeni kayıt “Eşleşmedi” olarak işaretlenir.
          </p>
        </>
      )}
    />
  )
}
