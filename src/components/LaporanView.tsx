import React, { useMemo } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { Anggota, LINGKUNGAN_LIST } from '../types';
import { FileBarChart2, Users, PieChart as PieIcon, MapPin, Award } from 'lucide-react';

interface LaporanViewProps {
  anggotaList: Anggota[];
}

export default function LaporanView({ anggotaList }: LaporanViewProps) {
  const totalAnggota = anggotaList.length;
  
  // 1. Data representation: Gender Breakdown
  const genderData = useMemo(() => {
    const maleCount = anggotaList.filter(a => a.jenisKelamin === 'Laki-laki').length;
    const femaleCount = anggotaList.filter(a => a.jenisKelamin === 'Perempuan').length;
    return [
      { name: 'PAM Putra (Pa)', value: maleCount, color: '#3b82f6' },
      { name: 'PAM Putri (Pi)', value: femaleCount, color: '#ec4899' }
    ];
  }, [anggotaList]);

  // 2. Data representation: Neighborhood counts
  const neighborhoodData = useMemo(() => {
    return LINGKUNGAN_LIST.map(lingk => {
      // Abbreviate long names for chart readability
      const shortName = lingk.replace('LINGKUNGAN ', '');
      const count = anggotaList.filter(a => a.lingkungan === lingk).length;
      const male = anggotaList.filter(a => a.lingkungan === lingk && a.jenisKelamin === 'Laki-laki').length;
      const female = anggotaList.filter(a => a.lingkungan === lingk && a.jenisKelamin === 'Perempuan').length;
      return {
        fullName: lingk,
        name: shortName,
        'Total Anggota': count,
        'PAM Putra': male,
        'PAM Putri': female
      };
    });
  }, [anggotaList]);

  // 3. Data representation: Age Group Category
  const ageData = useMemo(() => {
    const today = new Date();
    let ageGroups = {
      'Under 18': 0,
      '18-24': 0,
      '25-30': 0,
      '31-40': 0,
      'Over 40': 0
    };

    anggotaList.forEach(item => {
      const birth = new Date(item.tanggalLahir);
      let age = today.getFullYear() - birth.getFullYear();
      const m = today.getMonth() - birth.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
        age--;
      }

      if (age < 18) ageGroups['Under 18']++;
      else if (age <= 24) ageGroups['18-24']++;
      else if (age <= 30) ageGroups['25-30']++;
      else if (age <= 40) ageGroups['31-40']++;
      else ageGroups['Over 40']++;
    });

    return Object.entries(ageGroups).map(([name, value]) => ({
      name,
      'Jumlah Anggota': value,
    }));
  }, [anggotaList]);

  const activeCount = anggotaList.filter(a => a.status === 'Aktif').length;
  const inactiveCount = anggotaList.filter(a => a.status === 'Non-aktif').length;

  return (
    <div className="space-y-6 animate-in fade-in duration-305">
      
      {/* Top statistics numbers summary */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-[#0f192b] border border-[#1b2b45] p-5 rounded-2xl">
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Total Basis Data</p>
          <div className="flex items-baseline space-x-2 mt-1">
            <span className="text-3xl font-black text-slate-100">{anggotaList.length}</span>
            <span className="text-xs text-slate-500">Anggota Terdaftar</span>
          </div>
        </div>

        <div className="bg-[#0f192b] border border-[#1b2b45] p-5 rounded-2xl">
          <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-400">Status Aktif</p>
          <div className="flex items-baseline space-x-2 mt-1">
            <span className="text-3xl font-black text-emerald-400">{activeCount}</span>
            <span className="text-xs text-slate-500">({anggotaList.length ? Math.round((activeCount / anggotaList.length) * 100) : 0}%)</span>
          </div>
        </div>

        <div className="bg-[#0f192b] border border-[#1b2b45] p-5 rounded-2xl">
          <p className="text-[10px] font-bold uppercase tracking-widest text-blue-400">PAM Pa (Putra)</p>
          <div className="flex items-baseline space-x-2 mt-1">
            <span className="text-3xl font-black text-blue-400">
              {anggotaList.filter(a => a.jenisKelamin === 'Laki-laki').length}
            </span>
            <span className="text-xs text-slate-550">Jiwa</span>
          </div>
        </div>

        <div className="bg-[#0f192b] border border-[#1b2b45] p-5 rounded-2xl">
          <p className="text-[10px] font-bold uppercase tracking-widest text-pink-400">PAM Pi (Putri)</p>
          <div className="flex items-baseline space-x-2 mt-1">
            <span className="text-3xl font-black text-pink-400">
              {anggotaList.filter(a => a.jenisKelamin === 'Perempuan').length}
            </span>
            <span className="text-xs text-slate-550">Jiwa</span>
          </div>
        </div>
      </div>

      {/* Grid: Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Chart 1: Per-Environment Stats Bar */}
        <div className="bg-[#0f192b] border border-[#1b2b45] rounded-2xl p-6 shadow-md flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-2.5 mb-6 pb-3 border-b border-[#182845]">
              <MapPin size={16} className="text-blue-400" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                Penyebaran Anggota menurut Lingkungan
              </h3>
            </div>

            <div className="h-80 w-full text-zinc-300">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart 
                  data={neighborhoodData} 
                  margin={{ top: 10, right: 10, left: -20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#1c2d47" />
                  <XAxis 
                    dataKey="name" 
                    stroke="#8a99ad" 
                    fontSize={9}
                    tickLine={false}
                  />
                  <YAxis stroke="#8a99ad" fontSize={10} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#0d1626', 
                      borderColor: '#1d2f4d',
                      borderRadius: '10px',
                      fontSize: '11px',
                    }} 
                    itemStyle={{ color: '#cbd5e1' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '10px', paddingTop: '10px' }} />
                  <Bar dataKey="PAM Putra" fill="#2563eb" stackId="a" radius={[0, 0, 0, 0]} />
                  <Bar dataKey="PAM Putri" fill="#db2777" stackId="a" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Chart 2: Gender Pie Chart & Demographics */}
        <div className="bg-[#0f192b] border border-[#1b2b45] rounded-2xl p-6 shadow-md flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-2.5 mb-6 pb-3 border-b border-[#182845]">
              <PieIcon size={16} className="text-pink-400" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                Proporsi Gender PAM Klasis Raja Ampat
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
              
              {/* Graphic Pie (5 columns) */}
              <div className="sm:col-span-6 h-64 flex justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={genderData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {genderData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#0d1626', 
                        borderColor: '#1d2f4d',
                        borderRadius: '10px',
                        fontSize: '11.5px',
                        color: '#fff'
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Data Labels (7 columns) */}
              <div className="sm:col-span-6 space-y-4">
                <div className="h-px bg-[#182845] sm:hidden" />
                
                {genderData.map((g, index) => {
                  const percentage = totalAnggota ? Math.round((g.value / totalAnggota) * 100) : 0;
                  return (
                    <div key={index} className="flex items-center justify-between p-3 rounded-xl bg-[#090f1a] border border-[#14233c]">
                      <div className="flex items-center space-x-2.5">
                        <span className="w-3 h-3 rounded-full" style={{ backgroundColor: g.color }} />
                        <span className="text-xs font-medium text-slate-300">{g.name}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-bold text-slate-100 block font-mono">{g.value} Jiwa</span>
                        <span className="text-[10px] text-slate-500 font-mono">{percentage}% dari total</span>
                      </div>
                    </div>
                  );
                })}
              </div>

            </div>
          </div>
        </div>

      </div>

      {/* Row 3: Age Demographic Breakdown BarChart */}
      <div className="grid grid-cols-1 gap-6">
        <div className="bg-[#0f192b] border border-[#1b2b45] rounded-2xl p-6 shadow-md">
          <div className="flex items-center space-x-2.5 mb-6 pb-3 border-b border-[#182845]">
            <FileBarChart2 size={16} className="text-indigo-400" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
              Analisis Usia / Demografi Anggota (Kelompok Umur)
            </h3>
          </div>

          <div className="h-72 w-full text-zinc-300">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart 
                data={ageData} 
                margin={{ top: 10, right: 10, left: -20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#1c2d47" />
                <XAxis dataKey="name" stroke="#8a99ad" fontSize={11} tickLine={false} />
                <YAxis stroke="#8a99ad" fontSize={11} tickLine={false} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#0d1626', 
                    borderColor: '#1d2f4d',
                    borderRadius: '10px',
                    fontSize: '11px',
                  }} 
                />
                <Bar dataKey="Jumlah Anggota" fill="#6366f1" radius={[6, 6, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

    </div>
  );
}
