
import React, { useState } from 'react';
import { Feature } from '../types';
import { motion } from 'framer-motion';
import { FEATURES } from '../constants';

const Features: React.FC = () => {
  const [selected, setSelected] = useState<Feature | null>(null);
  return (
    <section id="vantagens" className="py-24 px-6 bg-blue-50/30">
      <div className="container mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 text-center mb-6">Excelência em cada detalhe</h2>
          <p className="text-slate-600 max-w-2xl mx-auto text-lg font-medium">
            Combinamos o rigor da engenharia com a criatividade do design.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {FEATURES.map((feature, idx) => (
            <motion.button
              key={feature.title}
              onClick={() => setSelected(feature)}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.06 }}
              className="flex flex-col justify-between text-left overflow-hidden rounded-2xl bg-white/70 hover:bg-white transition-all border border-blue-50 group shadow-sm hover:shadow-xl"
                style={{ minHeight: 220 }}
              >
                <div className="p-6 flex-1 flex flex-col">
                  <div className="flex items-center gap-4 mb-3">
                    <div className="w-10 h-10 bg-blue-600 text-white rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-md">
                      {feature.icon}
                    </div>
                    <h3 className="text-lg md:text-xl font-bold text-slate-900">{feature.title}</h3>
                  </div>
                  <p className="text-slate-600 text-sm md:text-base leading-relaxed font-medium mt-auto">
                    {feature.description}
                  </p>

                  <div className="mt-4 pt-4 border-t border-blue-50/40 flex items-center justify-between">
                    <span className="text-sm text-blue-600 font-semibold">ver mais</span>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
            </motion.button>
          ))}
        </div>

        {/* Modal / Drawer for feature details */}
        {selected && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/50" onClick={() => setSelected(null)} />
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="relative z-10 max-w-4xl w-full mx-6 bg-white rounded-2xl shadow-2xl overflow-hidden md:flex md:items-stretch md:min-h-[320px]"
            >
              <div className="md:w-1/2 w-full h-48 md:h-auto flex-shrink-0">
                {selected.image && (
                  <a href={selected.image} target="_blank" rel="noreferrer">
                    <img src={selected.image} alt={selected.title} className="w-full h-full object-cover" />
                  </a>
                )}
              </div>
              <div className="p-6 md:w-1/2 flex flex-col justify-center">
                <h3 className="text-2xl font-bold mb-2">{selected.title}</h3>
                <p className="text-slate-700 mb-4">{selected.details || selected.description}</p>
                {selected.bullets && (
                  <ul className="list-disc ml-5 mb-4 text-slate-600">
                    {selected.bullets.map((b, i) => (
                      <li key={i}>{b}</li>
                    ))}
                  </ul>
                )}
                <div className="mt-6 flex items-center gap-3">
                  <a href="https://wa.me/5512997775889" target="_blank" rel="noreferrer" className="px-4 py-2 bg-blue-600 text-white rounded-md font-bold">Solicitar</a>
                  <button onClick={() => setSelected(null)} className="px-4 py-2 border rounded-md">Fechar</button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </section>
  );
};

export default Features;
