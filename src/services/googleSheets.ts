import { Guru, LaporanSikawan, RiwayatPengiriman } from '../types';
import { INITIAL_GURU_LIST } from '../data/initialData';

export const DEFAULT_SPREADSHEET_TITLE = 'DATABASE SIKAWAN SD NEGERI BABELAN KOTA 01 - 2026';
const SPREADSHEET_ID_STORAGE_KEY = 'sikawan_spreadsheet_id';

export function getStoredSpreadsheetId(): string | null {
  return localStorage.getItem(SPREADSHEET_ID_STORAGE_KEY);
}

export function saveStoredSpreadsheetId(id: string): void {
  localStorage.setItem(SPREADSHEET_ID_STORAGE_KEY, id);
}

/**
 * Creates a complete Google Spreadsheet with DATA_GURU and RIWAYAT_SIKAWAN tabs
 */
export async function createSikawanSpreadsheet(accessToken: string, folderId?: string): Promise<{ id: string; url: string }> {
  // Step 1: Create Spreadsheet
  const body = {
    properties: {
      title: DEFAULT_SPREADSHEET_TITLE,
    },
    sheets: [
      {
        properties: {
          title: 'DATA_GURU',
          gridProperties: {
            rowCount: 50,
            columnCount: 10,
            frozenRowCount: 1,
          },
        },
      },
      {
        properties: {
          title: 'RIWAYAT_SIKAWAN',
          gridProperties: {
            rowCount: 200,
            columnCount: 15,
            frozenRowCount: 1,
          },
        },
      },
    ],
  };

  const res = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Gagal membuat Google Spreadsheet: ${errorText}`);
  }

  const sheetData = await res.json();
  const spreadsheetId = sheetData.spreadsheetId;
  const spreadsheetUrl = sheetData.spreadsheetUrl || `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`;

  // Step 2: Populate headers and default Guru data
  const guruHeader = ['ID_GURU', 'NAMA_LENGKAP', 'NIP', 'JABATAN', 'GOLONGAN', 'STATUS_KEPEGAWAIAN', 'MAPEL_TUGAS'];
  const guruRows = INITIAL_GURU_LIST.map((g) => [
    g.id,
    g.nama,
    g.nip,
    g.jabatan,
    g.golongan || '-',
    g.statusKepegawaian || 'PNS',
    g.mataPelajaran || '-',
  ]);

  const riwayatHeader = [
    'ID_LAPORAN',
    'WAKTU_UNGGAH',
    'NAMA_GURU',
    'NIP',
    'JABATAN',
    'JENIS_SIKAWAN',
    'PERIODE',
    'RINGKASAN_KEGIATAN',
    'NAMA_FILE_PDF',
    'UKURAN_BYTES',
    'DRIVE_FILE_ID',
    'LINK_BERKAS_DRIVE',
    'STATUS_SYNC',
  ];

  await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values:batchUpdate`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      valueInputOption: 'USER_ENTERED',
      data: [
        {
          range: 'DATA_GURU!A1:G',
          values: [guruHeader, ...guruRows],
        },
        {
          range: 'RIWAYAT_SIKAWAN!A1:M',
          values: [riwayatHeader],
        },
      ],
    }),
  });

  // Step 3: Move spreadsheet to the Sikawan Google Drive folder if folderId provided
  if (folderId) {
    try {
      await fetch(
        `https://www.googleapis.com/drive/v3/files/${spreadsheetId}?addParents=${folderId}&fields=id,parents`,
        {
          method: 'PATCH',
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
    } catch (e) {
      console.warn('Could not move sheet to folder:', e);
    }
  }

  saveStoredSpreadsheetId(spreadsheetId);
  return { id: spreadsheetId, url: spreadsheetUrl };
}

/**
 * Appends a new submission to RIWAYAT_SIKAWAN in Google Sheets
 */
export async function appendReportToSheet(
  accessToken: string,
  spreadsheetId: string,
  laporan: RiwayatPengiriman
): Promise<boolean> {
  const rowsToAppend: any[][] = [];
  const formattedTime = new Date(laporan.waktuKirim).toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' });

  if (laporan.fileHarian) {
    rowsToAppend.push([
      `${laporan.id}-H`,
      formattedTime,
      laporan.namaPengirim,
      `'${laporan.nip}`, // tick to preserve leading zeros in Sheets
      laporan.jabatan,
      'HARIAN',
      laporan.fileHarian.periodeLabel,
      '-',
      laporan.fileHarian.namaFile,
      laporan.fileHarian.ukuranFile,
      laporan.fileHarian.driveFileId || '',
      laporan.fileHarian.driveLink || '',
      'TERSIMPAN_DRIVE',
    ]);
  }

  if (laporan.fileBulanan) {
    rowsToAppend.push([
      `${laporan.id}-B`,
      formattedTime,
      laporan.namaPengirim,
      `'${laporan.nip}`,
      laporan.jabatan,
      'BULANAN',
      laporan.fileBulanan.periodeLabel,
      '-',
      laporan.fileBulanan.namaFile,
      laporan.fileBulanan.ukuranFile,
      laporan.fileBulanan.driveFileId || '',
      laporan.fileBulanan.driveLink || '',
      'TERSIMPAN_DRIVE',
    ]);
  }

  if (rowsToAppend.length === 0) return true;

  const res = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/RIWAYAT_SIKAWAN!A:M:append?valueInputOption=USER_ENTERED`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        values: rowsToAppend,
      }),
    }
  );

  return res.ok;
}

/**
 * Fetches teachers from Google Sheets DATA_GURU
 */
export async function fetchTeachersFromSheet(accessToken: string, spreadsheetId: string): Promise<Guru[]> {
  const res = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/DATA_GURU!A2:G50`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (!res.ok) {
    throw new Error('Gagal membaca data guru dari Google Sheets.');
  }

  const data = await res.json();
  const rows: string[][] = data.values || [];

  return rows.map((row, index) => ({
    id: row[0] || `guru-${index + 1}`,
    nama: row[1] || 'Nama Guru',
    nip: (row[2] || '').replace(/['"]/g, ''),
    jabatan: row[3] || 'Guru',
    golongan: row[4] || '-',
    statusKepegawaian: (row[5] as 'PNS' | 'PPPK' | 'Honorer') || 'PNS',
    mataPelajaran: row[6] || '-',
  }));
}

/**
 * Deletes report rows matching reportId from RIWAYAT_SIKAWAN in Google Sheets
 */
export async function deleteReportFromSheet(
  accessToken: string,
  spreadsheetId: string,
  reportId: string
): Promise<boolean> {
  try {
    // 1. Get sheetId for RIWAYAT_SIKAWAN
    const metaRes = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}?fields=sheets(properties(sheetId,title))`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );
    if (!metaRes.ok) return false;
    const metaData = await metaRes.json();
    const riwayatSheet = metaData.sheets?.find(
      (s: any) => s.properties?.title === 'RIWAYAT_SIKAWAN'
    );
    if (!riwayatSheet || riwayatSheet.properties?.sheetId === undefined) {
      return false;
    }
    const numericSheetId = riwayatSheet.properties.sheetId;

    // 2. Fetch column A of RIWAYAT_SIKAWAN to find matching rows
    const valuesRes = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/RIWAYAT_SIKAWAN!A:A`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );
    if (!valuesRes.ok) return false;
    const valuesData = await valuesRes.json();
    const rows: string[][] = valuesData.values || [];

    // Find row indices (0-based) where column A matches reportId or starts with reportId
    const matchingIndices: number[] = [];
    rows.forEach((row, idx) => {
      const cellVal = row[0] || '';
      if (
        cellVal === reportId ||
        cellVal.startsWith(`${reportId}-`) ||
        cellVal.startsWith(reportId)
      ) {
        matchingIndices.push(idx);
      }
    });

    if (matchingIndices.length === 0) {
      return true; // Nothing to delete in sheet
    }

    // Sort in descending order so deleting a row does not change earlier row indexes
    matchingIndices.sort((a, b) => b - a);

    const requests = matchingIndices.map((idx) => ({
      deleteDimension: {
        range: {
          sheetId: numericSheetId,
          dimension: 'ROWS',
          startIndex: idx,
          endIndex: idx + 1,
        },
      },
    }));

    const batchRes = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}:batchUpdate`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ requests }),
      }
    );

    return batchRes.ok;
  } catch (err) {
    console.error('Failed to delete report rows from Google Sheet', err);
    return false;
  }
}

