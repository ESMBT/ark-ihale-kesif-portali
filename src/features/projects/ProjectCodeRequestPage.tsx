import { useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { aktifModul, modulYolu } from '../../lib/modul'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { Field, Input, Select, Textarea } from '../../components/ui/Field'
import { Icon } from '../../components/ui/Icon'
import { Modal } from '../../components/ui/Modal'
import { Alert, PageHeader } from '../../components/ui/Feedback'
import { projeKartiAlanlari, personeller, sapProjeler, sapUzmani } from '../../data/mock'
import { useStore } from '../../data/store'
import type { ProjeKartiAlani } from '../../data/types'
import { MultiSelect } from '../../components/ui/MultiSelect'
import {
  alanZorunluMu,
  cokluBirlestir,
  cokluDegerler,
  eksikZorunlular,
  kaynakEtiket,
  sapProjedenKart,
} from '../../lib/proje'

export function ProjectCodeRequestPage() {
  const navigate = useNavigate()
  const location = useLocation()
  /* Talep ekranı her iki modülde de aynıdır; hangi modülde açıldığına göre yönlendirilir */
  const modul = aktifModul(location.pathname)
  const { talepOlustur } = useStore()

  const [kart, setKart] = useState<Record<string, string>>({})
  const [notlar, setNotlar] = useState('')
  const [muhattapId, setMuhattapId] = useState(sapUzmani.id)
  const [muhattapBilgi, setMuhattapBilgi] = useState({ ad: sapUzmani.ad, mail: sapUzmani.mail })
  const [onizlemeOpen, setOnizlemeOpen] = useState(false)
  const [mailKonu, setMailKonu] = useState('Proje Kodu Talebi — Proje Adı')
  const [mailCc, setMailCc] = useState('')
  const [gonderildi, setGonderildi] = useState(false)

  const eksikler = eksikZorunlular(projeKartiAlanlari, kart)
  const talepHazir = eksikler.length === 0 && !!kart.projeKodu
  const muhattap = muhattapId === sapUzmani.id ? sapUzmani : personeller.find((p) => p.id === muhattapId)

  /* Muhattap seçilince ad/mail otomatik gelir, sonra düzenlenebilir */
  const muhattapSec = (id: string) => {
    setMuhattapId(id)
    const kisi = id === sapUzmani.id ? sapUzmani : personeller.find((p) => p.id === id)
    if (kisi) setMuhattapBilgi({ ad: kisi.ad, mail: kisi.mail })
  }

  const alanlar = useMemo(
    () => (blok: ProjeKartiAlani['blok']) =>
      projeKartiAlanlari.filter((a) => a.blok === blok && !a.gizli),
    [],
  )

  const projeKoduSec = (kod: string) => {
    const sap = sapProjeler.find((p) => p.kod === kod)
    setKart((prev) => (sap ? { ...sapProjedenKart(sap), ...prev, projeKodu: kod } : { ...prev, projeKodu: kod }))
  }

  const gonder = () => {
    talepOlustur({
      sapKod: kart.projeKodu,
      ad: kart.projeAdi,
      kart,
      notlar,
      muhattapId,
    })
    setOnizlemeOpen(false)
    setGonderildi(true)
    window.setTimeout(() => navigate(modulYolu(modul, '/projeler')), 1400)
  }

  return (
    <>
      <PageHeader
        title="Proje Kodu Talebi"
        breadcrumb={[
          { label: 'Projeler', to: modulYolu(modul, '/projeler') },
          { label: 'Proje Kodu Talebi' },
        ]}
        actions={
          <Button variant="brand" icon="send" disabled={!talepHazir} onClick={() => setOnizlemeOpen(true)}>
            Proje Kodu Talep Et
          </Button>
        }
      />

      {gonderildi && (
        <div className="mb-5">
          <Alert tone="success" title="Proje kodu talebi gönderildi">
            <span className="text-[13px]">
              {muhattap?.ad} adresine mail gönderildi ve portal içi bildirimi iletildi.
            </span>
          </Alert>
        </div>
      )}

      <Card>
        {/* ---------------- Proje Genel Bilgileri ---------------- */}
        <div className="pb-6">
          <h4>Proje Genel Bilgileri</h4>
          <p className="mt-1 text-[12px] text-muted-foreground">
            SAP proje kartından gelen alanlar seçilen proje kodu ile otomatik dolar.
          </p>

          <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Proje Kodu" required>
              <Select value={kart.projeKodu ?? ''} onChange={(e) => projeKoduSec(e.target.value)}>
                <option value="">SAP proje listesinden seçiniz…</option>
                {sapProjeler.map((p) => (
                  <option key={p.kod} value={p.kod}>
                    {p.kod} — {p.ad} ({p.lokasyon})
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Proje Adı" required>
              <Input
                value={kart.projeAdi ?? ''}
                onChange={(e) => setKart((p) => ({ ...p, projeAdi: e.target.value }))}
                placeholder="Proje adı"
              />
            </Field>
            <Field label="İdare (İşveren)">
              <Input
                value={kart.idare ?? ''}
                onChange={(e) => setKart((p) => ({ ...p, idare: e.target.value }))}
                placeholder="Çankaya Belediyesi"
              />
            </Field>
            <Field label="Kontrol / Müşavir">
              <Input
                value={kart.kontrolMusavir ?? ''}
                onChange={(e) => setKart((p) => ({ ...p, kontrolMusavir: e.target.value }))}
                placeholder="Mimtaş Mühendislik A.Ş."
              />
            </Field>
            <Field label="Lokasyon (Depo Yeri)" required>
              <Input
                value={kart.lokasyon ?? ''}
                onChange={(e) => setKart((p) => ({ ...p, lokasyon: e.target.value }))}
                placeholder="Örn. ANK"
              />
            </Field>
            <Field label="Açıklama / Not" className="sm:col-span-2">
              <Textarea
                value={notlar}
                onChange={(e) => setNotlar(e.target.value)}
                placeholder="Talep ile ilgili ek notlar (isteğe bağlı)"
              />
            </Field>
          </div>
        </div>

        <div className="border-t border-line" />

        {/* ---------------- Proje Organizasyon Bilgileri ---------------- */}
        <div className="py-6">
          <h4>Proje Organizasyon Bilgileri</h4>
          <p className="mt-1 text-[12px] text-muted-foreground">
            Onay süreçleri ve yer görme iletişimi için görevli personel seçilir.
          </p>

          <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {alanlar('organizasyon').map((alan) => (
              <Field
                key={alan.id}
                label={alan.alan}
                required={alanZorunluMu(alan, kart)}
              >
                {alan.coklu ? (
                  <MultiSelect
                    secenekler={personeller.map((p) => ({ deger: p.ad, etiket: p.ad, alt: p.unvan }))}
                    degerler={cokluDegerler(kart[alan.id])}
                    onChange={(yeni) => setKart((p) => ({ ...p, [alan.id]: cokluBirlestir(yeni) }))}
                    placeholder="Kişi seçiniz…"
                  />
                ) : (
                  <Select
                    value={kart[alan.id] ?? ''}
                    onChange={(e) => setKart((p) => ({ ...p, [alan.id]: e.target.value }))}
                  >
                    <option value="">Seçiniz…</option>
                    {personeller.map((p) => (
                      <option key={p.id} value={p.ad}>
                        {p.ad} — {p.unvan}
                      </option>
                    ))}
                  </Select>
                )}
              </Field>
            ))}
          </div>
        </div>

        <div className="border-t border-line" />

        {/* ---------------- Proje Sözleşme Bilgileri ---------------- */}
        <div className="py-6">
          <h4>Proje Sözleşme Bilgileri</h4>
          <p className="mt-1 text-[12px] text-muted-foreground">
            Sözleşme tutarı, teminat ve geçici kabul bilgileri SAP proje kartından gelir.
          </p>

          <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {alanlar('sozlesme').map((alan) => (
              <Field key={alan.id} label={alan.alan} required={alanZorunluMu(alan, kart)}>
                <Input
                  value={kart[alan.id] ?? ''}
                  onChange={(e) => setKart((p) => ({ ...p, [alan.id]: e.target.value }))}
                  placeholder="Değer giriniz"
                />
              </Field>
            ))}
          </div>
        </div>

        <div className="border-t border-line" />

        {/* ---------------- Proje Alan Bilgileri ---------------- */}
        <div className="py-6">
          <h4>Proje Alan Bilgileri</h4>
          <p className="mt-1 text-[12px] text-muted-foreground">Alan ölçüleri SAP PRPS tablosundan okunur.</p>

          <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {alanlar('alan').map((alan) => (
              <Field key={alan.id} label={alan.alan}>
                <Input
                  value={kart[alan.id] ?? ''}
                  onChange={(e) => setKart((p) => ({ ...p, [alan.id]: e.target.value }))}
                  placeholder="0"
                />
              </Field>
            ))}
          </div>
        </div>

        <div className="border-t border-line" />

        {/* ---------------- Muhattap Bilgileri ---------------- */}
        <div className="pt-6">
          <h4>Muhattap Bilgileri</h4>
          <p className="mt-1 text-[12px] text-muted-foreground">
            Proje kodu talebi bu kişiye iletilir.
          </p>

          <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Field label="SAP Uzmanı Kişiler Listesi" required>
              <Select value={muhattapId} onChange={(e) => muhattapSec(e.target.value)}>
                <option value={sapUzmani.id}>
                  {sapUzmani.ad} — {sapUzmani.unvan}
                </option>
                {personeller.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.ad} — {p.unvan}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Adı">
              <Input
                value={muhattapBilgi.ad}
                onChange={(e) => setMuhattapBilgi((p) => ({ ...p, ad: e.target.value }))}
              />
            </Field>
            <Field label="Mail Adresi">
              <Input
                value={muhattapBilgi.mail}
                onChange={(e) => setMuhattapBilgi((p) => ({ ...p, mail: e.target.value }))}
              />
            </Field>
          </div>
        </div>
      </Card>

      {/* ---------------- Talep özeti ---------------- */}
      <Card className="mt-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h4>Talep Özeti</h4>
            <p className="mt-1 text-[12px] text-muted-foreground">
              Talep gönderildiğinde aşağıdaki bildirim ve mail üretilir.
            </p>

            <dl className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <dt className="text-[12px] uppercase tracking-wide text-muted-foreground">Bildirim No</dt>
                <dd className="mt-1.5">
                  <Badge tone="primary">9001 — Proje Kodu Talep</Badge>
                </dd>
              </div>
              <div>
                <dt className="text-[12px] uppercase tracking-wide text-muted-foreground">Alıcı</dt>
                <dd className="mt-1.5 text-[14px] font-medium text-foreground">
                  {muhattap?.ad} · {muhattap?.unvan}
                </dd>
              </div>
              <div>
                <dt className="text-[12px] uppercase tracking-wide text-muted-foreground">Konu</dt>
                <dd className="mt-1.5 text-[14px] font-medium text-foreground">
                  Proje Kodu Talebi — {kart.projeKodu || '—'}
                </dd>
              </div>
            </dl>
          </div>

          <div className="w-full max-w-sm">
            {eksikler.length > 0 ? (
              <div className="rounded-lg border border-warning/30 bg-warning-soft p-4">
                <p className="flex items-center gap-1.5 text-[13px] font-bold text-warning">
                  <Icon name="alert-triangle" size={14} />
                  Zorunlu alanlar tamamlanmadı
                </p>
                <p className="mt-1 text-[12px] text-ink">
                  {eksikler.length} alan bekliyor — talep butonu alanlar dolunca aktifleşir.
                </p>
              </div>
            ) : (
              <Alert tone="success" title="Talep gönderime hazır">
                <span className="text-[12px]">Zorunlu alanların tamamı dolu.</span>
              </Alert>
            )}
          </div>
        </div>
      </Card>

      {/* ---------------- Önizleme modalı ---------------- */}
      <Modal
        open={onizlemeOpen}
        onClose={() => setOnizlemeOpen(false)}
        title="Mail / Bildirim Önizlemesi"
        description="Talep gönderildiğinde aşağıdaki mail ve portal bildirimi oluşturulacaktır."
        size="lg"
        footer={
          <>
            <Button variant="ghost" onClick={() => setOnizlemeOpen(false)}>
              Vazgeç
            </Button>
            <Button variant="brand" icon="send" onClick={gonder}>
              Talebi Gönder
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4 rounded-xl border border-border p-4 sm:grid-cols-2">
            <Field label="Mail Başlığı" required className="sm:col-span-2">
              <Input value={mailKonu} onChange={(e) => setMailKonu(e.target.value)} />
            </Field>
            <Field label="Cc">
              <Input value={mailCc} onChange={(e) => setMailCc(e.target.value)} placeholder="ornek@arkinsaat.com.tr" />
            </Field>
          </div>

          <div className="overflow-hidden rounded-xl border border-border">
            <div className="flex items-center gap-2 border-b border-border bg-surface-muted px-4 py-2.5">
              <Icon name="file-text" size={15} className="text-muted-foreground" />
              <span className="text-[13px] font-bold text-black">Mail önizlemesi</span>
            </div>
            <div className="space-y-1.5 border-b border-border px-4 py-3 text-[13px]">
              <p>
                <span className="text-muted-foreground">Kime:</span> {muhattap?.ad} &lt;{muhattap?.mail}&gt;
              </p>
              <p>
                <span className="text-muted-foreground">Mail Başlığı:</span> {mailKonu}
              </p>
              {mailCc && (
                <p>
                  <span className="text-muted-foreground">Cc:</span> {mailCc}
                </p>
              )}
            </div>
            <div className="space-y-3 px-4 py-4 text-[13px] leading-6 text-foreground">
              <p>Merhaba {muhattap?.ad},</p>
              <p>
                <strong>{kart.projeAdi}</strong> projesi için SAP proje kodu talep edilmektedir. Talep edilen proje
                bilgileri aşağıda yer almaktadır.
              </p>
              <div className="overflow-hidden rounded-lg border border-border">
                <table className="w-full border-collapse text-[12px]">
                  <thead>
                    <tr className="bg-surface-muted">
                      {['Alan', 'Değer', 'Kaynak'].map((h) => (
                        <th key={h} className="px-3 py-2 text-left font-semibold text-muted-foreground">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {projeKartiAlanlari
                      .filter((a) => !a.gizli && (a.blok === 'genel' || a.blok === 'organizasyon'))
                      .map((a) => (
                        <tr key={a.id} className="border-t border-border">
                          <td className="px-3 py-2 text-foreground">{a.alan}</td>
                          <td className="px-3 py-2 font-medium text-foreground">{kart[a.id] || '—'}</td>
                          <td className="px-3 py-2 text-muted-foreground">{kaynakEtiket[a.kaynak]}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
              {notlar && (
                <p className="rounded-md border-l-2 border-black bg-surface-muted px-3 py-2 text-[13px]">{notlar}</p>
              )}
              <p>İlginiz için teşekkürler.</p>
            </div>
          </div>

          <div className="overflow-hidden rounded-xl border border-border">
            <div className="flex items-center gap-2 border-b border-border bg-surface-muted px-4 py-2.5">
              <Icon name="bell" size={15} className="text-muted-foreground" />
              <span className="text-[13px] font-bold text-black">Portal içi bildirim önizlemesi</span>
            </div>
            <div className="space-y-2 px-4 py-4">
              <div className="flex flex-wrap items-center gap-2">
                <Badge tone="primary" size="sm">
                  9001
                </Badge>
                <span className="text-[13px] font-semibold text-black">Proje Kodu Talep</span>
              </div>
              <p className="text-[13px] leading-6 text-foreground">
                <strong>{kart.projeAdi}</strong> ({kart.projeKodu}) projesi için proje kodu talebi oluşturuldu. Talep
                sahibi: Hakan Öztürk.
              </p>
              <p className="text-[12px] text-muted-foreground">Alıcı rol: {muhattap?.unvan}</p>
            </div>
          </div>
        </div>
      </Modal>
    </>
  )
}
