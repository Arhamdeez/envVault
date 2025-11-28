/**
 * Client-side encryption utilities using WebCrypto API
 * All encryption/decryption happens in the browser - server never sees plaintext or keys
 */

/**
 * Generate a random AES-GCM 256-bit key
 */
export async function generateKey(): Promise<CryptoKey> {
  return crypto.subtle.generateKey(
    {
      name: 'AES-GCM',
      length: 256,
    },
    true, // extractable
    ['encrypt', 'decrypt'],
  );
}

/**
 * Export key as base64 string
 */
export async function exportKey(key: CryptoKey): Promise<string> {
  const exported = await crypto.subtle.exportKey('raw', key);
  const keyArray = Array.from(new Uint8Array(exported));
  return btoa(String.fromCharCode(...keyArray));
}

/**
 * Import key from base64 string
 */
export async function importKey(keyBase64: string): Promise<CryptoKey> {
  const keyData = Uint8Array.from(atob(keyBase64), (c) => c.charCodeAt(0));
  return crypto.subtle.importKey(
    'raw',
    keyData,
    {
      name: 'AES-GCM',
      length: 256,
    },
    true,
    ['encrypt', 'decrypt'],
  );
}

/**
 * Encrypt data using AES-GCM
 * Returns: { encrypted: base64, iv: base64 }
 */
export async function encrypt(
  data: Uint8Array,
  key: CryptoKey,
): Promise<{ encrypted: string; iv: string }> {
  // Generate random IV (12 bytes for AES-GCM)
  const iv = crypto.getRandomValues(new Uint8Array(12));

  // Encrypt
  const encrypted = await crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv: iv,
    },
    key,
    data.buffer as ArrayBuffer,
  );

  // Convert to base64
  const encryptedArray = Array.from(new Uint8Array(encrypted));
  const ivArray = Array.from(iv);

  return {
    encrypted: btoa(String.fromCharCode(...encryptedArray)),
    iv: btoa(String.fromCharCode(...ivArray)),
  };
}

/**
 * Decrypt data using AES-GCM
 */
export async function decrypt(
  encryptedBase64: string,
  ivBase64: string,
  key: CryptoKey,
): Promise<Uint8Array> {
  // Convert from base64
  const encrypted = Uint8Array.from(atob(encryptedBase64), (c) => c.charCodeAt(0));
  const iv = Uint8Array.from(atob(ivBase64), (c) => c.charCodeAt(0));

  // Decrypt
  const decrypted = await crypto.subtle.decrypt(
    {
      name: 'AES-GCM',
      iv: iv,
    },
    key,
    encrypted,
  );

  return new Uint8Array(decrypted);
}

/**
 * Download key as a file
 */
export function downloadKey(keyBase64: string, filename: string = 'envvault-key.txt') {
  const blob = new Blob([keyBase64], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Download decrypted file
 */
export function downloadFile(content: string, filename: string) {
  const blob = new Blob([content], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

