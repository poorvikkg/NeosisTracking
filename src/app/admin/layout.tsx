'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { LayoutDashboard, Users, LogOut, Menu, X } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { EVENT_NAME } from '@/lib/constants'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [mobileOpen, setMobileOpen] = useState(false)

  const navItems = [
    { label: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'Teams', href: '/admin/teams/create', icon: Users },
  ]

  const handleLogout = async () => {
    try {
      const res = await fetch('/api/auth/logout', { method: 'POST' })
      if (res.ok) router.push('/')
    } catch (e) {
      console.error(e)
    }
  }

  // Do not show the admin layout wrapper on the login page
  if (pathname === '/admin/login') {
    return <>{children}</>
  }

  return (
    <div className="min-h-screen bg-black text-zinc-100 flex flex-col font-inter selection:bg-zinc-800 selection:text-white">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-black/80 backdrop-blur-xl">
        <div className="flex h-16 items-center px-4 sm:px-6 max-w-7xl mx-auto w-full justify-between">
          <div className="flex items-center gap-8">
            <Link href="/admin/dashboard" className="font-outfit font-bold text-lg sm:text-xl tracking-tight text-white flex items-center gap-2">
              {EVENT_NAME} <span className="text-xs sm:text-sm font-normal px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-300 border border-zinc-700">Admin</span>
            </Link>
            
            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-1">
              {navItems.map((item) => {
                const isActive = pathname.startsWith(item.href)
                const Icon = item.icon
                return (
                  <Link key={item.href} href={item.href}
                    className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive ? 'bg-white text-black' : 'text-zinc-400 hover:text-white hover:bg-zinc-900'}`}
                  >
                    <Icon size={16} />
                    {item.label}
                  </Link>
                )
              })}
            </nav>
          </div>

          {/* Desktop Right */}
          <div className="hidden md:flex items-center">
            <Button variant="ghost" className="gap-2 text-zinc-400 hover:text-white" onClick={handleLogout}>
              <LogOut size={16} />
              Logout
            </Button>
          </div>

          {/* Mobile Toggle */}
          <button 
            className="md:hidden p-2.5 -mr-2 text-zinc-300 hover:text-white rounded-lg hover:bg-zinc-900 transition-colors focus:outline-none" 
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle Navigation Menu"
          >
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Nav Drawer */}
        {mobileOpen && (
          <div className="md:hidden border-t border-white/10 bg-zinc-950/95 backdrop-blur-2xl px-4 py-4 space-y-2 shadow-2xl animate-in slide-in-from-top-2">
            {navItems.map((item) => {
              const isActive = pathname.startsWith(item.href)
              const Icon = item.icon
              return (
                <Link key={item.href} href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3.5 rounded-xl text-base font-medium transition-colors ${isActive ? 'bg-white text-black font-semibold' : 'text-zinc-300 hover:text-white hover:bg-zinc-900'}`}
                >
                  <Icon size={20} />
                  {item.label}
                </Link>
              )
            })}
            <div className="pt-3 mt-2 border-t border-white/10">
              <Button variant="ghost" className="w-full flex justify-start gap-3 text-zinc-400 hover:text-red-400 hover:bg-red-500/10 py-3 text-base h-12" onClick={handleLogout}>
                <LogOut size={20} />
                Logout
              </Button>
            </div>
          </div>
        )}
      </header>

      {/* Main content */}
      <main className="flex-1 w-full max-w-7xl mx-auto p-3.5 sm:p-6 md:p-8">
        {children}
      </main>
    </div>
  )
}
