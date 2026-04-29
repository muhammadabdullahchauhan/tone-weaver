"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  Mic2,
  Blend,
  BookOpen,
  BarChart2,
  Clock,
  Share2,
  Menu,
  X,
  Waves,
} from "lucide-react";

const navLinks = [
  { href: "/record", label: "Record", icon: Mic2 },
  { href: "/hybrid", label: "Hybrid", icon: Blend },
  { href: "/learning", label: "Learning", icon: BookOpen },
  { href: "/comparison", label: "Compare", icon: BarChart2 },
  { href: "/history", label: "History", icon: Clock },
  { href: "/share", label: "Share", icon: Share2 },
];

export default function Header() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-white/8 bg-[#0d0d1a]/90 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#6366f1] to-[#ec4899] flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
              <Waves className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold gradient-text">Tone Weaver</span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map(({ href, label, icon: Icon }) => {
              const active = pathname === href;
              return (
                <Link
                  key={href}
                  href={href}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    active
                      ? "bg-[#6366f1]/15 text-[#6366f1]"
                      : "text-slate-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </Link>
              );
            })}
          </nav>

          {/* CTA + Mobile Menu */}
          <div className="flex items-center gap-3">
            <Link
              href="/record"
              className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white gradient-bg hover:opacity-90 transition-opacity glow-primary"
            >
              <Mic2 className="w-4 h-4" />
              Start Recording
            </Link>
            <button
              className="lg:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
              onClick={() => setMobileOpen((o) => !o)}
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Nav */}
      {mobileOpen && (
        <div className="lg:hidden border-t border-white/8 bg-[#0d0d1a]/95 backdrop-blur-xl fade-in">
          <nav className="max-w-7xl mx-auto px-4 py-3 flex flex-col gap-1">
            {navLinks.map(({ href, label, icon: Icon }) => {
              const active = pathname === href;
              return (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                    active
                      ? "bg-[#6366f1]/15 text-[#6366f1]"
                      : "text-slate-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </Link>
              );
            })}
            <Link
              href="/record"
              onClick={() => setMobileOpen(false)}
              className="flex items-center justify-center gap-2 mt-2 px-4 py-3 rounded-xl text-sm font-semibold text-white gradient-bg"
            >
              <Mic2 className="w-4 h-4" />
              Start Recording
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
