import { GoogleFolderInfo } from '../types';

export const FOLDER_SIKAWAN_NAME = 'SIKAWAN SD NEGERI BABELAN KOTA 01 - 2026';

/**
 * Ensures the target folder exists in the user's Google Drive.
 * If it doesn't exist, creates it.
 */
export async function ensureDriveFolder(accessToken: string, folderName = FOLDER_SIKAWAN_NAME): Promise<GoogleFolderInfo> {
  const query = encodeURIComponent(
    `name = '${folderName}' and mimeType = 'application/vnd.google-apps.folder' and trashed = false`
  );

  const searchRes = await fetch(
    `https://www.googleapis.com/drive/v3/files?q=${query}&fields=files(id,name,webViewLink)`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (!searchRes.ok) {
    const errorText = await searchRes.text();
    throw new Error(`Gagal mencari folder di Google Drive: ${errorText}`);
  }

  const searchData = await searchRes.json();
  if (searchData.files && searchData.files.length > 0) {
    const folder = searchData.files[0];
    return {
      id: folder.id,
      name: folder.name,
      webViewLink: folder.webViewLink,
    };
  }

  // Create folder
  const createRes = await fetch('https://www.googleapis.com/drive/v3/files?fields=id,name,webViewLink', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: folderName,
      mimeType: 'application/vnd.google-apps.folder',
      description: 'Folder penyimpanan otomatis arsip Laporan Sikawan Harian dan Bulanan SD Negeri Babelan Kota 01 Tahun 2026',
    }),
  });

  if (!createRes.ok) {
    const errorText = await createRes.text();
    throw new Error(`Gagal membuat folder di Google Drive: ${errorText}`);
  }

  const newFolder = await createRes.json();
  return {
    id: newFolder.id,
    name: newFolder.name,
    webViewLink: newFolder.webViewLink || `https://drive.google.com/drive/folders/${newFolder.id}`,
  };
}

/**
 * Uploads a PDF file directly to the specified Google Drive folder
 */
export async function uploadPdfToGoogleDrive(
  accessToken: string,
  file: File | Blob,
  fileName: string,
  folderId: string,
  description: string
): Promise<{ fileId: string; name: string; webViewLink: string }> {
  const metadata = {
    name: fileName,
    parents: [folderId],
    description: description,
    mimeType: 'application/pdf',
  };

  const boundary = '-------314159265358979323846';
  const delimiter = `\r\n--${boundary}\r\n`;
  const closeDelimiter = `\r\n--${boundary}--`;

  // Read file as ArrayBuffer
  const fileBuffer = await file.arrayBuffer();
  const fileBytes = new Uint8Array(fileBuffer);

  const metadataPart = `${delimiter}Content-Type: application/json; charset=UTF-8\r\n\r\n${JSON.stringify(metadata)}`;
  const mediaHeaderPart = `${delimiter}Content-Type: application/pdf\r\n\r\n`;

  const encoder = new TextEncoder();
  const metadataBytes = encoder.encode(metadataPart);
  const mediaHeaderBytes = encoder.encode(mediaHeaderPart);
  const closeDelimiterBytes = encoder.encode(closeDelimiter);

  // Combine into single Uint8Array
  const totalLength = metadataBytes.length + mediaHeaderBytes.length + fileBytes.length + closeDelimiterBytes.length;
  const multipartBody = new Uint8Array(totalLength);

  let offset = 0;
  multipartBody.set(metadataBytes, offset);
  offset += metadataBytes.length;
  multipartBody.set(mediaHeaderBytes, offset);
  offset += mediaHeaderBytes.length;
  multipartBody.set(fileBytes, offset);
  offset += fileBytes.length;
  multipartBody.set(closeDelimiterBytes, offset);

  const uploadRes = await fetch(
    'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,webViewLink,webContentLink',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': `multipart/related; boundary=${boundary}`,
      },
      body: multipartBody,
    }
  );

  if (!uploadRes.ok) {
    const errorText = await uploadRes.text();
    throw new Error(`Gagal mengunggah berkas PDF ke Google Drive: ${errorText}`);
  }

  const uploadedData = await uploadRes.json();
  return {
    fileId: uploadedData.id,
    name: uploadedData.name || fileName,
    webViewLink: uploadedData.webViewLink || `https://drive.google.com/file/d/${uploadedData.id}/view`,
  };
}
