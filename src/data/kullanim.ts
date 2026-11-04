/**
 * KULLANICI, EKİP, YETKİ, ROL VE ROL–YETKİ EŞLEŞTİRME MODELLERİ
 * Detaylı süreç analizi maddeleri:
 *  · Kullanıcı listesinin oluşturulması
 *  · Rol ve yetki listesinin oluşturulması
 *  · Kullanıcılar ile örgütlerin (ekiplerin) eşleştirilmesi
 */

export type Kullanicilar = {
  id: string
  ad: string
  soyad: string
  /** Bağlı olduğu ekip (ekip id) */
  ekipId: string
  /** Bağlı olduğu rol (rol id) */
  rolId?: string
  mail: string
  unvan?: string
}

export type Ekip = {
  id: string
  ad: string
  aciklama: string
}

export type Yetki = {
  id: string
  ad: string
  aciklama: string
  /** Bu yetkiye bağlı kullanıcı id'leri */
  kullanicilar: string[]
}

export type Rol = {
  id: string
  ad: string
  aciklama: string
}

export type EslesmeDurumu = 'eslesti' | 'eslesmedi'

export type RolYetkiEslesmesi = {
  id: string
  rolId: string
  yetkiId: string
  durum: EslesmeDurumu
}

/* ---------------------------------------------------------------- */
/*  Başlangıç verileri                                                */
/* ---------------------------------------------------------------- */

export const ekipler: Ekip[] = [
  { id: 'EK-01', ad: 'Şantiye İşleri Ekibi', aciklama: 'Sahada icra edilen işler, keşif çalışmaları ve ihale dosyası hazırlığı' },
  { id: 'EK-02', ad: 'İhale Ekibi', aciklama: 'İhale paketlerinin hazırlanması, teklif karşılaştırması ve ihale kontrolü' },
  { id: 'EK-03', ad: 'Hakediş ve Finans Ekibi', aciklama: 'Hakediş, teminat, avans ve mali süreçlerin yürütülmesi' },
  { id: 'EK-04', ad: 'Proje Yönetimi Ekibi', aciklama: 'Proje kartı yönetimi, saha koordinasyonu ve onay akışları' },
]

export const kullanicilar: Kullanicilar[] = [
  { id: 'K-001', ad: 'Furkan', soyad: 'Aydın', ekipId: 'EK-01', rolId: 'RL-01', mail: 'furkan.aydin@arkinsaat.com.tr', unvan: 'Şantiye Şefi' },
  { id: 'K-002', ad: 'Hilal', soyad: 'Özer', ekipId: 'EK-03', rolId: 'RL-02', mail: 'hilal.ezer@arkinsaat.com.tr', unvan: 'Hakediş Mühendisi' },
  { id: 'K-003', ad: 'Nevin', soyad: 'Kaya', ekipId: 'EK-02', rolId: 'RL-06', mail: 'nevin.kaya@arkinsaat.com.tr', unvan: 'Teklif ve İhale Uzmanı' },
  { id: 'K-004', ad: 'Sena', soyad: 'Demir', ekipId: 'EK-04', rolId: 'RL-04', mail: 'sena.demir@arkinsaat.com.tr', unvan: 'Proje Müdürü' },
  { id: 'K-005', ad: 'Hakan', soyad: 'Öztürk', ekipId: 'EK-04', rolId: 'RL-01', mail: 'hakan.ozturk@arkinsaat.com.tr', unvan: 'Şantiye Şefi' },
]

export const yetkiler: Yetki[] = [
  { id: 'YT-01', ad: 'Proje Kartı Görüntüleme', aciklama: 'Proje kartındaki bilgileri görüntüleme', kullanicilar: ['K-004', 'K-005'] },
  { id: 'YT-02', ad: 'Proje Kartı Düzenleme', aciklama: 'Proje kartı alanlarını güncelleme ve SAP talebi oluşturma', kullanicilar: ['K-004', 'K-005'] },
  { id: 'YT-03', ad: 'Keşif Yükleme', aciklama: 'Keşif satırlarını yükleme, düzenleme ve Excel içe/dışa aktarma', kullanicilar: ['K-001'] },
  { id: 'YT-04', ad: 'İhale Paketi Oluşturma', aciklama: 'İhale paketi oluşturma ve ihale dosyası alanlarını doldurma', kullanicilar: ['K-001', 'K-003'] },
  { id: 'YT-05', ad: 'Teklif Görüntüleme', aciklama: 'Alt yüklenici tekliflerini ve tur bilgilerini görüntüleme', kullanicilar: ['K-003'] },
  { id: 'YT-06', ad: 'Belge Yükleme', aciklama: 'İhale dosyası belgelerini ve çizimleri yükleme', kullanicilar: ['K-001'] },
  { id: 'YT-07', ad: 'Alt Yüklenici Daveti', aciklama: 'Alt yüklenici seçme ve davet maili gönderme', kullanicilar: ['K-001', 'K-003'] },
  { id: 'YT-08', ad: 'Kullanıcı ve Ekip Yönetimi', aciklama: 'Kullanıcı, ekip, rol ve yetki kayıtlarını yönetme', kullanicilar: ['K-005'] },
]

export const roller: Rol[] = [
  { id: 'RL-01', ad: 'Şantiyeci', aciklama: 'Sahada görevli şantiye personeli — keşif ve belge yükleme' },
  { id: 'RL-02', ad: 'Şantiye İşleri Ekibi', aciklama: 'Keşif ve ihale dosyasını hazırlayan proje ekibi' },
  { id: 'RL-03', ad: 'İhale Yönetimi', aciklama: 'İhale paketlerini yöneten, revize isteyen ve onaylayan rol' },
  { id: 'RL-04', ad: 'Proje Müdürü', aciklama: 'Projenin teknik ve mali yönetiminden sorumlu rol' },
  { id: 'RL-05', ad: 'Direktör', aciklama: 'Proje sahibi; onay akışlarında nihai onay merci' },
  { id: 'RL-06', ad: 'İhale Ekibi', aciklama: 'İhale dosyası kontrolü, teklif mukayese ve ihale kararı' },
]

export const rolYetkiEslesmeleri: RolYetkiEslesmesi[] = [
  { id: 'ES-01', rolId: 'RL-01', yetkiId: 'YT-03', durum: 'eslesti' },
  { id: 'ES-02', rolId: 'RL-01', yetkiId: 'YT-06', durum: 'eslesti' },
  { id: 'ES-03', rolId: 'RL-02', yetkiId: 'YT-01', durum: 'eslesti' },
  { id: 'ES-04', rolId: 'RL-02', yetkiId: 'YT-04', durum: 'eslesti' },
  { id: 'ES-05', rolId: 'RL-03', yetkiId: 'YT-05', durum: 'eslesti' },
  { id: 'ES-06', rolId: 'RL-03', yetkiId: 'YT-07', durum: 'eslesti' },
  { id: 'ES-07', rolId: 'RL-04', yetkiId: 'YT-02', durum: 'eslesti' },
  { id: 'ES-08', rolId: 'RL-04', yetkiId: 'YT-05', durum: 'eslesmedi' },
  { id: 'ES-09', rolId: 'RL-05', yetkiId: 'YT-01', durum: 'eslesti' },
  { id: 'ES-10', rolId: 'RL-06', yetkiId: 'YT-05', durum: 'eslesti' },
]
