import { fileURLToPath, URL } from 'node:url'
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
  resolve: {
    dedupe: ['react', 'react-dom'],
    alias: {
      '@ark/ui-kit/styles.css': fileURLToPath(
        new URL('../ark-insaat-projeler/libs/frontend/ui-kit/src/styles/index.css', import.meta.url),
      ),
      '@ark/ui-kit': fileURLToPath(
        new URL('../ark-insaat-projeler/libs/frontend/ui-kit/src/index.ts', import.meta.url),
      ),
      react: fileURLToPath(new URL('./node_modules/react', import.meta.url)),
      'react-dom': fileURLToPath(new URL('./node_modules/react-dom', import.meta.url)),
      'react/jsx-runtime': fileURLToPath(
        new URL('./node_modules/react/jsx-runtime.js', import.meta.url),
      ),
      'react/jsx-dev-runtime': fileURLToPath(
        new URL('./node_modules/react/jsx-dev-runtime.js', import.meta.url),
      ),
    },
  },
  server: {
    port: 5174,
    proxy: {
      '/api': {
        target: 'http://localhost:5080',
        changeOrigin: true,
      },
    },
    /* Klasör adı ":" içerdiği için Vite'in fs güvenlik kontrolü tüm dosyaları
       reddediyor (path.includes(":") → deny). Geliştirme sunucusu için strict kapalı. */
    fs: {
      strict: false,
      allow: ['.', process.cwd(), '..'],
    },
  },
})
