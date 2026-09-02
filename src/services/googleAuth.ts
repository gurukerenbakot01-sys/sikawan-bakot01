import { GoogleAuthUser } from '../types';

export const OAUTH_CLIENT_ID = '660032153499-mepn9alcmqbfivoaojqvspfvht757b04.apps.googleusercontent.com';
export const OAUTH_SCOPES = [
  'https://www.googleapis.com/auth/drive.file',
  'https://www.googleapis.com/auth/spreadsheets',
  'https://www.googleapis.com/auth/userinfo.profile',
  'https://www.googleapis.com/auth/userinfo.email',
].join(' ');

const TOKEN_STORAGE_KEY = 'sikawan_google_auth_token';

declare global {
  interface Window {
    google?: {
      accounts: {
        oauth2: {
          initTokenClient: (config: {
            client_id: string;
            scope: string;
            callback: (response: {
              access_token?: string;
              expires_in?: number;
              error?: string;
              error_description?: string;
            }) => void;
          }) => {
            requestAccessToken: (overrideConfig?: { prompt?: string }) => void;
          };
        };
      };
    };
  }
}

export function getStoredUser(): GoogleAuthUser | null {
  try {
    const raw = localStorage.getItem(TOKEN_STORAGE_KEY);
    if (!raw) return null;
    const data: GoogleAuthUser = JSON.parse(raw);
    if (Date.now() > data.expiresAt) {
      localStorage.removeItem(TOKEN_STORAGE_KEY);
      return null;
    }
    return data;
  } catch (e) {
    console.error('Error reading stored token', e);
    return null;
  }
}

export function saveUser(user: GoogleAuthUser): void {
  localStorage.setItem(TOKEN_STORAGE_KEY, JSON.stringify(user));
}

export function clearUser(): void {
  localStorage.removeItem(TOKEN_STORAGE_KEY);
}

export async function fetchUserInfo(accessToken: string): Promise<{ email: string; name: string; picture?: string }> {
  try {
    const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    if (!res.ok) {
      throw new Error(`Failed to fetch userinfo: ${res.statusText}`);
    }
    const data = await res.json();
    return {
      email: data.email || 'gurukeren.bakot01@gmail.com',
      name: data.name || 'Guru SD Negeri Babelan Kota 01',
      picture: data.picture,
    };
  } catch (err) {
    console.warn('Could not fetch user info, using fallback email', err);
    return {
      email: 'gurukeren.bakot01@gmail.com',
      name: 'SDN Babelan Kota 01 Admin/Guru',
    };
  }
}

export function requestGoogleLogin(): Promise<GoogleAuthUser> {
  return new Promise((resolve, reject) => {
    if (!window.google?.accounts?.oauth2) {
      reject(new Error('Google Identity Services library belum termuat. Mohon muat ulang halaman.'));
      return;
    }

    const tokenClient = window.google.accounts.oauth2.initTokenClient({
      client_id: OAUTH_CLIENT_ID,
      scope: OAUTH_SCOPES,
      callback: async (tokenResponse) => {
        if (tokenResponse.error) {
          reject(new Error(tokenResponse.error_description || tokenResponse.error));
          return;
        }

        const accessToken = tokenResponse.access_token;
        if (!accessToken) {
          reject(new Error('Token akses tidak diterima dari Google.'));
          return;
        }

        const expiresIn = Number(tokenResponse.expires_in) || 3599;
        const expiresAt = Date.now() + (expiresIn - 60) * 1000;

        try {
          const profile = await fetchUserInfo(accessToken);
          const user: GoogleAuthUser = {
            accessToken,
            expiresAt,
            email: profile.email,
            name: profile.name,
            picture: profile.picture,
          };
          saveUser(user);
          resolve(user);
        } catch (e: any) {
          const fallbackUser: GoogleAuthUser = {
            accessToken,
            expiresAt,
            email: 'gurukeren.bakot01@gmail.com',
            name: 'SDN Babelan Kota 01 User',
          };
          saveUser(fallbackUser);
          resolve(fallbackUser);
        }
      },
    });

    tokenClient.requestAccessToken({ prompt: 'consent' });
  });
}
