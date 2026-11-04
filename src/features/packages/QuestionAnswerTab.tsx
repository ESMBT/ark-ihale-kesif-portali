import { useState } from 'react'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { Field, Textarea } from '../../components/ui/Field'
import { Icon } from '../../components/ui/Icon'
import { Modal } from '../../components/ui/Modal'
import { EmptyState } from '../../components/ui/Feedback'
import type { Soru } from '../../data/types'

/**
 * SORU / CEVAP
 * İhale süreci boyunca alt yüklenicilerin soruları ve ihale ekibinin cevapları.
 */
export function QuestionAnswerTab({
  sorular,
  onSoruEkle,
  onCevapla,
}: {
  sorular: Soru[]
  onSoruEkle: (soru: string, soran: string) => void
  onCevapla: (soruId: string, cevap: string) => void
}) {
  const [seciliId, setSeciliId] = useState<string | null>(null)
  const [soruMetni, setSoruMetni] = useState('')
  const [soran, setSoran] = useState('')
  const [cevapModal, setCevapModal] = useState<Soru | null>(null)
  const [cevapMetni, setCevapMetni] = useState('')

  const secili = sorular.find((s) => s.id === seciliId) ?? null
  const bekleyenler = sorular.filter((s) => !s.cevap)

  return (
    <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
      {/* Soru listesi */}
      <Card padded={false}>
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-5 py-4">
          <div>
            <h4 className="text-[17px] leading-6">Sorular</h4>
          </div>
          {bekleyenler.length > 0 && (
            <Badge tone="warning" size="sm" dot>
              {bekleyenler.length} bekleyen
            </Badge>
          )}
        </div>

        {sorular.length === 0 ? (
          <EmptyState icon="message-square" title="Soru sorulmamış" description="Henüz soru kaydı bulunmuyor." />
        ) : (
          <ul className="divide-y divide-border">
            {[...sorular].reverse().map((s) => {
              const aktif = s.id === seciliId
              return (
                <li key={s.id}>
                  <button
                    onClick={() => setSeciliId(s.id)}
                    className={`flex w-full items-start gap-3 px-5 py-4 text-left transition-colors ${
                      aktif ? 'bg-info-bg' : 'hover:bg-surface-muted'
                    }`}
                  >
                    <span
                      className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${
                        s.cevap ? 'bg-success-soft text-success' : 'bg-warning-soft text-warning'
                      }`}
                    >
                      <Icon name={s.cevap ? 'check-circle' : 'message-square'} size={14} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-[14px] leading-5 font-medium text-foreground">{s.soru}</span>
                      <span className="mt-1 block text-[12px] text-muted-foreground">
                        {s.soran} · {s.soruTarihi}
                      </span>
                    </span>
                    {!s.cevap && (
                      <Badge tone="warning" size="sm">
                        Bekliyor
                      </Badge>
                    )}
                  </button>
                </li>
              )
            })}
          </ul>
        )}
      </Card>

      {/* Soru detayı + yeni soru */}
      <div className="space-y-5">
        {secili ? (
          <Card>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[12px] font-bold tracking-wide text-muted-foreground uppercase">Soru</p>
                <p className="mt-1 text-[15px] leading-6 font-medium text-foreground">{secili.soru}</p>
                <p className="mt-1.5 text-[12px] text-muted-foreground">
                  {secili.soran} · {secili.soruTarihi}
                </p>
              </div>
              {secili.cevap ? (
                <Badge tone="success" size="sm" dot>
                  Cevaplandı
                </Badge>
              ) : (
                <Button
                  variant="brand"
                  size="sm"
                  icon="message-square"
                  onClick={() => {
                    setCevapMetni('')
                    setCevapModal(secili)
                  }}
                >
                  Cevapla
                </Button>
              )}
            </div>

            {secili.cevap && (
              <div className="mt-4 rounded-xl border-l-2 border-success bg-success-soft px-4 py-3">
                <p className="text-[12px] font-bold tracking-wide text-success uppercase">Cevap</p>
                <p className="mt-1 text-[14px] leading-6 text-foreground">{secili.cevap}</p>
                <p className="mt-1.5 text-[12px] text-muted-foreground">
                  {secili.cevaplayan} · {secili.cevapTarihi}
                </p>
              </div>
            )}
          </Card>
        ) : (
          <Card>
            <EmptyState
              icon="message-square"
              title="Soru seçilmedi"
              description="Soldaki listeden bir soru seçerek soru/cevap detayını görüntüleyin."
            />
          </Card>
        )}

        <Card>
          <h4 className="text-[17px] leading-6">Yeni Soru</h4>

          <div className="mt-4 space-y-3">
            <Field label="Soran" required>
              <input
                value={soran}
                onChange={(e) => setSoran(e.target.value)}
                placeholder="Firma / yetkili adı"
                className="h-11 w-full rounded-md border border-line bg-white px-3 text-[16px] outline-none placeholder:text-gray focus:border-black"
              />
            </Field>
            <Field label="Soru" required>
              <Textarea
                value={soruMetni}
                onChange={(e) => setSoruMetni(e.target.value)}
                placeholder="Soruyu yazınız…"
              />
            </Field>
            <Button
              variant="brand"
              icon="send"
              disabled={!soruMetni.trim() || !soran.trim()}
              onClick={() => {
                onSoruEkle(soruMetni.trim(), soran.trim())
                setSoruMetni('')
                setSoran('')
              }}
            >
              Soruyu Gönder
            </Button>
          </div>
        </Card>
      </div>

      {/* Cevap modalı */}
      <Modal
        open={!!cevapModal}
        onClose={() => setCevapModal(null)}
        title="Soruyu Cevapla"
        description={cevapModal?.soru}
        footer={
          <>
            <Button variant="ghost" onClick={() => setCevapModal(null)}>
              Vazgeç
            </Button>
            <Button
              variant="brand"
              icon="send"
              disabled={!cevapMetni.trim()}
              onClick={() => {
                if (!cevapModal) return
                onCevapla(cevapModal.id, cevapMetni.trim())
                setCevapModal(null)
              }}
            >
              Cevabı Gönder
            </Button>
          </>
        }
      >
        <Field label="Cevap" required>
          <Textarea value={cevapMetni} onChange={(e) => setCevapMetni(e.target.value)} placeholder="…" />
        </Field>
      </Modal>
    </div>
  )
}
