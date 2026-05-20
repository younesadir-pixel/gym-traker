/**
 * BottomNav – Mobile bottom tab bar for one-hand navigation.
 */
import { NavLink, useLocation } from 'react-router-dom'
import { Home, Dumbbell, Clock, Wrench } from 'lucide-react'
import clsx from 'clsx'

const TABS = [
  { to: '/',        label: 'Home',    Icon: Home },
  { to: '/history', label: 'History', Icon: Clock },
  { to: '/tools',   label: 'Tools',   Icon: Wrench },
]

export default function BottomNav() {
  const { pathname } = useLocation()
  // Hide on active workout session
  if (pathname.startsWith('/workout/')) return null

  return (
    <nav className="fixed bottom-4 left-1/2 -translate-x-1/2 w-[92%] max-w-md bg-zinc-900/80 backdrop-blur-lg border border-zinc-800/50 rounded-2xl py-3 px-6 shadow-2xl z-50 md:hidden">
      <div className="flex items-center justify-around">
        {TABS.map(({ to, label, Icon }) => {
          const active = to === '/' ? pathname === '/' : pathname.startsWith(to)
          return (
            <NavLink
              key={to}
              to={to}
              className={clsx(
                'flex flex-col items-center gap-0.5 px-3 py-1 transition-all duration-150 relative active:scale-90',
                active
                  ? 'text-lime-400'
                  : 'text-zinc-500 hover:text-zinc-400 active:text-zinc-300'
              )}
            >
              <Icon size={19} strokeWidth={active ? 2.5 : 2} />
              <span className="text-[10px] font-bold tracking-wide uppercase">{label}</span>
              {active && (
                <span className="absolute -bottom-1.5 w-6 h-[2.5px] rounded-full bg-lime-400 shadow-[0_0_10px_rgba(163,230,53,0.8)]" />
              )}
            </NavLink>
          )
        })}
      </div>
    </nav>
  )
}
