import { useMemo, useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { Icon } from '../../components/ui/Icon'
import { Input } from '../../components/ui/Field'
import { Modal } from '../../components/ui/Modal'
import { RowMenu } from '../../components/ui/RowMenu'
import { StatusSelect, toneToPill } from '../../components/ui/Shell'
import { AKIF_KULLANICI_ID, SANTIYECI_PERSONEL_ID } from '../../data/mock'
import { paketDurumlari, paketDurumListesi } from '../../data/ihaleDurumlari'
import { useStore } from '../../data/store'
import type { IhalePaketi } from '../../data/types'
import { bilgiDurumu } from '../../lib/proje'
import { sozlesmeTuruBul } from '../../data/sozlesmeTurleri'
import { modulYolu } from '../../lib/modul'
import { PackageCreateModal } from '../packages/PackageCreateModal'
import { TakeoffTable } from '../packages/TakeoffTable'
import { PackagePublishModal } from '../packages/PackagePublishModal'
import { ProjectEditModal, ProjectInfoSummary } from '../projects/ProjectEditModal'

/* =================================================================
   ŞANTIYECİ MODÜLÜ — Proje detayı
   -----------------------------------------------------------------
   Sekmeler: İhale Paketleri · Keşif · Dokümanlar · Dashboard · Proje Bilgileri
   İhale paketleri yalnızca şantiyecinin kendi paketlerini gösterir
   (sorumlu olduğu veya kendisinin oluşturduğu).
   Yayınla / Sil yalnızca bu modüldedir; paket yalnızca taslak iken silinebilir.
   ================================================================= */

const sekmeler = [
  { key: 'paketler', label: 'İhale Paketleri' },
  { key: 'kesif', label: 'Keşif' },
  { key: 'dokumanlar', label: 'Dokümanlar' },
  { key: 'dashboard', label: 'Dashboard' },
  { key: 'proje-bilgileri', label: 'Proje Bilgileri' },
]

export function SantiyeciProjectDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const {
    projeGetir,
    santiyeciProjeler,
    paketEkle,
    paketGuncelle,
    paketSil,
    paketYayinla,
    paketDurum,
    kartGuncelle,
    projeKesifGuncelle,
    projeArsivle,
  } = useStore()

  const proje = id ? projeGetir(id) : undefined
  // Başka sayfalardan `?sekme=kesif` ile doğrudan bir sekmede açılabilir
  const [aramaParametreleri] = useSearchParams()
  const [sekme, setSekme] = useState(() => {
    const istenen = aramaParametreleri.get('sekme')
    return sekmeler.some((s) => s.key === istenen) ? (istenen as string) : 'paketler'
  })
  const [arama, setArama] = useState('')
  const [olusturOpen, setOlusturOpen] = useState(false)
  const [duzenlenen, setDuzenlenen] = useState<IhalePaketi | null>(null)
  const [silinecek, setSilinecek] = useState<IhalePaketi | null>(null)
  const [yayinlanan, setYayinlanan] = useState<IhalePaketi | null>(null)
  const [duzenleModal, setDuzenleModal] = useState(false)
  const [arsivModal, setArsivModal] = useState(false)

  /* Erişim kapsamı — şantiyeci yalnızca kendi projelerini görür */
  const erisimVar = proje ? santiyeciProjeler.some((p) => p.id === proje.id) : false

  /** Şantiyecinin kendi paketleri */
  const paketler = useMemo(() => {
    const q = arama.trim().toLocaleLowerCase('tr')
    return (proje?.paketler ?? [])
      .filter(
        (k) => k.sorumluId === SANTIYECI_PERSONEL_ID || k.olusturanId === AKIF_KULLANICI_ID,
      )
      .filter((k) => !q || k.ad.toLocaleLowerCase('tr').includes(q))
  }, [proje, arama])

  if (!proje) {
    return (
      <Card>
        <div className="flex flex-col items-center gap-3 py-10 text-center">
          <Icon name="search" size={28} className="text-gray" />
          <h4>Proje bulunamadı</h4>
          <Button
            variant="secondary"
            icon="arrow-left"
            onClick={() => navigate(modulYolu('santiyeci', '/projeler'))}
          >
            Projelerim listesine dön
          </Button>
        </div>
      </Card>
    )
  }

  if (!erisimVar) {
    return (
      <Card>
        <div className="flex flex-col items-center gap-3 py-12 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-surface-muted text-ink">
            <Icon name="lock" size={22} />
          </span>
          <h4>Bu projeye erişiminiz yok</h4>
          <p className="max-w-md text-[13px] leading-5 text-muted-foreground">
            Yalnızca size atanmış veya kendinizin oluşturduğu projeleri görüntüleyebilirsiniz.
          </p>
          <Button
            variant="secondary"
            icon="arrow-left"
            onClick={() => navigate(modulYolu('santiyeci', '/projeler'))}
          >
            Projelerim listesine dön
          </Button>
        </div>
      </Card>
    )
  }

  const paketYolu = (paketId: string) =>
    modulYolu('santiyeci', `/projeler/${proje.id}/paket/${paketId}`)

  return (
    <>
      {/* Başlık */}
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <h2 className="font-heading text-[30px] leading-10 font-bold text-black">{proje.ad}</h2>
      </div>

      {/* Sekmeler */}
      <div className="mb-6 flex flex-wrap items-center gap-x-7 gap-y-3 border-b border-line">
        {sekmeler.map((s) => (
          <button
            key={s.key}
            onClick={() => setSekme(s.key)}
            className={`-mb-px border-b-2 pb-3 text-[15px] leading-5 transition-colors ${
              sekme === s.key
                ? 'border-warning font-bold text-black'
                : 'border-transparent text-ink hover:text-black'
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* ---------------- İhale Paketleri ---------------- */}
      {sekme === 'paketler' && (
        <Card padded={false}>
          <div className="flex flex-wrap items-center gap-3 border-b border-line px-5 py-3">
            <div className="relative min-w-[260px] flex-1">
              <Icon
                name="search"
                size={16}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray"
              />
              <Input
                value={arama}
                onChange={(e) => setArama(e.target.value)}
                placeholder="İhale adı ile ara..."
                className="h-9 pl-9 text-[14px]"
              />
            </div>
            <Button variant="brand" size="sm" icon="plus" onClick={() => setOlusturOpen(true)}>
              Yeni İhale Paketi Oluştur
            </Button>
          </div>

          {paketler.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-14 text-center">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-surface-muted text-ink">
                <Icon name="package" size={22} />
              </span>
              <h4>İhale paketi bulunamadı</h4>
              <p className="max-w-sm text-[13px] leading-5 text-muted-foreground">
                Size ait paketler burada listelenir. “Yeni İhale Paketi Oluştur” butonuyla yeni bir paket ekleyin.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-[14px]">
                <thead>
                  <tr className="border-b border-line bg-surface-muted">
                    {['İhale Paketi', 'Sözleşme Türü', 'Durum', 'Alan Durumu', ''].map((h, i) => (
                      <th
                        key={h}
                        className={`px-5 py-3 text-[12px] font-bold uppercase tracking-wide text-muted-foreground ${
                          i === 4 ? 'text-right' : 'text-left'
                        }`}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {paketler.map((k) => {
                    const bilgi = bilgiDurumu(k)
                    return (
                      <tr key={k.id} className="border-b border-line last:border-0 hover:bg-surface-muted">
                        <td className="px-5 py-4">
                          <span className="block font-bold text-black">{k.ad}</span>
                          <span className="mt-0.5 block text-[12px] text-muted-foreground">
                            {k.belgeler.length} belge
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <span className="text-foreground">{sozlesmeTuruBul(k.sozlesmeTuru).ad}</span>
                        </td>
                        <td className="px-5 py-4">
                          <StatusSelect
                            label={paketDurumlari[k.durum].kisa}
                            tone={toneToPill(paketDurumlari[k.durum].tone)}
                            options={paketDurumListesi.map((d) => ({
                              value: d,
                              label: paketDurumlari[d].label,
                            }))}
                            onSelect={(value) =>
                              paketDurum(proje.id, k.id, value as IhalePaketi['durum'])
                            }
                          />
                        </td>
                        <td className="px-5 py-4">
                          {bilgi.tamam ? (
                            <span className="text-[13px] font-medium text-success">Eksik alan yok</span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-warning-soft px-3 py-1.5 text-[13px] font-medium text-warning">
                              <Icon name="alert-triangle" size={13} />
                              Eksik ({bilgi.eksikSayisi})
                            </span>
                          )}
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="brand"
                              size="sm"
                              icon="open"
                              onClick={() => navigate(paketYolu(k.id))}
                            >
                              Aç
                            </Button>
                            <RowMenu
                              items={[
                                {
                                  label: 'İhale Paketini Düzenle',
                                  icon: 'pencil',
                                  onSelect: () => setDuzenlenen(k),
                                },
                                {
                                  label: 'İhale Paketini Yayınla',
                                  icon: 'send',
                                  onSelect: () => setYayinlanan(k),
                                },
                                {
                                  label: 'İhale Paketini Sil',
                                  icon: 'trash',
                                  danger: true,
                                  disabled: k.durum !== 'taslak',
                                  onSelect: () => setSilinecek(k),
                                },
                              ]}
                              label="İhale paketi işlemleri"
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
      )}

      {/* ---------------- Proje Bilgileri ---------------- */}
      {sekme === 'proje-bilgileri' && (
        <Card padded={false}>
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-5 py-4">
            <h4 className="text-[17px] leading-6">Proje Bilgileri</h4>
            <div className="flex items-center gap-2">
              <Button variant="secondary" size="sm" icon="trash" onClick={() => setArsivModal(true)}>
                Projeyi Arşivle
              </Button>
              <Button variant="secondary" size="sm" icon="pencil" onClick={() => setDuzenleModal(true)}>
                Projeyi Düzenle
              </Button>
            </div>
          </div>
          <div className="px-5 py-5">
            <ProjectInfoSummary proje={proje} />
          </div>
        </Card>
      )}

      {/* ---------------- Diğer sekmeler ---------------- */}
      {/* ---------------- Keşif (proje düzeyinde) ---------------- */}
      {sekme === 'kesif' && (
        <TakeoffTable
          kaynak={{
            id: proje.id,
            ad: proje.ad,
            keşif: proje.keşif ?? [],
            kesifSutunlari: proje.kesifSutunlari,
            kesifSutunFormulleri: proje.kesifSutunFormulleri,
          }}
          onKaydet={(satirlar, ekSutunlar, formuller) => projeKesifGuncelle(proje.id, satirlar, ekSutunlar, formuller)}
        />
      )}

      {sekme !== 'paketler' && sekme !== 'proje-bilgileri' && sekme !== 'kesif' && (
        <Card>
          <div className="flex flex-col items-center gap-3 py-14 text-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-surface-muted text-ink">
              <Icon
                name={
                  sekme === 'kesif'
                    ? 'ruler'
                    : sekme === 'dokumanlar'
                      ? 'folder'
                      : 'trending-up'
                }
                size={22}
              />
            </span>
            <h4>{sekmeler.find((s) => s.key === sekme)?.label}</h4>
            <p className="max-w-md text-[13px] leading-5 text-muted-foreground">
              Bu sekmenin içeriği ikinci aşamada tasarlanacak.
            </p>
            <Button variant="secondary" icon="arrow-left" onClick={() => setSekme('paketler')}>
              İhale Paketleri sekmesine dön
            </Button>
          </div>
        </Card>
      )}

      {/* ---------------- Yeni İhale Paketi ---------------- */}
      <PackageCreateModal
        open={olusturOpen}
        onClose={() => setOlusturOpen(false)}
        onSubmit={(ad, isTipi, alanlar) => {
          paketEkle(proje.id, ad, isTipi, alanlar)
          setOlusturOpen(false)
          setSekme('paketler')
        }}
      />

      {/* ---------------- İhale Paketini Düzenle ---------------- */}
      <PackageCreateModal
        open={!!duzenlenen}
        onClose={() => setDuzenlenen(null)}
        paket={duzenlenen ?? undefined}
        onSubmit={(ad, isTipi, alanlar) => {
          if (duzenlenen) paketGuncelle(proje.id, duzenlenen.id, { ad, isTipi, alanlar })
          setDuzenlenen(null)
        }}
      />

      {/* ---------------- Projeyi Düzenle ---------------- */}
      <ProjectEditModal
        open={duzenleModal}
        proje={proje}
        onClose={() => setDuzenleModal(false)}
        onKaydet={(kart) => kartGuncelle(proje.id, kart)}
      />

      {/* ---------------- İhale Paketini Yayınla ---------------- */}
      <PackagePublishModal
        open={!!yayinlanan}
        paket={yayinlanan}
        onClose={() => setYayinlanan(null)}
        onYayinla={() => {
          if (yayinlanan) paketYayinla(proje.id, yayinlanan.id)
        }}
      />

      {/* ---------------- İhale Paketini Sil ---------------- */}
      <Modal
        open={!!silinecek}
        onClose={() => setSilinecek(null)}
        title="İhale Paketini Sil"
        description={silinecek?.ad}
        footer={
          <>
            <Button variant="ghost" onClick={() => setSilinecek(null)}>
              Vazgeç
            </Button>
            <Button
              variant="danger"
              icon="trash"
              onClick={() => {
                if (silinecek) paketSil(proje.id, silinecek.id)
                setSilinecek(null)
              }}
            >
              Paketi Sil
            </Button>
          </>
        }
      >
        <p className="text-[14px] leading-6 text-foreground">
          <strong>{silinecek?.ad}</strong> ihale paketi kalıcı olarak silinecek. Bu işlem geri alınamaz.
        </p>
      </Modal>

      {/* ---------------- Projeyi Arşivle ---------------- */}
      <Modal
        open={arsivModal}
        onClose={() => setArsivModal(false)}
        title="Projeyi Arşivle"
        description={proje.ad}
        footer={
          <>
            <Button variant="ghost" onClick={() => setArsivModal(false)}>
              Vazgeç
            </Button>
            <Button
              variant="danger"
              icon="trash"
              onClick={() => {
                projeArsivle(proje.id)
                setArsivModal(false)
                navigate(modulYolu('santiyeci', '/projeler'))
              }}
            >
              Arşivle
            </Button>
          </>
        }
      >
        <p className="text-[14px] leading-6 text-foreground">
          <strong>{proje.ad}</strong> projesi arşive taşınacak. Arşivlenen proje “Projelerim” listesinde
          görünmez; “Arşivlenenler” bölümünden geri alınabilir.
        </p>
      </Modal>
    </>
  )
}
