import type { Tone } from './types'

/** İHALE SÜRECİ DURUMLARI (İhale Yönetimi ekranı) */
export type IhaleSurecDurumu =
  | 'eksik-bekleniyor'
  | 'ihale-cikilacak'
  | 'ilk-tur'
  | 'tur-2'
  | 'tur-3'
  | 'tur-4'
  | 'tur-5'
  | 'tur-6'
  | 'tur-7'
  | 'normalize'
  | 'pazarlik'
  | 'sonuclandi'
  | 'iptal'
  | 'durduruldu'
  | 'e-ihale'

type DurumTanimi = { label: string; tone: Tone; kisa: string }

export const ihaleSurecDurumlari: Record<IhaleSurecDurumu, DurumTanimi> = {
  'eksik-bekleniyor': {
    label: 'Eksiklerin tamamlanması için şantiyeden geri dönüş bekleniyor',
    kisa: 'Geri dönüş bekleniyor',
    tone: 'danger',
  },
  'ihale-cikilacak': { label: 'İhale çıkılacak', kisa: 'İhale çıkılacak', tone: 'info' },
  'ilk-tur': { label: 'İlk tur teklifler bekleniyor', kisa: '1. tur', tone: 'warning' },
  'tur-2': { label: '2. tur teklifler bekleniyor', kisa: '2. tur', tone: 'warning' },
  'tur-3': { label: '3. tur teklifler bekleniyor', kisa: '3. tur', tone: 'warning' },
  'tur-4': { label: '4. tur teklifler bekleniyor', kisa: '4. tur', tone: 'warning' },
  'tur-5': { label: '5. tur teklifler bekleniyor', kisa: '5. tur', tone: 'warning' },
  'tur-6': { label: '6. tur teklifler bekleniyor', kisa: '6. tur', tone: 'warning' },
  'tur-7': { label: '7. tur teklifler bekleniyor', kisa: '7. tur', tone: 'warning' },
  normalize: {
    label: 'Normalize gönderildi geri dönüş bekleniyor',
    kisa: 'Normalize',
    tone: 'info',
  },
  pazarlik: { label: 'Pazarlık aşaması', kisa: 'Pazarlık', tone: 'warning' },
  sonuclandi: { label: 'İhale sonuçlandı', kisa: 'Sonuçlandı', tone: 'success' },
  iptal: { label: 'İhale iptal edildi', kisa: 'İptal', tone: 'danger' },
  durduruldu: { label: 'İhale durduruldu', kisa: 'Durduruldu', tone: 'danger' },
  'e-ihale': { label: 'E-ihale yapılacak', kisa: 'E-ihale', tone: 'purple' },
}

export const ihaleSurecDurumListesi: IhaleSurecDurumu[] = [
  'eksik-bekleniyor',
  'ihale-cikilacak',
  'ilk-tur',
  'tur-2',
  'tur-3',
  'tur-4',
  'tur-5',
  'tur-6',
  'tur-7',
  'normalize',
  'pazarlik',
  'sonuclandi',
  'iptal',
  'durduruldu',
  'e-ihale',
]

/** İHALE PAKETİ DURUMLARI (paket seviyesi — yayın akışı) */
export type PaketDurumu = 'taslak' | 'yayinlandi' | 'hold' | 'iptal' | 'sozlesme-imzalandi'

export const paketDurumlari: Record<PaketDurumu, DurumTanimi> = {
  taslak: { label: 'Taslak', kisa: 'Taslak', tone: 'neutral' },
  yayinlandi: { label: 'Yayınlandı', kisa: 'Yayınlandı', tone: 'info' },
  hold: { label: 'Hold', kisa: 'Hold', tone: 'warning' },
  iptal: { label: 'İptal', kisa: 'İptal', tone: 'danger' },
  'sozlesme-imzalandi': { label: 'Sözleşme İmzalandı', kisa: 'Sözleşme İmzalandı', tone: 'success' },
}

export const paketDurumListesi: PaketDurumu[] = [
  'taslak',
  'yayinlandi',
  'hold',
  'iptal',
  'sozlesme-imzalandi',
]
