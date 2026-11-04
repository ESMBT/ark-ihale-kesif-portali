/* =================================================================
   MODÜL LİSTESİ
   -----------------------------------------------------------------
   Portaldaki modüllerin tek kaydı. Modüller şimdilik yalnızca
   listelenir; içerikleri tamamlandıkça ekranları ayrı ayrı yapılır.
   ================================================================= */

export type ModuleId = 'ihale' | 'alt-yuklenici' | 'santiyeci' | 'hakedis'

export type Modul = {
  id: ModuleId
  ad: string
  ikon: string
  aciklama: string
  /** Modülün içinde yer alacak bölümler (içerikleri yapım aşamasında) */
  bolumler: string[]
}

export const MODULLER: Modul[] = [
  {
    id: 'ihale',
    ad: 'İhale Yönetimi',
    ikon: 'gavel',
    aciklama:
      'İhale paketinin hazırlanması, ihale ekibine dağıtılması, tekliflerin toplanması ve sözleşmeye dönüştürülmesi.',
    bolumler: [
      'İhale Merkezi',
      'Dağıtım',
      'İhale Paketleri',
      'Ön Yeterlilik',
      'Mukayeseli Karşılaştırma',
      'Sözleşme Yönetimi',
      'Soru / Cevap',
    ],
  },
  {
    id: 'alt-yuklenici',
    ad: 'Alt Yüklenici Yönetimi',
    ikon: 'users',
    aciklama:
      'Tedarikçi havuzu, ön yeterlilik değerlendirmesi, belge takibi ve firma performansının izlenmesi.',
    bolumler: [
      'Firma Havuzu',
      'Ön Yeterlilik Değerlendirme',
      'Teklif & Davet Takibi',
      'Belge Yönetimi',
      'Performans & Puanlama',
      'Firma Kullanıcıları',
    ],
  },
  {
    id: 'santiyeci',
    ad: 'Şantiyeci Yönetimi',
    ikon: 'hard-hat',
    aciklama:
      'Proje kartı, keşif ve metraj, şantiye organizasyonu ile saha operasyonunun yürütüldüğü alan.',
    bolumler: [
      'Projeler',
      'Proje Kartı',
      'Keşif / Metraj',
      'Şantiye Organizasyonu',
      'Saha Günlükleri',
      'Planlama & Terminler',
    ],
  },
  {
    id: 'hakedis',
    ad: 'Hakediş Yönetimi',
    ikon: 'wallet',
    aciklama:
      'Hakediş listelerinin hazırlanması, onay zinciri, ödeme ve damga vergisi süreçlerinin yönetimi.',
    bolumler: [
      'Hakediş Listeleri',
      'Onay Akışı',
      'Ödemeler',
      'Damga Vergisi & Kesintiler',
      'Sözleşme Ödemeleri',
      'Raporlar',
    ],
  },
]
