
import React from 'react';
import { 
  Smartphone, 
  Map as MapIcon, 
  CreditCard, 
  Code2, 
  Zap, 
  Layers, 
  Database, 
  Cpu, 
  Globe 
} from 'lucide-react';
import { NavItem, Product, Feature } from './types';

export const NAV_ITEMS: NavItem[] = [
  { label: 'Sobre', href: '#sobre' },
  { label: 'Partículas', href: '#ecossistema' },
  { label: 'Produtos', href: '#produtos' },
  { label: 'Sites', href: '#sites' },
  { label: 'Vantagens', href: '#vantagens' },
  { label: 'Tecnologia', href: '#tecnologia' },
];



export const PRODUCTS: Product[] = [
  {
    id: 'fidelidade',
    title: 'App de Cartão Fidelidade',
    description: 'Plataforma digital para retenção de clientes focada em pequenos e médios estabelecimentos locais.',
    icon: <CreditCard className="w-8 h-8 text-emerald-400" />,
    href: 'https://appfidelidade-production.up.railway.app/',
    features: [
      'Acúmulo de pontos digitais',
      'Resgate de benefícios simplificado',
      'Ideal para lava jatos e restaurantes',
      'Relatórios de engajamento para o dono'
    ]
  },
  {
    id: 'delivery',
    title: 'App Delivery',
    description: 'Sistema completo de pedidos online, gestão de entregas e integração com meios de pagamento.',
    icon: <Smartphone className="w-8 h-8 text-blue-500" />,
    href: 'https://gemini-burgueroficial.vercel.app/',
    features: [
      'Carrinho e checkout integrados',
      'Roteirização de entregas',
      'Painel de pedidos em tempo real',
      'Suporte a múltiplos estabelecimentos'
    ]
  },
  {
    id: 'explorer',
    title: 'City Explorer',
    description: 'Guia interativo com pontos de interesse, rotas e recomendações locais para turistas.',
    icon: <MapIcon className="w-8 h-8 text-purple-500" />,
    href: 'https://cityexplorer-production-c395.up.railway.app/',
    features: [
      'Mapas com filtros inteligentes',
      'Sugestões personalizadas',
      'Integração com parceiros locais',
      'Experiência mobile-first'
    ]
  },
  {
    id: 'agendai',
    title: 'App AgendAI',
    description: 'Agenda inteligente para gerenciamento de compromissos com assistente automatizado.',
    icon: <Smartphone className="w-8 h-8 text-indigo-500" />,
    href: 'https://agend-ai-jade.vercel.app/',
    features: [
      'Agendamento automatizado',
      'Lembretes por push',
      'Sincronização com calendários',
      'Relatórios e histórico de atendimentos'
    ]
  },
  {
    id: 'cardapio',
    title: 'App Cardápio',
    description: 'Cardápio digital interativo para restaurantes com pedidos via QR Code e gestão de mesas.',
    icon: <Smartphone className="w-8 h-8 text-amber-500" />,
    href: 'https://appcardapio-production.up.railway.app/',
    features: [
      'Cardápio com imagens e descrições',
      'Pedidos diretos para cozinha',
      'Gerenciamento de mesas',
      'Integração com PDV'
    ]
  }
];

export const FEATURES: Feature[] = [
  {
    title: 'Desenvolvimento Sob Medida',
    description: 'Código limpo e escalável planejado exclusivamente para o seu modelo de negócio.',
    icon: <Code2 className="w-6 h-6" />,
    details: 'Projetamos e implementamos sistemas sob medida — desde especificação e arquitetura até entrega e manutenção. Utilizamos padrões de código, testes automatizados e pipelines de deploy para garantir qualidade e previsibilidade.',
    bullets: [
      'Arquitetura pensada para seu domínio',
      'Testes (unitários e E2E)',
      'CI/CD e deploy automatizado'
    ],
    image: 'https://plus.unsplash.com/premium_photo-1720287601300-cf423c3d6760?q=80&w=1170&auto=format&fit=crop'
  },
  {
    title: 'Performance & Escalabilidade',
    description: 'Infraestrutura robusta capaz de suportar o crescimento rápido da sua base de usuários.',
    icon: <Zap className="w-6 h-6" />,
    details: 'Dimensionamento horizontal, caching, otimização de queries e monitoramento contínuo para manter latência baixa mesmo sob cargas altas. Planejamos capacidade e custos conforme crescimento.',
    bullets: [
      'Caching e CDN',
      'Auto-scaling e load balancing',
      'Monitoramento e alertas (APM)'
    ],
    image: 'https://plus.unsplash.com/premium_photo-1682141013747-5aed8665c154?q=80&w=1170&auto=format&fit=crop'
  },
  {
    title: 'Interface Moderna',
    description: 'Design UI/UX focado em conversão e prazer visual de nível internacional.',
    icon: <Layers className="w-6 h-6" />,
    details: 'Criamos interfaces acessíveis, responsivas e testadas com usuários. Prototipagem rápida, design systems e animações sutis para melhorar a compreensão e conversão.',
    bullets: [
      'Design system consistente',
      'Prototipagem e testes com usuários',
      'Acessibilidade e responsividade'
    ],
    image: 'https://plus.unsplash.com/premium_photo-1720287601920-ee8c503af775?q=80&w=1170&auto=format&fit=crop'
  },
  {
    title: 'Integração com APIs',
    description: 'Conectamos seu sistema com as melhores ferramentas do mercado global.',
    icon: <Globe className="w-6 h-6" />,
    details: 'Integramos pagamentos, ERP, CRMs, serviços de geolocalização e mais. Documentamos contratos (OpenAPI) e garantimos resiliência nas chamadas externas com retry/backoff e circuit breakers.',
    bullets: [
      'OpenAPI / Swagger',
      'Gateways e segurança (API Keys, OAuth)',
      'Retries, timeouts e circuit breakers'
    ],
    image: 'https://plus.unsplash.com/premium_photo-1682145730713-34bba6d3d14a?q=80&w=1170&auto=format&fit=crop'
  },
  {
    title: 'Banco de Dados Estruturado',
    description: 'Segurança e agilidade no acesso aos dados mais importantes da sua operação.',
    icon: <Database className="w-6 h-6" />,
    details: 'Modelagem de dados eficiente, índices corretos, backups, planos de retenção e políticas de acesso para proteger e acelerar seu negócio. Suporte a SQL e NoSQL conforme necessidade.',
    bullets: [
      'Modelagem e normalização',
      'Backups e recovery',
      'Índices e otimização de queries'
    ],
    image: 'https://plus.unsplash.com/premium_photo-1681487942927-e1a2786e6036?q=80&w=1170&auto=format&fit=crop'
  },
  {
    title: 'Soluções Inovadoras',
    description: 'Transformamos problemas complexos em experiências simples e digitais.',
    icon: <Cpu className="w-6 h-6" />,
    details: 'Aplicamos técnicas de design thinking, machine learning e automação para criar produtos que surpreendem e geram valor. Prototipamos hipóteses e validamos com dados.',
    bullets: [
      'Prototipagem de hipóteses',
      'ML e automação quando faz sentido',
      'Validação com métricas reais'
    ],
    image: 'https://plus.unsplash.com/premium_photo-1661953088879-149ce8f63974?q=80&w=1170&auto=format&fit=crop'
  }
];
