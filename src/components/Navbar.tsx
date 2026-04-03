import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Shield, Menu, X, Zap, LogOut, Sun, Moon } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const location = useLocation()

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handler)
    return () => window.removeEventListener('scroll', handler)
  }, [])

  const { isAuthenticated, user, logout } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const navLinks = isAuthenticated
    ? user?.role === 'admin'
      ? [
          { to: '/', label: 'Home' },
          { to: '/admin', label: 'Admin Portal' },
          { to: '/demo', label: 'Live Demo' },
          { to: '/claims', label: 'Claims' },
        ]
      : [
          { to: '/', label: 'Home' },
          { to: '/dashboard', label: 'My Dashboard' },
          { to: '/claims', label: 'Claims' },
        ]
    : [{ to: '/', label: 'Home' }, { to: '/login', label: 'Sign In' }];

  return (
    <motion.nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? 'border-b bg-white/80 shadow-xl backdrop-blur-2xl border-slate-200/80 dark:border-white/[0.06] dark:bg-[#07070f]/90 dark:shadow-2xl'
          : 'bg-transparent'
      }`}
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
    >
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="relative">
            <div className="absolute inset-0 rounded-xl bg-orange-500/30 blur-md group-hover:blur-lg transition-all" />
            <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-orange-700 flex items-center justify-center shadow-lg">
              <Shield className="w-5 h-5 text-white" />
            </div>
          </div>
          <div className="flex items-baseline gap-0.5">
            <span className="text-xl font-black tracking-tight text-slate-900 dark:text-white">Earn</span>
            <span className="text-xl font-black text-orange-500 tracking-tight">Kavach</span>
          </div>
          <div className="hidden md:flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-emerald-400 text-[10px] font-semibold">LIVE</span>
          </div>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => {
            const active = location.pathname === link.to
            return (
              <Link
                key={link.to}
                to={link.to}
                className={`relative px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                  active
                    ? 'text-slate-900 dark:text-white'
                    : 'text-slate-600 hover:bg-slate-900/5 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-white/5 dark:hover:text-white'
                }`}
              >
                {active && (
                  <motion.div
                    layoutId="nav-active"
                    className="absolute inset-0 rounded-xl border border-slate-200 bg-slate-900/[0.04] dark:border-white/10 dark:bg-white/8"
                    transition={{ type: 'spring', bounce: 0.2, duration: 0.4 }}
                  />
                )}
                <span className="relative z-10">{link.label}</span>
                {active && (
                  <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-orange-500" />
                )}
              </Link>
            )
          })}
        </div>

        {/* CTA */}
        <div className="hidden md:flex items-center gap-3">
          <button
            type="button"
            onClick={toggleTheme}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200/80 bg-white/60 text-slate-700 shadow-sm transition-all hover:bg-slate-100 dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:hover:bg-white/10"
            title={theme === 'dark' ? 'Light mode' : 'Dark mode'}
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
          {isAuthenticated ? (
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                {user?.role === 'admin' ? 'Admin' : 'User'}: {user?.name.split(' ')[0]}
              </span>
              <button
                onClick={logout}
                className="flex items-center gap-2 rounded-xl border border-slate-200/90 px-4 py-2 text-sm font-bold text-slate-800 transition-all hover:bg-slate-100 dark:border-white/10 dark:text-white dark:hover:bg-white/5"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          ) : (
            <Link to="/login">
              <motion.button
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 text-white text-sm font-bold shadow-lg shadow-orange-500/20 hover:shadow-orange-500/40 transition-all"
                whileHover={{ scale: 1.04, y: -1 }}
                whileTap={{ scale: 0.97 }}
              >
                <Zap className="w-4 h-4" />
                Sign In
              </motion.button>
            </Link>
          )}
        </div>

        {/* Mobile menu button */}
        <button
          className="rounded-lg bg-slate-200/60 p-2 text-slate-800 dark:bg-white/5 dark:text-white md:hidden"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="space-y-1 border-t border-slate-200/80 bg-white/95 px-6 py-4 backdrop-blur-2xl dark:border-white/[0.06] dark:bg-[#0d0d1e]/95 md:hidden"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
          >
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`block rounded-xl px-4 py-3 text-sm font-medium transition-colors ${
                  location.pathname === link.to
                    ? 'bg-orange-500/10 text-orange-600 dark:text-orange-400'
                    : 'text-slate-600 hover:bg-slate-900/5 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-white/5 dark:hover:text-white'
                }`}
                onClick={() => setIsOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <div className="space-y-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  toggleTheme()
                }}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200/90 px-4 py-3 text-sm font-bold text-slate-800 dark:border-white/10 dark:text-white"
              >
                {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                {theme === 'dark' ? 'Light mode' : 'Dark mode'}
              </button>
              {isAuthenticated ? (
                <button
                  onClick={() => {
                    logout()
                    setIsOpen(false)
                  }}
                  className="w-full rounded-xl border border-slate-200/90 px-4 py-3 text-sm font-bold text-slate-800 dark:border-white/10 dark:text-white"
                >
                  Logout
                </button>
              ) : (
                <Link to="/login" onClick={() => setIsOpen(false)}>
                  <button className="w-full rounded-xl bg-orange-500 px-4 py-3 text-sm font-bold text-white">
                    Sign In
                  </button>
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  )
}
