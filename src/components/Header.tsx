import React from 'react';
import { 
  Building2, 
  FolderCheck, 
  TableProperties, 
  CheckCircle2, 
  CloudOff, 
  LogIn, 
  LogOut, 
  ExternalLink,
  Settings,
  Sparkles
} from 'lucide-react';
import { GoogleAuthUser, GoogleFolderInfo, Guru } from '../types';
import { HeaderTicker } from './HeaderTicker';

interface HeaderProps {
  authUser: GoogleAuthUser | null;
  driveFolder: GoogleFolderInfo | null;
  spreadsheetId: string | null;
  onOpenConnectModal: () => void;
  onLogin: () => void;
  onLogout: () => void;
  unsubmittedTeachers?: Guru[];
  totalTeachersCount?: number;
  onSelectTeacher?: (guru: Guru) => void;
}

export const Header: React.FC<HeaderProps> = ({
  authUser,
  driveFolder,
  spreadsheetId,
  onOpenConnectModal,
  onLogin,
  onLogout,
  unsubmittedTeachers = [],
  totalTeachersCount = 0,
  onSelectTeacher,
}) => {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
      {/* Top bar info */}
      <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white px-4 py-1.5 text-xs font-medium">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/30">
              PEMERINTAH KABUPATEN BEKASI
            </span>
            <span className="text-slate-300 hidden sm:inline">•</span>
            <span className="text-slate-200 hidden sm:inline">TAHUN 2026</span>
            <span className="text-slate-400 hidden md:inline">•</span>
            <span className="text-emerald-300 hidden md:inline">SAMSUDIN APP</span>
          </div>

          <div className="flex items-center gap-3">
            {authUser ? (
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span className="text-emerald-300 text-xs font-medium">Google Drive & Sheets Terhubung</span>
                <span className="text-slate-400">({authUser.email})</span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 text-amber-300">
                <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                <span>Mode Penyimpanan Aktif</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main header body */}
      <div className="max-w-7xl mx-auto px-4 py-3 sm:px-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          {/* School Identity */}
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center shrink-0 p-1 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl border border-emerald-200/80 shadow-2xs">
              <img
                src="https://i.ibb.co.com/QjNqKW2Y/logo-bakot-01.png"
                alt="Logo SD Negeri Babelan Kota 01"
                className="w-full h-full object-contain filter drop-shadow-xs"
                referrerPolicy="no-referrer"
              />
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-black tracking-tight bg-gradient-to-r from-emerald-950 via-teal-900 to-emerald-800 bg-clip-text text-transparent drop-shadow-2xs">
                  SD NEGERI BABELAN KOTA 01
                </h1>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-extrabold bg-gradient-to-r from-emerald-100/90 to-teal-100/90 text-emerald-900 rounded-full border border-emerald-300 shadow-2xs">
                  <Sparkles className="w-3 h-3 text-emerald-600" />
                  <span>SIKAWAN 2026</span>
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 font-medium flex items-center gap-1.5 mt-0.5">
                <span className="font-semibold text-emerald-800">Sistem Laporan Kinerja Guru</span>
                <span className="text-slate-300 hidden sm:inline">•</span>
                <span className="hidden sm:inline">Terintegrasi Google Drive & Google Sheets</span>
              </p>
            </div>
          </div>

          {/* Integration Status Badges & Actions */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
            {/* Google Drive Status Button */}
            {driveFolder ? (
              <a
                href={driveFolder.webViewLink || `https://drive.google.com/drive/folders/${driveFolder.id}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition-colors shadow-2xs"
                title="Buka Folder Penyimpanan Sikawan di Google Drive"
              >
                <FolderCheck className="w-4 h-4 text-emerald-600" />
                <span className="hidden sm:inline">Folder Drive:</span>
                <span className="max-w-[120px] truncate font-bold">Babelan Kota 01</span>
                <ExternalLink className="w-3 h-3 text-emerald-600" />
              </a>
            ) : (
              <button
                type="button"
                onClick={onOpenConnectModal}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100 transition-colors"
              >
                <FolderCheck className="w-4 h-4 text-slate-500" />
                <span>Drive Folder Auto-Sync</span>
              </button>
            )}

            {/* Google Sheets Status Button */}
            {spreadsheetId ? (
              <a
                href={`https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-teal-50 text-teal-700 border border-teal-200 hover:bg-teal-100 transition-colors shadow-2xs"
                title="Buka Database Spreadsheet Sikawan"
              >
                <TableProperties className="w-4 h-4 text-teal-600" />
                <span className="hidden sm:inline">Database:</span>
                <span className="font-bold">Google Sheets</span>
                <ExternalLink className="w-3 h-3 text-teal-600" />
              </a>
            ) : (
              <button
                type="button"
                onClick={onOpenConnectModal}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100 transition-colors"
              >
                <TableProperties className="w-4 h-4 text-slate-500" />
                <span>Sheets Database</span>
              </button>
            )}

            {/* Settings & Auth Button */}
            {authUser ? (
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={onOpenConnectModal}
                  className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 transition-colors"
                  title="Pengaturan Google Drive & Sheets"
                >
                  <Settings className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={onLogout}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-lg text-rose-700 bg-rose-50 border border-rose-200 hover:bg-rose-100 transition-colors"
                  title="Keluar dari akun Google"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Keluar</span>
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={onLogin}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-colors"
              >
                <LogIn className="w-4 h-4" />
                <span>Hubungkan Google</span>
              </button>
            )}
          </div>

        </div>
      </div>

      {/* Running Text Marquee: Hanya bagi yang belum mengirim berkas */}
      <HeaderTicker
        unsubmittedTeachers={unsubmittedTeachers}
        totalTeachersCount={totalTeachersCount}
        onSelectTeacher={onSelectTeacher}
      />
    </header>
  );
};
