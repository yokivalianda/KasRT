'use client'
import { useEffect, useState } from 'react'
import InstallPrompt from './InstallPrompt'

export default function PWAProvider() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [showPrompt, setShowPrompt]         = useState(false)
  const [isInstalled, setIsInstalled]       = useState(false)

  useEffect(() => {
    // Register Service Worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js', { scope: '/' })
        .then(reg => {
          console.log('[PWA] Service Worker registered:', reg.scope)
        })
        .catch(err => {
          console.log('[PWA] SW registration failed:', err)
        })
    }

    // Cek apakah sudah diinstall
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true)
      return
    }

    // Tangkap event beforeinstallprompt
    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e)

      // Tampilkan prompt setelah 30 detik, atau kalau belum pernah dismiss
      const dismissed = localStorage.getItem('pwa-prompt-dismissed')
      const lastDismiss = dismissed ? parseInt(dismissed) : 0
      const daysSinceDismiss = (Date.now() - lastDismiss) / (1000 * 60 * 60 * 24)

      // Tampilkan kalau belum pernah dismiss atau sudah >7 hari
      if (!dismissed || daysSinceDismiss > 7) {
        setTimeout(() => setShowPrompt(true), 3000)
      }
    }

    window.addEventListener('beforeinstallprompt', handler)

    // Detect kalau app baru saja diinstall
    window.addEventListener('appinstalled', () => {
      setIsInstalled(true)
      setShowPrompt(false)
      setDeferredPrompt(null)
    })

    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  async function handleInstall() {
    if (!deferredPrompt) return
    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    if (outcome === 'accepted') {
      setIsInstalled(true)
    }
    setDeferredPrompt(null)
    setShowPrompt(false)
  }

  function handleDismiss() {
    localStorage.setItem('pwa-prompt-dismissed', Date.now().toString())
    setShowPrompt(false)
  }

  if (!showPrompt || isInstalled) return null

  return (
    <InstallPrompt onInstall={handleInstall} onDismiss={handleDismiss} />
  )
}
