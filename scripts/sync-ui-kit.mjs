// @ark/ui-kit kaynağını kardeş repodan (ark-insaat-projeler) vendor/ui-kit altına kopyalar.
// Portal tek başına klonlandığında (Vercel/Netlify) kardeş repo bulunmadığı için kaynak burada tutulur.
// Kullanım: node scripts/sync-ui-kit.mjs [ui-kit-yolu]
import { execFileSync } from 'node:child_process'
import { existsSync, mkdirSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const kok = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const kaynak = resolve(
  kok,
  process.argv[2] ?? '../ark-insaat-projeler/libs/frontend/ui-kit',
  'src',
)
const hedef = resolve(kok, 'vendor/ui-kit')

if (!existsSync(kaynak)) {
  console.error(`ui-kit kaynağı bulunamadı: ${kaynak}`)
  process.exit(1)
}

mkdirSync(hedef, { recursive: true })
execFileSync(
  'rsync',
  [
    '-a', '--delete',
    '--exclude=*.test.*', '--exclude=*.stories.*',
    '--exclude=stories', '--exclude=test', '--exclude=.DS_Store',
    kaynak, `${hedef}/`,
  ],
  { stdio: 'inherit' },
)
console.log(`ui-kit senkronlandı → ${hedef}`)
