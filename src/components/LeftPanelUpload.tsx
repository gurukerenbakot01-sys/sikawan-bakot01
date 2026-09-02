import React, { useState, useRef } from 'react';
import { 
  UploadCloud, 
  FileText, 
  Calendar, 
  CalendarRange, 
  CheckCircle2, 
  AlertCircle, 
  X, 
  Send, 
  FolderSync, 
  FileCheck,
  HardDrive
} from 'lucide-react';
import { Guru } from '../types';
import { DAFTAR_BULAN_2026 } from '../data/initialData';

export interface UploadPayload {
  harian?: {
    file: File;
    tanggalLaporan: string;
    periodeLabel: string;
    standardFileName: string;
  };
  bulanan?: {
    file: File;
    bulanLaporan: string;
    periodeLabel: string;
    standardFileName: string;
  };
}

interface LeftPanelUploadProps {
  selectedGuru: Guru;
  onUploadSubmit: (payload: UploadPayload) => Promise<void>;
  isUploading: boolean;
  uploadProgress: number;
}

export const LeftPanelUpload: React.FC<LeftPanelUploadProps> = ({
  selectedGuru,
  onUploadSubmit,
  isUploading,
  uploadProgress,
}) => {
  // 1. State for Sikawan Harian
  const [tanggalHarian, setTanggalHarian] = useState('2026-09-02');
  const [fileHarian, setFileHarian] = useState<File | null>(null);
  const [isDragOverHarian, setIsDragOverHarian] = useState(false);
  const fileInputHarianRef = useRef<HTMLInputElement>(null);

  // 2. State for Sikawan Bulanan
  const [bulanBulanan, setBulanBulanan] = useState('2026-09');
  const [fileBulanan, setFileBulanan] = useState<File | null>(null);
  const [isDragOverBulanan, setIsDragOverBulanan] = useState(false);
  const fileInputBulananRef = useRef<HTMLInputElement>(null);

  // General error state
  const [generalError, setGeneralError] = useState<string | null>(null);

  // Derive standardized filenames: (Nama Guru_Laporan-kinerja-pegawai-Harian atau Bulanan)
  const getStandardFileNameHarian = (): string => {
    const cleanTeacherName = selectedGuru.nama.trim().replace(/[/\\?%*:|"<>]/g, '');
    return `${cleanTeacherName}_Laporan-kinerja-pegawai-Harian.pdf`;
  };

  const getPeriodeLabelHarian = (): string => {
    try {
      const [year, month, day] = tanggalHarian.split('-');
      const dateObj = new Date(Number(year), Number(month) - 1, Number(day));
      return dateObj.toLocaleDateString('id-ID', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
    } catch {
      return tanggalHarian;
    }
  };

  const getStandardFileNameBulanan = (): string => {
    const cleanTeacherName = selectedGuru.nama.trim().replace(/[/\\?%*:|"<>]/g, '');
    return `${cleanTeacherName}_Laporan-kinerja-pegawai-Bulanan.pdf`;
  };

  const getPeriodeLabelBulanan = (): string => {
    const monthObj = DAFTAR_BULAN_2026.find((b) => b.value === bulanBulanan);
    return monthObj ? monthObj.label : bulanBulanan;
  };

  const validatePdfFile = (file: File): string | null => {
    if (!file.name.toLowerCase().endsWith('.pdf') && file.type !== 'application/pdf') {
      return 'Hanya berkas berformat PDF (.pdf) yang diizinkan.';
    }
    if (file.size > 25 * 1024 * 1024) {
      return 'Ukuran berkas PDF melebihi batas maksimum 25 MB.';
    }
    return null;
  };

  // Handlers for Harian file
  const handleHarianChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const error = validatePdfFile(file);
      if (error) {
        setGeneralError(`[Sikawan Harian] ${error}`);
      } else {
        setGeneralError(null);
        setFileHarian(file);
      }
    }
  };

  const handleHarianDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOverHarian(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      const error = validatePdfFile(file);
      if (error) {
        setGeneralError(`[Sikawan Harian] ${error}`);
      } else {
        setGeneralError(null);
        setFileHarian(file);
      }
    }
  };

  // Handlers for Bulanan file
  const handleBulananChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const error = validatePdfFile(file);
      if (error) {
        setGeneralError(`[Sikawan Bulanan] ${error}`);
      } else {
        setGeneralError(null);
        setFileBulanan(file);
      }
    }
  };

  const handleBulananDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOverBulanan(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      const error = validatePdfFile(file);
      if (error) {
        setGeneralError(`[Sikawan Bulanan] ${error}`);
      } else {
        setGeneralError(null);
        setFileBulanan(file);
      }
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  // Single submission handler (Sekali Kirim)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!fileHarian && !fileBulanan) {
      setGeneralError('Silakan pilih berkas PDF Sikawan Harian, Sikawan Bulanan, atau keduanya sebelum mengirim.');
      return;
    }

    setGeneralError(null);

    const payload: UploadPayload = {};

    if (fileHarian) {
      payload.harian = {
        file: fileHarian,
        tanggalLaporan: tanggalHarian,
        periodeLabel: getPeriodeLabelHarian(),
        standardFileName: getStandardFileNameHarian(),
      };
    }

    if (fileBulanan) {
      payload.bulanan = {
        file: fileBulanan,
        bulanLaporan: bulanBulanan,
        periodeLabel: getPeriodeLabelBulanan(),
        standardFileName: getStandardFileNameBulanan(),
      };
    }

    await onUploadSubmit(payload);

    // Reset files after successful upload
    setFileHarian(null);
    setFileBulanan(null);
    if (fileInputHarianRef.current) fileInputHarianRef.current.value = '';
    if (fileInputBulananRef.current) fileInputBulananRef.current.value = '';
  };

  // Count files ready to send
  const totalFilesReady = (fileHarian ? 1 : 0) + (fileBulanan ? 1 : 0);

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5 mt-4">
      {/* Section Header */}
      <div className="flex items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
            <UploadCloud className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
              2. Pengiriman File PDF Sikawan
            </h2>
            <p className="text-xs text-slate-500">
              Unggah berkas Harian dan Bulanan, lalu kirim sekaligus dalam satu kali klik
            </p>
          </div>
        </div>

        {totalFilesReady > 0 && (
          <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-emerald-100 text-emerald-800 flex items-center gap-1">
            <FileCheck className="w-3.5 h-3.5" />
            <span>{totalFilesReady} Berkas Siap</span>
          </span>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* ========================================================== */}
        {/* UNGGAHAN 1: SIKAWAN HARIAN */}
        {/* ========================================================== */}
        <div className="p-4 bg-slate-50/70 rounded-xl border border-slate-200/80 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-bold shadow-2xs">
                1
              </span>
              <label className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                <span>Unggah Berkas Sikawan Harian (PDF)</span>
              </label>
            </div>
            {fileHarian && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                <span>Terlampir</span>
              </span>
            )}
          </div>

          {/* Tanggal Laporan Harian */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">
              Tanggal Pelaksanaan Kegiatan (Tahun 2026)
            </label>
            <input
              type="date"
              value={tanggalHarian}
              min="2026-01-01"
              max="2026-12-31"
              onChange={(e) => setTanggalHarian(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            />
            <p className="text-[11px] text-emerald-700 font-medium mt-1">
              Periode: {getPeriodeLabelHarian()}
            </p>
          </div>

          {/* Dropzone Harian */}
          <div>
            <input
              type="file"
              ref={fileInputHarianRef}
              accept=".pdf,application/pdf"
              onChange={handleHarianChange}
              className="hidden"
            />

            {!fileHarian ? (
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragOverHarian(true);
                }}
                onDragLeave={() => setIsDragOverHarian(false)}
                onDrop={handleHarianDrop}
                onClick={() => fileInputHarianRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all ${
                  isDragOverHarian
                    ? 'border-emerald-500 bg-emerald-50/60 scale-[0.99]'
                    : 'border-slate-300 hover:border-emerald-400 bg-white hover:bg-emerald-50/20'
                }`}
              >
                <FileText className="w-7 h-7 mx-auto text-emerald-600 mb-1" />
                <p className="text-xs font-bold text-slate-800">
                  Pilih Berkas PDF Sikawan Harian
                </p>
                <p className="text-[10px] text-slate-500 mt-0.5">
                  Format: <span className="font-semibold text-emerald-700">PDF</span> • Maksimal 25 MB
                </p>
              </div>
            ) : (
              <div className="bg-emerald-50/80 border border-emerald-200 rounded-xl p-3 relative">
                <button
                  type="button"
                  onClick={() => {
                    setFileHarian(null);
                    if (fileInputHarianRef.current) fileInputHarianRef.current.value = '';
                  }}
                  className="absolute top-2 right-2 p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-white/80"
                  title="Hapus berkas harian"
                >
                  <X className="w-4 h-4" />
                </button>

                <div className="flex items-start gap-2.5 pr-6">
                  <div className="w-8 h-8 rounded-lg bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-slate-900 truncate">
                        {fileHarian.name}
                      </span>
                      <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-emerald-200/70 text-emerald-900 shrink-0">
                        {formatFileSize(fileHarian.size)}
                      </span>
                    </div>
                    <div className="mt-1 text-[10px] font-mono text-emerald-900 font-semibold truncate">
                      {getStandardFileNameHarian()}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ========================================================== */}
        {/* UNGGAHAN 2: SIKAWAN BULANAN */}
        {/* ========================================================== */}
        <div className="p-4 bg-slate-50/70 rounded-xl border border-slate-200/80 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-teal-700 text-white flex items-center justify-center text-xs font-bold shadow-2xs">
                2
              </span>
              <label className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <CalendarRange className="w-3.5 h-3.5 text-teal-700" />
                <span>Unggah Berkas Sikawan Bulanan (PDF)</span>
              </label>
            </div>
            {fileBulanan && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-teal-100 text-teal-800 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-teal-600" />
                <span>Terlampir</span>
              </span>
            )}
          </div>

          {/* Bulan Periode Bulanan */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">
              Bulan Periode Kinerja (Tahun 2026)
            </label>
            <select
              value={bulanBulanan}
              onChange={(e) => setBulanBulanan(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
            >
              {DAFTAR_BULAN_2026.map((b) => (
                <option key={b.value} value={b.value}>
                  {b.label}
                </option>
              ))}
            </select>
          </div>

          {/* Dropzone Bulanan */}
          <div>
            <input
              type="file"
              ref={fileInputBulananRef}
              accept=".pdf,application/pdf"
              onChange={handleBulananChange}
              className="hidden"
            />

            {!fileBulanan ? (
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragOverBulanan(true);
                }}
                onDragLeave={() => setIsDragOverBulanan(false)}
                onDrop={handleBulananDrop}
                onClick={() => fileInputBulananRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all ${
                  isDragOverBulanan
                    ? 'border-teal-500 bg-teal-50/60 scale-[0.99]'
                    : 'border-slate-300 hover:border-teal-400 bg-white hover:bg-teal-50/20'
                }`}
              >
                <FileText className="w-7 h-7 mx-auto text-teal-700 mb-1" />
                <p className="text-xs font-bold text-slate-800">
                  Pilih Berkas PDF Sikawan Bulanan
                </p>
                <p className="text-[10px] text-slate-500 mt-0.5">
                  Format: <span className="font-semibold text-teal-700">PDF</span> • Maksimal 25 MB
                </p>
              </div>
            ) : (
              <div className="bg-teal-50/80 border border-teal-200 rounded-xl p-3 relative">
                <button
                  type="button"
                  onClick={() => {
                    setFileBulanan(null);
                    if (fileInputBulananRef.current) fileInputBulananRef.current.value = '';
                  }}
                  className="absolute top-2 right-2 p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-white/80"
                  title="Hapus berkas bulanan"
                >
                  <X className="w-4 h-4" />
                </button>

                <div className="flex items-start gap-2.5 pr-6">
                  <div className="w-8 h-8 rounded-lg bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-slate-900 truncate">
                        {fileBulanan.name}
                      </span>
                      <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-teal-200/70 text-teal-900 shrink-0">
                        {formatFileSize(fileBulanan.size)}
                      </span>
                    </div>
                    <div className="mt-1 text-[10px] font-mono text-teal-900 font-semibold truncate">
                      {getStandardFileNameBulanan()}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Error Alert */}
        {generalError && (
          <div className="flex items-center gap-1.5 p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-medium">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{generalError}</span>
          </div>
        )}

        {/* Storage Destination Reminder */}
        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/70 text-[11px] space-y-1 text-slate-600">
          <div className="flex items-center gap-2 text-slate-700 font-semibold">
            <FolderSync className="w-3.5 h-3.5 text-emerald-600" />
            <span>Penyimpanan Google Drive SD Negeri Babelan Kota 01:</span>
          </div>
          <p className="text-slate-500 pl-5 leading-relaxed">
            Berkas langsung tersimpan ke folder <span className="font-semibold text-slate-800">"SIKAWAN SD NEGERI BABELAN KOTA 01 - 2026"</span> dan dicatat di Google Spreadsheet.
          </p>
        </div>

        {/* SINGLE SUBMISSION BUTTON (Kirim Sekali Kirim) */}
        <button
          type="submit"
          disabled={isUploading || totalFilesReady === 0}
          className="w-full py-3.5 px-4 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-sm rounded-xl shadow-md shadow-emerald-800/15 flex items-center justify-center gap-2 transition-all active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          {isUploading ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Mengunggah Laporan ke Google Drive ({uploadProgress}%)...</span>
            </>
          ) : (
            <>
              <Send className="w-4 h-4" />
              <span>
                {totalFilesReady === 2
                  ? 'Kirim Laporan Sikawan (Harian & Bulanan)'
                  : fileHarian
                  ? 'Kirim Laporan Sikawan Harian'
                  : fileBulanan
                  ? 'Kirim Laporan Sikawan Bulanan'
                  : 'Kirim Laporan Sikawan'}
              </span>
            </>
          )}
        </button>
      </form>
    </div>
  );
};
