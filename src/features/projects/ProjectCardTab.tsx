import { useState } from 'react'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { Field, Input, Select } from '../../components/ui/Field'
import { Alert, SectionTitle } from '../../components/ui/Feedback'
import { Icon } from '../../components/ui/Icon'
import { personeller, projeKartiAlanlari } from '../../data/mock'
import type { Proje, ProjeKartiAlani } from '../../data/types'
import { alanDegeri, alanZorunluMu, eksikZorunlular } from '../../lib/proje'

const bloklar: { key: ProjeKartiAlani['blok']; baslik: string; ikon: string; aciklama: string }[] = [
  { key: 'genel', baslik: 'Proje Genel Bilgileri', ikon: 'file-text', aciklama: 'Proje kodu ve işveren bilgileri.' },
  {
    key: 'sozlesme',
    baslik: 'Proje Sözleşme Bilgileri',
    ikon: 'wallet',
    aciklama: 'Sözleşme tutarı, teminat ve geçici kabul bilgileri.',
  },
  {
    key: 'organizasyon',
    baslik: 'Proje Organizasyon Bilgileri',
    ikon: 'users',
    aciklama: 'Onay süreçlerinde görev alacak proje ekibi.',
  },
  { key: 'alan', baslik: 'Proje Alan Bilgileri', ikon: 'ruler', aciklama: 'Proje alan ölçüleri (SAP PRPS).' },
]

export function ProjectCardTab({ proje, onKaydet }: { proje: Proje; onKaydet: (kart: Record<string, string>) => void }) {
  const [duzenle, setDuzenle] = useState(false)
  const [taslak, setTaslak] = useState<Record<string, string>>(proje.kart)

  const eksikler = eksikZorunlular(projeKartiAlanlari, taslak)

  const degerGuncelle = (id: string, deger: string) => setTaslak((prev) => ({ ...prev, [id]: deger }))

  return (
    <div className="space-y-4">
      {/* Aksiyon çubuğu */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-surface px-4 py-3">
        <div className="flex items-center gap-2 text-[13px] text-muted-foreground">
          <Icon name={duzenle ? 'pencil' : 'eye'} size={16} className="text-ink" />
          {duzenle
            ? 'Düzenleme modu — değişiklikler kaydedildiğinde SAP Uzmanı’na mail + portal bildirimi gönderilir.'
            : 'Görüntüleme modu — düzenlemek için “Tüm Ekranı Düzenle” butonunu kullanın.'}
        </div>
        <div className="flex items-center gap-2">
          {duzenle ? (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setTaslak(proje.kart)
                  setDuzenle(false)
                }}
              >
                Vazgeç
              </Button>
              <Button variant="secondary" size="sm" icon="save" onClick={() => { setTaslak(proje.kart); setDuzenle(false) }}>
                Taslak Kaydet
              </Button>
              <Button
                size="sm"
                icon="check"
                onClick={() => {
                  onKaydet(taslak)
                  setDuzenle(false)
                }}
              >
                Değişiklikleri Kaydet
              </Button>
            </>
          ) : (
            <Button size="sm" icon="pencil" onClick={() => setDuzenle(true)}>
              Tüm Ekranı Düzenle
            </Button>
          )}
        </div>
      </div>

      {eksikler.length > 0 && (
        <Alert tone="warning" title={`${eksikler.length} zorunlu alan eksik`}>
          <span className="text-[13px]">
            {eksikler.map((a) => a.alan).join(' · ')} — bu alanlar doldurulmadan proje kartı onaya gönderilemez.
          </span>
        </Alert>
      )}

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        {bloklar.map((blok) => {
          const alanlar = projeKartiAlanlari.filter((a) => a.blok === blok.key && !a.gizli)
          return (
            <Card key={blok.key}>
              <SectionTitle icon={blok.ikon} title={blok.baslik} description={blok.aciklama} />
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {alanlar.map((alan) => (
                  <AlanSatiri
                    key={alan.id}
                    alan={alan}
                    deger={taslak[alan.id] ?? ''}
                    zorunlu={alanZorunluMu(alan, taslak)}
                    duzenle={duzenle}
                    onChange={(v) => degerGuncelle(alan.id, v)}
                  />
                ))}
              </div>
            </Card>
          )
        })}
      </div>
    </div>
  )
}

function AlanSatiri({
  alan,
  deger,
  zorunlu,
  duzenle,
  onChange,
}: {
  alan: ProjeKartiAlani
  deger: string
  zorunlu: boolean
  duzenle: boolean
  onChange: (v: string) => void
}) {
  const otomatik = alan.kaynak === 'sap'
  const baslik = alan.alan

  if (alan.id === 'projeKodu') {
    return (
      <Field label={alan.alan} required={zorunlu}>
        <Input value={deger} readOnly disabled className="font-mono" />
      </Field>
    )
  }

  if (alan.secimKaynagi === 'personel') {
    return (
      <Field label={baslik} required={zorunlu}>
        {duzenle ? (
          <Select value={deger} onChange={(e) => onChange(e.target.value)}>
            <option value="">Seçiniz…</option>
            {personeller.map((p) => (
              <option key={p.id} value={p.ad}>
                {p.ad} — {p.unvan}
              </option>
            ))}
          </Select>
        ) : (
          <div className="flex h-11 items-center rounded-md border border-line bg-surface-muted px-3 text-[14px] text-ink">
            {deger || '—'}
          </div>
        )}
      </Field>
    )
  }

  if (alan.id === 'idariSozlesmeTuru') {
    return (
      <Field label={baslik} required={zorunlu}>
        {duzenle && !otomatik ? (
          <Select value={deger} onChange={(e) => onChange(e.target.value)}>
            <option value="">Seçiniz…</option>
            {['Birim Fiyatlı', 'Götürü Bedel', 'Maliyet + Kar'].map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </Select>
        ) : (
          <div className="flex h-11 items-center gap-2 rounded-md border border-line bg-surface-muted px-3 text-[14px] text-ink">
            {deger || '—'}
            {otomatik && <Icon name="lock" size={13} className="text-gray" />}
          </div>
        )}
      </Field>
    )
  }

  if (!duzenle || otomatik) {
    return (
      <Field label={baslik} required={zorunlu}>
        <div className="flex h-11 items-center justify-between gap-2 rounded-md border border-line bg-surface-muted px-3 text-[14px] text-ink">
          <span className="truncate">{alanDegeri(alan, deger) || '—'}</span>
          {otomatik && <Icon name="lock" size={13} className="shrink-0 text-gray" />}
        </div>
      </Field>
    )
  }

  /* Düzenleme modunda manuel alanlar */
  if (alan.tip === 'DATS') {
    return (
      <Field label={baslik} required={zorunlu}>
        <Input type="date" value={deger} onChange={(e) => onChange(e.target.value)} />
      </Field>
    )
  }

  return (
    <Field label={baslik} required={zorunlu}>
      <Input
        value={deger}
        onChange={(e) => onChange(e.target.value)}
        placeholder={alan.tip === 'QUAN' ? '0' : 'Değer giriniz'}
      />
    </Field>
  )
}
