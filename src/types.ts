export interface Anggota {
  id: string;
  nama: string;
  jenisKelamin: 'Laki-laki' | 'Perempuan';
  lingkungan: string;
  tanggalLahir: string;
  telepon: string;
  alamat: string;
  status: 'Aktif' | 'Non-aktif';
  tanggalDaftar: string;
}

export interface Pengguna {
  id: string;
  nama: string;
  email: string;
  peran: 'Administrator' | 'Operator';
  status: 'Aktif' | 'Non-aktif';
}

export const LINGKUNGAN_LIST = [
  'LINGKUNGAN KOTAWI',
  'LINGKUNGAN TELMA UTARA',
  'LINGKUNGAN TELMA SELATAN',
  'LINGKUNGAN WAIGEO SELATAN',
  'LINGKUNGAN ALIF KORERE',
  'LINGKUNGAN WAIGEO BARAT KEPULAUAN',
  'LINGKUNGAN WAIGEO BARAT DARATAN',
];
