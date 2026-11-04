# Uygulamayı Paylaşma ve Yayınlama Rehberi

Uygulama **tek bir statik klasörden (dist/) çalışan bir React uygulamasıdır**. Backend yoktur; tüm veriler
tarayıcı belleğinde tutulur. Aşağıdaki senaryolar “başka birinin bilgisayarında çalışsın / link verince girsin”
ihtiyacını farklı bütçe ve sürelerle karşılar.

---

## 0. Ön bilgi: derleme

```bash
npm install     # ilk seferinde
npm run build   # → dist/ klasörü (tek klasörü her yere kopyalamak yeterli)
npm run preview # → dist/ klasörünü yerelde dener (http://localhost:4173)
```

`dist/` klasörü içinde `index.html` + `assets/` bulunur. Statik barındırma (nginx, Apache, Netlify, GitHub Pages,
VS Code Live Server, Python `http.server`) bunu olduğu gibi sunar.

> **Not:** Klasör adı `:` içerdiği için `npm run` scriptleri `node` ile çağrılır ve `vite.config.ts` içinde
> `server.fs.strict = false` ayarlıdır. Klasörü `:` içermeyen bir adla taşırsanız bu iki ayarı kaldırabilirsiniz.

---

## 1. En hızlı yol: Netlify Drop (ücretsiz, 1 dakika, HTTPS link)

1. `npm run build` çalıştırın.
2. https://app.netlify.com/drop adresini açın.
3. `dist/` klasörünü (veya hazır paket `ark-ihale-kesif-dist.zip`) tarayıcıya sürükleyin.
4. Anında bir link verilir: `https://xyz-abc-123.netlify.app`

Aynı işlem **Vercel** (`npx vercel` → `dist` seç) ve **Cloudflare Pages** (dashboard → “Upload assets”) için de
geçerlidir.

**Derin bağlantı (SPA) kuralı:** `dist/` içinde hazır gelen `_redirects` dosyası (`/*  /index.html  200`) tüm derin
bağlantıları `index.html`’e yönlendirir; Netlify bunu otomatik uygular. Yedek olarak repo kökünde `netlify.toml`
da var (Build → `npm run build`, Publish → `dist`). Kendi sunucunuzda
nginx kullanıyorsanız:

```nginx
location / {
  try_files $uri $uri/ /index.html;
}
```

GitHub Pages kullanacaksanız repo ayarında “Deploy from a branch → /docs” seçin ve `dist/` içeriğini `docs/`
klasörüne kopyalayın.

---

## 2. Link vermeden, anlık paylaşım: Tunnel (Cloudflare Tunnel / ngrok)

Hiçbir şey yüklemeden, kendi bilgisayarınızdan geçici bir HTTPS link üretirsiniz:

```bash
# 1) uygulamayı çalıştır
npm run dev

# 2) başka bir terminalde
cloudflared tunnel --url http://localhost:5174
#   veya
npx localtunnel --port 5174
```

Çıkan `https://xxx.trycloudflare.com` linkini paylaşabilirsiniz. **Kendi bilgisayarınız açık kaldığı sürece link çalışır.**
Kurulum: `brew install cloudflared` (macOS) / `winget install cloudflared` (Windows).

---

## 3. Aynı Wi-Fi / ofis ağı içinde (kurulum gerektirmez)

```bash
npm run dev -- --host
```

Kendi IP adresinizi bulun (`ipconfig getifaddr en0` macOS / `ipconfig` Windows) ve
`http://192.168.x.x:5174` adresini paylaşın. Karşı tarafın aynı ağda olması ve Windows Firewall’ün
Node.js’e izin vermesi gerekir.

---

## 4. Kendi sunucunuz / şirket sunucusu (kurumsal)

- Bir Linux VPS (Hetzner / Contabo / AWS) alın, Nginx + Node kurun.
- `git clone` → `npm ci && npm run build` → `dist/` klasörünü `/var/www/ark-ihale` altına kopyalayın.
- Nginx’te `try_files $uri /index.html;` ile SPA yönlendirmesini tanımlayın.
- Let’s Encrypt ile SSL: `certbot --nginx -d ihale.arkinsaat.com.tr`
- CI/CD: GitHub Actions + SSH deploy (aşağıda örnek).

```yaml
# .github/workflows/deploy.yml
name: deploy
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 22 }
      - run: npm ci && npm run build
      - name: Sunucuya kopyala
        run: |
          scp -r dist/* user@sunucu:/var/www/ark-ihale/
          ssh user@sunucu 'sudo systemctl reload nginx'
```

---

## 5. USB / klasör kopyası ile çalıştırma

`dist/` klasörünü USB’ye atıp karşı tarafta bir statik sunucu açması gerekir (dosyaya çift tıklamak `file://`
üzerinden açılır ve tarayıcı `file://` protokolünde derin bağlantıları desteklemez → sayfa yenilenince 404 alırsınız).

**Bunu kolaylaştırmak için** `src/main.tsx` içinde `BrowserRouter` yerine `HashRouter` kullanılabilir:

```tsx
import { HashRouter } from 'react-router-dom'   // <-- BrowserRouter satırını değiştirin
```

HashRouter ile adresler `index.html#/projeler/...` olur ve `file://` üzerinden de çalışır (ek bir sunucuya gerek
kalmaz). Bunu isterseniz tek satırda yaparım.

Alternatif: USB içinde Python ile statik sunucu:

```bash
cd dist && python3 -m http.server 8080
# tarayıcıda http://localhost:8080
```

---

## 6. Gerçek kullanım için gerekenler (backend)

Uygulama şu an **demo/mock** verilerle çalışıyor. Gerçek operasyonda aşağıdakiler backend olmadan yapılamaz:

| İhtiyaç | Neden backend gerekir |
|---|---|
| SAP proje listesi / proje kodu (PSPID) | SAP kimlik bilgileri tarayıcıda tutulmaz; sunucu üzerinden OData/RFC çağrısı gerekir |
| Mail gönderimi (9001 — Proje Kodu Talep) | Mail sunucu/transactional mail API üzerinden gönderilir (SMTP, SendGrid, SES) |
| Bildirimlerin kalıcı olması | Şu an state bellekte; sunucuda DB (Postgres/Supabase) gerekir |
| Ortak veri | Kullanıcılar aynı projeyi/ihale paketini görmeli → merkezî veri |
| Yetkilendirme | Portal kullanıcı girişi, rol bazlı (Direktör / Şantiye Şefi / İhale Ekibi) yetkiler |

Pratik öneri: **Supabase** (Postgres + Auth + Storage + RLS) veya **Firebase** hızlıca eklenir; SAP erişimi için
küçük bir Node/Express (veya serverless) servis yeterlidir.

---

## 7. Güvenlik notları

- SAP kullanıcı adı/parolası, API anahtarları **sadece sunucu tarafında** tutulmalıdır.
- Mail gönderimi sunucu üzerinden; istemciye SMTP bilgisi verilmez.
- Yayınlanan statik dosyalarda gizli bilgi bulunmamalı (bu prototipte mock veri var, gizli veri yok).
- Kurumsal ağ dışına açılan bir demo için HTTPS zorunlu (Netlify/Vercel/tunnel bunu bedava sağlar).
