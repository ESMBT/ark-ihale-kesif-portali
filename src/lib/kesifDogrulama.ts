import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { SpreadsheetCellMark } from '@ark/ui-kit'
import type { KesifSatiri } from '../data/types'

/* ------------------------------------------------------------------ *
 * Keşif doğrulama istemcisi (F1)
 *
 * Kurallar (E01–E06, W01–W04) Ark.Excel backend'inde uygulanır:
 *   POST /api/excel/survey/validate   → sorun listesi
 *   GET  /api/excel/survey/reference  → kural kataloğu, birimler
 * Bu dosya yalnızca portal satırlarını backend'in satır modeline çevirir,
 * çağrıyı yapar ve sonucu bir hook ile sunar. Kural mantığı burada YOKTUR.
 * ------------------------------------------------------------------ */

const EXCEL_API_BASE = '/api/excel/survey'

export type DogrulamaOnemi = 'Error' | 'Warning'

export type DogrulamaSorunu = {
  code: string
  severity: DogrulamaOnemi
  message: string
  /** İlişkili satırın (KesifSatiri.id) kimliği; tablo geneli sorunlarda yok */
  rowId?: string | null
  sourceRow?: number | null
  /** number | description | unit | quantity | profitPercent */
  field?: string | null
  /** Sorunu giderecek otomatik düzeltme (F4) */
  fixId?: string | null
}

export type DogrulamaSonucu = {
  issues: DogrulamaSorunu[]
  errorCount: number
  warningCount: number
  canPublish: boolean
}

export type DogrulamaKurali = {
  code: string
  severity: DogrulamaOnemi
  title: string
  description: string
  fixId?: string | null
}

export type DogrulamaReferansi = {
  units: string[]
  rules: DogrulamaKurali[]
  fixes: Array<{ id: string; title: string; description: string }>
  minProfitPercent: number
  maxProfitPercent: number
}

/** Backend'in satır modeli (SurveyValidationRow) */
export type DogrulamaSatiri = {
  id: string
  number?: string
  description?: string
  unit?: string
  quantity?: number | null
  materialPrice?: number | null
  laborPrice?: number | null
  ggkPrice?: number | null
  unitPrice?: number | null
}

/** Doğrulama alanı → Spreadsheet sütun anahtarı */
export const ALAN_SUTUNU: Record<string, string> = {
  number: 'pozNo',
  description: 'pozTanimi',
  unit: 'birim',
  quantity: 'miktar',
}

/**
 * Keşif aşamasında fiyat girilmediği için "Hiç fiyat girilmemiş" (W02) uyarısı bu ekranda
 * sürekli çıkar ve gürültü yaratır; varsayılan olarak gösterilmez. Fiyat aşamasında boş bırakın.
 */
export const KESIF_ASAMASINDA_YOKSAYILAN_KODLAR = ['W02'] as const

/** KesifSatiri[] → backend satır modeli. Başlıklar (seviye 1) birim/miktarsız gönderilir. */
export function satirlariDogrulamaSatirlarinaCevir(satirlar: KesifSatiri[]): DogrulamaSatiri[] {
  // Yorum / devam satırları poz değildir; doğrulamaya girmez
  return satirlar.filter((s) => !s.yorum).map((s) => {
    if (s.seviye === 1) {
      return { id: s.id, number: s.pozNo, description: s.pozTanimi }
    }
    return {
      id: s.id,
      number: s.pozNo,
      description: s.pozTanimi,
      unit: s.birim,
      // Kalem satırında miktar her zaman gönderilir (0 dahil): backend kalemi "poz" sayar ve E04'ü uygular
      quantity: s.miktar,
      materialPrice: s.malzeme ?? null,
      laborPrice: s.iscilik ?? null,
      ggkPrice: s.ggk ?? null,
      unitPrice: s.birimFiyat ?? null,
    }
  })
}

/* ------------------------------ F3: hücre işaretleri ------------------------------ */

/**
 * Sorunları Spreadsheet `cellMarks` biçimine çevirir: satır kimliği → sütun → işaret.
 * Aynı hücredeki birden çok sorun tek işarette birleşir (en ağır önem, mesajlar alt alta).
 * Alanı belli olmayan satır sorunları Poz No hücresine işaretlenir.
 */
export function sorunlardanHucreIsaretleri(
  sorunlar: DogrulamaSorunu[],
): Record<string, Record<string, SpreadsheetCellMark>> {
  const sonuc: Record<string, Record<string, SpreadsheetCellMark>> = {}
  for (const s of sorunlar) {
    if (!s.rowId) continue
    const sutun = (s.field && ALAN_SUTUNU[s.field]) || 'pozNo'
    const satir = (sonuc[s.rowId] ??= {})
    const metin = `${s.code}: ${s.message}`
    const onem = s.severity === 'Error' ? 'error' : 'warning'
    const mevcut = satir[sutun]
    satir[sutun] = mevcut
      ? {
          severity: mevcut.severity === 'error' || onem === 'error' ? 'error' : 'warning',
          message: `${mevcut.message}\n${metin}`,
        }
      : { severity: onem, message: metin }
  }
  return sonuc
}

/* ------------------------------- F4: otomatik düzeltme ------------------------------- */

export type DuzeltmeDegisikligi = {
  rowId: string
  /** update = alan değişti, add = yeni satır eklendi */
  kind: 'update' | 'add'
  field?: string | null
  from?: string | null
  to?: string | null
}

export type DuzeltmeYaniti = {
  /** Düzeltilmiş tüm satırlar (sıra dahil) */
  rows: DogrulamaSatiri[]
  changes: DuzeltmeDegisikligi[]
  /** Düzeltme uygulanmış halin yeniden doğrulanmış sonucu */
  validation: DogrulamaSonucu
}

/** Alan adlarının ekrandaki karşılığı (önizleme modalı) */
export const ALAN_ETIKETI: Record<string, string> = {
  number: 'Poz No',
  description: 'Poz Tanımı',
  unit: 'Birim',
  quantity: 'Miktar',
}

/** Bir otomatik düzeltmeyi backend'de çalıştırır; sonucu uygulamadan önce önizletmek içindir */
export function kesifDuzelt(fixId: string, satirlar: KesifSatiri[]): Promise<DuzeltmeYaniti> {
  return istek<DuzeltmeYaniti>('/fix', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ fix: fixId, rows: satirlariDogrulamaSatirlarinaCevir(satirlar) }),
  })
}

/**
 * Düzeltme yanıtını tablo satırlarına uygular. Satır sırası yanıttaki sıradır (eklenen
 * başlıklar doğru yere girer). Mevcut satırlarda yalnızca düzeltmelerin dokunduğu alanlar
 * (poz no, birim) alınır; diğer alanlar (fiyat, açıklama…) olduğu gibi korunur.
 */
export function duzeltmeyiUygula(satirlar: KesifSatiri[], yanit: DuzeltmeYaniti): KesifSatiri[] {
  const mevcut = new Map(satirlar.map((s) => [s.id, s]))
  const ek = Date.now().toString(36)

  // Yorum satırları backend'e gönderilmez; bağlı oldukları (önceki yorum olmayan) satırın arkasına korunur
  const yorumlar = new Map<string | null, KesifSatiri[]>()
  let onceki: string | null = null
  for (const s of satirlar) {
    if (s.yorum) {
      const liste = yorumlar.get(onceki) ?? []
      liste.push(s)
      yorumlar.set(onceki, liste)
    } else {
      onceki = s.id
    }
  }

  const sonuc: KesifSatiri[] = [...(yorumlar.get(null) ?? [])]
  for (const r of yanit.rows) {
    const m = mevcut.get(r.id)
    if (m) {
      sonuc.push({
        ...m,
        pozNo: r.number ?? m.pozNo,
        birim: m.seviye === 1 ? m.birim : (r.unit ?? m.birim),
      })
    } else {
      // Eklenen üst başlık
      sonuc.push({
        id: `new-${r.id}-${ek}`,
        seviye: 1,
        pozNo: r.number ?? '',
        pozTanimi: r.description ?? 'BAŞLIK',
        birim: '',
        miktar: 0,
        teklifKirilimi: 'Malzeme + İşçilik',
      } satisfies KesifSatiri)
    }
    sonuc.push(...(yorumlar.get(r.id) ?? []))
  }
  return sonuc
}

export class DogrulamaHatasi extends Error {
  readonly erisilemedi: boolean
  constructor(mesaj: string, erisilemedi = false) {
    super(mesaj)
    this.name = 'DogrulamaHatasi'
    this.erisilemedi = erisilemedi
  }
}

async function istek<T>(path: string, init?: RequestInit): Promise<T> {
  let response: Response
  try {
    response = await fetch(`${EXCEL_API_BASE}${path}`, init)
  } catch {
    throw new DogrulamaHatasi('Doğrulama servisine ulaşılamadı.', true)
  }
  if (response.status === 502 || response.status === 503 || response.status === 504) {
    throw new DogrulamaHatasi('Doğrulama servisine ulaşılamadı.', true)
  }
  if (!response.ok) {
    const govde = (await response.json().catch(() => null)) as { message?: string } | null
    throw new DogrulamaHatasi(govde?.message ?? `Doğrulama başarısız (HTTP ${response.status}).`)
  }
  return (await response.json()) as T
}

export function kesifDogrula(satirlar: KesifSatiri[], signal?: AbortSignal): Promise<DogrulamaSonucu> {
  return istek<DogrulamaSonucu>('/validate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ rows: satirlariDogrulamaSatirlarinaCevir(satirlar) }),
    signal,
  })
}

let referansIstegi: Promise<DogrulamaReferansi> | null = null

/** Kural kataloğu ve birimler; oturum boyunca bir kez çekilir (hata olursa tekrar denenir) */
export function kesifReferansi(): Promise<DogrulamaReferansi> {
  if (!referansIstegi) {
    referansIstegi = istek<DogrulamaReferansi>('/reference').catch((e) => {
      referansIstegi = null
      throw e
    })
  }
  return referansIstegi
}

/** Yoksayılan kodları çıkarıp sayaçları yeniden hesaplar */
export function sonucuSuz(sonuc: DogrulamaSonucu, yoksay: readonly string[]): DogrulamaSonucu {
  if (yoksay.length === 0) return sonuc
  const issues = sonuc.issues.filter((i) => !yoksay.includes(i.code))
  const errorCount = issues.filter((i) => i.severity === 'Error').length
  return {
    issues,
    errorCount,
    warningCount: issues.length - errorCount,
    canPublish: errorCount === 0,
  }
}

/** Boş satır listesi (sabit referans; hook'a verilecek varsayılan) */
export const BOS_KESIF: KesifSatiri[] = []

export type DogrulamaDurumu = {
  /** Son başarılı sonuç (yeni sonuç gelene kadar eskisi korunur) */
  sonuc: DogrulamaSonucu | null
  /**
   * `sonuc`, şu anki satırlar için mi hesaplandı? Satırlar değişip yeni sonuç henüz gelmediyse
   * (debounce / istek sürüyor) veya son kontrol başarısızsa `false`. Yayın kapısı gibi karar veren
   * yerler yalnızca `guncel` sonuca güvenmelidir.
   */
  guncel: boolean
  referans: DogrulamaReferansi | null
  yukleniyor: boolean
  hata: string | null
  erisilemedi: boolean
  /** Hemen (debounce beklemeden) yeniden doğrular */
  yenile: () => void
}

/**
 * Satırlar değiştikçe (debounce ile) backend'de doğrular.
 * @param satirlar   güncel tablo satırları
 * @param bekleMs    debounce süresi
 * @param yoksay     gösterilmeyecek kural kodları
 */
export function useKesifDogrulama(
  satirlar: KesifSatiri[],
  { bekleMs = 500, yoksay = KESIF_ASAMASINDA_YOKSAYILAN_KODLAR }: { bekleMs?: number; yoksay?: readonly string[] } = {},
): DogrulamaDurumu {
  const [kayit, setKayit] = useState<{ sonuc: DogrulamaSonucu; kaynak: KesifSatiri[] } | null>(null)
  const [referans, setReferans] = useState<DogrulamaReferansi | null>(null)
  const [yukleniyor, setYukleniyor] = useState(false)
  const [hata, setHata] = useState<string | null>(null)
  const [erisilemedi, setErisilemedi] = useState(false)
  const [tetik, setTetik] = useState(0)
  const hemenRef = useRef(false)

  const yenile = useCallback(() => {
    hemenRef.current = true
    setTetik((t) => t + 1)
  }, [])

  // Referans (kural başlıkları) bir kez
  useEffect(() => {
    let iptal = false
    kesifReferansi()
      .then((r) => {
        if (!iptal) setReferans(r)
      })
      .catch(() => {
        /* kural başlıkları olmadan da çalışır */
      })
    return () => {
      iptal = true
    }
  }, [])

  // Satırlar değişince (veya elle tetiklenince) doğrula
  useEffect(() => {
    const kontrol = new AbortController()
    const bekle = hemenRef.current ? 0 : bekleMs
    hemenRef.current = false

    const zamanlayici = setTimeout(() => {
      setYukleniyor(true)
      kesifDogrula(satirlar, kontrol.signal)
        .then((s) => {
          setKayit({ sonuc: s, kaynak: satirlar })
          setHata(null)
          setErisilemedi(false)
        })
        .catch((e: unknown) => {
          if (kontrol.signal.aborted) return
          setHata(e instanceof Error ? e.message : 'Doğrulama başarısız.')
          setErisilemedi(e instanceof DogrulamaHatasi && e.erisilemedi)
        })
        .finally(() => {
          if (!kontrol.signal.aborted) setYukleniyor(false)
        })
    }, bekle)

    return () => {
      clearTimeout(zamanlayici)
      kontrol.abort()
    }
  }, [satirlar, tetik, bekleMs])

  const sonuc = useMemo(() => (kayit ? sonucuSuz(kayit.sonuc, yoksay) : null), [kayit, yoksay])
  const guncel = kayit !== null && kayit.kaynak === satirlar && hata === null

  return { sonuc, guncel, referans, yukleniyor, hata, erisilemedi, yenile }
}
