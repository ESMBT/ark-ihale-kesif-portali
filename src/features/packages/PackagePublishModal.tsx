import { useState } from 'react'
import { Alert } from '../../components/ui/Feedback'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Icon } from '../../components/ui/Icon'
import { Modal } from '../../components/ui/Modal'
import { personeller } from '../../data/mock'
import { sozlesmeTuruBul, turAlanlari } from '../../data/sozlesmeTurleri'
import type { IhalePaketi } from '../../data/types'
import { bilgiDurumu } from '../../lib/proje'

/**
 * İHALE PAKETİ YAYINLAMA
 * Eksik alan varsa uyarı gösterilir; eksik yoksa paket önizlemesi sunulur ve yayınlanır.
 */
export function PackagePublishModal({
  open,
  paket,
  onClose,
  onYayinla,
}: {
  open: boolean
  paket: IhalePaketi | null
  onClose: () => void
  onYayinla: () => void
}) {
  const [hata, setHata] = useState('')

  if (!paket) return null

  const bilgi = bilgiDurumu(paket)
  const sorumlu = personeller.find((p) => p.id === paket.sorumluId)
  const doluAlanlar = turAlanlari(paket.sozlesmeTuru).filter(
    (a) => (paket.alanlar?.[a.id] ?? '').trim(),
  )

  const yayinla = () => {
    if (!bilgi.tamam) {
      setHata('Eksik alanlar tamamlanmadan ihale paketi yayınlanamaz.')
      return
    }
    onYayinla()
    setHata('')
    onClose()
  }

  return (
    <Modal
      open={open}
      onClose={() => {
        setHata('')
        onClose()
      }}
      title="İhale Paketini Yayınla"
      description="Yayınlamadan önce paket içeriği ve eksik alanlar kontrol edilir."
      size="lg"
      footer={
        <>
          <Button
            variant="ghost"
            onClick={() => {
              setHata('')
              onClose()
            }}
          >
            Vazgeç
          </Button>
          <Button variant="brand" icon="send" onClick={yayinla}>
            Yayınla
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        {bilgi.tamam ? (
          <Alert tone="success" title="Eksik alan yok — paket yayınlanabilir">
            <span className="text-[13px]">
              Zorunlu alanların tamamı dolu. Yayınlandığında ihale ekibine ve alt yüklenicilere görünür olur.
            </span>
          </Alert>
        ) : (
          <div className="rounded-xl border border-warning/30 bg-warning-soft p-4">
            <p className="flex items-center gap-1.5 text-[13px] font-bold text-warning">
              <Icon name="alert-triangle" size={14} />
              {bilgi.eksikSayisi} eksik alan var — paket yayınlanamaz
            </p>
            <ul className="mt-2 space-y-1">
              {bilgi.eksik.map((e) => (
                <li key={e.id} className="text-[13px] text-ink">
                  · {e.ad}
                </li>
              ))}
            </ul>
          </div>
        )}

        {hata && (
          <div className="rounded-xl border border-danger/30 bg-danger-soft px-4 py-3 text-[13px] text-danger-d">
            {hata}
          </div>
        )}

        <dl className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[
            ['Paket Adı', paket.ad],
            ['Sözleşme Türü', sozlesmeTuruBul(paket.sozlesmeTuru).ad],
            ['Çalışma Tipi', paket.isTipi],
            ['Sorumlu', sorumlu?.ad ?? '—'],
          ].map(([k, v]) => (
            <div key={k}>
              <dt className="text-[12px] text-muted-foreground">{k}</dt>
              <dd className="mt-0.5 text-[14px] font-medium text-foreground">{v}</dd>
            </div>
          ))}
        </dl>

        <div className="overflow-hidden rounded-xl border border-border">
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <span className="text-[13px] font-bold text-black">Doldurulan Alanlar</span>
            <Badge tone={bilgi.tamam ? 'success' : 'warning'} size="sm">
              {doluAlanlar.length} / {turAlanlari(paket.sozlesmeTuru).length}
            </Badge>
          </div>
          <dl className="grid max-h-64 grid-cols-1 gap-x-6 gap-y-3 overflow-y-auto px-4 py-4 sm:grid-cols-2">
            {doluAlanlar.map((a) => (
              <div key={a.id}>
                <dt className="text-[12px] text-muted-foreground">{a.ad}</dt>
                <dd className="mt-0.5 text-[13px] font-medium whitespace-pre-line text-foreground">
                  {paket.alanlar?.[a.id]}
                </dd>
              </div>
            ))}
            {doluAlanlar.length === 0 && (
              <p className="col-span-2 py-6 text-center text-[13px] text-muted-foreground">
                Henüz doldurulmuş alan yok.
              </p>
            )}
          </dl>
        </div>
      </div>
    </Modal>
  )
}
