/**
 * İHALE VE SÖZLEŞME BELGELERİ (STANDART EKLER)
 * Kaynak: "03. Teklif & İhale & Sözleşme / ÖRNEK İHALE DOSYASI" klasör yapısı.
 *  · İhale Belgeleri    : ihale dosyasının ekleri (Keşif ve Teklif · BFT · Şartnameler · Çizimler · İş Programı)
 *  · Sözleşme Belgeleri: standart sözleşme ekleri — görüntülenir / indirilir
 */

export type BelgeGrubu = 'ihale' | 'sozlesme'

export type BelgeKlasoru = {
  id: string
  ad: string
}

export type SozlesmeBelgesi = {
  ekNo: string
  ad: string
  dosyaAdi: string
  grup: BelgeGrubu
  klasor: string
}

/** İhale Belgeleri altındaki standart klasörler */
export const standartKlasorler: BelgeKlasoru[] = [
  { id: 'kesif-teklif', ad: 'Keşif ve Teklif' },
  { id: 'bft', ad: 'BFT Belgeleri' },
  { id: 'sartname', ad: 'Şartnameler' },
  { id: 'cizim', ad: 'Çizimler' },
  { id: 'program', ad: 'İş Programı' },
]

export const ihaleBelgeleri: SozlesmeBelgesi[] = [
  {
    ekNo: '01',
    ad: 'TEKLİF MEKTUBU - TL',
    dosyaAdi: 'Ek-01-TEKLİF MEKTUBU - TL .docx',
    grup: 'ihale',
    klasor: 'kesif-teklif',
  },
  {
    ekNo: '02',
    ad: 'TEKLIF KESIF LISTESI r5',
    dosyaAdi: 'Ek-02-TEKLIF KESIF LISTESI_r5.XLSx',
    grup: 'ihale',
    klasor: 'kesif-teklif',
  },
  {
    ekNo: '03A',
    ad: '03a SMS MEGA MİMARİ REV02 BFT',
    dosyaAdi: 'Ek-03a_SMS_MEGA_MİMARİ_REV02_BFT.docx',
    grup: 'ihale',
    klasor: 'bft',
  },
  {
    ekNo: '03B',
    ad: '03b SMS REFİT MİMARİ REV02 BFT',
    dosyaAdi: 'Ek-03b_SMS_REFİT_MİMARİ_REV02_BFT.docx',
    grup: 'ihale',
    klasor: 'bft',
  },
  {
    ekNo: '03C',
    ad: '03c SMS YEMEKHANE MİMARİ REV01 BFT',
    dosyaAdi: 'Ek-03c_SMS_YEMEKHANE_MİMARİ_REV01_BFT.docx',
    grup: 'ihale',
    klasor: 'bft',
  },
  {
    ekNo: '03D',
    ad: '03d SMS YÖNETİM MİMARİ REV01 BFT',
    dosyaAdi: 'Ek-03d_SMS_YÖNETİM_MİMARİ_REV01_BFT.docx',
    grup: 'ihale',
    klasor: 'bft',
  },
  {
    ekNo: '03E',
    ad: '03e SMS GÜVENLİK MİMARİ REV01 BFT',
    dosyaAdi: 'Ek-03e_SMS_GÜVENLİK_MİMARİ_REV01_BFT.docx',
    grup: 'ihale',
    klasor: 'bft',
  },
  {
    ekNo: '04',
    ad: 'FR 65 ALT İŞVEREN TEKLİF ALMA GENEL ŞARTLARI REV-04 FORMU (Mimari)',
    dosyaAdi: 'Ek-04-FR 65 ALT İŞVEREN TEKLİF ALMA GENEL ŞARTLARI REV-04 FORMU (Mimari).DOC',
    grup: 'ihale',
    klasor: 'sartname',
  },
  {
    ekNo: '05',
    ad: 'SOZLESME',
    dosyaAdi: 'Ek-05- SOZLESME.pdf',
    grup: 'ihale',
    klasor: 'sartname',
  },
  {
    ekNo: '06',
    ad: 'ALTYUKLENICI GENEL TEKNİK SARTNAMESI Rev 6 13 05 19',
    dosyaAdi: 'Ek-06-ALTYUKLENICI GENEL TEKNİK SARTNAMESI Rev 6_13 05 19.doc',
    grup: 'ihale',
    klasor: 'sartname',
  },
  {
    ekNo: '08',
    ad: 'IX KIŞISEL VERILERIN KORUNMASI SÖZLEŞMESI 08 04 19',
    dosyaAdi: 'Ek-08-IX KIŞISEL VERILERIN KORUNMASI SÖZLEŞMESI_08 04 19.doc',
    grup: 'ihale',
    klasor: 'sartname',
  },
  {
    ekNo: '29',
    ad: 'YER GÖRME BELGESI',
    dosyaAdi: 'Ek-29-YER GÖRME BELGESI.docx',
    grup: 'ihale',
    klasor: 'sartname',
  },
  {
    ekNo: '07',
    ad: 'TAAHHÜTNAME 22 03 2012',
    dosyaAdi: 'Ek-07-TAAHHÜTNAME _22 03 2012.pdf',
    grup: 'sozlesme',
    klasor: 'sozlesme',
  },
  {
    ekNo: '09',
    ad: 'KISISEL VERILERIN KORUNMASI TAAHHUTNAMESI 10 11 18 Rev',
    dosyaAdi: 'Ek-09-KISISEL VERILERIN KORUNMASI TAAHHUTNAMESI_10 11 18 Rev.pdf',
    grup: 'sozlesme',
    klasor: 'sozlesme',
  },
  {
    ekNo: '10',
    ad: 'ALTIŞVEREN YETKILISI AYDINLATMA METNI.10 10 11 18',
    dosyaAdi: 'Ek-10-ALTIŞVEREN YETKILISI AYDINLATMA METNI.10 10 11 18.pdf',
    grup: 'sozlesme',
    klasor: 'sozlesme',
  },
  {
    ekNo: '11',
    ad: 'YAPI İŞLERİNDE SAĞLIK ve GÜVENLİK YÖNETMELİĞ 05.10.2013',
    dosyaAdi: 'Ek-11-YAPI İŞLERİNDE SAĞLIK ve GÜVENLİK YÖNETMELİĞ_05.10.2013.pdf',
    grup: 'sozlesme',
    klasor: 'sozlesme',
  },
  {
    ekNo: '12',
    ad: 'FR-14.4-ALTYÜKLENİCİ İŞE BAŞLAMA TOPLANTI KARARLARI LİSTESİ',
    dosyaAdi: 'Ek-12-FR-14.4-ALTYÜKLENİCİ İŞE BAŞLAMA TOPLANTI KARARLARI LİSTESİ.pdf',
    grup: 'sozlesme',
    klasor: 'sozlesme',
  },
  {
    ekNo: '13',
    ad: 'TLM 19 İSKELELERE İLİŞKİN GÜVENLİK TALİMATI',
    dosyaAdi: 'Ek-13-TLM 19 İSKELELERE İLİŞKİN GÜVENLİK TALİMATI.pdf',
    grup: 'sozlesme',
    klasor: 'sozlesme',
  },
  {
    ekNo: '14',
    ad: 'FR-OP-03.01 YÜKSEKTE ÇALIŞMA IZIN FORMU',
    dosyaAdi: 'Ek-14-FR-OP-03.01 YÜKSEKTE ÇALIŞMA IZIN FORMU.pdf',
    grup: 'sozlesme',
    klasor: 'sozlesme',
  },
  {
    ekNo: '15',
    ad: 'FR 44 İSKELE KONTROL FORMU',
    dosyaAdi: 'Ek-15-FR 44 İSKELE KONTROL FORMU.pdf',
    grup: 'sozlesme',
    klasor: 'sozlesme',
  },
  {
    ekNo: '16',
    ad: 'TLM-27 ŞANTİYE TALİMATNAMESİ',
    dosyaAdi: 'Ek-16-TLM-27 ŞANTİYE TALİMATNAMESİ.pdf',
    grup: 'sozlesme',
    klasor: 'sozlesme',
  },
  {
    ekNo: '17',
    ad: 'TLM-28 GÜVENLİK İŞLERİ TALİMATI',
    dosyaAdi: 'Ek-17-TLM-28 GÜVENLİK İŞLERİ TALİMATI.pdf',
    grup: 'sozlesme',
    klasor: 'sozlesme',
  },
  {
    ekNo: '18',
    ad: 'TLM-31 KİŞİSEL KORUYUCU KULLANMA TALİMATI',
    dosyaAdi: 'Ek-18- TLM-31 KİŞİSEL KORUYUCU KULLANMA TALİMATI.pdf',
    grup: 'sozlesme',
    klasor: 'sozlesme',
  },
  {
    ekNo: '19',
    ad: 'TLM-31 EK.3 KKD TAAHHÜTNAME.docx',
    dosyaAdi: 'Ek-19-TLM-31 EK.3 KKD TAAHHÜTNAME.docx.pdf',
    grup: 'sozlesme',
    klasor: 'sozlesme',
  },
  {
    ekNo: '20',
    ad: 'TLM-31 EK.4 KKD Posteri',
    dosyaAdi: 'Ek-20-TLM-31 EK.4 KKD Posteri.pdf',
    grup: 'sozlesme',
    klasor: 'sozlesme',
  },
  {
    ekNo: '21',
    ad: 'TLM-32 MALZEME NAKLİYE VE YÜKLEME-BOŞALTMA TALİMATI',
    dosyaAdi: 'Ek-21-TLM-32 MALZEME NAKLİYE VE YÜKLEME-BOŞALTMA TALİMATI.pdf',
    grup: 'sozlesme',
    klasor: 'sozlesme',
  },
  {
    ekNo: '22',
    ad: 'ISG İŞ SAĞLIĞI VE GÜVENLİĞİ CEZA UYGULAMA LİSTESİ',
    dosyaAdi: 'Ek-22-ISG İŞ SAĞLIĞI VE GÜVENLİĞİ CEZA UYGULAMA LİSTESİ.pdf',
    grup: 'sozlesme',
    klasor: 'sozlesme',
  },
  {
    ekNo: '23',
    ad: 'TLM-32 Ek.1 TEH. BELİRLENMESİ VE UYG. GEREKEN KONTROL VE ÖNLEMLER TAB.',
    dosyaAdi: 'Ek-23-TLM-32 Ek.1 TEH. BELİRLENMESİ VE UYG. GEREKEN KONTROL VE ÖNLEMLER TAB..pdf',
    grup: 'sozlesme',
    klasor: 'sozlesme',
  },
  {
    ekNo: '24',
    ad: 'COVID GENELGESI',
    dosyaAdi: 'Ek-24-COVID GENELGESI.pdf',
    grup: 'sozlesme',
    klasor: 'sozlesme',
  },
  {
    ekNo: '25',
    ad: 'COVID SORUMLU GOREVI',
    dosyaAdi: 'Ek-25-COVID SORUMLU GOREVI.pdf',
    grup: 'sozlesme',
    klasor: 'sozlesme',
  },
  {
    ekNo: '26',
    ad: 'COVİD KONTROL SISTEMI',
    dosyaAdi: 'Ek-26-COVİD KONTROL SISTEMI.pdf',
    grup: 'sozlesme',
    klasor: 'sozlesme',
  },
  {
    ekNo: '27',
    ad: 'COVID TAHHUTNAMESI',
    dosyaAdi: 'Ek-27-COVID TAHHUTNAMESI.pdf',
    grup: 'sozlesme',
    klasor: 'sozlesme',
  },
  {
    ekNo: '28',
    ad: 'İHALE DÖKÜMANI TESLİM TUTANAĞI',
    dosyaAdi: 'Ek-28-İHALE DÖKÜMANI TESLİM TUTANAĞI.pdf',
    grup: 'sozlesme',
    klasor: 'sozlesme',
  },
  {
    ekNo: 'Ç01',
    ad: 'Mimari Plan 1/500 — Kongre Merkezi',
    dosyaAdi: 'Cizim_Mimari_Plan_1_500.pdf',
    grup: 'ihale',
    klasor: 'cizim',
  },
  {
    ekNo: 'Ç02',
    ad: 'Mekanik Proje — Isıtma Soğutma',
    dosyaAdi: 'Cizim_Mekanik_Proje.pdf',
    grup: 'ihale',
    klasor: 'cizim',
  },
  {
    ekNo: 'Ç03',
    ad: 'Elektrik Projesi 1/100',
    dosyaAdi: 'Cizim_Elektrik_Projesi.pdf',
    grup: 'ihale',
    klasor: 'cizim',
  },
  {
    ekNo: 'İP01',
    ad: 'İş Programı 24 Ay — Ana Metraj',
    dosyaAdi: 'Is_Programi_24_Ay_Ana_Metraj.xlsx',
    grup: 'ihale',
    klasor: 'program',
  },
  {
    ekNo: 'İP02',
    ad: 'İş Programı 24 Ay — İnce Metraj',
    dosyaAdi: 'Is_Programi_24_Ay_Ince_Metraj.xlsx',
    grup: 'ihale',
    klasor: 'program',
  },
  {
    ekNo: 'İP03',
    ad: 'İş Programı — Keşif ve Metraj Çıkarma Planı',
    dosyaAdi: 'Is_Programi_Kesif_Metraj_Plan.xlsx',
    grup: 'ihale',
    klasor: 'program',
  },
]

export const sozlesmeBelgeleri: SozlesmeBelgesi[] = ihaleBelgeleri.filter((b) => b.grup === 'sozlesme')

/** Davet eklerinde varsayılan gönderilen zorunlu sözleşme belgeleri */
export const zorunluDavetEklari = ['05', '06', '07', '29']

export function belgeBul(ekNo: string): SozlesmeBelgesi | undefined {
  return ihaleBelgeleri.find((b) => b.ekNo === ekNo)
}
