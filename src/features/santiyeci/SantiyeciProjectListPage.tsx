import { useCallback, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { EmptyState, PageHeader } from '../../components/ui/Feedback'
import { Icon } from '../../components/ui/Icon'
import { Input } from '../../components/ui/Field'
import { Modal } from '../../components/ui/Modal'
import { RowMenu } from '../../components/ui/RowMenu'
import { useStore } from '../../data/store'
import type { Proje } from '../../data/types'
import { modulYolu } from '../../lib/modul'
import { ProjectEditModal } from '../projects/ProjectEditModal'

/* =================================================================
   ŞANTIYECİ MODÜLÜ — "Projelerim"
   -----------------------------------------------------------------
   Yalnızca şantiyecinin kendi projeleri (sahibi olduğu / atandığı).
   Proje Kodu Talebi yalnızca bu modüldedir; arşivlenen projeler
   gizlenir, "Arşivlenenler" bölümünden görüntülenir.
   ================================================================= */

export function SantiyeciProjectListPage() {
  const { santiyeciProjeler, santiyeciArsivProjeler, kartGuncelle, projeArsivle, projeArsivleGeriAl } =
    useStore()
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [arsivAcik, setArsivAcik] = useState(false)
  const [arsivlenecek, setArsivlenecek] = useState<Proje | null>(null)
  const [duzenlenecek, setDuzenlenecek] = useState<Proje | null>(null)

  const filtre = useCallback(
    (liste: Proje[]) => {
      const q = query.trim().toLocaleLowerCase('tr')
      return liste.filter(
        (p) =>
          !q ||
          p.ad.toLocaleLowerCase('tr').includes(q) ||
          (p.kart.projeKodu ?? '').toLocaleLowerCase('tr').includes(q),
      )
    },
    [query],
  )

  const projeler = useMemo(() => filtre(santiyeciProjeler), [filtre, santiyeciProjeler])
  const arsivProjeler = useMemo(() => filtre(santiyeciArsivProjeler), [filtre, santiyeciArsivProjeler])

  const projeYolu = (id: string) => modulYolu('santiyeci', `/projeler/${id}`)

  return (
    <>
      <PageHeader
        title="Projelerim"
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              icon="folder-open"
              onClick={() => setArsivAcik((v) => !v)}
            >
              Arşivlenenler{santiyeciArsivProjeler.length > 0 ? ` (${santiyeciArsivProjeler.length})` : ''}
            </Button>
            <Button
              variant="brand"
              icon="send"
              onClick={() => navigate(modulYolu('santiyeci', '/projeler/talep'))}
            >
              Proje Kodu Talebi
            </Button>
          </div>
        }
      />

      <Card padded={false}>
        {/* Arama */}
        <div className="flex flex-wrap items-center gap-3 border-b border-line px-5 py-3">
          <div className="relative min-w-[260px] flex-1">
            <Icon
              name="search"
              size={16}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray"
            />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Proje adı, proje kodu ile ara..."
              className="h-9 pl-9 text-[14px]"
            />
          </div>
        </div>

        {projeler.length === 0 ? (
          <EmptyState icon="building2" title="Kayıt bulunamadı" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-[14px]">
              <thead>
                <tr className="border-b border-line bg-surface-muted">
                  {['Proje Kodu', 'Proje Adı', 'Lokasyon / İşveren', 'Son Erişim Tarihi', ''].map((h, i) => (
                    <th
                      key={h}
                      className={`px-5 py-3 text-[12px] font-bold uppercase tracking-wide text-muted-foreground ${
                        i === 3 ? 'text-right' : 'text-left'
                      }`}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {projeler.map((p) => (
                  <tr
                    key={p.id}
                    onClick={() => navigate(projeYolu(p.id))}
                    className="cursor-pointer border-b border-line last:border-0 hover:bg-surface-muted"
                  >
                    <td className="px-5 py-4">
                      <span className="block font-mono text-[13px] whitespace-nowrap text-foreground">
                        {p.kart.projeKodu || '—'}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className="block font-bold text-black">{p.ad}</span>
                      <span className="mt-0.5 block text-[12px] text-muted-foreground">
                        {p.paketler.length} ihale paketi · {p.asama}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className="block text-black">{p.kart.lokasyon || '—'}</span>
                      <span className="mt-0.5 block text-[12px] text-muted-foreground">
                        {p.kart.idare || '—'}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <span className="block font-medium text-foreground">{p.sonErişimTarihi ?? '—'}</span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="secondary"
                          size="sm"
                          iconRight="arrow-right"
                          onClick={(e) => {
                            e.stopPropagation()
                            navigate(projeYolu(p.id))
                          }}
                        >
                          Aç
                        </Button>
                        <RowMenu
                          items={[
                            {
                              label: 'Projeyi Düzenle',
                              icon: 'pencil',
                              onSelect: () => setDuzenlenecek(p),
                            },
                            {
                              label: 'Projeyi Arşivle',
                              icon: 'trash',
                              danger: true,
                              onSelect: () => setArsivlenecek(p),
                            },
                          ]}
                          label="Proje işlemleri"
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* ---------------- ARŞİVLENENLER ---------------- */}
      {arsivAcik && (
        <Card padded={false} className="mt-4">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line px-5 py-3">
            <h4 className="text-[15px] font-bold text-black">Arşivlenenler</h4>
            <span className="text-[12px] text-muted-foreground">{arsivProjeler.length} proje</span>
          </div>
          {arsivProjeler.length === 0 ? (
            <p className="px-5 py-8 text-center text-[13px] text-muted-foreground">
              Arşivlenen proje yok.
            </p>
          ) : (
            <ul className="divide-y divide-border">
              {arsivProjeler.map((p) => (
                <li key={p.id} className="flex items-center gap-3 px-5 py-3">
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[14px] font-medium text-foreground">{p.ad}</span>
                    <span className="block truncate text-[12px] text-muted-foreground">
                      {p.kart.projeKodu || '—'} · Arşiv tarihi: {p.arsivTarihi ?? '—'}
                    </span>
                  </span>
                  <Button
                    variant="secondary"
                    size="sm"
                    icon="rotate-ccw"
                    onClick={() => projeArsivleGeriAl(p.id)}
                  >
                    Arşivden çıkar
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </Card>
      )}

      {/* Proje düzenleme */}
      <ProjectEditModal
        open={!!duzenlenecek}
        proje={duzenlenecek}
        onClose={() => setDuzenlenecek(null)}
        onKaydet={(kart) => {
          if (duzenlenecek) kartGuncelle(duzenlenecek.id, kart)
        }}
      />

      {/* Arşivleme onayı */}
      <Modal
        open={!!arsivlenecek}
        onClose={() => setArsivlenecek(null)}
        title="Projeyi Arşivle"
        description={arsivlenecek?.ad}
        footer={
          <>
            <Button variant="ghost" onClick={() => setArsivlenecek(null)}>
              Vazgeç
            </Button>
            <Button
              variant="danger"
              icon="trash"
              onClick={() => {
                if (arsivlenecek) projeArsivle(arsivlenecek.id)
                setArsivlenecek(null)
              }}
            >
              Arşivle
            </Button>
          </>
        }
      >
        <p className="text-[14px] leading-6 text-foreground">
          <strong>{arsivlenecek?.ad}</strong> projesi arşive taşınacak. Arşivlenen proje “Projelerim”
          listesinde görünmez; “Arşivlenenler” bölümünden geri alınabilir.
        </p>
      </Modal>
    </>
  )
}
