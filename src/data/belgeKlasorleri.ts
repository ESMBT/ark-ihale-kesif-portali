export type BelgeKlasoru = {
  id: string
  ad: string
  ikon: string
  /** Bu klasörde hangi belge tipleri beklenir */
  turler: string[]
}

/** İhale paketi belge klasörleri — soldaki ağaç ve sağdaki içerik bu listeye göre çalışır */
export const belgeKlasorleri: BelgeKlasoru[] = [
  { id: 'bft-1', ad: 'BFT Belgeleri', ikon: 'file-text', turler: ['BFT'] },
  { id: 'imalat', ad: 'İmalat Teklif Şartnamesi', ikon: 'file-text', turler: ['İmalat Teklif Şartnamesi'] },
  { id: 'isveren', ad: 'İşveren Teknik Şartnameleri', ikon: 'file-text', turler: ['İşveren Teknik Şartnameleri'] },
  { id: 'cizim', ad: 'Çizimler', ikon: 'layers', turler: ['Çizim'] },
  { id: 'program', ad: 'İş Programı', ikon: 'calendar', turler: ['İş Programı'] },
]
