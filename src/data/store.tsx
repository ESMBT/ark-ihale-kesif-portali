import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'
import {
  AKIF_KULLANICI_ID,
  bildirimler as baslangicBildirimler,
  projeler as baslangicProjeler,
  sapUzmani,
} from './mock'
import {
  ekipler as baslangicEkipler,
  rolYetkiEslesmeleri as baslangicEslesmeler,
  kullanicilar as baslangicKullanicilar,
  roller as baslangicRoller,
  yetkiler as baslangicYetkiler,
  type Ekip,
  type Kullanicilar,
  type Rol,
  type RolYetkiEslesmesi,
  type Yetki,
} from './kullanim'
import type {
  AltYuklenici,
  Bildirim,
  IhalePaketi,
  IhaleYonetimi,
  KesifSatiri,
  PaketDurumu,
  Proje,
  ProjeDurumu,
} from './types'

type TalepPayload = {
  sapKod: string
  ad: string
  kart: Record<string, string>
  notlar: string
  muhattapId: string
}

type Store = {
  projeler: Proje[]
  /** Şantiyeci erişim kapsamı: kendi oluşturduğu veya atandığı projeler */
  goruntulenenProjeler: Proje[]
  bildirimler: Bildirim[]
  /* Kullanıcı ve ekip yönetimi */
  kullanicilar: Kullanicilar[]
  ekipler: Ekip[]
  yetkiler: Yetki[]
  roller: Rol[]
  eslesmeler: RolYetkiEslesmesi[]
  kullaniciKaydet: (k: Kullanicilar) => void
  kullaniciSil: (id: string) => void
  ekipKaydet: (e: Ekip) => void
  ekipSil: (id: string) => void
  yetkiKaydet: (y: Yetki) => void
  yetkiSil: (id: string) => void
  rolKaydet: (r: Rol) => void
  rolSil: (id: string) => void
  eslemeKaydet: (e: RolYetkiEslesmesi) => void
  eslemeSil: (id: string) => void
  projeGetir: (id: string) => Proje | undefined
  paketGetir: (projeId: string, paketId: string) => IhalePaketi | undefined
  talepOlustur: (payload: TalepPayload) => string
  sapKodOlustur: (projeId: string) => void
  kartGuncelle: (projeId: string, kart: Record<string, string>, notlar?: string) => void
  ihaleDosyasiGuncelle: (projeId: string, deger: Record<string, string>) => void
  paketEkle: (
    projeId: string,
    ad: string,
    isTipi: IhalePaketi['isTipi'],
    alanlar?: Record<string, string>,
    sozlesmeTuru?: IhalePaketi['sozlesmeTuru'],
    sorumluId?: string,
  ) => void
  paketYayinla: (projeId: string, paketId: string) => void
  paketOnayaGonder: (
    projeId: string,
    paketId: string,
    firma: AltYuklenici,
    onaylayanlar: string[],
  ) => void
  paketOnayTamamla: (projeId: string, paketId: string, onayId: string) => void
  paketYaklasikBedel: (
    projeId: string,
    paketId: string,
    deger: { tutar: string; paraBirimi: string; avansOrani: string },
  ) => void
  firmaOnerTalebi: (
    projeId: string,
    paketId: string,
    firma: string,
    mail: string,
    yetkili: string,
    maliSorumlu: string,
    not: string,
  ) => void
  paketKlasorEkle: (projeId: string, paketId: string, ad: string) => void
  paketKlasorYenidenAdlandir: (projeId: string, paketId: string, id: string, ad: string) => void
  paketAlanGuncelle: (projeId: string, paketId: string, alanlar: Record<string, string>) => void
  paketSil: (projeId: string, paketId: string) => void
  soruEkle: (projeId: string, paketId: string, soru: string, soran: string) => void
  soruCevapla: (projeId: string, paketId: string, soruId: string, cevap: string, cevaplayan: string) => void
  ihaleAksiyonu: (
    projeId: string,
    paketId: string,
    ihale: IhaleYonetimi,
  ) => void
  paketGuncelle: (
    projeId: string,
    paketId: string,
    yama: Partial<Pick<IhalePaketi, 'ad' | 'isTipi' | 'alanlar'>>,
  ) => void
  paketDurum: (projeId: string, paketId: string, durum: PaketDurumu) => void
  keşifGuncelle: (projeId: string, paketId: string, satirlar: KesifSatiri[]) => void
  belgeEkle: (projeId: string, paketId: string, belge: IhalePaketi['belgeler'][number]) => void
  altYukleniciEkle: (projeId: string, paketId: string, firma: string) => void
  altYukleniciSec: (projeId: string, paketId: string, firma: AltYuklenici) => void
  altYukleniciKaldir: (projeId: string, paketId: string, firmaId: string) => void
  altYukleniciDavetEt: (projeId: string, paketId: string, firmaId: string) => void
  durumDegistir: (projeId: string, durum: ProjeDurumu, not?: string) => void
  paketOnayla: (projeId: string, paketId: string) => void
  paketRevize: (projeId: string, paketId: string, gerekce: string) => void
  bildirimOkundu: (id: string) => void
  tumBildirimlerOkundu: () => void
}

const StoreContext = createContext<Store | null>(null)

function simdi(): string {
  const d = new Date()
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${pad(d.getDate())}.${pad(d.getMonth() + 1)}.${d.getFullYear()} · ${pad(d.getHours())}:${pad(d.getMinutes())}`
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [projeler, setProjeler] = useState<Proje[]>(baslangicProjeler)
  const [bildirimler, setBildirimler] = useState<Bildirim[]>(baslangicBildirimler)
  const [kullanicilar, setKullanicilar] = useState<Kullanicilar[]>(baslangicKullanicilar)
  const [ekipler, setEkipler] = useState<Ekip[]>(baslangicEkipler)
  const [yetkiler, setYetkiler] = useState<Yetki[]>(baslangicYetkiler)
  const [roller, setRoller] = useState<Rol[]>(baslangicRoller)
  const [eslesmeler, setEslesmeler] = useState<RolYetkiEslesmesi[]>(baslangicEslesmeler)

  /**
   * Şantiyeci yalnızca kendi oluşturduğu veya kendisine atanan projeleri görür.
   * İhale ekibi gibi üst roller için tüm projeler listelenir.
   */
  const goruntulenenProjeler = useMemo(
    () =>
      projeler.filter(
        (p) =>
          p.sahip === 'Hakan Öztürk' ||
          p.atananKullanicilar?.includes(AKIF_KULLANICI_ID) ||
          p.ihaleEkipAtanan === 'Selçuk Bayındır',
      ),
    [projeler],
  )

  const projeGetir = useCallback((id: string) => projeler.find((p) => p.id === id), [projeler])

  const paketGetir = useCallback(
    (projeId: string, paketId: string) => projeler.find((p) => p.id === projeId)?.paketler.find((k) => k.id === paketId),
    [projeler],
  )

  const bildirimEkle = useCallback((b: Omit<Bildirim, 'id' | 'zaman'>) => {
    setBildirimler((prev) => [
      { ...b, id: `n-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, zaman: simdi() },
      ...prev,
    ])
  }, [])


  const talepOlustur = useCallback(
    (payload: TalepPayload) => {
      const id = `PRJ-2026-${String(projeler.length + 1).padStart(3, '0')}`
      const yeni: Proje = {
        id,
        kod: id,
        ad: payload.ad,
        durum: 'talep',
        asama: 'Keşif',
        talepTarihi: simdi(),
        guncellemeTarihi: simdi(),
        sahip: 'Hakan Öztürk',
        kart: payload.kart,
        ihaleDosyasi: {},
        paketler: [],
        notlar: payload.notlar,
        aktivite: [
          {
            tarih: simdi(),
            metin: `Proje kodu talebi oluşturuldu — mail + portal bildirimi gönderildi (${sapUzmani.ad})`,
            ikon: 'send',
          },
        ],
      }
      setProjeler((prev) => [yeni, ...prev])
      bildirimEkle({
        bildirimNo: '9001',
        fonksiyon: 'Proje Kodu Talep',
        baslik: `Proje Kodu Talebi — ${payload.sapKod}`,
        aciklama: `${payload.ad} için proje kodu talep edildi. SAP Uzmanı ${sapUzmani.ad} bilgilendirildi.`,
        okundu: false,
        hedefRol: 'SAP Uzmanı',
        projeId: id,
        tip: 'talep',
        mailGonderildiMi: true,
      })
      return id
    },
    [projeler.length, bildirimEkle],
  )

  const sapKodOlustur = useCallback(
    (projeId: string) => {
      const proje = projeler.find((p) => p.id === projeId)
      setProjeler((prev) =>
        prev.map((p) =>
          p.id === projeId
            ? {
                ...p,
                durum: 'proje-kodu-var',
                guncellemeTarihi: simdi(),
                aktivite: [
                  ...p.aktivite,
                  { tarih: simdi(), metin: `SAP proje kodu oluşturuldu — ${p.kart.projeKodu ?? ''}`, ikon: 'check-circle' },
                ],
              }
            : p,
        ),
      )
      bildirimEkle({
        bildirimNo: '9002',
        fonksiyon: 'Proje Kodu Talep',
        baslik: `Proje Kodu Oluşturuldu — ${proje?.kart.projeKodu ?? ''}`,
        aciklama: `${proje?.ad} için SAP proje kodu oluşturuldu. İhale dosyası ve keşif ekranları açıldı.`,
        okundu: false,
        hedefRol: 'Şantiyeci',
        projeId,
        tip: 'onay',
        mailGonderildiMi: true,
      })
    },
    [projeler, bildirimEkle],
  )

  const kartGuncelle = useCallback(
    (projeId: string, kart: Record<string, string>, notlar?: string) => {
      setProjeler((prev) =>
        prev.map((p) =>
          p.id === projeId
            ? {
                ...p,
                kart: { ...p.kart, ...kart },
                notlar: notlar ?? p.notlar,
                guncellemeTarihi: simdi(),
                aktivite: [
                  ...p.aktivite,
                  { tarih: simdi(), metin: 'Proje kartı alanları güncellendi — mail + portal bildirimi gönderildi', ikon: 'pencil' },
                ],
              }
            : p,
        ),
      )
      const proje = projeler.find((p) => p.id === projeId)
      bildirimEkle({
        bildirimNo: '9003',
        fonksiyon: 'Proje Kartı Revize',
        baslik: `Proje Kartı Güncellendi — ${proje?.kart.projeKodu ?? ''}`,
        aciklama: `${proje?.ad} proje kartı alanları güncellendi. SAP senkronizasyonu için bildirim gönderildi.`,
        okundu: false,
        hedefRol: 'SAP Uzmanı',
        projeId,
        tip: 'bilgi',
        mailGonderildiMi: true,
      })
    },
    [projeler, bildirimEkle],
  )

  const ihaleDosyasiGuncelle = useCallback((projeId: string, deger: Record<string, string>) => {
    setProjeler((prev) =>
      prev.map((p) =>
        p.id === projeId ? { ...p, ihaleDosyasi: { ...p.ihaleDosyasi, ...deger }, guncellemeTarihi: simdi() } : p,
      ),
    )
  }, [])

  const paketEkle = useCallback(
    (
      projeId: string,
      ad: string,
      isTipi: IhalePaketi['isTipi'],
      alanlar?: Record<string, string>,
      sozlesmeTuru?: IhalePaketi['sozlesmeTuru'],
      sorumluId?: string,
    ) => {
    setProjeler((prev) =>
      prev.map((p) =>
        p.id === projeId
          ? {
              ...p,
              paketler: [
                ...p.paketler,
                {
                  id: `PKT-${Date.now()}`,
                  ad,
                  durum: 'taslak',
                  isTipi,
                  keşif: [],
                  belgeler: [],
                  altYukleniciler: [],
                  alanlar: alanlar ?? {},
                  sozlesmeTuru,
                  sorumluId,
                },
              ],
              aktivite: [...p.aktivite, { tarih: simdi(), metin: `Yeni ihale paketi oluşturuldu — ${ad}`, ikon: 'plus' }],
            }
          : p,
      ),
    )
    },
    [],
  )

  const paketAlanGuncelle = useCallback(
    (projeId: string, paketId: string, alanlar: Record<string, string>) => {
      setProjeler((prev) =>
        prev.map((p) =>
          p.id === projeId
            ? {
                ...p,
                guncellemeTarihi: simdi(),
                paketler: p.paketler.map((k) => (k.id === paketId ? { ...k, alanlar } : k)),
              }
            : p,
        ),
      )
    },
    [],
  )

  const soruEkle = useCallback((projeId: string, paketId: string, soru: string, soran: string) => {
    setProjeler((prev) =>
      prev.map((p) =>
        p.id === projeId
          ? {
              ...p,
              paketler: p.paketler.map((k) =>
                k.id === paketId
                  ? {
                      ...k,
                      sorular: [
                        ...(k.sorular ?? []),
                        {
                          id: `s-${Date.now()}`,
                          soru,
                          soran,
                          soruTarihi: simdi().split(' · ')[0],
                        },
                      ],
                    }
                  : k,
              ),
            }
          : p,
      ),
    )
  }, [])

  const soruCevapla = useCallback(
    (projeId: string, paketId: string, soruId: string, cevap: string, cevaplayan: string) => {
      setProjeler((prev) =>
        prev.map((p) =>
          p.id === projeId
            ? {
                ...p,
                paketler: p.paketler.map((k) =>
                  k.id === paketId
                    ? {
                        ...k,
                        sorular: (k.sorular ?? []).map((s) =>
                          s.id === soruId
                            ? { ...s, cevap, cevaplayan, cevapTarihi: simdi().split(' · ')[0] }
                            : s,
                        ),
                      }
                    : k,
                ),
              }
            : p,
        ),
      )
    },
    [],
  )

  const ihaleAksiyonu = useCallback((projeId: string, paketId: string, ihale: IhaleYonetimi) => {
    setProjeler((prev) =>
      prev.map((p) =>
        p.id === projeId
          ? {
              ...p,
              guncellemeTarihi: simdi(),
              paketler: p.paketler.map((k) => (k.id === paketId ? { ...k, ihale } : k)),
              aktivite: [...p.aktivite, { tarih: simdi(), metin: `İhale durumu güncellendi — ${ihale.durum}`, ikon: 'gavel' }],
            }
          : p,
      ),
    )
  }, [])

  const paketGuncelle = useCallback(
    (projeId: string, paketId: string, yama: Partial<Pick<IhalePaketi, 'ad' | 'isTipi' | 'alanlar'>>) => {
      setProjeler((prev) =>
        prev.map((p) =>
          p.id === projeId
            ? {
                ...p,
                guncellemeTarihi: simdi(),
                paketler: p.paketler.map((k) => (k.id === paketId ? { ...k, ...yama } : k)),
              }
            : p,
        ),
      )
    },
    [],
  )

  /** Paketi yayınlar — öncesinde eksik alan kontrolü yapılır (UI tarafında). */
  const paketYayinla = useCallback((projeId: string, paketId: string) => {
    setProjeler((prev) =>
      prev.map((p) =>
        p.id === projeId
          ? {
              ...p,
              guncellemeTarihi: simdi(),
              paketler: p.paketler.map((k) =>
                k.id === paketId
                  ? { ...k, durum: 'yayinlandi' as const }
                  : k,
              ),
              aktivite: [...p.aktivite, { tarih: simdi(), metin: 'İhale paketi yayınlandı', ikon: 'send' }],
            }
          : p,
      ),
    )
  }, [])

  const paketKlasorEkle = useCallback((projeId: string, paketId: string, ad: string) => {
    setProjeler((prev) =>
      prev.map((p) =>
        p.id === projeId
          ? {
              ...p,
              paketler: p.paketler.map((k) =>
                k.id === paketId
                  ? {
                      ...k,
                      klasorler: [...(k.klasorler ?? []), { id: `kl-${Date.now()}`, ad }],
                    }
                  : k,
              ),
            }
          : p,
      ),
    )
  }, [])

  const paketKlasorYenidenAdlandir = useCallback(
    (projeId: string, paketId: string, id: string, ad: string) => {
      setProjeler((prev) =>
        prev.map((p) =>
          p.id === projeId
            ? {
                ...p,
                paketler: p.paketler.map((k) =>
                  k.id === paketId
                    ? {
                        ...k,
                        klasorler: [
                          ...(k.klasorler ?? []).filter((c) => c.id !== id),
                          { id, ad },
                        ],
                      }
                    : k,
                ),
              }
            : p,
        ),
      )
    },
    [],
  )

  /** Firmayı onaya gönderir — onay makamlarına bildirim üretilir, firma "onay bekliyor" durumuna geçer */
  const paketOnayaGonder = useCallback(
    (projeId: string, paketId: string, firma: AltYuklenici, onaylayanlar: string[]) => {
      setProjeler((prev) =>
        prev.map((p) =>
          p.id === projeId
            ? {
                ...p,
                guncellemeTarihi: simdi(),
                paketler: p.paketler.map((k) =>
                  k.id === paketId
                    ? {
                        ...k,
                        onaylar: [
                          ...(k.onaylar ?? []),
                          {
                            id: `onay-${Date.now()}`,
                            firmaId: firma.id,
                            firma: firma.firma,
                            onaylayanlar,
                            tarih: simdi().split(' · ')[0],
                            durum: 'bekliyor' as const,
                          },
                        ],
                        /* Firma sağdaki "Davet Edilecek Firmalar" listesine düşer,
                           durumu "onay bekleniyor" olur. */
                        altYukleniciler: k.altYukleniciler.some((a) => a.id === firma.id)
                          ? k.altYukleniciler.map((a) =>
                              a.id === firma.id
                                ? {
                                    ...a,
                                    durum: 'onaya-gonderildi' as const,
                                    onayaGonderilmeTarihi: simdi().split(' · ')[0],
                                  }
                                : a,
                            )
                          : [
                              ...k.altYukleniciler,
                              {
                                ...firma,
                                durum: 'onaya-gonderildi' as const,
                                onayaGonderilmeTarihi: simdi().split(' · ')[0],
                              },
                            ],
                      }
                    : k,
                ),
                aktivite: [
                  ...p.aktivite,
                  { tarih: simdi(), metin: `${firma.firma} onaya gönderildi`, ikon: 'send' },
                ],
              }
            : p,
        ),
      )
    },
    [],
  )

  /** Onay tamamlanınca firma "Onaylandı" durumuna geçer — davet gönderilebilir olur */
  const paketOnayTamamla = useCallback((projeId: string, paketId: string, onayId: string) => {
    setProjeler((prev) =>
      prev.map((p) =>
        p.id === projeId
          ? {
              ...p,
              guncellemeTarihi: simdi(),
              paketler: p.paketler.map((k) => {
                if (k.id !== paketId) return k
                const onay = (k.onaylar ?? []).find((o) => o.id === onayId)
                if (!onay) return k
                const firma = k.altYukleniciler.find((a) => a.id === onay.firmaId) ?? {
                  id: onay.firmaId,
                  firma: onay.firma,
                  uzmanlik: '—',
                  skor: 0,
                  yetkiBelgesi: 'Talep edildi',
                  vergiLevhasi: 'Talep edildi',
                  iletisim: '—',
                  durum: 'onaylandi' as const,
                }
                return {
                  ...k,
                  onaylar: (k.onaylar ?? []).map((o) =>
                    o.id === onayId
                      ? {
                          ...o,
                          durum: 'onaylandi' as const,
                          onaylanmaTarihi: simdi().split(' · ')[0],
                        }
                      : o,
                  ),
                  altYukleniciler: k.altYukleniciler.some((a) => a.id === onay.firmaId)
                    ? k.altYukleniciler.map((a) =>
                        a.id === onay.firmaId
                          ? {
                              ...a,
                              durum: 'onaylandi' as const,
                              onaylanmaTarihi: simdi().split(' · ')[0],
                            }
                          : a,
                      )
                    : [...k.altYukleniciler, { ...firma, durum: 'onaylandi' as const }],
                }
              }),
            }
          : p,
      ),
    )
  }, [])

  /** Yaklaşık ihale bedeli — her ihale paketine özeldir */
  const paketYaklasikBedel = useCallback(
    (projeId: string, paketId: string, deger: { tutar: string; paraBirimi: string; avansOrani: string }) => {
      setProjeler((prev) =>
        prev.map((p) =>
          p.id === projeId
            ? {
                ...p,
                guncellemeTarihi: simdi(),
                paketler: p.paketler.map((k) =>
                  k.id === paketId ? { ...k, yaklasikIhaleBedeli: deger } : k,
                ),
              }
            : p,
        ),
      )
    },
    [],
  )

  /** Şantiyecinin önerdiği firma — kayıt "önerildi" durumuyla açılır */
  const firmaOnerTalebi = useCallback(
    (
      projeId: string,
      paketId: string,
      firma: string,
      mail: string,
      yetkili: string,
      maliSorumlu: string,
      not: string,
    ) => {
      setProjeler((prev) =>
        prev.map((p) =>
          p.id === projeId
            ? {
                ...p,
                guncellemeTarihi: simdi(),
                paketler: p.paketler.map((k) =>
                  k.id === paketId
                    ? {
                        ...k,
                        onerilenFirmalar: [
                          ...(k.onerilenFirmalar ?? []),
                          {
                            id: `oner-${Date.now()}`,
                            firma,
                            uzmanlik: '—',
                            skor: 0,
                            yetkiBelgesi: 'Talep edildi',
                            vergiLevhasi: 'Talep edildi',
                            iletisim: mail,
                            maliSorumlu,
                            not: [yetkili, maliSorumlu, not].filter(Boolean).join(' — '),
                            durum: 'onaya-gonderilmedi' as const,
                            degerlendirme: 'portalda-yok' as const,
                          },
                        ],
                      }
                    : k,
                ),
                aktivite: [...p.aktivite, { tarih: simdi(), metin: `Firma önerisi oluşturuldu — ${firma}`, ikon: 'plus' }],
              }
            : p,
        ),
      )
    },
    [],
  )

  const paketSil = useCallback((projeId: string, paketId: string) => {
    setProjeler((prev) =>
      prev.map((p) =>
        p.id === projeId
          ? {
              ...p,
              paketler: p.paketler.filter((k) => k.id !== paketId),
              guncellemeTarihi: simdi(),
              aktivite: [...p.aktivite, { tarih: simdi(), metin: 'İhale paketi silindi', ikon: 'trash' }],
            }
          : p,
      ),
    )
  }, [])

  const paketDurum = useCallback((projeId: string, paketId: string, durum: PaketDurumu) => {
    setProjeler((prev) =>
      prev.map((p) =>
        p.id === projeId
          ? { ...p, paketler: p.paketler.map((k) => (k.id === paketId ? { ...k, durum } : k)) }
          : p,
      ),
    )
  }, [])

  const keşifGuncelle = useCallback((projeId: string, paketId: string, satirlar: KesifSatiri[]) => {
    setProjeler((prev) =>
      prev.map((p) =>
        p.id === projeId
          ? {
              ...p,
              guncellemeTarihi: simdi(),
              paketler: p.paketler.map((k) => (k.id === paketId ? { ...k, keşif: satirlar } : k)),
            }
          : p,
      ),
    )
  }, [])

  const belgeEkle = useCallback((projeId: string, paketId: string, belge: IhalePaketi['belgeler'][number]) => {
    setProjeler((prev) =>
      prev.map((p) =>
        p.id === projeId
          ? { ...p, paketler: p.paketler.map((k) => (k.id === paketId ? { ...k, belgeler: [...k.belgeler, belge] } : k)) }
          : p,
      ),
    )
  }, [])

  const altYukleniciEkle = useCallback((projeId: string, paketId: string, firma: string) => {
    setProjeler((prev) =>
      prev.map((p) =>
        p.id === projeId
          ? {
              ...p,
              paketler: p.paketler.map((k) =>
                k.id === paketId
                  ? {
                      ...k,
                      altYukleniciler: [
                        ...k.altYukleniciler,
                        {
                          id: `a-${Date.now()}`,
                          firma,
                          uzmanlik: '—',
                          skor: 0,
                          yetkiBelgesi: 'Talep edildi',
                          vergiLevhasi: 'Talep edildi',
                          iletisim: '—',
                          durum: 'onaya-gonderilmedi',
                        },
                      ],
                    }
                  : k,
              ),
            }
          : p,
      ),
    )
  }, [])

  /** Önerilen listeden firmayı "Davet Edilecek Firmalar" listesine alır (davet henüz gönderilmez) */
  const altYukleniciSec = useCallback(
    (projeId: string, paketId: string, firma: AltYuklenici) => {
      setProjeler((prev) =>
        prev.map((p) =>
          p.id === projeId
            ? {
                ...p,
                paketler: p.paketler.map((k) => {
                  if (k.id !== paketId) return k
                  const mevcut = k.altYukleniciler.find((a) => a.id === firma.id)
                  const eklenen = { ...(mevcut ?? firma), durum: 'onaylandi' as const }
                  return {
                    ...k,
                    seciliFirma: eklenen.firma,
                    altYukleniciler: mevcut
                      ? k.altYukleniciler.map((a) => (a.id === firma.id ? eklenen : a))
                      : [...k.altYukleniciler, eklenen],
                  }
                }),
              }
            : p,
        ),
      )
    },
    [],
  )

  /** Şantiyecinin önerdiği firmayı önerilen listesine ekler */
  const altYukleniciKaldir = useCallback((projeId: string, paketId: string, firmaId: string) => {
    setProjeler((prev) =>
      prev.map((p) =>
        p.id === projeId
          ? {
              ...p,
              paketler: p.paketler.map((k) =>
                k.id === paketId
                  ? {
                      ...k,
                      altYukleniciler: k.altYukleniciler.filter((a) => a.id !== firmaId),
                      seciliFirma: k.altYukleniciler.find((a) => a.id === firmaId)?.firma === k.seciliFirma
                        ? undefined
                        : k.seciliFirma,
                    }
                  : k,
              ),
            }
          : p,
      ),
    )
  }, [])

  const altYukleniciDavetEt = useCallback((projeId: string, paketId: string, firmaId: string) => {
    setProjeler((prev) =>
      prev.map((p) =>
        p.id === projeId
          ? {
              ...p,
              paketler: p.paketler.map((k) =>
                k.id === paketId
                  ? {
                      ...k,
                      altYukleniciler: k.altYukleniciler.map((a) =>
                        a.id === firmaId
                          ? { ...a, durum: 'davet-edildi' as const, davetTarihi: simdi().split(' · ')[0] }
                          : a,
                      ),
                    }
                  : k,
              ),
            }
          : p,
      ),
    )
  }, [])

  const durumDegistir = useCallback((projeId: string, durum: ProjeDurumu, not?: string) => {
    setProjeler((prev) =>
      prev.map((p) =>
        p.id === projeId
          ? {
              ...p,
              durum,
              guncellemeTarihi: simdi(),
              aktivite: not ? [...p.aktivite, { tarih: simdi(), metin: not, ikon: 'refresh' }] : p.aktivite,
            }
          : p,
      ),
    )
  }, [])

  const paketOnayla = useCallback(
    (projeId: string, paketId: string) => {
      setProjeler((prev) =>
        prev.map((p) =>
          p.id === projeId
            ? {
                ...p,
                guncellemeTarihi: simdi(),
                paketler: p.paketler.map((k) =>
                  k.id === paketId ? { ...k, durum: 'yayinlandi' as const } : k,
                ),
                aktivite: [...p.aktivite, { tarih: simdi(), metin: 'İhale paketi onaylandı', ikon: 'check-circle' }],
              }
            : p,
        ),
      )
      const proje = projeler.find((p) => p.id === projeId)
      bildirimEkle({
        bildirimNo: '9004',
        fonksiyon: 'İhale Paketi Onayı',
        baslik: `İhale Paketi Onaylandı — ${proje?.kart.projeKodu ?? ''}`,
        aciklama: `${proje?.ad} ihale paketi onaylandı.`,
        okundu: false,
        hedefRol: 'Şantiyeci',
        projeId,
        paketId,
        tip: 'onay',
        mailGonderildiMi: true,
      })
    },
    [projeler, bildirimEkle],
  )

  const paketRevize = useCallback(
    (projeId: string, paketId: string, gerekce: string) => {
      setProjeler((prev) =>
        prev.map((p) =>
          p.id === projeId
            ? {
                ...p,
                guncellemeTarihi: simdi(),
                paketler: p.paketler.map((k) => (k.id === paketId ? { ...k, durum: 'taslak' as const, notlar: gerekce } : k)),
                aktivite: [...p.aktivite, { tarih: simdi(), metin: `İhale ekibi revize talep etti — ${gerekce}`, ikon: 'rotate-ccw' }],
              }
            : p,
        ),
      )
      const proje = projeler.find((p) => p.id === projeId)
      bildirimEkle({
        bildirimNo: '9005',
        fonksiyon: 'İhale Paketi Revize',
        baslik: `Revize Talebi — ${proje?.kart.projeKodu ?? ''}`,
        aciklama: gerekce,
        okundu: false,
        hedefRol: 'Şantiyeci',
        projeId,
        paketId,
        tip: 'revize',
        mailGonderildiMi: true,
      })
    },
    [projeler, bildirimEkle],
  )

  /* --- Kullanıcı / ekip / yetki / rol / eşleştirme yönetimi --- */

  const kullaniciKaydet = useCallback((k: Kullanicilar) => {
    setKullanicilar((prev) => (prev.some((x) => x.id === k.id) ? prev.map((x) => (x.id === k.id ? k : x)) : [...prev, k]))
  }, [])

  const kullaniciSil = useCallback((id: string) => {
    setKullanicilar((prev) => prev.filter((x) => x.id !== id))
    setYetkiler((prev) =>
      prev.map((y) => ({ ...y, kullanicilar: y.kullanicilar.filter((k) => k !== id) })),
    )
  }, [])

  const ekipKaydet = useCallback((e: Ekip) => {
    setEkipler((prev) => (prev.some((x) => x.id === e.id) ? prev.map((x) => (x.id === e.id ? e : x)) : [...prev, e]))
  }, [])

  const ekipSil = useCallback((id: string) => {
    setEkipler((prev) => prev.filter((x) => x.id !== id))
    setKullanicilar((prev) => prev.map((k) => (k.ekipId === id ? { ...k, ekipId: '' } : k)))
  }, [])

  const yetkiKaydet = useCallback((y: Yetki) => {
    setYetkiler((prev) => (prev.some((x) => x.id === y.id) ? prev.map((x) => (x.id === y.id ? y : x)) : [...prev, y]))
  }, [])

  const yetkiSil = useCallback((id: string) => {
    setYetkiler((prev) => prev.filter((x) => x.id !== id))
    setEslesmeler((prev) => prev.filter((e) => e.yetkiId !== id))
  }, [])

  const rolKaydet = useCallback((r: Rol) => {
    setRoller((prev) => (prev.some((x) => x.id === r.id) ? prev.map((x) => (x.id === r.id ? r : x)) : [...prev, r]))
  }, [])

  const rolSil = useCallback((id: string) => {
    setRoller((prev) => prev.filter((x) => x.id !== id))
    setEslesmeler((prev) => prev.filter((e) => e.rolId !== id))
  }, [])

  const eslemeKaydet = useCallback((e: RolYetkiEslesmesi) => {
    setEslesmeler((prev) =>
      prev.some((x) => x.id === e.id) ? prev.map((x) => (x.id === e.id ? e : x)) : [...prev, e],
    )
  }, [])

  const eslemeSil = useCallback((id: string) => {
    setEslesmeler((prev) => prev.filter((x) => x.id !== id))
  }, [])

  const bildirimOkundu = useCallback((id: string) => {
    setBildirimler((prev) => prev.map((b) => (b.id === id ? { ...b, okundu: true } : b)))
  }, [])

  const tumBildirimlerOkundu = useCallback(() => {
    setBildirimler((prev) => prev.map((b) => ({ ...b, okundu: true })))
  }, [])

  const value = useMemo<Store>(
    () => ({
      projeler,
      goruntulenenProjeler,
      bildirimler,
      kullanicilar,
      ekipler,
      yetkiler,
      roller,
      eslesmeler,
      kullaniciKaydet,
      kullaniciSil,
      ekipKaydet,
      ekipSil,
      yetkiKaydet,
      yetkiSil,
      rolKaydet,
      rolSil,
      eslemeKaydet,
      eslemeSil,
      projeGetir,
      paketGetir,
      talepOlustur,
      sapKodOlustur,
      kartGuncelle,
      ihaleDosyasiGuncelle,
      paketEkle,
      paketAlanGuncelle,
      paketSil,
      paketYayinla,
      paketOnayaGonder,
      paketOnayTamamla,
      paketYaklasikBedel,
      firmaOnerTalebi,
      paketKlasorEkle,
      paketKlasorYenidenAdlandir,
      paketGuncelle,
      ihaleAksiyonu,
      soruEkle,
      soruCevapla,
      paketDurum,
      keşifGuncelle,
      belgeEkle,
      altYukleniciEkle,
      altYukleniciSec,
      altYukleniciKaldir,
      altYukleniciDavetEt,
      durumDegistir,
      paketOnayla,
      paketRevize,
      bildirimOkundu,
      tumBildirimlerOkundu,
    }),
    [
      projeler,
      goruntulenenProjeler,
      bildirimler,
      kullanicilar,
      ekipler,
      yetkiler,
      roller,
      eslesmeler,
      kullaniciKaydet,
      kullaniciSil,
      ekipKaydet,
      ekipSil,
      yetkiKaydet,
      yetkiSil,
      rolKaydet,
      rolSil,
      eslemeKaydet,
      eslemeSil,
      projeGetir,
      paketGetir,
      talepOlustur,
      sapKodOlustur,
      kartGuncelle,
      ihaleDosyasiGuncelle,
      paketEkle,
      paketAlanGuncelle,
      paketSil,
      paketYayinla,
      paketOnayaGonder,
      paketOnayTamamla,
      paketYaklasikBedel,
      firmaOnerTalebi,
      paketKlasorEkle,
      paketKlasorYenidenAdlandir,
      paketGuncelle,
      ihaleAksiyonu,
      soruEkle,
      soruCevapla,
      paketDurum,
      keşifGuncelle,
      belgeEkle,
      altYukleniciEkle,
      altYukleniciSec,
      altYukleniciKaldir,
      altYukleniciDavetEt,
      durumDegistir,
      paketOnayla,
      paketRevize,
      bildirimOkundu,
      tumBildirimlerOkundu,
    ],
  )

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
}

export function useStore(): Store {
  const ctx = useContext(StoreContext)
  if (!ctx) throw new Error('useStore, StoreProvider içinde kullanılmalıdır')
  return ctx
}
