import React from 'react'

function TechBadge({ children }: { children: React.ReactNode }) {
  return (
    <span className="px-3 py-1 bg-white/10 rounded-full text-sm text-white/90">{children}</span>
  )
}

export default function SitesSection() {
  return (
    <section className="relative py-16 sm:py-24 px-4 sm:px-6 bg-gradient-to-b from-blue-50 via-white to-white">
      <div className="max-w-6xl mx-auto text-center mb-8 sm:mb-16">
        <span className="text-teal-500 font-medium tracking-wide text-xs sm:text-base">Produtos & Serviços</span>

        <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 text-center mb-6">
          Sites Profissionais
          <br />
          <span className="bg-gradient-to-r from-blue-600 to-indigo-500 bg-clip-text text-transparent">claros, rápidos e fáceis de manter</span>
        </h2>

        <p className="text-slate-700 mt-6 max-w-xs sm:max-w-2xl mx-auto">Design e engenharia alinhados: entregamos experiências que convertem, com foco em performance e manutenção reduzida.</p>
      </div>

      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 flex flex-col gap-6">
          <article className="p-6 rounded-2xl bg-white/90 shadow-md hover:shadow-blue-200 transition duration-300 hover:-translate-y-1">
            <h3 className="text-xl font-bold text-slate-900 mb-2">Landing Pages de Alta Conversão</h3>
            <p className="text-slate-600 text-sm">Foco em mensagens claras, testes A/B e carregamento instantâneo.</p>
          </article>

          <article className="p-6 rounded-2xl bg-white/90 shadow-md hover:shadow-blue-200 transition duration-300 hover:-translate-y-1">
            <h3 className="text-xl font-bold text-slate-900 mb-2">Sites Institucionais e Portfólios</h3>
            <p className="text-slate-600 text-sm">Identidade visual, SEO técnico e edições fáceis.</p>
          </article>

          <article className="p-6 rounded-2xl bg-white/90 shadow-md hover:shadow-blue-200 transition duration-300 hover:-translate-y-1">
            <h3 className="text-xl font-bold text-slate-900 mb-2">E-commerce e Integrações</h3>
            <p className="text-slate-600 text-sm">Checkout rápido, integrações e monitoramento de vendas.</p>
          </article>

          <article className="p-6 rounded-2xl bg-white/90 shadow-md hover:shadow-blue-200 transition duration-300 hover:-translate-y-1">
            <h3 className="text-xl font-bold text-slate-900 mb-2">Manutenção & Suporte</h3>
            <p className="text-slate-600 text-sm">Código organizado, deploys previsíveis e suporte contínuo.</p>
          </article>
        </div>

        <aside className="p-8 rounded-3xl bg-gradient-to-br from-slate-900 to-slate-800 text-white shadow-xl relative overflow-hidden">
          <div className="absolute left-0 top-6 transform -translate-x-6 w-2 h-24 bg-gradient-to-b from-indigo-400 to-teal-300 opacity-50 blur-xl rounded" />
          <h3 className="text-xl font-semibold mb-6 text-teal-400">Destaques</h3>

          <ul className="space-y-4 text-slate-200">
            <li>
              <strong>Performance</strong>
              <p className="text-slate-300 text-sm">Otimização real e métricas mensuráveis.</p>
            </li>

            <li>
              <strong>Acessibilidade</strong>
              <p className="text-slate-300 text-sm">Interfaces inclusivas e testadas.</p>
            </li>

            <li>
              <strong>SEO Técnico</strong>
              <p className="text-slate-300 text-sm">Estrutura indexável e performance.</p>
            </li>
          </ul>

          <div className="mt-6 flex flex-wrap gap-2">
            <TechBadge>React</TechBadge>
            <TechBadge>TypeScript</TechBadge>
            <TechBadge>Vite</TechBadge>
            <TechBadge>Tailwind</TechBadge>
          </div>
        </aside>
      </div>
    </section>
  )
}
