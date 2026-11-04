import { useState } from 'react'
import { Button } from '../../components/ui/Button'
import { Field, Input, Select, Textarea } from '../../components/ui/Field'
import { FileDrop } from '../../components/ui/FileDrop'
import { Modal } from '../../components/ui/Modal'
import { personeller } from '../../data/mock'

/**
 * FİRMA ÖNERİ (şantiyeci tarafı)
 * Sistemde tanımlı olmayan firmanın SAP kaydının yapılması talep edilir:
 * firma bilgileri + vergi levhası + firma bilgileri formu iletilir.
 */
export function FirmaOnerModal({
  open,
  onClose,
  onOner,
}: {
  open: boolean
  onClose: () => void
  onOner: (firma: string, mail: string, yetkili: string, not: string) => void
}) {
  const [firma, setFirma] = useState('')
  const [mail, setMail] = useState('')
  const [yetkili, setYetkili] = useState('')
  const [sapSorumlu, setSapSorumlu] = useState('')
  const [konu, setKonu] = useState('Firma Önerisi — Portal Kayıt Talebi')
  const [cc, setCc] = useState('')
  const [vergiLevhasi, setVergiLevhasi] = useState<string[]>([])
  const [firmaBilgileri, setFirmaBilgileri] = useState<string[]>([])
  const [not, setNot] = useState(
    'Firmanın incelenip kabul görmesi durumunda SAP kaydının yapılmasını talep ediyoruz.',
  )

  const sifirla = () => {
    setFirma('')
    setMail('')
    setYetkili('')
    setSapSorumlu('')
    setKonu('Firma Önerisi — Portal Kayıt Talebi')
    setCc('')
    setVergiLevhasi([])
    setFirmaBilgileri([])
    setNot('Firmanın incelenip kabul görmesi durumunda SAP kaydının yapılmasını talep ediyoruz.')
  }

  const kapat = () => {
    sifirla()
    onClose()
  }

  return (
    <Modal
      open={open}
      onClose={kapat}
      title="Firma Öner"
      size="lg"
      footer={
        <>
          <Button variant="ghost" onClick={kapat}>
            Vazgeç
          </Button>
          <Button
            variant="brand"
            icon="send"
            disabled={!firma.trim() || !mail.trim() || !sapSorumlu.trim()}
            onClick={() => {
              const ekler = [
                vergiLevhasi.length ? `Vergi Levhası: ${vergiLevhasi.join(', ')}` : '',
                firmaBilgileri.length ? `Firma Bilgileri Formu: ${firmaBilgileri.join(', ')}` : '',
              ]
                .filter(Boolean)
                .join(' | ')
              onOner(
                firma.trim(),
                mail.trim(),
                `${yetkili.trim()} | ${sapSorumlu.trim()}${ekler ? ` | ${ekler}` : ''}`,
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
            <Input value={firma} onChange={(e) => setFirma(e.target.value)} placeholder="Firma ünvanı" />
          </Field>
          <Field label="Mail Adresi" required>
            <Input value={mail} onChange={(e) => setMail(e.target.value)} placeholder="info@firma.com.tr" />
          </Field>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Yetkili Kişi">
            <Input value={yetkili} onChange={(e) => setYetkili(e.target.value)} placeholder="Ad Soyad" />
          </Field>
          <Field label="SAP Sorumlusu" required>
            <Select value={sapSorumlu} onChange={(e) => setSapSorumlu(e.target.value)}>
              <option value="">Seçiniz…</option>
              {personeller.map((p) => (
                <option key={p.id} value={p.ad}>
                  {p.ad} — {p.unvan}
                </option>
              ))}
            </Select>
          </Field>
        </div>

        <Field label="Mail Başlığı" required>
          <Input value={konu} onChange={(e) => setKonu(e.target.value)} />
        </Field>

        <Field label="Cc">
          <Input value={cc} onChange={(e) => setCc(e.target.value)} placeholder="ornek@arkinsaat.com.tr" />
        </Field>

        <div>
          <p className="mb-2 text-[14px] font-medium text-black">Vergi Levhası</p>
          <FileDrop
            compact
            label="Vergi levhası dosyasını ekleyin"
            hint="PDF, JPG, PNG"
            accept=".pdf,.jpg,.jpeg,.png"
            onFiles={(files) => setVergiLevhasi((prev) => [...prev, ...files.map((f) => f.name)])}
          />
        </div>

        <div>
          <p className="mb-2 text-[14px] font-medium text-black">Firma Bilgileri Formu</p>
          <FileDrop
            compact
            label="Firma bilgileri formunu ekleyin"
            hint="PDF, DOCX, XLSX"
            accept=".pdf,.doc,.docx,.xls,.xlsx"
            onFiles={(files) => setFirmaBilgileri((prev) => [...prev, ...files.map((f) => f.name)])}
          />
        </div>

        <Field label="Notlar">
          <Textarea value={not} onChange={(e) => setNot(e.target.value)} />
        </Field>
      </div>
    </Modal>
  )
}
