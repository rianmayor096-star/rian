import React from 'react';
import { 
  LayoutDashboard, 
  Users, 
  FileText, 
  Download, 
  UserCog, 
  LogOut,
  Menu,
  X,
  Sparkles
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  onLogout: () => void;
}

export default function Sidebar({ 
  activeTab, 
  setActiveTab, 
  isOpen, 
  setIsOpen,
  onLogout
}: SidebarProps) {
  
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'data-pam', label: 'Data PAM', icon: Users },
    { id: 'laporan', label: 'Laporan', icon: FileText },
    { id: 'download', label: 'Download Data', icon: Download },
    { id: 'pengguna', label: 'Manajemen Pengguna', icon: UserCog },
  ];

  return (
    <>
      {/* Mobile Toggle Button */}
      <button 
        id="btn-sidebar-toggle"
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden fixed top-4 left-4 z-50 p-2 bg-[#0f192b] border border-[#1b2b45] text-blue-400 rounded-lg hover:bg-[#15253f] transition-all"
        title="Toggle Menu"
      >
        {isOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Backdrop for mobile */}
      {isOpen && (
        <div 
          id="sidebar-backdrop"
          onClick={() => setIsOpen(false)}
          className="md:hidden fixed inset-0 bg-black/60 z-30 transition-opacity"
        />
      )}

      {/* Actual Sidebar */}
      <aside 
        id="app-sidebar"
        className={`fixed md:sticky top-0 left-0 h-screen w-72 bg-[#0a0f1d] border-r border-[#15253f] flex flex-col justify-between py-6 px-4 z-40 transition-transform duration-300 transform 
          ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}
      >
        <div className="flex flex-col space-y-8">
          {/* Logo Section */}
          <div className="flex flex-col items-center text-center mt-6 md:mt-2">
            <div className="w-16 h-16 rounded-2xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center mb-3 text-blue-400 shadow-lg shadow-blue-500/5 hover:scale-105 transition-transform">
              {/* Custom SVG/Icon representing PAM / Church */}
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                className="w-10 h-10 text-blue-400"
              >
                <path d="M12 22v-9" />
                <path d="M5 13a7 7 0 0 1 14 0" />
                <path d="M12 11V3" />
                <path d="M10 4h4" />
                <path d="m11 20-3-3h8l-3 3" />
                <rect x="3" y="13" width="18" height="6" rx="1" />
              </svg>
            </div>
            
            <h1 className="text-xl font-bold font-sans tracking-wider text-slate-100">PAM</h1>
            <span className="text-xs font-semibold text-blue-400 tracking-widest mt-1">KLASIS RAJA AMPAT</span>
          </div>

          {/* Navigation Menu */}
          <nav className="flex flex-col space-y-1.5 px-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  id={`nav-item-${item.id}`}
                  onClick={() => {
                    setActiveTab(item.id);
                    setIsOpen(false); // Close on mobile navigation select
                  }}
                  className={`w-full flex items-center space-x-3.5 py-3 px-4 rounded-xl text-sm font-medium transition-all ${
                    isActive 
                      ? 'bg-[#1b2b45] text-white shadow-inner border border-blue-500/30' 
                      : 'text-slate-400 hover:text-slate-200 hover:bg-[#0f192b]'
                  }`}
                >
                  <Icon size={18} className={isActive ? 'text-blue-400' : 'text-slate-400'} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Footer/Logout Action */}
        <div className="px-2">
          <div className="pt-4 border-t border-[#121c2e] flex flex-col space-y-2">
            
            {/* Quick stats indicator */}
            <div className="flex items-center space-x-2 px-3 py-2 bg-blue-950/20 border border-blue-900/30 rounded-lg mb-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-[11px] font-mono text-slate-400">Database Offline-First</span>
            </div>

            <button
              id="nav-btn-logout"
              onClick={onLogout}
              className="w-full flex items-center space-x-3.5 py-3 px-4 rounded-xl text-sm font-medium text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-all"
            >
              <LogOut size={18} />
              <span>Keluar</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
