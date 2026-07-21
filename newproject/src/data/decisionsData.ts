export interface Decision {
  id: string;
  date: string; // ISO yyyy-mm-dd
  decision: string;
  owner: string;
  context: string;
  meeting: string;
}

export const DECISIONS_STORAGE_KEY = 'lg-dashboard:decisions';

export const defaultDecisions: Decision[] = [
  {
    id: '1',
    date: '2026-07-15',
    decision: 'Cancelar os módulos New Collector, Reconhecimento Facial e Restaurante',
    owner: 'Renato Pereira',
    context: 'Baixo retorno frente ao custo de implantação; foco redirecionado para módulos críticos de folha e workflows.',
    meeting: 'Steering Committee Jul/26',
  },
  {
    id: '2',
    date: '2026-07-08',
    decision: 'Priorizar as ações de auditoria da seção 3.1 (Backup Datamace) antes do Go-Live',
    owner: 'Denis Soares Dias',
    context: 'Risco de exposição de dados sensíveis classificado como crítico pela auditoria RA600802.',
    meeting: 'Reunião semanal',
  },
];

export function loadDecisions(): Decision[] {
  try {
    const saved = localStorage.getItem(DECISIONS_STORAGE_KEY);
    return saved ? JSON.parse(saved) : defaultDecisions;
  } catch {
    return defaultDecisions;
  }
}
