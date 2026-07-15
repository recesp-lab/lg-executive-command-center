import { loadModules } from './modulesData';
import { loadRisks, getRiskMetrics } from './risksData';
import { loadAuditActions } from './auditData';
import { loadTeamMembers } from './teamData';

export type Unit = '%' | 'un' | 'score';

export interface KeyResultDef {
  id: string;
  label: string;
  unit: Unit;
  higherIsBetter: boolean;
  automatic: boolean;
  defaultTarget: number;
  defaultCurrent?: number; // só usado se automatic === false
  targetLabel?: string; // texto customizado quando a meta não é um número único (ex.: "30%-50%")
  fixedTarget?: boolean; // true = meta não é editável (ex.: contagens que sempre miram 0)
  countStatus?: { redAt: number }; // semáforo por contagem: 0=verde, 1..redAt-1=amarelo, >=redAt=vermelho
}

export interface KeyResult extends KeyResultDef {
  target: number;
  current: number;
}

export interface ObjectiveDef {
  id: string;
  pillar: string;
  objective: string;
  keyResults: KeyResultDef[];
}

export interface Objective extends Omit<ObjectiveDef, 'keyResults'> {
  keyResults: KeyResult[];
}

const TARGETS_KEY = 'lg-dashboard:okr-targets';
const MANUAL_CURRENTS_KEY = 'lg-dashboard:okr-manual-currents';
const EXEC_MESSAGE_KEY = 'lg-dashboard:okr-exec-message';
const HISTORY_KEY = 'lg-dashboard:okr-history-v2';

function loadMap(key: string): Record<string, number> {
  try {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : {};
  } catch {
    return {};
  }
}

function saveMap(key: string, map: Record<string, number>) {
  try {
    localStorage.setItem(key, JSON.stringify(map));
  } catch {
    // localStorage indisponível
  }
}

export function loadTargets(): Record<string, number> {
  return loadMap(TARGETS_KEY);
}

export function saveTarget(id: string, value: number) {
  const map = loadTargets();
  map[id] = value;
  saveMap(TARGETS_KEY, map);
}

export function loadManualCurrents(): Record<string, number> {
  return loadMap(MANUAL_CURRENTS_KEY);
}

export function saveManualCurrent(id: string, value: number) {
  const map = loadManualCurrents();
  map[id] = value;
  saveMap(MANUAL_CURRENTS_KEY, map);
}

const STATUS_GERAL_DEFS: KeyResultDef[] = [
  { id: 'sg1', label: 'Progresso do Projeto', unit: '%', higherIsBetter: true, automatic: true, defaultTarget: 100 },
  { id: 'sg2', label: 'Go-Live dos Módulos', unit: '%', higherIsBetter: true, automatic: true, defaultTarget: 100 },
  { id: 'sg3', label: 'Ações de Auditoria em Atraso/Bloqueadas', unit: 'un', higherIsBetter: false, automatic: true, defaultTarget: 0, fixedTarget: true, countStatus: { redAt: 3 } },
  { id: 'sg4', label: 'Riscos Críticos', unit: 'un', higherIsBetter: false, automatic: true, defaultTarget: 0, fixedTarget: true, countStatus: { redAt: 3 } },
];

const OBJECTIVE_DEFS: ObjectiveDef[] = [
  {
    id: 'o1',
    pillar: 'Eficiência Operacional',
    objective: 'Modernizar os processos de RH através da automação e digitalização.',
    keyResults: [
      { id: 'o1k1', label: 'Redução de erros em benefícios', unit: '%', higherIsBetter: true, automatic: false, defaultTarget: 80, defaultCurrent: 72 },
      { id: 'o1k2', label: 'Redução de retrabalho manual', unit: '%', higherIsBetter: true, automatic: false, defaultTarget: 40, defaultCurrent: 35 },
      { id: 'o1k3', label: 'Redução de erros de processamento da folha', unit: '%', higherIsBetter: true, automatic: false, defaultTarget: 60, defaultCurrent: 55 },
      { id: 'o1k4', label: 'Redução do tempo de fechamento da folha', unit: '%', higherIsBetter: true, automatic: false, defaultTarget: 40, defaultCurrent: 38, targetLabel: '30%-50%' },
      { id: 'o1k5', label: 'Processos automatizados', unit: '%', higherIsBetter: true, automatic: false, defaultTarget: 90, defaultCurrent: 78 },
    ],
  },
  {
    id: 'o2',
    pillar: 'Dados e Governança',
    objective: 'Garantir uma única fonte confiável de dados para RH e liderança.',
    keyResults: [
      { id: 'o2k1', label: 'Redução de divergências entre sistemas', unit: '%', higherIsBetter: true, automatic: false, defaultTarget: 90, defaultCurrent: 88 },
      { id: 'o2k2', label: 'Precisão cadastral', unit: '%', higherIsBetter: true, automatic: false, defaultTarget: 99, defaultCurrent: 98.5 },
      { id: 'o2k3', label: 'Eliminação de planilhas paralelas', unit: '%', higherIsBetter: true, automatic: false, defaultTarget: 100, defaultCurrent: 80 },
      { id: 'o2k4', label: 'Integrações automatizadas', unit: '%', higherIsBetter: true, automatic: false, defaultTarget: 100, defaultCurrent: 90 },
      { id: 'o2k5', label: 'Dashboards corporativos implantados', unit: '%', higherIsBetter: true, automatic: false, defaultTarget: 100, defaultCurrent: 60 },
    ],
  },
  {
    id: 'o3',
    pillar: 'Experiência Digital',
    objective: 'Promover autonomia e melhor experiência digital.',
    keyResults: [
      { id: 'o3k1', label: 'Uso do Autosserviço', unit: '%', higherIsBetter: true, automatic: false, defaultTarget: 85, defaultCurrent: 78 },
      { id: 'o3k2', label: 'Redução de chamados de RH', unit: '%', higherIsBetter: true, automatic: false, defaultTarget: 50, defaultCurrent: 45 },
      { id: 'o3k3', label: 'Solicitações digitais', unit: '%', higherIsBetter: true, automatic: false, defaultTarget: 90, defaultCurrent: 82 },
      { id: 'o3k4', label: 'Satisfação dos usuários', unit: 'score', higherIsBetter: true, automatic: false, defaultTarget: 4.5, defaultCurrent: 4.4 },
      { id: 'o3k5', label: 'Adoção pós Go-Live', unit: '%', higherIsBetter: true, automatic: false, defaultTarget: 85, defaultCurrent: 80 },
    ],
  },
  {
    id: 'o4',
    pillar: 'Compliance',
    objective: 'Reduzir riscos trabalhistas e fortalecer conformidade legal.',
    keyResults: [
      { id: 'o4k1', label: 'Aderência ao eSocial', unit: '%', higherIsBetter: true, automatic: false, defaultTarget: 100, defaultCurrent: 100 },
      { id: 'o4k2', label: 'Compliance LGPD', unit: '%', higherIsBetter: true, automatic: false, defaultTarget: 100, defaultCurrent: 95 },
      { id: 'o4k3', label: 'Redução de não conformidades', unit: '%', higherIsBetter: true, automatic: false, defaultTarget: 30, defaultCurrent: 28 },
      { id: 'o4k4', label: 'Auditorias sem apontamentos críticos', unit: '%', higherIsBetter: true, automatic: true, defaultTarget: 100 },
      { id: 'o4k5', label: 'Controles automatizados implantados', unit: '%', higherIsBetter: true, automatic: false, defaultTarget: 100, defaultCurrent: 85 },
    ],
  },
  {
    id: 'o5',
    pillar: 'Analytics',
    objective: 'Transformar dados em decisões para geração de valor ao negócio.',
    keyResults: [
      { id: 'o5k1', label: 'Dashboards executivos disponíveis', unit: '%', higherIsBetter: true, automatic: false, defaultTarget: 100, defaultCurrent: 75 },
      { id: 'o5k2', label: 'Redução do tempo para relatórios', unit: '%', higherIsBetter: true, automatic: false, defaultTarget: 80, defaultCurrent: 70 },
      { id: 'o5k3', label: 'Indicadores atualizados automaticamente', unit: '%', higherIsBetter: true, automatic: true, defaultTarget: 100 },
      { id: 'o5k4', label: 'Líderes utilizando dashboards', unit: '%', higherIsBetter: true, automatic: false, defaultTarget: 90, defaultCurrent: 65 },
      { id: 'o5k5', label: 'Consolidação manual eliminada', unit: '%', higherIsBetter: true, automatic: false, defaultTarget: 70, defaultCurrent: 60 },
    ],
  },
];

function computeAutomaticValue(id: string): number {
  const modules = loadModules();
  const totalModules = modules.length;
  const completed = modules.filter((m) => m.status === 'completed').length;
  const completionRate = totalModules ? Math.round((completed / totalModules) * 100) : 0;

  const risks = loadRisks();
  const riskMetrics = getRiskMetrics(risks);

  const auditActions = loadAuditActions();
  const today = new Date();
  // Conta uma vez só cada ação que esteja bloqueada OU com prazo vencido,
  // mesmo que se encaixe nos dois casos ao mesmo tempo.
  const issueIds = new Set(
    auditActions
      .filter(
        (a) =>
          a.status === 'blocked' ||
          (a.status !== 'completed' && a.endDate && new Date(a.endDate) < today)
      )
      .map((a) => a.id)
  );

  switch (id) {
    case 'sg1': {
      // Progresso do Projeto = Health Score do Programa (média dos 5 pilares),
      // em vez de duplicar o Go-Live dos Módulos ou depender de estimativa manual.
      const objectives = computeObjectives();
      return overallProgramScore(objectives);
    }
    case 'sg2':
      return completionRate;
    case 'sg3':
      // Ações de Auditoria em Atraso ou Bloqueadas
      return issueIds.size;
    case 'sg4':
      // Riscos Críticos
      return riskMetrics.critical;
    case 'o4k4': {
      const blockedAudit = auditActions.filter((a) => a.status === 'blocked').length;
      return auditActions.length ? Math.round(((auditActions.length - blockedAudit) / auditActions.length) * 100) : 100;
    }
    case 'o5k3': {
      const allDefs = [...STATUS_GERAL_DEFS, ...OBJECTIVE_DEFS.flatMap((o) => o.keyResults)];
      const autoCount = allDefs.filter((d) => d.automatic).length;
      return Math.round((autoCount / allDefs.length) * 100);
    }
    default:
      return 0;
  }
}

function hydrateKeyResult(def: KeyResultDef): KeyResult {
  const targets = loadTargets();
  const manualCurrents = loadManualCurrents();
  const target = def.fixedTarget ? def.defaultTarget : targets[def.id] ?? def.defaultTarget;
  const current = def.automatic
    ? computeAutomaticValue(def.id)
    : manualCurrents[def.id] ?? def.defaultCurrent ?? 0;
  return { ...def, target, current };
}

export function computeStatusGeral(): KeyResult[] {
  return STATUS_GERAL_DEFS.map(hydrateKeyResult);
}

export function computeObjectives(): Objective[] {
  return OBJECTIVE_DEFS.map((o) => ({
    ...o,
    keyResults: o.keyResults.map(hydrateKeyResult),
  }));
}

export function achievementPct(kr: KeyResult): number {
  if (kr.higherIsBetter) {
    if (kr.target === 0) return kr.current === 0 ? 100 : 0;
    return Math.min(100, Math.round((kr.current / kr.target) * 100));
  }
  if (kr.current <= kr.target) return 100;
  const worst = kr.target + 5;
  return Math.max(0, Math.round(100 - ((kr.current - kr.target) / (worst - kr.target)) * 100));
}

export function statusEmoji(pct: number): string {
  if (pct >= 80) return '🟢';
  if (pct >= 60) return '🟡';
  return '🔴';
}

// Para indicadores de contagem (ex.: "Ações de Auditoria em Atraso/Bloqueadas",
// "Riscos Críticos"): 0 = verde, 1 até redAt-1 = amarelo, redAt ou mais = vermelho.
// Critério simples e documentado, consistente com o mesmo usado no Painel de
// Controle e na fórmula de Status Executivo do Projeto (projectHealth.ts).
export function keyResultStatusEmoji(kr: KeyResult): string {
  if (kr.countStatus) {
    if (kr.current <= 0) return '🟢';
    if (kr.current < kr.countStatus.redAt) return '🟡';
    return '🔴';
  }
  return statusEmoji(achievementPct(kr));
}

export function objectiveScore(obj: Objective): number {
  return Math.round(obj.keyResults.reduce((sum, kr) => sum + achievementPct(kr), 0) / obj.keyResults.length);
}

export function overallProgramScore(objectives: Objective[]): number {
  return Math.round(objectives.reduce((sum, o) => sum + objectiveScore(o), 0) / objectives.length);
}

export function overallStatusLabel(score: number): { label: string; emoji: string } {
  if (score >= 80) return { label: 'On Track', emoji: '🟢' };
  if (score >= 60) return { label: 'Atenção', emoji: '🟡' };
  return { label: 'Crítico', emoji: '🔴' };
}

export interface Benefit {
  id: string;
  label: string;
  impact: 'Alta' | 'Média' | 'Média/Alta' | 'Baixa';
}

const BENEFITS_KEY = 'lg-dashboard:okr-benefits';

const defaultBenefits: Benefit[] = [
  { id: 'b1', label: 'Redução de retrabalho', impact: 'Alta' },
  { id: 'b2', label: 'Menor custo operacional RH', impact: 'Alta' },
  { id: 'b3', label: 'Redução de riscos trabalhistas', impact: 'Alta' },
  { id: 'b4', label: 'Maior produtividade do RH', impact: 'Alta' },
  { id: 'b5', label: 'Melhor experiência do colaborador', impact: 'Média/Alta' },
  { id: 'b6', label: 'Decisão baseada em dados', impact: 'Alta' },
  { id: 'b7', label: 'Escalabilidade operacional', impact: 'Alta' },
];

export function loadBenefits(): Benefit[] {
  try {
    const saved = localStorage.getItem(BENEFITS_KEY);
    return saved ? JSON.parse(saved) : defaultBenefits;
  } catch {
    return defaultBenefits;
  }
}

export function saveBenefits(benefits: Benefit[]) {
  try {
    localStorage.setItem(BENEFITS_KEY, JSON.stringify(benefits));
  } catch {
    // localStorage indisponível
  }
}

export function generateExecutiveDraft(objectives: Objective[]): string {
  const score = overallProgramScore(objectives);
  const { label } = overallStatusLabel(score);
  const behind = objectives.filter((o) => objectiveScore(o) < 80);

  let msg = `O Projeto LG encontra-se com ${score}% de progresso geral (${label}).`;
  if (behind.length === 0) {
    msg += ' Todos os pilares estão dentro da meta.';
  } else {
    msg += ` Os principais focos de atenção estão em: ${behind.map((o) => o.pillar).join(', ')}.`;
  }
  return msg;
}

export function loadExecutiveMessage(objectives: Objective[]): string {
  try {
    const saved = localStorage.getItem(EXEC_MESSAGE_KEY);
    return saved || generateExecutiveDraft(objectives);
  } catch {
    return generateExecutiveDraft(objectives);
  }
}

export function saveExecutiveMessage(message: string) {
  try {
    localStorage.setItem(EXEC_MESSAGE_KEY, message);
  } catch {
    // localStorage indisponível
  }
}

export interface Snapshot {
  date: string;
  overall: number;
  pillars: Record<string, number>;
}

export function loadHistory(): Snapshot[] {
  try {
    const saved = localStorage.getItem(HISTORY_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

export function saveSnapshot(objectives: Objective[]) {
  try {
    const today = new Date().toISOString().slice(0, 10);
    const pillars: Record<string, number> = {};
    objectives.forEach((o) => {
      pillars[o.pillar] = objectiveScore(o);
    });
    const snapshot: Snapshot = { date: today, overall: overallProgramScore(objectives), pillars };
    const history = loadHistory().filter((s) => s.date !== today);
    history.push(snapshot);
    history.sort((a, b) => a.date.localeCompare(b.date));
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history.slice(-12)));
  } catch {
    // localStorage indisponível
  }
}

// ============================================================================
// KPIs operacionais adicionais - complementam a estrutura do PDF com dados
// que já são 100% automáticos a partir de Módulos, Riscos e Auditoria.
// ============================================================================

export function computeScheduleAdherence() {
  const modules = loadModules();
  const auditActions = loadAuditActions();
  const today = new Date();
  let onTime = 0;
  let total = 0;

  modules.forEach((m) => {
    if (!m.startDate || !m.endDate) return;
    total++;
    const isDone = m.status === 'completed';
    const isLate = !isDone && new Date(m.endDate) < today;
    if (!isLate) onTime++;
  });

  auditActions.forEach((a) => {
    if (!a.endDate) return;
    total++;
    const isDone = a.status === 'completed';
    const isLate = !isDone && new Date(a.endDate) < today;
    if (!isLate) onTime++;
  });

  return { onTime, total, rate: total ? Math.round((onTime / total) * 100) : 100 };
}

export function computeWorkload() {
  const team = loadTeamMembers();
  const risks = loadRisks();
  const auditActions = loadAuditActions();

  return team
    .map((member) => {
      const openRisksCount = risks.filter((r) => r.owner === member.name && r.status !== 'resolved').length;
      const activeAuditCount = auditActions.filter(
        (a) => a.responsible.includes(member.name) && a.status !== 'completed'
      ).length;
      return { name: member.name, openRisksCount, activeAuditCount, total: openRisksCount + activeAuditCount };
    })
    .filter((w) => w.total > 0)
    .sort((a, b) => b.total - a.total);
}

