import React, { useState } from 'react';
import { 
  AlertTriangle, 
  CheckCircle2, 
  Pause, 
  Play, 
  Volume2, 
  UserX,
  Sparkles
} from 'lucide-react';
import { Guru } from '../types';

interface HeaderTickerProps {
  unsubmittedTeachers: Guru[];
  totalTeachersCount: number;
  onSelectTeacher?: (guru: Guru) => void;
}

export const HeaderTicker: React.FC<HeaderTickerProps> = ({
  unsubmittedTeachers,
  totalTeachersCount,
  onSelectTeacher,
}) => {
  const [isPausedManual, setIsPausedManual] = useState(false);

  const hasUnsubmitted = unsubmittedTeachers.length > 0;

  // Render the repeating content item
  const renderTickerContent = (keyPrefix: string) => {
    if (!hasUnsubmitted) {
      return (
        <div key={keyPrefix} className="flex items-center gap-6 px-4">
          <span className="inline-flex items-center gap-2 text-xs font-bold text-emerald-300">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            Alhamdulillah! Seluruh {totalTeachersCount} Guru SD NEGERI BABELAN KOTA 01 telah mengirimkan berkas Laporan Kinerja Sikawan 2026.
          </span>
          <span className="text-emerald-500/60">•</span>
          <span className="text-xs text-emerald-200/90 font-medium">
            Terima kasih atas dedikasi, kedisiplinan, dan integritas Bapak/Ibu Dewan Guru.
          </span>
          <span className="text-emerald-500/60">•</span>
        </div>
      );
    }

    return (
      <div key={keyPrefix} className="flex items-center gap-4 px-4">
        {/* Leading Alert Notice */}
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-rose-900/90 text-rose-200 text-xs font-extrabold uppercase tracking-wide border border-rose-700/80">
          <AlertTriangle className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
          PEMBERITAHUAN PENTING:
        </span>

        <span className="text-xs font-semibold text-slate-200">
          Daftar Guru yang <span className="text-rose-400 font-extrabold underline underline-offset-2">BELUM MENGIRIM</span> berkas Laporan Kinerja Sikawan:
        </span>

        {/* Teacher Names Sequence */}
        {unsubmittedTeachers.map((guru, index) => (
          <React.Fragment key={`${keyPrefix}-${guru.id}`}>
            <button
              type="button"
              onClick={() => onSelectTeacher && onSelectTeacher(guru)}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-bold text-amber-300 transition-colors cursor-pointer group"
              title={`Klik untuk memilih data ${guru.nama}`}
            >
              <span className="w-4 h-4 rounded-full bg-rose-500/30 text-rose-300 text-[10px] font-black flex items-center justify-center">
                {index + 1}
              </span>
              <span className="group-hover:underline text-slate-100 font-bold">
                {guru.nama}
              </span>
              <span className="text-[11px] text-slate-400 font-normal">
                ({guru.jabatan})
              </span>
            </button>
            <span className="text-slate-600 font-bold">•</span>
          </React.Fragment>
        ))}

        {/* Closing Action Advice */}
        <span className="text-xs font-medium text-amber-200/90 italic">
          Mohon Bapak/Ibu yang namanya tertera untuk segera mengunggah berkas PDF Laporan Kinerja Sikawan ke sistem aplikasi ini.
        </span>

        <span className="text-slate-600 font-bold">•</span>
      </div>
    );
  };

  return (
    <div 
      className={`border-t relative overflow-hidden transition-colors ${
        hasUnsubmitted 
          ? 'bg-slate-950 border-slate-800 text-slate-200' 
          : 'bg-emerald-950 border-emerald-800/80 text-emerald-100'
      }`}
      role="region"
      aria-label="Pengumuman Berjalan Guru Belum Mengirim Sikawan"
    >
      <div className="max-w-7xl mx-auto flex items-center h-10 px-2 sm:px-4">
        
        {/* Pinned Left Badge */}
        <div className="relative z-10 shrink-0 flex items-center gap-2 pr-3 py-1 shadow-sm">
          {hasUnsubmitted ? (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-rose-600 text-white shadow-xs">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-200 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
              </span>
              <span className="text-xs font-black tracking-wide uppercase hidden xs:inline">
                Belum Kirim
              </span>
              <span className="px-1.5 py-0.2 text-[10px] font-black rounded-full bg-rose-950 text-rose-200">
                {unsubmittedTeachers.length} Guru
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-600 text-white shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-emerald-200" />
              <span className="text-xs font-bold hidden xs:inline">
                Status Sikawan
              </span>
              <span className="px-1.5 py-0.2 text-[10px] font-bold rounded-full bg-emerald-900 text-emerald-100">
                100% Lengkap
              </span>
            </div>
          )}

          {/* Vertical divider */}
          <div className={`h-4 w-px ${hasUnsubmitted ? 'bg-slate-800' : 'bg-emerald-800'}`} />
        </div>

        {/* Marquee Ticker Area */}
        <div 
          className="flex-1 overflow-hidden relative flex items-center h-full cursor-default select-none"
          title="Arahkan mouse / sentuh untuk menjeda teks berjalan"
        >
          {/* Subtle Left Fade Gradient */}
          <div className={`absolute left-0 top-0 bottom-0 w-6 z-10 pointer-events-none bg-gradient-to-r ${
            hasUnsubmitted ? 'from-slate-950 to-transparent' : 'from-emerald-950 to-transparent'
          }`} />

          {/* Subtle Right Fade Gradient */}
          <div className={`absolute right-0 top-0 bottom-0 w-6 z-10 pointer-events-none bg-gradient-to-l ${
            hasUnsubmitted ? 'from-slate-950 to-transparent' : 'from-emerald-950 to-transparent'
          }`} />

          {/* Running Animated Text Container */}
          <div 
            className="flex shrink-0 animate-marquee items-center"
            style={{
              animationPlayState: isPausedManual ? 'paused' : undefined,
              animationDuration: hasUnsubmitted ? `${Math.max(28, unsubmittedTeachers.length * 6)}s` : '32s'
            }}
          >
            {renderTickerContent('loop-1')}
            {renderTickerContent('loop-2')}
          </div>
        </div>

        {/* Right Action: Pause/Play Manual Toggle Button */}
        <div className="relative z-10 shrink-0 pl-2">
          <button
            type="button"
            onClick={() => setIsPausedManual(!isPausedManual)}
            className={`p-1 rounded-md text-xs transition-colors cursor-pointer flex items-center gap-1 ${
              hasUnsubmitted 
                ? 'text-slate-400 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-800' 
                : 'text-emerald-300 hover:text-white bg-emerald-900/60 hover:bg-emerald-800 border border-emerald-800'
            }`}
            title={isPausedManual ? 'Jalankan Teks Berjalan' : 'Jeda Teks Berjalan'}
            aria-label={isPausedManual ? 'Jalankan Teks Berjalan' : 'Jeda Teks Berjalan'}
          >
            {isPausedManual ? (
              <Play className="w-3.5 h-3.5" />
            ) : (
              <Pause className="w-3.5 h-3.5" />
            )}
          </button>
        </div>

      </div>
    </div>
  );
};
