import React, { useState, useEffect } from 'react';
import { Users, User, Info, MapPin, Database, Award, ArrowRight, Sparkles, RefreshCw } from 'lucide-react';
import { Anggota, LINGKUNGAN_LIST } from '../types';
import { motion } from 'motion/react';
import ReactMarkdown from 'react-markdown';

interface DashboardViewProps {
  anggotaList: Anggota[];
  setActiveTab: (tab: string) => void;
  setSearchFilter?: (val: string) => void;
  setGenderFilter?: (val: string) => void;
  setLingkunganFilter?: (val: string) => void;
}

export default function DashboardView({ 
  anggotaList, 
  setActiveTab,
  setSearchFilter,
  setGenderFilter,
  setLingkunganFilter
}: DashboardViewProps) {

  const [summary, setSummary] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Aggregated data for Gemini analysis
  const getStatsSummary = () => {
    const totalCount = anggotaList.length;
    const activeCount = anggotaList.filter(a => a.status === 'Aktif').length;
    const nonActiveCount = anggotaList.filter(a => a.status === 'Non-aktif').length;
    const maleCount = anggotaList.filter(a => a.jenisKelamin === 'Laki-laki').length;
    const femaleCount = anggotaList.filter(a => a.jenisKelamin === 'Perempuan').length;

    const environmentalStats = LINGKUNGAN_LIST.map(ling => {
      const filtered = anggotaList.filter(a => a.lingkungan === ling);
      return {
        nama: ling,
        total: filtered.length,
        male: filtered.filter(a => a.jenisKelamin === 'Laki-laki').length,
        female: filtered.filter(a => a.jenisKelamin === 'Perempuan').length,
        active: filtered.filter(a => a.status === 'Aktif').length,
      };
    });

    const enrollmentYears: Record<string, number> = {};
    anggotaList.forEach(a => {
      if (a.tanggalDaftar) {
        const year = a.tanggalDaftar.split('-')[0];
        enrollmentYears[year] = (enrollmentYears[year] || 0) + 1;
      }
    });

    return {
      totalCount,
      activeCount,
      nonActiveCount,
      maleCount,
      femaleCount,
      environmentalStats,
      enrollmentYears
    };
  };

  const handleGetAiSummary = async () => {
    setLoading(true);
    setError(null);
    try {
      const stats = getStatsSummary();
      const response = await fetch('/api/gemini/summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ statsSummary: stats })
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Terjadi kesalahan sistem.');
      }
      setSummary(data.text);
      localStorage.setItem('pam_ai_summary', JSON.stringify({
        anggotaCount: anggotaList.length,
        text: data.text
      }));
    } catch (err: any) {
      setError(err.message || 'Gagal memuat analisis AI.');
    } finally {
      setLoading(false);
    }
  };

  // Load cache on mount or when count of anggota changes
  useEffect(() => {
    const cachedData = localStorage.getItem('pam_ai_summary');
    if (cachedData) {
      try {
        const parsed = JSON.parse(cachedData);
        if (parsed.anggotaCount === anggotaList.length) {
          setSummary(parsed.text);
          return;
        }
      } catch (e) {
        console.error("Cache error:", e);
      }
    }
    // If not cached or count mismatch, fetch automatically
    if (anggotaList.length > 0) {
      handleGetAiSummary();
    }
  }, [anggotaList.length]);
  
  // Calculate statistics
  const totalAnggota = anggotaList.length;
  const totalLakiLaki = anggotaList.filter(a => a.jenisKelamin === 'Laki-laki' && a.status === 'Aktif').length;
  const totalPerempuan = anggotaList.filter(a => a.jenisKelamin === 'Perempuan' && a.status === 'Aktif').length;
  const totalNonAktif = anggotaList.filter(a => a.status === 'Non-aktif').length;

  // Calculate per-neighborhood counts
  const neighborhoodStats = LINGKUNGAN_LIST.map(lingkungan => {
    return {
      nama: lingkungan,
      count: anggotaList.filter(a => a.lingkungan === lingkungan).length,
      male: anggotaList.filter(a => a.lingkungan === lingkungan && a.jenisKelamin === 'Laki-laki').length,
      female: anggotaList.filter(a => a.lingkungan === lingkungan && a.jenisKelamin === 'Perempuan').length,
    };
  });

  const handleLingkunganClick = (lingkunganName: string) => {
    if (setLingkunganFilter && setSearchFilter && setGenderFilter) {
      setLingkunganFilter(lingkunganName);
      setSearchFilter('');
      setGenderFilter('Semua');
    }
    setActiveTab('data-pam');
  };

  const handleStatCardClick = (gender: 'Laki-laki' | 'Perempuan' | 'Semua') => {
    if (setGenderFilter && setSearchFilter && setLingkunganFilter) {
      setGenderFilter(gender);
      setSearchFilter('');
      setLingkunganFilter('Semua');
    }
    setActiveTab('data-pam');
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Title Section */}
      <div className="text-center md:py-4">
        <span className="text-xs uppercase font-bold text-blue-400 tracking-[0.25em] block mb-2">
          SELAMAT DATANG DI
        </span>
        <h1 className="text-2xl md:text-3xl lg:text-4xl font-extrabold text-slate-100 font-sans tracking-tight max-w-4xl mx-auto uppercase leading-tight">
          MANAJEMEN PENDATAAN PAM KLASIS RAJA AMPAT
        </h1>
        <div className="h-1 w-24 bg-gradient-to-r from-blue-500 to-indigo-500 mx-auto mt-4 rounded-full" />
      </div>

      {/* 3 Main Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Card: Total Anggota */}
        <motion.div 
          onClick={() => handleStatCardClick('Semua')}
          whileHover={{ y: -4 }}
          className="bg-[#0f192b] border border-[#1b2b45] rounded-2xl p-6 cursor-pointer flex flex-col justify-between shadow-lg shadow-black/25 relative overflow-hidden group hover:border-blue-500/40 transition-colors"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-2xl group-hover:bg-blue-500/10 transition-colors" />
          <div className="flex items-center justify-between mb-4">
            <span className="text-[10px] uppercase font-bold text-blue-400 tracking-widest flex items-center">
              <Users size={12} className="mr-1.5" /> TOTAL ANGGOTA
            </span>
            <span className="p-1 px-2.5 rounded-full bg-blue-500/10 text-blue-400 text-[10px] font-mono border border-blue-500/20">
              Aktif
            </span>
          </div>
          <div className="flex items-baseline justify-between">
            <p className="text-5xl font-black text-slate-100 font-sans tracking-tight">
              {totalAnggota}
            </p>
            <span className="text-xs text-blue-400/80 flex items-center group-hover:translate-x-1 transition-transform">
              Kelola <ArrowRight size={14} className="ml-1" />
            </span>
          </div>
        </motion.div>

        {/* Card: Laki-Laki */}
        <motion.div 
          onClick={() => handleStatCardClick('Laki-laki')}
          whileHover={{ y: -4 }}
          className="bg-[#0f192b] border border-[#1b2b45] rounded-2xl p-6 cursor-pointer flex flex-col justify-between shadow-lg shadow-black/25 relative overflow-hidden group hover:border-emerald-500/40 transition-colors"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl group-hover:bg-emerald-500/10 transition-colors" />
          <div className="flex items-center justify-between mb-4">
            <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-widest flex items-center">
              <User size={12} className="mr-1.5" /> LAKI-LAKI
            </span>
            <span className="p-1 px-2.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-mono border border-emerald-500/20">
              PAM Pa
            </span>
          </div>
          <div className="flex items-baseline justify-between">
            <p className="text-5xl font-black text-slate-100 font-sans tracking-tight">
              {totalLakiLaki}
            </p>
            <span className="text-xs text-emerald-400/80 flex items-center group-hover:translate-x-1 transition-transform">
              Filter <ArrowRight size={14} className="ml-1" />
            </span>
          </div>
        </motion.div>

        {/* Card: Perempuan */}
        <motion.div 
          onClick={() => handleStatCardClick('Perempuan')}
          whileHover={{ y: -4 }}
          className="bg-[#0f192b] border border-[#1b2b45] rounded-2xl p-6 cursor-pointer flex flex-col justify-between shadow-lg shadow-black/25 relative overflow-hidden group hover:border-purple-500/40 transition-colors"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-full blur-2xl group-hover:bg-purple-500/10 transition-colors" />
          <div className="flex items-center justify-between mb-4">
            <span className="text-[10px] uppercase font-bold text-pink-400 tracking-widest flex items-center">
              <User size={12} className="mr-1.5" /> PEREMPUAN
            </span>
            <span className="p-1 px-2.5 rounded-full bg-pink-500/10 text-pink-400 text-[10px] font-mono border border-pink-500/20">
              PAM Pi
            </span>
          </div>
          <div className="flex items-baseline justify-between">
            <p className="text-5xl font-black text-slate-100 font-sans tracking-tight">
              {totalPerempuan}
            </p>
            <span className="text-xs text-pink-400/80 flex items-center group-hover:translate-x-1 transition-transform">
              Filter <ArrowRight size={14} className="ml-1" />
            </span>
          </div>
        </motion.div>

      </div>

      {/* Gemini AI Summary Section */}
      <div className="bg-[#0f192b] border border-[#1b2b45] rounded-2xl p-6 shadow-xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-48 h-48 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex items-center justify-between pb-4 border-b border-[#182845] mb-6">
          <div className="flex items-center space-x-2.5">
            <span className="p-1.5 bg-blue-500/10 rounded-lg text-blue-400 border border-blue-500/20">
              <Sparkles size={18} className="animate-pulse" />
            </span>
            <div>
              <h3 className="text-sm font-semibold text-slate-100 tracking-wide uppercase flex items-center">
                Analisis Tren & Laporan Keanggotaan Terpadu (AI)
              </h3>
              <p className="text-[10px] text-slate-400 tracking-wide leading-relaxed">
                DIHASILKAN SECARA OTOMATIS OLEH GEMINI AI BERDASARKAN DATA ANGGOTA PAM
              </p>
            </div>
          </div>
          <button
            id="refresh-ai-summary"
            onClick={handleGetAiSummary}
            disabled={loading}
            className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-[#111c30] text-blue-300 hover:text-white border border-[#1a2b45] hover:border-blue-500/30 transition-all font-mono disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
          >
            <RefreshCw size={12} className={loading ? "animate-spin" : ""} />
            <span>{loading ? "Menganalisis..." : "Perbarui Laporan"}</span>
          </button>
        </div>

        {loading ? (
          <div className="py-12 flex flex-col items-center justify-center space-y-4 animate-pulse">
            <div className="flex space-x-1.5 items-center">
              <div className="w-2.5 h-2.5 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
              <div className="w-2.5 h-2.5 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
              <div className="w-2.5 h-2.5 bg-sky-500 rounded-full animate-bounce"></div>
            </div>
            <div className="text-center space-y-1">
              <p className="text-xs font-semibold text-slate-300">Menghubungkan asisten kecerdasan buatan...</p>
              <p className="text-[10px] text-slate-500 max-w-sm mx-auto">
                Gemini sedang membaca tren jenis kelamin, pendaftaran historis, dan kepadatan wilayah pelayanan Klasis Raja Ampat.
              </p>
            </div>
          </div>
        ) : error ? (
          <div className="py-8 text-center max-w-md mx-auto">
            <p className="text-xs text-rose-400 font-semibold mb-1">Gagal Menghasilkan Laporan AI</p>
            <p className="text-[11px] text-slate-500 mb-4">{error}</p>
            <button
              onClick={handleGetAiSummary}
              className="px-4 py-2 bg-rose-500/15 text-rose-300 border border-rose-500/30 rounded-xl text-xs font-semibold hover:bg-rose-500/25 transition-all cursor-pointer"
            >
              Coba Lagi
            </button>
          </div>
        ) : summary ? (
          <div className="text-xs text-[#d1d5db] leading-relaxed font-sans space-y-4 max-w-none">
            <div className="text-justify select-text pl-1 pr-1 bg-[#111c30]/40 p-5 border border-[#1b2b45]/60 rounded-xl">
              <ReactMarkdown 
                components={{
                  h1: ({node, ...props}) => <h1 className="text-sm md:text-base font-extrabold text-white mt-5 mb-3 border-b border-blue-500/20 pb-1.5 uppercase tracking-wide flex items-center" {...props} />,
                  h2: ({node, ...props}) => <h2 className="text-xs md:text-sm font-bold text-blue-400 mt-4 mb-2 uppercase tracking-wide" {...props} />,
                  h3: ({node, ...props}) => <h3 className="text-xs font-semibold text-slate-200 mt-3.5 mb-1 bg-[#16253f]/50 px-2 py-0.5 rounded border border-[#203352]/40 inline-block" {...props} />,
                  p: ({node, ...props}) => <p className="mb-3.5 text-slate-350 leading-relaxed font-sans" {...props} />,
                  ul: ({node, ...props}) => <ul className="list-disc pl-5 mb-4 space-y-1.5" {...props} />,
                  ol: ({node, ...props}) => <ol className="list-decimal pl-5 mb-4 space-y-1.5" {...props} />,
                  li: ({node, ...props}) => <li className="text-slate-350" {...props} />,
                  strong: ({node, ...props}) => <strong className="text-blue-300 font-extrabold" {...props} />,
                  table: ({node, ...props}) => <div className="overflow-x-auto my-4"><table className="min-w-full divide-y divide-[#1b2b45] border border-[#1b2b45] rounded-xl overflow-hidden text-[11px]" {...props} /></div>,
                  thead: ({node, ...props}) => <thead className="bg-[#111c30]" {...props} />,
                  tbody: ({node, ...props}) => <tbody className="divide-y divide-[#1b2b45]" {...props} />,
                  tr: ({node, ...props}) => <tr className="hover:bg-slate-800/10" {...props} />,
                  th: ({node, ...props}) => <th className="px-3 py-2 text-left font-bold text-slate-300" {...props} />,
                  td: ({node, ...props}) => <td className="px-3 py-2 text-slate-400 font-mono" {...props} />
                }}
              >
                {summary}
              </ReactMarkdown>
            </div>
          </div>
        ) : (
          <div className="py-8 text-center max-w-md mx-auto">
            <p className="text-xs text-slate-400 mb-3">Klik tombol di bawah ini untuk menghasilkan analisis tren keanggotaan terpadu berkekuatan kecerdasan buatan.</p>
            <button
              onClick={handleGetAiSummary}
              className="px-4 py-2 bg-blue-500/15 text-blue-300 border border-blue-500/30 hover:border-blue-500/50 rounded-xl text-xs font-bold hover:bg-blue-500/25 transition-all cursor-pointer flex items-center space-x-1.5 mx-auto"
            >
              <Sparkles size={13} />
              <span>Mulai Analisis AI</span>
            </button>
          </div>
        )}
      </div>

      {/* Bottom Layout - Two Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Statistik Per Lingkungan (7 cols) */}
        <div className="lg:col-span-7 bg-[#0f192b] border border-[#1b2b45] rounded-2xl p-6 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-2.5 pb-4 border-b border-[#182845] mb-4">
              <MapPin size={18} className="text-blue-400" />
              <h3 className="text-sm font-semibold text-slate-100 tracking-wide uppercase">
                Statistik Per Lingkungan
              </h3>
            </div>

            <div className="space-y-1">
              {neighborhoodStats.map((lingkungan, idx) => (
                <div 
                  key={idx}
                  onClick={() => handleLingkunganClick(lingkungan.nama)}
                  className="group flex items-center justify-between p-3 rounded-xl hover:bg-[#13233c] cursor-pointer transition-colors border border-transparent hover:border-blue-500/10"
                >
                  <div className="flex flex-col space-y-0.5">
                    <span className="text-[12px] font-mono font-medium text-slate-300 group-hover:text-white transition-colors">
                      {lingkungan.nama}
                    </span>
                    <span className="text-[10px] text-slate-500">
                      Pa: {lingkungan.male} • Pi: {lingkungan.female}
                    </span>
                  </div>
                  
                  {/* Badge Counter */}
                  <span className="px-3 py-1 text-xs font-bold rounded-lg bg-[#111c30] text-blue-300 border border-[#1a2b45] font-mono shadow-sm group-hover:bg-[#1b2f4f] group-hover:text-blue-100 transition-all">
                    {lingkungan.count}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <p className="text-[11px] text-slate-500 pt-4 mt-4 border-t border-[#182845] text-center font-mono">
            * Klik salah satu lingkungan di atas untuk melihat detail anggota.
          </p>
        </div>

        {/* Right Column: Tentang Web & Meta Details (5 cols) */}
        <div className="lg:col-span-5 flex flex-col space-y-6">
          
          {/* Tentang Web (exact text and footprint matching screenshot) */}
          <div className="bg-[#0f192b] border border-[#1b2b45] rounded-2xl p-6 shadow-xl flex flex-col justify-between h-full">
            <div>
              <div className="flex items-center space-x-2.5 pb-4 border-b border-[#182845] mb-4">
                <Info size={18} className="text-amber-400" />
                <h3 className="text-sm font-semibold text-slate-100 tracking-wide uppercase">
                  Tentang Web
                </h3>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed font-sans text-justify">
                Website ini dirancang untuk melakukan pengelolaan pendataan anggota PAM yang terstruktur dan terintegrasi, dengan tujuan untuk mendapatkan data yang akurat guna menunjang pelayanan pada Klasis Raja Ampat.
              </p>
            </div>

            <div className="mt-8 pt-4 border-t border-[#182845] flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Award size={16} className="text-blue-400" />
                <span className="text-[10px] text-slate-500 font-mono tracking-wider font-semibold">PROJECT PAM</span>
              </div>
              <span className="text-[11px] font-sans font-medium text-slate-400 italic">
                Dibuat Oleh : Rian F. K. Mayor, S.Kom
              </span>
            </div>
          </div>

          {/* Added quick actions cards to expand scope & function */}
          <div className="bg-gradient-to-br from-blue-950/20 to-indigo-950/20 border border-blue-900/30 rounded-2xl p-5 shadow-lg flex flex-col space-y-3.5">
            <h4 className="text-[11px] font-bold text-blue-400 tracking-widest uppercase">Aksi Cepat Manajemen</h4>
            
            <div className="grid grid-cols-2 gap-3">
              <button 
                id="quick-add-member"
                onClick={() => {
                  if (setSearchFilter && setGenderFilter && setLingkunganFilter) {
                    setSearchFilter('');
                    setGenderFilter('Semua');
                    setLingkunganFilter('Semua');
                  }
                  setActiveTab('data-pam');
                }}
                className="p-3 bg-[#0f192b] hover:bg-[#15253f] border border-[#1b2b45] rounded-xl text-left transition-all group"
              >
                <Database size={16} className="text-indigo-400 mb-2 group-hover:scale-110 transition-transform" />
                <p className="text-xs font-bold text-slate-200">Database</p>
                <p className="text-[10px] text-slate-500 mt-0.5">Kelola Anggota</p>
              </button>

              <button 
                id="quick-view-reports"
                onClick={() => setActiveTab('laporan')}
                className="p-3 bg-[#0f192b] hover:bg-[#15253f] border border-[#1b2b45] rounded-xl text-left transition-all group"
              >
                <Users size={16} className="text-emerald-400 mb-2 group-hover:scale-110 transition-transform" />
                <p className="text-xs font-bold text-slate-200">Laporan</p>
                <p className="text-[10px] text-slate-500 mt-0.5">Lihat Analisis</p>
              </button>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
