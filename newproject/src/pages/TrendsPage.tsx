import DashboardLayout from '@/components/DashboardLayout';
import { TrendingUp } from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { chartColors, chartTick } from '@/data/chartColors';
import { loadSnapshots } from '@/data/snapshotsData';

const fmtDate = (iso: string) => {
  const d = new Date(iso + 'T00:00:00');
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
};

export default function TrendsPage() {
  const snapshots = loadSnapshots();

  const chartData = snapshots.map((s) => ({
    date: fmtDate(s.date),
    'Health Score (OKRs)': s.overallScore,
    'Módulos Implantados (%)': s.modulesPct,
    'Riscos Críticos': s.criticalRisks,
    'Auditoria Concluída': s.auditCompleted,
  }));

  return (
    <DashboardLayout currentPage="tendencias">
      <div className="p-8">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <TrendingUp className="w-8 h-8 text-primary" />
            <h1 className="text-4xl font-bold text-foreground">Tendências</h1>
          </div>
          <p className="text-sm text-muted-foreground">
            Evolução dos principais indicadores ao longo do tempo. Um registro por dia é capturado
            automaticamente sempre que o dashboard é aberto — o histórico se constrói sozinho.
          </p>
        </div>

        {snapshots.length < 2 ? (
          <div className="bg-white rounded-lg border border-border shadow-sm p-12 text-center">
            <TrendingUp className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-sm font-semibold text-foreground mb-1">Histórico em construção</p>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              {snapshots.length === 0
                ? 'O primeiro registro será capturado automaticamente agora que a página foi aberta. '
                : 'Já existe 1 registro capturado. '}
              A partir do segundo dia de uso, os gráficos de evolução aparecem aqui — volte amanhã
              e a linha do tempo começa a se formar.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Percentuais (0-100) */}
            <div className="bg-white rounded-lg border border-border shadow-sm p-6">
              <h2 className="text-lg font-bold text-foreground mb-4">
                Avanço do Programa (%)
              </h2>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" tick={chartTick} />
                  <YAxis domain={[0, 100]} tick={chartTick} />
                  <Tooltip />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Line
                    type="monotone"
                    dataKey="Health Score (OKRs)"
                    stroke={chartColors.primary}
                    strokeWidth={2}
                    dot={{ r: 3 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="Módulos Implantados (%)"
                    stroke={chartColors.green}
                    strokeWidth={2}
                    dot={{ r: 3 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Contagens */}
            <div className="bg-white rounded-lg border border-border shadow-sm p-6">
              <h2 className="text-lg font-bold text-foreground mb-4">
                Riscos e Auditoria (contagens)
              </h2>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" tick={chartTick} />
                  <YAxis allowDecimals={false} tick={chartTick} />
                  <Tooltip />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Line
                    type="monotone"
                    dataKey="Riscos Críticos"
                    stroke={chartColors.red}
                    strokeWidth={2}
                    dot={{ r: 3 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="Auditoria Concluída"
                    stroke={chartColors.amber}
                    strokeWidth={2}
                    dot={{ r: 3 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <p className="text-xs text-muted-foreground">
              {snapshots.length} registros no histórico (máximo de 120 dias). O registro de hoje é
              atualizado automaticamente a cada visita.
            </p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
