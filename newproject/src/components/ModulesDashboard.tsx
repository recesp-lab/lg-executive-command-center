import { CheckCircle2, AlertCircle, Clock, XCircle, Plus, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { chartColors, chartFont } from '@/data/chartColors';
import { markUpdated } from '@/data/lastUpdated';
// Antes: este arquivo mantinha sua PRÓPRIA cópia de Module/ModuleStatus e do
// array padrão de 22 módulos, separada de data/modulesData.ts. O Cronograma
// já lia de data/modulesData.ts, então uma edição feita ali podia divergir
// desta página. Agora os dois lêem exatamente a mesma fonte.
import { loadModules, MODULES_STORAGE_KEY, type Module, type ModuleStatus } from '@/data/modulesData';

const statusConfig: Record<ModuleStatus, { color: string; hex: string; label: string; icon: typeof CheckCircle2; bgLight: string; border: string; text: string }> = {
  completed: {
    color: 'bg-blue-500',
    hex: '#3B82F6', // igual ao Tailwind bg-blue-500 usado no card acima, para o card e a fatia da rosca baterem exatamente
    label: 'IMPLANTADOS (base sólida)',
    icon: CheckCircle2,
    bgLight: 'bg-blue-50',
    border: 'border-blue-500',
    text: 'text-blue-900',
  },
  'in-progress': {
    color: 'bg-yellow-400',
    hex: '#FACC15', // igual ao Tailwind bg-yellow-400 usado no card acima
    label: 'EM ANDAMENTO (alto volume crítico)',
    icon: Clock,
    bgLight: 'bg-yellow-50',
    border: 'border-yellow-400',
    text: 'text-yellow-900',
  },
  'not-started': {
    color: 'bg-red-500',
    hex: chartColors.red, // já coincide com o Tailwind bg-red-500
    label: 'NÃO INICIADO',
    icon: AlertCircle,
    bgLight: 'bg-red-50',
    border: 'border-red-500',
    text: 'text-red-900',
  },
  cancelled: {
    color: 'bg-gray-500',
    hex: chartColors.gray, // já coincide com o Tailwind bg-gray-500
    label: 'CANCELADOS',
    icon: XCircle,
    bgLight: 'bg-gray-100',
    border: 'border-gray-500',
    text: 'text-gray-900',
  },
};

const statusOrder: ModuleStatus[] = ['completed', 'in-progress', 'not-started', 'cancelled'];
const columnTitle: Record<ModuleStatus, string> = {
  completed: 'Implantados',
  'in-progress': 'Em Andamento',
  'not-started': 'Não Iniciado',
  cancelled: 'Cancelados',
};

export default function ModulesDashboard() {
  const [modules, setModules] = useState<Module[]>(() => loadModules());

  useEffect(() => {
    try {
      localStorage.setItem(MODULES_STORAGE_KEY, JSON.stringify(modules));
      markUpdated();
    } catch {
      // localStorage indisponível - segue apenas em memória
    }
  }, [modules]);

  // Estatísticas e percentuais são sempre recalculados a partir do estado atual,
  // então mudar o status de um módulo atualiza a barra de progresso na hora.
  const stats: Record<ModuleStatus, number> = {
    completed: modules.filter((m) => m.status === 'completed').length,
    'in-progress': modules.filter((m) => m.status === 'in-progress').length,
    'not-started': modules.filter((m) => m.status === 'not-started').length,
    cancelled: modules.filter((m) => m.status === 'cancelled').length,
  };

  const totalModules = modules.length;

  const percentages: Record<ModuleStatus, number> = {
    completed: totalModules ? Math.round((stats.completed / totalModules) * 100) : 0,
    'in-progress': totalModules ? Math.round((stats['in-progress'] / totalModules) * 100) : 0,
    'not-started': totalModules ? Math.round((stats['not-started'] / totalModules) * 100) : 0,
    cancelled: totalModules ? Math.round((stats.cancelled / totalModules) * 100) : 0,
  };

  const donutData = statusOrder
    .map((status) => ({ name: columnTitle[status], value: stats[status], color: statusConfig[status].hex }))
    .filter((d) => d.value > 0);

  const updateModule = (id: string, patch: Partial<Module>) => {
    setModules((prev) => prev.map((m) => (m.id === id ? { ...m, ...patch } : m)));
  };

  const deleteModule = (id: string) => {
    setModules((prev) => prev.filter((m) => m.id !== id));
  };

  const addModule = (status: ModuleStatus) => {
    const newModule: Module = {
      id: Date.now().toString(),
      name: 'Novo módulo',
      status,
      comment: '',
    };
    setModules((prev) => [...prev, newModule]);
  };

  return (
    <div className="w-full">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-foreground mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>
          Status de Implementação: Visão Geral do Projeto
        </h2>
        <div className="h-1 w-32 bg-gradient-to-r from-blue-500 to-teal-500 rounded"></div>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statusOrder.map((status) => (
          <div key={status} className={`${statusConfig[status].color} text-white p-6 rounded-lg shadow-lg`}>
            <div className="text-5xl font-bold mb-2">{String(stats[status]).padStart(2, '0')}</div>
            <div className="text-sm font-bold uppercase tracking-wide">{statusConfig[status].label}</div>
          </div>
        ))}
      </div>

      {/* Distribuição visual - gráfico de rosca em vez de só números soltos */}
      <div className="bg-white rounded-lg border border-border shadow-sm p-6 mb-8">
        <h3 className="text-lg font-bold text-foreground mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
          Distribuição dos Módulos por Status
        </h3>
        <ResponsiveContainer width="100%" height={280}>
          <PieChart>
            <Pie
              data={donutData}
              dataKey="value"
              nameKey="name"
              innerRadius={60}
              outerRadius={100}
              paddingAngle={2}
            >
              {donutData.map((entry) => (
                <Cell key={entry.name} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip />
            <Legend wrapperStyle={chartFont} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Modules Grid - each card is fully editable */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-8">
        {statusOrder.map((status) => {
          const columnModules = modules.filter((m) => m.status === status);
          return (
            <div
              key={status}
              className={`${statusConfig[status].bgLight} p-4 rounded-lg border-l-4 ${statusConfig[status].border} min-h-96 flex flex-col`}
            >
              <h3 className={`font-bold ${statusConfig[status].text} mb-3 text-sm uppercase`}>
                {columnTitle[status]} ({columnModules.length})
              </h3>
              <div className="space-y-3 flex-1">
                {columnModules.map((module) => (
                  <div key={module.id} className="bg-white/70 rounded-lg p-3 border border-border/60">
                    <div className="flex items-start gap-2 mb-2">
                      <input
                        className="flex-1 text-sm font-semibold bg-transparent border-b border-transparent hover:border-border focus:border-primary focus:outline-none px-0.5"
                        value={module.name}
                        onChange={(e) => updateModule(module.id, { name: e.target.value })}
                      />
                      <button
                        onClick={() => deleteModule(module.id)}
                        title="Remover módulo"
                        className="shrink-0 text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <input
                      className="w-full text-xs text-muted-foreground bg-transparent border-b border-transparent hover:border-border focus:border-primary focus:outline-none px-0.5 mb-2"
                      placeholder="Versão / prazo (opcional)"
                      value={module.version || ''}
                      onChange={(e) => updateModule(module.id, { version: e.target.value })}
                    />

                    <select
                      className="w-full text-xs rounded border border-border px-2 py-1 mb-2 bg-white"
                      value={module.status}
                      onChange={(e) => updateModule(module.id, { status: e.target.value as ModuleStatus })}
                    >
                      <option value="completed">Implantado</option>
                      <option value="in-progress">Em Andamento</option>
                      <option value="not-started">Não Iniciado</option>
                      <option value="cancelled">Cancelado</option>
                    </select>

                    <textarea
                      className="w-full text-xs rounded border border-border px-2 py-1 bg-white resize-none"
                      rows={2}
                      placeholder="Comentário..."
                      value={module.comment}
                      onChange={(e) => updateModule(module.id, { comment: e.target.value })}
                    />
                  </div>
                ))}
              </div>
              <button
                onClick={() => addModule(status)}
                className="mt-3 flex items-center justify-center gap-1 text-xs font-semibold text-muted-foreground hover:text-foreground py-2 border border-dashed border-border rounded-lg"
              >
                <Plus className="w-3.5 h-3.5" />
                Adicionar módulo
              </button>
            </div>
          );
        })}
      </div>

      {/* Progress Bar - auto-calculated from current module statuses */}
      <div className="flex h-16 rounded-lg overflow-hidden shadow-lg mb-6">
        {statusOrder.map((status) =>
          percentages[status] > 0 ? (
            <div
              key={status}
              className={`${statusConfig[status].color} flex items-center justify-center text-white font-bold text-xs px-1`}
              style={{ width: `${percentages[status]}%` }}
            >
              {percentages[status]}%
            </div>
          ) : null
        )}
      </div>

      {/* Meta */}
      <div className="text-center text-gray-600 text-sm">
        <p className="font-semibold">
          Meta: 100% de conclusão até <span className="font-bold">Ago 26</span> · {totalModules} módulos no total
        </p>
      </div>
    </div>
  );
}
