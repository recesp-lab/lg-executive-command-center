export type ModuleStatus = 'completed' | 'in-progress' | 'not-started' | 'cancelled';

export interface Module {
  id: string;
  name: string;
  version?: string;
  status: ModuleStatus;
  comment: string;
}

export const MODULES_STORAGE_KEY = 'lg-dashboard:modules';

export const defaultModules: Module[] = [
  { id: '1', name: 'Folha de Pagamento', status: 'completed', comment: '' },
  { id: '2', name: 'Ponto Eletrônico / REP', status: 'completed', comment: '' },
  { id: '3', name: 'Gestão de Benefícios', status: 'completed', comment: '' },
  { id: '4', name: 'Autoatendimento & Mobile', status: 'completed', comment: '' },
  { id: '5', name: 'Alteração Cadastral', status: 'completed', comment: '' },
  { id: '6', name: 'Workflow de Dependentes', status: 'completed', comment: '' },
  { id: '7', name: 'Workflow Férias, Dados', status: 'completed', comment: '' },
  { id: '8', name: 'Workflow de Afastamento', status: 'completed', comment: '' },
  { id: '9', name: 'Interface Contábil/Financ.', version: '5.08', status: 'in-progress', comment: '' },
  { id: '10', name: 'Cargos e Salários', version: '3.07-6.07', status: 'in-progress', comment: '' },
  { id: '11', name: 'Orçamento de Pessoal', version: '17.8', status: 'in-progress', comment: '' },
  { id: '12', name: 'Comissão Digital, Roteirização', version: 'J-C7-6.7', status: 'in-progress', comment: '' },
  { id: '13', name: 'Assinador Digital', version: '3.07', status: 'in-progress', comment: '' },
  { id: '14', name: 'Workflow Benefícios', version: '6.07 - 8.07', status: 'in-progress', comment: '' },
  { id: '15', name: 'Workflow Rescisão', version: '6.07 - 8.07', status: 'in-progress', comment: '' },
  { id: '16', name: 'Workflow de lançamento de valores', version: '5.07', status: 'in-progress', comment: '' },
  { id: '17', name: 'Workflow Vale-Transporte', version: '6.07', status: 'in-progress', comment: '' },
  { id: '18', name: 'People Analytics + IA', status: 'not-started', comment: '' },
  { id: '19', name: 'Workflow Movimentação', version: 'TBC', status: 'not-started', comment: '' },
  { id: '20', name: 'New Collector', status: 'cancelled', comment: '' },
  { id: '21', name: 'Reconhecimento Facial', status: 'cancelled', comment: '' },
  { id: '22', name: 'Restaurante', status: 'cancelled', comment: '' },
];

// Mesmo princípio do teamData.ts: fallback garantido para a lista padrão,
// então a Home nunca mostra 0% de conclusão só porque o navegador é novo.
export function loadModules(): Module[] {
  try {
    const saved = localStorage.getItem(MODULES_STORAGE_KEY);
    return saved ? JSON.parse(saved) : defaultModules;
  } catch {
    return defaultModules;
  }
}
