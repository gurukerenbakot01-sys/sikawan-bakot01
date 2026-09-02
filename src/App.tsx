import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Header 
} from './components/Header';
import { 
  LeftPanelTeacher 
} from './components/LeftPanelTeacher';
import { 
  LeftPanelUpload 
} from './components/LeftPanelUpload';
import { 
  RightPanelHistory 
} from './components/RightPanelHistory';
import { 
  SuccessNotificationModal 
} from './components/SuccessNotificationModal';
import { 
  GoogleConnectModal 
} from './components/GoogleConnectModal';
import { 
  UploadPayload 
} from './components/LeftPanelUpload';

import { 
  Guru, 
  RiwayatPengiriman,
  BerkasPdfInfo,
  GoogleAuthUser, 
  GoogleFolderInfo 
} from './types';
import { 
  INITIAL_GURU_LIST, 
  INITIAL_RIWAYAT_LIST 
} from './data/initialData';
import { 
  getStoredUser, 
  saveUser, 
  clearUser, 
  requestGoogleLogin 
} from './services/googleAuth';
import { 
  ensureDriveFolder, 
  uploadPdfToGoogleDrive, 
  FOLDER_SIKAWAN_NAME 
} from './services/googleDrive';
import { 
  getStoredSpreadsheetId, 
  saveStoredSpreadsheetId, 
  createSikawanSpreadsheet, 
  appendReportToSheet, 
  fetchTeachersFromSheet,
  deleteReportFromSheet,
  DEFAULT_SPREADSHEET_TITLE
} from './services/googleSheets';
import { 
  AlertCircle, 
  CheckCircle, 
  Info, 
  Sparkles,
  RefreshCw
} from 'lucide-react';

const STORAGE_KEY_RIWAYAT = 'sikawan_riwayat_data_2026';
const STORAGE_KEY_GURU = 'sikawan_guru_data_2026';

export default function App() {
  // 1. Authentication & Google Integrations State
  const [authUser, setAuthUser] = useState<GoogleAuthUser | null>(() => getStoredUser());
  const [driveFolder, setDriveFolder] = useState<GoogleFolderInfo | null>(() => {
    return {
      id: 'folder-sdn-babelankota01-2026',
      name: FOLDER_SIKAWAN_NAME,
      webViewLink: 'https://drive.google.com/drive/folders/sdn-babelan-kota-01-2026',
    };
  });
  const [spreadsheetId, setSpreadsheetId] = useState<string | null>(() => getStoredSpreadsheetId());
  const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);
  const [isCreatingSheet, setIsCreatingSheet] = useState(false);

  // 2. Core Data State (Guru & Riwayat)
  const [guruList, setGuruList] = useState<Guru[]>(() => {
    try {
      const cached = localStorage.getItem(STORAGE_KEY_GURU);
      return cached ? JSON.parse(cached) : INITIAL_GURU_LIST;
    } catch {
      return INITIAL_GURU_LIST;
    }
  });

  const [selectedGuru, setSelectedGuru] = useState<Guru>(() => guruList[0] || INITIAL_GURU_LIST[0]);

  const [riwayatList, setRiwayatList] = useState<RiwayatPengiriman[]>(() => {
    try {
      const cached = localStorage.getItem(STORAGE_KEY_RIWAYAT);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed)) {
          // Exclude any default/sample data bawaan aplikasi
          return parsed.filter((item: RiwayatPengiriman) => !item.id.startsWith('lap-00'));
        }
      }
      return INITIAL_RIWAYAT_LIST;
    } catch {
      return INITIAL_RIWAYAT_LIST;
    }
  });

  // 3. Upload & Action States
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [successLaporan, setSuccessLaporan] = useState<RiwayatPengiriman | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isSyncingTeachers, setIsSyncingTeachers] = useState(false);

  // 4. Toast notifications
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4500);
  }, []);

  const handleDeleteRiwayat = useCallback(async (id: string) => {
    // Remove from local state immediately
    setRiwayatList((prev) => prev.filter((item) => item.id !== id));

    // If connected to Google Sheets, delete from database RIWAYAT_SIKAWAN automatically
    if (authUser && spreadsheetId) {
      try {
        const deletedFromSheet = await deleteReportFromSheet(authUser.accessToken, spreadsheetId, id);
        if (deletedFromSheet) {
          showToast('Catatan riwayat dan database RIWAYAT_SIKAWAN di Google Sheets berhasil dihapus.', 'success');
          return;
        }
      } catch (err) {
        console.warn('Gagal menghapus baris dari Google Sheets:', err);
      }
    }

    showToast('Catatan riwayat berhasil dihapus.', 'info');
  }, [authUser, spreadsheetId, showToast]);

  // Save riwayat to localStorage whenever updated
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_RIWAYAT, JSON.stringify(riwayatList));
    } catch (e) {
      console.warn('Failed to persist riwayat list', e);
    }
  }, [riwayatList]);

  // Save guru to localStorage whenever updated
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_GURU, JSON.stringify(guruList));
    } catch (e) {
      console.warn('Failed to persist guru list', e);
    }
  }, [guruList]);

  // List of teachers who have NOT yet submitted any Sikawan report
  const unsubmittedTeachers = useMemo(() => {
    return guruList.filter((g) => !riwayatList.some((r) => r.guruId === g.id));
  }, [guruList, riwayatList]);

  // Initialize Drive Folder when user logs in
  const setupDriveFolder = useCallback(async (token: string) => {
    try {
      const folder = await ensureDriveFolder(token);
      setDriveFolder(folder);
      return folder;
    } catch (err: any) {
      console.warn('Error setting up Drive folder', err);
      return null;
    }
  }, []);

  // Login handler
  const handleGoogleLogin = async () => {
    try {
      const user = await requestGoogleLogin();
      setAuthUser(user);
      showToast(`Berhasil terhubung dengan Google (${user.email})!`, 'success');
      
      // Auto setup folder in Drive
      const folder = await setupDriveFolder(user.accessToken);
      if (folder) {
        showToast(`Folder arsip "${folder.name}" siap di Google Drive.`, 'success');
      }
    } catch (err: any) {
      console.error('Login error:', err);
      showToast(err.message || 'Gagal menghubungkan akun Google. Silakan coba lagi.', 'error');
    }
  };

  // Logout handler
  const handleGoogleLogout = () => {
    clearUser();
    setAuthUser(null);
    showToast('Telah keluar dari akun Google.', 'info');
  };

  // Create Spreadsheet handler
  const handleCreateSpreadsheet = async () => {
    if (!authUser) {
      setIsConnectModalOpen(false);
      await handleGoogleLogin();
      return;
    }

    try {
      setIsCreatingSheet(true);
      const res = await createSikawanSpreadsheet(authUser.accessToken, driveFolder?.id);
      setSpreadsheetId(res.id);
      saveStoredSpreadsheetId(res.id);
      showToast('Database Google Spreadsheet baru berhasil dibuat di Google Drive!', 'success');
    } catch (err: any) {
      console.error('Spreadsheet create error:', err);
      showToast(err.message || 'Gagal membuat database spreadsheet di Google Drive.', 'error');
    } finally {
      setIsCreatingSheet(false);
    }
  };

  // Sync teachers from Google Sheets DATA_GURU
  const handleSyncTeachersFromSheet = async () => {
    if (!authUser || !spreadsheetId) {
      showToast('Harap hubungkan akun Google & Spreadsheet terlebih dahulu.', 'info');
      setIsConnectModalOpen(true);
      return;
    }

    try {
      setIsSyncingTeachers(true);
      const teachers = await fetchTeachersFromSheet(authUser.accessToken, spreadsheetId);
      if (teachers && teachers.length > 0) {
        setGuruList(teachers);
        // If current selected guru is still in the list, update it
        const currentUpdated = teachers.find((t) => t.nip === selectedGuru.nip || t.id === selectedGuru.id);
        if (currentUpdated) {
          setSelectedGuru(currentUpdated);
        } else {
          setSelectedGuru(teachers[0]);
        }
        showToast(`Sinkronisasi berhasil! ${teachers.length} data guru dimuat dari Google Sheets.`, 'success');
      } else {
        showToast('Tab DATA_GURU di spreadsheet masih kosong.', 'info');
      }
    } catch (err: any) {
      console.error('Sync teacher error', err);
      showToast(err.message || 'Gagal membaca data guru dari Google Sheets.', 'error');
    } finally {
      setIsSyncingTeachers(false);
    }
  };

  // Upload report handler - Sekali Kirim untuk Harian & Bulanan
  const handleUploadSubmit = async (payload: UploadPayload) => {
    setIsUploading(true);
    setUploadProgress(15);

    const simulatedDelay = (ms: number) => new Promise((res) => setTimeout(res, ms));

    try {
      let folderName = FOLDER_SIKAWAN_NAME;
      let folderId = '';
      let fileHarianInfo: BerkasPdfInfo | null = null;
      let fileBulananInfo: BerkasPdfInfo | null = null;

      if (authUser) {
        setUploadProgress(25);
        const folder = await ensureDriveFolder(authUser.accessToken);
        folderName = folder.name;
        folderId = folder.id;

        // Upload Berkas Harian jika dilampirkan
        if (payload.harian) {
          setUploadProgress(40);
          const uploadResHarian = await uploadPdfToGoogleDrive(
            authUser.accessToken,
            payload.harian.file,
            payload.harian.standardFileName,
            folderId,
            `Sikawan Harian - ${selectedGuru.nama} (${selectedGuru.nip}) - ${payload.harian.periodeLabel}`
          );
          fileHarianInfo = {
            namaFile: payload.harian.standardFileName,
            ukuranFile: payload.harian.file.size,
            tanggalAtauPeriode: payload.harian.tanggalLaporan,
            periodeLabel: payload.harian.periodeLabel,
            driveFileId: uploadResHarian.fileId,
            driveLink: uploadResHarian.webViewLink,
            waktuUnggah: new Date().toISOString(),
          };
        }

        // Upload Berkas Bulanan jika dilampirkan
        if (payload.bulanan) {
          setUploadProgress(70);
          const uploadResBulanan = await uploadPdfToGoogleDrive(
            authUser.accessToken,
            payload.bulanan.file,
            payload.bulanan.standardFileName,
            folderId,
            `Sikawan Bulanan - ${selectedGuru.nama} (${selectedGuru.nip}) - ${payload.bulanan.periodeLabel}`
          );
          fileBulananInfo = {
            namaFile: payload.bulanan.standardFileName,
            ukuranFile: payload.bulanan.file.size,
            tanggalAtauPeriode: payload.bulanan.bulanLaporan,
            periodeLabel: payload.bulanan.periodeLabel,
            driveFileId: uploadResBulanan.fileId,
            driveLink: uploadResBulanan.webViewLink,
            waktuUnggah: new Date().toISOString(),
          };
        }
      } else {
        // Unauthenticated demo/local mode: simulate upload progress smoothly
        await simulatedDelay(300);
        setUploadProgress(45);

        if (payload.harian) {
          const fakeId = `drive-file-harian-${Date.now()}`;
          fileHarianInfo = {
            namaFile: payload.harian.standardFileName,
            ukuranFile: payload.harian.file.size,
            tanggalAtauPeriode: payload.harian.tanggalLaporan,
            periodeLabel: payload.harian.periodeLabel,
            driveFileId: fakeId,
            driveLink: `https://drive.google.com/file/d/${fakeId}/view`,
            waktuUnggah: new Date().toISOString(),
          };
        }

        await simulatedDelay(300);
        setUploadProgress(75);

        if (payload.bulanan) {
          const fakeId = `drive-file-bulanan-${Date.now()}`;
          fileBulananInfo = {
            namaFile: payload.bulanan.standardFileName,
            ukuranFile: payload.bulanan.file.size,
            tanggalAtauPeriode: payload.bulanan.bulanLaporan,
            periodeLabel: payload.bulanan.periodeLabel,
            driveFileId: fakeId,
            driveLink: `https://drive.google.com/file/d/${fakeId}/view`,
            waktuUnggah: new Date().toISOString(),
          };
        }
        await simulatedDelay(250);
      }

      setUploadProgress(90);

      const newSubmission: RiwayatPengiriman = {
        id: `KIRIM-${Date.now()}`,
        guruId: selectedGuru.id,
        namaPengirim: selectedGuru.nama,
        nip: selectedGuru.nip,
        jabatan: selectedGuru.jabatan,
        waktuKirim: new Date().toISOString(),
        fileHarian: fileHarianInfo,
        fileBulanan: fileBulananInfo,
        statusSync: 'TERSIMPAN_DRIVE',
        driveFolderName: folderName,
        sheetRowSynced: false,
      };

      // Append record to Google Sheets if spreadsheetId is linked
      if (authUser && spreadsheetId) {
        try {
          const synced = await appendReportToSheet(authUser.accessToken, spreadsheetId, newSubmission);
          newSubmission.sheetRowSynced = synced;
        } catch (sheetErr) {
          console.warn('Could not append row to sheets', sheetErr);
        }
      }

      setUploadProgress(100);

      // Prepend to riwayat list so newest report appears on top
      setRiwayatList((prev) => [newSubmission, ...prev]);

      // Trigger the success notification modal!
      setSuccessLaporan(newSubmission);
      showToast('Laporan Sikawan berhasil dikirim dan tersimpan di Google Drive!', 'success');
    } catch (err: any) {
      console.error('Upload failed:', err);
      showToast(err.message || 'Terjadi kesalahan saat mengunggah berkas PDF.', 'error');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  // Refresh sync with Drive & Sheets
  const handleRefreshSync = async () => {
    setIsSyncing(true);
    try {
      if (authUser) {
        await setupDriveFolder(authUser.accessToken);
        if (spreadsheetId) {
          const teachers = await fetchTeachersFromSheet(authUser.accessToken, spreadsheetId);
          if (teachers && teachers.length > 0) {
            setGuruList(teachers);
          }
        }
        showToast('Sinkronisasi dengan Google Drive & Spreadsheet berhasil diperbarui.', 'success');
      } else {
        // Quick local check
        await new Promise((res) => setTimeout(res, 600));
        showToast('Riwayat pengiriman lokal tersinkronisasi.', 'info');
      }
    } catch (e: any) {
      showToast(e.message || 'Gagal menyinkronkan data.', 'error');
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-100 text-slate-900 selection:bg-emerald-100 selection:text-emerald-900">
      
      {/* Official Header with Running Text */}
      <Header
        authUser={authUser}
        driveFolder={driveFolder}
        spreadsheetId={spreadsheetId}
        onOpenConnectModal={() => setIsConnectModalOpen(true)}
        onLogin={handleGoogleLogin}
        onLogout={handleGoogleLogout}
        unsubmittedTeachers={unsubmittedTeachers}
        totalTeachersCount={guruList.length}
        onSelectTeacher={setSelectedGuru}
      />

      {/* Floating Toast Notification */}
      {toast && (
        <div className="fixed top-20 right-6 z-50 animate-in slide-in-from-top-4 fade-in duration-200">
          <div
            className={`px-4 py-3 rounded-xl shadow-lg border flex items-center gap-2.5 text-xs font-semibold ${
              toast.type === 'success'
                ? 'bg-emerald-800 text-white border-emerald-700'
                : toast.type === 'error'
                ? 'bg-rose-800 text-white border-rose-700'
                : 'bg-slate-800 text-white border-slate-700'
            }`}
          >
            {toast.type === 'success' ? (
              <CheckCircle className="w-4 h-4 text-emerald-300 shrink-0" />
            ) : toast.type === 'error' ? (
              <AlertCircle className="w-4 h-4 text-rose-300 shrink-0" />
            ) : (
              <Info className="w-4 h-4 text-slate-300 shrink-0" />
            )}
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      {/* Main Two-Screen Workstation Layout */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* ======================================================== */}
          {/* SISI KIRI (Left Panel): Data Guru & Pengiriman File PDF */}
          {/* ======================================================== */}
          <section className="lg:col-span-5 space-y-4">
            {/* Bagian 1: Data Guru (Nama Guru, NIP, Jabatan) */}
            <LeftPanelTeacher
              guruList={guruList}
              selectedGuru={selectedGuru}
              onSelectGuru={setSelectedGuru}
              onSyncFromSheet={authUser && spreadsheetId ? handleSyncTeachersFromSheet : undefined}
              isSyncingTeachers={isSyncingTeachers}
            />

            {/* Bagian 2 (Dibawahnya): Pengiriman File PDF (Harian & Bulanan) */}
            <LeftPanelUpload
              selectedGuru={selectedGuru}
              onUploadSubmit={handleUploadSubmit}
              isUploading={isUploading}
              uploadProgress={uploadProgress}
            />
          </section>

          {/* ======================================================== */}
          {/* SISI KANAN (Right Panel): Riwayat Pengiriman Guru       */}
          {/* ======================================================== */}
          <section className="lg:col-span-7">
            <RightPanelHistory
              riwayatList={riwayatList}
              selectedGuru={selectedGuru}
              driveFolder={driveFolder}
              spreadsheetId={spreadsheetId}
              onRefreshSync={handleRefreshSync}
              isSyncing={isSyncing}
              onDeleteRiwayat={handleDeleteRiwayat}
            />
          </section>

        </div>
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200 bg-white py-4 px-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            <span className="font-bold text-slate-700">SD NEGERI BABELAN KOTA 01</span> • Sistem Informasi Kinerja & Laporan Guru (Sikawan) Tahun 2026
          </div>
          <div className="text-[11px] text-slate-400">
            Terintegrasi Google Drive Folder & Google Sheets Database
          </div>
        </div>
      </footer>

      {/* Modal Notifikasi Saat Unggahan Berhasil */}
      <SuccessNotificationModal
        laporan={successLaporan}
        onClose={() => setSuccessLaporan(null)}
      />

      {/* Modal Pengaturan Google Drive & Sheets Database */}
      <GoogleConnectModal
        isOpen={isConnectModalOpen}
        onClose={() => setIsConnectModalOpen(false)}
        authUser={authUser}
        driveFolder={driveFolder}
        spreadsheetId={spreadsheetId}
        onLogin={handleGoogleLogin}
        onLogout={handleGoogleLogout}
        onCreateSpreadsheet={handleCreateSpreadsheet}
        onSetSpreadsheetId={(id) => {
          setSpreadsheetId(id);
          saveStoredSpreadsheetId(id);
          showToast('Database Spreadsheet telah diperbarui.', 'success');
        }}
        isCreatingSheet={isCreatingSheet}
      />

    </div>
  );
}
