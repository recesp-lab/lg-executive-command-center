import DashboardLayout from '@/components/DashboardLayout';
import RiskSemaphore from '@/components/RiskSemaphore';
import ProjectHealthBanner from '@/components/ProjectHealthBanner';
import { AlertCircle, Trash2, Edit2, Save, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';
import { getRiskMetrics, loadRisks, RISKS_STORAGE_KEY, type Risk } from '@/data/risksData';
import { loadTeamMembers } from '@/data/teamData';
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  ZAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { chartColors, chartTick } from '@/data/chartColors';
import { markUpdated } from '@/data/lastUpdated';

const STORAGE_KEY = RISKS_STORAGE_KEY;

const emptyForm = {
  title: '',
  description: '',
  impact: 'medium' as Risk['impact'],
  probability: 'medium' as Risk['probability'],
  owner: '',
  mitigation: '',
  dueDate: '',
  status: 'open' as Risk['status'],
};

export default function RisksPage() {
  const [risks, setRisks] = useState<Risk[]>(() => loadRisks());

  const [showAddForm, setShowAddForm] = useState(false);
  const [newRisk, setNewRisk] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState<Risk | null>(null);

  // Antes: JSON.parse(localStorage.getItem(...) || '[]') direto, o que
  // deixava o dropdown de responsável vazio no primeiro acesso de um
  // navegador novo. Agora usa o loader com fallback garantido.
  const teamMembers = loadTeamMembers();

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(risks));
      markUpdated();
    } catch {
      // localStorage indisponível - segue apenas em memória
    }
  }, [risks]);

  const impactConfig = {
    critical: { label: 'Crítico', color: 'bg-red-50 text-red-700 border-red-200' },
    medium: { label: 'Médio', color: 'bg-yellow-50 text-yellow-700 border-yellow-200' },
    low: { label: 'Baixo', color: 'bg-green-50 text-green-700 border-green-200' },
  };

  const probabilityConfig = {
    high: { label: 'Alta', color: 'text-red-600' },
    medium: { label: 'Média', color: 'text-yellow-600' },
    low: { label: 'Baixa', color: 'text-green-600' },
  };

  const statusConfig = {
    open: { label: 'Aberto', color: 'bg-red-50 text-red-700' },
    mitigating: { label: 'Em Mitigação', color: 'bg-yellow-50 text-yellow-700' },
    resolved: { label: 'Resolvido', color: 'bg-green-50 text-green-700' },
  };

  // A matriz de risco (mais abaixo) e o semáforo lêem diretamente de risks,
  // então qualquer edição salva aqui atualiza os dois automaticamente.
  const riskMetrics = getRiskMetrics(risks);

  // Dados para o gráfico de dispersão da Matriz de Risco. Riscos que caem
  // exatamente na mesma célula (mesmo impacto e probabilidade) recebem um
  // pequeno espalhamento para não ficarem um em cima do outro no gráfico.
  const impactValue: Record<Risk['impact'], number> = { low: 1, medium: 2, critical: 3 };
  const probValue: Record<Risk['probability'], number> = { low: 1, medium: 2, high: 3 };
  const cellGroups: Record<string, Risk[]> = {};
  risks.forEach((r) => {
    const key = `${r.impact}-${r.probability}`;
    if (!cellGroups[key]) cellGroups[key] = [];
    cellGroups[key].push(r);
  });
  const scatterData = risks.map((r) => {
    const key = `${r.impact}-${r.probability}`;
    const group = cellGroups[key];
    const indexInGroup = group.findIndex((x) => x.id === r.id);
    const spread = group.length > 1 ? (indexInGroup - (group.length - 1) / 2) * 0.18 : 0;
    return {
      id: r.id,
      x: probValue[r.probability] + spread,
      y: impactValue[r.impact] + spread,
      title: r.title,
      owner: r.owner,
      status: r.status,
      impact: r.impact,
    };
  });

  const handleAddRisk = () => {
    if (!newRisk.title.trim() || !newRisk.owner.trim()) return;
    const risk: Risk = {
      id: Date.now().toString(),
      ...newRisk,
    };
    setRisks((prev) => [risk, ...prev]);
    setNewRisk(emptyForm);
    setShowAddForm(false);
  };

  const handleDelete = (id: string) => {
    setRisks((prev) => prev.filter((r) => r.id !== id));
  };

  const startEdit = (risk: Risk) => {
    setEditingId(risk.id);
    setEditDraft({ ...risk });
  };

  const saveEdit = () => {
    if (!editDraft) return;
    setRisks((prev) => prev.map((r) => (r.id === editDraft.id ? editDraft : r)));
    setEditingId(null);
    setEditDraft(null);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditDraft(null);
  };

  return (
    <DashboardLayout currentPage="risks">
      <div className="p-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <AlertCircle className="w-8 h-8 text-primary" />
                <h1 className="text-4xl font-bold text-foreground" style={{ fontFamily: "'Playfair Display', serif" }}>
                  Gestão de Riscos
                </h1>
              </div>
              <p className="text-sm text-muted-foreground">
                Monitoramento e mitigação de riscos do projeto
              </p>
            </div>
            <Button className="bg-primary hover:bg-blue-800 text-white" onClick={() => setShowAddForm((v) => !v)}>
              Novo Risco
            </Button>
          </div>
        </div>

        {/* Status Executivo - mesma fonte usada na Home e na Auditoria */}
        <div className="mb-8">
          <ProjectHealthBanner />
        </div>

        {/* Add Form */}
        {showAddForm && (
          <div className="mb-8 bg-white rounded-lg border border-border shadow-sm p-6">
            <h3 className="text-sm font-semibold text-foreground mb-4">Novo Risco</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <input
                className="p-2 border border-border rounded-lg text-sm sm:col-span-2"
                placeholder="Título do risco"
                value={newRisk.title}
                onChange={(e) => setNewRisk((f) => ({ ...f, title: e.target.value }))}
              />
              <input
                className="p-2 border border-border rounded-lg text-sm sm:col-span-2"
                placeholder="Descrição"
                value={newRisk.description}
                onChange={(e) => setNewRisk((f) => ({ ...f, description: e.target.value }))}
              />
              <select
                className="p-2 border border-border rounded-lg text-sm"
                value={newRisk.impact}
                onChange={(e) => setNewRisk((f) => ({ ...f, impact: e.target.value as Risk['impact'] }))}
              >
                <option value="critical">Impacto: Crítico</option>
                <option value="medium">Impacto: Médio</option>
                <option value="low">Impacto: Baixo</option>
              </select>
              <select
                className="p-2 border border-border rounded-lg text-sm"
                value={newRisk.probability}
                onChange={(e) => setNewRisk((f) => ({ ...f, probability: e.target.value as Risk['probability'] }))}
              >
                <option value="high">Probabilidade: Alta</option>
                <option value="medium">Probabilidade: Média</option>
                <option value="low">Probabilidade: Baixa</option>
              </select>
              <select
                className="p-2 border border-border rounded-lg text-sm"
                value={newRisk.status}
                onChange={(e) => setNewRisk((f) => ({ ...f, status: e.target.value as Risk['status'] }))}
              >
                <option value="open">Status: Aberto</option>
                <option value="mitigating">Status: Em Mitigação</option>
                <option value="resolved">Status: Resolvido</option>
              </select>
              <select
                className="p-2 border border-border rounded-lg text-sm"
                value={newRisk.owner}
                onChange={(e) => setNewRisk((f) => ({ ...f, owner: e.target.value }))}
              >
                <option value="">Selecione um responsável</option>
                {teamMembers.map((member) => (
                  <option key={member.id} value={member.name}>
                    {member.name}
                  </option>
                ))}
              </select>
              <input
                type="date"
                className="p-2 border border-border rounded-lg text-sm"
                value={newRisk.dueDate}
                onChange={(e) => setNewRisk((f) => ({ ...f, dueDate: e.target.value }))}
              />
              <input
                className="p-2 border border-border rounded-lg text-sm sm:col-span-2"
                placeholder="Plano de mitigação"
                value={newRisk.mitigation}
                onChange={(e) => setNewRisk((f) => ({ ...f, mitigation: e.target.value }))}
              />
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowAddForm(false)}>Cancelar</Button>
              <Button className="bg-primary hover:bg-blue-800 text-white" onClick={handleAddRisk}>
                Salvar Risco
              </Button>
            </div>
          </div>
        )}

        {/* Risk Semaphore */}
        <div className="mb-8">
          <RiskSemaphore metrics={riskMetrics} />
        </div>

        {/* Risk Details */}
        <div className="space-y-6">
          <div className="bg-white rounded-lg border border-border shadow-sm p-6">
            <h2 className="text-2xl font-bold text-foreground mb-6" style={{ fontFamily: "'Playfair Display', serif" }}>
              Riscos Identificados
            </h2>

            {risks.length === 0 ? (
              <div className="p-12 text-center text-sm text-muted-foreground">
                Nenhum risco cadastrado. Clique em "Novo Risco" para adicionar o primeiro.
              </div>
            ) : (
              <div className="space-y-4">
                {risks.map((risk) => {
                  const isEditing = editingId === risk.id;

                  if (isEditing && editDraft) {
                    return (
                      <div key={risk.id} className="border-2 border-primary rounded-lg p-6 bg-blue-50/30">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                          <input
                            className="p-2 border border-border rounded-lg text-sm sm:col-span-2 font-semibold"
                            placeholder="Título"
                            value={editDraft.title}
                            onChange={(e) => setEditDraft({ ...editDraft, title: e.target.value })}
                          />
                          <input
                            className="p-2 border border-border rounded-lg text-sm sm:col-span-2"
                            placeholder="Descrição"
                            value={editDraft.description}
                            onChange={(e) => setEditDraft({ ...editDraft, description: e.target.value })}
                          />
                          <div>
                            <label className="text-xs text-muted-foreground font-semibold mb-1 block">Impacto</label>
                            <select
                              className="w-full p-2 border border-border rounded-lg text-sm"
                              value={editDraft.impact}
                              onChange={(e) => setEditDraft({ ...editDraft, impact: e.target.value as Risk['impact'] })}
                            >
                              <option value="critical">Crítico</option>
                              <option value="medium">Médio</option>
                              <option value="low">Baixo</option>
                            </select>
                          </div>
                          <div>
                            <label className="text-xs text-muted-foreground font-semibold mb-1 block">Probabilidade</label>
                            <select
                              className="w-full p-2 border border-border rounded-lg text-sm"
                              value={editDraft.probability}
                              onChange={(e) => setEditDraft({ ...editDraft, probability: e.target.value as Risk['probability'] })}
                            >
                              <option value="high">Alta</option>
                              <option value="medium">Média</option>
                              <option value="low">Baixa</option>
                            </select>
                          </div>
                          <div>
                            <label className="text-xs text-muted-foreground font-semibold mb-1 block">Status</label>
                            <select
                              className="w-full p-2 border border-border rounded-lg text-sm"
                              value={editDraft.status}
                              onChange={(e) => setEditDraft({ ...editDraft, status: e.target.value as Risk['status'] })}
                            >
                              <option value="open">Aberto</option>
                              <option value="mitigating">Em Mitigação</option>
                              <option value="resolved">Resolvido</option>
                            </select>
                          </div>
                          <div>
                            <label className="text-xs text-muted-foreground font-semibold mb-1 block">Responsável</label>
                            <select
                              className="w-full p-2 border border-border rounded-lg text-sm"
                              value={editDraft.owner}
                              onChange={(e) => setEditDraft({ ...editDraft, owner: e.target.value })}
                            >
                              <option value="">Selecione um responsável</option>
                              {teamMembers.map((member) => (
                                <option key={member.id} value={member.name}>
                                  {member.name}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className="text-xs text-muted-foreground font-semibold mb-1 block">Prazo</label>
                            <input
                              type="date"
                              className="w-full p-2 border border-border rounded-lg text-sm"
                              value={editDraft.dueDate}
                              onChange={(e) => setEditDraft({ ...editDraft, dueDate: e.target.value })}
                            />
                          </div>
                          <div className="sm:col-span-2">
                            <label className="text-xs text-muted-foreground font-semibold mb-1 block">Plano de Mitigação</label>
                            <input
                              className="w-full p-2 border border-border rounded-lg text-sm"
                              value={editDraft.mitigation}
                              onChange={(e) => setEditDraft({ ...editDraft, mitigation: e.target.value })}
                            />
                          </div>
                        </div>
                        <div className="flex justify-end gap-3">
                          <Button variant="outline" onClick={cancelEdit}>
                            <X className="w-4 h-4 mr-1" /> Cancelar
                          </Button>
                          <Button className="bg-primary hover:bg-blue-800 text-white" onClick={saveEdit}>
                            <Save className="w-4 h-4 mr-1" /> Salvar
                          </Button>
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div
                      key={risk.id}
                      className="border border-border rounded-lg p-6 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-foreground mb-2">
                            {risk.title}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {risk.description}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span
                            className={`inline-block px-3 py-1 rounded-full text-xs font-medium border ${
                              statusConfig[risk.status].color
                            }`}
                          >
                            {statusConfig[risk.status].label}
                          </span>
                          <button
                            className="p-2 hover:bg-secondary rounded-lg transition-colors"
                            onClick={() => startEdit(risk)}
                            title="Editar risco"
                          >
                            <Edit2 className="w-4 h-4 text-muted-foreground hover:text-foreground" />
                          </button>
                          <button
                            className="p-2 hover:bg-secondary rounded-lg transition-colors"
                            onClick={() => handleDelete(risk.id)}
                            title="Remover risco"
                          >
                            <Trash2 className="w-4 h-4 text-muted-foreground hover:text-destructive" />
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4 py-4 border-t border-b border-border">
                        <div>
                          <p className="text-xs text-muted-foreground font-semibold mb-1">
                            Impacto
                          </p>
                          <span
                            className={`inline-block px-2 py-1 rounded text-xs font-medium border ${
                              impactConfig[risk.impact].color
                            }`}
                          >
                            {impactConfig[risk.impact].label}
                          </span>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground font-semibold mb-1">
                            Probabilidade
                          </p>
                          <p className={`text-sm font-semibold ${probabilityConfig[risk.probability].color}`}>
                            {probabilityConfig[risk.probability].label}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground font-semibold mb-1">
                            Responsável
                          </p>
                          <p className="text-sm font-medium text-foreground">{risk.owner}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground font-semibold mb-1">
                            Prazo
                          </p>
                          <p className="text-sm font-medium text-foreground">
                            {risk.dueDate ? new Date(risk.dueDate).toLocaleDateString('pt-BR') : '—'}
                          </p>
                        </div>
                      </div>

                      <div>
                        <p className="text-xs text-muted-foreground font-semibold mb-2">
                          Plano de Mitigação
                        </p>
                        <p className="text-sm text-foreground bg-secondary p-3 rounded-lg">
                          {risk.mitigation || 'Não definido'}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Risk Matrix - agora como gráfico de dispersão, se atualiza automaticamente pois lê direto de risks */}
          <div className="bg-white rounded-lg border border-border shadow-sm p-6">
            <h2 className="text-2xl font-bold text-foreground mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>
              Matriz de Risco
            </h2>
            <p className="text-xs text-muted-foreground mb-6">
              Cada ponto é um risco, posicionado por impacto (eixo vertical) e probabilidade (eixo horizontal) reais.
              Passe o mouse sobre um ponto para ver os detalhes.
            </p>

            {risks.length === 0 ? (
              <div className="p-12 text-center text-sm text-muted-foreground">Nenhum risco para plotar ainda.</div>
            ) : (
              <ResponsiveContainer width="100%" height={360}>
                <ScatterChart margin={{ top: 20, right: 30, bottom: 20, left: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    type="number"
                    dataKey="x"
                    name="Probabilidade"
                    domain={[0.5, 3.5]}
                    ticks={[1, 2, 3]}
                    tick={chartTick}
                    tickFormatter={(v) => ({ 1: 'Baixa', 2: 'Média', 3: 'Alta' }[Math.round(v)] || '')}
                    label={{ value: 'Probabilidade', position: 'insideBottom', offset: -10, fontSize: 12 }}
                  />
                  <YAxis
                    type="number"
                    dataKey="y"
                    name="Impacto"
                    domain={[0.5, 3.5]}
                    ticks={[1, 2, 3]}
                    tick={chartTick}
                    tickFormatter={(v) => ({ 1: 'Baixo', 2: 'Médio', 3: 'Crítico' }[Math.round(v)] || '')}
                    label={{ value: 'Impacto', angle: -90, position: 'insideLeft', fontSize: 12 }}
                  />
                  <ZAxis range={[160, 160]} />
                  <Tooltip
                    cursor={{ strokeDasharray: '3 3' }}
                    content={({ active, payload }) => {
                      if (!active || !payload || !payload.length) return null;
                      const d = payload[0].payload as (typeof scatterData)[number];
                      return (
                        <div className="bg-white border border-border rounded-lg shadow-lg p-3 text-xs max-w-xs">
                          <p className="font-semibold text-foreground mb-1">{d.title}</p>
                          <p className="text-muted-foreground">Responsável: {d.owner}</p>
                          <p className="text-muted-foreground">Status: {statusConfig[d.status].label}</p>
                        </div>
                      );
                    }}
                  />
                  <Scatter data={scatterData} fill={chartColors.primary}>
                    {scatterData.map((entry) => (
                      <Cell
                        key={entry.id}
                        fill={
                          entry.impact === 'critical'
                            ? chartColors.red
                            : entry.impact === 'medium'
                            ? chartColors.amber
                            : chartColors.green
                        }
                      />
                    ))}
                  </Scatter>
                </ScatterChart>
              </ResponsiveContainer>
            )}

            <div className="flex flex-wrap gap-4 mt-4 pt-4 border-t border-border text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-red-500 inline-block"></span> Impacto Crítico</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-yellow-500 inline-block"></span> Impacto Médio</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-green-500 inline-block"></span> Impacto Baixo</span>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
