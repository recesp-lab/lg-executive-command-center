import { loadModules } from '@/data/modulesData';
import { loadRisks, getRiskMetrics } from '@/data/risksData';
import { loadAuditActions } from '@/data/auditData';
import { loadTeamMembers } from '@/data/teamData';
import { computeObjectives, overallProgramScore } from '@/data/okrData';

export interface Snapshot {
  date: string; // ISO yyyy-mm-dd
  overallScore: number; // Health Score do Programa (OKRs)
  modulesPct: number; // % de módulos implantados
  criticalRisks: number;
  auditCompleted: number;
  auditTotal: number;
  teamCount: number;
}

export const SNAPSHOTS_STORAGE_KEY = 'lg-dashboard:snapshots';
const MAX_SNAPSHOTS = 120;

export function loadSnapshots(): Snapshot[] {
  try {
    const saved = localStorage.getItem(SNAPSHOTS_STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

// Chamado a cada carregamento do app (via DashboardLayout). Grava no máximo
// UM snapshot por dia: se já existe um de hoje, ele é atualizado com os
// valores mais recentes; senão, um novo é adicionado. Assim o histórico
// cresce sozinho, sem ninguém precisar lembrar de "tirar a foto".
export function captureSnapshotIfNeeded() {
  try {
    const modules = loadModules();
    const modulesPct = modules.length
      ? Math.round((modules.filter((m) => m.status === 'completed').length / modules.length) * 100)
      : 0;
    const riskMetrics = getRiskMetrics(loadRisks());
    const audit = loadAuditActions();
    const objectives = computeObjectives();

    const today = new Date().toISOString().slice(0, 10);
    const snap: Snapshot = {
      date: today,
      overallScore: overallProgramScore(objectives),
      modulesPct,
      criticalRisks: riskMetrics.critical,
      auditCompleted: audit.filter((a) => a.status === 'completed').length,
      auditTotal: audit.length,
      teamCount: loadTeamMembers().length,
    };

    const history = loadSnapshots();
    const last = history[history.length - 1];
    if (last && last.date === today) {
      history[history.length - 1] = snap;
    } else {
      history.push(snap);
    }
    localStorage.setItem(SNAPSHOTS_STORAGE_KEY, JSON.stringify(history.slice(-MAX_SNAPSHOTS)));
  } catch {
    // localStorage indisponível - histórico simplesmente não acumula
  }
}
