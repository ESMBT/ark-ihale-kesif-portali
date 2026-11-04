import { useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { Icon } from '../../components/ui/Icon'
import { PillTabs } from '../../components/ui/PillTabs'
import { IconButton } from '../../components/ui/Shell'
import { Badge } from '../../components/ui/Badge'
import { useStore } from '../../data/store'
import type { IhalePaketi } from '../../data/types'
import { InviteCompaniesTab } from './InviteCompaniesTab'
import { PackageDocumentsTab } from './PackageDocumentsTab'
import { TakeoffTable } from './TakeoffTable'
import { TenderManagementPanel } from './TenderManagementPanel'
import { QuestionAnswerTab } from './QuestionAnswerTab'
import { IhaleOzeti } from './IhaleOzeti'
import { FirmaOnerModal } from './FirmaOnerModal'
import { PackagePublishModal } from './PackagePublishModal'

export function PackageDetailPage() {
  const { id, paketId } = useParams()
  const navigate = useNavigate()
  const { projeGetir, paketGetir, keşifGuncelle, altYukleniciKaldir, altYukleniciDavetEt, ihaleAksiyonu, paketYayinla, paketOnayaGonder, paketOnayTamamla, paketYaklasikBedel, paketKlasorEkle, paketKlasorYenidenAdlandir, soruEkle, soruCevapla, paketRevize } =
    useStore()

  const proje = id ? projeGetir(id) : undefined
  const paket = id && paketId ? paketGetir(id, paketId) : undefined
  const [sekme, setSekme] = useState('genel')
  const [goruntulenenTur, setGoruntulenenTur] = useState<number>(1)
  const [revizeModal, setRevizeModal] = useState(false)
  const [yayinOnizleme, setYayinOnizleme] = useState(false)
  const [gerekce, setGerekce] = useState('')

  if (!proje || !paket) {
    return (
      <Card>
        <div className="flex flex-col items-center gap-3 py-10 text-center">
          <Icon name="search" size={28} className="text-gray" />
          <h4>İhale paketi bulunamadı</h4>
          <Button variant="secondary" icon="arrow-left" onClick={() => navigate('/projeler')}>
            Proje listesine dön
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
            to={`/projeler/${proje.id}`}
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
            <Button variant="brand" icon="send" onClick={() => setYayinOnizleme(true)}>
              Yayınla
            </Button>
          )}
          <IconButton icon="refresh" label="Geri al" tone="brand" size="lg" />
        </div>
      </div>

      {/* Pill sekmeler */}
      <div className="mb-6">
        <PillTabs
          active={sekme}
          onChange={setSekme}
          items={[
            { key: 'genel', label: 'Genel Bakış' },
            { key: 'belgeler', label: 'Belgeler' },
            { key: 'kesif', label: 'Keşif' },
            { key: 'firmalar', label: 'Alt Yüklenici Yönetimi' },
            { key: 'mukayese', label: 'Mukayeseli Karşılaştırma' },
            { key: 'ihale-yonetimi', label: 'İhale Yönetimi' },
            { key: 'dashboard', label: 'Dashboard' },
            { key: 'soru-cevap', label: 'Soru/Cevap' },
          ]}
        />
      </div>

      {sekme === 'genel' && <PaketGenelBakis proje={proje} paket={paket} />}
      {sekme === 'kesif' && (
        <TakeoffTable paket={paket} onKaydet={(satirlar) => keşifGuncelle(proje.id, paket.id, satirlar)} />
      )}
      {sekme === 'belgeler' && (
        <PackageDocumentsTab
          paket={paket}
          klasorler={paket.klasorler ?? []}
          onKlasorEkle={(ad) => paketKlasorEkle(proje.id, paket.id, ad)}
          onKlasorYenidenAdlandir={(id, ad) => paketKlasorYenidenAdlandir(proje.id, paket.id, id, ad)}
        />
      )}
      {sekme === 'ihale-yonetimi' &&
        (paket.ihale ? (
          <TenderManagementPanel
            ihale={paket.ihale}
            goruntulenenTur={goruntulenenTur}
            onTurSec={setGoruntulenenTur}
            onDurumDegistir={(durum) => {
              if (!paket.ihale) return
              ihaleAksiyonu(proje.id, paket.id, { ...paket.ihale, durum })
            }}
            onAksiyon={(ihale) => ihaleAksiyonu(proje.id, paket.id, ihale)}
          />
        ) : (
          <Card>
            <div className="flex flex-col items-center gap-3 py-14 text-center">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-surface-muted text-ink">
                <Icon name="gavel" size={22} />
              </span>
              <h4>İhale Yönetimi</h4>
              <p className="max-w-md text-[13px] leading-5 text-muted-foreground">
                Bu ihale paketi için ihale süreci henüz başlatılmadı.
              </p>
            </div>
          </Card>
        ))}

      {sekme === 'soru-cevap' && (
        <QuestionAnswerTab
          sorular={paket.sorular ?? []}
          onSoruEkle={(soru, soran) => soruEkle(proje.id, paket.id, soru, soran)}
          onCevapla={(soruId, cevap) => soruCevapla(proje.id, paket.id, soruId, cevap, 'Onur Taş — Teklif & İhale Ekibi')}
        />
      )}

      {(sekme === 'mukayese' || sekme === 'dashboard') && (
        <Card>
          <div className="flex flex-col items-center gap-3 py-14 text-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-surface-muted text-ink">
              <Icon name={sekme === 'mukayese' ? 'scale' : 'trending-up'} size={22} />
            </span>
            <h4>{sekme === 'mukayese' ? 'Mukayeseli Karşılaştırma' : 'Dashboard'}</h4>
            <p className="max-w-md text-[13px] leading-5 text-muted-foreground">
              Bu sekmenin içeriği ikinci aşamada tasarlanacak.
            </p>
          </div>
        </Card>
      )}

      {sekme === 'firmalar' && (
        <InviteCompaniesTab
          proje={{ kart: proje.kart, ihaleEkipAtanan: proje.ihaleEkipAtanan }}
          paket={paket}
          onKaldir={(firmaId) => altYukleniciKaldir(proje.id, paket.id, firmaId)}
          onDavet={(firmaId) => altYukleniciDavetEt(proje.id, paket.id, firmaId)}
          onOnayaGonder={(firma, onaylayanlar) => paketOnayaGonder(proje.id, paket.id, firma, onaylayanlar)}
          onOnayTamamla={(onayId) => paketOnayTamamla(proje.id, paket.id, onayId)}
          onYaklasikBedel={(deger) => paketYaklasikBedel(proje.id, paket.id, deger)}
        />
      )}

      {/* Yayınlama */}
      <PackagePublishModal
        open={yayinOnizleme}
        paket={paket}
        onClose={() => setYayinOnizleme(false)}
        onYayinla={() => paketYayinla(proje.id, paket.id)}
      />

      {/* Revize modalı */}
      {revizeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/45" onClick={() => setRevizeModal(false)} aria-hidden />
          <div className="relative z-10 w-full max-w-lg overflow-hidden rounded-2xl bg-surface shadow-lg">
            <div className="border-b border-line px-5 py-4">
              <h4 className="text-[18px] leading-6">Revize İste</h4>
            </div>
            <div className="px-5 py-4">
              <textarea
                value={gerekce}
                onChange={(e) => setGerekce(e.target.value)}
                placeholder="Örn. Keşif poz tanımları 3 satırda eksik."
                className="min-h-28 w-full rounded-xl border border-line px-4 py-3 text-[14px] outline-none placeholder:text-gray focus:border-black"
              />
            </div>
            <div className="flex justify-end gap-2 border-t border-line bg-surface-muted px-5 py-4">
              <Button variant="ghost" onClick={() => setRevizeModal(false)}>
                Vazgeç
              </Button>
              <Button
                variant="danger"
                icon="rotate-ccw"
                disabled={!gerekce.trim()}
                onClick={() => {
                  paketRevize(proje.id, paket.id, gerekce.trim())
                  setRevizeModal(false)
                  setGerekce('')
                }}
              >
                Revize Talebi Gönder
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

/* ---------------------------------------------------------------- */

function PaketGenelBakis({
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

  return (
    <div className="space-y-5">
      {/* İhale özeti — solda alan adları, sağda değerleri */}
      <IhaleOzeti alanlar={paket.alanlar ?? {}} />

      {/* Firma önerisi (şantiyeci tarafı) */}
      <Card padded={false}>
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-5 py-4">
          <h4 className="text-[17px] leading-6">Firma Öner</h4>
          <Button variant="secondary" size="sm" icon="plus" onClick={() => setOnerModal(true)}>
            Firma Öner
          </Button>
        </div>

        {(paket.onerilenFirmalar ?? []).length === 0 ? (
          <p className="px-5 py-8 text-center text-[13px] text-muted-foreground">
            Önerilen firma yok.
          </p>
        ) : (
          <ul className="divide-y divide-border">
            {(paket.onerilenFirmalar ?? []).map((a) => (
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
    </div>
  )
}
