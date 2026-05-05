import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  Menu,
  X,
  LayoutDashboard,
  ListMusic,
  Users,
  Radio,
  Activity,
  Sparkles,
  LogOut,
  Music,
} from "lucide-react";

const NAV_ITEMS = [
  { path: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { path: "/tracks", label: "Top Tracks", icon: ListMusic },
  { path: "/artists", label: "Top Artists", icon: Users },
  { path: "/genres", label: "Genres", icon: Radio },
  { path: "/heatmap", label: "Heatmap", icon: Activity },
  { path: "/mood", label: "Mood Analysis", icon: Sparkles },
  { path: "/card", label: "Personality Card", icon: Music },
];

export default function Layout({ children }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const { logout } = useAuth();

  const toggleMobile = () => setMobileOpen(!mobileOpen);

  const SidebarContent = () => (
    <div className="flex flex-col h-full glass-panel-strong rounded-[28px] overflow-hidden">
      <div className="p-6 flex items-center gap-3 border-b border-white/6 bg-gradient-to-b from-white/8 to-transparent">
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-spotify to-emerald-300 flex items-center justify-center shadow-[0_12px_30px_rgba(29,185,84,0.25)]">
          <Music size={18} className="text-black" />
        </div>
        <div>
          <span className="block font-display font-bold text-lg tracking-tight text-glow">
            Soundscape
          </span>
          <span className="block text-[11px] uppercase tracking-[0.2em] text-text-muted">
            Spotify intelligence
          </span>
        </div>
      </div>

      <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map(({ path, label, icon: Icon }) => (
          <NavLink
            key={path}
            to={path}
            onClick={() => setMobileOpen(false)}
            className={({ isActive }) =>
              `group flex items-center gap-3 px-3 py-3 rounded-2xl text-sm font-medium transition-all duration-200 ${
                isActive
                  ? "bg-white/[0.10] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.10)] ring-1 ring-white/10"
                  : "text-text-secondary hover:text-white hover:bg-white/[0.05] hover:translate-x-1"
              }`
            }
          >
            <Icon
              size={18}
              className="shrink-0 opacity-80 group-hover:opacity-100"
            />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 mt-auto border-t border-white/6 bg-gradient-to-t from-black/20 to-transparent">
        <div className="flex items-center justify-between p-3 rounded-2xl bg-white/[0.04] border border-white/8 shadow-[0_16px_45px_rgba(0,0,0,0.28)]">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-white/16 to-white/6 flex items-center justify-center shrink-0 ring-1 ring-white/8">
              <Music size={14} className="text-text-muted" />
            </div>
            <div className="min-w-0">
              <span className="block text-sm font-medium truncate">
                Spotify User
              </span>
              <span className="block text-[11px] text-text-muted truncate">
                Live dashboard
              </span>
            </div>
          </div>
          <button
            onClick={logout}
            className="p-1.5 text-text-muted hover:text-white transition-colors"
            title="Logout"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="relative flex h-screen bg-bg-base text-text-primary overflow-hidden">
      <div className="orbs-layer">
        <div className="orb top-[-160px] right-[-120px] w-[420px] h-[420px] bg-accent-purple/20" />
        <div className="orb bottom-[-160px] left-[-120px] w-[360px] h-[360px] bg-spotify/14" />
        <div className="orb top-[24%] left-[8%] w-[220px] h-[220px] bg-accent-cyan/12" />
      </div>
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 glass-panel-strong z-20 flex items-center justify-between px-4 rounded-none border-x-0 border-t-0">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-spotify to-emerald-300 flex items-center justify-center shadow-[0_12px_24px_rgba(29,185,84,0.2)]">
            <Music size={14} className="text-black" />
          </div>
          <span className="font-display font-bold tracking-tight">
            Soundscape
          </span>
        </div>
        <button
          onClick={toggleMobile}
          className="p-2 text-text-secondary hover:text-white rounded-xl hover:bg-white/5 transition-colors"
        >
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Sidebar Overlay */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/60 z-30 backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:static top-4 bottom-4 left-4 w-64 z-40 transform transition-transform duration-300 ease-in-out ${
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <SidebarContent />
      </aside>

      {/* Main Content */}
      <main className="relative flex-1 overflow-y-auto lg:pt-4 pt-16 lg:pr-4 lg:pb-4">
        <div
          key={location.pathname}
          className="max-w-6xl mx-auto p-6 md:p-8 lg:p-10 page-enter min-h-full"
        >
          <div className="glass-panel rounded-[32px] p-5 md:p-8 lg:p-10 min-h-[calc(100vh-2rem)]">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
