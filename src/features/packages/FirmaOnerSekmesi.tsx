import { useMemo, useState } from 'react'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { useStore } from '../../data/store'
import type { IhalePaketi } from '../../data/types'
import { FirmaOnerModal } from './FirmaOnerModal'

/* =================================================================
   ALT YÜKLENİCİ FİRMA ÖNERİ
   -----------------------------------------------------------------
   Şantiyeci tarafı — sistemde kayıtlı olmayan firmanın portal kaydının
   yapılması için firmaya mail gönderilir. Bu ekran yalnızca mail
   gönderimi içindir; gönderimden sonra portalde takip yapılmaz.
   ================================================================= */

export function FirmaOnerSekmesi({
  proje,
  paket,
}: {
  proje: { id: string; kart?: Record<string, string> }
  paket: IhalePaketi
}) {
  const { firmaOnerTalebi } = useStore()
  const [onerModal, setOnerModal] = useState(false)

  /** Proje kartındaki mali sorumlular (muhasebe yetkilisi + mali işler) */
  const maliSorumluler = useMemo(
    () =>
      [proje.kart?.muhasebeYetkilisi, proje.kart?.maliIsler].filter(
        (v): v is string => !!v && v.trim() !== '',
      ),
    [proje],
  )

  const onerilenler = paket.onerilenFirmalar ?? []

  return (
    <>
      <Card padded={false}>
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-5 py-4">
          <div>
            <h4 className="text-[17px] leading-6">Alt Yüklenici Firma Öneri</h4>
            <p className="mt-1 text-[12px] text-muted-foreground">
              Sistemde kayıtlı olmayan firmalar için portal kayıt talebi maili.
            </p>
          </div>
          <Button variant="secondary" size="sm" icon="plus" onClick={() => setOnerModal(true)}>
            Firma Öner
          </Button>
        </div>

        {onerilenler.length === 0 ? (
          <p className="px-5 py-8 text-center text-[13px] text-muted-foreground">
            Önerilen firma yok.
          </p>
        ) : (
          <ul className="divide-y divide-border">
            {onerilenler.map((a) => (
              <li key={a.id} className="flex items-center gap-3 px-5 py-3">
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[14px] font-medium text-foreground">{a.firma}</span>
                  <span className="block truncate text-[12px] text-muted-foreground">{a.iletisim}</span>
                  {a.maliSorumlu && (
                    <span className="block truncate text-[12px] text-muted-foreground">
                      Mali sorumlu: {a.maliSorumlu}
                    </span>
                  )}
                </span>
                <Badge tone="warning" size="sm">
                  Önerildi
                </Badge>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <FirmaOnerModal
        open={onerModal}
        onClose={() => setOnerModal(false)}
        maliSorumluler={maliSorumluler}
        onOner={(firma, mail, yetkili, maliSorumlu, not) =>
          firmaOnerTalebi(proje.id, paket.id, firma, mail, yetkili, maliSorumlu, not)
        }
      />
    </>
  )
}
