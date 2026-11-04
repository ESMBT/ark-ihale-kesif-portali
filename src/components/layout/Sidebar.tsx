import { useState } from 'react'
import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import { navGroups } from '../../lib/nav'
import { Icon } from '../ui/Icon'

/* Sidebar panosu: siyah zemin · beyaz ikon/metin · 16px köşe
   Daraltılmış hâlde yalnızca ikon rayı görünür. */
export function Sidebar({
  collapsed,
  onToggle,
  onNavigate,
}: {
  collapsed: boolean
  onToggle: () => void
  onNavigate?: () => void
}) {
  const location = useLocation()
  const navigate = useNavigate()
  const [openGroups, setOpenGroups] = useState<string[]>(() =>
    navGroups
      .filter((g) => g.children?.some((c) => c.to !== '/' && location.pathname.startsWith(c.to)))
      .map((g) => g.label),
  )

  const toggle = (label: string) =>
    setOpenGroups((prev) => (prev.includes(label) ? prev.filter((l) => l !== label) : [...prev, label]))

  return (
    <div className="flex h-full flex-col bg-black">
      {/* Üst: logo + daraltma */}
      <div
        className={`flex items-center border-b border-[#1a1a1a] ${
          collapsed ? 'justify-center px-2 py-4' : 'justify-between px-5 py-4'
        }`}
      >
        <button
          onClick={() => {
            if (collapsed) onToggle()
            else {
              onNavigate?.()
              navigate('/moduller')
            }
          }}
          className="flex items-center gap-2.5"
          title={collapsed ? 'Kenar çubuğunu genişlet' : 'Modül seç'}
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-md bg-white font-heading text-[13px] font-bold text-black">
            A
          </span>
          {!collapsed && (
            <span className="font-heading text-[18px] font-bold leading-6 text-white">Ark İnşaat</span>
          )}
        </button>
        {!collapsed && (
          <button
            onClick={onToggle}
            className="rounded-md p-1.5 text-white/50 transition-colors hover:bg-[#1a1a1a] hover:text-white"
            aria-label="Kenar çubuğunu daralt"
            title="Kenar çubuğunu daralt"
          >
            <Icon name="chevron-left" size={18} />
          </button>
        )}
      </div>

      {collapsed ? (
        /* --- Dar hâl: yalnızca ikonlar --- */
        <nav className="flex flex-1 flex-col items-center gap-1 overflow-y-auto px-2 py-4">
          {navGroups.map((group) => {
            const groupActive =
              group.children?.some((c) => location.pathname === c.to) ||
              (group.to !== '/' && location.pathname.startsWith(group.to))
            return (
              <button
                key={group.label}
                onClick={() => {
                  if (group.disabled) return
                  if (group.children) {
                    setOpenGroups((prev) =>
                      prev.includes(group.label)
                        ? prev.filter((l) => l !== group.label)
                        : [...prev, group.label],
                    )
                  }
                  onToggle()
                }}
                title={group.label}
                aria-disabled={group.disabled}
                className={`flex h-10 w-10 items-center justify-center rounded-lg transition-colors ${
                  group.disabled
                    ? 'cursor-not-allowed text-white/30'
                    : groupActive
                      ? 'bg-[#1a1a1a] text-white'
                      : 'text-white/70 hover:bg-[#1a1a1a] hover:text-white'
                }`}
              >
                <Icon name={group.icon} size={19} />
              </button>
            )
          })}
        </nav>
      ) : (
        <>
          {/* Arama */}
          <div className="px-4 pb-3">
            <div className="relative">
              <Icon
                name="search"
                size={16}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray"
              />
              <input
                placeholder="Ara..."
                className="h-10 w-full rounded-lg border border-transparent bg-[#1a1a1a] pl-9 pr-3 text-[14px] text-white outline-none placeholder:text-gray focus:border-gray"
              />
            </div>
          </div>

          {/* Menü */}
          <nav className="flex-1 overflow-y-auto px-2 pb-4">
            {navGroups.map((group) => {
              const isOpen = openGroups.includes(group.label)
              const groupActive =
                group.children?.some((c) => location.pathname === c.to) ||
                (group.to !== '/' && location.pathname.startsWith(group.to))

              if (group.disabled) {
                return (
                  <div key={group.label} className="mt-1">
                    <span
                      aria-disabled
                      className="flex w-full cursor-not-allowed items-center gap-3 rounded-lg px-3 py-2.5 text-left text-[14px] leading-5 text-white/30"
                    >
                      <Icon name={group.icon} size={18} />
                      <span className="flex-1 truncate">{group.label}</span>
                    </span>
                  </div>
                )
              }

              return (
                <div key={group.label} className="mt-1">
                  {group.children ? (
                    <button
                      onClick={() => toggle(group.label)}
                      className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-[14px] leading-5 transition-colors ${
                        groupActive ? 'bg-[#1a1a1a] text-white' : 'text-white/90 hover:bg-[#1a1a1a]'
                      }`}
                    >
                      <Icon name={group.icon} size={18} />
                      <span className="flex-1 truncate">{group.label}</span>
                      <Icon
                        name="chevron-down"
                        size={14}
                        className={`text-gray transition-transform ${isOpen ? '' : '-rotate-90'}`}
                      />
                    </button>
                  ) : (
                    <NavLink
                      to={group.to}
                      onClick={onNavigate}
                      className={({ isActive }) =>
                        `flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-[14px] leading-5 transition-colors ${
                          isActive ? 'bg-[#1a1a1a] font-bold text-white' : 'text-white/90 hover:bg-[#1a1a1a]'
                        }`
                      }
                    >
                      <Icon name={group.icon} size={18} />
                      <span className="flex-1 truncate">{group.label}</span>
                    </NavLink>
                  )}

                  {isOpen && group.children && (
                    <ul className="ml-[22px] mt-1 space-y-0.5 border-l border-[#242424] pl-3">
                      {group.children.map((child) => {
                        const pasif = child.to === '/hesap-ayarlari'
                        const active =
                          !pasif &&
                          (child.to === '/'
                            ? location.pathname === '/'
                            : location.pathname === child.to || location.pathname.startsWith(child.to + '/'))
                        if (pasif) {
                          return (
                            <li key={child.to + child.label}>
                              <span
                                aria-disabled
                                className="flex cursor-not-allowed items-center justify-between gap-2 rounded-md px-3 py-2 text-[13px] leading-5 text-white/30"
                              >
                                <span className="truncate">{child.label}</span>
                                <Icon name="lock" size={12} />
                              </span>
                            </li>
                          )
                        }
                        return (
                          <li key={child.to + child.label}>
                            <NavLink
                              to={child.to}
                              onClick={onNavigate}
                              className={`flex items-center justify-between gap-2 rounded-md px-3 py-2 text-[13px] leading-5 transition-colors ${
                                active
                                  ? 'bg-white/10 font-bold text-white'
                                  : 'text-white/60 hover:bg-[#1a1a1a] hover:text-white'
                              }`}
                            >
                              <span className="truncate">{child.label}</span>
                            </NavLink>
                          </li>
                        )
                      })}
                    </ul>
                  )}
                </div>
              )
            })}
          </nav>
        </>
      )}
    </div>
  )
}
