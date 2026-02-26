
import React from 'react';
import { motion } from 'framer-motion';
import { PRODUCTS } from '../constants';
import { CheckCircle } from 'lucide-react';

const Products: React.FC = () => {
  return (
    <section id="produtos" className="pt-0 pb-24 px-6 relative overflow-visible">
      {/* top fade to blend with EcossistemaParticulas: contained within this section */}
      {/* removed top fade here; particles section provides the visual overlay */}
      <div className="container mx-auto">
        <div className="flex flex-col items-center mb-8 text-center" style={{ marginTop: '3cm', position: 'relative', zIndex: 60 }}>
          <div>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 text-center mb-6">Soluções e Funcionalidades</h2>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {PRODUCTS.map((product, idx) => {
            const content = (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.2 }}
                className="glass p-6 sm:p-8 rounded-[40px] hover:border-blue-400/30 transition-all group flex flex-col h-full shadow-lg"
              >
                <div className="mb-6 p-4 bg-blue-50 rounded-2xl w-fit group-hover:bg-blue-100 transition-colors">
                  {product.icon}
                </div>
                <h3 className="text-xl sm:text-2xl font-bold mb-4 text-slate-900 group-hover:text-blue-600 transition-colors">{product.title}</h3>
                <p className="text-slate-600 mb-8 flex-grow font-medium">
                  {product.description}
                </p>
                
                <div className="space-y-3 pt-6 border-t border-slate-100">
                  {product.features.map((feature) => (
                    <div key={feature} className="flex items-start space-x-3">
                      <CheckCircle className="w-5 h-5 text-emerald-500 mt-0.5" />
                      <span className="text-sm font-semibold text-slate-700">{feature}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            );

            return product.href ? (
              <a key={product.id} href={product.href} target="_blank" rel="noopener noreferrer" className="block">
                {content}
              </a>
            ) : (
              content
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Products;
