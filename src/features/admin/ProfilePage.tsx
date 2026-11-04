import { useState } from 'react'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { Field, Input, Select } from '../../components/ui/Field'
import { Icon } from '../../components/ui/Icon'
import { Modal } from '../../components/ui/Modal'
import { Alert, PageHeader } from '../../components/ui/Feedback'
import { Avatar } from '../../components/ui/Shell'
import { useStore } from '../../data/store'

const ulkeler = [
  { kod: '+90', bayrak: '🇹🇷', ad: 'Türkiye' },
  { kod: '+49', bayrak: '🇩🇪', ad: 'Almanya' },
  { kod: '+44', bayrak: '🇬🇧', ad: 'Birleşik Krallık' },
  { kod: '+31', bayrak: '🇳🇱', ad: 'Hollanda' },
  { kod: '+33', bayrak: '🇫🇷', ad: 'Fransa' },
]

export function ProfilePage() {
  const { kullanicilar, ekipler, roller } = useStore()
  const ben = kullanicilar.find((k) => k.ad === 'Hakan') ?? kullanicilar[0]

  const [ulkeKodu, setUlkeKodu] = useState('+90')
  const [telefon, setTelefon] = useState('532 000 00 15')
  const [kaydedildi, setKaydedildi] = useState(false)
  const [sifreModal, setSifreModal] = useState(false)

  const ekip = ekipler.find((e) => e.id === ben?.ekipId)
  const rol = roller.find((r) => r.id === ben?.rolId)
  const ulke = ulkeler.find((u) => u.kod === ulkeKodu) ?? ulkeler[0]

  return (
    <>
      <PageHeader
        title="Profilim"
        description="Portalda görüntülenecek profil bilgileriniz ve şifre yönetiminiz."
      />

      {kaydedildi && (
        <div className="mb-5">
          <Alert tone="success" title="İletişim bilgileriniz güncellendi">
            <span className="text-[13px]">Telefon ve ülke bilgisi kaydedildi.</span>
          </Alert>
        </div>
      )}

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
        {/* Kimlik kartı */}
        <Card>
          <div className="flex flex-col items-center gap-3 py-4 text-center">
            <Avatar initials={`${ben?.ad[0] ?? ''}${ben?.soyad[0] ?? ''}`} size={72} tone="orange" />
            <div>
              <p className="font-heading text-[18px] leading-7 font-bold text-black">
                {ben?.ad} {ben?.soyad}
              </p>
              <p className="text-[13px] text-muted-foreground">{ben?.unvan}</p>
            </div>
            <div className="mt-1 flex flex-wrap justify-center gap-2">
              {ekip && (
                <Badge tone="info" size="sm">
                  {ekip.ad}
                </Badge>
              )}
              {rol && (
                <Badge tone="neutral" size="sm">
                  {rol.ad}
                </Badge>
              )}
            </div>
            <p className="mt-2 flex items-center gap-1.5 text-[12px] text-gray">
              <Icon name="shield-check" size={13} />
              Portal erişimi: İhale &amp; Keşif modülü
            </p>
          </div>
        </Card>

        {/* Bilgi + iletişim */}
        <div className="space-y-5 xl:col-span-2">
          <Card>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h4 className="text-[17px] leading-6">Profil Bilgileri</h4>
              <Button variant="secondary" size="sm" icon="users" to="/kullanim">
                Kullanıcı Yönetimi
              </Button>
            </div>

            <dl className="mt-5 grid grid-cols-1 gap-x-8 gap-y-4 sm:grid-cols-2">
              {[
                ['Ad Soyad', `${ben?.ad ?? ''} ${ben?.soyad ?? ''}`.trim()],
                ['Ünvan', ben?.unvan ?? '—'],
                ['Ekip', ekip?.ad ?? '—'],
                ['Mail Adresi', ben?.mail ?? '—'],
              ].map(([k, v]) => (
                <div key={k}>
                  <dt className="text-[12px] text-muted-foreground">{k}</dt>
                  <dd className="mt-0.5 text-[14px] font-medium text-foreground">{v}</dd>
                </div>
              ))}
            </dl>
          </Card>

          {/* İletişim — sadece telefon + ülke düzenlenebilir */}
          <Card>
            <h4 className="text-[17px] leading-6">İletişim Bilgileri</h4>

            <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-[220px_1fr]">
              <Field label="Ülke" required>
                <Select value={ulkeKodu} onChange={(e) => setUlkeKodu(e.target.value)}>
                  {ulkeler.map((u) => (
                    <option key={u.kod} value={u.kod}>
                      {u.bayrak}  {u.ad} ({u.kod})
                    </option>
                  ))}
                </Select>
              </Field>

              <Field label="Telefon Numarası" required>
                <div className="flex">
                  <span className="inline-flex h-11 items-center rounded-l-md border border-r-0 border-line bg-surface-muted px-3 text-[14px] font-medium text-ink">
                    {ulke.kod}
                  </span>
                  <Input
                    value={telefon}
                    onChange={(e) => setTelefon(e.target.value)}
                    className="rounded-l-none"
                    placeholder="532 000 00 15"
                  />
                </div>
              </Field>
            </div>

            <div className="mt-5 flex items-center justify-end gap-2 border-t border-border pt-5">
              <Button variant="ghost" onClick={() => setKaydedildi(false)}>
                Vazgeç
              </Button>
              <Button variant="brand" icon="save" onClick={() => setKaydedildi(true)}>
                Değişiklikleri Kaydet
              </Button>
            </div>
          </Card>

          {/* Şifre yönetimi */}
          <Card>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-start gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-surface-muted text-ink">
                  <Icon name="lock" size={17} />
                </span>
                <div>
                  <h4 className="text-[17px] leading-6">Şifre Yönetimi</h4>
                </div>
              </div>
              <Button variant="secondary" icon="key" onClick={() => setSifreModal(true)}>
                Şifremi Değiştir
              </Button>
            </div>
          </Card>
        </div>
      </div>

      {/* Şifre değiştirme modalı */}
      <SifreDegistirModal open={sifreModal} onClose={() => setSifreModal(false)} />
    </>
  )
}

function SifreDegistirModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [mevcut, setMevcut] = useState('')
  const [yeni, setYeni] = useState('')
  const [tekrar, setTekrar] = useState('')
  const [tamamlandi, setTamamlandi] = useState(false)

  const kapat = () => {
    setMevcut('')
    setYeni('')
    setTekrar('')
    setTamamlandi(false)
    onClose()
  }

  const guc = Math.min(
    (mevcut.length >= 8 ? 1 : 0) + (yeni.length >= 10 ? 1 : 0) + (/[A-ZĞÜŞİÖÇ]/.test(yeni) ? 1 : 0) + (/\d/.test(yeni) ? 1 : 0),
    4,
  )

  return (
    <Modal
      open={open}
      onClose={kapat}
      title="Şifremi Değiştir"
      description="Yeni şifreniz en az 10 karakter olmalı, büyük/küçük harf ve rakam içermelidir."
      footer={
        <>
          <Button variant="ghost" onClick={kapat}>
            Vazgeç
          </Button>
          <Button
            variant="brand"
            icon="key"
            disabled={!mevcut || yeni.length < 10 || yeni !== tekrar}
            onClick={() => setTamamlandi(true)}
          >
            Şifreyi Güncelle
          </Button>
        </>
      }
    >
      {tamamlandi ? (
        <Alert tone="success" title="Şifreniz güncellendi">
          <span className="text-[13px]">Yeni şifreniz ile giriş yapabilirsiniz.</span>
        </Alert>
      ) : (
        <div className="space-y-4">
          <Field label="Mevcut Şifre" required>
            <Input type="password" value={mevcut} onChange={(e) => setMevcut(e.target.value)} />
          </Field>
          <Field label="Yeni Şifre" required>
            <Input type="password" value={yeni} onChange={(e) => setYeni(e.target.value)} />
            {yeni.length > 0 && (
              <span className="mt-2 flex items-center gap-2">
                <span className="flex gap-1">
                  {[0, 1, 2, 3].map((i) => (
                    <span
                      key={i}
                      className={`h-1.5 w-10 rounded-full ${
                        i < guc
                          ? guc <= 1
                            ? 'bg-danger'
                            : guc === 2
                              ? 'bg-warning'
                              : 'bg-success'
                          : 'bg-line'
                      }`}
                    />
                  ))}
                </span>
                <span className="text-[12px] text-muted-foreground">
                  {guc <= 1 ? 'Zayıf' : guc === 2 ? 'Orta' : guc === 3 ? 'Güçlü' : 'Çok güçlü'}
                </span>
              </span>
            )}
          </Field>
          <Field label="Yeni Şifre (Tekrar)" required error={tekrar && tekrar !== yeni ? 'Şifreler eşleşmiyor.' : undefined}>
            <Input type="password" value={tekrar} onChange={(e) => setTekrar(e.target.value)} />
          </Field>
        </div>
      )}
    </Modal>
  )
}
