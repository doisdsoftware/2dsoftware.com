
import React from 'react';
import { motion } from 'framer-motion';
import { MessageCircle, Mail, MapPin, Phone } from 'lucide-react';

const Footer: React.FC = () => {
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

        <div className="flex flex-col md:flex-row justify-between items-center pt-12 border-t border-slate-100 text-slate-500 text-sm font-semibold">
          <p>© 2024 2D Software LTDA. Todos os direitos reservados.</p>
          <div className="flex space-x-8 mt-6 md:mt-0">
            <a href="#" className="hover:text-blue-600 transition-colors">Privacidade</a>
            <a href="#" className="hover:text-blue-600 transition-colors">Termos</a>
            <a href="#" className="hover:text-blue-600 transition-colors">Instagram</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
