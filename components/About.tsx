
import React from 'react';
import { motion } from 'framer-motion';

const About: React.FC = () => {
  return (
    <section id="sobre" className="py-24 px-6 relative overflow-hidden">
      <div className="container mx-auto">
        <div className="max-w-4xl mx-auto text-center mb-16">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl sm:text-4xl font-bold text-slate-900 text-center mb-6"
          >
            Nascida no Coração da <br /><span className="text-gradient">Serra da Mantiqueira</span>
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-lg text-slate-600 leading-relaxed font-medium"
          >
            A 2D Software é uma empresa de desenvolvimento sediada em Campos do Jordão – SP. 
            Fundada por <strong>Daniel Baisso</strong> e <strong>Douglas Moraes</strong>, 
            nossa missão é elevar o padrão tecnológico da região através de software escalável e design impecável.
          </motion.p>
        </div>

        <div className="grid md:grid-cols-2 gap-12">
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="glass p-6 md:p-10 rounded-[32px] border-l-8 border-l-blue-600 shadow-xl"
          >
            <h3 className="text-2xl font-bold mb-4 text-slate-900">Nossa Especialidade</h3>
            <ul className="space-y-4 text-slate-600 font-medium">
              <li className="flex items-center space-x-3">
                <span className="w-2 h-2 bg-blue-600 rounded-full" />
                <span>Aplicativos Mobile Nativos e Híbridos</span>
              </li>
              <li className="flex items-center space-x-3">
                <span className="w-2 h-2 bg-blue-600 rounded-full" />
                <span>Sistemas Web Progressivos (PWA)</span>
              </li>
              <li className="flex items-center space-x-3">
                <span className="w-2 h-2 bg-blue-600 rounded-full" />
                <span>Mapas Interativos e Geolocalização</span>
              </li>
              <li className="flex items-center space-x-3">
                <span className="w-2 h-2 bg-blue-600 rounded-full" />
                <span>Gamificação para Turismo e Varejo</span>
              </li>
            </ul>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="glass p-6 md:p-10 rounded-[32px] border-l-8 border-l-emerald-500 shadow-xl"
          >
            <h3 className="text-2xl font-bold mb-4 text-slate-900">Nossa Filosofia</h3>
            <p className="text-slate-600 leading-relaxed font-medium">
              Transformamos tecnologia em vantagem competitiva. Desenvolvemos sistemas robustos, intuitivos e preparados para expansão, garantindo desempenho consistente e excelência técnica. Na 2D Software, qualidade não é detalhe, é padrão.
            </p>
          </motion.div>
        </div>
      </div>

      {/* bottom fade to blend into EcossistemaParticulas: contained within this section */}
      {/* removed bottom fade here; particles section provides the visual overlay */}

    </section>
  );
};

export default About;


