export interface Milestone {
  id: string;
  title: string;
  dueDate: string; // ISO yyyy-mm-dd
  status: 'planned' | 'delivered' | 'accepted' | 'late';
  acceptedBy: string;
  notes: string;
}

export const MILESTONES_STORAGE_KEY = 'lg-dashboard:milestones';

export const defaultMilestones: Milestone[] = [
  { id: '1', title: 'Go-Live módulos de folha e ponto', dueDate: '2026-06-15', status: 'accepted', acceptedBy: 'Silvia Melo Neves', notes: 'Base sólida em produção' },
  { id: '2', title: 'Workflows críticos (rescisão, benefícios, valores)', dueDate: '2026-08-01', status: 'planned', acceptedBy: '', notes: '' },
  { id: '3', title: 'Encerramento das ações de auditoria RA600802', dueDate: '2026-08-17', status: 'planned', acceptedBy: '', notes: 'Compromisso com auditoria interna' },
  { id: '4', title: 'Go-Live completo (100% dos módulos ativos)', dueDate: '2026-08-31', status: 'planned', acceptedBy: '', notes: 'Deadline do programa' },
];

export function loadMilestones(): Milestone[] {
  try {
    const saved = localStorage.getItem(MILESTONES_STORAGE_KEY);
    return saved ? JSON.parse(saved) : defaultMilestones;
  } catch {
    return defaultMilestones;
  }
}
