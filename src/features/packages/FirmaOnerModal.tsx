import { useState } from 'react'
import { Button } from '../../components/ui/Button'
import { Field, Input, Select, Textarea } from '../../components/ui/Field'
import { Modal } from '../../components/ui/Modal'
import { personeller } from '../../data/mock'

/**
 * FİRMA ÖNERİ (şantiyeci tarafı)
 * Bu ekran yalnızca **firmaya mail göndermek** içindir:
 *  · firma ünvanı · firma mail adresi · firma yetkili kişisi
 *  · mali sorumlu seçilir → cc alanına mali sorumlunun maili otomatik gelir
 *  · mail başlığı firma ünvanıyla otomatik oluşur
 *  · notlar: firmadan vergi levhası + firma bilgileri formu istenir
 * Vergi levhası / firma bilgileri formu **bu ekranda yüklenmez**; firma maili karşılığında iletir,
 * mali sorumlu (cc) belgeleri inceleyip SAP onayını yapar. Öneri gönderildikten sonra portal takibi yapılmaz.
 */

const VARSAYILAN_NOT =
  'Firmanızın incelenip kabul görmesi için lütfen bize vergi levhası ve firma bilgileri formunu iletiniz.'

export function FirmaOnerModal({
  open,
  onClose,
  onOner,
  maliSorumluler = [],
}: {
  open: boolean
  onClose: () => void
  onOner: (
    firma: string,
    mail: string,
    yetkili: string,
    maliSorumlu: string,
    not: string,
  ) => void
  maliSorumluler?: string[]
}) {
  const [firma, setFirma] = useState('')
  const [mail, setMail] = useState('')
  const [yetkili, setYetkili] = useState('')
  const [maliSorumlu, setMaliSorumlu] = useState('')
  const [konu, setKonu] = useState('')
  const [konuElleDuzeltildi, setKonuElleDuzeltildi] = useState(false)
  const [cc, setCc] = useState('')
  const [not, setNot] = useState(VARSAYILAN_NOT)

  /** Mail başlığı firma ünvanı girdikçe otomatik dolar (elle değiştirilirse dokunulmaz) */
  const varsayilanKonu = firma.trim()
    ? `Firma Önerisi — Portal Kayıt Talebi — ${firma.trim()}`
    : 'Firma Önerisi — Portal Kayıt Talebi'
  const konuDeger = konuElleDuzeltildi ? konu : varsayilanKonu

  const sifirla = () => {
    setFirma('')
    setMail('')
    setYetkili('')
    setMaliSorumlu('')
    setKonu('')
    setKonuElleDuzeltildi(false)
    setCc('')
    setNot(VARSAYILAN_NOT)
  }

  const kapat = () => {
    sifirla()
    onClose()
  }

  /** Mali sorumlu seçilince cc alanına maili otomatik eklenir */
  const maliSorumluSec = (ad: string) => {
    setMaliSorumlu(ad)
    const kisi = personeller.find((p) => p.ad === ad)
    const kisiMaili = kisi?.mail
    if (!kisiMaili) return
    const mevcut = cc
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
    if (!mevcut.includes(kisiMaili)) setCc([...mevcut, kisiMaili].join(', '))
  }

  /** Proje kartındaki mali yetkililer öncelikli, sonra genel mali sorumlular */
  const genelMali = personeller
    .filter((p) => p.roller.some((r) => /MUHASEBE_YETKILISI|MALI_ISLER_YONETICISI/i.test(r)))
    .map((p) => p.ad)
  const secenekler = Array.from(new Set([...maliSorumluler, ...genelMali]))

  return (
    <Modal
      open={open}
      onClose={kapat}
      title="Firma Öner"
      description="Firmaya portal kayıt talebi maili gönderilir."
      size="lg"
      footer={
        <>
          <Button variant="ghost" onClick={kapat}>
            Vazgeç
          </Button>
          <Button
            variant="brand"
            icon="send"
            disabled={!firma.trim() || !mail.trim() || !maliSorumlu.trim()}
            onClick={() => {
              onOner(
                firma.trim(),
                mail.trim(),
                yetkili.trim(),
                maliSorumlu.trim(),
                not.trim(),
              )
              sifirla()
              onClose()
            }}
          >
            Öneriyi Gönder
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Firma Ünvanı" required>
            <Input
              value={firma}
              onChange={(e) => setFirma(e.target.value)}
              placeholder="Firma ünvanı"
            />
          </Field>
          <Field label="Firma Mail Adresi" required>
            <Input
              value={mail}
              onChange={(e) => setMail(e.target.value)}
              placeholder="info@firma.com.tr"
            />
          </Field>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Firma Yetkili Kişisi">
            <Input
              value={yetkili}
              onChange={(e) => setYetkili(e.target.value)}
              placeholder="Ad Soyad"
            />
          </Field>
          <Field label="Mali Sorumlu" required>
            <Select value={maliSorumlu} onChange={(e) => maliSorumluSec(e.target.value)}>
              <option value="">Seçiniz…</option>
              {secenekler.map((ad) => {
                const kisi = personeller.find((p) => p.ad === ad)
                return (
                  <option key={ad} value={ad}>
                    {ad} — {kisi?.unvan ?? 'Mali Sorumlu'}
                  </option>
                )
              })}
            </Select>
          </Field>
        </div>

        <Field label="Mail Başlığı" required>
          <Input
            value={konuDeger}
            onChange={(e) => {
              setKonuElleDuzeltildi(true)
              setKonu(e.target.value)
            }}
          />
        </Field>

        <Field label="Cc">
          <Input
            value={cc}
            onChange={(e) => setCc(e.target.value)}
            placeholder="mali.sorumlu@arkinsaat.com.tr"
          />
        </Field>

        <Field label="Notlar">
          <Textarea value={not} onChange={(e) => setNot(e.target.value)} />
        </Field>
      </div>
    </Modal>
  )
}
