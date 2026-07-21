import DashboardLayout from '@/components/DashboardLayout';
import { Wallet, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';
import { loadBudget, BUDGET_STORAGE_KEY, type BudgetLine } from '@/data/budgetData';
import { markUpdated } from '@/data/lastUpdated';

const fmt = (n: number) =>
  n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 });

export default function BudgetPage() {
  const [lines, setLines] = useState<BudgetLine[]>(() => loadBudget());

  useEffect(() => {
    try {
      localStorage.setItem(BUDGET_STORAGE_KEY, JSON.stringify(lines));
      markUpdated();
    } catch {
      // localStorage indisponível
    }
  }, [lines]);

  const update = (id: string, patch: Partial<BudgetLine>) => {
    setLines((prev) => prev.map((l) => (l.id === id ? { ...l, ...patch } : l)));
  };

  const totals = {
    planned: lines.reduce((s, l) => s + (l.planned || 0), 0),
    actual: lines.reduce((s, l) => s + (l.actual || 0), 0),
  };
  const variance = totals.actual - totals.planned;
  const variancePct = totals.planned > 0 ? Math.round((variance / totals.planned) * 100) : 0;

  const fronts = Array.from(new Set(lines.map((l) => l.front))).sort();

  return (
    <DashboardLayout currentPage="orcamento">
      <div className="p-8">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Wallet className="w-8 h-8 text-primary" />
                <h1 className="text-4xl font-bold text-foreground">Orçamento do Programa</h1>
              </div>
              <p className="text-sm text-muted-foreground">
                Planejado vs. realizado por frente de trabalho. Todos os campos são editáveis na própria tabela.
              </p>
            </div>
            <Button
              className="bg-primary hover:bg-blue-800 text-white gap-2"
              onClick={() =>
                setLines((prev) => [
                  ...prev,
                  { id: Date.now().toString(), item: 'Novo item', front: 'Interno', planned: 0, actual: 0, notes: '' },
                ])
              }
            >
              <Plus className="w-4 h-4" />
              Nova Linha
            </Button>
          </div>
        </div>

        {/* Cards de totais */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-lg border border-border shadow-sm p-4">
            <p className="text-xs text-muted-foreground font-semibold mb-2">Total Planejado</p>
            <p className="text-3xl font-bold text-foreground">{fmt(totals.planned)}</p>
          </div>
          <div className="bg-white rounded-lg border border-border shadow-sm p-4">
            <p className="text-xs text-muted-foreground font-semibold mb-2">Total Realizado</p>
            <p className="text-3xl font-bold text-foreground">{fmt(totals.actual)}</p>
          </div>
          <div
            className={`rounded-lg border shadow-sm p-4 ${
              variance > 0 ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'
            }`}
          >
            <p className={`text-xs font-semibold mb-2 ${variance > 0 ? 'text-red-700' : 'text-green-700'}`}>
              Variação
            </p>
            <p className={`text-3xl font-bold ${variance > 0 ? 'text-red-700' : 'text-green-700'}`}>
              {variance > 0 ? '+' : ''}{fmt(variance)} {totals.planned > 0 ? `(${variancePct > 0 ? '+' : ''}${variancePct}%)` : ''}
            </p>
          </div>
        </div>

        {/* Tabela editável */}
        <div className="bg-white rounded-lg border border-border shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-border">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-foreground">Item</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-foreground">Frente</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-foreground">Planejado (R$)</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-foreground">Realizado (R$)</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-foreground">Variação</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-foreground">Notas</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-foreground"></th>
                </tr>
              </thead>
              <tbody>
                {lines.map((l, idx) => {
                  const lineVar = (l.actual || 0) - (l.planned || 0);
                  return (
                    <tr key={l.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="px-4 py-3">
                        <input
                          className="w-full text-sm bg-transparent border-b border-transparent hover:border-border focus:border-primary focus:outline-none"
                          value={l.item}
                          onChange={(e) => update(l.id, { item: e.target.value })}
                        />
                      </td>
                      <td className="px-4 py-3">
                        <input
                          className="w-28 text-sm bg-transparent border-b border-transparent hover:border-border focus:border-primary focus:outline-none"
                          value={l.front}
                          onChange={(e) => update(l.id, { front: e.target.value })}
                          list="fronts-list"
                        />
                      </td>
                      <td className="px-4 py-3 text-right">
                        <input
                          type="number"
                          min={0}
                          className="w-32 text-sm text-right bg-transparent border-b border-transparent hover:border-border focus:border-primary focus:outline-none"
                          value={l.planned || 0}
                          onChange={(e) => update(l.id, { planned: Number(e.target.value) || 0 })}
                        />
                      </td>
                      <td className="px-4 py-3 text-right">
                        <input
                          type="number"
                          min={0}
                          className="w-32 text-sm text-right bg-transparent border-b border-transparent hover:border-border focus:border-primary focus:outline-none"
                          value={l.actual || 0}
                          onChange={(e) => update(l.id, { actual: Number(e.target.value) || 0 })}
                        />
                      </td>
                      <td className={`px-4 py-3 text-right text-sm font-semibold ${lineVar > 0 ? 'text-red-600' : lineVar < 0 ? 'text-green-600' : 'text-muted-foreground'}`}>
                        {lineVar === 0 ? '—' : `${lineVar > 0 ? '+' : ''}${fmt(lineVar)}`}
                      </td>
                      <td className="px-4 py-3">
                        <input
                          className="w-full text-sm text-muted-foreground bg-transparent border-b border-transparent hover:border-border focus:border-primary focus:outline-none"
                          value={l.notes}
                          onChange={(e) => update(l.id, { notes: e.target.value })}
                        />
                      </td>
                      <td className="px-4 py-3">
                        <button
                          className="p-2 hover:bg-secondary rounded-lg"
                          onClick={() => setLines((prev) => prev.filter((x) => x.id !== l.id))}
                          title="Remover linha"
                        >
                          <Trash2 className="w-4 h-4 text-muted-foreground hover:text-destructive" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <datalist id="fronts-list">
            {fronts.map((f) => (
              <option key={f} value={f} />
            ))}
          </datalist>
        </div>

        <p className="text-xs text-muted-foreground mt-4">
          Variação positiva (vermelho) = acima do planejado. Variação negativa (verde) = abaixo do planejado.
        </p>
      </div>
    </DashboardLayout>
  );
}
