
import React from 'react'
import { Smartphone, Monitor, Cloud, MapPin, Gift, Code } from 'lucide-react'

const features = [
  { label: 'Apps Mobile', icon: Smartphone },
  { label: 'Sistemas Web', icon: Monitor },
  { label: 'Plataformas SaaS', icon: Cloud },
  { label: 'Mapas Inteligentes', icon: MapPin },
  { label: 'Programas de Fidelização', icon: Gift },
  { label: 'APIs e Integrações', icon: Code },
]

export default function TechSection() {
  return (
    <section id="tecnologia" className="py-16 sm:py-24 px-4 sm:px-6 bg-gradient-to-b from-white to-slate-50">
      <div className="max-w-6xl mx-auto grid gap-8 sm:gap-16 items-center justify-items-center md:grid-cols-1">

        {/* Left: title, subtitle, feature grid */}
        <div>
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 text-center mb-6">
            Desenvolvemos qualquer tipo
            <br />
            <span className="bg-gradient-to-r from-blue-600 to-indigo-500 bg-clip-text text-transparent">de aplicação</span>
          </h2>

          <p className="text-slate-600 mb-8 max-w-xs sm:max-w-lg mx-auto">Tecnologia moderna, escalável e pronta para o mercado.</p>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-slate-700 max-w-xs sm:max-w-md mx-auto">
            {features.map((f) => {
              const Icon = f.icon
              return (
                <div key={f.label} className="flex items-center gap-3">
                  <div className="w-7 h-7 sm:w-9 sm:h-9 flex items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                    <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                  <div className="text-sm font-medium">{f.label}</div>
                </div>
              )
            })}
          </div>
        </div>

        {/* métricas removidas por solicitação */}

      </div>
    </section>
  )
}
