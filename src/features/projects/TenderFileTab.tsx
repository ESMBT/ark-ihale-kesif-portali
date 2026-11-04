import { useState } from 'react'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { Field, Input, Select, Textarea } from '../../components/ui/Field'
import { Alert, SectionTitle } from '../../components/ui/Feedback'
import { Icon } from '../../components/ui/Icon'
import { ihaleDosyasiAlanlari, ihaleBlokBasliklari } from '../../data/mock'
import type { IhaleDosyasiAlani, Proje } from '../../data/types'

const enumSecenekleri: Record<string, string[]> = {
  ihIhaleSekli: ['Birim Fiyatlı', 'Götürü'],
  ihGumruk: ['Uygulanacak', 'Uygulanmayacak'],
  ihStopaj: ['Uygulanacak', 'Uygulanmayacak'],
  ihFiyatFarki: ['Uygulanacak', 'Uygulanmayacak'],
  ihBazFiyat: ['Var', 'Yok'],
  ihElektrikSu: ['Kesilecek', 'Kesilmeyecek'],
  ihGeciciSeperator: [
    'Mevcut',
    'Mevcut değil — ARK İnşaat kapsamında',
    'Mevcut değil — Alt yüklenici kapsamında',
  ],
  ihIsciBarinma: ['Sahada barınma yapılmayacak', 'ARK İnşaat kapsamında', 'Alt yüklenici kapsamında'],
  ihMobilizasyon: ['ARK İnşaat kapsamında', 'Alt yüklenici kapsamında', 'Değiştirildi'],
  ihYemekhane: ['ARK İnşaat tarafından tesis edilecek', 'Alt yüklenici tarafından sağlanacak'],
}

const blokIkonlari: Record<IhaleDosyasiAlani['blok'], string> = {
  proje: 'file-text',
  finansal: 'wallet',
  sure: 'calendar',
  santiye: 'hard-hat',
}

export function TenderFileTab({
  proje,
  onKaydet,
}: {
  proje: Proje
  onKaydet: (deger: Record<string, string>) => void
}) {
  const [duzenle, setDuzenle] = useState(false)
  const [taslak, setTaslak] = useState<Record<string, string>>(proje.ihaleDosyasi)

  const zorunluAlanlar = ihaleDosyasiAlanlari.filter((a) => a.zorunluluk === 'zorunlu')
  const eksikler = zorunluAlanlar.filter((a) => !(taslak[a.id] ?? '').trim())

  const degerGuncelle = (id: string, deger: string) => setTaslak((prev) => ({ ...prev, [id]: deger }))

  /* Proje kartından otomatik gelen alanlar (sistem) */
  const sistemDeger = (alan: IhaleDosyasiAlani): string => {
    switch (alan.id) {
      case 'ihProjeKodu':
        return proje.kart.projeKodu ?? ''
      case 'ihProjeAdi':
        return proje.kart.projeAdi ?? ''
      case 'ihIsverenUnvani':
        return proje.kart.idare ?? ''
      case 'ihLokasyon':
        return proje.kart.lokasyon ?? ''
      case 'ihSantiyeSorumluKoordinatör':
        return proje.kart.koordinator ?? ''
      case 'ihProjeMuduru':
        return proje.kart.projeMuduru ?? ''
      case 'ihSantiyeSefi':
        return proje.kart.santiyeSefi ?? ''
      case 'ihSahaSorumlusu':
        return proje.kart.sahaSorumlusu ?? ''
      case 'ihTeknikOfis':
        return proje.kart.teknikOfisYetkilisi ?? ''
      case 'ihMuhasebeYetkilisi':
        return proje.kart.muhasebeYetkilisi ?? ''
      case 'ihGeciciKabul':
        return proje.kart.geciciKabulTarihi ?? ''
      default:
        return taslak[alan.id] ?? ''
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-surface px-4 py-3">
        <div className="flex items-center gap-2 text-[13px] text-muted-foreground">
          <Icon name={duzenle ? 'pencil' : 'eye'} size={16} className="text-ink" />
          {duzenle
            ? 'Düzenleme modu — turuncu alanlar şantiyeci tarafından girilir, gri alanlar Proje Kartı’ndan gelir.'
            : 'İhale dosyası alanları — turuncu satırlar zorunlu, gri satırlar Proje Kartı’ndan otomatik gelir.'}
        </div>
        <div className="flex items-center gap-2">
          {duzenle ? (
            <>
              <Button variant="ghost" size="sm" onClick={() => { setTaslak(proje.ihaleDosyasi); setDuzenle(false) }}>
                Vazgeç
              </Button>
              <Button
                size="sm"
                icon="check"
                onClick={() => {
                  onKaydet(taslak)
                  setDuzenle(false)
                }}
              >
                Kaydet
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
        <Alert tone="danger" title={`${eksikler.length} zorunlu alan eksik`}>
          <span className="text-[13px]">
            {eksikler.map((a) => a.alan).join(' · ')}
          </span>
        </Alert>
      )}

      <div className="grid grid-cols-1 gap-4 2xl:grid-cols-2">
        {(Object.keys(ihaleBlokBasliklari) as IhaleDosyasiAlani['blok'][]).map((blok) => {
          const alanlar = ihaleDosyasiAlanlari.filter((a) => a.blok === blok)
          return (
            <Card key={blok}>
              <SectionTitle
                icon={blokIkonlari[blok]}
                title={ihaleBlokBasliklari[blok]}
                description={`${alanlar.filter((a) => a.zorunluluk === 'zorunlu').length} zorunlu alan`}
              />
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {alanlar.map((alan) => {
                  const sistem = alan.zorunluluk === 'sistem'
                  const deger = sistem ? sistemDeger(alan) : (taslak[alan.id] ?? '')
                  const zorunlu = alan.zorunluluk === 'zorunlu'

                  const etiket = (
                    <span className="flex items-center gap-1.5">
                      {alan.alan}
                      {zorunlu && <span className="text-danger-d">*</span>}
                    </span>
                  )

                  if (sistem || !duzenle) {
                    return (
                      <Field key={alan.id} label={etiket}>
                        <div
                          className={`flex h-11 items-center justify-between gap-2 rounded-md border px-3 text-[14px] ${
                            sistem ? 'border-line bg-surface-muted text-ink' : 'border-line bg-white text-ink'
                          }`}
                        >
                          <span className="truncate">{deger || '—'}</span>
                          {sistem && <Icon name="lock" size={13} className="shrink-0 text-gray" />}
                          {!sistem && zorunlu && !deger && (
                            <span className="shrink-0 text-[12px] text-danger">Zorunlu</span>
                          )}
                        </div>
                      </Field>
                    )
                  }

                  /* Düzenleme modu */
                  if (alan.tip === 'Enum' && enumSecenekleri[alan.id]) {
                    return (
                      <Field key={alan.id} label={etiket}>
                        <Select value={deger} onChange={(e) => degerGuncelle(alan.id, e.target.value)}>
                          <option value="">Seçiniz…</option>
                          {enumSecenekleri[alan.id].map((o) => (
                            <option key={o} value={o}>
                              {o}
                            </option>
                          ))}
                        </Select>
                      </Field>
                    )
                  }

                  if (alan.tip === 'Yüzde') {
                    return (
                      <Field key={alan.id} label={etiket}>
                        <div className="relative">
                          <Input
                            value={deger}
                            inputMode="decimal"
                            onChange={(e) => degerGuncelle(alan.id, e.target.value)}
                            placeholder="0"
                          />
                          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[12px] text-gray">
                            %
                          </span>
                        </div>
                      </Field>
                    )
                  }

                  if (alan.tip === 'Tarih') {
                    return (
                      <Field key={alan.id} label={etiket}>
                        <Input type="date" value={deger} onChange={(e) => degerGuncelle(alan.id, e.target.value)} />
                      </Field>
                    )
                  }

                  if (alan.id === 'ihIsKapsami' || alan.id === 'ihKritikTarihler') {
                    return (
                      <Field key={alan.id} label={etiket} className="sm:col-span-2">
                        <Textarea
                          value={deger}
                          onChange={(e) => degerGuncelle(alan.id, e.target.value)}
                          placeholder="…"
                        />
                      </Field>
                    )
                  }

                  return (
                    <Field key={alan.id} label={etiket}>
                      <Input
                        value={deger}
                        onChange={(e) => degerGuncelle(alan.id, e.target.value)}
                        placeholder={alan.tip === 'Sayı' ? '0' : 'Değer giriniz'}
                      />
                    </Field>
                  )
                })}
              </div>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
