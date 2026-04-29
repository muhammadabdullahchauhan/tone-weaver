import Link from "next/link";
import { Waves, Github, Twitter, Globe } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-white/8 bg-[#0d0d1a] mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link href="/" className="flex items-center gap-2.5 mb-4 group">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#6366f1] to-[#ec4899] flex items-center justify-center">
                <Waves className="w-4 h-4 text-white" />
              </div>
              <span className="text-lg font-bold gradient-text">Tone Weaver</span>
            </Link>
            <p className="text-slate-500 text-sm leading-relaxed">
              AI-powered accent translation and voice transformation for modern communication.
            </p>
          </div>

          {/* Features */}
          <div>
            <h4 className="text-slate-300 font-semibold text-sm mb-4 uppercase tracking-wider">Features</h4>
            <ul className="space-y-2">
              {[
                { href: "/record", label: "Voice Recording" },
                { href: "/hybrid", label: "Hybrid Accents" },
                { href: "/learning", label: "Learning Mode" },
                { href: "/comparison", label: "Comparison" },
              ].map(({ href, label }) => (
                <li key={href}>
                  <Link href={href} className="text-slate-500 hover:text-slate-300 text-sm transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="text-slate-300 font-semibold text-sm mb-4 uppercase tracking-wider">Navigation</h4>
            <ul className="space-y-2">
              {[
                { href: "/history", label: "History" },
                { href: "/share", label: "Share Audio" },
                { href: "/", label: "Home" },
              ].map(({ href, label }) => (
                <li key={href}>
                  <Link href={href} className="text-slate-500 hover:text-slate-300 text-sm transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/8 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-slate-600 text-sm">
            © 2026 Tone Weaver
          </p>
          <div className="flex items-center gap-4">
            <a href="#" className="text-slate-600 hover:text-slate-400 transition-colors" aria-label="GitHub">
              <Github className="w-4 h-4" />
            </a>
            <a href="#" className="text-slate-600 hover:text-slate-400 transition-colors" aria-label="Twitter">
              <Twitter className="w-4 h-4" />
            </a>
            <a href="#" className="text-slate-600 hover:text-slate-400 transition-colors" aria-label="Website">
              <Globe className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
