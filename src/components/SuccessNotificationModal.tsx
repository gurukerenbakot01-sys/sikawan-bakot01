import React, { useEffect } from 'react';
import { 
  CheckCircle, 
  ExternalLink, 
  FolderCheck, 
  FileText, 
  X, 
  Calendar,
  CalendarRange,
  Sparkles,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { RiwayatPengiriman } from '../types';

interface SuccessNotificationModalProps {
  laporan: RiwayatPengiriman | null;
  onClose: () => void;
}

export const SuccessNotificationModal: React.FC<SuccessNotificationModalProps> = ({
  laporan,
  onClose,
}) => {
  useEffect(() => {
    if (!laporan) return;

    // Trigger celebration confetti
    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#059669', '#0d9488', '#10b981', '#34d399', '#f59e0b'],
      });
    } catch (e) {
      console.warn('Confetti error', e);
    }

    // Play pleasant Web Audio chime sound
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        const ctx = new AudioContextClass();
        const now = ctx.currentTime;
        
        // Two-tone friendly chime: E5 -> A5
        const osc1 = ctx.createOscillator();
        const gain1 = ctx.createGain();
        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(659.25, now); // E5
        gain1.gain.setValueAtTime(0.12, now);
        gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
        osc1.connect(gain1);
        gain1.connect(ctx.destination);
        osc1.start(now);
        osc1.stop(now + 0.35);

        const osc2 = ctx.createOscillator();
        const gain2 = ctx.createGain();
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(880, now + 0.15); // A5
        gain2.gain.setValueAtTime(0.15, now + 0.15);
        gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
        osc2.connect(gain2);
        gain2.connect(ctx.destination);
        osc2.start(now + 0.15);
        osc2.stop(now + 0.6);
      }
    } catch (e) {
      // Audio autoplay policy might restrict, ignore silently
    }
  }, [laporan]);

  if (!laporan) return null;

  const hasHarian = Boolean(laporan.fileHarian);
  const hasBulanan = Boolean(laporan.fileBulanan);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-emerald-100 max-w-lg w-full overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header with celebratory banner */}
        <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white p-6 relative">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full text-white/80 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-white text-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-950/20 shrink-0">
              <CheckCircle className="w-7 h-7 text-emerald-600 animate-bounce" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span className="text-xs uppercase tracking-wider font-bold text-emerald-100">
                  Pengunggahan Berhasil
                </span>
              </div>
              <h3 className="text-lg font-extrabold text-white mt-0.5">
                {hasHarian && hasBulanan
                  ? 'Laporan Harian & Bulanan Tersimpan'
                  : hasHarian
                  ? 'Laporan Sikawan Harian Tersimpan'
                  : 'Laporan Sikawan Bulanan Tersimpan'}
              </h3>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-4">
          <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-xl p-3.5 flex items-start gap-3">
            <FolderCheck className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
            <div className="text-xs text-emerald-900 leading-relaxed">
              <p className="font-bold text-emerald-950">
                Otomatis Tersimpan di Google Drive & Tersinkronkan!
              </p>
              <p className="text-emerald-800 mt-0.5">
                Berkas PDF telah masuk ke Folder <span className="font-semibold">"{laporan.driveFolderName || 'SIKAWAN SD NEGERI BABELAN KOTA 01 - 2026'}"</span> dan riwayat tercatat di Google Spreadsheet.
              </p>
            </div>
          </div>

          {/* Details Table */}
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 text-xs space-y-2.5">
            <div className="flex items-start justify-between pb-2 border-b border-slate-200/70">
              <span className="text-slate-500 font-medium">Nama Guru:</span>
              <span className="font-bold text-slate-900 text-right">{laporan.namaPengirim}</span>
            </div>

            <div className="flex items-center justify-between pb-2 border-b border-slate-200/70">
              <span className="text-slate-500 font-medium">NIP Guru:</span>
              <span className="font-mono text-slate-800 font-semibold">{laporan.nip}</span>
            </div>

            {/* File Harian summary */}
            {laporan.fileHarian && (
              <div className="p-2.5 bg-emerald-50/80 border border-emerald-200 rounded-lg">
                <div className="flex items-center justify-between font-semibold text-emerald-900 mb-1">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                    <span>File Harian ({laporan.fileHarian.periodeLabel})</span>
                  </span>
                  {laporan.fileHarian.driveLink && (
                    <a
                      href={laporan.fileHarian.driveLink}
                      target="_blank"
                      rel="noreferrer"
                      className="text-emerald-700 hover:text-emerald-900 underline flex items-center gap-1 text-[11px]"
                    >
                      <span>Lihat File</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
                <div className="font-mono text-[11px] text-slate-700 truncate">
                  {laporan.fileHarian.namaFile}
                </div>
              </div>
            )}

            {/* File Bulanan summary */}
            {laporan.fileBulanan && (
              <div className="p-2.5 bg-teal-50/80 border border-teal-200 rounded-lg">
                <div className="flex items-center justify-between font-semibold text-teal-900 mb-1">
                  <span className="flex items-center gap-1.5">
                    <CalendarRange className="w-3.5 h-3.5 text-teal-600" />
                    <span>File Bulanan ({laporan.fileBulanan.periodeLabel})</span>
                  </span>
                  {laporan.fileBulanan.driveLink && (
                    <a
                      href={laporan.fileBulanan.driveLink}
                      target="_blank"
                      rel="noreferrer"
                      className="text-teal-700 hover:text-teal-900 underline flex items-center gap-1 text-[11px]"
                    >
                      <span>Lihat File</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
                <div className="font-mono text-[11px] text-slate-700 truncate">
                  {laporan.fileBulanan.namaFile}
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex flex-col sm:flex-row gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="w-full py-2.5 px-5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              Tutup & Buat Pengiriman Baru
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
