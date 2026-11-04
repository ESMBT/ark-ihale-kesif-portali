import { useEffect, useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { Topbar } from './Topbar'
import { aktifModul } from '../../lib/modul'

const STORAGE_KEY = 'ark.sidebar.collapsed'

export function AppShell() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [collapsed, setCollapsed] = useState(
    () => typeof window !== 'undefined' && localStorage.getItem(STORAGE_KEY) === '1',
  )
  const location = useLocation()

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, collapsed ? '1' : '0')
  }, [collapsed])

  /* Mobilde sayfa değişince çekmece kapansın */
  useEffect(() => {
    setMobileOpen(false)
  }, [location.pathname])

  /* Aktif modül — menü ve kapsam buna göre değişir */
  const modul = aktifModul(location.pathname)

  /* Proje / paket detay ekranları geniş çalışma alanı ister */
  const wide = location.pathname.includes('/projeler/')

  return (
    <div className="min-h-screen bg-bg">
      <Topbar onMenu={() => setMobileOpen(true)} />

      <div className="flex">
        {/* Masaüstü kenar çubuğu */}
        <aside
          className={`sticky top-[var(--ark-topbar-height)] hidden h-[calc(100vh-var(--ark-topbar-height))] shrink-0 border-r border-[#1a1a1a] bg-black transition-[width] duration-200 lg:block ${
            collapsed ? 'w-[72px]' : 'w-[var(--ark-sidebar-width)]'
          }`}
        >
          <Sidebar
            modul={modul}
            collapsed={collapsed}
            onToggle={() => setCollapsed((v) => !v)}
          />
        </aside>

        {/* Mobil kenar çubuğu */}
        {mobileOpen && (
          <div className="fixed inset-0 z-40 lg:hidden">
            <div className="absolute inset-0 bg-slate-900/40" onClick={() => setMobileOpen(false)} aria-hidden />
            <aside className="absolute left-0 top-0 h-full w-[280px] bg-black shadow-xl">
              <div className="flex h-[var(--ark-topbar-height)] items-center justify-between border-b border-[#1a1a1a] px-5">
                <span className="font-heading text-[18px] font-bold text-white">Ark İnşaat</span>
                <button
                  onClick={() => setMobileOpen(false)}
                  className="rounded-md p-1.5 text-white/60 hover:bg-[#1a1a1a] hover:text-white"
                  aria-label="Kapat"
                >
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.7"
                    strokeLinecap="round"
                  >
                    <path d="M18 6 6 18M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="h-[calc(100%-var(--ark-topbar-height))]">
                <Sidebar
                  modul={modul}
                  collapsed={false}
                  onToggle={() => setMobileOpen(false)}
                  onNavigate={() => setMobileOpen(false)}
                />
              </div>
            </aside>
          </div>
        )}

        <main className="min-w-0 flex-1">
          <div
            key={location.pathname}
            className={`mx-auto animate-[fadeIn_.18s_ease-out] px-4 py-6 sm:px-6 lg:px-8 ${
              wide ? 'max-w-none' : 'max-w-[1440px]'
            }`}
          >
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
