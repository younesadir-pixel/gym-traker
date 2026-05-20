import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { Routes, Route, Navigate, Link, useLocation } from 'react-router-dom'
import { syncOfflineWorkouts } from './features/workout/workoutSlice'
import BottomNav from './components/layout/BottomNav'
import PWAInstallPrompt from './components/layout/PWAInstallPrompt'
import Home from './pages/Home'
import WorkoutSession from './pages/WorkoutSession'
import History from './pages/History'
import Tools from './pages/Tools'
import { Home as HomeIcon, Clock, Wrench, BarChart2, Settings } from 'lucide-react'
import clsx from 'clsx'

function Sidebar() {
  const { pathname } = useLocation()
  // Hide on active workout session
  if (pathname.startsWith('/workout/')) return null

  const links = [
    { to: '/', label: 'Dashboard', Icon: HomeIcon },
    { to: '/history', label: 'History', Icon: Clock },
    { to: '/tools', label: 'Analytics & Tools', Icon: Wrench },
  ]

  return (
    <aside className="w-64 bg-zinc-950 border-r border-zinc-900/60 h-screen sticky top-0 flex flex-col p-6 hidden md:flex flex-shrink-0 relative z-20">
      {/* Brand logo */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-9 h-9 rounded-xl bg-lime-400 flex items-center justify-center text-black font-black text-sm tracking-tighter shadow-[0_0_15px_rgba(163,255,18,0.2)]">
          GP
        </div>
        <div>
          <h1 className="text-sm font-black text-white uppercase tracking-wider leading-none">GymTracker</h1>
          <span className="text-[8px] text-lime-400 font-mono font-bold tracking-widest uppercase mt-0.5 block">PRO EDITION</span>
        </div>
      </div>

      {/* Main navigation */}
      <nav className="flex-1 space-y-1.5">
        {links.map(({ to, label, Icon }) => {
          const active = to === '/' ? pathname === '/' : pathname.startsWith(to)
          return (
            <Link
              key={to}
              to={to}
              className={clsx(
                'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all duration-200 group border',
                active
                  ? 'bg-lime-500/10 text-lime-400 border-lime-500/20'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-900/40 border-transparent'
              )}
            >
              <Icon size={18} className={clsx(active ? 'text-lime-400' : 'text-zinc-500 group-hover:text-zinc-300 transition-colors')} />
              {label}
            </Link>
          )
        })}

        {/* Pro features placeholder */}
        <div className="pt-6 mt-6 border-t border-zinc-900/80 space-y-1">
          <span className="px-4 text-[9px] font-bold text-zinc-600 uppercase tracking-widest block mb-2.5">SaaS Addons</span>
          <div className="flex items-center justify-between px-4 py-2.5 rounded-xl text-xs text-zinc-600 font-bold cursor-not-allowed group hover:bg-zinc-900/10">
            <div className="flex items-center gap-3">
              <BarChart2 size={16} />
              <span>Muscle Split AI</span>
            </div>
            <span className="text-[8px] bg-zinc-950 text-zinc-500 border border-zinc-800 px-1 py-0.5 rounded uppercase font-mono font-bold">Soon</span>
          </div>
          <div className="flex items-center justify-between px-4 py-2.5 rounded-xl text-xs text-zinc-600 font-bold cursor-not-allowed group hover:bg-zinc-900/10">
            <div className="flex items-center gap-3">
              <Settings size={16} />
              <span>System Config</span>
            </div>
            <span className="text-[8px] bg-zinc-950 text-zinc-500 border border-zinc-800 px-1 py-0.5 rounded uppercase font-mono font-bold">Soon</span>
          </div>
        </div>
      </nav>

      {/* User profile footer info */}
      <div className="border-t border-zinc-900/80 pt-4 flex items-center gap-3">
        <div className="w-9 h-9 rounded-full border border-lime-400/40 p-0.5 bg-zinc-950 flex items-center justify-center overflow-hidden flex-shrink-0 shadow-[0_0_10px_rgba(163,255,18,0.1)]">
          <span className="text-xs font-black text-lime-400 font-mono">YS</span>
        </div>
        <div className="min-w-0">
          <p className="text-xs font-bold text-white leading-tight">Younes Sadir</p>
          <p className="text-[9px] text-zinc-500 leading-none truncate mt-0.5">younes.sadir@gymtracker.pro</p>
        </div>
      </div>
    </aside>
  )
}

export default function App() {
  const dispatch = useDispatch()

  useEffect(() => {
    // Initial check when app loads
    if (navigator.onLine) {
      dispatch(syncOfflineWorkouts())
    }

    const handleOnline = () => {
      dispatch(syncOfflineWorkouts())
    }

    window.addEventListener('online', handleOnline)
    return () => window.removeEventListener('online', handleOnline)
  }, [dispatch])

  return (
    <div className="flex min-h-dvh bg-black relative text-zinc-100 font-sans overflow-x-hidden">
      {/* Decorative luxury-tech ambient glowing particles */}
      <div className="absolute top-[-10%] left-1/4 w-[500px] h-[500px] bg-lime-500/5 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-1/4 w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-[150px] pointer-events-none" />

      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <main className="flex-1 overflow-y-auto w-full max-w-[1200px] mx-auto px-4 md:px-8 py-6 md:py-10 pb-28 md:pb-10">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/workout/:dayId" element={<WorkoutSession />} />
            <Route path="/history" element={<History />} />
            <Route path="/tools" element={<Tools />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        <BottomNav />
        <PWAInstallPrompt />
      </div>
    </div>
  )
}
