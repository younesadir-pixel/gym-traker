/**
 * PWAInstallPrompt – Bottom sheet overlay guiding the user to install the PWA.
 * Handles Android/Chrome native triggers and iOS Safari share sheets.
 */
import { useState, useEffect } from 'react'
import { Download, X, Share } from 'lucide-react'
import clsx from 'clsx'

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null)
  const [showPrompt, setShowPrompt] = useState(false)
  const [isIOS, setIsIOS] = useState(false)
  const [isStandalone, setIsStandalone] = useState(false)

  useEffect(() => {
    // Detect standalone display mode
    const checkStandalone = 
      window.matchMedia('(display-mode: standalone)').matches || 
      window.navigator.standalone || 
      document.referrer.includes('android-app://')
    
    setIsStandalone(!!checkStandalone)

    // Detect iOS
    const userAgent = window.navigator.userAgent.toLowerCase()
    const ios = /iphone|ipad|ipod/.test(userAgent)
    setIsIOS(ios)

    // Listen for Chrome/Android install prompts
    const handleBeforeInstall = (e) => {
      e.preventDefault()
      setDeferredPrompt(e)
      // Only show if not already launched in standalone mode
      if (!checkStandalone) {
        // Delay showing to not interrupt user instantly on load
        setTimeout(() => setShowPrompt(true), 2500)
      }
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstall)

    // Handle iOS prompt Safari check (since iOS has no beforeinstallprompt event)
    if (ios && !checkStandalone) {
      const iosDismissed = sessionStorage.getItem('gymtracker_ios_prompt_dismissed')
      if (!iosDismissed) {
        setTimeout(() => setShowPrompt(true), 3000)
      }
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall)
    }
  }, [])

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice
      if (outcome === 'accepted') {
        console.log('PWA installation accepted by user')
      }
      setDeferredPrompt(null)
      setShowPrompt(false)
    }
  }

  const handleDismiss = () => {
    setShowPrompt(false)
    if (isIOS) {
      sessionStorage.setItem('gymtracker_ios_prompt_dismissed', 'true')
    }
  }

  if (isStandalone || !showPrompt) return null

  return (
    <div className="fixed bottom-24 left-1/2 -translate-x-1/2 w-[92%] max-w-sm bg-zinc-950/95 backdrop-blur-md border border-zinc-800/80 rounded-2xl p-4 shadow-2xl z-[100] animate-slide-up">
      <button 
        onClick={handleDismiss}
        className="absolute top-3.5 right-3.5 text-zinc-500 hover:text-white transition-colors"
      >
        <X size={15} />
      </button>

      <div className="flex gap-3">
        <div className="w-9 h-9 rounded-xl bg-lime-500/10 border border-lime-500/20 flex items-center justify-center text-lime-400 flex-shrink-0 shadow-[0_0_10px_rgba(163,255,18,0.1)]">
          <Download size={16} />
        </div>
        
        <div className="flex-1 min-w-0 pr-4">
          <h4 className="text-xs font-black text-white uppercase tracking-wider">Install GymTracker Pro</h4>
          <p className="text-[10px] text-zinc-400 mt-1 font-semibold leading-relaxed">
            Install the app to log sets offline at the gym, reduce loading latency, and lock a fullscreen experience.
          </p>

          {isIOS ? (
            <div className="mt-3 bg-zinc-900/60 border border-zinc-850 p-2.5 rounded-xl text-[9px] text-zinc-300 font-semibold leading-relaxed flex items-center gap-2">
              <Share size={12} className="text-lime-400 flex-shrink-0 animate-bounce" />
              <span>Tap share below and select <strong>"Add to Home Screen"</strong></span>
            </div>
          ) : (
            <button
              onClick={handleInstall}
              className="mt-3 w-full bg-lime-400 hover:bg-lime-300 text-black font-black uppercase tracking-widest text-[9px] py-2.5 rounded-xl shadow-[0_0_15px_rgba(163,230,53,0.2)] transition-all duration-200 active:scale-95"
            >
              Install App
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
