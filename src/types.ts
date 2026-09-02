export type JenisLaporan = 'HARIAN' | 'BULANAN';

export interface Guru {
  id: string;
  nama: string;
  nip: string;
  jabatan: string;
  golongan?: string;
  statusKepegawaian?: 'PNS' | 'PPPK' | 'Honorer';
  mataPelajaran?: string;
  email?: string;
}

export interface BerkasPdfInfo {
  namaFile: string;
  ukuranFile: number;
  tanggalAtauPeriode: string; // e.g. "2026-09-02" or "2026-09"
  periodeLabel: string;       // e.g. "Rabu, 2 September 2026" or "September 2026"
  driveFileId?: string;
  driveLink?: string;
  waktuUnggah: string;
}

export interface RiwayatPengiriman {
  id: string;
  guruId: string;
  namaPengirim: string;
  nip: string;
  jabatan: string;
  waktuKirim: string; // ISO string
  fileHarian?: BerkasPdfInfo | null;
  fileBulanan?: BerkasPdfInfo | null;
  statusSync: 'TERSIMPAN_DRIVE' | 'PENDING_SYNC' | 'LOCAL_ONLY';
  driveFolderName?: string;
  sheetRowSynced?: boolean;
}

// Legacy alias for compatibility
export type LaporanSikawan = RiwayatPengiriman;

export interface GoogleAuthUser {
  email: string;
  name: string;
  picture?: string;
  accessToken: string;
  expiresAt: number;
}

export interface GoogleFolderInfo {
  id: string;
  name: string;
  webViewLink?: string;
}

export interface SpreadsheetConfig {
  spreadsheetId: string;
  spreadsheetUrl: string;
  sheetNameGuru: string;
  sheetNameRiwayat: string;
}

