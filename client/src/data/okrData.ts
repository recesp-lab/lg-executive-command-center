import { loadModules, type Module } from './modulesData';
import { loadRisks, getRiskMetrics } from './risksData';
import { loadAuditActions, type AuditAction } from './auditData';
import { loadTeamMembers } from './teamData';

export interface KeyResult {
  id: string;
  label: string;
  current: number;
  target: number;
  unit: '%' | 'un';
  automatic: boolean;
  higherIsBetter: boolean;
}

export interface Objective {
  id: string;
  title: string;
  keyResults: KeyResult[];
}

const severityWeight = { critical: 3, medium: 2, low: 1 } as const;

// --- Métricas manuais (não existem ainda no sistema: satisfação, chamados
// de suporte, tempo médio de resolução). Ficam editáveis nesta página e
// persistem no navegador, deixando claro que não são 100% automáticas. ---

const MANUAL_STORAGE_KEY = 'lg-dashboard:okr-manual';

export interface ManualMetrics {
  satisfaction: number; // nota de 0 a 10
  supportTickets: number;
  avgResolutionDays: number;
}

const defaultManual: ManualMetrics = {
  satisfaction: 7,
  supportTickets: 0,
  avgResolutionDays: 0,
};

export function loadManualMetrics(): ManualMetrics {
  try {
    const saved = localStorage.getItem(MANUAL_STORAGE_KEY);
    return saved ? { ...defaultManual, ...JSON.parse(saved) } : defaultManual;
  } catch {
    return defaultManual;
  }
}

export function saveManualMetrics(metrics: ManualMetrics) {
  try {
    localStorage.setItem(MANUAL_STORAGE_KEY, JSON.stringify(metrics));
  } catch {
    // localStorage indisponível
  }
}

// --- Histórico de snapshots para o gráfico de tendência ---

const HISTORY_STORAGE_KEY = 'lg-dashboard:okr-history';

export interface Snapshot {
  date: string; // YYYY-MM-DD
  completionRate: number;
  riskExposure: number;
  auditProgress: number;
}

export function loadHistory(): Snapshot[] {
  try {
    const saved = localStorage.getItem(HISTORY_STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

export function saveSnapshot(snapshot: Snapshot) {
  try {
    const history = loadHistory().filter((s) => s.date !== snapshot.date);
    history.push(snapshot);
    history.sort((a, b) => a.date.localeCompare(b.date));
    // guarda só os últimos 12 snapshots (ex.: ~3 meses se salvo semanalmente)
    localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(history.slice(-12)));
  } catch {
    // localStorage indisponível
  }
}

// --- Métricas centrais, recalculadas a partir dos dados reais ---

export function computeCoreMetrics() {
  const modules = loadModules();
  const totalModules = modules.length;
  const completedModules = modules.filter((m) => m.status === 'completed').length;
  const completionRate = totalModules ? Math.round((completedModules / totalModules) * 100) : 0;

  const risks = loadRisks();
  const riskMetrics = getRiskMetrics(risks);
  const openRisks = risks.filter((r) => r.status !== 'resolved');
  const riskExposureRaw = openRisks.reduce((sum, r) => sum + severityWeight[r.impact], 0);
  const worstCase = risks.length * severityWeight.critical;
  const riskExposureIndex = worstCase ? Math.round((riskExposureRaw / worstCase) * 100) : 0;

  const auditActions = loadAuditActions();
  const auditProgress = auditActions.length
    ? Math.round((auditActions.filter((a) => a.status === 'completed').length / auditActions.length) * 100)
    : 0;
  const blockedAudit = auditActions.filter((a) => a.status === 'blocked').length;

  const today = new Date();
  const overdueAudit = auditActions.filter(
    (a) => a.status !== 'completed' && a.endDate && new Date(a.endDate) < today
  ).length;

  return {
    modules,
    totalModules,
    completedModules,
    completionRate,
    risks,
    riskMetrics,
    openRisks,
    riskExposureIndex,
    auditActions,
    auditProgress,
    blockedAudit,
    overdueAudit,
  };
}

// --- Os 3 Objetivos com seus Key Results ---

export function computeObjectives(): Objective[] {
  const core = computeCoreMetrics();
  const manual = loadManualMetrics();

  return [
    {
      id: 'o1',
      title: 'Entregar a implementação do sistema de RH LG com segurança e conformidade',
      keyResults: [
        { id: 'o1kr1', label: 'Módulos implantados', current: core.completionRate, target: 100, unit: '%', automatic: true, higherIsBetter: true },
        { id: 'o1kr2', label: 'Riscos críticos abertos', current: core.riskMetrics.critical, target: 0, unit: 'un', automatic: true, higherIsBetter: false },
        { id: 'o1kr3', label: 'Ações de auditoria concluídas', current: core.auditProgress, target: 100, unit: '%', automatic: true, higherIsBetter: true },
      ],
    },
    {
      id: 'o2',
      title: 'Garantir adoção do sistema pelos usuários finais',
      keyResults: [
        { id: 'o2kr1', label: 'Satisfação da equipe de RH (0-10)', current: manual.satisfaction, target: 8, unit: 'un', automatic: false, higherIsBetter: true },
        { id: 'o2kr2', label: 'Chamados de suporte (pós-lançamento)', current: manual.supportTickets, target: 5, unit: 'un', automatic: false, higherIsBetter: false },
      ],
    },
    {
      id: 'o3',
      title: 'Manter governança e ritmo do programa',
      keyResults: [
        { id: 'o3kr1', label: 'Ações de auditoria bloqueadas', current: core.blockedAudit, target: 0, unit: 'un', automatic: true, higherIsBetter: false },
        { id: 'o3kr2', label: 'Ações de auditoria em atraso', current: core.overdueAudit, target: 0, unit: 'un', automatic: true, higherIsBetter: false },
      ],
    },
  ];
}

// Progresso de 0 a 100% de um Key Result em relação à meta, considerando
// se "maior é melhor" (ex.: % implantado) ou "menor é melhor" (ex.: riscos abertos)
export function keyResultProgress(kr: KeyResult): number {
  if (kr.higherIsBetter) {
    if (kr.target === 0) return kr.current === 0 ? 100 : 0;
    return Math.min(100, Math.round((kr.current / kr.target) * 100));
  }
  // menor é melhor: quanto mais perto de 0 (ou da meta), melhor
  if (kr.current <= kr.target) return 100;
  // penaliza progressivamente conforme se afasta da meta
  const worst = kr.target + 5; // 5 unidades acima da meta já conta como 0%
  return Math.max(0, Math.round(100 - ((kr.current - kr.target) / (worst - kr.target)) * 100));
}

// --- KPI novo 1: Aderência ao Cronograma ---

export function computeScheduleAdherence() {
  const { modules, auditActions } = computeCoreMetrics();
  const today = new Date();
  let onTime = 0;
  let total = 0;

  modules.forEach((m: Module) => {
    if (!m.startDate || !m.endDate) return;
    total++;
    const isDone = m.status === 'completed';
    const isLate = !isDone && new Date(m.endDate) < today;
    if (!isLate) onTime++;
  });

  auditActions.forEach((a: AuditAction) => {
    if (!a.endDate) return;
    total++;
    const isDone = a.status === 'completed';
    const isLate = !isDone && new Date(a.endDate) < today;
    if (!isLate) onTime++;
  });

  return {
    onTime,
    total,
    rate: total ? Math.round((onTime / total) * 100) : 100,
  };
}

// --- KPI novo 2: Carga de Trabalho por Responsável ---

export function computeWorkload() {
  const team = loadTeamMembers();
  const { risks, auditActions } = computeCoreMetrics();

  return team
    .map((member) => {
      const openRisksCount = risks.filter((r) => r.owner === member.name && r.status !== 'resolved').length;
      const activeAuditCount = auditActions.filter(
        (a) => a.responsible.includes(member.name) && a.status !== 'completed'
      ).length;
      return {
        name: member.name,
        openRisksCount,
        activeAuditCount,
        total: openRisksCount + activeAuditCount,
      };
    })
    .filter((w) => w.total > 0)
    .sort((a, b) => b.total - a.total);
}

// --- Resumo executivo narrativo, gerado a partir dos dados ---

export function generateExecutiveSummary(): string {
  const objectives = computeObjectives();
  const core = computeCoreMetrics();

  const onTrack = objectives.filter((o) => o.keyResults.every((kr) => keyResultProgress(kr) >= 70)).length;
  const atRisk = objectives.length - onTrack;

  const parts: string[] = [];
  parts.push(
    `${onTrack} de ${objectives.length} objetivos estão dentro da meta (≥70% de progresso nos key results)${
      atRisk > 0 ? `, e ${atRisk} precisa${atRisk > 1 ? 'm' : ''} de atenção` : ''
    }.`
  );

  if (core.riskMetrics.critical > 0) {
    parts.push(`Há ${core.riskMetrics.critical} risco(s) crítico(s) ainda aberto(s).`);
  }
  if (core.overdueAudit > 0) {
    parts.push(`${core.overdueAudit} ação(ões) de auditoria estão com prazo vencido.`);
  }
  if (core.blockedAudit > 0) {
    parts.push(`${core.blockedAudit} ação(ões) de auditoria estão bloqueadas.`);
  }
  if (core.riskMetrics.critical === 0 && core.overdueAudit === 0 && core.blockedAudit === 0) {
    parts.push('Nenhum bloqueio crítico identificado no momento.');
  }

  return parts.join(' ');
}
