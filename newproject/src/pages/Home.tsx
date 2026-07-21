import DashboardLayout from '@/components/DashboardLayout';
import RiskSemaphore from '@/components/RiskSemaphore';
import ModulesDashboard from '@/components/ModulesDashboard';
import { TrendingUp, Users, Calendar, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { loadRisks, getRiskMetrics } from '@/data/risksData';
import { loadModules } from '@/data/modulesData';
import { loadTeamMembers } from '@/data/teamData';
import { loadLastUpdated } from '@/data/lastUpdated';
import { useLocation } from 'wouter';

export default function Home() {
  const [, navigate] = useLocation();

  // Todos os números vêm dos mesmos loaders usados nas outras páginas -
  // fonte única, com fallback garantido mesmo no primeiro acesso.
  const riskMetrics = getRiskMetrics(loadRisks());
  const teamMembers = loadTeamMembers();
  const modules = loadModules();

  const completedModules = modules.filter((m) => m.status === 'completed').length;
  const completionPercentage = modules.length > 0 ? Math.round((completedModules / modules.length) * 100) : 0;

  const projectDeadline = new Date('2026-08-31');
  const today = new Date();
  const daysToDeadline = Math.max(0, Math.ceil((projectDeadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)));

  const lastUpdated = loadLastUpdated();
  const lastUpdatedLabel = lastUpdated
    ? lastUpdated.toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
    : 'sem edições registradas ainda';

  // Cada card leva direto para a página onde o número nasce - a Home é o
  // hub, o detalhe mora nas páginas específicas.
  const quickStats = [
    { icon: TrendingUp, label: 'Taxa de Conclusão', value: `${completionPercentage}%`, color: 'text-blue-600', bgColor: 'bg-blue-50', href: '/cronograma' },
    { icon: Users, label: 'Membros da Equipe', value: String(teamMembers.length), color: 'text-green-600', bgColor: 'bg-green-50', href: '/team' },
    { icon: Calendar, label: 'Dias até Deadline', value: String(daysToDeadline), color: 'text-purple-600', bgColor: 'bg-purple-50', href: '/marcos' },
    { icon: AlertCircle, label: 'Riscos Críticos', value: String(riskMetrics.critical), color: 'text-red-600', bgColor: 'bg-red-50', href: '/risks' },
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
                <h1 className="text-5xl font-bold text-white mb-2">
                  Projeto LG
                </h1>
                <p className="text-xl text-blue-100">
                  Dashboard Executivo de Gestão de Projetos
                </p>
              </div>
            </div>
          </div>

          <p className="text-xs text-muted-foreground mb-6 text-right">
            Última atualização de dados: {lastUpdatedLabel}
          </p>

          {/* Quick Stats - clicáveis, levam à página de origem do número */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {quickStats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <button
                  key={index}
                  onClick={() => navigate(stat.href)}
                  className="card-premium p-6 text-left hover:shadow-md transition-shadow cursor-pointer"
                  title={`Ver detalhes de ${stat.label}`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-xs text-muted-foreground font-semibold">
                      {stat.label}
                    </p>
                    <div className={`${stat.bgColor} p-3 rounded-lg`}>
                      <Icon className={`w-6 h-6 ${stat.color}`} />
                    </div>
                  </div>
                  <p className="text-3xl font-mono font-bold text-foreground">
                    {stat.value}
                  </p>
                </button>
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

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-4 justify-center py-8">
          <Button
            className="bg-primary hover:bg-blue-800 text-white px-6"
            onClick={() => navigate('/onepager')}
          >
            Abrir One Pager Executivo
          </Button>
          <Button variant="outline" className="px-6" onClick={() => navigate('/weekly')}>
            Agendar Reunião Semanal
          </Button>
          <Button variant="outline" className="px-6" onClick={handleExportData}>
            Exportar Dados
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
}
