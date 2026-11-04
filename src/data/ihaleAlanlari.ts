/**
 * İHALE PAKETİ ALAN SÖZLÜĞÜ
 * Şantiyecinin ihale paketi oluştururken dolduracağı alanlar.
 * Kaynak: ana-veri_23.10.2026.xlsx · "2b. İhale Dosyası Alanları" (şantiye girişi olan alanlar).
 */

export type IhaleAlanTipi = 'metin' | 'uzun-metin' | 'yuzde' | 'sayi' | 'tarih' | 'dropdown'

export type IhaleAlanKategori = 'proje' | 'finansal' | 'sure' | 'santiye'

export type IhaleAlani = {
  id: string
  ad: string
  tip: IhaleAlanTipi
  zorunlu: boolean
  kategori: IhaleAlanKategori
  /** Dropdown seçenekleri */
  secenekler?: string[]
  /** Sistem tarafından otomatik doldurulur (şantiyeci giremez) */
  sistem?: boolean
  aciklama?: string
}

export const ihaleAlaniKategorileri: Record<IhaleAlanKategori, string> = {
  proje: 'Proje Bilgileri',
  finansal: 'Finansal Bilgiler',
  sure: 'İşin Süresi',
  santiye: 'Şantiye Bilgileri',
}

export const ihaleAlanlari: IhaleAlani[] = [
  /* ---------------- Proje Bilgileri ---------------- */
  {
    id: 'ihIsinAdi',
    ad: 'İhale Edilen İşin Adı',
    tip: 'metin',
    zorunlu: true,
    kategori: 'proje',
  },
  {
    id: 'ihIsKapsami',
    ad: 'İşin Kapsamı ve Ön Bilgileri',
    tip: 'uzun-metin',
    zorunlu: true,
    kategori: 'proje',
  },
  {
    id: 'ihIhaleSekli',
    ad: 'İhale Şekli',
    tip: 'dropdown',
    zorunlu: true,
    kategori: 'proje',
    secenekler: ['Birim Fiyatlı', 'Götürü'],
  },
  {
    id: 'ihTeklifParaBirimi',
    ad: 'Teklif Para Birimi',
    tip: 'dropdown',
    zorunlu: true,
    kategori: 'proje',
    secenekler: ['TRY', 'USD', 'EUR'],
  },

  /* ---------------- Finansal Bilgiler ---------------- */
  { id: 'ihAvans', ad: 'Avans (%)', tip: 'yuzde', zorunlu: true, kategori: 'finansal' },
  {
    id: 'ihAvansTeminatTarihi',
    ad: 'Avans Teminat Mektup Tarihi',
    tip: 'tarih',
    zorunlu: false,
    kategori: 'finansal',
    sistem: true,
  },
  { id: 'ihKesinTeminatOrani', ad: 'Kesin Teminat Oran (%)', tip: 'yuzde', zorunlu: true, kategori: 'finansal' },
  {
    id: 'ihKesinTeminatMektupTarihi',
    ad: 'Kesin Teminat Mektup Tarihi',
    tip: 'tarih',
    zorunlu: false,
    kategori: 'finansal',
    sistem: true,
  },
  { id: 'ihGeciciTeminat', ad: 'Geçici Teminat (%)', tip: 'yuzde', zorunlu: true, kategori: 'finansal' },
  {
    id: 'ihGeciciTeminatMektupTarihi',
    ad: 'Geçici Teminat Mektup Tarihi',
    tip: 'tarih',
    zorunlu: true,
    kategori: 'finansal',
  },
  { id: 'ihIhzarat', ad: 'İhzarat (%)', tip: 'yuzde', zorunlu: true, kategori: 'finansal' },
  {
    id: 'ihNakitTeminatOrani',
    ad: 'Hakedişlerde Nakit Teminat Oranı (%)',
    tip: 'yuzde',
    zorunlu: true,
    kategori: 'finansal',
  },
  {
    id: 'ihGunlukCeza',
    ad: 'Günlük Ceza Bedeli (Gecikme) (%)',
    tip: 'yuzde',
    zorunlu: true,
    kategori: 'finansal',
  },
  {
    id: 'ihAllRiskSigorta',
    ad: 'All Risk Sigorta Kesintisi (%)',
    tip: 'yuzde',
    zorunlu: true,
    kategori: 'finansal',
  },
  {
    id: 'ihFiyatFarki',
    ad: 'Fiyat Farkı',
    tip: 'dropdown',
    zorunlu: true,
    kategori: 'finansal',
    secenekler: ['Uygulanacak', 'Uygulanmayacak'],
  },
  {
    id: 'ihFiyatFarkiYontemi',
    ad: 'Fiyat Farkı Uygulama Yöntemi',
    tip: 'metin',
    zorunlu: true,
    kategori: 'finansal',
  },
  {
    id: 'ihBazFiyat',
    ad: 'Baz Fiyat',
    tip: 'dropdown',
    zorunlu: true,
    kategori: 'finansal',
    secenekler: ['Var', 'Yok'],
  },
  {
    id: 'ihBazFiyatListesi',
    ad: 'Baz Fiyat Listesi',
    tip: 'metin',
    zorunlu: true,
    kategori: 'finansal',
  },

  /* ---------------- İşin Süresi ---------------- */
  {
    id: 'ihIsinBaslangici',
    ad: 'İşin Başlangıcı',
    tip: 'dropdown',
    zorunlu: true,
    kategori: 'sure',
    secenekler: ['Yer Teslimi'],
  },
  { id: 'ihIsinToplamSuresi', ad: 'İşin Toplam Süresi (Gün)', tip: 'sayi', zorunlu: true, kategori: 'sure' },
  {
    id: 'ihKritikTarihler',
    ad: 'İşin Süresi Kritik Tarihler',
    tip: 'metin',
    zorunlu: true,
    kategori: 'sure',
  },
  {
    id: 'ihIsinBitisi',
    ad: 'İşin Bitişi (Tarih)',
    tip: 'tarih',
    zorunlu: false,
    kategori: 'sure',
    sistem: true,
  },
  {
    id: 'ihTeklifGecerlilik',
    ad: 'Teklif Fiyatları Geçerlik Süresi (Gün)',
    tip: 'sayi',
    zorunlu: true,
    kategori: 'sure',
  },
  {
    id: 'ihGeciciKabul',
    ad: "İş'in Ark İnşaat İşveren'e Teslim (Geçici Kabul) Tarihi",
    tip: 'tarih',
    zorunlu: false,
    kategori: 'sure',
    sistem: true,
  },
  { id: 'ihKesinKabulSuresi', ad: 'Kesin Kabul Süresi (Yıl)', tip: 'sayi', zorunlu: true, kategori: 'sure' },
  { id: 'ihGarantiSuresi', ad: 'Garanti Süresi (Yıl)', tip: 'sayi', zorunlu: true, kategori: 'sure' },
  {
    id: 'ihIhaleCikisTarihi',
    ad: 'İhaleye Çıkış Tarihi',
    tip: 'tarih',
    zorunlu: false,
    kategori: 'sure',
    sistem: true,
  },

  /* ---------------- Şantiye Bilgileri ---------------- */
  {
    id: 'ihYerGormeKisi',
    ad: 'Yer Görme Yapılacak Kişi ve Telefonu',
    tip: 'metin',
    zorunlu: true,
    kategori: 'santiye',
  },
  {
    id: 'ihUlasimYolu',
    ad: 'Şantiye Ulaşım Yol Durumu',
    tip: 'metin',
    zorunlu: true,
    kategori: 'santiye',
  },
  {
    id: 'ihElektrikSu',
    ad: 'Elektrik ve Su Kullanım Bedeli Kesilecek / Kesilmeyecek',
    tip: 'dropdown',
    zorunlu: true,
    kategori: 'santiye',
    secenekler: ['Kesilecek', 'Kesilmeyecek'],
  },
  {
    id: 'ihGeciciSeperator',
    ad: 'Geçici Seperatör (Çevre Çiti)',
    tip: 'dropdown',
    zorunlu: true,
    kategori: 'santiye',
    secenekler: [
      'Mevcut',
      'Mevcut değil — ARK İnşaat kapsamında',
      'Mevcut değil — Alt yüklenici kapsamında',
    ],
  },
  {
    id: 'ihIsciBarinma',
    ad: 'Şantiye Sahası İşçi Barınma Bilgisi',
    tip: 'dropdown',
    zorunlu: true,
    kategori: 'santiye',
    secenekler: ['Sahada barınma yapılmayacak', 'ARK İnşaat kapsamında', 'Alt yüklenici kapsamında'],
  },
  {
    id: 'ihTeknikPersonel',
    ad: 'İstenen Alt Yüklenici Teknik Personel Bilgisi (Şantiye Şefi, Müh-Mimar)',
    tip: 'metin',
    zorunlu: true,
    kategori: 'santiye',
  },
  {
    id: 'ihMobilizasyon',
    ad: 'Mobilizasyon Alanı Düzenlenmesi',
    tip: 'dropdown',
    zorunlu: true,
    kategori: 'santiye',
    secenekler: ['ARK İnşaat kapsamında', 'Alt yüklenici kapsamında', 'Değiştirildi'],
  },
  {
    id: 'ihYemekhane',
    ad: 'Yemekhane',
    tip: 'dropdown',
    zorunlu: true,
    kategori: 'santiye',
    secenekler: ['ARK İnşaat tarafından tesis edilecek', 'Alt yüklenici tarafından sağlanacak'],
  },
  {
    id: 'ihSantiyeMasrafOrani',
    ad: 'Şantiye Masrafı İçin Alınacak Oran (%)',
    tip: 'dropdown',
    zorunlu: true,
    kategori: 'santiye',
    secenekler: ['1,5', '2'],
  },
  {
    id: 'ihSahaTemizlikPersoneli',
    ad: 'Ark İnşaat Tarafından Görevlendirilecek Saha Temizlik Personeli',
    tip: 'sayi',
    zorunlu: true,
    kategori: 'santiye',
  },
  {
    id: 'ihAltYukleniciTemizlik',
    ad: 'Alt Yükleniciden İstenen Temizlik Personeli',
    tip: 'sayi',
    zorunlu: true,
    kategori: 'santiye',
  },
  {
    id: 'ihPersonelCezasi',
    ad: 'Personel Cezası — Günlük Kişi Başı TL',
    tip: 'sayi',
    zorunlu: true,
    kategori: 'santiye',
  },
]

export const ihaleAlaniKategorilerSirasi: IhaleAlanKategori[] = ['proje', 'finansal', 'sure', 'santiye']

/** Tip etiketleri (tablo gösterimi için) */
export const ihaleAlanTipEtiket: Record<IhaleAlanTipi, string> = {
  metin: 'Metin',
  'uzun-metin': 'Uzun Metin',
  yuzde: 'Yüzde',
  sayi: 'Sayı',
  tarih: 'Tarih',
  dropdown: 'Seçim',
}
