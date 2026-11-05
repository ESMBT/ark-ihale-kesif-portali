import { useMemo, useState } from 'react'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Icon } from '../../components/ui/Icon'
import type { KesifSatiri } from '../../data/types'
import { ALAN_SUTUNU, type DogrulamaDurumu, type DogrulamaSorunu } from '../../lib/kesifDogrulama'

/**
 * "BOQ'u Kontrol Et" şeridi (F2): doğrulama sonucunu tablonun üstünde özetler,
 * sorun listesini açar ve bir soruna tıklayınca tabloda ilgili hücreye götürür.
 * Kurallar backend'dedir; bu bileşen yalnızca gösterir.
 */
export function DogrulamaSeridi({
  durum,
  satirlar,
  onSatiraGit,
  onDuzelt,
  duzeltiliyor = null,
  duzeltPasif = false,
}: {
  durum: DogrulamaDurumu
  satirlar: KesifSatiri[]
  onSatiraGit: (rowId: string, sutunAnahtari?: string) => void
  /** Bir otomatik düzeltmeyi başlatır (önizleme modalı açılır) */
  onDuzelt?: (fixId: string) => void
  /** Şu an çalışan düzeltmenin kimliği (düğmeleri pasifleştirir) */
  duzeltiliyor?: string | null
  /** Salt okunur modda düzeltme kapalı */
  duzeltPasif?: boolean
}) {
  const { sonuc, referans, yukleniyor, hata, erisilemedi, yenile } = durum
  const [acik, setAcik] = useState(false)

  const kuralBasligi = useMemo(
    () => new Map((referans?.rules ?? []).map((k) => [k.code, k.title])),
    [referans],
  )
  const satirEtiketi = useMemo(() => {
    const harita = new Map<string, string>()
    for (const s of satirlar) harita.set(s.id, s.pozNo?.trim() || s.pozTanimi?.trim() || '—')
    return harita
  }, [satirlar])

  // Hatalar önce, sonra uyarılar; kendi içinde backend sırası (satır sırası) korunur
  const siraliSorunlar = useMemo(() => {
    if (!sonuc) return []
    return [...sonuc.issues].sort((a, b) => Number(b.severity === 'Error') - Number(a.severity === 'Error'))
  }, [sonuc])

  // Düzeltme kimliği → o düzeltmeyle giderilebilecek sorun sayısı
  const duzeltmeler = useMemo(() => {
    const sayac = new Map<string, number>()
    for (const s of siraliSorunlar) if (s.fixId) sayac.set(s.fixId, (sayac.get(s.fixId) ?? 0) + 1)
    return [...sayac.entries()].map(([id, sayi]) => ({
      id,
      sayi,
      baslik: referans?.fixes.find((f) => f.id === id)?.title ?? id,
    }))
  }, [siraliSorunlar, referans])

  const duzeltDugmesi = (fixId: string, etiket: string, boyut: 'sm' = 'sm') => (
    <Button
      key={fixId}
      variant="secondary"
      size={boyut}
      icon="check"
      disabled={duzeltPasif || duzeltiliyor !== null}
      title={duzeltPasif ? 'Düzeltmek için düzenleme modunda olun' : 'Önizleme açılır, onaylamadan uygulanmaz'}
      onClick={() => onDuzelt?.(fixId)}
    >
      {duzeltiliyor === fixId ? 'Hazırlanıyor…' : etiket}
    </Button>
  )

  /* Henüz sonuç yok */
  if (!sonuc) {
    return (
      <div
        className="flex flex-wrap items-center gap-3 rounded-xl border border-line bg-surface-soft px-4 py-2.5 text-[13px] text-muted-foreground"
        role="status"
      >
        <Icon name={hata ? 'alert-circle' : 'file-spreadsheet'} size={16} />
        <span>{hata ? hata : yukleniyor ? 'Keşif doğrulanıyor…' : 'Doğrulama bekleniyor…'}</span>
        {hata && (
          <Button variant="secondary" size="sm" className="ml-auto" onClick={yenile}>
            Tekrar Dene
          </Button>
        )}
      </div>
    )
  }

  const hataVar = sonuc.errorCount > 0
  const uyariVar = sonuc.warningCount > 0
  // Son kontrol başarısızsa (ör. servis kapalı) eldeki sonuç eskidir: yeşil/kırmızı göstermeyiz
  const eskimis = Boolean(hata)
  const ton = eskimis ? 'neutral' : hataVar ? 'danger' : uyariVar ? 'warning' : 'success'
  const kutu =
    ton === 'neutral'
      ? 'border-line bg-surface-soft text-ink'
      : ton === 'danger'
        ? 'border-danger/30 bg-danger-soft text-danger'
        : ton === 'warning'
          ? 'border-warning/30 bg-warning-soft text-warning'
          : 'border-success/30 bg-success-soft text-success'
  const ikon = eskimis ? 'alert-circle' : hataVar ? 'x-circle' : uyariVar ? 'alert-triangle' : 'check-circle'
  const sayilar = hataVar
    ? `${sonuc.errorCount} hata${uyariVar ? ` · ${sonuc.warningCount} uyarı` : ''}`
    : uyariVar
      ? `${sonuc.warningCount} uyarı`
      : 'sorun yok'
  const baslik = eskimis
    ? 'Doğrulama güncel değil'
    : hataVar || uyariVar
      ? sayilar
      : 'Doğrulama geçti'
  const aciklama = eskimis
    ? `${erisilemedi ? 'Servise ulaşılamıyor' : 'Son kontrol başarısız'}. Son bilinen sonuç: ${sayilar}.`
    : hataVar
      ? 'Yayınlamadan önce hataları düzeltin.'
      : uyariVar
        ? 'Yayınlanabilir; uyarıları gözden geçirin.'
        : 'Tablo yayınlanmaya hazır.'

  return (
    <div className="space-y-2">
      <div className={`flex flex-wrap items-center gap-3 rounded-xl border px-4 py-2.5 text-[13px] ${kutu}`} role="status">
        <Icon name={ikon} size={18} />
        <span className="font-bold">{baslik}</span>
        <span className="opacity-90" title={hata ?? undefined}>
          {aciklama}
        </span>
        <div className="ml-auto flex flex-wrap items-center gap-2">
          {siraliSorunlar.length > 0 && (
            <Button
              variant="secondary"
              size="sm"
              iconRight={acik ? 'chevron-up' : 'chevron-down'}
              onClick={() => setAcik((a) => !a)}
              aria-expanded={acik}
            >
              Sorunları {acik ? 'Gizle' : 'Göster'} ({siraliSorunlar.length})
            </Button>
          )}
          <Button variant="secondary" size="sm" icon="rotate-ccw" disabled={yukleniyor} onClick={yenile}>
            {yukleniyor ? 'Kontrol ediliyor…' : "BOQ'u Kontrol Et"}
          </Button>
        </div>
      </div>

      {acik && siraliSorunlar.length > 0 && onDuzelt && duzeltmeler.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 rounded-xl border border-line bg-surface-soft px-4 py-2.5">
          <span className="text-[12px] font-bold tracking-wide text-muted-foreground uppercase">
            Toplu düzeltme
          </span>
          {duzeltmeler.map((d) => duzeltDugmesi(d.id, `${d.baslik} (${d.sayi})`))}
        </div>
      )}

      {acik && siraliSorunlar.length > 0 && (
        <ul className="max-h-[260px] divide-y divide-border overflow-y-auto rounded-xl border border-border bg-white">
          {siraliSorunlar.map((s, i) => (
            <SorunSatiri
              key={`${s.code}-${s.rowId ?? 'genel'}-${i}`}
              sorun={s}
              baslik={kuralBasligi.get(s.code)}
              satir={s.rowId ? satirEtiketi.get(s.rowId) : undefined}
              onGit={() => s.rowId && onSatiraGit(s.rowId, s.field ? ALAN_SUTUNU[s.field] : undefined)}
              duzelt={
                onDuzelt && s.fixId
                  ? duzeltDugmesi(s.fixId, 'Düzelt')
                  : undefined
              }
            />
          ))}
        </ul>
      )}
    </div>
  )
}

function SorunSatiri({
  sorun,
  baslik,
  satir,
  onGit,
  duzelt,
}: {
  sorun: DogrulamaSorunu
  baslik?: string
  satir?: string
  onGit: () => void
  duzelt?: React.ReactNode
}) {
  const hata = sorun.severity === 'Error'
  const gidilebilir = Boolean(sorun.rowId)
  const icerik = (
    <>
      <Badge tone={hata ? 'danger' : 'warning'} size="sm">
        {sorun.code}
      </Badge>
      <span className="min-w-0 flex-1">
        {baslik && <span className="mr-2 font-medium text-black">{baslik}</span>}
        <span className="text-muted-foreground">{sorun.message}</span>
      </span>
      {satir && <span className="shrink-0 font-mono text-[12px] text-ink">{satir}</span>}
      {gidilebilir && <Icon name="arrow-right" size={14} className="shrink-0 text-muted-foreground" />}
    </>
  )

  return (
    <li className="flex items-center gap-2 pr-3">
      {gidilebilir ? (
        <button
          type="button"
          onClick={onGit}
          className="flex min-w-0 flex-1 items-center gap-3 px-4 py-2 text-left text-[13px] transition-colors hover:bg-surface-muted"
          title="Tabloda göster"
        >
          {icerik}
        </button>
      ) : (
        <div className="flex min-w-0 flex-1 items-center gap-3 px-4 py-2 text-[13px]">{icerik}</div>
      )}
      {duzelt}
    </li>
  )
}
