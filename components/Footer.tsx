
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MessageCircle, Mail, MapPin, Phone } from 'lucide-react';
import LegalModal from './LegalModal';
import { PrivacyContent, TermsContent } from './LegalDocuments';
import { handleInternalHashClick } from '../utils/scrollToHash';

const InstagramGlyph: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
  </svg>
);

const footerNav = [
  { label: 'Sobre', href: '#sobre' },
  { label: 'Globo', href: '#ecossistema' },
  { label: 'Produtos', href: '#produtos' },
  { label: 'Sites', href: '#sites' },
  { label: 'Vantagens', href: '#vantagens' },
  { label: 'Tecnologia', href: '#tecnologia' },
];

const Footer: React.FC = () => {
  const [legal, setLegal] = useState<'terms' | 'privacy' | null>(null);

  return (
    <footer className="pt-24 pb-12 px-6 border-t border-blue-100 bg-white relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-blue-200 to-transparent" />
      
      <div className="container mx-auto relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 mb-24">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 text-left mb-6">
              Pronto para o <span className="text-gradient">próximo nível?</span>
            </h2>
            <div className="flex flex-col sm:flex-row gap-5">
              <a 
                href="https://wa.me/5512997775889" 
                className="flex items-center justify-center space-x-3 px-10 py-5 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-xl shadow-blue-600/30"
              >
                <MessageCircle className="w-6 h-6" />
                <span className="text-lg">WhatsApp</span>
              </a>
              <a 
                href="mailto:softwarehouse@2dsoftware.com.br" 
                className="flex items-center justify-center space-x-3 px-10 py-5 glass rounded-2xl font-bold hover:bg-blue-50 transition-all border border-blue-200 text-slate-700"
                aria-label="Enviar e-mail para softwarehouse@2dsoftware.com.br"
              >
                <Mail className="w-6 h-6" />
                <span className="text-lg">Solicitar Orçamento</span>
              </a>
            </div>
          </motion.div>

          <div className="grid sm:grid-cols-2 gap-12">
            <div>
              <h3 className="text-sm font-black uppercase tracking-[0.2em] text-blue-600 mb-8">Nossa Base</h3>
              <ul className="space-y-6">
                <li className="flex items-center space-x-4 text-slate-600 font-bold group cursor-pointer">
                  <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all">
                    <Phone className="w-5 h-5" />
                  </div>
                  <span>(12) 99777-5889</span>
                </li>
                <li className="flex items-center space-x-4 text-slate-600 font-bold group cursor-pointer">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-all">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <span>Campos do Jordão, SP</span>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-black uppercase tracking-[0.2em] text-blue-600 mb-8">DNA 2D Software</h3>
              <p className="text-slate-600 leading-relaxed text-lg font-medium">
                Engenharia de software artesanal com rigor industrial. Nascidos na montanha para escalar o mundo.
              </p>
              <div className="mt-8 pt-8 border-t border-slate-100">
                <div className="text-xs text-slate-400 font-black uppercase tracking-widest mb-2">Fundadores</div>
                <div className="text-sm font-bold text-slate-900">Daniel Baisso • Douglas Moraes</div>
              </div>
            </div>
          </div>
        </div>

        <nav aria-label="Mapa do site" className="flex flex-wrap justify-center gap-x-6 gap-y-3 border-t border-slate-100 pt-10 text-sm font-semibold text-slate-600">
          {footerNav.map((item) => (
            <a
              key={item.href}
              href={item.href}
              onClick={
                item.href.startsWith('#')
                  ? (e) => handleInternalHashClick(e, item.href)
                  : undefined
              }
              className="hover:text-blue-600 transition-colors"
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="flex flex-col md:flex-row justify-between items-center pt-12 border-t border-slate-100 text-slate-500 text-sm font-semibold gap-8">
          <p className="text-center md:text-left">© {new Date().getFullYear()} 2D Software LTDA. Todos os direitos reservados.</p>
          <div className="flex flex-wrap justify-center items-center gap-4 md:gap-6">
            <button
              type="button"
              onClick={() => setLegal('privacy')}
              className="hover:text-blue-600 transition-colors"
            >
              Privacidade
            </button>
            <button
              type="button"
              onClick={() => setLegal('terms')}
              className="hover:text-blue-600 transition-colors"
            >
              Termos de uso
            </button>
            <a
              href="https://www.instagram.com/2dsoftwares/"
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center gap-2 rounded-full p-0.5 transition-transform hover:scale-[1.03] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500"
              aria-label="Instagram @2dsoftwares"
            >
              <span className="inline-flex items-center gap-2 rounded-full bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7] p-[2px] shadow-md shadow-pink-500/25">
                <span className="flex items-center gap-2 rounded-full bg-white px-4 py-2 text-slate-900">
                  <InstagramGlyph className="h-5 w-5 text-[#E1306C]" />
                  <span className="font-bold tracking-tight">@2dsoftwares</span>
                </span>
              </span>
            </a>
          </div>
        </div>
      </div>

      <LegalModal open={legal === 'terms'} title="Termos de uso" onClose={() => setLegal(null)}>
        <TermsContent />
      </LegalModal>
      <LegalModal open={legal === 'privacy'} title="Política de privacidade" onClose={() => setLegal(null)}>
        <PrivacyContent />
      </LegalModal>
    </footer>
  );
};

export default Footer;
