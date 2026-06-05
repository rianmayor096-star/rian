import React, { useState } from 'react';
import { UserCog, Plus, Shield, Mail, Trash2, CheckCircle2, User, RefreshCw, AlertCircle, Database } from 'lucide-react';
import { Pengguna } from '../types';

interface UserManagementProps {
  users: Pengguna[];
  currentUser: Pengguna;
  onAddUser: (user: Omit<Pengguna, 'id'>) => void;
  onDeleteUser: (id: string) => void;
  onResetDatabase: () => void;
}

export default function ManajemenPenggunaView({
  users,
  currentUser,
  onAddUser,
  onDeleteUser,
  onResetDatabase
}: UserManagementProps) {
  
  const [formData, setFormData] = useState({
    nama: '',
    email: '',
    peran: 'Operator' as 'Administrator' | 'Operator',
    status: 'Aktif' as 'Aktif' | 'Non-aktif'
  });

  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Custom modal triggers
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<{ id: string; name: string } | null>(null);
  const [selfDeleteAlertOpen, setSelfDeleteAlertOpen] = useState(false);
  const [resetConfirmOpen, setResetConfirmOpen] = useState(false);
  const [resetSuccessOpen, setResetSuccessOpen] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!formData.nama.trim()) {
      setErrorMsg('Nama lengkap wajib diisi.');
      return;
    }

    if (!formData.email.trim() || !formData.email.includes('@')) {
      setErrorMsg('Email yang valid wajib diisi.');
      return;
    }

    onAddUser({
      nama: formData.nama,
      email: formData.email,
      peran: formData.peran,
      status: formData.status
    });

    setFormData({
      nama: '',
      email: '',
      peran: 'Operator',
      status: 'Aktif'
    });

    setSuccessMsg('Pengguna sistem berhasil ditambahkan.');
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  const handleDeleteCheck = (id: string, name: string) => {
    if (id === currentUser.id) {
      setSelfDeleteAlertOpen(true);
      return;
    }
    setUserToDelete({ id, name });
    setDeleteConfirmOpen(true);
  };

  const handleResetCheck = () => {
    setResetConfirmOpen(true);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Upper Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Left Column: Create New User Form */}
        <div className="bg-[#0f192b] border border-[#1b2b45] rounded-2xl p-6 shadow-md flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-2.5 pb-4 border-b border-[#182845] mb-5">
              <UserCog size={18} className="text-blue-400" />
              <h3 className="text-sm font-semibold text-slate-100 uppercase tracking-wider">
                Daftarkan Pengguna / Operator Baru
              </h3>
            </div>

            {errorMsg && (
              <div className="bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs rounded-xl p-3.5 mb-4 flex items-center space-x-2">
                <AlertCircle size={15} />
                <span>{errorMsg}</span>
              </div>
            )}

            {successMsg && (
              <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs rounded-xl p-3.5 mb-4 flex items-center space-x-2">
                <CheckCircle2 size={15} />
                <span>{successMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Nama */}
              <div className="flex flex-col space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  Nama Lengkap Operator *
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Sarah Mayor, S.Sos"
                  value={formData.nama}
                  onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                  className="bg-[#070b15] border border-[#203352] text-xs text-slate-100 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 transition-colors placeholder-slate-650"
                  required
                />
              </div>

              {/* Email Address */}
              <div className="flex flex-col space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center">
                  <Mail size={11} className="mr-1 text-slate-450" /> Alamat Email *
                </label>
                <input
                  type="email"
                  placeholder="operator@domain.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="bg-[#070b15] border border-[#203352] text-xs text-slate-100 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 transition-colors placeholder-slate-650"
                  required
                />
              </div>

              {/* Peran / Role select toggle */}
              <div className="grid grid-cols-2 gap-4">
                
                <div className="flex flex-col space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    Hak Akses Peran *
                  </label>
                  <select
                    value={formData.peran}
                    onChange={(e) => setFormData({ ...formData, peran: e.target.value as any })}
                    className="bg-[#070b15] border border-[#203352] text-xs text-slate-300 rounded-xl px-3 py-2.5 focus:outline-none focus:border-blue-500 cursor-pointer"
                  >
                    <option value="Operator">Operator PAM</option>
                    <option value="Administrator">Administrator Utama</option>
                  </select>
                </div>

                <div className="flex flex-col space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    Status Akun *
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="bg-[#070b15] border border-[#203352] text-xs text-slate-300 rounded-xl px-3 py-2.5 focus:outline-none focus:border-blue-500 cursor-pointer"
                  >
                    <option value="Aktif">Aktif</option>
                    <option value="Non-aktif">Non-aktif/Blokir</option>
                  </select>
                </div>

              </div>

              {/* Submit button */}
              <div className="pt-4">
                <button
                  type="submit"
                  className="w-full flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs uppercase tracking-wider py-3 rounded-xl transition-all shadow-md active:scale-95"
                >
                  <Plus size={15} />
                  <span>Daftarkan Operator</span>
                </button>
              </div>

            </form>
          </div>
        </div>

        {/* Right Column: User list & Permissions */}
        <div className="bg-[#0f192b] border border-[#1b2b45] rounded-2xl p-6 shadow-md flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-2.5 pb-4 border-b border-[#182845] mb-5">
              <Shield size={18} className="text-emerald-400" />
              <h3 className="text-sm font-semibold text-slate-100 uppercase tracking-wider">
                Daftar Akun Pengguna Sistem
              </h3>
            </div>

            <div className="space-y-3.5 max-h-96 overflow-y-auto pr-1">
              {users.map((u) => {
                const isActiveSession = u.id === currentUser.id;
                return (
                  <div 
                    key={u.id}
                    className={`p-4 rounded-xl border flex items-center justify-between transition-colors ${
                      isActiveSession 
                        ? 'bg-blue-950/20 border-blue-500/30' 
                        : 'bg-[#0a0f1d] border-[#1d2f4d]'
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <div className={`p-2 rounded-lg ${isActiveSession ? 'bg-blue-500/10 text-blue-400' : 'bg-slate-800/40 text-slate-500'}`}>
                        <User size={18} />
                      </div>
                      
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-white flex items-center">
                          {u.nama}
                          {isActiveSession && (
                            <span className="ml-2 px-1.5 py-0.5 rounded bg-blue-500/20 text-[8px] font-bold text-blue-400 uppercase tracking-widest animate-pulse">
                              Sesi Anda
                            </span>
                          )}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono mt-0.5">{u.email}</span>
                        <div className="flex items-center space-x-2 mt-1.5">
                          <span className="px-2 py-0.5 rounded bg-[#101b2f] text-[9px] font-mono font-bold text-slate-350 border border-[#1e304f]">
                            {u.peran}
                          </span>
                          <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                            u.status === 'Aktif' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-500/10 text-slate-400'
                          }`}>
                            {u.status}
                          </span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => handleDeleteCheck(u.id, u.nama)}
                      disabled={isActiveSession}
                      className={`p-1.5 rounded-lg border transition-colors ${
                        isActiveSession 
                          ? 'opacity-40 cursor-not-allowed border-[#1d2f4d] text-slate-600' 
                          : 'border-[#203352] text-rose-400 hover:bg-rose-600 hover:text-white'
                      }`}
                      title="Hapus Hak Akses"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

      </div>

      {/* Diagnostic & Reset Database Utility Panel */}
      <div className="bg-[#0f192b] border border-[#1b2b45] rounded-2xl p-6 shadow-md">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-start space-x-3.5">
            <div className="p-3 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-xl shrink-0">
              <Database size={20} />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-100 uppercase tracking-wider">Glosarium Pemulihan & Organisasi Basis Data</h4>
              <p className="text-[11px] text-slate-400 mt-1 max-w-2xl leading-relaxed">
                Pemulihan data akan menghapus semua records data anggota, lingkungan, dan pengguna kustom yang Anda buat sebelumnya, lalu memulihkannya ke format data awal demonstrasi (seperti profil <strong>Rian F. K. Mayor, S.Kom</strong>).
              </p>
            </div>
          </div>

          <button
            id="btn-reset-database"
            onClick={handleResetCheck}
            className="flex items-center space-x-2 bg-gradient-to-r from-amber-600 to-red-600 hover:from-amber-500 hover:to-red-500 text-white font-bold text-[10px] uppercase tracking-widest px-5 py-3.5 rounded-xl transition-all shadow-md active:scale-95 whitespace-nowrap"
          >
            <RefreshCw size={12} className="animate-spin-slow" />
            <span>Kembalikan Data Awal</span>
          </button>
        </div>
      </div>

      {/* Modal: Self Delete Warning */}
      {selfDeleteAlertOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            onClick={() => setSelfDeleteAlertOpen(false)}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity" 
          />
          <div className="relative bg-[#0d1626] border border-amber-500/30 rounded-2xl w-full max-w-sm shadow-2xl p-6 z-10 animate-in zoom-in-95 duration-150 text-center">
            <div className="w-12 h-12 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mx-auto mb-4">
              <AlertCircle size={24} />
            </div>
            
            <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider mb-2">
              Tindakan Ditolak
            </h3>
            
            <p className="text-xs text-slate-400 mb-6 leading-relaxed">
              Anda tidak bisa menghapus akun Anda sendiri yang sedang aktif digunakan saat ini.
            </p>

            <button
              onClick={() => setSelfDeleteAlertOpen(false)}
              className="w-full py-2.5 text-xs font-bold uppercase tracking-wider text-white bg-amber-600 hover:bg-amber-500 rounded-xl transition-all shadow-md cursor-pointer"
            >
              Mengerti
            </button>
          </div>
        </div>
      )}

      {/* Modal: Confirm Delete User */}
      {deleteConfirmOpen && userToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            onClick={() => setDeleteConfirmOpen(false)}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity" 
          />
          <div className="relative bg-[#0d1626] border border-rose-500/30 rounded-2xl w-full max-w-sm shadow-2xl p-6 z-10 animate-in zoom-in-95 duration-150 text-center">
            <div className="w-12 h-12 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mx-auto mb-4 animate-bounce">
              <Trash2 size={24} />
            </div>
            
            <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider mb-2">
              Hapus Akses Pengguna
            </h3>
            
            <p className="text-xs text-slate-400 mb-6 leading-relaxed">
              Apakah Anda yakin ingin menghapus hak akses pengguna <strong className="text-rose-400 font-semibold">"{userToDelete.name}"</strong>? Pengguna tersebut tidak akan bisa menavigasi platform lagi.
            </p>

            <div className="flex items-center justify-center space-x-3">
              <button
                type="button"
                onClick={() => setDeleteConfirmOpen(false)}
                className="flex-1 py-2 text-xs font-bold uppercase tracking-wider text-slate-400 hover:text-slate-200 hover:bg-[#15233c] rounded-xl transition-colors border border-[#203352]"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => {
                  onDeleteUser(userToDelete.id);
                  setDeleteConfirmOpen(false);
                  setUserToDelete(null);
                }}
                className="flex-1 py-2 text-xs font-bold uppercase tracking-wider text-white bg-rose-600 hover:bg-rose-500 rounded-xl transition-all shadow-md active:scale-95 cursor-pointer"
              >
                Hapus Akses
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Confirm Reset Database */}
      {resetConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            onClick={() => setResetConfirmOpen(false)}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity" 
          />
          <div className="relative bg-[#0d1626] border border-amber-500/30 rounded-2xl w-full max-w-sm shadow-2xl p-6 z-10 animate-in zoom-in-95 duration-150 text-center">
            <div className="w-12 h-12 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mx-auto mb-4">
              <RefreshCw size={24} className="animate-spin-slow text-amber-400" />
            </div>
            
            <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider mb-2">
              Konfirmasi Pemulihan Database
            </h3>
            
            <p className="text-xs text-slate-400 mb-6 leading-relaxed">
              Apakah Anda yakin ingin mereset seluruh database PAM? Semua data kustom akan dihapus dan dikembalikan ke data percobaan default.
            </p>

            <div className="flex items-center justify-center space-x-3">
              <button
                type="button"
                onClick={() => setResetConfirmOpen(false)}
                className="flex-1 py-2 text-xs font-bold uppercase tracking-wider text-slate-400 hover:text-slate-200 hover:bg-[#15233c] rounded-xl transition-colors border border-[#203352]"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => {
                  onResetDatabase();
                  setResetConfirmOpen(false);
                  setResetSuccessOpen(true);
                }}
                className="flex-1 py-2 text-xs font-bold uppercase tracking-wider text-white bg-amber-600 hover:bg-amber-500 rounded-xl transition-all shadow-md active:scale-95 cursor-pointer"
              >
                Reset Sekarang
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Reset Success */}
      {resetSuccessOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            onClick={() => setResetSuccessOpen(false)}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity" 
          />
          <div className="relative bg-[#0d1626] border border-emerald-500/30 rounded-2xl w-full max-w-sm shadow-2xl p-6 z-10 animate-in zoom-in-95 duration-150 text-center">
            <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 size={24} />
            </div>
            
            <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider mb-2">
              Database Berhasil Direset
            </h3>
            
            <p className="text-xs text-slate-400 mb-6 leading-relaxed">
              Database PAM telah berhasil dipulihkan ke data default!
            </p>

            <button
              onClick={() => setResetSuccessOpen(false)}
              className="w-full py-2.5 text-xs font-bold uppercase tracking-wider text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl transition-all shadow-md cursor-pointer"
            >
              Tutup
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
