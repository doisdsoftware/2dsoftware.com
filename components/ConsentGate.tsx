import React, { useState } from 'react';
import LegalModal from './LegalModal';
import { PrivacyContent, TermsContent } from './LegalDocuments';
import { hasValidConsent, persistConsent } from '../constants/consent';

const ConsentGate: React.FC = () => {
  const [open, setOpen] = useState(() => (typeof window !== 'undefined' ? !hasValidConsent() : true));
  const [doc, setDoc] = useState<'terms' | 'privacy' | null>(null);

  if (!open) return null;

  const accept = () => {
    persistConsent();
    setOpen(false);
  };

  return (
    <>
      <div
        className="fixed inset-x-0 bottom-0 z-[60] flex justify-center px-3 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-1 pointer-events-none md:justify-end md:px-5"
        aria-live="polite"
      >
        <aside
          role="complementary"
          aria-label="Informações de privacidade e termos"
          className="pointer-events-auto w-full max-w-[min(100%,17.5rem)] rounded-xl border border-slate-200/90 bg-white/95 px-3 py-2.5 shadow-lg shadow-slate-900/10 backdrop-blur-md sm:max-w-xs"
        >
          <p className="text-[10px] leading-snug text-slate-600 sm:text-[11px]">
            Ao navegar, você concorda com o uso de dados conforme nossos{' '}
            <button
              type="button"
              onClick={() => setDoc('terms')}
              className="font-semibold text-blue-600 underline decoration-blue-400/60 underline-offset-2 hover:text-blue-700"
            >
              Termos
            </button>
            {' e '}
            <button
              type="button"
              onClick={() => setDoc('privacy')}
              className="font-semibold text-blue-600 underline decoration-blue-400/60 underline-offset-2 hover:text-blue-700"
            >
              Privacidade
            </button>
            .
          </p>
          <button
            type="button"
            onClick={accept}
            className="mt-2 w-full rounded-lg bg-blue-600 py-1.5 text-center text-[11px] font-bold text-white shadow-sm transition hover:bg-blue-500 sm:text-xs"
          >
            Aceitar e continuar
          </button>
        </aside>
      </div>

      <LegalModal open={doc === 'terms'} title="Termos de uso" onClose={() => setDoc(null)}>
        <TermsContent />
      </LegalModal>
      <LegalModal open={doc === 'privacy'} title="Política de privacidade" onClose={() => setDoc(null)}>
        <PrivacyContent />
      </LegalModal>
    </>
  );
};

export default ConsentGate;
