import DashboardLayout from '@/components/DashboardLayout';
import RiskSemaphore from '@/components/RiskSemaphore';
import ModulesDashboard from '@/components/ModulesDashboard';
import { TrendingUp, Users, Calendar, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { loadRisks, getRiskMetrics } from '@/data/risksData';
import { useLocation } from 'wouter';

// Data da última revisão de conteúdo do dashboard.
// Atualize esta constante sempre que os números/dados forem revisados.
const LAST_UPDATED = '06/07/2026';

export default function Home() {
  const [, navigate] = useLocation();

  // Lê os mesmos riscos (incluindo edições salvas) usados na página de
  // Riscos, então este número nunca fica dessincronizado.
  const riskMetrics = getRiskMetrics(loadRisks());
const teamMembers = JSON.parse(
  localStorage.getItem('lg-dashboard:team-members') || '[]'
);

const executiveStatus =
  riskMetrics.critical >= 3
    ? 'red'
    : riskMetrics.critical >= 1
    ? 'yellow'
    : 'green';
  
  const quickStats = [
    {
      icon: TrendingUp,
      label: 'Taxa de Conclusão',
      value: '35%',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
{
  icon: Users,
  label: 'Membros da Equipe',
  value: String(teamMembers.length),
  color: 'text-green-600',
  bgColor: 'bg-green-50',
},
    {
      icon: Calendar,
      label: 'Dias até Deadline',
      value: '31',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      icon: AlertCircle,
      label: 'Riscos Críticos',
      value: String(riskMetrics.critical),
      color: 'text-red-600',
      bgColor: 'bg-red-50',
    },
  ];

  const handleExportData = () => {
    const exportPayload = {
      exportedAt: new Date().toISOString(),
      quickStats: quickStats.map(({ label, value }) => ({ label, value })),
      riskMetrics,
    };
    const blob = new Blob([JSON.stringify(exportPayload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `projeto-lg-dashboard-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <DashboardLayout currentPage="dashboard">
      <div className="p-8">
        {/* Hero Section */}
        <div className="mb-8">
          <div className="relative rounded-lg overflow-hidden mb-4">
            <img
              src="/manus-storage/hero-dashboard_5313de43.png"
              alt="Hero Dashboard"
              className="w-full h-48 object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-blue-900/80 to-blue-700/60 flex items-center">
              <div className="px-8">
                <h1 className="text-5xl font-bold text-white mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>
                  Projeto LG
                </h1>
                <p className="text-xl text-blue-100">
                  Dashboard Executivo de Gestão de Projetos
                </p>
              </div>
            </div>
          </div>

          <p className="text-xs text-muted-foreground mb-6 text-right">
            Última atualização de dados: {LAST_UPDATED}
          </p>

<div className="mb-6">
  <div
    className={`p-6 rounded-lg border-2 ${
      executiveStatus === 'green'
        ? 'bg-green-50 border-green-300'
        : executiveStatus === 'yellow'
        ? 'bg-yellow-50 border-yellow-300'
        : 'bg-red-50 border-red-300'
    }`}
  >
    <div className="flex items-center gap-4">
      <div className="text-4xl">
        {executiveStatus === 'green'
          ? '🟢'
          : executiveStatus === 'yellow'
          ? '🟡'
          : '🔴'}
      </div>

      <div>
        <h2 className="font-bold text-lg">
          Status Executivo do Projeto
        </h2>

        <p>
          {executiveStatus === 'green'
            ? 'Projeto Saudável'
            : executiveStatus === 'yellow'
            ? 'Projeto em Atenção'
            : 'Projeto Crítico'}
        </p>

        <p className="text-sm mt-1">
          Riscos Críticos: {riskMetrics.critical}
        </p>
      </div>
    </div>
  </div>
</div>
          {/* Quick Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {quickStats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div key={index} className="card-premium p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-xs text-muted-foreground font-semibold">
                        {stat.label}
                      </p>
                    </div>
                    <div className={`${stat.bgColor} p-3 rounded-lg`}>
                      <Icon className={`w-6 h-6 ${stat.color}`} />
                    </div>
                  </div>
                  <p className="text-3xl font-mono font-bold text-foreground">
                    {stat.value}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Modules Dashboard - Full Width */}
        <div className="mb-8">
          <ModulesDashboard />
        </div>

        {/* Risk Semaphore - Full Width so it's never squeezed */}
        <div className="mb-8">
          <RiskSemaphore metrics={riskMetrics} />
        </div>

        {/* Timeline + Key Metrics side by side */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Project Timeline */}
          <div className="bg-white rounded-lg border border-border shadow-sm p-6">
            <h2 className="text-lg font-bold text-foreground mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
              Cronograma do Projeto
            </h2>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-semibold text-foreground">Fase 1: Planejamento</p>
                  <span className="text-xs font-bold text-green-600">100%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-green-500 h-2 rounded-full" style={{ width: '100%' }}></div>
                </div>
                <p className="text-xs text-muted-foreground mt-1">Concluído em 15/06/2026</p>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-semibold text-foreground">Fase 2: Desenvolvimento</p>
                  <span className="text-xs font-bold text-blue-600">65%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-500 h-2 rounded-full" style={{ width: '65%' }}></div>
                </div>
                <p className="text-xs text-muted-foreground mt-1">Prazo: 01/08/2026</p>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-semibold text-foreground">Fase 3: Testes & QA</p>
                  <span className="text-xs font-bold text-yellow-600">25%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '25%' }}></div>
                </div>
                <p className="text-xs text-muted-foreground mt-1">Prazo: 15/08/2026</p>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-semibold text-foreground">Fase 4: Deploy</p>
                  <span className="text-xs font-bold text-gray-600">0%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-gray-400 h-2 rounded-full" style={{ width: '0%' }}></div>
                </div>
                <p className="text-xs text-muted-foreground mt-1">Prazo: 01/09/2026</p>
              </div>
            </div>
          </div>

          {/* Key Metrics */}
          <div className="bg-white rounded-lg border border-border shadow-sm p-6">
            <h2 className="text-lg font-bold text-foreground mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
              Indicadores-Chave
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-secondary rounded-lg">
                <p className="text-xs text-muted-foreground font-semibold mb-2">
                  Velocidade da Equipe
                </p>
                <p className="text-2xl font-bold text-foreground">8.5</p>
                <p className="text-xs text-green-600 font-semibold mt-1">↑ 12% vs semana anterior</p>
              </div>
              <div className="p-4 bg-secondary rounded-lg">
                <p className="text-xs text-muted-foreground font-semibold mb-2">
                  Taxa de Defeitos
                </p>
                <p className="text-2xl font-bold text-foreground">2.3%</p>
                <p className="text-xs text-red-600 font-semibold mt-1">↑ 0.5% vs semana anterior</p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons - now wired to real actions */}
        <div className="flex flex-wrap gap-4 justify-center py-8">
          <Button
            className="bg-primary hover:bg-blue-800 text-white px-6"
            onClick={() => navigate('/weekly')}
          >
            Agendar Reunião Semanal
          </Button>
          <Button variant="outline" className="px-6" onClick={() => window.print()}>
            Gerar Relatório
          </Button>
          <Button variant="outline" className="px-6" onClick={handleExportData}>
            Exportar Dados
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
}
