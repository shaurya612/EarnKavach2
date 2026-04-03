import { Shield, Github, Twitter, Linkedin } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="border-t border-slate-200/80 bg-slate-100/80 dark:border-white/[0.06] dark:bg-[#05050c]">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid md:grid-cols-4 gap-10 mb-10">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-orange-500 to-orange-700 flex items-center justify-center">
                <Shield className="w-4 h-4 text-white" />
              </div>
              <span className="text-lg font-black"><span className="text-slate-900 dark:text-white">Earn</span><span className="text-orange-500">Kavach</span></span>
            </div>
            <p className="max-w-xs text-sm leading-relaxed text-slate-600 dark:text-slate-400">
              India's first AI-powered income stabilization platform for gig workers. We don't just insure income — we stabilize it.
            </p>
            <div className="flex items-center gap-3 mt-5">
              {[Github, Twitter, Linkedin].map((Icon, i) => (
                <button key={i} className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-200/70 text-slate-600 transition-colors hover:bg-slate-300/80 hover:text-slate-900 dark:bg-white/5 dark:text-slate-400 dark:hover:bg-white/10 dark:hover:text-white">
                  <Icon className="w-3.5 h-3.5" />
                </button>
              ))}
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="mb-4 text-sm font-semibold text-slate-900 dark:text-white">Product</h4>
            <ul className="space-y-2.5">
              {['Dashboard', 'Live Demo', 'Claims', 'AI Architecture'].map(l => (
                <li key={l}><Link to="/" className="text-sm text-slate-600 transition-colors hover:text-slate-900 dark:text-slate-400 dark:hover:text-white">{l}</Link></li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="mb-4 text-sm font-semibold text-slate-900 dark:text-white">Technology</h4>
            <ul className="space-y-2.5">
              {['Income Prediction AI', 'Fraud Detection', 'WRS Score', 'Guidewire Integration'].map(l => (
                <li key={l}><span className="text-sm text-slate-600 dark:text-slate-400">{l}</span></li>
              ))}
            </ul>
          </div>
        </div>

        <div className="flex flex-col items-center justify-between gap-4 border-t border-slate-200/80 pt-6 dark:border-white/[0.06] md:flex-row">
          <p className="text-xs text-slate-500 dark:text-slate-600">© 2026 EarnKavach. Built for Guidewire Hackathon.</p>
          <div className="flex items-center gap-2">
            <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
            <span className="text-xs text-slate-500 dark:text-slate-500">All systems operational</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
