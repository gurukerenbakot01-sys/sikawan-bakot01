import React, { useState } from 'react';
import { 
  X, 
  FolderCheck, 
  TableProperties, 
  CheckCircle2, 
  ExternalLink, 
  PlusCircle, 
  RefreshCw, 
  AlertCircle,
  LogIn,
  LogOut,
  Sparkles,
  ShieldCheck,
  FolderOpen
} from 'lucide-react';
import { GoogleAuthUser, GoogleFolderInfo } from '../types';

interface GoogleConnectModalProps {
  isOpen: boolean;
  onClose: () => void;
  authUser: GoogleAuthUser | null;
  driveFolder: GoogleFolderInfo | null;
  spreadsheetId: string | null;
  onLogin: () => void;
  onLogout: () => void;
  onCreateSpreadsheet: () => Promise<void>;
  onSetSpreadsheetId: (id: string) => void;
  isCreatingSheet: boolean;
}

export const GoogleConnectModal: React.FC<GoogleConnectModalProps> = ({
  isOpen,
  onClose,
  authUser,
  driveFolder,
  spreadsheetId,
  onLogin,
  onLogout,
  onCreateSpreadsheet,
  onSetSpreadsheetId,
  isCreatingSheet,
}) => {
  const [customIdInput, setCustomIdInput] = useState(spreadsheetId || '');
  const [inputFeedback, setInputFeedback] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleApplyId = () => {
    let cleanId = customIdInput.trim();
    // Extract ID if full URL pasted
    if (cleanId.includes('spreadsheets/d/')) {
      const match = cleanId.match(/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
      if (match && match[1]) {
        cleanId = match[1];
      }
    }

    if (cleanId) {
      onSetSpreadsheetId(cleanId);
      setInputFeedback('ID Spreadsheet berhasil disimpan dan dihubungkan!');
      setTimeout(() => setInputFeedback(null), 3000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-xl w-full overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
              <TableProperties className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Pengaturan Database Google Drive & Sheets
              </h3>
              <p className="text-xs text-slate-500">
                Integrasi penyimpanan berkas PDF dan sinkronisasi data guru
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-5 max-h-[80vh] overflow-y-auto">
          
          {/* Section 1: Google Account Status */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                Status Akun Google Workspace
              </span>
              {authUser ? (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Terhubung
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-md">
                  Belum Terhubung
                </span>
              )}
            </div>

            {authUser ? (
              <div className="flex items-center justify-between gap-3 mt-3 pt-3 border-t border-slate-200/60">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-xs">
                    {authUser.name.substring(0, 2).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-slate-900 truncate">{authUser.name}</div>
                    <div className="text-[11px] text-slate-500 truncate">{authUser.email}</div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={onLogout}
                  className="px-3 py-1.5 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition-colors"
                >
                  Putuskan
                </button>
              </div>
            ) : (
              <div className="mt-3">
                <p className="text-xs text-slate-600 mb-3">
                  Hubungkan akun Google untuk mengaktifkan pengunggahan berkas PDF otomatis langsung ke Google Drive dan sinkronisasi baris data ke Google Spreadsheet Anda.
                </p>
                <button
                  type="button"
                  onClick={onLogin}
                  className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Login dengan Google Workspace (gurukeren.bakot01@gmail.com)</span>
                </button>
              </div>
            )}
          </div>

          {/* Section 2: Google Drive Folder */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                Folder Penyimpanan Google Drive
              </span>
              <span className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
                <FolderCheck className="w-3.5 h-3.5" />
                Otomatis Dikelola
              </span>
            </div>

            <p className="text-xs text-slate-600 mb-3">
              Semua berkas PDF Laporan Sikawan Harian dan Bulanan akan disimpan di folder Drive khusus sekolah:
            </p>

            <div className="p-3 bg-white rounded-lg border border-slate-200 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <FolderOpen className="w-5 h-5 text-emerald-600 shrink-0" />
                <span className="text-xs font-mono font-bold text-slate-800 truncate">
                  SIKAWAN SD NEGERI BABELAN KOTA 01 - 2026
                </span>
              </div>
              {driveFolder && (
                <a
                  href={driveFolder.webViewLink || `https://drive.google.com/drive/folders/${driveFolder.id}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 shrink-0"
                >
                  <span>Buka</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
          </div>

          {/* Section 3: Google Sheets Database */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                Database Google Spreadsheet
              </span>
              <span className="text-[11px] text-teal-700 font-semibold flex items-center gap-1">
                <TableProperties className="w-3.5 h-3.5" />
                Dua Tab Data
              </span>
            </div>

            <p className="text-xs text-slate-600 mb-3 leading-relaxed">
              Aplikasi ini mengintegrasikan master data Guru dari tab <span className="font-semibold text-slate-800">DATA_GURU</span> dan secara otomatis mencatat setiap pengiriman ke tab <span className="font-semibold text-slate-800">RIWAYAT_SIKAWAN</span>.
            </p>

            {/* Action 1: Create Starter Spreadsheet */}
            <div className="mb-4">
              <button
                type="button"
                onClick={onCreateSpreadsheet}
                disabled={isCreatingSheet}
                className="w-full py-2.5 px-4 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl shadow-xs flex items-center justify-center gap-2 transition-colors disabled:opacity-60 cursor-pointer"
              >
                {isCreatingSheet ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Membuat Spreadsheet di Google Drive...</span>
                  </>
                ) : (
                  <>
                    <PlusCircle className="w-4 h-4" />
                    <span>Buat Database Spreadsheet Baru Otomatis di Google Drive</span>
                  </>
                )}
              </button>
            </div>

            {/* Action 2: Custom Spreadsheet URL or ID */}
            <div className="pt-3 border-t border-slate-200">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Atau Tautkan ID / Link Spreadsheet yang Sudah Ada:
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={customIdInput}
                  onChange={(e) => setCustomIdInput(e.target.value)}
                  placeholder="Masukkan Spreadsheet ID atau URL Google Sheets..."
                  className="flex-1 px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
                <button
                  type="button"
                  onClick={handleApplyId}
                  className="px-3 py-1.5 text-xs font-bold text-slate-800 bg-slate-200 hover:bg-slate-300 rounded-lg transition-colors shrink-0"
                >
                  Terapkan
                </button>
              </div>

              {inputFeedback && (
                <p className="text-[11px] text-emerald-600 font-semibold mt-1">
                  {inputFeedback}
                </p>
              )}

              {spreadsheetId && (
                <div className="mt-2 flex items-center justify-between text-xs bg-white p-2.5 rounded-lg border border-teal-200">
                  <span className="text-slate-500">ID Aktif:</span>
                  <a
                    href={`https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`}
                    target="_blank"
                    rel="noreferrer"
                    className="font-mono text-teal-800 font-bold flex items-center gap-1 truncate max-w-[260px] hover:underline"
                  >
                    <span>{spreadsheetId}</span>
                    <ExternalLink className="w-3 h-3 shrink-0" />
                  </a>
                </div>
              )}
            </div>

          </div>

        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
