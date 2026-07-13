export interface Risk {
  id: string;
  title: string;
  description: string;
  impact: 'critical' | 'medium' | 'low';
  probability: 'high' | 'medium' | 'low';
  owner: string;
  mitigation: string;
  dueDate: string;
  status: 'open' | 'mitigating' | 'resolved';
}

// Fonte única de verdade para os riscos do projeto.
// Tanto a Home quanto a página de Riscos leem daqui, então os números
// nunca ficam dessincronizados.
export const risks: Risk[] = [
  {
    id: '1',
    title: 'Atraso na integração com Backend',
    description: 'Dependência crítica do time de backend pode impactar o cronograma geral',
    impact: 'critical',
    probability: 'high',
    owner: 'Douglas Martins Moura',
    mitigation: 'Reunião semanal com time de backend para acompanhamento',
    dueDate: '2026-07-15',
    status: 'open',
  },
  {
    id: '2',
    title: 'Recursos limitados de QA',
    description: 'Equipe de QA reduzida pode comprometer qualidade dos testes',
    impact: 'critical',
    probability: 'medium',
    owner: 'Daniel Neris de Souza',
    mitigation: 'Contratação de QA contractor e automação de testes',
    dueDate: '2026-07-20',
    status: 'mitigating',
  },
  {
    id: '3',
    title: 'Mudança de requisitos do cliente',
    description: 'Cliente solicitou mudanças significativas no escopo',
    impact: 'medium',
    probability: 'high',
    owner: 'Roger Patrocinio Cardoso',
    mitigation: 'Apresentação de impacto no cronograma e negociação',
    dueDate: '2026-07-10',
    status: 'open',
  },
  {
    id: '4',
    title: 'Indisponibilidade de servidor de produção',
    description: 'Risco de downtime durante o deployment',
    impact: 'medium',
    probability: 'low',
    owner: 'Denis Soares Dias',
    mitigation: 'Plano de rollback e deployment em horário de baixa demanda',
    dueDate: '2026-07-25',
    status: 'mitigating',
  },
  {
    id: '5',
    title: 'Falta de documentação técnica',
    description: 'Documentação incompleta pode dificultar manutenção futura',
    impact: 'low',
    probability: 'medium',
    owner: 'Alex Bertuqui',
    mitigation: 'Alocação de tempo para documentação em cada sprint',
    dueDate: '2026-07-30',
    status: 'open',
  },
];

export function getRiskMetrics(riskList: Risk[] = risks) {
  return {
    critical: riskList.filter((r) => r.impact === 'critical').length,
    medium: riskList.filter((r) => r.impact === 'medium').length,
    low: riskList.filter((r) => r.impact === 'low').length,
  };
}

export const RISKS_STORAGE_KEY = 'lg-dashboard:risks';

// Lê os riscos persistidos (editados na página de Riscos) e cai para a
// lista padrão se ainda não houver nada salvo. Usado tanto pela Home quanto
// pela página de Riscos, então os dois nunca ficam dessincronizados.
export function loadRisks(): Risk[] {
  try {
    const saved = localStorage.getItem(RISKS_STORAGE_KEY);
    return saved ? JSON.parse(saved) : risks;
  } catch {
    return risks;
  }
}
