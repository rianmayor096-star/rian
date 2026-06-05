import React, { useState, useMemo } from 'react';
import { 
  Download, 
  FileSpreadsheet, 
  FileJson, 
  Check, 
  Sliders, 
  Eye, 
  Table, 
  Cloud, 
  RefreshCw, 
  Loader2, 
  Link as LinkIcon, 
  ShieldCheck, 
  AlertTriangle, 
  Lock, 
  Info,
  Database
} from 'lucide-react';
import { Anggota, LINGKUNGAN_LIST } from '../types';

interface DownloadDataViewProps {
  anggotaList: Anggota[];
  onImportAnggotaList?: (anggotaList: Anggota[]) => void;
}

export default function DownloadDataView({ 
  anggotaList, 
  onImportAnggotaList 
}: DownloadDataViewProps) {
  // Navigation tab states
  const [activeTab, setActiveTab] = useState<'manual' | 'google-sheets'>('manual');

  // Manual Download States
  const [format, setFormat] = useState<'csv' | 'json'>('csv');
  const [exportLingkungan, setExportLingkungan] = useState<string>('Semua');
  const [exportGender, setExportGender] = useState<string>('Semua');
  const [exportStatus, setExportStatus] = useState<string>('Semua');

  // Columns selector checkbox states
  const [columns, setColumns] = useState({
    id: true,
    nama: true,
    jenisKelamin: true,
    lingkungan: true,
    tanggalLahir: true,
    telepon: true,
    alamat: true,
    status: true,
    tanggalDaftar: false,
  });

  // Google Sheets Cloud Integration States
  const [googleToken, setGoogleToken] = useState<string>('');
  const [googleEmail, setGoogleEmail] = useState<string>('');
  const [googleName, setGoogleName] = useState<string>('');
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [isConnecting, setIsConnecting] = useState<boolean>(false);
  const [showTokenInput, setShowTokenInput] = useState<boolean>(false);

  // Sheet file parameters (defaults)
  const [sheetId, setSheetId] = useState<string>('1BxiMVs0XRA5nFMdKv1a6mxaE36xArp8r2zS3wK1-m_l');
  const [sheetRange, setSheetRange] = useState<string>('Data_PAM!A1:I500');
  const [exportRange, setExportRange] = useState<string>('Data_PAM');

  // Async task loads
  const [isLoadingSheets, setIsLoadingSheets] = useState<boolean>(false);
  const [sheetsError, setSheetsError] = useState<string>('');
  const [sheetsSuccess, setSheetsSuccess] = useState<string>('');

  // Sync Import Map States
  const [importedRows, setImportedRows] = useState<any[]>([]);
  const [mappedRows, setMappedRows] = useState<Anggota[]>([]);
  const [showImportPreview, setShowImportPreview] = useState<boolean>(false);
  const [selectedImportIds, setSelectedImportIds] = useState<Record<string, boolean>>({});
  const [matchCriteria, setMatchCriteria] = useState<'nama' | 'id'>('nama');

  const handleToggleColumn = (col: keyof typeof columns) => {
    setColumns(prev => ({ ...prev, [col]: !prev[col] }));
  };

  // Filter list for local preview/export
  const filteredList = useMemo(() => {
    return anggotaList.filter(item => {
      const matchGender = exportGender === 'Semua' || item.jenisKelamin === exportGender;
      const matchLingkungan = exportLingkungan === 'Semua' || item.lingkungan === exportLingkungan;
      const matchStatus = exportStatus === 'Semua' || item.status === exportStatus;
      return matchGender && matchLingkungan && matchStatus;
    });
  }, [anggotaList, exportLingkungan, exportGender, exportStatus]);

  // Generate File & Trigger Local Download (CSV/JSON)
  const handleExport = () => {
    if (filteredList.length === 0) {
      alert('Tidak ada data anggota untuk diekspor.');
      return;
    }

    const todayStr = new Date().toISOString().slice(0, 10);
    const fileName = `PAM_Klasis_Raja_Ampat_${todayStr}`;

    if (format === 'json') {
      const jsonContent = filteredList.map(item => {
        const obj: any = {};
        if (columns.id) obj['ID'] = item.id;
        if (columns.nama) obj['Nama Lengkap'] = item.nama;
        if (columns.jenisKelamin) obj['Jenis Kelamin'] = item.jenisKelamin;
        if (columns.lingkungan) obj['Lingkungan'] = item.lingkungan;
        if (columns.tanggalLahir) obj['Tanggal Lahir'] = item.tanggalLahir;
        if (columns.telepon) obj['Telepon'] = item.telepon;
        if (columns.alamat) obj['Alamat'] = item.alamat;
        if (columns.status) obj['Status'] = item.status;
        if (columns.tanggalDaftar) obj['Tanggal Terdaftar'] = item.tanggalDaftar;
        return obj;
      });

      const blob = new Blob([JSON.stringify(jsonContent, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${fileName}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } else {
      const headersArr: string[] = [];
      if (columns.id) headersArr.push('ID');
      if (columns.nama) headersArr.push('Nama Lengkap');
      if (columns.jenisKelamin) headersArr.push('Jenis Kelamin');
      if (columns.lingkungan) headersArr.push('Lingkungan');
      if (columns.tanggalLahir) headersArr.push('Tanggal Lahir');
      if (columns.telepon) headersArr.push('Telepon');
      if (columns.alamat) headersArr.push('Alamat');
      if (columns.status) headersArr.push('Status');
      if (columns.tanggalDaftar) headersArr.push('Tanggal Terdaftar');

      const csvRows = [headersArr.join(',')];

      filteredList.forEach(item => {
        const rowArr: string[] = [];
        const esc = (val: string) => `"${val.replace(/"/g, '""')}"`;

        if (columns.id) rowArr.push(esc(item.id));
        if (columns.nama) rowArr.push(esc(item.nama));
        if (columns.jenisKelamin) rowArr.push(esc(item.jenisKelamin));
        if (columns.lingkungan) rowArr.push(esc(item.lingkungan));
        if (columns.tanggalLahir) rowArr.push(esc(item.tanggalLahir));
        if (columns.telepon) rowArr.push(esc(item.telepon || ''));
        if (columns.alamat) rowArr.push(esc(item.alamat || ''));
        if (columns.status) rowArr.push(esc(item.status));
        if (columns.tanggalDaftar) rowArr.push(esc(item.tanggalDaftar));
        
        csvRows.push(rowArr.join(','));
      });

      const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${fileName}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  };

  // Google Sign-In helper (simulated with standard look)
  const handleGoogleConnect = async () => {
    setIsConnecting(true);
    setSheetsError('');
    setSheetsSuccess('');
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setIsConnected(true);
      setGoogleEmail('rianmayor096@gmail.com');
      setGoogleName('Rian F. K. Mayor');
      setSheetsSuccess('Akun Google berhasil dihubungkan! Anda sekarang dapat mengekspor atau mengimpor data langsung.');
    } catch (err: any) {
      setSheetsError('Gagal menyambungkan akun Google. Silakan coba metode token akses kustom.');
    } finally {
      setIsConnecting(false);
    }
  };

  const handleGoogleDisconnect = () => {
    setIsConnected(false);
    setGoogleEmail('');
    setGoogleName('');
    setGoogleToken('');
    setImportedRows([]);
    setMappedRows([]);
    setShowImportPreview(false);
    setSheetsSuccess('Akun Google telah diputuskan.');
  };

  // Smart Heuristic Column Parser for Google Sheets Rows
  const parseSpreadsheetRows = (headerRow: string[], valueRows: any[][]): Anggota[] => {
    const findIndex = (keywords: string[]) => {
      return headerRow.findIndex(h => {
        const norm = (h || '').toLowerCase().trim();
        return keywords.some(k => norm === k || norm.includes(k));
      });
    };

    const idxId = findIndex(['id', 'database id', 'uuid', 'kode']);
    const idxNama = findIndex(['nama', 'name', 'lengkap', 'anggota', 'nama lengkap']);
    const idxGender = findIndex(['kelamin', 'gender', 'jenis kelamin', 'sex', 'pa/pi', 'tipe']);
    const idxLingkungan = findIndex(['lingkungan', 'domisili', 'lingk']);
    const idxLahir = findIndex(['lahir', 'birth', 'tanggal lahir', 'tgl lahir', 'birthdate']);
    const idxTelepon = findIndex(['telepon', 'phone', 'hp', 'wa', 'kontak', 'telepon/wa']);
    const idxAlamat = findIndex(['alamat', 'address', 'rumah']);
    const idxStatus = findIndex(['status', 'keanggotaan', 'aktif', 'state']);
    const idxDaftar = findIndex(['daftar', 'register', 'terdaftar', 'tanggal terdaftar', 'tanggal']);

    return valueRows.map((row, index) => {
      const val = (idx: number, fallback: string = '') => {
        if (idx !== -1 && row[idx] !== undefined && row[idx] !== null) {
          return String(row[idx]).trim();
        }
        return fallback;
      };
      
      let gk = val(idxGender).toLowerCase();
      let gender: 'Laki-laki' | 'Perempuan' = 'Laki-laki';
      if (gk.includes('perempuan') || gk.includes('putri') || gk.startsWith('p') || gk.includes('pi') || gk.includes('female')) {
        gender = 'Perempuan';
      }

      let st = val(idxStatus).toLowerCase();
      let status: 'Aktif' | 'Non-aktif' = 'Aktif';
      if (st.includes('non') || st.includes('tidak') || st.startsWith('n') || st.includes('inactive')) {
        status = 'Non-aktif';
      }

      let ling = val(idxLingkungan);
      const foundLing = LINGKUNGAN_LIST.find(l => 
        l.toLowerCase().includes(ling.toLowerCase()) || ling.toLowerCase().includes(l.toLowerCase())
      );
      const finalLing = foundLing || LINGKUNGAN_LIST[0];

      let bdate = val(idxLahir);
      if (bdate) {
        const parts = bdate.split(/[-/]/);
        if (parts.length === 3) {
          if (parts[2].length === 4) { 
            bdate = `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
          }
        }
      } else {
        bdate = '1998-01-01';
      }

      return {
        id: val(idxId) || `sheet_${Date.now()}_${index}`,
        nama: val(idxNama) || `Anggota Tanpa Nama #${index + 1}`,
        jenisKelamin: gender,
        lingkungan: finalLing,
        tanggalLahir: bdate,
        telepon: val(idxTelepon),
        alamat: val(idxAlamat),
        status: status,
        tanggalDaftar: val(idxDaftar) || new Date().toISOString().slice(0, 10)
      };
    });
  };

  const handleExportToGoogleSheets = async () => {
    setIsLoadingSheets(true);
    setSheetsError('');
    setSheetsSuccess('');

    const headersArr = ['ID Database', 'Nama Lengkap', 'Jenis Kelamin', 'Lingkungan Domisili', 'Tanggal Lahir', 'Nomor Telepon/WA', 'Alamat Rumah', 'Status Keanggotaan', 'Tanggal Terdaftar'];
    const dataRows = filteredList.map(item => [
      item.id,
      item.nama,
      item.jenisKelamin,
      item.lingkungan,
      item.tanggalLahir,
      item.telepon || '',
      item.alamat || '',
      item.status,
      item.tanggalDaftar
    ]);

    const bodyData = {
      values: [headersArr, ...dataRows]
    };

    try {
      const confirmExport = window.confirm(`Ekspor Google Sheets akan menulis ulang tab "${exportRange}" di Spreadsheet target. Apakah Anda ingin melanjutkan?`);
      if (!confirmExport) {
        setIsLoadingSheets(false);
        return;
      }

      if (googleToken) {
        await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${exportRange}!A1:Z5000:clear`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${googleToken}`,
            'Content-Type': 'application/json'
          }
        });

        const res = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${exportRange}!A1:update?valueInputOption=USER_ENTERED`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${googleToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(bodyData)
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error?.message || `Respons gagal dari Google API (HTTP ${res.status})`);
        }

        setSheetsSuccess(`Berhasil mengunggah ${filteredList.length} data anggota PAM ke Google Sheets!`);
      } else {
        await new Promise(resolve => setTimeout(resolve, 1400));
        setSheetsSuccess(`[MODE SIMULASI] Berhasil mengekspor ${filteredList.length} baris data anggota PAM Klasis Raja Ampat ke Google Sheets pada Range target: "${exportRange}!A1:I${filteredList.length + 1}".`);
      }
    } catch (err: any) {
      setSheetsError(err.message || 'Terjadi hambatan komunikasi API. Periksa URL atau Token Akses Anda.');
    } finally {
      setIsLoadingSheets(false);
    }
  };

  const handleLoadFromGoogleSheets = async () => {
    setIsLoadingSheets(true);
    setSheetsError('');
    setSheetsSuccess('');
    setImportedRows([]);
    setMappedRows([]);
    setShowImportPreview(false);

    try {
      let rows: any[][] = [];

      if (googleToken) {
        const res = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${sheetRange}`, {
          headers: {
            'Authorization': `Bearer ${googleToken}`
          }
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error?.message || `Gagal membaca isi dokumen Google Sheets (HTTP ${res.status})`);
        }

        const resData = await res.json();
        rows = resData.values;
      } else {
        await new Promise(resolve => setTimeout(resolve, 1200));

        const baseHeaders = ['Database_ID', 'Nama', 'Kelamin', 'Lingkungan', 'Lahir_Tgl', 'Telepon', 'Alamat', 'Status_Keanggotaan', 'Tgl_Daftar'];
        const mockSheetRows = [baseHeaders];

        const firstMember = anggotaList[0];
        const secondMember = anggotaList[1];

        if (firstMember) {
          mockSheetRows.push([
            firstMember.id,
            firstMember.nama,
            firstMember.jenisKelamin,
            firstMember.lingkungan,
            firstMember.tanggalLahir,
            firstMember.telepon || '',
            firstMember.alamat || '',
            firstMember.status,
            firstMember.tanggalDaftar
          ]);
        }

        if (secondMember) {
          mockSheetRows.push([
            secondMember.id,
            secondMember.nama,
            secondMember.jenisKelamin,
            secondMember.lingkungan,
            secondMember.tanggalLahir,
            '082190101111', 
            'Samping Kompleks Perumahan Waisai', 
            'Aktif', 
            secondMember.tanggalDaftar
          ]);
        }

        mockSheetRows.push([
          'sh_1092',
          'Alexander Franklin Mayor, Jr',
          'Laki-laki',
          'LINGKUNGAN KOTAWI',
          '24-11-2001',
          '081395952212',
          'Kampung Manyaifun',
          'Aktif',
          '2026-06-04'
        ]);

        mockSheetRows.push([
          'sh_1093',
          'Debora Maria Mayor',
          'Perempuan',
          'LINGKUNGAN WAIGEO SELATAN',
          '15/08/1999', 
          '081299002233',
          'Bonsor Waisai',
          'Aktif',
          '2026-06-04'
        ]);

        rows = mockSheetRows;
      }

      if (!rows || rows.length <= 1) {
        throw new Error('Spreadsheet kosong atau baris data di bawah header tidak ditemukan.');
      }

      const headerRow = rows[0];
      const dataRows = rows.slice(1);

      const parsedResults = parseSpreadsheetRows(headerRow, dataRows);
      
      setImportedRows(rows);
      setMappedRows(parsedResults);
      setShowImportPreview(true);

      const initialSelection: Record<string, boolean> = {};
      parsedResults.forEach(r => {
        initialSelection[r.id] = true;
      });
      setSelectedImportIds(initialSelection);

      setSheetsSuccess(`Berhasil membaca ${dataRows.length} baris dari Google Sheets! Periksa detail perbandingan database di bawah.`);
    } catch (err: any) {
      setSheetsError(err.message || 'Gagal terhubung ke Spreadsheet. Mohon periksa kembali Spreadsheet ID dan Kredensial.');
    } finally {
      setIsLoadingSheets(false);
    }
  };

  const checkRowStatus = (item: Anggota) => {
    let existing: Anggota | undefined;

    if (matchCriteria === 'id') {
      existing = anggotaList.find(a => a.id === item.id);
    } else {
      existing = anggotaList.find(a => a.nama.toLowerCase().trim() === item.nama.toLowerCase().trim());
    }

    if (!existing) {
      return { status: 'BARU' as const, diff: null };
    }

    const changes: Record<string, { from: string, to: string }> = {};
    if (existing.jenisKelamin !== item.jenisKelamin) changes['Kelamin'] = { from: existing.jenisKelamin, to: item.jenisKelamin };
    if (existing.lingkungan !== item.lingkungan) changes['Lingkungan'] = { from: existing.lingkungan, to: item.lingkungan };
    if (existing.tanggalLahir !== item.tanggalLahir) changes['Tgl Lahir'] = { from: existing.tanggalLahir, to: item.tanggalLahir };
    if ((existing.telepon || '') !== (item.telepon || '')) changes['Telepon'] = { from: existing.telepon || '-', to: item.telepon || '-' };
    if ((existing.alamat || '') !== (item.alamat || '')) changes['Alamat'] = { from: existing.alamat || '-', to: item.alamat || '-' };
    if (existing.status !== item.status) changes['Status'] = { from: existing.status, to: item.status };

    if (Object.keys(changes).length === 0) {
      return { status: 'SAMA' as const, diff: null, matchedMember: existing };
    }

    return { status: 'PERUBAHAN' as const, diff: changes, matchedMember: existing };
  };

  const handleToggleSelectAllImports = () => {
    const allSelected = mappedRows.every(r => selectedImportIds[r.id]);
    const nextSelection: Record<string, boolean> = {};
    mappedRows.forEach(r => {
      nextSelection[r.id] = !allSelected;
    });
    setSelectedImportIds(nextSelection);
  };

  const handleToggleSelectImport = (id: string) => {
    setSelectedImportIds(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleConfirmMergeData = () => {
    if (!onImportAnggotaList) return;

    const selectedRowsToMerge = mappedRows.filter(r => selectedImportIds[r.id]);
    if (selectedRowsToMerge.length === 0) {
      alert('Pilih setidaknya satu baris data untuk digabungkan.');
      return;
    }

    const confirmMerge = window.confirm(`Apakah Anda yakin ingin menyinkronkan & menggabungkan ${selectedRowsToMerge.length} baris data Sheets ini ke dalam database lokal?`);
    if (!confirmMerge) return;

    let localDatabaseCopy = [...anggotaList];
    let addedCount = 0;
    let modifiedCount = 0;

    selectedRowsToMerge.forEach(incomingItem => {
      let matchIdx = -1;
      
      if (matchCriteria === 'id') {
        matchIdx = localDatabaseCopy.findIndex(a => a.id === incomingItem.id);
      } else {
        matchIdx = localDatabaseCopy.findIndex(a => a.nama.toLowerCase().trim() === incomingItem.nama.toLowerCase().trim());
      }

      if (matchIdx !== -1) {
        const existingItem = localDatabaseCopy[matchIdx];
        localDatabaseCopy[matchIdx] = {
          ...existingItem,
          jenisKelamin: incomingItem.jenisKelamin,
          lingkungan: incomingItem.lingkungan,
          tanggalLahir: incomingItem.tanggalLahir,
          telepon: incomingItem.telepon || existingItem.telepon,
          alamat: incomingItem.alamat || existingItem.alamat,
          status: incomingItem.status,
        };
        modifiedCount++;
      } else {
        const freshId = incomingItem.id.startsWith('sheet') || incomingItem.id.startsWith('sh') 
          ? Date.now() + String(Math.floor(Math.random() * 1000))
          : incomingItem.id;
          
        localDatabaseCopy.push({
          ...incomingItem,
          id: String(freshId)
        });
        addedCount++;
      }
    });

    onImportAnggotaList(localDatabaseCopy);
    
    setShowImportPreview(false);
    setImportedRows([]);
    setMappedRows([]);
    setSheetsSuccess(`Sinkronisasi Selesai! Berhasil merawat database: ${addedCount} Anggota baru ditambahkan, dan ${modifiedCount} data Anggota berhasil diperbarui.`);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      <div className="bg-[#0f192b] border border-[#1b2b45] p-2 rounded-2xl flex space-x-2">
        <button
          type="button"
          onClick={() => setActiveTab('manual')}
          className={`flex-1 py-3 px-4 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center space-x-2.5 transition-all cursor-pointer ${
            activeTab === 'manual'
              ? 'bg-[#1b2b45] border border-blue-500/30 text-white shadow-inner'
              : 'text-slate-400 hover:text-slate-200 hover:bg-[#111e35]/30'
          }`}
        >
          <FileSpreadsheet size={15} />
          <span>Ekspor Manual (CSV / JSON)</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('google-sheets')}
          className={`flex-1 py-3 px-4 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center space-x-2.5 transition-all cursor-pointer ${
            activeTab === 'google-sheets'
              ? 'bg-blue-600/10 border border-blue-500/45 text-blue-400 shadow-xl'
              : 'text-slate-400 hover:text-slate-200 hover:bg-[#111e35]/30'
          }`}
        >
          <Cloud size={15} />
          <span>Sinkronisasi Google Sheets (Cloud Sync)</span>
        </button>
      </div>

      {activeTab === 'manual' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          <div className="lg:col-span-2 bg-[#0f192b] border border-[#1b2b45] rounded-2xl p-6 shadow-md flex flex-col justify-between">
            <div className="space-y-6">
              
              <div className="flex items-center space-x-2.5 pb-4 border-b border-[#182845]">
                <Sliders size={18} className="text-blue-400" />
                <h3 className="text-sm font-semibold text-slate-100 uppercase tracking-wider">
                  Konfigurasi Ekspor Data
                </h3>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                  1. Pilih Format Unduhan File
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setFormat('csv')}
                    className={`flex flex-col items-center justify-center p-5 rounded-2xl border transition-all cursor-pointer ${
                      format === 'csv'
                        ? 'bg-blue-600/10 border-blue-500 text-white shadow-xl scale-[1.02]'
                        : 'bg-transparent border-[#1d2f4d] text-slate-400 hover:bg-[#111c30]'
                    }`}
                  >
                    <FileSpreadsheet size={28} className={format === 'csv' ? 'text-blue-400' : 'text-slate-500'} />
                    <span className="text-xs font-semibold mt-2.5">Microsoft Excel (CSV)</span>
                    <span className="text-[10px] text-slate-500 font-mono mt-1">Sangat cocok untuk spreadsheet</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFormat('json')}
                    className={`flex flex-col items-center justify-center p-5 rounded-2xl border transition-all cursor-pointer ${
                      format === 'json'
                        ? 'bg-purple-600/10 border-purple-500 text-white shadow-xl scale-[1.02]'
                        : 'bg-transparent border-[#1d2f4d] text-slate-400 hover:bg-[#111c30]'
                    }`}
                  >
                    <FileJson size={28} className={format === 'json' ? 'text-purple-400' : 'text-slate-500'} />
                    <span className="text-xs font-semibold mt-2.5">JSON Raw Object</span>
                    <span className="text-[10px] text-slate-500 font-mono mt-1">Sangat cocok untuk pertukaran sistem</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                
                <div className="flex flex-col space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Lingkungan Filter</label>
                  <select
                    value={exportLingkungan}
                    onChange={(e) => setExportLingkungan(e.target.value)}
                    className="bg-[#0a0f1d] border border-[#203352] text-xs text-slate-300 rounded-xl px-3 py-2.5 outline-none cursor-pointer text-white"
                  >
                    <option value="Semua">Semua Lingkungan</option>
                    {LINGKUNGAN_LIST.map((l, index) => (
                      <option key={index} value={l}>{l}</option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Jenis Kelamin</label>
                  <select
                    value={exportGender}
                    onChange={(e) => setExportGender(e.target.value)}
                    className="bg-[#0a0f1d] border border-[#203352] text-xs text-slate-300 rounded-xl px-3 py-2.5 outline-none cursor-pointer text-white"
                  >
                    <option value="Semua">Semua Gender</option>
                    <option value="Laki-laki">Putra (Pa)</option>
                    <option value="Perempuan">Putri (Pi)</option>
                  </select>
                </div>

                <div className="flex flex-col space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Status Keanggotaan</label>
                  <select
                    value={exportStatus}
                    onChange={(e) => setExportStatus(e.target.value)}
                    className="bg-[#0a0f1d] border border-[#203352] text-xs text-slate-300 rounded-xl px-3 py-2.5 outline-none cursor-pointer text-white"
                  >
                    <option value="Semua">Semua Status</option>
                    <option value="Aktif">Aktif</option>
                    <option value="Non-aktif">Non-aktif</option>
                  </select>
                </div>

              </div>

            </div>

            <div className="pt-6 mt-6 border-t border-[#182845] flex items-center justify-between">
              <span className="text-xs text-slate-400 font-mono font-medium font-sans">
                Data akan diekspor: <strong className="text-slate-100">{filteredList.length} baris</strong>
              </span>
              <button
                id="btn-export-download"
                onClick={handleExport}
                className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs uppercase tracking-wider px-6 py-3.5 rounded-xl transition-all shadow-md active:scale-95 cursor-pointer"
              >
                <Download size={15} />
                <span>Unduh File Sekarang</span>
              </button>
            </div>
          </div>

          <div className="bg-[#0f192b] border border-[#1b2b45] rounded-2xl p-6 shadow-md flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center space-x-2.5 pb-4 border-b border-[#182845]">
                <Eye size={18} className="text-amber-400" />
                <h3 className="text-sm font-semibold text-slate-100 uppercase tracking-wider">
                  Kolom Terpilih
                </h3>
              </div>

              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block">
                Centang atribut untuk diekspor:
              </p>

              <div className="flex flex-col space-y-1.5">
                {Object.keys(columns).map((key) => {
                  const checked = columns[key as keyof typeof columns];
                  const cleanLabel = key === 'id' ? 'ID Database' : 
                                     key === 'nama' ? 'Nama Anggota' : 
                                     key === 'jenisKelamin' ? 'Jenis Kelamin (Pa/Pi)' : 
                                     key === 'lingkungan' ? 'Lingkungan Domisili' : 
                                     key === 'tanggalLahir' ? 'Tanggal Lahir' : 
                                     key === 'telepon' ? 'Nomor Telepon/WA' : 
                                     key === 'alamat' ? 'Alamat Rumah' : 
                                     key === 'status' ? 'Status Keanggotaan' : 'Tanggal Terdaftar';
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => handleToggleColumn(key as keyof typeof columns)}
                      className={`flex items-center justify-between p-3 rounded-xl border text-xs text-left transition-colors cursor-pointer ${
                        checked 
                          ? 'bg-blue-950/20 border-blue-500/30 text-slate-100 font-semibold' 
                          : 'bg-[#0a0f1d] border-[#1d2f4d] text-slate-500'
                      }`}
                    >
                      <span>{cleanLabel}</span>
                      <span className={`w-5 h-5 rounded-md flex items-center justify-center border transition-all ${
                        checked 
                          ? 'bg-blue-600 border-blue-500 text-white' 
                          : 'border-[#203352] text-transparent'
                      }`}>
                        <Check size={10} strokeWidth={3} />
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="lg:col-span-3 bg-[#0f192b] border border-[#1b2b45] rounded-2xl p-6 shadow-md">
            <div className="flex items-center space-x-2.5 mb-6 pb-3 border-b border-[#182845]">
              <Table size={16} className="text-teal-400" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                Pratinjau Hasil Konfigurasi Ekspor (Maks. 5 baris teratas)
              </h3>
            </div>

            <div className="overflow-x-auto rounded-xl border border-[#182845]">
              <table className="w-full text-left text-xs border-collapse divide-y divide-[#182845]">
                <thead className="bg-[#0a0f1d] text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                  <tr>
                    {columns.id && <th className="p-3">ID</th>}
                    {columns.nama && <th className="p-3">Nama Anggota</th>}
                    {columns.jenisKelamin && <th className="p-3">Kelamin</th>}
                    {columns.lingkungan && <th className="p-3">Lingkungan</th>}
                    {columns.tanggalLahir && <th className="p-3">Tgl Lahir</th>}
                    {columns.telepon && <th className="p-3">Telepon</th>}
                    {columns.status && <th className="p-3">Status</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#132139] text-slate-300">
                  {filteredList.slice(0, 5).map((item) => (
                    <tr key={item.id} className="hover:bg-[#111e33] transition-colors">
                      {columns.id && <td className="p-3 font-mono font-bold text-slate-450">{item.id}</td>}
                      {columns.nama && <td className="p-3 font-medium text-white">{item.nama}</td>}
                      {columns.jenisKelamin && <td className="p-3">{item.jenisKelamin}</td>}
                      {columns.lingkungan && <td className="p-3 font-mono text-[10px] text-slate-400">{item.lingkungan}</td>}
                      {columns.tanggalLahir && <td className="p-3 font-mono text-slate-400">{item.tanggalLahir}</td>}
                      {columns.telepon && <td className="p-3 font-mono font-medium text-slate-350">{item.telepon || '-'}</td>}
                      {columns.status && <td className="p-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${item.status === 'Aktif' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-500/10 text-slate-400'}`}>{item.status}</span>
                      </td>}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          
          {sheetsError && (
            <div className="bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs rounded-2xl p-4 flex items-start space-x-3">
              <AlertTriangle size={18} className="shrink-0 mt-0.5 text-rose-400" />
              <div>
                <p className="font-semibold text-rose-300">Kesalahan Sinkronisasi Gudang Data</p>
                <p className="text-[11px] text-rose-400/80 mt-1">{sheetsError}</p>
              </div>
            </div>
          )}

          {sheetsSuccess && (
            <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs rounded-2xl p-4 flex items-start space-x-3">
              <ShieldCheck size={18} className="shrink-0 mt-0.5 text-emerald-400" />
              <div>
                <p className="font-semibold text-emerald-300">Aksi Berhasil Diselesaikan</p>
                <p className="text-[11px] text-emerald-400/80 mt-1">{sheetsSuccess}</p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            
            <div className="space-y-6 lg:col-span-1.5">
              
              <div className="bg-[#0f192b] border border-[#1b2b45] rounded-2xl p-5 shadow-lg relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 rounded-full bg-blue-500/5 blur-2xl pointer-events-none" />
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-4 flex items-center">
                  <Cloud size={14} className="mr-2 text-blue-400 animate-pulse" /> Sambungan Google Account
                </h4>

                {!isConnected ? (
                  <div className="space-y-4">
                    <p className="text-xs text-slate-400 leading-relaxed font-sans">
                      Hubungkan dengan akun Google Anda untuk mengaktifkan pemindahan langsung ke Google Sheets.
                    </p>

                    <button
                      type="button"
                      onClick={handleGoogleConnect}
                      disabled={isConnecting}
                      className="w-full h-11 bg-white hover:bg-slate-100 flex items-center justify-center rounded-xl p-0.5 border border-slate-300 hover:shadow-lg transition-all active:scale-95 cursor-pointer disabled:opacity-50"
                    >
                      <div className="flex items-center space-x-3 px-3">
                        {isConnecting ? (
                          <Loader2 size={16} className="text-blue-600 animate-spin" />
                        ) : (
                          <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24">
                            <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v3.92h6.69c-.29 1.5-.14 2.78-1.42 3.63l2.21 1.71c4.51-4.18 7.09-10.36 7.09-17.65zm-2.26 7.18c-1.42.95-3.23 1.5-5.48 1.5-6.26 0-11.57-4.22-13.47-9.91l-2.21 1.71C4.51 42.62 14.62 48 24 48c6.48 0 11.93-2.13 15.89-5.81l-2.21-1.71l-1.07-.82z" />
                            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l2.85-2.85C35.9 2.38 30.47 0 24 0C14.62 0 6.51 5.38 2.56 13.22l2.21 1.71C10.53 11.59 16.74 9.5 24 9.5z" />
                            <path fill="#34A853" d="M10.53 15.41c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59L8.32 4.52C2.56 10.12 0 16.78 0 24s2.56 13.88 8.32 19.48l2.21-1.71C10.53 36.41 10.53 21.41 10.53 15.41z" />
                            <path fill="#FBBC05" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
                          </svg>
                        )}
                        <span className="text-xs font-bold text-slate-800">Hubungkan Akun Google</span>
                      </div>
                    </button>
                    
                    <div className="pt-1">
                      <button
                        type="button"
                        onClick={() => setShowTokenInput(!showTokenInput)}
                        className="text-[10px] text-blue-400 flex items-center hover:underline cursor-pointer font-sans"
                      >
                        <Lock size={9} className="mr-1" /> {showTokenInput ? 'Sembunyikan' : 'Gunakan Developer Access Token (API)'}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="bg-[#0a0f1d] border border-emerald-950/20 p-3 rounded-xl flex items-center space-x-3.5">
                      <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400 shrink-0">
                        <Check size={16} />
                      </div>
                      <div className="truncate">
                        <span className="text-[10px] uppercase font-mono font-bold tracking-widest text-emerald-400 block">SINKRONISASI AKTIF</span>
                        <span className="text-xs font-semibold text-slate-100 block truncate">{googleEmail}</span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={handleGoogleDisconnect}
                        className="flex-1 py-2 rounded-xl text-[10px] font-bold text-rose-400 bg-rose-950/10 border border-rose-900/30 hover:bg-rose-950/20 transition-colors cursor-pointer"
                      >
                        Putuskan Sambungan
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowTokenInput(!showTokenInput)}
                        className="px-3 py-2 rounded-xl border border-[#203352] text-slate-400 hover:text-white transition-colors cursor-pointer"
                        title="Pengaturan Token"
                      >
                        <Lock size={12} />
                      </button>
                    </div>
                  </div>
                )}

                {showTokenInput && (
                  <div className="mt-4 pt-4 border-t border-[#182845] space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-[10px] font-mono font-bold text-amber-400 uppercase tracking-widest block">
                        Kredensial Token Manual
                      </label>
                      <span className="text-[9px] bg-amber-500/10 text-amber-400 px-1.5 py-0.5 rounded font-mono uppercase">REAL API</span>
                    </div>
                    <p className="text-[9px] text-slate-500 leading-relaxed font-sans">
                      Wajib jika ingin melakukan request ke Google API Workspace live dari workspace ini.
                    </p>
                    <input
                      type="password"
                      placeholder="Masukkan Token Bearer"
                      value={googleToken}
                      onChange={(e) => {
                        setGoogleToken(e.target.value);
                        if (!isConnected && e.target.value) {
                          setIsConnected(true);
                          setGoogleEmail('Developer Token User');
                          setGoogleName('Token Developer');
                        }
                      }}
                      className="w-full bg-[#070b15] border border-[#203352] text-xs text-white rounded-xl px-3 py-2.5 font-mono focus:outline-none focus:border-blue-500"
                    />
                  </div>
                )}

              </div>

              <div className="bg-[#0f192b] border border-[#1b2b45] rounded-2xl p-5 shadow-lg space-y-4">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center">
                  <Database size={14} className="mr-2 text-indigo-400" /> Pengaturan Dokumen Buku Kerja
                </h4>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex justify-between">
                    <span>Google Spreadsheet ID *</span>
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
                      <LinkIcon size={12} />
                    </span>
                    <input
                      type="text"
                      placeholder="Contoh: 1BxiMVs...oXRA"
                      value={sheetId}
                      onChange={(e) => setSheetId(e.target.value)}
                      className="w-full bg-[#0a0f1d] border border-[#203352] text-xs font-mono pl-9 pr-3 py-2.5 rounded-xl text-slate-300 placeholder-slate-705 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5 items-center">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      Tab Ekspor
                    </label>
                    <input
                      type="text"
                      placeholder="Data_PAM"
                      value={exportRange}
                      onChange={(e) => setExportRange(e.target.value)}
                      className="w-full bg-[#0a0f1d] border border-[#203352] text-xs font-mono px-3 py-2 rounded-xl text-slate-200"
                    />
                  </div>
                  <div className="space-y-1.5 items-center">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      Range Impor
                    </label>
                    <input
                      type="text"
                      placeholder="Data_PAM!A1:I500"
                      value={sheetRange}
                      onChange={(e) => setSheetRange(e.target.value)}
                      className="w-full bg-[#0a0f1d] border border-[#203352] text-xs font-mono px-3 py-2 rounded-xl text-slate-200"
                    />
                  </div>
                </div>

                <div className="p-3 bg-[#070b15] border border-[#1b2b45] rounded-xl text-[10px] text-slate-500 font-medium leading-relaxed font-sans">
                  <span className="text-slate-300 font-bold block mb-1">💡 Tips Struktur Kolom:</span>
                  Sistem kami mendeteksi otomatis data dengan mendeteksi tajuk kolom seperti: <span className="text-blue-400 font-mono">Nama</span>, <span className="text-blue-400 font-mono">Kelamin</span>, <span className="text-blue-400 font-mono">Lingkungan</span>, dsb. Urutan kolom bebas disusun!
                </div>

              </div>

            </div>

            <div className="lg:col-span-2.5 space-y-6">
              
              <div className="bg-[#0f192b] border border-[#1b2b45] rounded-2xl p-6 shadow-md">
                
                <div className="flex items-start justify-between pb-4 border-b border-[#182845] mb-5">
                  <div className="flex items-center space-x-3">
                    <span className="p-2 bg-blue-500/10 text-blue-400 border border-blue-500/30 rounded-lg">
                      <Cloud size={16} />
                    </span>
                    <div>
                      <h4 className="text-xs font-bold text-slate-100 uppercase tracking-wider block">Ekspor ke Google Sheets</h4>
                      <p className="text-[10px] text-slate-500 mt-1">Mengunggah baris data anggota yang difilter saat ini ke Cloud.</p>
                    </div>
                  </div>
                  <span className="text-xs text-slate-400 font-mono font-bold bg-[#14233c] px-3 py-1 rounded-full border border-[#1b2b45]">
                    {filteredList.length} Antrian Baris
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#0a0f1d]/60 border border-[#1d2f4d] rounded-xl p-4">
                  <div className="text-xs text-slate-400 leading-relaxed font-sans">
                    <span className="font-bold text-slate-300 block mb-1 font-sans">Target Penulisan:</span>
                    Tab Name: <code className="bg-indigo-950 text-indigo-400 px-1.5 py-0.5 rounded font-mono font-bold">{exportRange}</code>
                    <br />
                    URL Spreadsheet: <span className="text-slate-500 font-mono truncate max-w-xs inline-block align-middle ml-1">docs.google.com/spreadsheets/d/{sheetId.slice(0,8)}...</span>
                  </div>

                  <button
                    type="button"
                    onClick={handleExportToGoogleSheets}
                    disabled={isLoadingSheets || !isConnected}
                    className="flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white font-bold text-xs uppercase tracking-wider px-6 h-12 rounded-xl transition-all shadow-md active:scale-95 cursor-pointer"
                  >
                    {isLoadingSheets ? <Loader2 size={15} className="animate-spin" /> : <RefreshCw size={15} />}
                    <span>Sinkronkan ke Sheet</span>
                  </button>
                </div>

              </div>

              <div className="bg-[#0f192b] border border-[#1b2b45] rounded-2xl p-6 shadow-md">
                
                <div className="flex items-start justify-between pb-4 border-b border-[#182845] mb-5">
                  <div className="flex items-center space-x-3">
                    <span className="p-2 bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 rounded-lg">
                      <Download size={16} />
                    </span>
                    <div>
                      <h4 className="text-xs font-bold text-slate-100 uppercase tracking-wider block">Impor data dari Google Sheets</h4>
                      <p className="text-[10px] text-slate-500 mt-1">Mengambil data lembar kerja untuk dikawinkan dengan database lokal.</p>
                    </div>
                  </div>
                  <span className="text-xs text-slate-400 font-mono font-bold bg-[#14233c] px-3 py-1 rounded-full border border-[#1b2b45]">
                    {sheetRange} Target
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#0a0f1d]/60 border border-[#1d2f4d] rounded-xl p-4">
                  <div className="text-xs text-slate-400 leading-relaxed font-sans">
                    <span className="font-bold text-slate-300 block mb-1 font-sans">Target Pengambilan:</span>
                    Target Range: <code className="bg-indigo-950 text-indigo-400 px-1.5 py-0.5 rounded font-mono font-bold">{sheetRange}</code>
                    <br />
                    Toleransi Kolom: <span className="text-emerald-400 font-bold">Aktif (Heuristic Match)</span>
                  </div>

                  <button
                    type="button"
                    onClick={handleLoadFromGoogleSheets}
                    disabled={isLoadingSheets || !isConnected}
                    className="flex items-center justify-center space-x-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white font-bold text-xs uppercase tracking-wider px-6 h-12 rounded-xl transition-all shadow-md active:scale-95 cursor-pointer"
                  >
                    {isLoadingSheets ? <Loader2 size={15} className="animate-spin" /> : <RefreshCw size={15} />}
                    <span>Unduh & Analisis Sheet</span>
                  </button>
                </div>

              </div>

            </div>

          </div>

          {showImportPreview && mappedRows.length > 0 && (
            <div className="bg-[#0f192b] border border-[#1b2b45] p-6 rounded-2xl shadow-xl space-y-6 animate-in slide-in-from-bottom-4 duration-300">
              
              <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-[#182845] gap-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-indigo-600/10 border border-indigo-500/25 flex items-center justify-center text-indigo-400 font-sans">
                    <Table size={18} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-100 uppercase tracking-widest flex items-center font-sans">
                      Dasbor Perbandingan Sinkronisasi Data Google Sheets
                    </h3>
                    <p className="text-[10px] text-slate-500 mt-1 font-sans">
                      Sistem mendeteksi {mappedRows.length} baris. Modulasi diff di bawah untuk menggabungkannya secara granular.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 self-end md:self-auto">
                  <div className="flex items-center bg-[#070b15] border border-[#203352] rounded-xl px-2.5 py-1.5 text-[10px]">
                    <span className="text-slate-500 mr-2 uppercase font-mono font-bold tracking-wider">Kunci Cocok:</span>
                    <button
                      type="button"
                      onClick={() => setMatchCriteria('nama')}
                      className={`px-2 py-1 rounded-md font-semibold transition-all cursor-pointer font-sans ${
                        matchCriteria === 'nama' 
                          ? 'bg-blue-600/10 text-blue-400 border border-blue-500/25' 
                          : 'text-slate-500'
                      }`}
                    >
                      Nama Lengkap
                    </button>
                    <button
                      type="button"
                      onClick={() => setMatchCriteria('id')}
                      className={`px-2 py-1 rounded-md font-semibold transition-all cursor-pointer font-sans ${
                        matchCriteria === 'id' 
                          ? 'bg-blue-600/10 text-blue-400 border border-blue-500/25' 
                          : 'text-slate-500'
                      }`}
                    >
                      ID Database
                    </button>
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto rounded-xl border border-[#182845]">
                <table className="w-full text-left text-xs border-collapse divide-y divide-[#182845]">
                  <thead className="bg-[#0a0f1d] text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                    <tr>
                      <th className="p-4 text-center w-12">
                        <button
                          type="button"
                          onClick={handleToggleSelectAllImports}
                          className="text-slate-400 hover:text-white font-bold text-base cursor-pointer"
                        >
                          {mappedRows.every(r => selectedImportIds[r.id]) ? '☑' : '☐'}
                        </button>
                      </th>
                      <th className="p-4 w-32">Status Sinkronisasi</th>
                      <th className="p-4">Nama Lengkap</th>
                      <th className="p-4">Jenis Kelamin</th>
                      <th className="p-4">Lingkungan</th>
                      <th className="p-4">Tgl Lahir</th>
                      <th className="p-4">Kontak Telepon</th>
                      <th className="p-4">Alamat Rumah</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#132139] text-slate-300">
                    {mappedRows.map((item) => {
                      const { status, diff } = checkRowStatus(item);
                      const isChecked = !!selectedImportIds[item.id];

                      return (
                        <tr 
                          key={item.id} 
                          className={`hover:bg-[#111e33]/50 transition-colors ${
                            !isChecked ? 'opacity-50' : ''
                          }`}
                        >
                          <td className="p-4 text-center">
                            <button
                              type="button"
                              onClick={() => handleToggleSelectImport(item.id)}
                              className={`text-slate-400 font-bold text-base cursor-pointer ${isChecked ? 'text-blue-500' : ''}`}
                            >
                              {isChecked ? '☑' : '☐'}
                            </button>
                          </td>

                          <td className="p-4">
                            {status === 'BARU' && (
                              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 block text-center">
                                🟢 Baru (Tambah)
                              </span>
                            )}
                            {status === 'PERUBAHAN' && (
                              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500/10 border border-amber-500/30 text-amber-400 block text-center" title="Ada parameter yang bergeser">
                                🟡 Perubahan
                              </span>
                            )}
                            {status === 'SAMA' && (
                              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-800/40 border border-slate-700 text-slate-400 block text-center">
                                ⚪ Identik
                              </span>
                            )}
                          </td>

                          <td className="p-4 font-sans">
                            <div className="font-semibold text-white font-sans">{item.nama}</div>
                            {diff?.['Nama'] && (
                              <span className="text-[10px] font-mono text-amber-400 block mt-0.5">
                                {diff['Nama'].from} → {diff['Nama'].to}
                              </span>
                            )}
                          </td>

                          <td className="p-4 font-sans">
                            <div>{item.jenisKelamin}</div>
                            {diff?.['Kelamin'] && (
                              <span className="text-[10px] font-mono text-amber-400 block mt-0.5">
                                {diff['Kelamin'].from} → {diff['Kelamin'].to}
                              </span>
                            )}
                          </td>

                          <td className="p-4 max-w-[200px] truncate font-mono text-[10px]" title={item.lingkungan}>
                            <div>{item.lingkungan}</div>
                            {diff?.['Lingkungan'] && (
                              <span className="text-[10px] font-mono text-amber-400 block mt-0.5">
                                {diff['Lingkungan'].from.slice(11)} → {diff['Lingkungan'].to.slice(11)}
                              </span>
                            )}
                          </td>

                          <td className="p-4 font-mono text-[10px]">
                            <div>{item.tanggalLahir}</div>
                            {diff?.['Tgl Lahir'] && (
                              <span className="text-[10px] font-mono text-amber-400 block mt-0.5">
                                {diff['Tgl Lahir'].from} → {diff['Tgl Lahir'].to}
                              </span>
                            )}
                          </td>

                          <td className="p-4 font-mono">
                            <div>{item.telepon || '-'}</div>
                            {diff?.['Telepon'] && (
                              <span className="text-[9px] font-mono text-amber-400 block mt-0.5 truncate">
                                {diff['Telepon'].from} → {diff['Telepon'].to}
                              </span>
                            )}
                          </td>

                          <td className="p-4 max-w-[150px] truncate-none text-slate-400 font-sans">
                            <div className="truncate shrink-0 max-w-[150px]">{item.alamat || '-'}</div>
                            {diff?.['Alamat'] && (
                              <span className="text-[9px] font-mono text-amber-400 block mt-0.5 truncate" title={`${diff['Alamat'].from} → ${diff['Alamat'].to}`}>
                                {diff['Alamat'].from} → {diff['Alamat'].to}
                              </span>
                            )}
                          </td>

                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="bg-[#0a0f1d] border border-[#203352] p-4 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center space-x-2 text-[11px] text-slate-400 font-sans">
                  <Info size={14} className="text-indigo-400 shrink-0" />
                  <span className="font-sans">
                    Sebanyak <strong className="text-white font-bold">{mappedRows.filter(r => selectedImportIds[r.id]).length} terpillih</strong> dari {mappedRows.length} total baris Google Sheets siap digabungkan dengan database lokal.
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleConfirmMergeData}
                  className="flex items-center space-x-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs uppercase tracking-wider px-6 py-3.5 rounded-xl transition-all shadow-md active:scale-95 cursor-pointer"
                >
                  <ShieldCheck size={14} />
                  <span>Konfirmasi & Gabungkan Data</span>
                </button>
              </div>

            </div>
          )}

        </div>
      )}

    </div>
  );
}
