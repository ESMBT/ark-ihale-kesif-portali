import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { Icon } from '../../components/ui/Icon'
import { PillTabs } from '../../components/ui/PillTabs'
import { IconButton } from '../../components/ui/Shell'
import { AKIF_KULLANICI_ID, SANTIYECI_PERSONEL_ID } from '../../data/mock'
import { useStore } from '../../data/store'
import type { IhalePaketi } from '../../data/types'
import { BOS_KESIF, useKesifDogrulama } from '../../lib/kesifDogrulama'
import { modulYolu } from '../../lib/modul'
import { IhaleOzeti } from '../packages/IhaleOzeti'
import { FirmaOnerSekmesi } from '../packages/FirmaOnerSekmesi'
import { PackageDocumentsTab } from '../packages/PackageDocumentsTab'
import { PackagePublishModal } from '../packages/PackagePublishModal'
import { yayinKapisiHesapla } from '../../lib/yayinKapisi'
import { YayinlaDugmesi } from '../packages/YayinKapisi'

/* =================================================================
   ŞANTIYECİ MODÜLÜ — İhale paketi detayı
   -----------------------------------------------------------------
   Yalnızca 4 sekme: İhale Özeti · Belgeler · Keşif · Alt Yüklenici Firma Öneri
   İhale Yönetimi / Mukayeseli Karşılaştırma / Dashboard / Soru-Cevap
   şantiyeci modülünde görünmez.
   ================================================================= */

export function SantiyeciPackageDetailPage() {
  const { id, paketId } = useParams()
  const navigate = useNavigate()
  const { projeGetir, paketGetir, paketKlasorEkle, paketKlasorYenidenAdlandir, paketYayinla } =
    useStore()

  const proje = id ? projeGetir(id) : undefined
  const paket = id && paketId ? paketGetir(id, paketId) : undefined
  const [sekme, setSekme] = useState('ihale-ozeti')
  const [yayinOnizleme, setYayinOnizleme] = useState(false)
  // F5: yayın kapısı — kaydedilmiş keşif satırlarının doğrulaması (kurallar backend'de)
  // Keşif proje düzeyindedir (Proje → Keşif sekmesi); paket şimdilik projenin keşfini okur
  const kesifDogrulama = useKesifDogrulama(proje?.keşif ?? BOS_KESIF)
  const yayinKapisi = yayinKapisiHesapla(
    kesifDogrulama,
    proje ? (proje.keşif ?? []).filter((s) => !s.yorum && s.seviye !== 1).length : undefined,
  )
  /** Projenin Keşif sekmesine gider (keşif hataları / boş keşif orada düzeltilir) */
  const kesifeGit = () => {
    if (proje) navigate(`${modulYolu('santiyeci', `/projeler/${proje.id}`)}?sekme=kesif`)
  }

  /* Erişim — yalnızca şantiyecinin kendi paketleri */
  const erisimVar = paket
    ? paket.sorumluId === SANTIYECI_PERSONEL_ID || paket.olusturanId === AKIF_KULLANICI_ID
    : false

  if (!proje || !paket) {
    return (
      <Card>
        <div className="flex flex-col items-center gap-3 py-10 text-center">
          <Icon name="search" size={28} className="text-gray" />
          <h4>İhale paketi bulunamadı</h4>
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
          <h4>Bu pakete erişiminiz yok</h4>
          <p className="max-w-md text-[13px] leading-5 text-muted-foreground">
            Yalnızca size atanmış veya kendinizin oluşturduğu ihale paketlerini görüntüleyebilirsiniz.
          </p>
          <Button
            variant="secondary"
            icon="arrow-left"
            onClick={() => navigate(modulYolu('santiyeci', `/projeler/${proje.id}`))}
          >
            Projeye dön
          </Button>
        </div>
      </Card>
    )
  }

  return (
    <>
      {/* Breadcrumb */}
      <div className="mb-6 flex flex-wrap items-center gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <Link
            to={modulYolu('santiyeci', `/projeler/${proje.id}`)}
            className="text-[15px] font-bold tracking-wide text-muted-foreground uppercase hover:text-black"
          >
            {proje.ad}
          </Link>
          <span className="text-[15px] text-gray">/</span>
          <h2 className="font-heading text-[24px] leading-8 font-bold text-black">{paket.ad}</h2>
        </div>

        <div className="ml-auto flex items-center gap-2">
          {paket.yayinDurumu === 'yayinda' ? (
            <Badge tone="success" size="sm" dot>
              Yayında
            </Badge>
          ) : (
            <YayinlaDugmesi
              kapi={yayinKapisi}
              onYayinla={() => setYayinOnizleme(true)}
              onKesifeGit={kesifeGit}
              onTekrar={kesifDogrulama.yenile}
            />
          )}
          <IconButton icon="refresh" label="Geri al" tone="brand" size="lg" />
        </div>
      </div>

      {/* Pill sekmeler — şantiyeci modülünde 4 sekme */}
      <div className="mb-6">
        <PillTabs
          active={sekme}
          onChange={setSekme}
          items={[
            { key: 'ihale-ozeti', label: 'İhale Özeti' },
            { key: 'belgeler', label: 'Belgeler' },
            { key: 'firma-oneri', label: 'Alt Yüklenici Firma Öneri' },
          ]}
        />
      </div>

      {sekme === 'ihale-ozeti' && (
        <div className="space-y-5">
          <IhaleOzeti alanlar={paket.alanlar ?? {}} />
        </div>
      )}

      {sekme === 'belgeler' && (
        <PackageDocumentsTab
          paket={paket}
          klasorler={paket.klasorler ?? []}
          onKlasorEkle={(ad) => paketKlasorEkle(proje.id, paket.id, ad)}
          onKlasorYenidenAdlandir={(kid, ad) => paketKlasorYenidenAdlandir(proje.id, paket.id, kid, ad)}
        />
      )}

      {sekme === 'firma-oneri' && <FirmaOnerSekmesi proje={proje} paket={paket} />}

      {/* Yayınlama — yalnızca şantiyeci modülünde */}
      <PackagePublishModal
        open={yayinOnizleme}
        paket={paket}
        kesifKapisi={yayinKapisi}
        onKesifeGit={() => {
          setYayinOnizleme(false)
          kesifeGit()
        }}
        onClose={() => setYayinOnizleme(false)}
        onYayinla={() => paketYayinla(proje.id, paket.id)}
      />
    </>
  )
}

export type { IhalePaketi }
