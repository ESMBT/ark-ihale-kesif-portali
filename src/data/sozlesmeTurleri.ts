import { ihaleDosyasiAlanlari } from './mock'
import type { IhaleAlani, IhaleAlanKategori } from './ihaleAlanlari'

/**
 * SÖZLEŞME TÜRLERİ
 * İhale dosyası alanlarının “must” (zorunlu) kısmı sözleşme türüne göre değişir.
 */

export type SozlesmeTuruId = 'alt-yuklenici' | 'kisa-sozlesme' | 'proje-hizmetleri' | 'satinalma'

export type SozlesmeTuru = {
  id: SozlesmeTuruId
  ad: string
  aciklama: string
  /** Bu türde geçerli ihale dosyası alanları (alan id) */
  alanlar: string[]
  /** Bu türde zorunlu (must) alanlar */
  zorunluAlanlar: string[]
}

/* Ortak çekirdek alanlar — bütün sözleşme türlerinde geçerli */
const cekirdek = [
  'ihIsinAdi',
  'ihIsKapsami',
  'ihIhaleSekli',
  'ihTeklifParaBirimi',
  'ihAvans',
  'ihKesinTeminatOrani',
  'ihIsinToplamSuresi',
  'ihGarantiSuresi',
  'ihYerGormeKisi',
]

const teknikAlanlar = [
  ...cekirdek,
  'ihIhzarat',
  'ihNakitTeminatOrani',
  'ihGunlukCeza',
  'ihAllRiskSigorta',
  'ihFiyatFarki',
  'ihFiyatFarkiYontemi',
  'ihBazFiyat',
  'ihBazFiyatListesi',
  'ihGeciciTeminat',
  'ihGeciciTeminatMektupTarihi',
  'ihAvansTeminatTarihi',
  'ihKesinTeminatMektupTarihi',
  'ihIsinBaslangici',
  'ihIsinBitisi',
  'ihKritikTarihler',
  'ihTeklifGecerlilik',
  'ihGeciciKabul',
  'ihKesinKabulSuresi',
  'ihIhaleCikisTarihi',
  'ihUlasimYolu',
  'ihElektrikSu',
  'ihGeciciSeperator',
  'ihIsciBarinma',
  'ihTeknikPersonel',
  'ihMobilizasyon',
  'ihYemekhane',
  'ihSantiyeMasrafOrani',
  'ihSahaTemizlikPersoneli',
  'ihAltYukleniciTemizlik',
  'ihPersonelCezasi',
]

export const sozlesmeTurleri: SozlesmeTuru[] = [
  {
    id: 'alt-yuklenici',
    ad: 'Alt Yüklenici Sözleşmesi',
    aciklama: 'Taşeron / alt yüklenici ile yapılan iş paketi sözleşmeleri — keşif ve tüm ihale dosyası alanları geçerlidir.',
    alanlar: teknikAlanlar,
    zorunluAlanlar: [
      'ihIsinAdi',
      'ihIsKapsami',
      'ihIhaleSekli',
      'ihTeklifParaBirimi',
      'ihAvans',
      'ihKesinTeminatOrani',
      'ihGeciciTeminat',
      'ihIsinBaslangici',
      'ihIsinToplamSuresi',
      'ihKritikTarihler',
      'ihTeklifGecerlilik',
      'ihKesinKabulSuresi',
      'ihGarantiSuresi',
      'ihYerGormeKisi',
    ],
  },
  {
    id: 'kisa-sozlesme',
    ad: 'Kısa Sözleşme',
    aciklama: 'Küçük kapsamlı, hızlı tamamlanan işler; yalnızca çekirdek bilgiler istenir.',
    alanlar: cekirdek,
    zorunluAlanlar: [
      'ihIsinAdi',
      'ihIsKapsami',
      'ihIhaleSekli',
      'ihTeklifParaBirimi',
      'ihAvans',
      'ihIsinToplamSuresi',
      'ihGarantiSuresi',
      'ihYerGormeKisi',
    ],
  },
  {
    id: 'proje-hizmetleri',
    ad: 'Proje Hizmetleri Sözleşmesi',
    aciklama: 'Danışmanlık, mühendislik ve proje hizmetleri işleri; şantiye bilgileri kapsam dışıdır.',
    alanlar: [
      ...cekirdek,
      'ihAvansTeminatTarihi',
      'ihGeciciTeminat',
      'ihGeciciTeminatMektupTarihi',
      'ihIsinBaslangici',
      'ihIsinBitisi',
      'ihKritikTarihler',
      'ihTeklifGecerlilik',
      'ihGeciciKabul',
      'ihKesinKabulSuresi',
      'ihTeknikPersonel',
    ],
    zorunluAlanlar: [
      'ihIsinAdi',
      'ihIsKapsami',
      'ihIhaleSekli',
      'ihTeklifParaBirimi',
      'ihAvans',
      'ihAvansTeminatTarihi',
      'ihIsinBaslangici',
      'ihIsinToplamSuresi',
      'ihKritikTarihler',
      'ihTeklifGecerlilik',
      'ihGeciciKabul',
      'ihKesinKabulSuresi',
      'ihGarantiSuresi',
      'ihYerGormeKisi',
      'ihTeknikPersonel',
    ],
  },
  {
    id: 'satinalma',
    ad: 'Satınalma Sözleşmesi',
    aciklama: 'Malzeme / ekipman satınalması — keşif ve şantiye bilgileri kapsam dışıdır.',
    alanlar: cekirdek,
    zorunluAlanlar: [
      'ihIsinAdi',
      'ihIsKapsami',
      'ihIhaleSekli',
      'ihTeklifParaBirimi',
      'ihAvans',
      'ihKesinTeminatOrani',
      'ihIsinToplamSuresi',
      'ihGarantiSuresi',
      'ihYerGormeKisi',
    ],
  },
]

export function sozlesmeTuruBul(id?: string): SozlesmeTuru {
  return sozlesmeTurleri.find((t) => t.id === id) ?? sozlesmeTurleri[0]
}

/* Enum (dropdown) alanlarının seçenekleri */
const enumSecenekleri: Record<string, string[]> = {
  ihIhaleSekli: ['Birim Fiyatlı', 'Götürü'],
  ihTeklifParaBirimi: ['TRY', 'USD', 'EUR'],
  ihFiyatFarki: ['Uygulanacak', 'Uygulanmayacak'],
  ihBazFiyat: ['Var', 'Yok'],
  ihElektrikSu: ['Kesilecek', 'Kesilmeyecek'],
  ihGeciciSeperator: [
    'Mevcut',
    'Mevcut değil — ARK İnşaat kapsamında',
    'Mevcut değil — Alt yüklenici kapsamında',
  ],
  ihIsciBarinma: ['Sahada barınma yapılmayacak', 'ARK İnşaat kapsamında', 'Alt yüklenici kapsamında'],
  ihMobilizasyon: ['ARK İnşaat kapsamında', 'Alt yüklenici kapsamında', 'Değiştirildi'],
  ihYemekhane: ['ARK İnşaat tarafından tesis edilecek', 'Alt yüklenici tarafından sağlanacak'],
  ihIsinBaslangici: ['Yer Teslimi'],
  ihSantiyeMasrafOrani: ['1,5', '2'],
}

/** Excel veri tipini ekran tipine çevirir */
function tipCevir(tip: string): IhaleAlani['tip'] {
  switch (tip) {
    case 'Tarih':
      return 'tarih'
    case 'Yüzde':
      return 'yuzde'
    case 'Sayı':
      return 'sayi'
    case 'Enum':
      return 'dropdown'
    case 'Text + çoklu':
      return 'uzun-metin'
    default:
      return 'metin'
  }
}

/** Sözleşme türüne göre ihale dosyası alanlarının tanımları */
export function turAlanlari(turId?: string): IhaleAlani[] {
  const tur = sozlesmeTuruBul(turId)
  return ihaleDosyasiAlanlari
    .filter((a) => tur.alanlar.includes(a.id))
    .map((a) => ({
      id: a.id,
      ad: a.alan,
      tip: tipCevir(a.tip),
      zorunlu: tur.zorunluAlanlar.includes(a.id),
      kategori: a.blok as IhaleAlanKategori,
      sistem: a.zorunluluk === 'sistem',
      secenekler: enumSecenekleri[a.id],
      aciklama: a.aciklama,
    }))
}

/** Sözleşme türüne göre zorunlu alanların tanımları */
export function turZorunluAlanlari(turId?: string): IhaleAlani[] {
  const tur = sozlesmeTuruBul(turId)
  return turAlanlari(turId).filter((a) => tur.zorunluAlanlar.includes(a.id))
}
