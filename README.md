# ARK İhale & Keşif Portalı — Ekran Tasarımı Prototipi

Proje keşfi ve **ihale paketi** hazırlık sürecinin ekran tasarımı (React + Vite + TypeScript + Tailwind v4).

Tasarım iki kaynağa dayanır:

| Kaynak | Kullanılan kısım |
|---|---|
| **ARK Figma Design System** (kmsebzYktpGg2phjeHeTno) | Renk paleti, tipografi, buton/rozet/tab/form kuralları, kart ve giriş düzeni |
| **Conwize ekran görüntüleri** (`Screenshot 2026-10-29 at 3.51–3.53`) | Bilgi mimarisi ve ekran yerleşimi: kart listesi, alt satır sekmeler, **pill sekmeler**, iki paneli belge ekranı, spreadsheet keşif tablosu |
| **ana-veri_23.10.2026.xlsx** | Alan sözlüğü: `2. Proje Kartı Alanları`, `2b. İhale Dosyası Alanları`, `3a. Proje Rolleri`, `Detaylı Süreç Akış` |

---

## Çalıştırma

```bash
npm install
npm run dev        # http://localhost:5174
npm run build      # tsc -b && vite build
npm run preview
```

> **Not:** Klasör adı `:` içerdiği için (macOS "Ark_İhale:Kesif") npm scriptleri `node` ile çağrılır ve
> `vite.config.ts` içinde `server.fs.strict = false` ayarlanır. Vite, yol içinde `:` gördüğünde dosya servisini
> reddettiği için bu ayar gereklidir. Klasör `:` içermeyen bir adla taşınırsa ikisi de kaldırılabilir.

---

## Yayınlama / Paylaşma (başka bilgisayarda çalıştırma)

Uygulama statiktir; `npm run build` sonrası oluşan `dist/` klasörü herhangi bir statik barındırmada çalışır.

| Senaryo | Ne yapılır | Link |
|---|---|---|
| **En hızlı (1 dk)** | `npm run build` → [Netlify Drop](https://app.netlify.com/drop) → `dist/` sürükle | `https://xxx.netlify.app` |
| **Hazır paket** | `ark-ihale-kesif-dist.zip` (262 KB) dosyasını doğrudan Netlify Drop'a sürükle | `https://xxx.netlify.app` |
| **Anlık link (kurulum yok)** | `npm run dev` + `cloudflared tunnel --url http://localhost:5174` | `https://xxx.trycloudflare.com` |
| **Aynı Wi-Fi** | `npm run dev -- --host` | `http://192.168.x.x:5174` |
| **Kurumsal** | Kendi sunucu + Nginx (`try_files $uri /index.html`) + SSL | kendi domaininiz |

Detaylı anlatım, nginx/CI örnekleri ve **backend ihtiyaçları** (SAP erişimi, mail gönderimi, kalıcı veri)
için: [`docs/DAYITIM.md`](docs/DAYITIM.md).

> Şu an tüm veriler tarayıcı belleğinde (mock). Gerçek kullanım için backend gerekir; ekip ile paylaşılan
> “demo link” için yukarıdaki statik yayın yeterlidir.

### Keşif backend'i (Ark.Api) — Excel içe/dışa aktarma ve doğrulama

Keşif sihirbazı, doğrulama ve dışa aktarma `ark-insaat-projeler/services/api` içindeki `/api/excel/survey/*`
uçlarını kullanır. Bu uçlar **durumsuzdur** (Postgres/Redis/Kafka gerektirmez). Arayüz API adresini şu sırayla seçer:

1. Tarayıcıda kayıtlı adres — adres çubuğuna `?api=https://…` ekleyerek bir kez verilir
2. Derleme zamanı `VITE_API_URL` (Netlify → Site settings → Environment variables)
3. Boş → göreli `/api/...` (yerelde Vite proxy `localhost:5080`; Netlify'da `netlify.toml` rewrite'ı ile)

**Yayındaki arayüzü kendi bilgisayarınızdaki backend'e bağlama**

```bash
# 1) Backend'i açın (yalnızca Excel uçları için DB/Redis/Kafka gerekmez)
cd ark-insaat-projeler/services/api
Cors__Origins__0=https://<site>.netlify.app dotnet run --urls http://localhost:5080

# 2) HTTPS tüneli açın (Safari/Chrome karışık içerik ve yerel ağ kısıtları için en güvenlisi)
cloudflared tunnel --url http://localhost:5080        # → https://abc.trycloudflare.com

# 3) Yayındaki siteyi bir kez bu adresle açın (kaydedilir, adres çubuğundan silinir)
#    https://<site>.netlify.app/?api=https://abc.trycloudflare.com
#    Kaydı silmek için: ?api=
```

> `Cors__Origins__0` değeri tarayıcıdaki sitenin origin'i olmalıdır (şema + alan adı, sonda `/` yok).
> Tünel adresi her açılışta değişir; yeni adresle `?api=` tekrar verilir.

**Backend'i kalıcı yayınlama (Docker)**

```bash
cd ark-insaat-projeler
docker build -f services/api/Dockerfile -t ark-api:local .   # bağlam = çalışma alanı kökü
docker run -p 8080:8080 \
  -e Cors__Origins__0=https://<site>.netlify.app \
  -e ConnectionStrings__Default="Host=…;Database=…;Username=…;Password=…" \
  -e Jwt__SigningKey="<en az 32 karakterlik gizli anahtar>" \
  ark-api:local
```

Sonra Netlify'da `VITE_API_URL=https://<api-alan-adı>` ortam değişkenini tanımlayıp siteyi yeniden derleyin
(ya da `netlify.toml`'a `/api/*` → backend rewrite'ı ekleyin; bu durumda CORS gerekmez).

---

## Ekran haritası

| Rota | Ekran | Karşılığı |
|---|---|---|
| `/` | → `/moduller` yönlendirmesi | |
| `/moduller` | **Modül seçim ekranı** — kenar çubuğundaki “Ark İnşaat” markasına tıklanınca açılır; **İhale Yönetimi** ve **Şantiyeci Yönetimi** modülleri girilebilir (Alt Yüklenici / Hakediş yapım aşamasında) | Modüler portal |
| **İHALE YÖNETİMİ MODÜLÜ** | | |
| `/modul/ihale/projeler` | **Tüm Projeler** — isim araması + tablo; **Proje Kodu Talebi** bu modülde görünmez | ARK Alt Yüklenici · Aktif İhaleler |
| `/modul/ihale/projeler/:id` | **Proje ekranı** — İhale Paketleri · Keşif · Dokümanlar · Dashboard · Proje Bilgileri | Conwize “Marina” |
| `/modul/ihale/projeler/:id/paket/:paketId` | **İhale paketi detayı** — 8 pill sekme (Genel Bakış · Belgeler · Keşif · Alt Yüklenici Yönetimi · Mukayeseli Karşılaştırma · İhale Yönetimi · Dashboard · Soru/Cevap) | Conwize “bid detail” |
| **ŞANTİYECİ YÖNETİMİ MODÜLÜ** | | |
| `/modul/santiyeci/projeler` | **Projelerim** — yalnızca şantiyecinin projeleri; **Proje Kodu Talebi** butonu ve **Arşivlenenler** bölümü | Şantiyeci portalı |
| `/modul/santiyeci/projeler/talep` | **Proje Kodu Talebi** — 4 blok form + mail/bildirim önizlemesi | Excel “proje kodu talep” |
| `/modul/santiyeci/projeler/:id` | **Proje ekranı (şantiyeci)** — İhale Paketleri (yalnızca kendi paketleri) · Keşif · Dokümanlar · Dashboard · Proje Bilgileri; **Projeyi Düzenle / Arşivle** | Şantiyeci portalı |
| `/modul/santiyeci/projeler/:id/paket/:paketId` | **İhale paketi detayı (şantiyeci)** — 4 pill sekme: **İhale Özeti · Belgeler · Keşif · Alt Yüklenici Firma Öneri** | Şantiyeci portalı |
| `/modul/*/kesif` | **Keşif** — içerik şimdilik boş (Sözleşmeye Dönüşmüş Keşifler alt başlığı kaldırıldı) | |
| `/bildirimler` | Bildirim listesi (bildirim no + fonksiyon adı) + bildirim kataloğu | Bildirim kataloğu |
| `/profilim` | Profilim — kişisel ve görev bilgileri | Kullanıcı profili |
| `/kesif/sozlesmeler` | **Sözleşmeye Dönüşmüş Keşifler** — sözleşmeye bağlanmış metraj kayıtları (herkese açık) | Erişim kuralları |
| `/kullanim` | **Kullanıcı ve Ekip Yönetimi** — Kullanıcılar · Ekipler · Yetkiler · Roller · Rol–Yetki Eşleştirme (ekle/düzenle/sil) | Detaylı süreç analizi |

### Üç seviyeli bilgi mimarisi

```
Projeler listesi (tablo) ── satır/Aç ─▶ Proje ekranı (5 sekme)
                                        └── İhale Paketi  (birim fiyatlı / götürü iş paketi)
              ├── Genel Bakış
              ├── Keşif (metraj — Excel içe/dışa aktarım)
              ├── Belgeler (BFT · İmalat Şartnamesi · İşveren Şartnamesi)
              └── Alt Yüklenici Davet (firma seçimi + belge talebi)
```

---

## Kaynak kod düzeni

```
src/
├── components/
│   ├── layout/      AppShell (sol ikon rayı + üst bar) · Sidebar (ray + genişleyen menü) · Topbar
│   └── ui/          Button · Badge · Card · Field · Icon · Table · Tabs · TabNav
│                    PillTabs · FilterBar · EntityCard · DropZone/SplitPane · Shell (StatusPill/Avatar/IconButton)
├── data/
│   ├── kullanim.ts kullanıcı · ekip · yetki · rol · rol-yetki eşleştirme kayıtları
│   ├── sozlesmeTurleri.ts sözleşme türleri ve türe göre ihale dosyası alan setleri
│   ├── sozlesmeBelgeleri.ts 34 standart ek (ihale + sözleşme belgeleri)
│   ├── types.ts     alan sözlüğü tipleri (KaynakTipi, ProjeKartiAlani, IhalePaketi, KesifSatiri …)
│   ├── mock.ts      Excel’den türetilmiş proje kartı + ihale dosyası alan sözlüğü, proje/paket mock’ları
│   └── store.tsx    React context store (talep → proje kodu → paket → keşif → onay akışı)
├── features/
│   ├── modules/      ModulePickerPage (modül listesi ekranı)
│   ├── admin/       UserManagementPage (kullanıcı/ekip/yetki/rol) · ProfilePage
│   ├── projects/    ProjectListPage · ProjectDetailPage · ProjectCodeRequestPage · ProjectCardTab · TenderFileTab
│   ├── packages/    PackageDetailPage · TakeoffTable · PackageDocumentsTab · InviteCompaniesTab
│   └── notifications/ NotificationsPage
├── lib/
│   ├── modules.ts   modül listesi (ad · ikon · açıklama · bölümler)
│   ├── proje.ts     zorunluluk/koşul mantığı, doluluk oranları, SAP→kart ön dolgu
│   └── kesif.ts     Excel Keşif şablonu üretimi, içe aktarma doğrulama, dışa aktarma
└── styles/          tokens.css (Figma paleti) · index.css (Tailwind tema)
```

---

## Veri akışı (demo)

1. `/projeler/talep` → SAP proje kodu seçilir, zorunlu alanlar doldurulur → **PROJE KODU TALEP ET**
   → mail + portal bildirimi (`9001`) üretilir, proje listeye “Talep Edildi” olarak düşer.
2. Proje detayında ikinci aşama kilitlidir; **SAP Proje Kodu Oluştur (demo)** → `9002` bildirimi + proje açılır.
3. Proje altında **İhale Paketi** oluşturulur (ad + çalışma tipi).
4. Paket içinde **Keşif** sekmesinde Excel Keşif şablonu indirilir / içe aktarılır (poz tanımı, birim, miktar ve
   teklif kırılımı zorunlu; fiyat alanları kilitlidir).
5. **Alt Yüklenici Davet** sekmesinden firma seçilir → davet + belge talebi üretilir.
6. İhale ekibi paketi **Onaylar** (`9004`) veya **Revize ister** (`9005`).

---

## Tasarım kuralları (özet)

- **Sol kenar çubuğu** ARK Alt Yüklenici Portalı ile aynı: siyah zemin, logo + “Ark İnşaat”, arama kutusu,
  gruplanmış menü (açılır alt menüler) ve sağ üstte **daraltma** düğmesi. Daraltıldığında yalnızca ikon rayı kalır
  (72 px) ve genişlik `localStorage`’da saklanır (`ark.sidebar.collapsed`).
- Üst çubuk yalnızca portal adı, proje seçici, yardım, bildirim ve kullanıcı menüsünden oluşur.
- **Durum renkleri:** turuncu = aşama / manuel doldurulacak, mavi = süreçte, yeşil = onaylı / SAP’ten otomatik,
  gri = taslak / kilitli, kırmızı = revize.
- **Alan kaynakları** rozetle gösterilir: `SAP (otomatik)` · `Manuel doldurulacak` · `Seçilecek` · `Listeden seçilir`.
- Zorunlu alanlar dolmadan ilgili buton pasif kalır; proje kodu oluşmadan ikinci aşama ekranları kilitlidir.
- Düzenleme kaydedildiğinde mail + portal bildirimi tetiklenir (bildirim no ile birlikte).
- İlerleme yüzdeleri ve “İşveren Sözleşme Tutarı (KDV Hariç)” alanı ekranlarda gösterilmez.
