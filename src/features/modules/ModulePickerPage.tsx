import { Badge } from '../../components/ui/Badge'
import { Icon } from '../../components/ui/Icon'
import { PageHeader } from '../../components/ui/Feedback'
import { MODULLER } from '../../lib/modules'

/* =================================================================
   MODÜL SEÇİM EKRANI
   -----------------------------------------------------------------
   Ark İnşaat markasına tıklandığında sağdaki içerik alanında açılır.
   Şimdilik yalnızca modül listesi gösterilir; modüller içeri
   girilebilir değildir.
   ================================================================= */

export function ModulePickerPage() {
  return (
    <div>
      <PageHeader
        breadcrumb={[{ label: 'Ark İnşaat' }]}
        title="Modüller"
        description="Portalın çalışma modülleri. Modüller tamamlandıkça içerikleri modül içinde açılacaktır."
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {MODULLER.map((m) => (
          <div
            key={m.id}
            className="flex flex-col rounded-2xl border border-border bg-surface p-5"
            aria-disabled
          >
            <div className="flex items-start justify-between gap-3">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-surface-muted text-ink">
                <Icon name={m.ikon} size={22} />
              </span>
              <Badge tone="warning" size="sm" dot>
                Yapım aşamasında
              </Badge>
            </div>

            <h3 className="mt-4 font-heading text-[20px] leading-6 font-bold text-black">{m.ad}</h3>
            <p className="mt-1.5 text-[14px] leading-5 text-muted-foreground">{m.aciklama}</p>

            <ul className="mt-4 space-y-1.5 border-t border-border pt-4">
              {m.bolumler.map((b) => (
                <li key={b} className="flex items-center gap-2 text-[13px] leading-5 text-muted-foreground">
                  <span className="h-1 w-1 shrink-0 rounded-full bg-gray" aria-hidden />
                  {b}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  )
}
