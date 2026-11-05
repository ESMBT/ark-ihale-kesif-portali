export type Tone = 'neutral' | 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'purple'

/* ---------------------------------------------------------------- */
/*  Proje Kartı (ana-veri Excel · "2. Proje Kartı Alanları")          */
/* ---------------------------------------------------------------- */

export type Blok = 'genel' | 'sozlesme' | 'organizasyon' | 'alan'

export type Zorunluluk = 'zorunlu' | 'kosullu' | 'opsiyonel'

/**
 * Kaynak tipi — ana-veri Excel'indeki "Kaynak" sütunundan türetildi.
 *  secim      : kullanıcı listeden seçer (Proje Listesi / personel listesi)
 *  sap        : SAP'te mevcut → otomatik gelir (yeşil)
 *  sap-planli : SAP alanı henüz yok → şimdilik manuel (turuncu), sonra otomatik
 *  manuel     : tamamen portal içinde, manuel girilir (turuncu)
 *  sistem     : portal tarafından otomatik hesaplanır
 */
export type KaynakTipi = 'secim' | 'sap' | 'sap-planli' | 'manuel' | 'sistem'

export type ProjeKartiAlani = {
  id: string
  blok: Blok
  alan: string
  tip: string
  zorunluluk: Zorunluluk
  kaynak: KaynakTipi
  kaynakMetni: string
  sap?: { tablo: string; alan: string; uzunluk: number | string }
  aciklama: string
  not?: string
  secimKaynagi?: 'sap-proje' | 'personel'
  /** Talep ekranında şantiyeci tarafından doldurulacak mı? (turuncu "doldurulacak") */
  talepEkranindaManuel?: boolean
  /** Koşullu zorunluluk kuralı */
  kosul?: 'sozlesme-turu-birim-fiyatli' | 'sozlesme-turu-goturu' | 'sozlesme-turu-maliyet-kar'
  /** Ekranlarda hiç gösterilmeyen alan */
  gizli?: boolean
  /** Birden fazla kişi seçilebilir (tekli alanlarda false) */
  coklu?: boolean
}

/* ---------------------------------------------------------------- */
/*  İhale Dosyası (ana-veri Excel · "2b. İhale Dosyası Alanları")    */
/* ---------------------------------------------------------------- */

export type IhaleDosyasiAlani = {
  id: string
  blok: 'proje' | 'finansal' | 'sure' | 'santiye'
  alan: string
  zorunluluk: 'zorunlu' | 'sistem' | 'opsiyonel'
  sorumlu: 'Santiye' | 'Ihale Ekibi' | 'Otomatik' | 'Santiye / İhale Ekibi'
  kaynak: string
  tip: string
  aciklama?: string
}

/* ---------------------------------------------------------------- */
/*  Kayıtlar                                                          */
/* ---------------------------------------------------------------- */

export type Person = {
  id: string
  ad: string
  unvan: string
  mail: string
  telefon: string
  roller: string[]
}

export type SapProje = {
  kod: string
  ad: string
  lokasyon: string
  idare: string
  musavir: string
  sozlesmeTuru: 'Birim Fiyatlı' | 'Götürü Bedel' | 'Maliyet + Kar'
  soztip: string
  geciciKabul: string
  direktor: string
  koordinator: string
  projeMuduru: string
  santiyeSefi: string
  teknikOfis: string
  sahaSorumlusu: string
  muhasebeYetkilisi: string
  maliIsler: string
  sozlesmeTutari: string
  maliyetKarOrani: string
  avans: string
  kesinTeminat: string
  nakitTeminat: string
  alanlar: Record<string, string>
}

export type ProjeDurumu =
  | 'talep'
  | 'sap-bekliyor'
  | 'proje-kodu-var'
  | 'keşif-taslak'
  | 'keşif-hazir'
  | 'paket-hazir'
  | 'ihale-ekibinde'
  | 'revize'
  | 'onaylandi'

import type { IhaleSurecDurumu, PaketDurumu } from './ihaleDurumlari'

export type { IhaleSurecDurumu, PaketDurumu } from './ihaleDurumlari'

export type Proje = {
  id: string
  kod: string
  ad: string
  durum: ProjeDurumu
  /** Conwize referansındaki "Stage" — kart üzerindeki turuncu rozet */
  asama: 'Keşif' | 'İhale' | 'Sözleşme' | 'Tamamlandı'
  talepTarihi?: string
  guncellemeTarihi?: string
  /** Son erişim (görüntüleme) tarihi */
  sonErişimTarihi?: string
  ihaleCikisTarihi?: string
  sonTarih?: string
  sahip: string
  /** Projeye atanan kullanıcı id'leri (şantiyeci erişim kapsamı) */
  atananKullanicilar?: string[]
  ihaleEkipAtanan?: string
  /** Arşivlendi mi? (şantiyeci modülü) */
  arsivlendi?: boolean
  /** Arşivleme tarihi */
  arsivTarihi?: string
  /** Proje Kartı alan id → değer */
  kart: Record<string, string>
  /** İhale Dosyası alan id → değer */
  ihaleDosyasi: Record<string, string>
  paketler: IhalePaketi[]
  notlar: string
  aktivite: { tarih: string; metin: string; ikon: string }[]
}

export type TeklifDurumu =
  | 'bekliyor'
  | 'verdi'
  | 'pazarlik-bekliyor'
  | 'pazarlik-verdi'
  | 'kazanan'
  | 'elendi'

export type Teklif = {
  id: string
  firmaId: string
  firma: string
  /** Teklifin verildiği tur */
  tur: number
  tutar?: number
  paraBirimi: string
  durum: TeklifDurumu
  teklifTarihi?: string
  /** Pazarlık teklifi (varsa) */
  pazarlikTutar?: number
  pazarlikParaBirimi?: string
  not?: string
}

/** İhale Yönetimi paneli durumu — ihale çıkışından kazanan belirlenmesine kadar */
export type IhaleYonetimi = {
  /** Kaçıncı tur (ilk süreç her zaman 1. Tur) */
  tur: number
  durum: IhaleSurecDurumu
  /** Teklif verme tarihi */
  teklifTarihi?: string
  /** Soru / cevap tarihi */
  soruCevapTarihi?: string
  teklifler: Teklif[]
  /** Kazanan alt yüklenici (firmaId) */
  kazanan?: string
  /** Tur bazlı süreç notları — 1. turun kapanış notu, 2. turun notu vb. */
  turNotlari: Record<string, string>
  /** Gönderilen pazarlık teklifleri */
  pazarliklar: { tur: number; tutar?: number; paraBirimi?: string; not?: string; tarih?: string }[]
}

export type Soru = {
  id: string
  soru: string
  soran: string
  soruTarihi: string
  cevap?: string
  cevaplayan?: string
  cevapTarihi?: string
}

export type IhalePaketi = {
  id: string
  ad: string
  durum: PaketDurumu
  /** Sözleşme türü — ihale dosyası alan setini ve zorunlu alanları belirler */
  sozlesmeTuru?: 'alt-yuklenici' | 'kisa-sozlesme' | 'proje-hizmetleri' | 'satinalma'
  /** İhale paketinden sorumlu kişi (kullanıcı id) */
  sorumluId?: string
  /** Paketi oluşturan kullanıcı (şantiyeci kapsamı) */
  olusturanId?: string
  /** Yayınlandı mı? (yayın öncesi eksik alan uyarısı gösterilir) */
  yayinDurumu?: 'yayinda'
  /** Kullanıcı tarafından eklenen / yeniden adlandırılan klasörler */
  klasorler?: { id: string; ad: string }[]
  /** Bölüm / iş tipi — filtre alanı */
  isTipi: 'Birim Fiyatlı' | 'Götürü' | 'Malzeme + İşçilik'
  /** Seçilen alt yüklenici */
  seciliFirma?: string
  keşif: KesifSatiri[]
  /** Keşif tablosuna eklenen özel sütunlar (Nakliye, Fittings …) */
  kesifSutunlari?: KesifEkSutun[]
  belgeler: ProjeBelge[]
  altYukleniciler: AltYuklenici[]
  /** İhale paketi oluşturulurken doldurulan alanlar (alan id → değer) */
  alanlar?: Record<string, string>
  /** İhale Yönetimi paneli durumu */
  ihale?: IhaleYonetimi
  /** Davet öncesi onay akışı */
  onaylar?: OnayKaydi[]
  /** Yaklaşık proje ihale bedeli (paket bazlı) */
  yaklasikIhaleBedeli?: YaklasikIhaleBedeli
  /** Soru / cevap kayıtları */
  sorular?: Soru[]
  /** Şantiyecinin önerdiği firmalar (Önerilen Firmalar listesi) */
  onerilenFirmalar?: AltYuklenici[]
  notlar?: string
}

export type KesifSatiri = {
  id: string
  /** 1 = ana grup (bold), 2 = kalem, 3 = alt kalem */
  seviye: 1 | 2 | 3
  pozNo: string
  pozTanimi: string
  aciklama?: string
  birim: string
  miktar: number
  teklifKirilimi: 'Malzeme' | 'İşçilik' | 'GGK' | 'Nakliye' | 'Malzeme + İşçilik'
  /** Fiyat alanları — keşif aşamasında girilmez (teklif aşamasında dolar) */
  malzeme?: number
  iscilik?: number
  ggk?: number
  birimMaliyet?: number
  birimFiyat?: number
  markaModel?: string
  not?: string
  /**
   * Yorum / devam satırı: numarası olmayan açıklama metni (çok satırlı poz açıklamasının devamı,
   * kapsam notu…). Metin `pozTanimi`'ndadır; poz sayılmaz, numaralanmaz, doğrulanmaz, toplamlara girmez.
   */
  yorum?: boolean
  /** İçe aktarmada otomatik numaralandırılmadan önceki özgün kod (ör. "AHU 01", "V.1.") */
  kaynakKodu?: string
  /**
   * Hiyerarşi seviyesi 1–9: numaradaki nokta sayısı + 1 ("01" → 1, "01.02" → 2, "01.02.01" → 3).
   * Tabloda Poz No yerine Level gösterilir; yorum satırlarında Level "C" yazılır (`yorum`). Boşsa Poz No'dan türetilir.
   */
  level?: number
  /** Özel sütun değerleri (sütun anahtarı → sayı): "Nakliye" gibi maliyet sütunları, "Fittings" gibi katsayılar */
  ekDegerler?: Record<string, number>
}

/**
 * Keşif tablosuna eklenen özel sütun. `maliyet`: Birim Fiyat toplamına eklenir (ör. Nakliye).
 * `katsayi`: hemen solundaki sütunu çarpar; Birim Fiyat'ın hemen solundaysa maliyet toplamını çarpar
 * (ör. Fittings 1,5; boş = 1).
 */
export type KesifEkSutun = {
  key: string
  baslik: string
  tur: 'maliyet' | 'katsayi'
  /** Hangi sütunun sağına yerleştirildiği (Malzeme / İşçilik / GGK ya da başka bir özel sütun) */
  sonra: string
}

export type ProjeBelge = {
  id: string
  ad: string
  tur: string
  boyut: string
  yuklendigiTarihi?: string
  zorunlu: boolean
  turTipi: 'bft' | 'imalat-sartname' | 'isveren-sartname' | 'cizim' | 'is-programi' | 'diger'
  /** Belgenin tutulduğu klasör */
  klasor?: string
}

/**
 * Ön değerlendirme (finansal) durumu — portalın ilk ekseni.
 *  · basarili    : ön değerlendirme tamamlandı ve başarılı (mavi işaret)
 *  · basarisiz   : ön değerlendirme tamamlandı, eşiğin altında (kırmızı işaret)
 *  · bekliyor    : ön değerlendirme henüz tamamlanmadı (sarı işaret)
 *  · portalda-yok: firma portala kayıt yaptırmadı (gri işaret)
 */
export type DegerlendirmeDurumu = 'basarili' | 'basarisiz' | 'bekliyor' | 'portalda-yok'

export type AltYuklenici = {
  id: string
  firma: string
  uzmanlik: string
  skor: number
  yetkiBelgesi: string
  vergiLevhasi: string
  /** İletişim e-posta adresi */
  iletisim: string
  davetTarihi?: string
  /** Onaya gönderilme tarihi */
  onayaGonderilmeTarihi?: string
  /** Onaylanma tarihi */
  onaylanmaTarihi?: string
  /** Öneri notu */
  not?: string
  /** Mali sorumlu (öneri mailinde cc) */
  maliSorumlu?: string
  /** Ön değerlendirme durumu (finansal) */
  degerlendirme?: DegerlendirmeDurumu
  /** Ön değerlendirme puanı (0-100) */
  degerlendirmePuani?: number
  /** Onay durumu — ihale yöneticileri / direktör onayı (ikinci eksen) */
  durum:
    | 'onaya-gonderilmedi'
    | 'onaya-gonderildi'
    | 'onaylandi'
    | 'davet-edildi'
    | 'reddedildi'
}

/** Alt yüklenici onay kaydı — davetten önce ilgili onay makamlarına gönderilir */
export type OnayKaydi = {
  id: string
  firmaId: string
  firma: string
  /** Onaylayacak kullanıcı id'leri */
  onaylayanlar: string[]
  /** Onaya gönderilme tarihi */
  tarih: string
  /** Onaylanma tarihi */
  onaylanmaTarihi?: string
  durum: 'bekliyor' | 'onaylandi' | 'reddedildi'
}

/** Yaklaşık ihale bedeli — her ihale paketine özeldir */
export type YaklasikIhaleBedeli = {
  tutar: string
  paraBirimi: string
  avansOrani: string
}

/** Sözleşmeye dönüşmüş keşif — herkese açık kayıt */
export type SozlesmeyeDonusmusKesif = {
  id: string
  projeId: string
  paketId: string
  sozlesmeNo: string
  sozlesmeTarihi: string
  sozlesmeTutari: string
  paraBirimi: string
  durum: 'Sozleşmeli' | 'Devam Ediyor' | 'Tamamlandı'
  keşif: KesifSatiri[]
}

export type Bildirim = {
  id: string
  bildirimNo: string
  fonksiyon: string
  baslik: string
  aciklama: string
  zaman: string
  okundu: boolean
  hedefRol: string
  projeId?: string
  paketId?: string
  tip: 'talep' | 'onay' | 'revize' | 'bilgi'
  mailGonderildiMi?: boolean
}
