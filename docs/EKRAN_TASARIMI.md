# EKRAN TASARIMI — ARK İhale & Keşif Modülü

> Bu doküman, ekran tasarımının **ne olduğunu, nasıl davrandığını ve hangi kararların hâlâ açık olduğunu** tarif eder.
> Veri kaynağı: `ana-veri_23.10.2026.xlsx` (Proje Kartı Alanları / İhale Dosyası Alanları / Proje Rolleri /
> Detaylı Süreç Akış) ve ekran görüntüleri.

---

## 1. Kapsam

Bu modül **şantiye tarafının** ihale hazırlık alanıdır:

- Proje kodu talebi (SAP’ta proje açılması)
- Proje kartı + ihale dosyası verilerinin yönetimi
- Keşif (metraj) hazırlığı, Excel ile içe/dışa aktarım
- İhale paketi (iş paketi) oluşturma, belge toplama, alt yüklenici daveti
- İhale ekibi ile teslim/onarım akışı

İhale ekibi tarafı **ayrı bir görünüm** değildir; aynı ekranlarda yetkiye bağlı olarak aksiyon alır
(`Onayla`, `Revize İste`, `İhale Ekibine Gönder`).

---

## 2. Global yerleşim

```
┌────────────┬────────────────────────────────────────────────────────────────┐
│  ARK       │ ÜST BAR:  Portal adı ▸ Proje seçici ▸ yardım · bildirim · kullanıcı│
│  İNŞAAT    │────────────────────────────────────────────────────────────────│
│  ▾ daralt  │                                                                │
│  🔍 Ara    │ İÇERİK (açık gri zemin, beyaz kartlar)                         │
│  ▸ Projeler│                                                                │
│  ▸ İhale…  │                                                                │
│  ▸ Bildir. │                                                                │
└────────────┴────────────────────────────────────────────────────────────────┘
```

- **Sol kenar çubuğu**, ARK Alt Yüklenici Portalı ile aynı tasarımdadır: siyah zemin, logo + “Ark İnşaat”,
  arama kutusu, gruplanmış ve açılabilir menü, sağ üstte **daraltma** düğmesi (`chevron-left`).
  Daraltılmış hâli 72 px genişliğinde yalnızca ikon rayıdır; durum `localStorage`’da saklanır.
- Menü içeriği: **Projeler** (Tüm Projeler · Proje Kodu Talebi) · **Bildirimler** · **Hesap Ayarları**
  (pasif, içi boş). İhale paketleri proje ekranının İhale Paketleri sekmesinden yönetilir.
- Proje detayında ikinci bir sol şerit yoktur; proje bilgileri proje kartının **Detaylar** bölümünde açılır,
  ihale paketi detayı ise üstte yatay **pill sekmelerle** açılır.

---

## 3. Ekranlar

### 3.0 Proje düzenleme penceresi — “Projeyi Düzenle”

- Proje kartındaki dört blok (Genel · Sözleşme · Organizasyon · Alan) düzenlenebilir kutularla açılır;
  **kilitli alan bulunmaz** (şimdilik tüm kutular veri girişine açıktır).
- **Proje Kodu** yazılamaz: SAP’ten gelir — kod yoksa kutu boş, düzenleme yapılan projede dolu görünür.
- Kaydedildiğinde proje kartı güncellenir, aktiviteye yazılır ve SAP Uzmanı’na mail + portal bildirimi (9003) gider.

### 3.1 Tüm Projeler — `/projeler`

Liste yapısı, ARK Alt Yüklenici Portalı’ndaki **Aktif İhaleler** tablosuyla birebir aynıdır:

1. **Başlık:** “Tüm Projeler”.
2. **Arama çubuğu:** tek alan — **“Proje adı, proje kodu ile ara…”** (ad ve kod birlikte aranır; başka filtre yoktur).
3. **Tablo (ayrı sütunlar):**
   - `Proje Kodu` — mono, kod (TR-2026-0148)
   - `Proje Adı` — proje adı (kalın) + “N ihale paketi · Aşama”
   - `Lokasyon / İşveren` — lokasyon + işveren
   - `Son Erişim Tarihi` — son erişim tarihi
   - Satır sonunda **Aç →** butonu ve **⋮** menüsü
4. Satıra tıklamak veya **Aç** butonu projeyi açar (`/projeler/:id`). Satırın sağında **⋮** menüsü vardır:
   **Projeyi Arşivle** (onaylı) ve **Projeyi Düzenle** (soru işareti — ekranı henüz yok, yalnızca menüde).

> Not: Proje bilgilerini gösteren ayrı bir detay ekranı yoktur; proje bilgileri proje ekranının sekmelerine
> dağıtılacaktır.

### 3.2 Proje ekranı — `/projeler/:id`

Proje, **Tüm Projeler** listesinden **Aç** denerek açılır.

1. **Başlık satırı:** solda proje adı + durum rozeti (açılır ok); sağda **proje seçici** (başka projeye geçiş).
2. **Sekme çubuğu:** `İhale Paketleri` · `Keşif` · `Dokümanlar` · `Dashboard` · `Proje Bilgileri`
   - **Proje Bilgileri** sekmesi en sondadır; proje kartında tanımlanan alanlar listelenir. Sağ üstteki
     **Projeyi Düzenle** butonu düzenleme penceresini açar.
   - Aktif sekme turuncu alt çizgi ile vurgulanır.
   - Sekmelerin altındaki içerikler ikinci aşamada eklenecektir; şimdilik **İhale Paketleri** sekmesi doludur.
3. **İhale Paketleri sekmesi:**
   - Filtre satırı: Tümü · İhale adı · Çalışma tipi · Durum · Seçilen firma
   - “Yeni İhale Paketi” formu (paket adı + çalışma tipi)
   - Paket kart listesi: tutamaç · paket adı · durum rozeti · “Seçilen 1” · **Aç** · “Daha fazla”
     (Aç → pill sekmeli paket detayı: Genel Bakış · Keşif · Belgeler · Alt Yüklenici Davet)

### 3.3 İhale paketi detayı — `/projeler/:id/paket/:paketId`

Conwize “bid detail” düzeni:

- **Breadcrumb:** `PROJE ADI / Paket Adı` + durum rozeti + “Süreç rehberini izle” bağlantısı.
- Sağda: **Revize İste** / **Onayla** (yetikiye göre) + turuncu daire aksiyon.
- **Pill sekmeler (segmented):** `Genel Bakış` · `Belgeler` · `Keşif` · `Alt Yüklenici Yönetimi` ·
  `Mukayeseli Karşılaştırma` · `İhale Yönetimi` · `Dashboard` · `Soru/Cevap`
  (Paket başlığında durum/tur rozeti yoktur; durum ve tur bilgisi yalnızca **İhale Yönetimi** sekmesindedir.)
  (Proje bilgileri paket içinde değil, **proje ekranındaki** `Proje Bilgileri` sekmesindedir.)

**Soru/Cevap sekmesi:** solda soru listesi (soru · soran · tarih · bekliyor/cevaplandı), sağda seçili sorunun
detayı ve **Cevapla** aksiyonu; altında **Yeni Soru** formu (soran + soru).

#### İhale Yönetimi Paneli

Başlayan ihalenin kazanan belirlenmesine kadar geçen süreç yönetilir.

1. **Durum başlığı:** güncel durumun tam etiketi (ör. “1. tur teklifler bekleniyor”, “İhale çıkılacak”) — **tıklanabilir**,
   açılır listeden 15 ihale durumundan biri seçilerek durum belirlenir. Yanında tur, katılımcı ve teklif sayaçları ile
   **Son Teklif Verme Tarihi** / **Soru-Cevap Tarihi**.
2. **Teklifler:** katılımcı şirket, tur, teklif tutarı, para birimi, teklif tarihi, durum ve pazarlık tutarı — satır
   satır, bilgi amaçlı. Tablonun sağ ucunda **tur seçimi** açılır listesi vardır (1. Tur / 2. Tur …); seçilen turun
   teklifleri gösterilir.
3. **Tur seçimi** yalnızca paket başlığındaki **“N. Tur”** açılır menüsündedir: eski turlar, durumları ve
   tur kapanış notları listede görünür; seçilen tur panelde gösterilir.
4. **Üç aksiyon:**
   - **İhaleyi Sonuçlandır** → teklifler arasından kazanan alt yüklenici seçimi + zorunlu not.
   - **Bir Sonraki Tura Geç** → tura katılacak alt yüklenici seçimi + zorunlu **Tur Kapanış Notu** + **Son Teklif
     Verme Tarihi** ve **Soru/Cevap Tarihi** (soru-cevap tarihi son teklif tarihinden önce olmalıdır). Seçilmeyenler
     elenir, seçilenler yeni tura aktarılır; eski turun teklif kayıtları **silinmez**, 1. tur listesinde görünmeye
     devam eder. Not, kapanan turun notlarına yazılır.
   - **Pazarlık Teklifi** → alt yüklenici seçimi + pazarlık tutarı + para birimi + not; ilgili firma
     “pazarlık cevabı bekleniyor” durumuna geçer, cevap girildiğinde teklifi güncellenir ve kazanan seçilebilir olur.

İlk süreç daima **1. Tur** olarak başlar.

| Sekme | İçerik |
|---|---|
| Genel Bakış | **İhale Özeti** — paket oluşturulurken girilen alanlar |
| Keşif | Conwize “Estimate” düzeni: versiyon seçici · “Göster” filtresi · turkuaz bilgi çağrısı · hesap tablosu · alt aksiyon çubuğu |
| Belgeler | İki panel: sol **Klasörler** (istatistik + klasör ağacı: BFT Belgeleri (BFT1) · İmalat Teklif Şartnamesi · İşveren Teknik Şartnameleri · Çizimler · İş Programı — her klasörde belge sayısı), sağ **Belgeler / <klasör>** + büyük kesikli yükleme alanı ve klasörün belgeleri. Klasöre tıklandığında sağdaki içerik değişir; yükleme yalnızca bu alandan yapılır. |
| Alt Yüklenici Davet | İki eşit genişlikte kart (50/50): **Önerilen Firmalar** (ad araması · **Firma Öner** butonu · Firma + e-posta · Uzmanlık · Skor · yıldız · **ok** ile listeye ekleme) ve **Davet Edilecek Firmalar** (X ile çıkarma · firma + e-posta · durum rozeti · **ok** ile davet gönderme). Durumlar: **Portal kaydı yok** · **Değerlendiriliyor** · **Onaylandı** (seçildi, davet edilmedi) · **Davet edildi** + davet tarihi. |

**Keşif tablosu kolonları:** `No` · `Poz Tanımı` · `Birim` · `Miktar` · `Malzeme` · `İşçilik` · `Birim Maliyet` ·
`Toplam Maliyet` · `Birim Fiyat` · `Toplam Fiyat` · `Notlar`.

- Ana gruplar (seviye 1) kalın ve gri zeminli, alt kalemler girintili.
- **Fiyat kolonları kilitlidir** — keşif aşamasında veri girilmez, teklif aşamasında dolar (ikon: kilit).
- Alt aksiyon çubuğu: `İhale Paketine Böl` (yetki gerekir) · `Keşif ▾` · sağda `İçe Aktar ▾` · `Dışa Aktar ▾` ·
  `Şablon` · `Düzenle/Kaydet`.

### 3.5 Yeni İhale Paketi Oluşturma penceresi

- Üstte **İhale Paketi Adı**; geri kalan alanlar iki panelde:
  - **Sol — Doldurulacak Alanlar:** kategorilere ayrılmış (Proje Bilgileri · Finansal Bilgiler · İşin Süresi ·
    Şantiye Bilgileri) kutucuk listesi. **Zorunlu alanlar varsayılan olarak seçilidir** ve sağda açılır.
  - **Sağ — Alan Bilgileri:** seçilen alanlar **soldaki gibi kategori başlıklarıyla gruplanarak** listelenir;
    her alan kendi tipine uygun giriş alanıyla (metin / uzun metin / yüzde / sayı / tarih / dropdown) gelir.
- Sistem tarafından doldurulan alanlar (tarih vb.) gri görünür ve kapalıdır.
- Altta “N alan seçildi · M zorunlu” sayacı ve **İhale Paketini Oluştur** butonu.

### 3.4 Proje Kodu Talebi — `/projeler/talep`

UI, ARK Alt Yüklenici Portalı’ndaki **Genel Bilgiler** sayfasıyla aynıdır: **tek kart**, bölüm başlıkları,
`border-t` ile bölüm ayrımları ve 2 kolonlu sade alan ızgarası. Alan başına rozet/ipucu yığını yoktur.

| Bölüm | İçerik |
|---|---|
| Proje Genel Bilgileri | Proje Kodu (SAP listesi), Proje Adı (kilitli), İdare (İşveren), Kontrol/Müşavir, Lokasyon (kilitli), Açıklama / Not |
| Proje Organizasyon Bilgileri | Direktör (zorunlu), Koordinatör, Proje Müdürü, Şantiye Şefi, Teknik Ofis Yetkilisi, Saha Sorumlusu, Muhasebe Yetkilisi, Mali İşler Yöneticisi |
| Proje Sözleşme Bilgileri | SAP’ten gelir — kilitli (kilit ikonu) |
| Proje Alan Bilgileri | SAP PRPS’ten gelir — kilitli |
| Muhattap Bilgileri | SAP Uzmanı seçilir → Adı ve Mail otomatik dolar |

- “🔒 Kilitli alanlar SAP proje kartından otomatik gelir.” notu yalnızca bir kez bölüm başlığında yer alır.
- Altta **Talep Özeti** kartı: bildirim no (`9001 — Proje Kodu Talep`), alıcı, konu ve eksik zorunlu alan listesi.
- `PROJE KODU TALEP ET` butonu **zorunlu alanlar dolmadan pasiftir**; butona basınca **mail + portal bildirimi
  önizlemesi** modalı açılır, onaydan sonra talep gönderilir.

### 3.5 Bildirimler — `/bildirimler`

Her bildirim **bildirim no + fonksiyon adı** ile listelenir; mail gönderimi rozetiyle gösterilir.
Sağda **Bildirim Kataloğu** (no → fonksiyon → hedef rol) sabit panel olarak durur.

---

## 4. Alan kaynakları ve renk kodlaması

`2. Proje Kartı Alanları` sheet’indeki **Kaynak** sütunu ekran davranışına çevrilmiştir:

| Kaynak | Rozet | Davranış |
|---|---|---|
| Proje Listesi | `Listeden seçilir` | Açılır liste (SAP proje listesi) |
| Proje Kodu / SAP - Proje Kodu | `SAP (otomatik)` | Kilitli, seçilen proje kodundan otomatik dolar |
| SAP - Proje Kodu - Alan eklenecek | `Manuel doldurulacak` | Şimdilik manuel; SAP alanı eklendiğinde otomatik olacak |
| Manuel / Personel | `Seçilecek` · `Manuel giriş` | Kullanıcı doldurur / listeden seçer |

Durum renkleri: turuncu = aşama / manuel · mavi = süreçte · yeşil = onaylı / tamam · gri = taslak / kilitli ·
kırmızı = revize.

---

## 5. Bildirim kataloğu

| No | Fonksiyon | Hedef | Tetikleyici |
|---|---|---|---|
| 9001 | Proje Kodu Talep | SAP Uzmanı | Talep formu gönderildi (mail + portal) |
| 9002 | Proje Kodu Talep | Şantiyeci | SAP proje kodu oluşturuldu |
| 9003 | Proje Kartı Revize | SAP Uzmanı | Proje kartı alanları güncellendi *(öneri)* |
| 9004 | İhale Paketi Onayı | Şantiyeci | İhale ekibi paketi onayladı *(öneri)* |
| 9005 | İhale Paketi Revize | Şantiyeci | İhale ekibi revize istedi *(öneri)* |

> 9003–9005 numaraları ana veri dosyasında yoktur; öneri olarak eklenmiştir.

---

## 6. Kilit ve zorunluluk kuralları

1. Proje kodu oluşmadan **İhale Dosyası · Keşif · Belgeler · Alt Yüklenici** ekranları kilitlidir.
2. Zorunlu alanlar dolmadan “Proje Kodu Talep Et”, “Paketi Oluştur”, “Yayına Al” butonları pasiftir.
3. Koşullu zorunlu alanlar sözleşme türüne göre açılır:
   - `İşveren Sözleşme Tutarı` → Birim Fiyatlı / Götürü Bedel
   - `Maliyet + Kar Oranı` → Maliyet + Kar
4. Keşif satırında `Poz Tanımı`, `Birim`, `Miktar` ve `Teklif Kırılımı` zorunludur; fiyat alanları kilitlidir.
5. Düzenleme kaydı, mail + portal bildirimi üretir ve projede aktivite kaydı oluşturur.

---

## 7. Karar bekleyen maddeler

| # | Konu | Durum |
|---|---|---|
| 1 | Lokasyon = depo yeri mi, şantiye lokasyonu mu? Excel’de açık soru olarak duruyor | Şimdilik “Lokasyon (Depo Yeri)” olarak SAP `T001L.LGORT` ile dolduruluyor, şantiyeci tarafından doğrulanabilir |
| 1b | **İşveren Sözleşme Tutarı (KDV Hariç)** alanı ekranlarda hiç gösterilmiyor (karar: “asla görünmeyecek”) | Alan sözlüğünde `gizli: true` olarak işaretli; talep formu, proje kartı ve özet ekranlarda render edilmiyor |
| 2 | Proje Kodu Talebi ekranında zorunlu alan listesi | Şimdilik Excel sheet’indeki **zorunlu** satırlar esas alındı; nihai liste sonra kararlaştırılacak |
| 3 | Keşif kilidi — ihale ekibi onayından sonra düzenleme açık mı? | Şimdilik paket “ihale ekibinde” durumundayken düzenleme açık; kilit kuralı netleşmeli |
| 4 | Hangi aşamada veri “lock” edilir (ihale başladıktan sonra)? | Beklemede — paket durumlarına göre kilit kuralları tanımlanmalı |
| 5 | Gümrük / Stopaj / Fiyat farkı gibi enum alanların içeriği | “Sistem içerisinde bu alanlara dair neler yazılacağı kararlaştırılacak” — Excel’de açık |
| 6 | Avans oranı + %10 kesinti hesabının nerede yapılacağı | Beklemede |
| 7 | Alt yüklenici skorunun nasıl hesaplanacağı (öz yeterlilik puanı) | Demo’da manuel skor olarak gösteriliyor |


---

## 6. Kullanıcı ve Ekip Yönetimi

Detaylı süreç analizindeki iki maddenin prototip karşılığı:
**kullanıcı listesinin oluşturulması** ve **rol ve yetki listesinin oluşturulması**; ayrıca kullanıcıların
örgütlerle (ekiplerle) eşleştirilmesi.

**Konum:** Sidebar → **Hesap Ayarları** → *Profilim* / *Kullanıcı Yönetimi*; ayrıca üst barda kullanıcı menüsünden
(Profilim · Kullanıcı yönetimi) erişilebilir.

| Sekme | İçerik | Satır aksiyonları | Ekleme alanları |
|---|---|---|---|
| **Kullanıcılar** | Kullanıcı ID · Ad Soyad · Ekip · Rol · Mail | Düzenle · Sil | Ad, Soyad, Ekip, Mail, Ünvan, Rol |
| **Ekipler** | Ekip ID · Ekip Adı · Açıklama · (bağlı kullanıcılar) | Düzenle · Sil | Ekip Adı, Ekip Açıklaması, **Ekip Üyeleri** (kullanıcı ekleme/kaldırma) |
| **Yetkiler** | Yetki ID · Yetki Adı · Açıklama · Bağlı Kullanıcı ID’leri | Düzenle · Sil | Yetki Adı, Açıklama, **Bağlı Kullanıcılar** (arama destekli) |
| **Roller** | Rol ID · Rol Adı · Açıklama · (bağlı yetkiler) | Düzenle · Sil | Rol Adı, Açıklama |
| **Rol–Yetki Eşleştirme** | Rol Adı · Rol ID · Yetki Adı · Yetki ID | Düzenle · Sil | Rol, Yetki, Durum |

- Silme işlemi onay ister; ekipler silinince bağlı kullanıcıların ekip bağlantısı boşalır, yetki/rol silinince
  ilgili eşleştirmeler de kaldırılır.
- Yeni kayıtlarda ID’ler otomatik üretilir (K-006, EK-05, YT-09, RL-07, ES-11).
- **Profilim** ekranı: profil bilgileri (ad, unvan, ekip, mail) **bilgi amaçlı** listelenir (kullanıcı tanımla ekranından
  gelir); yalnızca **İletişim Bilgileri** (ülke/bayrak + ülke kodlu telefon) düzenlenebilir. Ayrıca
  **Şifre Yönetimi → Şifremi Değiştir** akışı (mevcut şifre, yeni şifre + güç göstergesi, tekrar) bulunur.


---

## 7. Erişim kuralları

| Kural | Uygulama |
|---|---|
| **Şantiyeci proje kapsamı** | Şantiyeci yalnızca **kendisine atanmış** veya **kendisinin oluşturduğu** projeleri görür (`atananKullanicilar` + `sahip`). Proje listesi store’daki `goruntulenenProjeler` ile filtrelenir; erişimi olmayan bir proje adresle açılırsa “Bu projeye erişiminiz yok” ekranı gelir. |
| **Sözleşmeye dönüşmüş keşifler** | Sözleşmeye bağlanmış keşif kayıtları **proje erişim kapsamından bağımsız, herkese açıktır** (`/kesif/sozlesmeler`). Kayıt listesi solda; seçilen kaydın metraj tablosu (No · Poz Tanımı · Birim · Miktar), sözleşme bilgileri ve metraj dışa aktarma/dosya aksiyonları sağda. |

Sidebar’a **Keşif → Sözleşmeye Dönüşmüş Keşifler** grubu eklendi; bu ekran diğer proje ekranlarından bağımsızdır.


---

## 8. Sözleşme türü, taslak ve yayınlama akışı

### 8.1 Sözleşme türü → ihale dosyası alanları

İhale paketi oluşturulurken ilk kırılım **sözleşme türüdür**; seçilen türe göre ihale dosyası alanları ve
zorunlu (must) alanlar değişir.

| Sözleşme türü | Alan kapsamı | Zorunlu alan sayısı |
|---|---|---|
| Alt Yüklenici Sözleşmesi | Tüm teknik + finansal + şantiye alanları | 14 |
| Kısa Sözleşme | Yalnızca çekirdek (ad, kapsam, şekil, para birimi, avans, süre, garanti, yer görme) | 8 |
| Proje Hizmetleri Sözleşmesi | Çekirdek + teminat/avans tarihleri + süre/kritik tarihler + teknik personel (şantiye bilgileri kapsam dışı) | 15 |
| Satınalma Sözleşmesi | Çekirdek (keşif ve şantiye bilgileri kapsam dışı) | 9 |

- Tür değiştirilince alan listesi ve varsayılan seçili (zorunlu) alanlar otomatik güncellenir.
- **Satınalma Sözleşmesi** için uyarı metni gösterilir (sözleşmelerin ihale kapsamına girmeyebileceği belirtilir).

### 8.2 Eksik alan uyarıları

- Ayrı bir “taslak” durumu **yoktur**: paket, adı girilip kaydedildiğinde oluşur; eksik alanlar varsa daha sonra
  **Düzenle** ile kaldığı yerden devam edilir.
- Paket oluşturma/düzenleme penceresinin altında zorunlu alanlardan boş kalanlar **“N eksik alan”** rozetiyle
  gösterilir (hepsi doluysa “Zorunlu alanlar tamam”).
- Proje ekranındaki paket kartlarında **yalnızca eksik alan varsa** turuncu **Eksik (N)** rozeti görünür; eksik
  yoksa hiçbir rozet gösterilmez. Eksik alanların listesi tooltip’te ve kartın “Detaylar” bölümünde yer alır.
- Yayınlanmış paketlerde **Yayında** rozeti bulunur.

### 8.3 Yayınlama akışı

1. Paket detayında **Yayınla** butonu → **önizleme modalı** açılır.
2. Önizlemede paket bilgileri (ad, sözleşme türü, çalışma tipi, sorumlu), eksik alan listesi ve doldurulan alanlar görünür.
3. Eksik alan varsa turuncu kutuda eksik alanlar listelenir; **Yayınla**’ya basıldığında “Eksik alanlar
   tamamlanmadan ihale paketi yayınlanamaz.” uyarısı gösterilir.
4. Eksik alan yoksa **önizleme** sunulur (paket bilgileri + doldurulan alanlar) ve yayın onaylanır → paket
   **Yayında** olur, durum “1. tur teklifler bekleniyor”e geçer ve projeye aktivite kaydı yazılır.

> Yayınlama aksiyonu hem proje ekranındaki paket kartının **⋮** menüsünden (İhale Paketini Düzenle · İhale Paketini
> Yayınla · İhale Paketini Sil) hem de paket detayındaki **Yayınla** butonundan erişilebilir.


---

## 9. Belgeler: İhale Belgeleri / Sözleşme Belgeleri

Paket detayındaki **“Belgeler”** sekmesi (Genel Bakış’tan hemen sonra) iki kulakçıktan oluşur:

| Kulakçık | İçerik | Yükleme |
|---|---|---|
| **İhale Belgeleri** | Klasör ağacı: **Keşif ve Teklif** (Ek-01, Ek-02) · **BFT Belgeleri** (Ek-03a…03e) · **Şartnameler** (Ek-04, 05, 06, 08, 29) · **Çizimler** (3 mock belge) · **İş Programı** (3 mock belge) | Her belgede **İndir · Aç · Yükle** |
| **Sözleşme Belgeleri** | 21 standart ek (Ek-07, Ek-09…Ek-28) | Her belgede **İndir · Aç** |

- Sol panel genişletildi (360 px); altında **Yüklenen belge / Toplam boyut** özeti.
- **Yeni Klasör Ekle** ve **klasörü yeniden adlandır** (kalem ikonu) çalışır; eklenen/renklendirilen klasörler pakete kaydedilir.
- “Otomatik dolar” / “Salt okunur” gibi durum etiketleri kaldırıldı; arama alanı kaldırıldı.

- **Ek-00** (TÜM SÖZLEŞME PDF EKLER) listeden kaldırıldı.
- Ekler yalnızca **İndir / Aç** ile kullanılır; “Otomatik dolar” ve “Salt okunur” durum etiketleri kaldırıldı.
- **Davet ekleri:** Alt Yüklenici Yönetimi → davet maili penceresinde “Davet Ekleri” bölümü açılır; zorunlu sözleşme
  ekleri varsayılan seçili gelir, ihale belgeleri ve sözleşme ekleri tek tek seçilerek davetle birlikte gönderilir.


---

## 10. Alt Yüklenici Yönetimi (ihale ekibi gözünden) ve paket durumları

### 10.1 Alt Yüklenici Yönetimi

**Tek panel — “Alt Yükleniciler” (sol panel yoktur)**

Arama alanı, **Yaklaşık Proje İhale Bedeli** ve firma listesi **tek tablo** yapısında birleşmiştir.

- **Üst şerit:** solda **arama** (“Firma veya uzmanlık ile ara…”), sağda **Yaklaşık Proje İhale Bedeli** →
  yalnızca **tutar** → *Kaydet*. **Kaydet** sonrası yeşil **“✓ Kaydedildi”** rozeti (4 sn), butonun
  “Kaydedildi” hâline gelmesi ve tutar alanının yeşil çerçevesi; sonrasında kalıcı **“✓ Kayıtlı”** işareti.
  (Para birimi ve avans oranı bu ekrandan kaldırıldı; avans oranı ihale dosyasındaki
  `ihAvans`, teminat oranı `ihKesinTeminatOrani` alanından okunur ve onay özetine otomatik gelir.)
- **Tek tablo kolonları:** `X (listeden çıkar)` · **Firma** · **Uzmanlık** · **Skor** · **Değerlendirme** ·
  **Onay Durumu** · **Tarih** · **davet gönder**.
- **Arama sonuçları tabloya eklenmez**; arama kutusuna yazıldıkça **arama kutusunun altında açılan panelde**
  (dropdown) gösterilir: değerlendirme işareti · firma adı · uzmanlık · e-posta · skor · yıldız · **sağ ok**.
  Paneldeki bir satıra tıklanınca doğrudan **“Onaya Gönder”** penceresi açılır; pencere kapanınca panel de kapanır.
  Pakette zaten olan firma arama sonucunda tekrar listelenmez (“Bu firma zaten pakete eklendi.”).
- Tablo iki tip satırı içerir:
  1. **Paketeki firmalar** — X ile çıkarılır, firma adına tıklanınca **Firma Detayı** açılır, durum/tarih gösterilir.
  2. **Şantiyecinin önerdiği firmalar** — salt okunur, **“Önerildi”** rozeti ve *Portal kaydı yok* işareti.
- **Firma Öner** yapısı **şantiyeci tarafındadır**; bu nedenle Alt Yüklenici Yönetimi ekranından kaldırıldı ve
  **paketin Genel Bakış sekmesine** taşındı. Bu ekran **yalnızca firmaya mail göndermek** içindir:
  · **Firma Ünvanı** · **Firma Mail Adresi** · **Firma Yetkili Kişisi** · **Mali Sorumlu** (proje kartındaki
  muhasebe yetkilisi / mali işler + genel mali sorumlular) · **Mail Başlığı** · **Cc** · **Notlar**
  · **Mail Başlığı** firma ünvanı yazıldıkça otomatik dolar: *“Firma Önerisi — Portal Kayıt Talebi — {ünvan}”*
  · **Mali Sorumlu** seçilince **Cc** alanına mali sorumlunun maili otomatik eklenir
  · **Notlar** varsayılan: *“Firmanızın incelenip kabul görmesi için lütfen bize vergi levhası ve firma bilgileri
  formunu iletiniz.”*
  · **Vergi Levhası** ve **Firma Bilgileri Formu** bu ekranda **yüklenmez** — firma mail karşılığında iletir;
  mali sorumlu (cc) belgeleri inceleyip SAP onayını yapar ve SAP kaydını oluşturur. Öneri gönderildikten sonra
  portalde takip yapılmaz. Kayıt **“Önerildi”** rozetiyle Genel Bakış’ta ve Alt Yüklenici tablosunda görünür.

**İki durum ekseni**
- *Ön değerlendirme (finansal)* → işaret + etiket: **Başarılı (mavi ✓)** · **Başarısız (kırmızı ✕)** ·
  **Tamamlanmadı (sarı !)** · **Portal kaydı yok (gri)**. Puan başarılı/başarısız firmalarda gösterilir.
- *Onay durumu (ihale yöneticileri / direktör)* → rozet: **Onaya gönderilmedi** · **Onay bekleniyor** ·
  **Onaylandı** · **Davet edildi** · **Reddedildi**.

**Onaya gönderim akışı**
1. Satırdaki **sağ ok** → **“Onaya Gönder”** pop-up’ı. **Onay makamları her zaman**: proje kartındaki **Koordinatör ·
   Direktör · Proje Müdürü** + pakete atanmış **ihale ekibi** (otomatik seçili gelir).
2. **“Onaya Giden Veriler”** özeti mail/bildirimin notlarında görünür: Yaklaşık İhale Bedeli (tutar + para birimi) ·
   Avans Oranı · Kesin Teminat Oranı (ihale dosyasından) · Sözleşme Türü · İhale Şekli · Sözleşme Ekleri (adet) ·
   İhale Belgeleri (adet) · Keşif (poz adedi) · Sorumlu.
3. **Mail Başlığı · Cc** + kullanıcı notu.
4. Gönder → firma aynı tabloda **“Onay bekleniyor”** durumuna geçer (tarih sütununda **Gönderilme** tarihi).
   Onay tamamlandığında **“Onaylandı”** olur ve **davet gönderme** butonu açılır; davet gönderilince
   **“Davet edildi”** olur.

**Firma Detayı penceresi** (firma adına tıklanınca): firma · uzmanlık · iletişim · **ön değerlendirme (durum + puan)** ·
**onay durumu** · skor · yetki belgesi · vergi levhası · **onaya gönderilme / onaylanma / davet tarihleri** ·
**onay makamları** (salt okunur) · not. Onay bekleyen firmada **“Onayı Tamamla”**, onaylanan firmada
**“Davet Gönder”** aksiyonu.

**Tarih sütunu** tek hizada toplanır; duruma göre **Gönderilme / Onaylanma / Davet tarihi** yazılır.
Üstteki **“Davet Et”** butonu toplu gönderim yapar (yalnızca **onaylanmış** firmalar); satırdaki davet ikonu tekil
davet gönderir (onaylanmadan aktif olmaz).

**Davet maili**: alıcılar · **Mail Başlığı** · **Cc** · gövde · **Davet Ekleri** (sözleşme ekleri varsayılan
seçili + ihale belgeleri).

### 10.2 Paket durumları (B)

Paket seviyesindeki durum: **Taslak · Yayınlandı · Hold · İptal · Sözleşme İmzalandı** — proje ekranındaki paket
kartında açılır listeden değiştirilebilir. İhale Yönetimi ekranındaki tur bazlı durumlar (1. tur, pazarlık, …) ayrı
kalmaya devam eder.

### 10.3 Mail alanları

Tüm mail süreçlerinde **Mail Başlığı · Cc · Bcc** alanları bulunur:
Proje Kodu Talebi (önizleme modalı) · Alt Yüklenici Daveti · Firma Önerisi · Onaya Gönderim.


---

## 11. Arayüz temizliği (açıklama metinleri)

- Sistemdeki **açıklama/yardım metinleri kaldırıldı** (alan altı ipuçları, bölüm açıklamaları, rozet açıklamaları).
- **İhale paketi oluşturma penceresi**: soldaki “Doldurulacak Alanlar” listesi tamamen kaldırıldı; **“Alan Bilgileri”** bölümü seçilen
  **sözleşme türüne göre** gelir (alan listesi ve zorunlu alanlar türe göre değişir).
- **Eksik zorunlu alan olsa bile paket kaydedilebilir**; kaydetmede yalnızca uyarı gösterilir, sonradan
  “İhale Paketini Düzenle” ile eksik alanlar tamamlanır.
- **Davet Edilecek Firmalar → Onay Bekleyenler**: “Onayla” butonu kaldırıldı; yerine **pasif (disabled) gönder ikonu**
  bulunur (onay tamamlanmadan davet gönderilemez).
