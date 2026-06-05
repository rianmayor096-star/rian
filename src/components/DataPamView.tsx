import React, { useState, useMemo } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  Edit2, 
  Trash2, 
  X, 
  UserCheck, 
  UserX, 
  Calendar, 
  Phone, 
  MapPin, 
  AlertCircle,
  ChevronDown
} from 'lucide-react';
import { Anggota, LINGKUNGAN_LIST } from '../types';

interface DataPamViewProps {
  anggotaList: Anggota[];
  onAddAnggota: (anggota: Omit<Anggota, 'id' | 'tanggalDaftar'>) => void;
  onEditAnggota: (anggota: Anggota) => void;
  onDeleteAnggota: (id: string) => void;
  // External filter hooks connected to the Dashboard
  searchFilter: string;
  setSearchFilter: (val: string) => void;
  genderFilter: string;
  setGenderFilter: (val: string) => void;
  lingkunganFilter: string;
  setLingkunganFilter: (val: string) => void;
}

export default function DataPamView({
  anggotaList,
  onAddAnggota,
  onEditAnggota,
  onDeleteAnggota,
  searchFilter,
  setSearchFilter,
  genderFilter,
  setGenderFilter,
  lingkunganFilter,
  setLingkunganFilter
}: DataPamViewProps) {
  
  // Local state for Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [selectedAnggota, setSelectedAnggota] = useState<Anggota | null>(null);

  // Delete confirmation modal states
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{ id: string; name: string } | null>(null);

  // Form States
  const [formData, setFormData] = useState({
    nama: '',
    jenisKelamin: 'Laki-laki' as 'Laki-laki' | 'Perempuan',
    lingkungan: LINGKUNGAN_LIST[0],
    tanggalLahir: '',
    telepon: '',
    alamat: '',
    status: 'Aktif' as 'Aktif' | 'Non-aktif'
  });

  const [formError, setFormError] = useState('');

  // Status Filter ("Semua", "Aktif", "Non-aktif")
  const [statusFilter, setStatusFilter] = useState('Semua');

  // Handle open modal for ADD
  const handleOpenAdd = () => {
    setModalMode('add');
    setSelectedAnggota(null);
    setFormData({
      nama: '',
      jenisKelamin: 'Laki-laki',
      lingkungan: LINGKUNGAN_LIST[0],
      tanggalLahir: '',
      telepon: '',
      alamat: '',
      status: 'Aktif'
    });
    setFormError('');
    setIsModalOpen(true);
  };

  // Handle open modal for EDIT
  const handleOpenEdit = (anggota: Anggota) => {
    setModalMode('edit');
    setSelectedAnggota(anggota);
    setFormData({
      nama: anggota.nama,
      jenisKelamin: anggota.jenisKelamin,
      lingkungan: anggota.lingkungan,
      tanggalLahir: anggota.tanggalLahir,
      telepon: anggota.telepon,
      alamat: anggota.alamat,
      status: anggota.status
    });
    setFormError('');
    setIsModalOpen(true);
  };

  // Submit form handles both Add/Edit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    // Validations
    if (!formData.nama.trim()) {
      setFormError('Nama lengkap wajib diisi');
      return;
    }
    if (!formData.tanggalLahir) {
      setFormError('Tanggal lahir wajib diisi');
      return;
    }

    if (modalMode === 'add') {
      onAddAnggota({
        nama: formData.nama,
        jenisKelamin: formData.jenisKelamin,
        lingkungan: formData.lingkungan,
        tanggalLahir: formData.tanggalLahir,
        telepon: formData.telepon,
        alamat: formData.alamat,
        status: formData.status
      });
    } else if (modalMode === 'edit' && selectedAnggota) {
      onEditAnggota({
        ...selectedAnggota,
        nama: formData.nama,
        jenisKelamin: formData.jenisKelamin,
        lingkungan: formData.lingkungan,
        tanggalLahir: formData.tanggalLahir,
        telepon: formData.telepon,
        alamat: formData.alamat,
        status: formData.status
      });
    }

    setIsModalOpen(false);
  };

  // Delete handler with custom confirmation window built in UI
  const handleDeleteCheck = (id: string, name: string) => {
    setItemToDelete({ id, name });
    setDeleteConfirmOpen(true);
  };

  // Filter list based on UI selections
  const filteredList = useMemo(() => {
    return anggotaList.filter(item => {
      // 1. Search Query
      const matchSearch = item.nama.toLowerCase().includes(searchFilter.toLowerCase()) || 
                          item.telepon.includes(searchFilter) ||
                          item.alamat.toLowerCase().includes(searchFilter.toLowerCase());
      
      // 2. Gender Filter
      const matchGender = genderFilter === 'Semua' || item.jenisKelamin === genderFilter;

      // 3. Lingkungan Filter
      const matchLingkungan = lingkunganFilter === 'Semua' || item.lingkungan === lingkunganFilter;

      // 4. Status Filter
      const matchStatus = statusFilter === 'Semua' || item.status === statusFilter;

      return matchSearch && matchGender && matchLingkungan && matchStatus;
    });
  }, [anggotaList, searchFilter, genderFilter, lingkunganFilter, statusFilter]);

  // Calculate age based on birthDate
  const calculateAge = (dateString: string) => {
    const today = new Date();
    const birthDate = new Date(dateString);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Search and Filters Header Section */}
      <div className="bg-[#0f192b] border border-[#1b2b45] rounded-2xl p-5 shadow-lg flex flex-col space-y-4">
        
        {/* Row 1: Search & Add button */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-1">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400">
              <Search size={18} />
            </span>
            <input 
              id="search-anggota-input"
              type="text"
              placeholder="Cari nama, telepon, atau alamat..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              className="w-full bg-[#0a0f1d] border border-[#203352] text-slate-100 placeholder-slate-500 rounded-xl pl-11 pr-4 py-2.5 text-sm focus:outline-none focus:border-blue-500 transition-colors shadow-inner"
            />
          </div>

          <button
            id="btn-add-anggota"
            onClick={handleOpenAdd}
            className="flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs uppercase tracking-wider px-5 py-3 rounded-xl transition-all shadow-md shadow-blue-500/10 active:scale-95"
            title="Tambah Anggota Baru"
          >
            <Plus size={16} />
            <span>Tambah Anggota</span>
          </button>
        </div>

        {/* Row 2: Filtering Dropdowns */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-[#182845]">
          
          {/* Lingkungan Filter */}
          <div className="flex flex-col space-y-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center">
              <Filter size={10} className="mr-1 text-blue-400" /> Lingkungan
            </label>
            <select
              id="filter-lingkungan-select"
              value={lingkunganFilter}
              onChange={(e) => setLingkunganFilter(e.target.value)}
              className="bg-[#0a0f1d] border border-[#203352] text-xs text-slate-300 rounded-xl px-3 py-2.5 focus:outline-none focus:border-blue-500 transition-colors cursor-pointer"
            >
              <option value="Semua">Semua Lingkungan</option>
              {LINGKUNGAN_LIST.map((l, index) => (
                <option key={index} value={l}>{l}</option>
              ))}
            </select>
          </div>

          {/* Gender Filter */}
          <div className="flex flex-col space-y-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center">
              <Filter size={10} className="mr-1 text-emerald-400" /> Jenis Kelamin
            </label>
            <select
              id="filter-gender-select"
              value={genderFilter}
              onChange={(e) => setGenderFilter(e.target.value)}
              className="bg-[#0a0f1d] border border-[#203352] text-xs text-slate-300 rounded-xl px-3 py-2.5 focus:outline-none focus:border-blue-500 transition-colors cursor-pointer"
            >
              <option value="Semua">Semua Gender</option>
              <option value="Laki-laki">Laki-laki (PAM Pa)</option>
              <option value="Perempuan">Perempuan (PAM Pi)</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex flex-col space-y-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center">
              <Filter size={10} className="mr-1 text-purple-400" /> Status
            </label>
            <select
              id="filter-status-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-[#0a0f1d] border border-[#203352] text-xs text-slate-300 rounded-xl px-3 py-2.5 focus:outline-none focus:border-blue-500 transition-colors cursor-pointer"
            >
              <option value="Semua">Semua Status</option>
              <option value="Aktif">Aktif</option>
              <option value="Non-aktif">Non-aktif</option>
            </select>
          </div>

        </div>

      </div>

      {/* Main Table / Data Grid Card */}
      <div className="bg-[#0f192b] border border-[#1b2b45] rounded-2xl shadow-xl overflow-hidden">
        
        {/* Table Body container with responsive horizontal scrollbars */}
        <div className="overflow-x-auto">
          {filteredList.length === 0 ? (
            <div className="py-16 text-center flex flex-col items-center justify-center">
              <div className="w-16 h-16 rounded-full bg-[#15253f] border border-[#1b2b45] flex items-center justify-center text-slate-500 mb-4 animate-pulse">
                <AlertCircle size={28} />
              </div>
              <h4 className="text-sm font-semibold text-slate-300">Tidak ada data anggota ditemukan</h4>
              <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto px-4">
                Ubah parameter pencarian atau filter Lingkungan/Gender di atas, atau klik tombol Tambah Anggota untuk menambahkan data baru.
              </p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#0a0f1d] border-b border-[#1b2b45] text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  <th className="py-4 px-6 text-center w-12">No</th>
                  <th className="py-4 px-4">Nama Lengkap</th>
                  <th className="py-4 px-4">Jenis Kelamin</th>
                  <th className="py-4 px-4 tracking-normal">Lingkungan</th>
                  <th className="py-4 px-4">Tgl Lahir / Usia</th>
                  <th className="py-4 px-4 text-center">Status</th>
                  <th className="py-4 px-6 text-center w-28">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#132139] text-xs text-slate-300">
                {filteredList.map((item, idx) => (
                  <tr 
                    key={item.id} 
                    className="hover:bg-[#13223a] transition-colors"
                  >
                    {/* Index */}
                    <td className="py-3 px-6 text-center font-mono font-bold text-slate-500">
                      {idx + 1}
                    </td>

                    {/* Nama Lengkap */}
                    <td className="py-3 px-4 font-semibold text-slate-100">
                      <div className="flex flex-col">
                        <span>{item.nama}</span>
                        {item.telepon && (
                          <span className="text-[10px] text-slate-400 font-mono flex items-center mt-0.5">
                            <Phone size={10} className="mr-1" /> {item.telepon}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Gender Badge */}
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                        item.jenisKelamin === 'Laki-laki' 
                          ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' 
                          : 'bg-pink-500/10 text-pink-400 border-pink-500/20'
                      }`}>
                        {item.jenisKelamin === 'Laki-laki' ? 'L (PAM Pa)' : 'P (PAM Pi)'}
                      </span>
                    </td>

                    {/* Neighborhood (Lingkungan) */}
                    <td className="py-3 px-4 font-mono text-[10px] max-w-[200px] truncate">
                      {item.lingkungan}
                    </td>

                    {/* BirthDate and Age calculation */}
                    <td className="py-3 px-4 font-mono text-[11px]">
                      <div className="flex flex-col">
                        <span>{item.tanggalLahir}</span>
                        <span className="text-[10px] text-indigo-400">{calculateAge(item.tanggalLahir)} Tahun</span>
                      </div>
                    </td>

                    {/* Status Toggle indicator */}
                    <td className="py-3 px-4 text-center">
                      <span className={`inline-flex items-center px-2 px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                        item.status === 'Aktif' 
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                          : 'bg-slate-500/10 text-slate-400 border-slate-500/20'
                      }`}>
                        <span className={`w-1 h-1 rounded-full mr-1.5 ${item.status === 'Aktif' ? 'bg-emerald-400' : 'bg-slate-400'}`} />
                        {item.status}
                      </span>
                    </td>

                    {/* Edit/Delete Actions */}
                    <td className="py-3 px-6 text-center">
                      <div className="flex items-center justify-center space-x-2">
                        <button
                          onClick={() => handleOpenEdit(item)}
                          className="p-1.5 text-blue-400 hover:text-white bg-[#0a0f1d] border border-[#203352] hover:bg-blue-600 rounded-lg transition-all"
                          title="Edit Anggota"
                        >
                          <Edit2 size={13} />
                        </button>
                        <button
                          onClick={() => handleDeleteCheck(item.id, item.nama)}
                          className="p-1.5 text-rose-400 hover:text-white bg-[#0a0f1d] border border-[#203352] hover:bg-rose-600 rounded-lg transition-all"
                          title="Hapus Anggota"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Footer Statistics Bar decoration */}
        <div className="bg-[#0a0f1d] px-6 py-4 border-t border-[#1b2b45] flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-400 font-mono">
          <span>Menampilkan <strong className="text-slate-200">{filteredList.length}</strong> dari <strong className="text-slate-200">{anggotaList.length}</strong> total anggota.</span>
          <div className="flex gap-4">
            <span>Aktif: <strong className="text-emerald-400">{anggotaList.filter(a => a.status === 'Aktif').length}</strong></span>
            <span>Non-aktif: <strong className="text-slate-400">{anggotaList.filter(a => a.status === 'Non-aktif').length}</strong></span>
          </div>
        </div>

      </div>

      {/* Modal: Tambah / Edit Memeber */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          
          {/* Backdrop blur */}
          <div 
            onClick={() => setIsModalOpen(false)}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity" 
          />

          <div 
            id="form-anggota-modal"
            className="relative bg-[#0d1626] border border-[#233a5c] rounded-2xl w-full max-w-xl shadow-2xl p-6 md:p-8 z-10 animate-in zoom-in-95 duration-150"
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-[#1b2b45] mb-5">
              <h3 className="text-base font-bold text-slate-100 flex items-center">
                <span className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/30 mr-2.5">
                  <UserCheck size={16} />
                </span>
                {modalMode === 'add' ? 'Tambah Anggota PAM Baru' : 'Modifikasi Data Anggota'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-[#15233c] rounded-lg transition-colors border border-transparent"
                title="Tutup"
              >
                <X size={16} />
              </button>
            </div>

            {/* Error alerts */}
            {formError && (
              <div className="bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs rounded-xl p-3 mb-5 flex items-start space-x-2">
                <AlertCircle size={16} className="mt-0.5 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            {/* Form Fields submission */}
            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Nama Lengkap */}
              <div className="flex flex-col space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  Nama Lengkap Anggota *
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Rian F. K. Mayor"
                  value={formData.nama}
                  onChange={(e) => setFormData({...formData, nama: e.target.value})}
                  className="bg-[#070b15] border border-[#203352] text-xs text-slate-100 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 transition-colors placeholder-slate-600"
                  required
                />
              </div>

              {/* Gender and Birth Date Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Gender select */}
                <div className="flex flex-col space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    Jenis Kelamin *
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setFormData({...formData, jenisKelamin: 'Laki-laki'})}
                      className={`py-2.5 rounded-xl border text-xs font-semibold uppercase tracking-wider transition-all ${
                        formData.jenisKelamin === 'Laki-laki'
                          ? 'bg-blue-600 border-blue-500 text-white shadow-md'
                          : 'bg-[#070b15] border-[#203352] text-slate-450 hover:bg-[#111c30] text-slate-400'
                      }`}
                    >
                      PAM Pa
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({...formData, jenisKelamin: 'Perempuan'})}
                      className={`py-2.5 rounded-xl border text-xs font-semibold uppercase tracking-wider transition-all ${
                        formData.jenisKelamin === 'Perempuan'
                          ? 'bg-pink-600 border-pink-500 text-white shadow-md'
                          : 'bg-[#070b15] border-[#203352] text-slate-450 hover:bg-[#111c30] text-slate-400'
                      }`}
                    >
                      PAM Pi
                    </button>
                  </div>
                </div>

                {/* Birth Date */}
                <div className="flex flex-col space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center">
                    <Calendar size={11} className="mr-1 text-slate-400" /> Tanggal Lahir *
                  </label>
                  <input
                    type="date"
                    value={formData.tanggalLahir}
                    onChange={(e) => setFormData({...formData, tanggalLahir: e.target.value})}
                    className="bg-[#070b15] border border-[#203352] text-xs text-slate-100 rounded-xl px-4 py-2.5 focus:outline-none focus:border-blue-500 transition-colors"
                    required
                  />
                </div>

              </div>

              {/* Neighborhood selection */}
              <div className="flex flex-col space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center">
                  <MapPin size={11} className="mr-1 text-slate-400" /> Lingkungan Pemilik PAM
                </label>
                <select
                  value={formData.lingkungan}
                  onChange={(e) => setFormData({...formData, lingkungan: e.target.value})}
                  className="bg-[#070b15] border border-[#203352] text-xs text-slate-300 rounded-xl px-3 py-3 focus:outline-none focus:border-blue-500 transition-colors cursor-pointer"
                >
                  {LINGKUNGAN_LIST.map((l, index) => (
                    <option key={index} value={l}>{l}</option>
                  ))}
                </select>
              </div>

              {/* Telephone Contact number */}
              <div className="flex flex-col space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center">
                  <Phone size={11} className="mr-1 text-slate-400" /> Nomor Telepon / WA (Opsional)
                </label>
                <input
                  type="text"
                  placeholder="Contoh: 081244xxxxxx"
                  value={formData.telepon}
                  onChange={(e) => setFormData({...formData, telepon: e.target.value})}
                  className="bg-[#070b15] border border-[#203352] text-xs text-slate-100 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 transition-colors placeholder-slate-650"
                />
              </div>

              {/* Physical Address */}
              <div className="flex flex-col space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  Alamat Rumah / Kampung (Opsional)
                </label>
                <textarea
                  rows={2}
                  placeholder="Contoh: Jl. Port Kotawi No.14, Kelurahan Waisai"
                  value={formData.alamat}
                  onChange={(e) => setFormData({...formData, alamat: e.target.value})}
                  className="bg-[#070b15] border border-[#203352] text-xs text-slate-100 rounded-xl px-4 py-2.5 focus:outline-none focus:border-blue-500 transition-colors resize-none placeholder-slate-650"
                />
              </div>

              {/* Status Select Switcher */}
              <div className="flex flex-col space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  Status Keanggotaan PAM
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setFormData({...formData, status: 'Aktif'})}
                    className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center transition-all ${
                      formData.status === 'Aktif'
                        ? 'bg-emerald-600/30 border-emerald-500 text-emerald-300 shadow-sm'
                        : 'bg-[#070b15] border-[#203352] text-slate-400 hover:bg-[#111c30]'
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full bg-emerald-400 mr-2 animate-pulse" />
                    Aktif
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({...formData, status: 'Non-aktif'})}
                    className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center transition-all ${
                      formData.status === 'Non-aktif'
                        ? 'bg-slate-600/30 border-slate-500 text-slate-300 shadow-sm'
                        : 'bg-[#070b15] border-[#203352] text-slate-400 hover:bg-[#111c30]'
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full bg-slate-400 mr-2" />
                    Non-aktif
                  </button>
                </div>
              </div>

              {/* Modal Actions Footer */}
              <div className="pt-4 border-t border-[#1b2b45] flex items-center justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-slate-400 hover:text-slate-200 hover:bg-[#15233c] rounded-xl transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-white bg-blue-600 hover:bg-blue-500 rounded-xl transition-all shadow-md active:scale-95"
                >
                  {modalMode === 'add' ? 'Simpan Baru' : 'Perbarui Data'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* Modal: Konfirmasi Hapus Anggota */}
      {deleteConfirmOpen && itemToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div 
            onClick={() => setDeleteConfirmOpen(false)}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity" 
          />

          <div 
            id="delete-confirmation-modal"
            className="relative bg-[#0d1626] border border-rose-500/30 rounded-2xl w-full max-w-sm shadow-2xl p-6 z-10 animate-in zoom-in-95 duration-150 text-center"
          >
            <div className="w-12 h-12 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mx-auto mb-4 animate-bounce">
              <Trash2 size={24} />
            </div>
            
            <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider mb-2">
              Konfirmasi Hapus Anggota
            </h3>
            
            <p className="text-xs text-slate-400 mb-6 leading-relaxed">
              Apakah Anda yakin ingin menghapus data anggota <strong className="text-rose-400 font-semibold">"{itemToDelete.name}"</strong>? Data yang dihapus tidak dapat dikembalikan dan akan langsung hilang dari sistem.
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
                id="btn-confirm-delete"
                onClick={() => {
                  onDeleteAnggota(itemToDelete.id);
                  setDeleteConfirmOpen(false);
                  setItemToDelete(null);
                }}
                className="flex-1 py-2 text-xs font-bold uppercase tracking-wider text-white bg-rose-600 hover:bg-rose-500 rounded-xl transition-all shadow-md active:scale-95 cursor-pointer"
              >
                Hapus Permanen
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
