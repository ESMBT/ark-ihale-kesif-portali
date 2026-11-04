import { projeKartiAlanlari, ihaleDosyasiAlanlari, sapProjeler } from '../data/mock'
import { turZorunluAlanlari } from '../data/sozlesmeTurleri'
import type { IhaleDosyasiAlani, KaynakTipi, Proje, ProjeKartiAlani, SapProje, Tone } from '../data/types'

/* ---------------------------------------------------------------- */
/*  Kaynak rozetleri — ana-veri Excel'indeki "Kaynak" sütunundan      */
/* ---------------------------------------------------------------- */

export const kaynakEtiket: Record<KaynakTipi, string> = {
  secim: 'Listeden seçilir',
  sap: 'SAP (otomatik)',
  'sap-planli': 'SAP alanı eklenecek',
  manuel: 'Manuel giriş',
  sistem: 'Sistem',
}

export const kaynakTone: Record<KaynakTipi, Tone> = {
  secim: 'info',
  sap: 'success',
  'sap-planli': 'warning',
  manuel: 'warning',
  sistem: 'neutral',
}

/** Talep ekranında alanın nasıl doldurulacağını anlatan etiket */
export function talepKaynakEtiket(alan: ProjeKartiAlani): string {
  if (alan.secimKaynagi === 'personel') return 'Seçilecek'
  if (alan.kaynak === 'sap') return 'SAP (otomatik)'
  if (alan.kaynak === 'sap-planli') return 'Manuel doldurulacak'
  if (alan.kaynak === 'secim') return 'Listeden seçilir'
  return 'Manuel giriş'
}

export function talepKaynakTone(alan: ProjeKartiAlani): Tone {
  if (alan.secimKaynagi === 'personel') return 'info'
  if (alan.kaynak === 'sap') return 'success'
  if (alan.kaynak === 'sap-planli') return 'warning'
  if (alan.kaynak === 'secim') return 'info'
  return 'warning'
}

/** Alan zorunluluğu — koşullu alanlar sözleşme türüne göre açılır */
export function alanZorunluMu(alan: ProjeKartiAlani, kart: Record<string, string>): boolean {
  if (alan.zorunluluk === 'zorunlu') return true
  if (alan.id === 'isverenSozlesmeTutari') {
    const tur = kart.idariSozlesmeTuru
    return tur === 'Birim Fiyatlı' || tur === 'Götürü Bedel'
  }
  if (alan.id === 'maliyetKarOrani') {
    return kart.idariSozlesmeTuru === 'Maliyet + Kar'
  }
  return false
}

export function alanAcikMi(_alan: ProjeKartiAlani, deger: string | undefined): boolean {
  if (!deger) return false
  return deger.trim().length > 0
}

/** Bir blokta eksik kalan zorunlu alanlar */
export function eksikZorunlular(
  alanlar: ProjeKartiAlani[],
  kart: Record<string, string>,
): ProjeKartiAlani[] {
  return alanlar.filter(
    (a) => !a.gizli && alanZorunluMu(a, kart) && !alanAcikMi(a, kart[a.id]),
  )
}

/** Çoklu seçim alanı: "A | B | C" biçimindeki değeri listeye çevirir */
export function cokluDegerler(deger?: string): string[] {
  if (!deger) return []
  return deger
    .split('|')
    .map((x) => x.trim())
    .filter(Boolean)
}

/** Çoklu seçim alanı: seçilen değerleri saklama biçimine çevirir */
export function cokluBirlestir(degerler: string[]): string {
  return degerler.join(' | ')
}

/** Alan değerini ekranda gösterilecek biçime çevirir (çoklu seçimler virgülle) */
export function alanDegeri(alan: ProjeKartiAlani, deger?: string): string {
  if (!deger) return ''
  if (alan.coklu) return cokluDegerler(deger).join(', ')
  return deger
}

/** Proje Kartı tamamlanma oranı (0-100) */
export function kartDolulukOrani(kart: Record<string, string>): number {
  const zorunlu = projeKartiAlanlari.filter((a) => a.zorunluluk === 'zorunlu')
  if (zorunlu.length === 0) return 100
  const dolu = zorunlu.filter((a) => alanAcikMi(a, kart[a.id])).length
  return Math.round((dolu / zorunlu.length) * 100)
}

/** İhale dosyası zorunlu alan doluluk oranı */
export function ihaleDosyasiDoluluk(proje: Proje): number {
  const zorunlu = ihaleDosyasiAlanlari.filter((a) => a.zorunluluk === 'zorunlu')
  if (zorunlu.length === 0) return 100
  const dolu = zorunlu.filter((a) => (proje.ihaleDosyasi[a.id] ?? '').trim().length > 0).length
  return Math.round((dolu / zorunlu.length) * 100)
}

/* ---------------------------------------------------------------- */
/*  SAP proje listesi → proje kartı ön dolgu                          */
/* ---------------------------------------------------------------- */

export function sapProjedenKart(sap: SapProje): Record<string, string> {
  return {
    projeKodu: sap.kod,
    projeAdi: sap.ad,
    idare: sap.idare,
    kontrolMusavir: sap.musavir,
    lokasyon: sap.lokasyon,
    idariSozlesmeTuru: sap.soztip,
    isverenSozlesmeTutari: sap.sozlesmeTutari,
    maliyetKarOrani: sap.maliyetKarOrani,
    geciciKabulTarihi: sap.geciciKabul,
    idariSozlesmeAvansi: sap.avans,
    kesinTeminati: sap.kesinTeminat,
    nakitTeminati: sap.nakitTeminat,
    direktor: sap.direktor,
    koordinator: sap.koordinator,
    projeMuduru: sap.projeMuduru,
    santiyeSefi: sap.santiyeSefi,
    teknikOfisYetkilisi: sap.teknikOfis,
    sahaSorumlusu: sap.sahaSorumlusu,
    muhasebeYetkilisi: sap.muhasebeYetkilisi,
    maliIslerYoneticisi: sap.maliIsler,
    kapaliAlanlar: sap.alanlar.kapaliAlanlar ?? '',
    acikAlanlar: sap.alanlar.acikAlanlar ?? '',
    binaOturumAlani: sap.alanlar.binaOturumAlani ?? '',
    cepheAlani: sap.alanlar.cepheAlani ?? '',
    catiAlani: sap.alanlar.catiAlani ?? '',
    yesilAlanlar: sap.alanlar.yesilAlanlar ?? '',
    sertPeyzaj: sap.alanlar.sertPeyzaj ?? '',
    yollar: sap.alanlar.yollar ?? '',
  }
}

export function sapProjeBul(kod: string): SapProje | undefined {
  return sapProjeler.find((p) => p.kod === kod)
}

/* ---------------------------------------------------------------- */
/*  İhale dosyası alan yardımcıları                                   */
/* ---------------------------------------------------------------- */

export function ihaleAlaniZorunluMu(alan: IhaleDosyasiAlani): boolean {
  return alan.zorunluluk === 'zorunlu'
}

export function ihaleAlanlari(blok: IhaleDosyasiAlani['blok']): IhaleDosyasiAlani[] {
  return ihaleDosyasiAlanlari.filter((a) => a.blok === blok)
}

/* ---------------------------------------------------------------- */
/*  İhale paketi eksik alan kontrolü                                 */
/* ---------------------------------------------------------------- */

/** Sözleşme türüne göre zorunlu olup boş bırakılan alanlar */
export function eksikAlanlar(paket: {
  alanlar?: Record<string, string>
  sozlesmeTuru?: string
}): { id: string; ad: string }[] {
  return turZorunluAlanlari(paket.sozlesmeTuru)
    .filter((a) => !(paket.alanlar?.[a.id] ?? '').trim())
    .map((a) => ({ id: a.id, ad: a.ad }))
}

/** Bilgi tamamlama durumu: eksik alan sayısı */
export function bilgiDurumu(paket: { alanlar?: Record<string, string>; sozlesmeTuru?: string }) {
  const eksik = eksikAlanlar(paket)
  return { eksikSayisi: eksik.length, eksik, tamam: eksik.length === 0 }
}

/* ---------------------------------------------------------------- */
/*  Tarih / sayı biçimleme                                           */
/* ---------------------------------------------------------------- */

export function para(value: string | undefined): string {
  if (!value) return '—'
  return value
}

export function yuzde(value: string | undefined): string {
  if (!value) return '—'
  return value.includes('%') ? value : `%${value}`
}

export function tarihBugun(): string {
  const d = new Date()
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${pad(d.getDate())}.${pad(d.getMonth() + 1)}.${d.getFullYear()}`
}
