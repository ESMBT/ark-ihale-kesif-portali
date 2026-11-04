import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  /* Netlify kök alan adı için MUTLAK yol ('/').
     Göreli yol ('./') derin bağlantılarda bozulur: /projeler/... adresinde
     tarayıcı './assets/x.js' dosyasını /projeler/assets/x.js olarak çözer;
     Netlify SPA rewrite'i oraya index.html (text/html) döndürür → beyaz ekran.
     Alt klasör/USB dağıtımı için: VITE_BASE=./ npm run build */
  base: process.env.VITE_BASE ?? '/',
  plugins: [react(), tailwindcss()],
  server: {
    port: 5174,
    /* Klasör adı ":" içerdiği için Vite'in fs güvenlik kontrolü tüm dosyaları
       reddediyor (path.includes(":") → deny). Geliştirme sunucusu için strict kapalı. */
    fs: {
      strict: false,
      allow: ['.', process.cwd(), '..'],
    },
  },
})
