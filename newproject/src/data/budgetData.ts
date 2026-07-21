export interface BudgetLine {
  id: string;
  item: string;
  front: string; // frente: LG, Recrut.AI, Consultoria, Interno...
  planned: number;
  actual: number;
  notes: string;
}

export const BUDGET_STORAGE_KEY = 'lg-dashboard:budget';

export const defaultBudget: BudgetLine[] = [
  { id: '1', item: 'Licenciamento LG Sistemas', front: 'LG', planned: 0, actual: 0, notes: 'Preencher com valores contratuais' },
  { id: '2', item: 'Implantação e consultoria LG', front: 'LG', planned: 0, actual: 0, notes: '' },
  { id: '3', item: 'Recrut.AI - assinatura anual', front: 'Recrut.AI', planned: 0, actual: 0, notes: '' },
  { id: '4', item: 'Horas equipe interna (TI + RH)', front: 'Interno', planned: 0, actual: 0, notes: 'Estimativa de dedicação' },
];

export function loadBudget(): BudgetLine[] {
  try {
    const saved = localStorage.getItem(BUDGET_STORAGE_KEY);
    return saved ? JSON.parse(saved) : defaultBudget;
  } catch {
    return defaultBudget;
  }
}
