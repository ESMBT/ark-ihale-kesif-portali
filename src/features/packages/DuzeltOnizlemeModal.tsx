import { useMemo, useState } from 'react'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Modal } from '../../components/ui/Modal'
import type { KesifSatiri } from '../../data/types'
import {
  ALAN_ETIKETI,
  KESIF_ASAMASINDA_YOKSAYILAN_KODLAR,
  sonucuSuz,
  type DuzeltmeYaniti,
} from '../../lib/kesifDogrulama'

/**
 * Otomatik düzeltme önizlemesi (F4): backend'in önerdiği değişiklikleri (eski → yeni)
 * gösterir; kullanıcı onaylamadan tabloya hiçbir şey yazılmaz.
 */
export function DuzeltOnizlemeModal({
  baslik,
  aciklama,
  yanit,
  satirlar,
  birimler = [],
  onUygula,
  onVazgec,
}: {
  baslik: string
  aciklama?: string
  yanit: DuzeltmeYaniti
  satirlar: KesifSatiri[]
  /** Tanımlı birimler: "Yeni" birim değeri bu listeden seçilebilir */
  birimler?: string[]
  /** Kullanıcının düzenlediği değerler uygulanmış yanıtla çağrılır */
  onUygula: (yanit: DuzeltmeYaniti) => void
  onVazgec: () => void
}) {
  // "Yeni" değerler düzenlenebilir: anahtar `${satır}|${alan}` → kullanıcının yazdığı değer
  const [duzenlenen, setDuzenlenen] = useState<Record<string, string>>({})
  const anahtar = (rowId: string, alan?: string | null) => `${rowId}|${alan ?? ''}`

  const duzenliYanit = (): DuzeltmeYaniti => {
    const changes = yanit.changes.map((c) => {
      const v = c.kind === 'update' && c.field ? duzenlenen[anahtar(c.rowId, c.field)] : undefined
      return v === undefined ? c : { ...c, to: v }
    })
    const rows = yanit.rows.map((r) => {
      let yeni = r
      for (const c of changes) {
        if (c.kind !== 'update' || c.rowId !== r.id || !c.field || duzenlenen[anahtar(c.rowId, c.field)] === undefined) continue
        const v = duzenlenen[anahtar(c.rowId, c.field)].trim()
        yeni = { ...yeni, [c.field]: c.field === 'level' ? (v ? Number(v) : undefined) : v || undefined }
      }
      return yeni
    })
    return { ...yanit, rows, changes }
  }

  const etiketler = useMemo(() => {
    const harita = new Map<string, string>()
    for (const s of satirlar) harita.set(s.id, (s.pozTanimi?.trim() || s.pozNo?.trim() || '—').slice(0, 42))
    return harita
  }, [satirlar])

  const sonra = useMemo(
    () => sonucuSuz(yanit.validation, KESIF_ASAMASINDA_YOKSAYILAN_KODLAR),
    [yanit.validation],
  )

  const guncellenen = yanit.changes.filter((c) => c.kind === 'update').length
  const eklenen = yanit.changes.filter((c) => c.kind === 'add').length
  const bos = yanit.changes.length === 0

  return (
    <Modal
      open
      onClose={onVazgec}
      size="lg"
      title={baslik}
      description={aciklama}
      footer={
        <>
          <Button variant="ghost" onClick={onVazgec}>
            Vazgeç
          </Button>
          <Button variant="brand" icon="check" disabled={bos} onClick={() => onUygula(duzenliYanit())}>
            {bos ? 'Değişecek bir şey yok' : `Uygula (${yanit.changes.length} değişiklik)`}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-2 text-[13px]">
          {guncellenen > 0 && <Badge tone="info">{guncellenen} alan güncellenecek</Badge>}
          {eklenen > 0 && <Badge tone="success">{eklenen} yeni satır eklenecek</Badge>}
          <span className="ml-auto text-muted-foreground">
            Düzeltme sonrası:{' '}
            <strong className={sonra.errorCount > 0 ? 'text-danger' : 'text-success'}>
              {sonra.errorCount > 0 ? `${sonra.errorCount} hata` : 'hata yok'}
            </strong>
            {sonra.warningCount > 0 && ` · ${sonra.warningCount} uyarı`}
          </span>
        </div>

        {bos ? (
          <p className="rounded-xl border border-line bg-surface-soft px-4 py-6 text-center text-[13px] text-muted-foreground">
            Bu düzeltme tabloda değiştirilecek bir şey bulamadı.
          </p>
        ) : (
          <div className="max-h-[48vh] overflow-auto rounded-xl border border-border">
            <table className="w-full border-collapse text-[13px]">
              <thead className="sticky top-0">
                <tr className="border-b border-line bg-surface-muted">
                  {['Satır', 'Değişiklik', 'Eski', 'Yeni'].map((h) => (
                    <th
                      key={h}
                      className="px-3 py-2 text-left text-[11px] font-bold tracking-wide text-muted-foreground uppercase"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {yanit.changes.map((c, i) => (
                  <tr key={`${c.rowId}-${c.field}-${i}`} className="border-b border-border last:border-0">
                    <td className="px-3 py-1.5 font-mono text-[12px] whitespace-nowrap">
                      {c.kind === 'add' ? '—' : (etiketler.get(c.rowId) ?? c.rowId)}
                    </td>
                    <td className="px-3 py-1.5">
                      {c.kind === 'add' ? (
                        <Badge tone="success" size="sm">
                          Yeni başlık satırı
                        </Badge>
                      ) : (
                        (ALAN_ETIKETI[c.field ?? ''] ?? c.field)
                      )}
                    </td>
                    <td className="px-3 py-1.5 font-mono text-[12px] text-muted-foreground line-through decoration-danger/50">
                      {c.kind === 'add' ? '' : (c.from ?? '(boş)')}
                    </td>
                    <td className="px-3 py-1.5">
                      {c.kind === 'update' && c.field ? (
                        <input
                          value={duzenlenen[anahtar(c.rowId, c.field)] ?? c.to ?? ''}
                          list={c.field === 'unit' && birimler.length > 0 ? 'duzelt-birimler' : undefined}
                          onChange={(e) =>
                            setDuzenlenen((d) => ({ ...d, [anahtar(c.rowId, c.field)]: e.target.value }))
                          }
                          aria-label={`${ALAN_ETIKETI[c.field] ?? c.field} yeni değeri`}
                          className="h-8 w-full min-w-[120px] rounded-md border border-line bg-white px-2 font-mono text-[12px] font-bold text-black outline-none focus:border-black focus:ring-2 focus:ring-black/10"
                        />
                      ) : (
                        <span className="font-mono text-[12px] font-bold text-black">{c.to ?? ''}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {birimler.length > 0 && (
          <datalist id="duzelt-birimler">
            {birimler.map((b) => (
              <option key={b} value={b} />
            ))}
          </datalist>
        )}

        <p className="text-[12px] leading-5 text-muted-foreground">
          “Yeni” değerleri uygulamadan önce düzenleyebilirsiniz (birim için listeden seçin). Onayladıktan sonra değişiklikler tabloya uygulanır ve tablo yeniden doğrulanır. Kaydet’e basana kadar
          kaydedilmez; uygulama sonrası “Geri al” ile döndürebilirsiniz.
        </p>
      </div>
    </Modal>
  )
}
