# Keşif Kuralları ve Doğrulama Planı

Kaynak: `Keşif_Modülü (1).xlsx` (9 sayfa: seviyeler, maliyet elemanları, kolon tanımları, içe aktarma şablonu,
çıktı yapısı, doğrulama kuralları, proje durumları, özellikler).

Bu belge iki şeyi toplar: (1) Excel'deki kuralların **nerede uygulanacağı** (mimari karar), (2) içe aktarma
sihirbazı ve tabloda **şimdiye kadar yapılanlar / sıradakiler**.

---

## 1. Karar: kurallar nerede uygulanır?

**Backend uygular, frontend gösterir.** Aynı kural iki yerde ayrı ayrı yazılmaz; zamanla ayrışırlar.

Neden backend asıl yer:

- Spreadsheet'i atlayan yollar var: içe aktarma sihirbazı, ileride başka istemciler, toplu işlemler.
- "İhale çıkarılmaya hazır" (Doğrulama geçti) geçişi bir iş akışı/güvenlik kararıdır; tarayıcıya güvenilemez.
- `SurveyParser` içinde zaten kısmi uyarılar var (tekrar eden kod, birimsiz kalem, sıfır miktar, toplam uyuşmazlığı).

### 1.1 Kural grupları ve sorumluluk

| Kural grubu | Nerede uygulanır | Frontend'in rolü |
|---|---|---|
| Yapısal doğrulama: Number boş, açıklama boş, birim listede, pozda miktar > 0, üst satır eksik, sıra atlanmış | **Backend** (`SurveyValidator`, kodlu: `E01…`) | Kırmızı şerit, hücre işareti, "Düzelt" bağlantısı |
| Seviye türetme: Number'daki her basamak bir seviye (`01`, `01.02`, `01.02.30`, `…0010` = poz) | **Backend** | Level 1/2/3 filtresi ve girinti |
| Fiyat uyarıları: hiç fiyat yok, kâr % eşik dışı (>50 veya <0), başlık yok | **Backend**, eşikler yapılandırılabilir | Yalnızca uyarı rozeti |
| Otomatik düzeltmeler: Renumber, eksik üst satırı ekle, birim önerisi | **Backend** yama/öneri üretir | Önizletir, kullanıcı onaylar, yerel tabloya uygular |
| İş akışı: 5 durum, geçiş kuralları, sürümler | **Backend** (durum makinesi, yetki, kayıt) | İzinli geçişleri backend'den alır, butonları açar/kapatır |
| Referans veri: birim listesi, maliyet elemanları | **Backend** servis eder | Dropdown'ları oradan doldurur, sabit yazmaz |
| Anlık kontrol (boş Number, miktar ≤ 0) | Backend ile **aynı katalogdan** | İsteğe bağlı, yazarken hızlı geri bildirim |

Frontend için iki seçenek: (a) düzenlemeden sonra debounce ile `POST /validate` çağırmak — birkaç bin satır için
hızlıdır ve tek motor kalır (**önerilen**); (b) gecikme sorun olursa en basit 2–3 kuralı istemcide tekrarlamak,
ama kural kataloğu yine backend'den gelir.

### 1.2 İlkeler

1. **İçe aktarma doğrulama hatası yüzünden engellenmez.** Yalnızca dosya okunamıyorsa durur. Hatalar listelenir,
   **yayınlama / durum geçişi** engellenir (Excel: "tabloyu yayınlamadan önce kontrol").
2. **Her kural bir kod taşır** (`E01…`, `W01…`): önem, satır, sütun, mesaj ve varsa düzeltme önerisi. Frontend metni
   kendisi üretmez.
3. **Seviye kullanıcıya seçtirilmez, Number'dan türetilir.** Portalda `seviye: 1|2|3` ayrı bir alan, Excel ise
   4 seviyeli ve numara tabanlı; bu uyuşmazlık giderilmeli.

### 1.3 API (backend'de yapıldı)

| Uç nokta | Amaç |
|---|---|
| `POST /api/excel/survey/validate` | `{ rows }` → `{ issues, errorCount, warningCount, canPublish }` |
| `POST /api/excel/survey/fix` | `{ fix, rows }` → `{ rows, changes, validation }` (düzeltilmiş tüm satırlar + ne değişti + yeniden doğrulama) |
| `GET /api/excel/survey/reference` | Geçerli birimler, kural kataloğu, düzeltmeler, kâr eşikleri |
| `POST /api/excel/survey/import` | Ayrıştırma; yanıtta artık `issues` (doğrulama) da var |

Satır modeli (`SurveyValidationRow`, sıra anlamlı): `id, number, description, unit, quantity, materialPrice,
laborPrice, ggkPrice, unitPrice, profitPercent, sourceRow`. Sorun: `{ code, severity (Error|Warning), message, rowId,
sourceRow, field, fixId }`. Düzeltme kimlikleri: `fill-numbers`, `normalize-units`, `add-parents`, `renumber`.

Kod: `libs/backend/Excel/src/Validation/` (`SurveyValidator`, `SurveyFixer`, `SurveyRules`, `SurveyUnits`,
`SurveyNumbering`). Poz = birimi **veya** miktarı olan satır; diğerleri başlık; birimi `note` olan satır açıklamadır ve
hiçbir kurala girmez.

---

## 2. Excel'deki kuralların dökümü (kaynak)

**Seviyeler (sayfa 2):** Seviye 1 = 2 hane (`01`), 2 = 2+2 (`01.02`), 3 = 2+2+2 (`01.02.30`) → BAŞLIK satırları.
Seviye 4 = 2+2+2+4 (`01.02.30.0010`) → POZ; birim ve miktar dolu.

**Maliyet elemanları (sayfa 3):** `MALZEME`, `ISCIK` *(muhtemelen `ISCILIK`)*, `NAKLIYE` (opsiyonel),
`GÖRÜNMEZ MALİYET`, `GGKAR` (genel gider + kâr, yüzde ile girilir).

**İçe aktarma şablonu (sayfa 5):** A=Number, B=Description, C=Units, D=Quantity (+ fiyat kolonları). Poz numarası
nokta ile hiyerarşi kurar; `note` birimi açıklama satırıdır (hesaplanmaz); ondalık ayırıcı nokta veya virgül.

**Çıktı (sayfa 6):** başlık 7. satırda; üstte proje künyesi; altta `Sum:` toplam satırı.

**Doğrulama (sayfa 7):**

| Kod | Seviye | Kural | Düzeltme |
|---|---|---|---|
| E01 | Hata | Number boş olamaz | Otomatik sıralama |
| — | Hata | Birim listeden olmalı | Otomatik düzeltme önerilir |
| — | Hata | Açıklama boş olamaz | Kullanıcı girer |
| — | Hata | Pozda miktar > 0 | Kullanıcı girer |
| — | Hata | Üst satır eksik (V.6.2 varsa V ve V.6 da olmalı) | Sistem otomatik ekler |
| — | Hata | Sıra numarası atlanmamış (01, 01.03, 01.02 → bozuk) | Renumber |
| — | Uyarı | Satır tipi karışık (birim dolu, miktar boş) | Kullanıcı düzeltir |
| — | Uyarı | Hiç fiyat girilmemiş | Fiyat girilir |
| — | Uyarı | Kâr oranı eşik dışı (>%50 veya <0) | Gözden geçirilir |
| — | Uyarı | Hiç başlık yok | Başlık eklenir |

**Proje durumları (sayfa 8):** Hazırlık aşamasında → İhale çıkarılmaya hazır (doğrulama geçti) → Teklifler alınıyor →
Teklifler kapandı → İhale verildi. Sürüm = keşif revizyonu (`#1 22.10.2026`…).

**Özellikler (sayfa 9):** BOQ'u kontrol et, başka projeden BOQ al, sürümleri karşılaştır, BOQ'u kopyala, tekliflerle
karşılaştır, tekliflerden BOQ al.

---

## 3. Belirsizlikler ve alınan kararlar

Excel'deki belirsizlikler için **varsayılanlar seçildi ve uygulandı**; hepsi değiştirilebilir (`SurveyValidationOptions`
veya kural kodu). Onayınız gerekenler işaretli.

| # | Belirsizlik | Alınan karar | Onay |
|---|---|---|---|
| 1 | Birim listesi dosyada yok ("4. sayfadaki liste") | Yaygın inşaat/tesisat birimleriyle varsayılan liste: `m, m², m³, adet, kg, ton, lt, set, takım, kalem, götürü, paket, kutu, top, rulo, çift, saat, gün, ay, nokta, %`. Büyük/küçük harf farksız; `m2→m²`, `mt→m`, `ad→adet` gibi yazımlar düzeltilebilir hata (E02) | ☐ **Gerçek liste gerekli** |
| 2 | "Pozda miktar > 0" (hata) ile "birim dolu miktar boş" (uyarı) çakışıyor | Miktar boş/≤0 olan poz → **E04 (hata)**. Miktarı dolu ama birimi boş → **W01 (uyarı)** | ☐ |
| 3 | "Sıra numarası atlanmamış" ama örnek sıra bozukluğu | **E06 = aynı üst başlık altında (sayısal) numaralar artan sırada değil.** Atlama (01.02 → 01.05) hata değil (gerçek BOQ'larda 0010, 0020… adımlar var). Ayrıca bkz. #10 | ☐ |
| 4 | Seviye 4 poz "son basamak 4 hane" ama örnekte `01.02` | **Zorlanmıyor.** Poz/başlık ayrımı numaraya değil birim/miktara bakar; seviye = basamak sayısı | ☐ |
| 5 | `ISCIK` yazımı | Kod olarak kullanılmadı; model alanı `iscilik` | — |
| 6 | Kâr % eşiği ve portalda alan yok | Eşik 0–50 (yapılandırılabilir); kural satırda `profitPercent` varsa çalışır. Portal modelinde alan henüz yok → şimdilik tetiklenmez | ☐ |
| 7 | "Üst satır eksik" otomatik eklenirken başlık metni | Eklenen başlığın açıklaması `BAŞLIK` (kullanıcı düzenler) | ☐ |
| 8 | Renumber kapsamı | Yalnızca tüm basamakları sayı olan numaralar, belge sırasına göre; basamak genişliği (01, 0010) korunur; `V.6.2` gibi harfli numaralar değişmez | ☐ |
| 10 | Ekipman etiketleri (`AHU 01`, `KEF 04`, `EF 01`) hiyerarşik numara değil (gerçek SAP dosyası) | **E06 yalnızca son basamağı sayı olan numaralara uygulanır** (`01.02`, `V.9.4`). Etiketler sıralanmaz; aksi halde `EF 01 < KEF 04` gibi yanlış pozitifler çıkıyordu | ☐ |
| 11 | Portalın kendi dışa aktarması başlıkları `Miktar = 0` ile yazıyor → geri okunurken başlıklar poz sanılıyordu | **Birimsiz ve miktarı 0 olan kodlu satır başlıktır.** Birimi olan sıfır miktarlı satır kalem kalır (E04) | ☐ |
| 12 | `Maktüen`, `Ad` gibi birim yazımları | `Maktüen`/`maktu` → `götürü`, `Ad` → `adet` düzeltme önerisiyle gelir (E02) | ☐ |
| 13 | *Yeniden numarala* harfli önekli numaralarda (`V.9.2`) çalışmıyordu | Yalnızca **sırası bozuk kardeş gruplarını** belge sırasına göre numaralar (atlamalar korunur); alt satırlar yeni öneki takip eder; sıfır dolgusu yalnızca dosyada varsa | ☐ |
| 14 | **Doğru biçim = ConWize BOQ** (`Number / Description / Units / Quantity / Unit cost / Total cost`, 4 seviye: `01` → `01.02` → `01.02.30` → `01.02.30.0010`). Girdideki numara önemsiz | İçe aktarmada **otomatik numaralandırma** (sihirbazda varsayılan açık): başlıklar `01`, `01.01`…; pozlar bağlı olduğu başlığın altında `01.01.0010`, `0020`… Girdi numaraları yalnızca hiyerarşiyi anlamak için okunur; **özgün kod "Kaynak Kod" sütununda korunur** (`AHU 01`, `V.1.`). Poz, dosyadaki sırayla en son görülen başlığın altına girer | ☐ |
| 15 | `V` gibi en üst satır dosyada yok (SAP: `V.1.`, `V.2.` …) | Eksik üst başlık **`01` kök satırı** olur; açıklaması keşfin başlığından (disiplin → belge → proje → sayfa adı) gelir ve sihirbazda düzenlenebilir. Bu, E05 (`V` eksik) sorununu da ortadan kaldırır | ☐ |
| 16 | Numarası olmayan satırlar (çok satırlı açıklamalar, notlar) tabloda görünmüyordu | **Yorum / devam satırı** (`KesifSatiri.yorum`): kaynak konumunda, önceki satırın devamı olarak ayrı satır (soluk + italik). Poz sayılmaz, numaralanmaz, doğrulanmaz, toplamlara girmez. Tabloda **"Yorum satırı ekle"** ile eklenir; poz silinince devam satırları da silinir; dışa aktarımda not olarak yazılır | ☐ |
| 17 | Otomatik numaralanmış bölümde hem pozlar (`01.07.0010`) hem alt başlıklar (`01.07.01`) var → E06 yanlış pozitifi | **Kardeş sıralaması türüne göre ayrı** (başlık / poz); *Yeniden numarala* da aynı grupları kullanır | ☐ |
| 18 | **Poz No kullanılmayacak; yerine Level** (1–9 = numaradaki nokta sayısı + 1: `01` → 1, `01.02` → 2, `01.02.01` → 3). Yorum satırı = Level `C` | Tabloda ilk sütun **Level**; Poz No gösterilmez. Hiyerarşi Level'dan okunur; numaralar (01, 01.01, 01.01.0010) kayıt/dışa aktarımda sıradan ve Level'lardan otomatik üretilir. Level hücresine `C` yazmak satırı yorum yapar (sayı yazmak başlığa çevirir; geçersiz değer eski haline döner). İçe aktarmada `Level` sütunu bir rol: Kod sütunu gerekmez, `C` satırları önceki satırın devamı olur | ☐ |
| 19 | Sol şerit satır numaraları her satırda | Yorum (`C`) satırlarında **numara gösterilmez**; diğer satırlarda gerçek tablo satır numarası kalır (formül adresleriyle tutarlı). "Poz" = Level'ı olan satır (başlık + kalem); yalnızca kalemlerde istenirse tek satırlık değişiklik | ☐ |
| 20 | Aç/kapa yalnızca ana gruplardaydı | **Seviye tabanlı:** alt ağacı olan her satır (başlık ya da poz) kapanır; poz kapanınca devam (`C`) satırları gizlenir. "Bölümleri kapat/aç" tüm seviyeleri etkiler | ☐ |
| 21 | Seviye kuralları | **E05 (Level modu):** bir satır bir öncekinden en fazla 1 derin olabilir (1 → 3 atlanamaz); düzeltme = eksik seviyeler için başlık ekler. **E07:** Level 1–9 olmalı. Level modunda E01/E06 (numara) uygulanmaz. Her başlığın alt toplamı yalnızca kalemleri toplar (iç içe başlıklar çift sayılmaz) | ☐ |
| 22 | Poz No / Level seçilmeyecek; ne gelirse Level'a dönüşür | Sihirbazda tek rol **"Level / Poz No"** (isteğe bağlı). Sütun türü **içerikten** çözülür (`SurveyKeyColumn`): değerler 1–9/`C` ise (ve `C` var / değer tekrar ediyor / başlık Level) Level; aksi halde (`01.02`, `V.1.`, `AHU 01`, `1..N`) Poz No/kod → hiyerarşi kod önekinden. **Otomatik numaralama artık her zaman açık** (seçenek kaldırıldı; API varsayılanı `autoNumber=true`): kök `01` üretilir, yer tutucu kök ("BAŞLIK") keşif başlığıyla değişir, özgün kod `Kaynak Kod`da. Level/Poz No sütunu hiç yoksa birimli/miktarlı satır poz, diğerleri önceki satırın devamı. "Poz Tanımı" yoksa "Açıklama" poz tanımı olur. `C` satırı içeriğine bakılmadan **önceki satırın devamıdır** | ☐ |
| 9 | Başlık seviyeleri portalda "ana grup"a düzleşiyor | Açık: iç içe başlık hiyerarşisi (ve iç içe aç/kapa) istenecek mi? | ☐ |

---

## 4. İçe aktarma sihirbazı — durum

Akış: **Dosya → Aralık → Sütun Eşleme → Önizleme.** Ayrıştırma Ark.Excel backend'inde yapılır
(`POST /api/excel/survey/preview` ve `/import`).

### Yapıldı

- Sayfa seçimi, başlık satırı / ilk–son veri satırı, sütun → alan eşlemesi; Türkçe ve İngilizce başlık tanıma.
- Backend: `SurveyParseOptions` (`HeaderRow`, `FirstDataRow`, `LastDataRow`, `ColumnMap`), `SurveyPreviewer`,
  `SurveyColumnRoles`; yeni roller `additionalDescription`, `unitPrice`; `TOTAL` satırı bölüm sayılmıyor.
- Düzeltme: metin tipli hücredeki `"01"`, `"01.02"` kodları artık sayıya çevrilip bozulmuyor.
- **Varsayılan teklif kırılımı seçeneği kaldırıldı** (kırılım, fiyat sütunlarından türetilir; yoksa `Malzeme + İşçilik`).
- **Başlık / poz ayrımı görünür:** Sütun Eşleme adımında "Başlık ve poz ayrımı" paneli (sayı + örnekler; tahmini),
  Önizleme adımında ayrı **Başlık** ve **Poz Tanımı** sütunları ve "Başlık / Poz" sayaçları.
  Kural (Ark.Excel): birim **ve** miktarı olmayan kodlu satır = başlık; birim veya miktarı olan = poz; kodsuz metin
  satırı = ilgili kaleme not; `TOTAL` satırı = toplam (aktarılmaz).

### Sıradaki

- [x] **Otomatik numaralandırma + kök satır + yorum/devam satırları** (§3 #14–#16): backend `SurveyAutoNumbering`,
  `autoNumber` / `rootTitle` sorguları, `SourceCode`/`IsGenerated`; arayüzde sihirbaz seçenekleri, tabloda `note` satır türü
  (ui-kit), "Kaynak Kod" sütunu, "Yorum satırı ekle".
- [x] **Level modeli** (§3 #18–#21): backend `Level` rolü + seviye hesabı (`SurveySection.Level`, `SurveyItem.Level`), E05/E07
  level modu; ui-kit `SpreadsheetRow.level` (seviye tabanlı aç/kapa) ve `hideRowNumber`; portalda Level sütunu, `C` ile yorum,
  alt toplamlar, Level'dan türetilen numara, şablon/dışa aktarım (Level + `C`).
- Desteklenmeyen: ConWize'ın **`Matrix BOQ`** sayfası (bina başına miktar sütunları); yalnızca `BOQ` sayfası okunur.
- [ ] Eşlemeyi sonraki içe aktarma için hatırlama (başlık imzasına göre).
- [ ] Başlık satırı değişince eşlemenin yeniden önerilmesi (backend'e `suggest` çağrısı).
- [ ] Backend kapalıyken yerel yedek (şimdilik yok; sihirbaz hata gösterir).

---

## 5. Tablo (Spreadsheet) — grup aç/kapa

`@ark/ui-kit` `Spreadsheet` bileşenine `collapsibleGroups` prop'u eklendi (varsayılan kapalı):

- `group` satırının sol şeridinde aç/kapa oku; araç çubuğunda **Bölümleri kapat / aç**.
- Kapalı bölümün altındaki satırlar (sonraki `group` veya `total` satırına kadar) **yalnızca görsel olarak** gizlenir:
  formüller, satır numaraları ve toplamlar değişmez (Excel'deki satır gizleme gibi).
- Klavye gezinmesi gizli satırları atlar; seçili hücre gizlenirse seçim bölüm satırına taşınır.
- `TakeoffTable` bu özelliği etkinleştirir. Mevcut "Göster" filtresi (Tümü / Sadece ana gruplar / Sadece kalemler)
  ayrıdır; filtre satırları yeniden üretir, aç/kapa yalnızca gizler.

---

## 6. Backend durumu

- [x] Kural kataloğu (E01–E06, W01–W04) ve düzeltmeler (`fill-numbers`, `normalize-units`, `add-parents`, `renumber`).
- [x] `/validate`, `/fix`, `/reference`; ayrıştırıcı `issues` döndürüyor.
- [x] Testler: Excel 142, API 19.
- [ ] Durum makinesi (5 durum, geçiş kuralları, yetki) — "İhale çıkarılmaya hazır" geçişi `canPublish`'e bağlanacak.
- [ ] Seviyenin Number'dan türetilmesi (portal modeli ile uyum; §3 #9).
- [ ] Sürümler ve karşılaştırma (sayfa 8–9).

---

## 7. Frontend planı (kurallara bağlı özellikler)

Sıra, bağımlılığa göre. Her madde bağımsız teslim edilebilir.

| # | Özellik | Ne yapar | Değişen yerler |
|---|---|---|---|
| F1 | **Doğrulama istemcisi** | `KesifSatiri[]` → `SurveyValidationRow[]` eşlemesi, `POST /validate` (debounce ~500 ms), `GET /reference` önbelleği. Sonuç tek bir hook'ta (`useKesifDogrulama`) | `src/lib/kesifDogrulama.ts` (yeni), `TakeoffTable` |
| F2 | **Doğrulama şeridi** ("BOQ'u Kontrol Et") | Tablonun üstünde: "N hata · M uyarı" şeridi (kırmızı/sarı/yeşil), "BOQ'u Kontrol Et" düğmesi, sorun listesi açılır paneli; satıra tıklayınca tablo o hücreye gider | `TakeoffTable`, yeni `DogrulamaSeridi.tsx` |
| F3 | **Hücre/satır işaretleri** | Sorunlu hücrede kırmızı/sarı işaret + tooltip (mesaj). `@ark/ui-kit` Spreadsheet'e `cellMarks` (satır başına sütun → önem + mesaj) eklenmeli | `ui-kit/Spreadsheet` (+test), `TakeoffTable` |
| F4 | **"Düzelt" akışı** | Sorunun `fixId`'si varsa "Düzelt" düğmesi → `POST /fix` → **değişiklik önizleme modalı** (eski → yeni) → onayla → tabloya uygula (güncellenen alanlar id ile eşlenir; eklenen başlıklar `seviye 1` satır olarak araya girer) → yeniden doğrula. Toplu menü: Numaraları doldur / Birimleri düzelt / Üst başlıkları ekle / Yeniden numarala | `TakeoffTable`, yeni `DuzeltOnizlemeModal.tsx` |
| F5 | **Yayın kapısı** | `canPublish=false` iken "Yayınla" / "İhale çıkarılmaya hazır" geçişi pasif; tooltip'te hata sayısı ve "Düzelt" bağlantısı. Backend durum makinesi gelince aynı kural sunucuda da zorlanır | `PackagePublishModal`, `PackageDetailPage`, `SantiyeciPackageDetailPage` |
| F6 | **Sihirbaz: doğrulama özeti** | Önizleme adımında `document.issues` (E/W kodlarıyla) gösterilir; içe aktarma **engellenmez**. "Birimleri düzelt" seçeneği açıkken `m2→m²` kaynaklı E02'ler önceden elenir | `ImportWizard.tsx` |
| F7 | **Referans verili girdiler** | Birim hücresi için öneri listesi (`/reference` birimleri); kâr % sütunu eklenirse W03. `ui-kit` Spreadsheet'e hücre öneri/seçim desteği gerekir | `ui-kit/Spreadsheet`, `TakeoffTable` |
| F8 | **Seviye türetme** | §3 #9 kararına göre `seviye` alanının Number'dan türetilmesi, Level 1/2/3 filtresi, iç içe aç/kapa | `TakeoffTable`, `kesif.ts`, (gerekirse) `ui-kit` |

### Durum

- [x] **F1** — `src/lib/kesifDogrulama.ts`: `KesifSatiri → SurveyValidationRow` eşlemesi, `/validate` + `/reference` istemcisi,
  `useKesifDogrulama` hook'u (500 ms debounce, istek iptali, eski sonucu koruma).
- [x] **F2** — `DogrulamaSeridi.tsx`: "N hata · M uyarı / Doğrulama geçti" şeridi, "BOQ'u Kontrol Et", sorun listesi,
  soruna tıklayınca tabloda ilgili hücreye gitme (ui-kit `Spreadsheet.focusRequest`; kapalı bölümü açar, "Göster" filtresi
  gizliyorsa Tümü'ne döner). Servis kapalıyken eski sonuç **nötr ve "güncel değil"** gösterilir (yeşil/kırmızı değil).
- Alınan kararlar: doğrulama her düzenlemede (debounce ile); hata varken Kaydet serbest. Keşif aşamasında fiyat girilmediği
  için **W02 ("hiç fiyat yok") bu ekranda varsayılan olarak gizli** (`KESIF_ASAMASINDA_YOKSAYILAN_KODLAR`); fiyat aşamasında
  hook'a `yoksay: []` verilerek açılır.
- [x] **F3** — Hücre işaretleri: ui-kit `Spreadsheet.cellMarks` (renkli iç çerçeve + sağ üst köşe işareti + ipucu +
  `aria-invalid`); aynı hücredeki sorunlar tek işarette birleşir. `sorunlardanHucreIsaretleri` ile bağlandı.
- [x] **F4** — "Düzelt" akışı: sorun satırında **Düzelt**, listenin üstünde **Toplu düzeltme** (Birimleri düzelt / Yeniden
  numarala / Üst başlıkları ekle / Numaraları doldur — yalnızca ilgili sorun varsa). `POST /fix` → **önizleme modalı**
  (eski → yeni, "düzeltme sonrası N hata") → onay → tabloya uygulama → otomatik yeniden doğrulama → **Geri al** (bir sonraki
  elle düzenlemeye kadar). Uygulanan düzeltme Kaydet'e basana kadar kaydedilmez; salt okunur modda pasif.
  Notlar: düzeltme tüm tabloya uygulanır (satır başı değil); *Yeniden numarala* belge sırasına bakar, yani satırlar fiziksel
  olarak yanlış yerdeyse numaralar da o konuma göre verilir — bu yüzden önizleme zorunludur.
- [x] **F5** — Yayın kapısı: `src/lib/yayinKapisi.ts` (`yayinKapisiHesapla`) + `YayinKapisi.tsx` (`YayinlaDugmesi`). Hem ihale hem
  şantiyeci paket sayfasında "Yayınla", **kaydedilmiş** keşif satırlarının doğrulamasına bağlı: hata varsa pasif +
  "N keşif hatası · Düzelt" (Keşif sekmesine götürür); yayın modalı da aynı kapıyı uygular ve durumu gösterir.
  **Fail-closed:** sonuç güncel değilse (debounce/istek sürüyor) veya servise ulaşılamıyorsa kapı kapalı kalır
  ("Keşif doğrulanamadı · Tekrar Dene"). Hook'a `guncel` bayrağı eklendi. Düzeltmeler Kaydet'e basılınca kapıya yansır.
  **Not:** Bu arayüz kapısıdır; sunucuda zorlanması durum makinesiyle (§6) gelecek.
- [x] **F6** — Sihirbaz önizleme adımında "aktarılacak satırlar" doğrulaması (birim düzeltme gibi seçenekler uygulanmış haliyle,
  `/validate` ile): özet paneli + önizleme tablosundaki Not sütununda kod/mesaj. **İçe aktarmayı engellemez.**
- [ ] F7, F8 (aşağıdaki sıra).

### Sıra önerisi

1. **F1 → F2** (görünürlük: önce sorunları görelim), sonra **F3** (hücre işaretleri).
2. **F4** (düzeltmeler) — kuralların asıl faydası burada.
3. **F5** (yayın kapısı) ve **F6** (sihirbaz özeti).
4. **F7 / F8** — §3 #1 ve #9 kararlarına bağlı.

### Bu kısımda karar gerekenler

- Düzeltmeler **her zaman önizleme + onay** ile mi uygulansın (öneri: evet), yoksa bazıları (birim) tek tıkla mı?
- Doğrulama **her düzenlemede** mi, yoksa yalnızca "Kaydet" ve "BOQ'u Kontrol Et"te mi çalışsın? (Öneri: her düzenlemede, debounce ile.)
- Hata varken **Kaydet** serbest mi? (Öneri: evet — yalnızca yayın/geçiş engellenir.)

---

## 8. 05.11 toplantısı — istek planı (B grubu)

Kaynak: 05.11.2026 "Impromptu Teams Meeting" kaydı (spreadsheet / içe aktarma ile ilgili maddeler). Madde numaraları
konuşmadan çıkarılan listedeki B maddeleridir. Boyut: **S** ≤ yarım gün, **M** 1–2 gün, **L** birkaç gün.
Not: 06.11 16:00 demosu için yalnızca Faz 0–1 (+ A grubu hatalar) hedeflenir; Faz 3–4 demo sonrası.

### Kod incelemesinden çıkanlar (planı etkileyen)

- `TakeoffTable.tsx` formülleri sütun **harflerine sabit** (`E`, `F`, `G`, `H`, `I`, `J`; ör. `=E7*I7`, `=SUM(J3:J9)`).
  Sütun eklemek / sırasını değiştirmek (Poz Kodu'nu Poz Tanımı'nın soluna almak dahil) bu harfleri kaydırır →
  **önce anahtar → harf eşlemesi** kurulmalı (Faz 0, tüm sonraki işlerin ön koşulu).
- ui-kit `Spreadsheet`: dropdown hücre editörü, sütun düzeyinde salt-okunur, başlıkta formül gösterimi **yok**;
  sütun ekleme de yok (sütunlar tüketicide üretilir). Sütun ekleme arayüzünü portalda (toolbar + modal) kurmak ui-kit'e
  dokunmayı azaltır; dropdown ve sütun salt-okunur/ipucu ui-kit'e eklenmeli.
- `E04` (miktar boş / ≤ 0) zaten var → B24 ek kural gerektirmiyor, yalnızca test.
  `W02` (fiyat yok) tabloda zaten yoksayılıyor (`KESIF_ASAMASINDA_YOKSAYILAN_KODLAR`); sihirbaz özetinde de aynı filtre kullanılmalı (kontrol edilecek).
- Düzelt önizleme modalı (`DuzeltOnizlemeModal`) "Yeni" değerini salt metin gösteriyor; düzenleme yok.
- ui-kit varsayılan etiketleri aksansız ("Sifirla", "Bolumleri kapat", "Yazdir", "Satir ekle"); portal etiketleri geçirmiyor.
- Şablon (`/template`, yerel yedek `KESIF_SABLON_BASLIKLARI`) eski yapıda; Level / Poz Kodu / kurallar yok.
- Level numarası (01.01.0010) ile **Poz Kodu** (AHU 01, ÖBF2) ayrı kavram: Level hiyerarşi, Poz Kodu kimlik (`kaynakKodu`).

### Faz 0 — Önkoşul + adlandırma (S–M, demo öncesi)

| # | İş | Dosya / yer | Boyut |
|---|----|-------------|-------|
| 0.1 | Sütun **anahtar → harf** yardımcısı; tüm formüller (`E..J`, `'Keşif Metrajı'!E…`) bundan üretilir | `TakeoffTable.tsx` | S |
| 0.2 | **Poz Kodu** (eski "Kaynak Kod") **Level'dan sonra, Poz Tanımı'ndan önce**; sihirbaz önizleme / dışa aktarma / şablon başlıkları "Poz Kodu" (B19) | `TakeoffTable.tsx`, `ImportWizard.tsx`, `kesif.ts` | S |
| 0.3 | Sekme adları: `Keşif Metrajı` → **Detay**, `Bölüm Özeti` → **İcmal** (özet formüllerindeki sayfa adı sabitlenmeden sabitten üretilir) (B26) | `TakeoffTable.tsx` | S |
| 0.4 | Etiketler: portal doğru Türkçe `labels` geçirir; ui-kit varsayılanları da düzeltilir (Yazdır, Satır ekle, Sıfırla, Bölümleri kapat…); "BOQ'u Kontrol Et" → "Keşfi Kontrol Et"; UI genelinde İngilizce metin taraması (B27) | `TakeoffTable.tsx`, ui-kit `Spreadsheet.tsx` | S |
| 0.5 | Küçük ekranda pencere/sihirbaz **kapatma (X)** görünürlüğü kontrolü (B28; büyük ihtimalle ekran paylaşımı kaynaklı, kod hatası değil) | `Modal` | S |

Kabul: tablo harf kaydırmasına rağmen aynı toplamları verir (mevcut test + yeni); sekme/etiket metinleri Türkçe.

### Faz 1 — Kurallar (backend + küçük arayüz) (S–M, demo öncesi mümkün)

- **1.1 (B24)** "Birim varsa miktar zorunlu": `E04` zaten karşılıyor (boş / ≤ 0) → yalnızca test eklenir; geri çekilen "fiyat sütunlarından biri dolu olsun" kuralı **uygulanmaz**.
- **1.2 (B25)** Sihirbaz özetinde `W02` (ve gerekirse `W03`) keşif aşamasında gizlenir; tek sabit hem tabloda hem sihirbazda kullanılır.
- **1.3 (B20)** Poz Kodu kuralları (Level modunda E01/E06 devre dışı olduğu için şu an hiçbiri çalışmıyor):
  - `E08` Poz kodu boş (yalnızca poz satırlarında — başlık için isteğe bağlı; **karar D2**),
  - `E09` Poz kodu **paket içinde** tekrar ediyor (kapsam = ihale paketi; proje / global değil),
  - düzeltme: "Poz kodlarını doldur" (önek + sıra; bkz. 4.1). İçe aktarmada kaynak kod yoksa otomatik üretilir, içe aktarmayı engellemez.
  - Yayın kapısı: E08/E09 hata olarak kapıya girer (**karar D3**).

### Faz 2 — Düzelt ve içe aktarma deneyimi (M)

- **2.1 (B8, B9)** Düzelt önizlemesinde "Yeni" hücresi düzenlenebilir: birim için `/reference` birim listesinden dropdown, diğer alanlar metin. Onaylanan değerler `duzeltmeyiUygula`'ya geçer; sonra yeniden doğrulama. Backend'de birim eşanlamlıları genişletilir (kübik metre, square meter, metre kare, m2/m3, mt/mtül, ad…) + test.
- **2.2 (B12)** Doğrulama şeridinde **önceki / sonraki sorun** düğmeleri; bir sorun düzelince sıradakine geçiş (isteğe bağlı ayar).
- **2.3 (B11)** Sihirbaz "Aralık" adımında önizleme tablosundan tıklayarak başlık satırı / veri aralığı seçimi (L değil, M; demo sonrası olabilir).

### Faz 3 — Tablo: başlık satırları, dropdown, sütun formülü, özel sütunlar (L, demo sonrası)

- **3.1 (B5)** Başlık satırlarında Miktar / Malzeme / İşçilik / GGK **kaldırılır**; yalnızca **Toplam Tutar** (alt toplam). İcmal'deki "Toplam Miktar" sütunu kalkar; genel toplam satırında yalnızca tutar. Etkilenen: `kesifSheetsOlustur`, `altAgacSonu` kullanımı, testler.
- **3.2 (B10)** ui-kit: `SpreadsheetColumn.options?: string[]` (+ `strictOptions`). Birim sütunu tanımlı birimlerden dropdown; listede olmayan **yapıştırılan** değer reddedilmez, `E02` ile işaretlenir (veri kaybı yok).
- **3.3 (B14)** ui-kit: `SpreadsheetColumn.readOnly` ve başlıkta formül ipucu (`formulaHint`, ör. "Miktar × Birim Fiyat"). Hesaplanan sütunlar (Birim Fiyat, Toplam Tutar) sütun düzeyinde salt-okunur; formül başlıkta görünür, hücre bazında düzenlenmez.
- **3.4 (B15–B18)** Özel sütunlar — veri modeli ve hesap:
  - Paket düzeyinde `kesifSutunlari: { key, baslik, tur: 'maliyet' | 'katsayi', hedef }[]`; satırda `ekDegerler: Record<key, number>` (alanlar opsiyonel → eski kayıtlar bozulmaz).
  - **maliyet** sütunu (örn. Nakliye): Birim Fiyat toplamına otomatik dahil olur.
  - **katsayı** sütunu (örn. Fittings): boş = 1; **hemen solundaki sütunu** çarpar; Birim Fiyat'ın hemen solundaysa maliyet toplamını çarpar (Birim Fiyat = (Σ maliyet) × katsayı). İşçilik yanına konunca yalnızca işçilik çarpılır (yıllık işçilik artışı senaryosu).
  - Formül, sütun sırasından **tek yerden** üretilir (hücre bazında formül yok — Nevin'in "başlık bazında" isteği); başlıkta gösterilir (3.3).
  - Arayüz: toolbar'da **Sütun ekle** (portalda modal): ad, tür, "şu sütunun sağına"; ön tanımlı liste (Nakliye, Fittings…) + özel ad. ui-kit'e sütun ekleme API'si gerekmez.
  - Dışa aktarma: ek sütunlar düz sütun olarak yazılır. İçe aktarma rolleri için bkz. 4.3.

### Faz 4 — Sonraki (L, ayrı planlanır)

- **4.1 (B21, B22)** Poz kodu üretim stili: sihirbaz / tabloda "boşsa otomatik üret" (önek + başlangıç + hane; ör. `AHU 01`, `ÖBF 1`); önek her seferinde değişmez (paket ayarı). Alfabetik / numerik stil seçeneği (Hilal). İşveren kodu için isteğe bağlı "Eski / İşveren Kodu" alanı.
- **4.2** Level değişince alt satırların taşınması ve başlık silme davranışı (A grubu #4 ile birlikte).
- **4.3** Ark.Excel'de özel sütun rolleri (`extraCost`, `factor`): `ColumnMap` şu an rol başına tek sütun tutuyor → çoklu sütun rolü için tasarım gerekir.
- **4.4 (B13)** Şablon: yeni sütun yapısı (Level, Poz Kodu, Poz Tanımı…), **Kurallar** sayfası (Level 1–9, C = yorum, birim listesi, miktar > 0, poz kodu benzersiz), Birim ve Level için Excel veri doğrulama (dropdown), örnek satırlar. Backend şablon üretici + yerel yedek birlikte güncellenir. *(Faz 0.2'den sonra hemen yapılabilir; S–M.)*

### Karar gerekenler

- **D1** Poz Kodu tabloda elle eklenen satırlarda da düzenlenebilir mi? (Öneri: evet; içe aktarmadan gelen salt-okunur değil.)
- **D2** E08: poz kodu yalnızca pozlarda mı zorunlu, başlıklarda da mı? (Öneri: yalnızca pozlarda.)
- **D3** E08/E09 yayın kapısını kapatsın mı? (Öneri: evet, hata.)
- **D4** Tabloda serbest metin birim: reddet mi, işaretle mi? (Öneri: işaretle — veri kaybı yok.)
- **D5** Toplam Tutar kesinlikle salt-okunur; Birim Fiyat: maliyet kırılımı boşsa elle girilebilir kalsın mı? (Öneri: evet, bugünkü davranış.)
- **D6** Katsayı / formül girişi: yapısal seçim (tür + konum) mi, serbest formül mü? Serbest formülde **A1 adresi yerine `[Malzeme]*[Fittings]`** gibi sütun adı kullanılmalı — sütun eklenince harfler kayar. (Öneri: V1 yapısal, serbest formül sonra.)
- **D7** Poz kodu paket içinde mi, proje içinde mi benzersiz? Toplantı: paket içinde (öneri: paket).
- **D8** "Bölümleri kapat/aç" yeni adı? (Öneri: "Tümünü daralt / Tümünü genişlet"; kayıttan kesin ifade anlaşılmadı.)

### Risk / bağımlılıklar

- ui-kit `Spreadsheet` dizini hâlâ işlenmemiş (kullanıcının untracked çalışması): Faz 0.4 / 3.2 / 3.3 değişiklikleri bu dizine yazar; commit'i ayrı verilmeli.
- Faz 0.1 olmadan Faz 0.2 ve Faz 3 güvenle yapılamaz (formül kayması).
- Kaydedilmiş paketlerde yeni alanlar opsiyonel tutulur; Poz Kodu sütun yeri değişimi veri göçü gerektirmez.
