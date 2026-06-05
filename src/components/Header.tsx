import React, { useState, useEffect } from 'react';
import { User, Clock, Bell, Settings, LogOut, ChevronDown, CheckCircle } from 'lucide-react';
import { Pengguna } from '../types';

interface HeaderProps {
  currentUser: Pengguna;
  users: Pengguna[];
  setCurrentUser: (user: Pengguna) => void;
  activeTitle: string;
  onLogout: () => void;
}

export default function Header({ currentUser, users, setCurrentUser, activeTitle, onLogout }: HeaderProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) + ' WIT';
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  };

  return (
    <header 
      id="app-header"
      className="bg-[#070b15] border-b border-[#121c2e] py-4 px-6 md:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 sticky top-0 z-20 shadow-md backdrop-blur-md bg-opacity-95"
    >
      {/* Page Title & Subtitle */}
      <div className="flex flex-col">
        <h2 className="text-xl font-bold font-sans tracking-tight text-white">{activeTitle}</h2>
        <p className="text-xs text-slate-400 hidden sm:block mt-1">
          {formatDate(currentTime)} • <span className="font-mono text-blue-400">{formatTime(currentTime)}</span>
        </p>
      </div>

      {/* Utilities Section */}
      <div className="flex items-center space-x-4 ml-auto sm:ml-0">
        
        {/* Administrator Dropdown Match */}
        <div className="relative">
          <button 
            id="dropdown-curr-user-btn"
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center space-x-3 bg-[#111a2e] border border-[#1d2f4d] px-4 py-2 rounded-xl text-xs font-semibold text-blue-300 hover:bg-[#182845] hover:text-white transition-all shadow-md focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></span>
            <span className="uppercase tracking-wider font-mono">
              {currentUser.peran} ({currentUser.nama.split(',')[0]}...)
            </span>
            <ChevronDown size={14} className={`transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* Quick User Switcher Menu */}
          {dropdownOpen && (
            <>
              <div 
                id="dropdown-dismiss-overlay"
                onClick={() => setDropdownOpen(false)}
                className="fixed inset-0 z-30"
              />
              <div 
                id="user-profile-dropdown"
                className="absolute right-0 mt-2.5 w-64 bg-[#0e172a] border border-[#1b2b45] rounded-xl shadow-xl py-2 z-40 animate-in fade-in slide-in-from-top-2 duration-150"
              >
                <div className="px-4 py-3 border-b border-[#15253f]">
                  <p className="text-xs text-slate-400">Masuk sebagai:</p>
                  <p className="text-sm font-semibold text-slate-100 font-sans mt-0.5">{currentUser.nama}</p>
                  <p className="text-[11px] text-slate-400 font-mono mt-0.5">{currentUser.email}</p>
                </div>
                
                <div className="py-1">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-4 py-2">Ganti Sesi Pengguna</p>
                  {users.map((user) => (
                    <button
                      key={user.id}
                      onClick={() => {
                        setCurrentUser(user);
                        setDropdownOpen(false);
                      }}
                      className="w-full text-left px-4 py-2.5 text-xs text-slate-300 hover:bg-[#182845] hover:text-blue-200 flex items-center justify-between transition-colors"
                    >
                      <div className="flex flex-col">
                        <span className="font-semibold">{user.nama.split(',')[0]}</span>
                        <span className="text-[10px] text-slate-400 font-mono">{user.peran}</span>
                      </div>
                      {user.id === currentUser.id && (
                        <CheckCircle size={14} className="text-emerald-400" />
                      )}
                    </button>
                  ))}
                </div>

                {/* Log Out Action */}
                <div className="border-t border-[#15253f] mt-1 pt-1">
                  <button
                    id="header-btn-logout"
                    onClick={() => {
                      setDropdownOpen(false);
                      onLogout();
                    }}
                    className="w-full text-left px-4 py-2.5 text-xs text-rose-450 hover:bg-rose-500/10 hover:text-rose-300 flex items-center space-x-2 transition-colors font-medium border-none cursor-pointer"
                  >
                    <LogOut size={14} className="text-rose-400" />
                    <span>Keluar Aplikasi</span>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
