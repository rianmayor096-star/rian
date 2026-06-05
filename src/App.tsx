import React, { useState, useEffect } from 'react';
import { Anggota, Pengguna } from './types';
import { INITIAL_ANGGOTA, INITIAL_PENGGUNA } from './initialData';

// Import Views
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import DashboardView from './components/DashboardView';
import DataPamView from './components/DataPamView';
import LaporanView from './components/LaporanView';
import DownloadDataView from './components/DownloadDataView';
import ManajemenPenggunaView from './components/ManajemenPenggunaView';

import { LogIn, LogOut, ShieldAlert, Church, KeyRound, Sparkles } from 'lucide-react';

export default function App() {
  // Global States
  const [anggotaList, setAnggotaList] = useState<Anggota[]>([]);
  const [users, setUsers] = useState<Pengguna[]>([]);
  const [currentUser, setCurrentUser] = useState<Pengguna | null>(null);
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);

  // Authentication Simulator State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('pam_authenticated') === 'true';
  });
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [loginError, setLoginError] = useState<string>('');
  const [logoutConfirmOpen, setLogoutConfirmOpen] = useState<boolean>(false);

  // Search & Filter cross-tab states (lets dashboard cards directly apply filters)
  const [searchFilter, setSearchFilter] = useState('');
  const [genderFilter, setGenderFilter] = useState('Semua');
  const [lingkunganFilter, setLingkunganFilter] = useState('Semua');

  // Load initial data from localStorage or fallback
  useEffect(() => {
    const savedAnggota = localStorage.getItem('pam_anggota');
    const savedUsers = localStorage.getItem('pam_pengguna');
    const savedActiveUser = localStorage.getItem('pam_active_user');

    if (savedAnggota) {
      setAnggotaList(JSON.parse(savedAnggota));
    } else {
      setAnggotaList(INITIAL_ANGGOTA);
      localStorage.setItem('pam_anggota', JSON.stringify(INITIAL_ANGGOTA));
    }

    if (savedUsers) {
      const parsedUsers = JSON.parse(savedUsers) as Pengguna[];
      setUsers(parsedUsers);
      
      if (savedActiveUser) {
        const found = parsedUsers.find(u => u.id === savedActiveUser);
        setCurrentUser(found || parsedUsers[0]);
      } else {
        setCurrentUser(parsedUsers[0]);
      }
    } else {
      setUsers(INITIAL_PENGGUNA);
      setCurrentUser(INITIAL_PENGGUNA[0]);
      localStorage.setItem('pam_pengguna', JSON.stringify(INITIAL_PENGGUNA));
      localStorage.setItem('pam_active_user', INITIAL_PENGGUNA[0].id);
    }
  }, []);

  // Sync state helpers
  const saveAnggota = (newList: Anggota[]) => {
    setAnggotaList(newList);
    localStorage.setItem('pam_anggota', JSON.stringify(newList));
  };

  const saveUsers = (newList: Pengguna[]) => {
    setUsers(newList);
    localStorage.setItem('pam_pengguna', JSON.stringify(newList));
  };

  // Switch current active user
  const handleSetCurrentUser = (user: Pengguna) => {
    setCurrentUser(user);
    localStorage.setItem('pam_active_user', user.id);
  };

  // CRUD Operation Handlers
  const handleAddAnggota = (newAnggotaData: Omit<Anggota, 'id' | 'tanggalDaftar'>) => {
    const freshId = Date.now().toString();
    const freshDate = new Date().toISOString().slice(0, 10);
    const item: Anggota = {
      ...newAnggotaData,
      id: freshId,
      tanggalDaftar: freshDate,
    };
    const updated = [item, ...anggotaList];
    saveAnggota(updated);
  };

  const handleEditAnggota = (updatedAnggota: Anggota) => {
    const updated = anggotaList.map(a => a.id === updatedAnggota.id ? updatedAnggota : a);
    saveAnggota(updated);
  };

  const handleDeleteAnggota = (id: string) => {
    const updated = anggotaList.filter(a => a.id !== id);
    saveAnggota(updated);
  };

  const handleAddUser = (newUserData: Omit<Pengguna, 'id'>) => {
    const freshId = 'u_' + Date.now().toString();
    const item: Pengguna = {
      ...newUserData,
      id: freshId,
    };
    const updated = [...users, item];
    saveUsers(updated);
  };

  const handleDeleteUser = (id: string) => {
    const updated = users.filter(u => u.id !== id);
    saveUsers(updated);
  };

  const handleResetDatabase = () => {
    setAnggotaList(INITIAL_ANGGOTA);
    setUsers(INITIAL_PENGGUNA);
    setCurrentUser(INITIAL_PENGGUNA[0]);
    localStorage.setItem('pam_anggota', JSON.stringify(INITIAL_ANGGOTA));
    localStorage.setItem('pam_pengguna', JSON.stringify(INITIAL_PENGGUNA));
    localStorage.setItem('pam_active_user', INITIAL_PENGGUNA[0].id);
  };

  // Simulated Login Screen helper logic
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    const trimmedUsername = username.trim().toLowerCase();
    const trimmedPassword = password.trim();

    // Check from users state
    const matchedUser = users.find(u => {
      const basicUsername = u.nama.split(' ')[0].toLowerCase().replace(/[^a-z0-9]/g, '');
      const userEmailPrefix = u.email.split('@')[0].toLowerCase();
      
      return (
        trimmedUsername === basicUsername || 
        trimmedUsername === u.email.toLowerCase() || 
        trimmedUsername === userEmailPrefix ||
        (trimmedUsername === 'admin' && u.peran === 'Administrator')
      );
    });

    if (
      (trimmedUsername === 'admin' && (trimmedPassword === 'admin' || trimmedPassword === '1234')) ||
      (matchedUser && matchedUser.status === 'Aktif' && (trimmedPassword === 'admin' || trimmedPassword === '1234' || trimmedPassword === 'operator'))
    ) {
      if (matchedUser) {
        setCurrentUser(matchedUser);
        localStorage.setItem('pam_active_user', matchedUser.id);
      } else {
        const firstAdmin = users.find(u => u.peran === 'Administrator') || users[0];
        setCurrentUser(firstAdmin);
        localStorage.setItem('pam_active_user', firstAdmin.id);
      }
      
      setIsAuthenticated(true);
      localStorage.setItem('pam_authenticated', 'true');
      setUsername('');
      setPassword('');
    } else {
      const disabledUser = users.find(u => u.email.toLowerCase() === trimmedUsername || u.nama.split(' ')[0].toLowerCase().replace(/[^a-z0-9]/g, '') === trimmedUsername);
      if (disabledUser && disabledUser.status === 'Non-aktif') {
        setLoginError('Akun Anda dinonaktifkan oleh Administrator. Silakan hubungi admin.');
      } else {
        setLoginError('Username atau Password salah. Gunakan username "admin" & password "admin".');
      }
    }
  };

  const handleLogout = () => {
    setLogoutConfirmOpen(true);
  };

  const handleConfirmLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('pam_authenticated');
    setLogoutConfirmOpen(false);
  };

  // Get active tab label
  const getActiveTabTitle = () => {
    switch (activeTab) {
      case 'dashboard': return 'Beranda Dashboard';
      case 'data-pam': return 'Manajemen Data Anggota PAM';
      case 'laporan': return 'Analisis Grafis & Laporan';
      case 'download': return 'Ekspor Hasil Pendataan';
      case 'pengguna': return 'Manajemen Hak Akses Sistem';
      default: return 'PAM Klasis Raja Ampat';
    }
  };

  // Render correct view block
  const renderActiveView = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <DashboardView 
            anggotaList={anggotaList} 
            setActiveTab={setActiveTab}
            setSearchFilter={setSearchFilter}
            setGenderFilter={setGenderFilter}
            setLingkunganFilter={setLingkunganFilter}
          />
        );
      case 'data-pam':
        return (
          <DataPamView 
            anggotaList={anggotaList}
            onAddAnggota={handleAddAnggota}
            onEditAnggota={handleEditAnggota}
            onDeleteAnggota={handleDeleteAnggota}
            searchFilter={searchFilter}
            setSearchFilter={setSearchFilter}
            genderFilter={genderFilter}
            setGenderFilter={setGenderFilter}
            lingkunganFilter={lingkunganFilter}
            setLingkunganFilter={setLingkunganFilter}
          />
        );
      case 'laporan':
        return <LaporanView anggotaList={anggotaList} />;
      case 'download':
        return (
          <DownloadDataView 
            anggotaList={anggotaList} 
            onImportAnggotaList={saveAnggota} 
          />
        );
      case 'pengguna':
        return (
          <ManajemenPenggunaView 
            users={users}
            currentUser={currentUser || INITIAL_PENGGUNA[0]}
            onAddUser={handleAddUser}
            onDeleteUser={handleDeleteUser}
            onResetDatabase={handleResetDatabase}
          />
        );
      default:
        return (
          <DashboardView 
            anggotaList={anggotaList} 
            setActiveTab={setActiveTab} 
          />
        );
    }
  };

  // Unauthenticated screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#02050e] font-sans text-slate-200 flex items-center justify-center relative overflow-hidden px-4">
        
        {/* Main Card */}
        <div className="w-full max-w-[430px] bg-[#070b15] border border-slate-900/80 rounded-[28px] p-8 md:p-12 shadow-2xl relative">
          
          <div className="w-16 h-16 rounded-[22px] bg-[#0c1626] border border-blue-500/20 flex items-center justify-center text-blue-400 mx-auto mb-6">
            <Church size={28} className="text-blue-500" />
          </div>

          <div className="text-center mb-8">
            <h2 className="text-2.5xl font-bold text-white tracking-wide">Selamat Datang</h2>
            <p className="text-xs text-slate-400 mt-1.5">
              Silakan masuk ke akun PAM Anda
            </p>
          </div>

          {/* Error handling */}
          {loginError && (
            <div className="bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs rounded-xl p-3 mb-5 flex items-start space-x-2 text-left">
              <ShieldAlert size={16} className="mt-0.5 shrink-0 text-rose-400" />
              <span>{loginError}</span>
            </div>
          )}

          <form onSubmit={handleLoginSubmit} className="space-y-5 text-left">
            <div className="flex flex-col space-y-2">
              <label className="text-xs font-semibold text-slate-400">Username</label>
              <input
                type="text"
                placeholder="Masukkan username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-[#0d1424] border border-slate-800/80 focus:border-blue-500/50 text-slate-100 rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500/30 transition-all placeholder:text-slate-600"
                autoFocus
                required
              />
            </div>

            <div className="flex flex-col space-y-2">
              <label className="text-xs font-semibold text-slate-400">Password</label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#0d1424] border border-slate-800/80 focus:border-blue-500/50 text-slate-100 rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500/30 transition-all placeholder:text-slate-650 font-sans tracking-widest-sm"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full flex items-center justify-center space-x-2.5 bg-[#2563eb] hover:bg-blue-600 text-white font-bold text-sm tracking-wide py-3.5 rounded-xl transition-all shadow-lg active:scale-[0.98] cursor-pointer mt-2"
            >
              <LogIn size={16} />
              <span>Masuk Sekarang</span>
            </button>
          </form>

          {/* Centered copyright notice inside the card at the bottom */}
          <div className="mt-11 text-center">
            <span className="text-[10px] font-mono tracking-widest text-slate-600 uppercase font-semibold">
              © 2026 KLASIS RAJA AMPAT
            </span>
          </div>

        </div>
      </div>
    );
  }

  // Authenticated screen
  return (
    <div className="min-h-screen bg-[#070b15] font-sans text-slate-200 flex flex-col md:flex-row">
      
      {/* Navigation sidebar */}
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab}
        isOpen={sidebarOpen}
        setIsOpen={setSidebarOpen}
        onLogout={handleLogout}
      />

      {/* Main Panel Content container */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        
        {/* Top-bar Navigation Header */}
        <Header 
          currentUser={currentUser || INITIAL_PENGGUNA[0]}
          users={users}
          setCurrentUser={handleSetCurrentUser}
          activeTitle={getActiveTabTitle()}
          onLogout={handleLogout}
        />

        {/* Outer scrolling content body */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 max-w-7xl mx-auto w-full">
          {renderActiveView()}
        </main>

        {/* Footer signatures */}
        <footer className="py-5 text-center border-t border-[#121c2e]/60 max-w-7xl mx-auto w-full text-[11px] text-slate-500 hidden md:block">
          © {new Date().getFullYear()} PAM Klasis Raja Ampat • Dibuat Oleh : <strong className="text-slate-400">Rian F. K. Mayor, S.Kom</strong>
        </footer>
      </div>

      {/* Modal: Konfirmasi Keluar/Logout */}
      {logoutConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div 
            onClick={() => setLogoutConfirmOpen(false)}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity" 
          />

          <div 
            id="logout-confirmation-modal"
            className="relative bg-[#0d1626] border border-rose-500/30 rounded-2xl w-full max-w-sm shadow-2xl p-6 z-10 animate-in zoom-in-95 duration-150 text-center"
          >
            <div className="w-12 h-12 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mx-auto mb-4 animate-bounce">
              <LogOut size={24} />
            </div>
            
            <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider mb-2">
              Konfirmasi Keluar Sesi
            </h3>
            
            <p className="text-xs text-slate-400 mb-6 leading-relaxed">
              Apakah Anda yakin ingin keluar dari sesi administrasi saat ini? Anda harus memasukkan kembali kredensial Anda untuk masuk kembali.
            </p>

            <div className="flex items-center justify-center space-x-3">
              <button
                type="button"
                onClick={() => setLogoutConfirmOpen(false)}
                className="flex-1 py-2 text-xs font-bold uppercase tracking-wider text-slate-400 hover:text-slate-200 hover:bg-[#15233c] rounded-xl transition-colors border border-[#203352]"
              >
                Batal
              </button>
              <button
                type="button"
                id="btn-confirm-logout"
                onClick={handleConfirmLogout}
                className="flex-1 py-2 text-xs font-bold uppercase tracking-wider text-white bg-rose-600 hover:bg-rose-500 rounded-xl transition-all shadow-md active:scale-95 cursor-pointer"
              >
                Keluar Sesi
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
