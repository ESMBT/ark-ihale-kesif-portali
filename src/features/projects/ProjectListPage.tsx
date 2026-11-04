import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { EmptyState, PageHeader } from '../../components/ui/Feedback'
import { Icon } from '../../components/ui/Icon'
import { Input } from '../../components/ui/Field'
import { Modal } from '../../components/ui/Modal'
import { RowMenu } from '../../components/ui/RowMenu'
import { useStore } from '../../data/store'
import { modulYolu } from '../../lib/modul'
import { ProjectEditModal } from './ProjectEditModal'
import type { Proje } from '../../data/types'

export function ProjectListPage() {
  const { goruntulenenProjeler: projeler, kartGuncelle } = useStore()
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [arsivlenecek, setArsivlenecek] = useState<Proje | null>(null)
  const [duzenlenecek, setDuzenlenecek] = useState<Proje | null>(null)

  const filtered = useMemo(() => {
    const q = query.trim().toLocaleLowerCase('tr')
    return projeler.filter(
      (p) =>
        !q ||
        p.ad.toLocaleLowerCase('tr').includes(q) ||
        (p.kart.projeKodu ?? '').toLocaleLowerCase('tr').includes(q),
    )
  }, [projeler, query])

  return (
    <>
      <PageHeader title="Tüm Projeler" />

      <Card padded={false}>
        {/* Arama çubuğu */}
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

        {filtered.length === 0 ? (
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
                {filtered.map((p) => {
                  return (
                    <tr
                      key={p.id}
                      onClick={() => navigate(modulYolu('ihale', `/projeler/${p.id}`))}
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
                              navigate(modulYolu('ihale', `/projeler/${p.id}`))
                            }}
                          >
                            Aç
                          </Button>
                          <RowMenu
                            items={[
                              {
                                label: 'Projeyi Arşivle',
                                icon: 'trash',
                                danger: true,
                                onSelect: () => setArsivlenecek(p),
                              },
                              {
                                label: 'Projeyi Düzenle',
                                icon: 'pencil',
                                onSelect: () => setDuzenlenecek(p),
                              },
                            ]}
                          />
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

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
            <Button variant="danger" icon="trash" onClick={() => setArsivlenecek(null)}>
              Arşivle
            </Button>
          </>
        }
      >
        <p className="text-[14px] leading-6 text-foreground">
          <strong>{arsivlenecek?.ad}</strong> projesi arşive taşınacak. Arşivlenen proje listelerde görünmez ve ihale
          paketleri üzerinde işlem yapılamaz.
        </p>
      </Modal>
    </>
  )
}
