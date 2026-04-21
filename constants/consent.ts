/** Incremente quando alterar termos/privacidade de forma relevante para solicitar novo consentimento. */
export const CONSENT_POLICY_VERSION = 4;

export const CONSENT_STORAGE_KEY = '2dsoftware_site_consent';

export type ConsentRecord = {
  version: number;
  acceptedAt: string;
};

export function readStoredConsent(): ConsentRecord | null {
  try {
    const raw = localStorage.getItem(CONSENT_STORAGE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw) as ConsentRecord;
    if (typeof data.version !== 'number' || typeof data.acceptedAt !== 'string') return null;
    return data;
  } catch {
    return null;
  }
}

export function hasValidConsent(): boolean {
  const r = readStoredConsent();
  return r != null && r.version >= CONSENT_POLICY_VERSION;
}

export function persistConsent(): void {
  const record: ConsentRecord = {
    version: CONSENT_POLICY_VERSION,
    acceptedAt: new Date().toISOString(),
  };
  try {
    localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(record));
  } catch {
    /* quota ou modo privado */
  }
}
