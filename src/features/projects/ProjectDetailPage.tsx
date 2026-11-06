import { useMemo, useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { EntityCard } from '../../components/ui/EntityCard'
import { Icon } from '../../components/ui/Icon'
import { Input } from '../../components/ui/Field'
import { Modal } from '../../components/ui/Modal'
import { RowMenu } from '../../components/ui/RowMenu'
import { Avatar, StatusSelect, toneToPill } from '../../components/ui/Shell'
import { personeller } from '../../data/mock'
import { bilgiDurumu } from '../../lib/proje'
import { sozlesmeTuruBul } from '../../data/sozlesmeTurleri'
import { paketDurumlari, paketDurumListesi } from '../../data/ihaleDurumlari'
import { useStore } from '../../data/store'
import type { IhalePaketi } from '../../data/types'
import { PackageCreateModal } from '../packages/PackageCreateModal'
import { TakeoffTable } from '../packages/TakeoffTable'
import { PackagePublishModal } from '../packages/PackagePublishModal'
import { modulYolu } from '../../lib/modul'
import { ProjectEditModal, ProjectInfoSummary } from './ProjectEditModal'

const sekmeler = [
  { key: 'paketler', label: 'İhale Paketleri' },
  { key: 'kesif', label: 'Keşif' },
  { key: 'dokumanlar', label: 'Dokümanlar' },
  { key: 'dashboard', label: 'Dashboard' },
  { key: 'proje-bilgileri', label: 'Proje Bilgileri' },
]

export function ProjectDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { projeGetir, goruntulenenProjeler, paketEkle, paketGuncelle, paketSil, paketYayinla, paketDurum, kartGuncelle, projeKesifGuncelle } = useStore()

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
  const [duzenleModal, setDuzenleModal] = useState(false)
  const [yayinlanan, setYayinlanan] = useState<IhalePaketi | null>(null)

  const paketler = useMemo(() => {
    const q = arama.trim().toLocaleLowerCase('tr')
    return (proje?.paketler ?? []).filter((k) => !q || k.ad.toLocaleLowerCase('tr').includes(q))
  }, [proje, arama])

  if (!proje) {
    return (
      <Card>
        <div className="flex flex-col items-center gap-3 py-10 text-center">
          <Icon name="search" size={28} className="text-gray" />
          <h4>Proje bulunamadı</h4>
          <Button variant="secondary" icon="arrow-left" onClick={() => navigate(modulYolu('ihale', '/projeler'))}>
            Proje listesine dön
          </Button>
        </div>
      </Card>
    )
  }

  /* Erişim kapsamı: şantiyeci yalnızca kendine atanmış/oluşturmuş projeleri görebilir */
  if (!goruntulenenProjeler.some((p) => p.id === proje.id)) {
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
          <Button variant="secondary" icon="arrow-left" onClick={() => navigate(modulYolu('ihale', '/projeler'))}>
            Proje listesine dön
          </Button>
        </div>
      </Card>
    )
  }

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
                Arama metnini değiştirin veya “Yeni İhale Paketi Oluştur” butonuyla yeni bir paket ekleyin.
              </p>
            </div>
          ) : (
            <div className="space-y-4 p-5">
              {paketler.map((k) => {
                const alanSayisi = Object.keys(k.alanlar ?? {}).filter((a) => k.alanlar?.[a]).length
                const bilgi = bilgiDurumu(k)
                return (
                  <EntityCard
                    key={k.id}
                    title={k.ad}
                    badges={
                      <>
                        {/* Eksik alan uyarısı — yalnızca eksik varsa görünür */}
                        {!bilgi.tamam && (
                          <span
                            className="inline-flex items-center gap-1.5 rounded-full bg-warning-soft px-3 py-1.5 text-[13px] font-medium text-warning"
                            title={`Eksik alanlar: ${bilgi.eksik.map((e) => e.ad).join(', ')}`}
                          >
                            <Icon name="alert-triangle" size={13} />
                            Eksik ({bilgi.eksikSayisi})
                          </span>
                        )}

                        {/* Paket durumu (yayın akışı): Taslak · Yayınlandı · Hold · İptal · Sözleşme İmzalandı */}
                        <StatusSelect
                          label={paketDurumlari[k.durum].kisa}
                          tone={toneToPill(paketDurumlari[k.durum].tone)}
                          options={paketDurumListesi.map((d) => ({ value: d, label: paketDurumlari[d].label }))}
                          onSelect={(value) => paketDurum(proje.id, k.id, value as IhalePaketi['durum'])}
                        />

                        {k.seciliFirma && (
                          <span className="inline-flex items-center gap-2 rounded-lg bg-surface-muted px-3 py-1.5 text-[13px]">
                            <Icon name="user" size={14} className="text-gray" />
                            Seçilen <span className="font-bold">1</span>
                          </span>
                        )}
                      </>
                    }
                    actions={
                      <>
                        <Button
                          variant="brand"
                          size="sm"
                          icon="open"
                          onClick={() => navigate(modulYolu('ihale', `/projeler/${proje.id}/paket/${k.id}`))}
                        >
                          Aç
                        </Button>
                        <RowMenu
                          items={[
                            { label: 'İhale Paketini Düzenle', icon: 'pencil', onSelect: () => setDuzenlenen(k) },
                            { label: 'İhale Paketini Yayınla', icon: 'send', onSelect: () => setYayinlanan(k) },
                            {
                              label: 'İhale Paketini Sil',
                              icon: 'trash',
                              danger: true,
                              onSelect: () => setSilinecek(k),
                            },
                          ]}
                          label="İhale paketi işlemleri"
                        />
                      </>
                    }
                    detail={
                      <>
                      {!bilgi.tamam && (
                        <div className="col-span-2 rounded-xl border border-warning/30 bg-warning-soft px-4 py-3 lg:col-span-5">
                          <p className="flex items-center gap-1.5 text-[13px] font-bold text-warning">
                            <Icon name="alert-triangle" size={14} />
                            {bilgi.eksikSayisi} eksik alan — paket tamamlanmadan yayınlanamaz
                          </p>
                          <p className="mt-1 text-[12px] text-ink">
                            {bilgi.eksik.map((e) => e.ad).join(' · ')}
                          </p>
                        </div>
                      )}

                      <div className="grid grid-cols-2 gap-6 lg:grid-cols-5">
                        <Alan etiket="Sözleşme türü" deger={sozlesmeTuruBul(k.sozlesmeTuru).ad} />
                        <Alan etiket="Sorumlu" deger={sorumluAd(k.sorumluId)} />
                        <Alan etiket="Çalışma tipi" deger={k.isTipi} />
                        <Alan etiket="Doldurulan alan" deger={`${alanSayisi} alan`} />
                        <Alan etiket="Belge" deger={`${k.belgeler.length} dosya`} />
                        <Alan
                          etiket="Seçilen firma"
                          deger={
                            k.seciliFirma ? (
                              <span className="inline-flex items-center gap-2">
                                <Avatar
                                  initials={k.seciliFirma.split(' ').map((w) => w[0]).join('').slice(0, 2)}
                                  size={26}
                                  tone="orange"
                                />
                                <span className="truncate">{k.seciliFirma}</span>
                              </span>
                            ) : (
                              'Seçilmedi'
                            )
                          }
                        />
                      </div>
                      </>
                    }
                  />
                )
              })}
            </div>
          )}
        </Card>
      )}

      {/* ---------------- Proje Bilgileri ---------------- */}
      {sekme === 'proje-bilgileri' && (
        <Card padded={false}>
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-5 py-4">
            <div>
              <h4 className="text-[17px] leading-6">Proje Bilgileri</h4>
            </div>
            <Button variant="secondary" size="sm" icon="pencil" onClick={() => setDuzenleModal(true)}>
              Projeyi Düzenle
            </Button>
          </div>
          <div className="px-5 py-5">
            <ProjectInfoSummary proje={proje} />
          </div>
        </Card>
      )}

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

      {/* ---------------- Diğer sekmeler ---------------- */}
      {sekme !== 'paketler' && sekme !== 'proje-bilgileri' && sekme !== 'kesif' && (
        <Card>
          <div className="flex flex-col items-center gap-3 py-14 text-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-surface-muted text-ink">
              <Icon
                name={
                  sekme === 'kesif'
                    ? 'ruler'
                    : sekme === 'kesif-ozeti'
                      ? 'scale'
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
          <strong>{silinecek?.ad}</strong> ihale paketi silinecek. Paket içindeki keşif, belge ve alt yüklenici
          kayıtları da silinir.
        </p>
      </Modal>
    </>
  )
}

function sorumluAd(id?: string): string {
  if (!id) return '—'
  const p = personeller.find((x) => x.id === id)
  return p ? p.ad : '—'
}

function Alan({ etiket, deger }: { etiket: string; deger: React.ReactNode }) {
  return (
    <div className="min-w-0">
      <p className="text-[12px] font-bold tracking-wide text-muted-foreground uppercase">{etiket}</p>
      <p className="mt-1 truncate text-[15px] text-foreground">{deger}</p>
    </div>
  )
}
