import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";
import AuthModal from "./AuthModal";

const navLinks = [
  { to: "/",       label: "Home",   icon: "🏠" },
  { to: "/studio", label: "Studio", icon: "🎬" },
  { to: "/voices", label: "Voices", icon: "🔊" },
  { to: "/about",  label: "About",  icon: "ℹ️"  },
  { to: "/docs",   label: "Docs",   icon: "📖" },
];

export default function Navbar() {
  const { pathname }                = useLocation();
  const { dark, setDark }           = useTheme();
  const { user, signout }           = useAuth();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [authOpen, setAuthOpen]     = useState(false);

  // Close drawer on route change
  useEffect(() => { setDrawerOpen(false); }, [pathname]);

  // Prevent body scroll when drawer open
  useEffect(() => {
    document.body.style.overflow = drawerOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [drawerOpen]);

  const navBg    = dark ? "bg-[#030616]/90 border-white/10"  : "bg-white/90 border-gray-200";
  const logoText = dark ? "text-white"                       : "text-gray-900";
  const linkBase = dark ? "text-slate-400 hover:text-white"  : "text-gray-500 hover:text-gray-900";
  const linkActive = dark ? "bg-white/10 text-white"         : "bg-gray-100 text-gray-900";
  const drawerBg = dark ? "bg-[#060b1e] border-white/10"     : "bg-white border-gray-200";
  const drawerText = dark ? "text-white"                     : "text-gray-900";
  const drawerSub  = dark ? "text-slate-500"                 : "text-gray-400";
  const itemHover  = dark ? "hover:bg-white/5"               : "hover:bg-gray-50";
  const itemActive = dark ? "bg-purple-500/20 border-purple-500/30 text-white" : "bg-purple-50 border-purple-200 text-purple-700";
  const divider    = dark ? "bg-white/5"                     : "bg-gray-100";
  const footerBg   = dark ? "bg-emerald-500/10 border-emerald-500/20" : "bg-emerald-50 border-emerald-200";
  const footerText = dark ? "text-emerald-400"               : "text-emerald-600";

  return (
    <>
      {/* ══════════════════════════════
          TOP NAVBAR
      ══════════════════════════════ */}
      <nav className={`sticky top-0 z-50 border-b backdrop-blur-xl transition-colors duration-300 ${navBg}`}>
        <div className="mx-auto flex max-w-[1400px] items-center justify-between px-4 py-3">

          {/* Left — hamburger + logo */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setDrawerOpen(true)}
              className={`flex h-9 w-9 flex-col items-center justify-center gap-1.5 rounded-xl border transition ${
                dark ? "border-white/10 bg-white/5 hover:bg-white/10" : "border-gray-200 bg-gray-50 hover:bg-gray-100"
              }`}
              aria-label="Open menu"
            >
              <span className={`h-0.5 w-4 rounded-full transition ${dark ? "bg-white/70" : "bg-gray-600"}`} />
              <span className={`h-0.5 w-4 rounded-full transition ${dark ? "bg-white/70" : "bg-gray-600"}`} />
              <span className={`h-0.5 w-4 rounded-full transition ${dark ? "bg-white/70" : "bg-gray-600"}`} />
            </button>

            <Link to="/" className={`text-lg font-extrabold tracking-tight ${logoText}`}>
              Multi<span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Vid</span>AI
            </Link>

            <div className="hidden items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 sm:flex">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
              <span className="text-[10px] font-medium uppercase tracking-widest text-emerald-400">Live</span>
            </div>
          </div>

          {/* Center — desktop links */}
          <div className="hidden items-center gap-1 md:flex">
            {navLinks.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                className={`rounded-xl px-4 py-2 text-sm font-medium transition-all ${
                  pathname === l.to ? linkActive : linkBase
                }`}
              >
                {l.label}
              </Link>
            ))}
          </div>

          {/* Right — dark mode + user/auth + launch */}
          <div className="flex items-center gap-2">
            {/* Dark mode quick toggle */}
            <button
              onClick={() => setDark(!dark)}
              className={`flex h-9 w-9 items-center justify-center rounded-xl border text-base transition ${
                dark ? "border-white/10 bg-white/5 hover:bg-white/10" : "border-gray-200 bg-gray-50 hover:bg-gray-100"
              }`}
              title="Toggle dark/light mode"
            >
              {dark ? "🌙" : "☀️"}
            </button>

            {/* User avatar or Sign In button */}
            {user ? (
              <div className="relative group hidden sm:block">
                <button className={`flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-semibold transition ${
                  dark ? "border-white/10 bg-white/5 text-white" : "border-slate-200 bg-white text-slate-700 shadow-sm"
                }`}>
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-pink-500 text-xs font-black text-white">
                    {user.name?.charAt(0).toUpperCase()}
                  </div>
                  <span className="max-w-[80px] truncate">{user.name}</span>
                </button>
                {/* Dropdown */}
                <div className={`absolute right-0 top-full mt-2 w-48 rounded-2xl border p-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all ${
                  dark ? "bg-[#0a0d1a] border-white/10" : "bg-white border-slate-200 shadow-xl"
                }`}>
                  <p className={`px-3 py-2 text-xs ${dark ? "text-slate-500" : "text-slate-400"}`}>{user.email}</p>
                  <div className={`my-1 h-px ${dark ? "bg-white/5" : "bg-slate-100"}`} />
                  <button onClick={signout}
                    className={`flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold transition hover:bg-rose-500/10 text-rose-500`}>
                    Sign Out
                  </button>
                </div>
              </div>
            ) : (
              <button onClick={() => setAuthOpen(true)}
                className={`hidden rounded-xl border px-4 py-2 text-sm font-medium transition sm:block ${
                  dark ? "border-white/10 bg-white/5 text-slate-300 hover:border-white/30 hover:text-white"
                       : "border-slate-200 bg-white text-slate-600 shadow-sm hover:border-violet-300 hover:text-violet-700"
                }`}>
                Sign in
              </button>
            )}

            <Link
              to="/studio"
              className="hidden rounded-xl bg-gradient-to-r from-purple-600 to-pink-500 px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-purple-900/30 transition hover:scale-105 hover:shadow-purple-500/50 md:block"
            >
              Launch Studio →
            </Link>
          </div>
        </div>
      </nav>

      {/* ══════════════════════════════
          BACKDROP
      ══════════════════════════════ */}
      <div
        className={`fixed inset-0 z-50 transition-all duration-300 ${
          drawerOpen ? "visible bg-black/60 backdrop-blur-sm" : "invisible bg-transparent"
        }`}
        onClick={() => setDrawerOpen(false)}
      />

      {/* ══════════════════════════════
          LEFT DRAWER
      ══════════════════════════════ */}
      <div
        className={`fixed left-0 top-0 z-50 flex h-full w-[300px] flex-col border-r shadow-2xl transition-transform duration-300 ease-in-out ${drawerBg} ${
          drawerOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Header */}
        <div className={`flex items-center justify-between border-b px-5 py-4 ${dark ? "border-white/5" : "border-gray-100"}`}>
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-purple-600 to-pink-500 text-sm font-black text-white shadow-lg">
              M
            </div>
            <div>
              <p className={`font-extrabold ${drawerText}`}>MultiVidAI</p>
              <p className={`text-[10px] uppercase tracking-widest ${drawerSub}`}>Studio v2.0</p>
            </div>
          </div>
          <button
            onClick={() => setDrawerOpen(false)}
            className={`flex h-8 w-8 items-center justify-center rounded-lg border transition ${
              dark ? "border-white/10 text-slate-400 hover:border-white/30 hover:text-white"
                   : "border-gray-200 text-gray-400 hover:border-gray-300 hover:text-gray-700"
            }`}
          >
            ✕
          </button>
        </div>

        {/* Auth */}
        <div className={`border-b px-5 py-5 ${dark ? "border-white/5" : "border-gray-100"}`}>
          {user ? (
            <div className={`mb-4 flex items-center gap-3 rounded-2xl border p-3 ${dark ? "border-white/5 bg-white/[0.03]" : "border-slate-100 bg-slate-50"}`}>
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-pink-500 text-lg font-bold text-white">
                {user.name?.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <p className={`text-sm font-semibold truncate ${dark ? "text-white" : "text-slate-900"}`}>{user.name}</p>
                <p className={`text-xs truncate ${dark ? "text-slate-500" : "text-slate-400"}`}>{user.email}</p>
              </div>
              <button onClick={() => { signout(); setDrawerOpen(false); }}
                className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-2.5 py-1 text-xs font-bold text-rose-500 transition hover:bg-rose-500/20">
                Out
              </button>
            </div>
          ) : (
            <div className={`mb-4 flex items-center gap-3 rounded-2xl border p-3 ${dark ? "border-white/5 bg-white/[0.03]" : "border-gray-100 bg-gray-50"}`}>
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-pink-500 text-lg font-bold text-white">G</div>
              <div>
                <p className={`text-sm font-semibold ${dark ? "text-white" : "text-gray-900"}`}>Guest User</p>
                <p className={`text-xs ${dark ? "text-slate-500" : "text-gray-400"}`}>Not signed in</p>
              </div>
            </div>
          )}
          {!user && (
            <div className="grid grid-cols-2 gap-2 mb-4">
              <button onClick={() => { setDrawerOpen(false); setAuthOpen(true); }}
                className="rounded-xl bg-gradient-to-r from-purple-600 to-pink-500 py-2.5 text-sm font-semibold text-white shadow-lg">
                Sign In
              </button>
              <button onClick={() => { setDrawerOpen(false); setAuthOpen(true); }}
                className={`rounded-xl border py-2.5 text-sm font-semibold transition ${dark ? "border-white/10 bg-white/5 text-slate-300" : "border-slate-200 bg-white text-slate-600"}`}>
                Sign Up
              </button>
            </div>
          )}
        </div>

        {/* Nav links + quick actions */}
        <div className="flex-1 overflow-y-auto px-4 py-4">
          <p className={`mb-2 px-2 text-[10px] uppercase tracking-widest ${drawerSub}`}>Navigation</p>
          {navLinks.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className={`mb-1 flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-all border ${
                pathname === l.to ? itemActive : `border-transparent ${drawerText} ${itemHover}`
              }`}
            >
              <span className="text-base">{l.icon}</span>
              <span>{l.label}</span>
              {pathname === l.to && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-purple-400" />}
            </Link>
          ))}

          <div className={`my-4 h-px ${divider}`} />

          <p className={`mb-2 px-2 text-[10px] uppercase tracking-widest ${drawerSub}`}>Quick Actions</p>
          {[
            { icon: "🎬", label: "Start Dubbing",    to: "/studio", color: "text-purple-400" },
            { icon: "📝", label: "Transcribe Audio", to: "/studio", color: "text-blue-400"   },
            { icon: "🔊", label: "Browse Voices",    to: "/voices", color: "text-yellow-400" },
            { icon: "📖", label: "API Reference",    to: "/docs",   color: "text-emerald-400"},
          ].map((a) => (
            <Link key={a.label} to={a.to}
              className={`mb-1 flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition ${itemHover}`}>
              <span>{a.icon}</span>
              <span className={`font-medium ${a.color}`}>{a.label}</span>
            </Link>
          ))}

          <div className={`my-4 h-px ${divider}`} />

          {/* Dark mode toggle */}
          <p className={`mb-2 px-2 text-[10px] uppercase tracking-widest ${drawerSub}`}>Appearance</p>
          <div className={`flex items-center justify-between rounded-xl border px-4 py-3 ${
            dark ? "border-white/5 bg-white/[0.03]" : "border-gray-100 bg-gray-50"
          }`}>
            <div className="flex items-center gap-3">
              <span className="text-lg">{dark ? "🌙" : "☀️"}</span>
              <div>
                <p className={`text-sm font-semibold ${drawerText}`}>{dark ? "Dark Mode" : "Light Mode"}</p>
                <p className={`text-[10px] ${drawerSub}`}>Toggle appearance</p>
              </div>
            </div>
            <button
              onClick={() => setDark(!dark)}
              className={`relative h-6 w-11 rounded-full transition-colors duration-300 ${dark ? "bg-purple-600" : "bg-gray-300"}`}
            >
              <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform duration-300 ${
                dark ? "translate-x-5" : "translate-x-0.5"
              }`} />
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className={`border-t px-5 py-4 ${dark ? "border-white/5" : "border-gray-100"}`}>
          <div className={`mb-3 flex items-center gap-2 rounded-xl border px-3 py-2 ${footerBg}`}>
            <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
            <p className={`text-xs ${footerText}`}>Backend connected · port 8000</p>
          </div>
          <p className={`text-center text-[10px] ${drawerSub}`}>
            MultiVidAI v2.0 · Built with ❤️ by Saksham
          </p>
        </div>
      </div>

      {/* Auth Modal */}
      {authOpen && <AuthModal onClose={() => setAuthOpen(false)} />}
    </>
  );
}