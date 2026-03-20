import { Shield, Github, Twitter, Linkedin } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="border-t border-white/[0.06] bg-[#05050c]">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid md:grid-cols-4 gap-10 mb-10">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-orange-500 to-orange-700 flex items-center justify-center">
                <Shield className="w-4 h-4 text-white" />
              </div>
              <span className="text-lg font-black"><span className="text-white">Earn</span><span className="text-orange-500">Kavach</span></span>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed max-w-xs">
              India's first AI-powered income stabilization platform for gig workers. We don't just insure income — we stabilize it.
            </p>
            <div className="flex items-center gap-3 mt-5">
              {[Github, Twitter, Linkedin].map((Icon, i) => (
                <button key={i} className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-colors">
                  <Icon className="w-3.5 h-3.5" />
                </button>
              ))}
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-4">Product</h4>
            <ul className="space-y-2.5">
              {['Dashboard', 'Live Demo', 'Claims', 'AI Architecture'].map(l => (
                <li key={l}><Link to="/" className="text-slate-400 hover:text-white text-sm transition-colors">{l}</Link></li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold text-sm mb-4">Technology</h4>
            <ul className="space-y-2.5">
              {['Income Prediction AI', 'Fraud Detection', 'WRS Score', 'Guidewire Integration'].map(l => (
                <li key={l}><span className="text-slate-400 text-sm">{l}</span></li>
              ))}
            </ul>
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between pt-6 border-t border-white/[0.06] gap-4">
          <p className="text-slate-600 text-xs">© 2026 EarnKavach. Built for Guidewire Hackathon.</p>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-slate-500 text-xs">All systems operational</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
