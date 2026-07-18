import { loadRisks, getRiskMetrics } from './risksData';
import { loadAuditActions } from './auditData';

export type HealthStatus = 'green' | 'yellow' | 'red';

export interface ProjectHealth {
  status: HealthStatus;
  label: string; // "Saudável" | "Atenção" | "Crítico"
  reasons: string[];
  criticalRisks: number;
  blockedAudit: number;
  overdueAudit: number;
}

// Fonte única para "o projeto está indo bem?" - usada por Dashboard, Riscos,
// Auditoria, e pelo bloco "Status Geral do Programa" dos OKRs.
//
// Conceitualmente diferente do Health Score por pilar dos OKRs (Eficiência
// Operacional, Compliance, etc.) e do Health Score do Painel de Controle:
// aqueles medem o andamento do NEGÓCIO (KRs de processo, adoção, etc.);
// esta função mede especificamente se o PROJETO em si está com bloqueios -
// riscos críticos e problemas na auditoria - por isso ficam separados de
// propósito, não é uma inconsistência remanescente.
export function computeProjectHealth(): ProjectHealth {
  const risks = loadRisks();
  const riskMetrics = getRiskMetrics(risks);

  const auditActions = loadAuditActions();
  const blockedAudit = auditActions.filter((a) => a.status === 'blocked').length;

  const today = new Date();
  const overdueAudit = auditActions.filter(
    (a) => a.status !== 'completed' && a.endDate && new Date(a.endDate) < today
  ).length;

  const reasons: string[] = [];
  if (riskMetrics.critical > 0) {
    reasons.push(`${riskMetrics.critical} risco${riskMetrics.critical > 1 ? 's' : ''} crítico${riskMetrics.critical > 1 ? 's' : ''} aberto${riskMetrics.critical > 1 ? 's' : ''}`);
  }
  if (blockedAudit > 0) {
    reasons.push(`${blockedAudit} ${blockedAudit > 1 ? 'ações' : 'ação'} de auditoria bloqueada${blockedAudit > 1 ? 's' : ''}`);
  }
  if (overdueAudit > 0) {
    reasons.push(`${overdueAudit} ${overdueAudit > 1 ? 'ações' : 'ação'} de auditoria em atraso`);
  }

  let status: HealthStatus = 'green';
  if (riskMetrics.critical >= 3 || blockedAudit >= 2 || overdueAudit >= 3) {
    status = 'red';
  } else if (riskMetrics.critical >= 1 || blockedAudit >= 1 || overdueAudit >= 1) {
    status = 'yellow';
  }

  const label = status === 'green' ? 'Saudável' : status === 'yellow' ? 'Atenção' : 'Crítico';

  return {
    status,
    label,
    reasons,
    criticalRisks: riskMetrics.critical,
    blockedAudit,
    overdueAudit,
  };
}
