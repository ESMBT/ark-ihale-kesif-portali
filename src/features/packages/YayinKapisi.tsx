import { Button } from '../../components/ui/Button'
import type { YayinKapisi } from '../../lib/yayinKapisi'

/** Sayfa başlığındaki "Yayınla" düğmesi; kapı kapalıysa pasif ve nedenini yanında gösterir */
export function YayinlaDugmesi({
  kapi,
  onYayinla,
  onKesifeGit,
  onTekrar,
}: {
  kapi: YayinKapisi
  onYayinla: () => void
  onKesifeGit: () => void
  onTekrar: () => void
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {kapi.durum === 'hata' && (
        <button
          type="button"
          onClick={onKesifeGit}
          className="rounded-full border border-danger/30 bg-danger-soft px-3 py-1.5 text-[13px] font-medium text-danger transition-colors hover:brightness-95"
          title="Keşif sekmesine git ve hataları düzelt"
        >
          {kapi.hataSayisi} keşif hatası · Düzelt
        </button>
      )}
      {kapi.durum === 'kontrol' && (
        <span className="text-[12px] text-muted-foreground" role="status">
          Keşif doğrulanıyor…
        </span>
      )}
      {kapi.durum === 'servis' && (
        <>
          <span className="text-[12px] text-muted-foreground" role="status" title={kapi.mesaj}>
            Keşif doğrulanamadı
          </span>
          <Button variant="secondary" size="sm" onClick={onTekrar}>
            Tekrar Dene
          </Button>
        </>
      )}
      <Button
        variant="brand"
        icon="send"
        disabled={!kapi.izinli}
        title={kapi.izinli ? undefined : `${kapi.mesaj} Keşif değişiklikleri kaydedildiğinde yeniden kontrol edilir.`}
        onClick={onYayinla}
      >
        Yayınla
      </Button>
    </div>
  )
}
