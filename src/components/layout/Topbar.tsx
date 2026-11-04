import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useStore } from '../../data/store'
import { sirketler } from '../../data/mock'
import { Icon } from '../ui/Icon'

export function Topbar({ onMenu }: { onMenu: () => void }) {
  const [showNotifications, setShowNotifications] = useState(false)
  const [showUser, setShowUser] = useState(false)
  const { bildirimler, projeler } = useStore()
  const location = useLocation()
  const navigate = useNavigate()
  const unread = bildirimler.filter((n) => !n.okundu).length

  /* Proje ekranındayken proje seçici, diğer ekranlarda şirket seçici */
  const projeId = location.pathname.match(/^\/projeler\/([^/]+)/)?.[1]
  const projeModu = !!projeId && location.pathname !== '/projeler/talep'
  const aktifProje = projeModu ? projeler.find((p) => p.id === projeId) : undefined

  return (
    <header className="sticky top-0 z-30 flex h-[var(--ark-topbar-height)] items-center gap-3 border-b border-line bg-white px-4 lg:px-6">
      <button
        onClick={onMenu}
        className="rounded-md p-2 text-ink hover:bg-surface-muted lg:hidden"
        aria-label="Menü"
      >
        <Icon name="menu" size={20} />
      </button>

      <div className="min-w-0">
        <p className="truncate font-heading text-[16px] leading-5 font-bold text-black">İhale &amp; Keşif Portalı</p>
        <p className="truncate text-[12px] leading-4 text-muted-foreground">Ark İnşaat A.Ş. · Şantiye &amp; İhale Ekibi</p>
      </div>

      <div className="ml-auto flex items-center gap-1">
        {/* Proje ekranında proje seçici, diğer ekranlarda şirket seçici */}
        {projeModu ? (
          <label className="relative mr-2 hidden lg:block">
            <span className="inline-flex h-10 min-w-[220px] cursor-pointer items-center justify-between gap-3 rounded-lg border border-line bg-white px-3 text-[13px] font-medium text-ink">
              <span className="truncate">{aktifProje?.ad ?? 'Proje seçin'}</span>
              <Icon name="chevron-down" size={14} className="text-gray" />
            </span>
            <select
              value={projeId ?? ''}
              onChange={(e) => navigate(`/projeler/${e.target.value}`)}
              className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
              aria-label="Proje seçici"
            >
              {projeler.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.ad}
                </option>
              ))}
            </select>
          </label>
        ) : (
          <label className="relative mr-2 hidden lg:block">
            <span className="inline-flex h-10 min-w-[200px] cursor-pointer items-center justify-between gap-3 rounded-lg border border-line bg-white px-3 text-[13px] font-medium text-ink">
              <span className="truncate">Ark İnşaat</span>
              <Icon name="chevron-down" size={14} className="text-gray" />
            </span>
            <select className="absolute inset-0 h-full w-full cursor-pointer opacity-0" aria-label="Şirket seçici">
              {sirketler.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.ad}
                </option>
              ))}
            </select>
          </label>
        )}

        <button
          className="rounded-md p-2 text-ink transition-colors hover:bg-surface-muted"
          aria-label="Yardım"
        >
          <Icon name="help" size={19} />
        </button>

        <div className="relative">
          <button
            onClick={() => {
              setShowNotifications((v) => !v)
              setShowUser(false)
            }}
            className="relative rounded-md p-2 text-ink transition-colors hover:bg-surface-muted"
            aria-label="Bildirimler"
          >
            <Icon name="bell" size={19} />
            {unread > 0 && (
              <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-danger-strong px-1 text-[10px] font-bold text-white">
                {unread}
              </span>
            )}
          </button>
          {showNotifications && (
            <div className="absolute right-0 top-12 z-40 w-80 overflow-hidden rounded-xl border border-line bg-white shadow-lg">
              <div className="flex items-center justify-between border-b border-line px-4 py-3">
                <span className="text-[14px] font-bold text-black">Bildirimler</span>
                <Link to="/bildirimler" className="text-[12px] text-black underline underline-offset-4">
                  Tümü
                </Link>
              </div>
              <ul className="max-h-80 overflow-y-auto">
                {bildirimler.slice(0, 4).map((n) => (
                  <li key={n.id} className="border-b border-line last:border-0">
                    <Link
                      to="/bildirimler"
                      onClick={() => setShowNotifications(false)}
                      className="block px-4 py-3 hover:bg-surface-muted"
                    >
                      <span className="block text-[12px] font-bold text-gray">
                        {n.bildirimNo} · {n.fonksiyon}
                      </span>
                      <span className="mt-0.5 block text-[14px] font-bold text-black">{n.baslik}</span>
                      <span className="mt-0.5 block text-[12px] leading-4 text-muted-foreground">{n.zaman}</span>
                    </Link>
                  </li>
                ))}
              </ul>
              <Link
                to="/bildirimler"
                onClick={() => setShowNotifications(false)}
                className="block border-t border-line px-4 py-3 text-center text-[12px] font-bold text-black hover:bg-surface-muted"
              >
                Tüm bildirimleri görüntüle
              </Link>
            </div>
          )}
        </div>

        <div className="relative ml-1 border-l border-line pl-3">
          <button
            onClick={() => {
              setShowUser((v) => !v)
              setShowNotifications(false)
            }}
            className="flex items-center gap-2.5 rounded-md py-1 pl-1 pr-2 transition-colors hover:bg-surface-muted"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-black text-[12px] font-bold text-white">
              HÖ
            </span>
            <span className="hidden text-left leading-tight lg:block">
              <span className="block text-[14px] font-bold text-black">Hakan Öztürk</span>
              <span className="block text-[12px] text-muted-foreground">Şantiye Şefi</span>
            </span>
            <Icon name="chevron-down" size={14} className="hidden text-gray lg:block" />
          </button>
          {showUser && (
            <div className="absolute right-0 top-12 z-40 w-56 overflow-hidden rounded-xl border border-line bg-white py-1 shadow-lg">
              <div className="border-b border-line px-4 py-3">
                <p className="text-[14px] font-bold text-black">Hakan Öztürk</p>
                <p className="text-[12px] text-muted-foreground">hakan.ozturk@arkinsaat.com.tr</p>
              </div>
              <Link
                to="/profilim"
                onClick={() => setShowUser(false)}
                className="flex items-center gap-2.5 px-4 py-2.5 text-[14px] text-black hover:bg-surface-muted"
              >
                <Icon name="user" size={16} className="text-gray" />
                Profilim
              </Link>
              <Link
                to="/kullanim"
                onClick={() => setShowUser(false)}
                className="flex items-center gap-2.5 px-4 py-2.5 text-[14px] text-black hover:bg-surface-muted"
              >
                <Icon name="users" size={16} className="text-gray" />
                Kullanıcı yönetimi
              </Link>
              <span className="flex cursor-not-allowed items-center gap-2.5 px-4 py-2.5 text-[14px] text-gray">
                <Icon name="settings" size={16} />
                Hesap ayarları
              </span>
              <Link
                to="/projeler"
                className="flex items-center gap-2.5 border-t border-line px-4 py-2.5 text-[14px] text-danger-d hover:bg-surface-muted"
              >
                <Icon name="log-out" size={16} />
                Çıkış Yap
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
