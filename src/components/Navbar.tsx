import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Shield, Menu, X, Zap, LogOut } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const navLinks = [
  { to: '/', label: 'Home' },
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/demo', label: 'Live Demo' },
  { to: '/claims', label: 'Claims' },
  { to: '/admin', label: 'Admin Portal' },
]

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

  return (
    <motion.nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled ? 'bg-[#07070f]/90 backdrop-blur-2xl border-b border-white/[0.06] shadow-2xl' : 'bg-transparent'
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
            <span className="text-xl font-black text-white tracking-tight">Earn</span>
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
                  active ? 'text-white' : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {active && (
                  <motion.div
                    layoutId="nav-active"
                    className="absolute inset-0 rounded-xl bg-white/8 border border-white/10"
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
          {isAuthenticated ? (
            <div className="flex items-center gap-4">
              <span className="text-slate-400 text-sm font-medium">Hello, {user?.name.split(' ')[0]}</span>
              <button
                onClick={logout}
                className="flex items-center gap-2 px-4 py-2 rounded-xl border border-white/10 text-white text-sm font-bold hover:bg-white/5 transition-all"
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
          className="md:hidden p-2 rounded-lg bg-white/5 text-white"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="md:hidden bg-[#0d0d1e]/95 backdrop-blur-2xl border-t border-white/[0.06] px-6 py-4 space-y-1"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
          >
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`block px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                  location.pathname === link.to
                    ? 'text-orange-400 bg-orange-500/10'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
                onClick={() => setIsOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <div className="pt-2">
              {isAuthenticated ? (
                <button onClick={() => { logout(); setIsOpen(false); }} className="w-full px-4 py-3 rounded-xl border border-white/10 text-white text-sm font-bold">
                  Logout
                </button>
              ) : (
                <Link to="/login" onClick={() => setIsOpen(false)}>
                  <button className="w-full px-4 py-3 rounded-xl bg-orange-500 text-white text-sm font-bold">
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
