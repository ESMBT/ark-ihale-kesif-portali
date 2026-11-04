import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Card, CardHeader } from '../../components/ui/Card'
import { Alert, EmptyState, PageHeader, StatTile } from '../../components/ui/Feedback'
import { Icon } from '../../components/ui/Icon'
import { bildirimKatalog } from '../../data/mock'
import { useStore } from '../../data/store'
import { aktifModul, modulYolu } from '../../lib/modul'
import type { Bildirim } from '../../data/types'

const tipTone = {
  talep: 'warning',
  onay: 'success',
  revize: 'danger',
  bilgi: 'info',
} as const

const tipLabel = {
  talep: 'Talep',
  onay: 'Onay',
  revize: 'Revize',
  bilgi: 'Bilgi',
} as const

export function NotificationsPage() {
  const location = useLocation()
  const { bildirimler, bildirimOkundu, tumBildirimlerOkundu } = useStore()
  const [rol, setRol] = useState('tumu')

  const roller = ['tumu', ...Array.from(new Set(bildirimler.map((b) => b.hedefRol)))]
  const listelenen = bildirimler.filter((b) => rol === 'tumu' || b.hedefRol === rol)

  const okunmamis = bildirimler.filter((b) => !b.okundu).length

  return (
    <>
      <PageHeader
        title="Bildirimler"
        description="Her bildirim, bildirim numarası ve fonksiyon adı ile birlikte listelenir. Mail ve portal içi bildirimleri aynı kayıt üretir."
        actions={
          <Button variant="secondary" icon="check" onClick={tumBildirimlerOkundu} disabled={okunmamis === 0}>
            Tümünü Okundu İşaretle
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatTile label="Toplam Bildirim" value={String(bildirimler.length)} icon="bell" tone="primary" />
        <StatTile
          label="Okunmamış"
          value={String(okunmamis)}
          icon="alert-circle"
          tone="danger"
        />
        <StatTile
          label="Mail Gönderilen"
          value={String(bildirimler.filter((b) => b.mailGonderildiMi).length)}
          icon="send"
          tone="success"
        />
      </div>

      <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card padded={false}>
            <div className="flex flex-wrap items-center gap-2 border-b border-border p-4">
              {roller.map((r) => (
                <button
                  key={r}
                  onClick={() => setRol(r)}
                  className={`rounded-full px-3 py-1.5 text-[13px] transition-colors ${
                    rol === r
                      ? 'bg-black font-medium text-white'
                      : 'bg-surface-muted text-muted-foreground hover:bg-line-faint hover:text-black'
                  }`}
                >
                  {r === 'tumu' ? 'Tümü' : r}
                </button>
              ))}
            </div>

            {listelenen.length === 0 ? (
              <EmptyState icon="inbox" title="Bildirim yok" description="Bu rolde henüz bildirim bulunmuyor." />
            ) : (
              <ul className="divide-y divide-border">
                {listelenen.map((b: Bildirim) => (
                  <li key={b.id} className={`px-5 py-4 ${b.okundu ? '' : 'bg-info-bg/40'}`}>
                    <div className="flex items-start gap-3">
                      <span
                        className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${b.okundu ? 'bg-transparent' : 'bg-black'}`}
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-mono text-[12px] font-bold text-black">{b.bildirimNo}</span>
                          <span className="text-[12px] font-semibold uppercase tracking-wide text-muted-foreground">
                            {b.fonksiyon}
                          </span>
                          <Badge tone={tipTone[b.tip]} size="sm">
                            {tipLabel[b.tip]}
                          </Badge>
                          {b.mailGonderildiMi && (
                            <Badge tone="neutral" size="sm">
                              <Icon name="send" size={11} /> Mail gönderildi
                            </Badge>
                          )}
                        </div>
                        <p className="mt-1.5 text-[14px] font-semibold text-foreground">{b.baslik}</p>
                        <p className="mt-1 text-[13px] leading-5 text-muted-foreground">{b.aciklama}</p>
                        <div className="mt-2 flex flex-wrap items-center gap-3 text-[12px] text-gray">
                          <span>{b.zaman}</span>
                          <span>Alıcı rol: {b.hedefRol}</span>
                          {b.projeId && (
                            <Link
                              to={modulYolu(aktifModul(location.pathname), `/projeler/${b.projeId}`)}
                              className="font-medium text-black underline underline-offset-2"
                              onClick={() => bildirimOkundu(b.id)}
                            >
                              Projeyi aç
                            </Link>
                          )}
                          {!b.okundu && (
                            <button
                              onClick={() => bildirimOkundu(b.id)}
                              className="font-medium text-black underline underline-offset-2"
                            >
                              Okundu işaretle
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>

        {/* Bildirim kataloğu */}
        <Card padded={false}>
          <div className="p-5 pb-0">
            <CardHeader
              icon="list-checks"
              title="Bildirim Kataloğu"
              description="Bildirim no + fonksiyon adı"
            />
          </div>
          <ul className="mt-4 divide-y divide-border">
            {bildirimKatalog.map((k) => (
              <li key={k.no} className="px-5 py-3.5">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[13px] font-bold text-black">{k.no}</span>
                  <span className="text-[13px] font-medium text-foreground">{k.fonksiyon}</span>
                </div>
                <p className="mt-1 text-[12px] leading-4 text-muted-foreground">{k.aciklama}</p>
                <Badge tone="neutral" size="sm" className="mt-1.5">
                  Hedef: {k.hedefRol}
                </Badge>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <div className="mt-4">
        <Alert tone="info" title="Bildirim üretim kuralları">
          <span className="text-[13px]">
            Proje kodu talebi → 9001 (SAP Uzmanı) · SAP kodu oluşturuldu → 9002 (Şantiyeci) · Proje kartı revize → 9003 ·
            İhale paketi onayı → 9004 · İhale paketi revize → 9005. Her fonksiyon mail ve portal bildirimini birlikte
            üretir.
          </span>
        </Alert>
      </div>
    </>
  )
}
