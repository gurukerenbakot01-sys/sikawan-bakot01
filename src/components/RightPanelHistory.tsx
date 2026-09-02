import React, { useState } from 'react';
import { 
  FolderCheck, 
  ExternalLink, 
  Search, 
  FileText, 
  Copy, 
  Check, 
  RefreshCw, 
  Trash2,
  HardDrive,
  Download,
  Clock,
  AlertTriangle,
  X
} from 'lucide-react';
import { Guru, RiwayatPengiriman, GoogleFolderInfo } from '../types';

interface RightPanelHistoryProps {
  riwayatList: RiwayatPengiriman[];
  selectedGuru: Guru;
  driveFolder: GoogleFolderInfo | null;
  spreadsheetId: string | null;
  onRefreshSync: () => void;
  isSyncing: boolean;
  onDeleteRiwayat?: (id: string) => void | Promise<void>;
}

export const RightPanelHistory: React.FC<RightPanelHistoryProps> = ({
  riwayatList,
  selectedGuru,
  driveFolder,
  spreadsheetId,
  onRefreshSync,
  isSyncing,
  onDeleteRiwayat,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterGuruScope, setFilterGuruScope] = useState<'ALL_GURU' | 'SELECTED_GURU'>('ALL_GURU');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [itemToDelete, setItemToDelete] = useState<RiwayatPengiriman | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleExecuteDelete = async () => {
    if (!itemToDelete || !onDeleteRiwayat) return;
    try {
      setIsDeleting(true);
      await onDeleteRiwayat(itemToDelete.id);
      setItemToDelete(null);
    } finally {
      setIsDeleting(false);
    }
  };

  // Filter list
  const filteredList = riwayatList.filter((item) => {
    // 1. Teacher filter
    if (filterGuruScope === 'SELECTED_GURU' && item.guruId !== selectedGuru.id) {
      return false;
    }

    // 2. Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchPengirim = item.namaPengirim.toLowerCase().includes(q);
      const matchNip = item.nip.toLowerCase().includes(q);
      const matchHarian = item.fileHarian?.namaFile.toLowerCase().includes(q) || item.fileHarian?.periodeLabel.toLowerCase().includes(q);
      const matchBulanan = item.fileBulanan?.namaFile.toLowerCase().includes(q) || item.fileBulanan?.periodeLabel.toLowerCase().includes(q);
      return matchPengirim || matchNip || Boolean(matchHarian) || Boolean(matchBulanan);
    }

    return true;
  });

  const totalCount = riwayatList.length;

  const handleCopyLink = (url: string, id: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const formatFileSize = (bytes: number): string => {
    if (!bytes) return '0 B';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const formatTime = (isoString: string): string => {
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return isoString;
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5 flex flex-col h-full">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold shadow-xs">
            <FolderCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                Riwayat Pengiriman Guru
              </h2>
              <span className="px-2 py-0.5 text-[10px] font-bold bg-emerald-100 text-emerald-800 rounded-full">
                Google Drive
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Tersimpan di folder Drive & tersinkronisasi dengan Google Spreadsheet
            </p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onRefreshSync}
            disabled={isSyncing}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors cursor-pointer"
            title="Sinkronkan data riwayat"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-slate-500 ${isSyncing ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Sinkronkan</span>
          </button>

          {driveFolder?.webViewLink && (
            <a
              href={driveFolder.webViewLink}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors"
              title="Buka Folder Sikawan 2026 di Google Drive"
            >
              <HardDrive className="w-3.5 h-3.5" />
              <span>Folder Drive</span>
              <ExternalLink className="w-3 h-3 text-emerald-600" />
            </a>
          )}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="py-3.5 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 border-b border-slate-100">
        <div className="relative flex-1">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Cari Nama Pengirim, NIP, atau Berkas PDF..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
          />
        </div>

        {/* Teacher Scope Filter */}
        <div className="flex rounded-lg border border-slate-200 bg-slate-100 p-0.5 text-xs font-semibold shrink-0">
          <button
            type="button"
            onClick={() => setFilterGuruScope('ALL_GURU')}
            className={`px-3 py-1 rounded-md transition-all ${
              filterGuruScope === 'ALL_GURU'
                ? 'bg-white text-slate-900 shadow-2xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Semua Guru ({totalCount})
          </button>
          <button
            type="button"
            onClick={() => setFilterGuruScope('SELECTED_GURU')}
            className={`px-3 py-1 rounded-md transition-all ${
              filterGuruScope === 'SELECTED_GURU'
                ? 'bg-white text-emerald-800 shadow-2xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
            title={`Hanya riwayat dari ${selectedGuru.nama}`}
          >
            Guru Terpilih
          </button>
        </div>
      </div>

      {/* Table Container - Compact with Clear Dividers */}
      <div className="flex-1 overflow-auto mt-3">
        {filteredList.length === 0 ? (
          <div className="text-center py-16 px-4 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
            <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
              <FileText className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-800">
              Belum Ada Riwayat Pengiriman
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 leading-relaxed">
              Silakan pilih berkas PDF Sikawan Harian dan/atau Bulanan pada formulir di sebelah kiri, kemudian klik tombol kirim.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-slate-300 shadow-2xs">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-300 uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-4 border-r border-slate-200">Nama Pengirim</th>
                  <th className="py-3 px-3 border-r border-slate-200 text-center w-36">File Harian</th>
                  <th className="py-3 px-3 border-r border-slate-200 text-center w-36">File Bulanan</th>
                  <th className="py-3 px-3 text-center w-20">Aksi</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y-2 divide-slate-200">
                {filteredList.map((item) => {
                  const driveUrlHarian = item.fileHarian?.driveLink || (item.fileHarian?.driveFileId ? `https://drive.google.com/file/d/${item.fileHarian.driveFileId}/view` : null);
                  const driveUrlBulanan = item.fileBulanan?.driveLink || (item.fileBulanan?.driveFileId ? `https://drive.google.com/file/d/${item.fileBulanan.driveFileId}/view` : null);

                  return (
                    <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* 1. Nama Pengirim: Hanya nama guru, NIP, dan waktu pengiriman */}
                      <td className="py-3.5 px-4 align-middle border-r border-slate-200">
                        <div className="font-bold text-slate-900 text-xs sm:text-sm leading-snug">
                          {item.namaPengirim}
                        </div>
                        <div className="text-[11px] font-mono text-slate-700 mt-1">
                          <span className="font-sans font-medium text-slate-400">NIP: </span>
                          <span className="font-semibold text-slate-800 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200/60">
                            {item.nip}
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-500 mt-1.5 flex items-center gap-1.5">
                          <Clock className="w-3 h-3 text-slate-400 shrink-0" />
                          <span>{formatTime(item.waktuKirim)}</span>
                        </div>
                      </td>

                      {/* 2. File Harian: Hanya Tombol Unduh File */}
                      <td className="py-3.5 px-3 align-middle text-center border-r border-slate-200">
                        {item.fileHarian ? (
                          <a
                            href={driveUrlHarian || '#'}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-semibold text-xs rounded-lg shadow-2xs transition-all cursor-pointer whitespace-nowrap"
                            title={`Unduh Sikawan Harian: ${item.fileHarian.namaFile} (${item.fileHarian.periodeLabel})`}
                          >
                            <Download className="w-3.5 h-3.5" />
                            <span>Unduh File</span>
                          </a>
                        ) : (
                          <span className="text-slate-400 font-medium text-xs">-</span>
                        )}
                      </td>

                      {/* 3. File Bulanan: Hanya Tombol Unduh File */}
                      <td className="py-3.5 px-3 align-middle text-center border-r border-slate-200">
                        {item.fileBulanan ? (
                          <a
                            href={driveUrlBulanan || '#'}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 bg-teal-700 hover:bg-teal-800 active:scale-95 text-white font-semibold text-xs rounded-lg shadow-2xs transition-all cursor-pointer whitespace-nowrap"
                            title={`Unduh Sikawan Bulanan: ${item.fileBulanan.namaFile} (${item.fileBulanan.periodeLabel})`}
                          >
                            <Download className="w-3.5 h-3.5" />
                            <span>Unduh File</span>
                          </a>
                        ) : (
                          <span className="text-slate-400 font-medium text-xs">-</span>
                        )}
                      </td>

                      {/* 4. Aksi */}
                      <td className="py-3.5 px-3 align-middle text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1">
                          {/* Copy link action */}
                          {(driveUrlHarian || driveUrlBulanan) && (
                            <button
                              type="button"
                              onClick={() => handleCopyLink(driveUrlHarian || driveUrlBulanan || '', item.id)}
                              className="p-1.5 text-slate-500 hover:text-emerald-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                              title="Salin Tautan Google Drive"
                            >
                              {copiedId === item.id ? (
                                <Check className="w-3.5 h-3.5 text-emerald-600" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </button>
                          )}

                          {/* Delete action */}
                          {onDeleteRiwayat && (
                            <button
                              type="button"
                              onClick={() => setItemToDelete(item)}
                              className="p-1.5 text-rose-600 hover:text-white hover:bg-rose-600 bg-rose-50 hover:border-rose-600 rounded-lg transition-all cursor-pointer border border-rose-200/90 shadow-2xs active:scale-95 flex items-center justify-center"
                              title="Hapus Catatan Riwayat & Database Riwayat_sikawan"
                              aria-label={`Hapus Riwayat ${item.namaPengirim}`}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="pt-3 mt-3 border-t border-slate-100 text-[11px] text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2">
        <span>Menampilkan {filteredList.length} dari {totalCount} pengiriman</span>
        <span className="font-semibold text-emerald-700">Tahun 2026 • SD Negeri Babelan Kota 01</span>
      </div>

      {/* Interactive Confirmation Modal for Deleting History */}
      {itemToDelete && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-150"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden">
            {/* Modal Header */}
            <div className="p-4 bg-rose-50 border-b border-rose-100 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center font-bold">
                  <Trash2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Hapus Catatan Riwayat Pengiriman
                  </h3>
                  <p className="text-[11px] text-rose-700 font-medium">
                    Konfirmasi Penghapusan Data
                  </p>
                </div>
              </div>
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setItemToDelete(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-white/80 transition-colors"
                title="Tutup dialog"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-5 space-y-3.5">
              <p className="text-xs text-slate-700 leading-relaxed">
                Apakah Anda yakin ingin menghapus catatan pengiriman berkas guru berikut?
              </p>

              {/* Guru Info Card */}
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1.5">
                <div className="font-bold text-slate-900 text-sm">
                  {itemToDelete.namaPengirim}
                </div>
                <div className="text-xs font-mono text-slate-700">
                  <span className="font-sans text-slate-400">NIP: </span>
                  <span className="font-semibold text-slate-800 bg-white px-1.5 py-0.5 rounded border border-slate-200">
                    {itemToDelete.nip}
                  </span>
                </div>
                <div className="text-[11px] text-slate-500 flex items-center gap-1 pt-0.5">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>Waktu Kirim: {formatTime(itemToDelete.waktuKirim)}</span>
                </div>
                <div className="pt-2 border-t border-slate-200/60 text-[11px] text-slate-600 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-slate-500">Berkas Harian:</span>
                    <span className="font-semibold text-emerald-800 truncate max-w-[220px]">
                      {itemToDelete.fileHarian?.namaFile || 'Tidak ada'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-slate-500">Berkas Bulanan:</span>
                    <span className="font-semibold text-teal-800 truncate max-w-[220px]">
                      {itemToDelete.fileBulanan?.namaFile || 'Tidak ada'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Database Warning */}
              <div className="flex items-start gap-2.5 p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-xs">
                <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
                <div className="text-[11px] leading-relaxed">
                  {spreadsheetId ? (
                    <span>
                      Catatan riwayat akan dihapus dan otomatis baris pada database <strong className="font-bold text-amber-950">RIWAYAT_SIKAWAN</strong> di Google Spreadsheet Anda akan dihapus juga.
                    </span>
                  ) : (
                    <span>
                      Catatan riwayat pengiriman ini akan dihapus dari aplikasi.
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="p-4 bg-slate-50/80 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setItemToDelete(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-200/70 rounded-xl transition-colors cursor-pointer disabled:opacity-50"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleExecuteDelete}
                className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition-all shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-60 active:scale-95"
              >
                {isDeleting ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Menghapus...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Ya, Hapus Sekarang</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
