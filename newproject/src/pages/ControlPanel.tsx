
import DashboardLayout from '@/components/DashboardLayout';
import { controlPanelTargets } from '@/data/controlPanelMetrics';
import {
  loadRisks,
  getRiskMetrics,
} from '@/data/risksData';

export default function ControlPanel() {
const modules = JSON.parse(
  localStorage.getItem('lg-dashboard:modules') || '[]'
);

const riskMetrics = getRiskMetrics(
  loadRisks()
);

const completedModules = modules.filter(
  (m: any) => m.status === 'completed'
).length;

const progressoProjetoCalculado =
  modules.length > 0
    ? Math.round(
        (completedModules / modules.length) * 100
      )
    : 0;
const goLiveModulosCalculado =
  progressoProjetoCalculado;

const integracoesImplementadasCalculado = 85;

const testesHomologadosCalculado = 92;

 const incidentesCriticosCalculado =   riskMetrics.critical;

const riscosScore =
  incidentesCriticosCalculado === 0
    ? 100
    : incidentesCriticosCalculado <= 3
    ? 80
    : 40;

const healthScoreCalculado = Math.round(
  goLiveModulosCalculado * 0.4 +
  integracoesImplementadasCalculado * 0.2 +
  testesHomologadosCalculado * 0.2 +
  riscosScore * 0.2
);

  const indicators = [
{
  name: 'Health Score do Programa',
  target: 100,
  current: healthScoreCalculado,
},
{
  name: 'Go-Live dos Módulos',
  target: controlPanelTargets.goLiveModulos,
  current: progressoProjetoCalculado,
},
{
  name: 'Integrações Implementadas',
  target: controlPanelTargets.integracoesImplementadas,
  current: integracoesImplementadasCalculado,
},
{
  name: 'Testes Homologados',
  target: controlPanelTargets.testesHomologados,
  current: testesHomologadosCalculado,
},
{
  name: 'Incidentes Críticos',
  target: controlPanelTargets.incidentesCriticos,
  current: riskMetrics.critical,
},
  ];

  const getStatus = (
    target: number,
    current: number
  ) => {
    if (target === 0) {
      if (current === 0) return '🟢';
      if (current <= 3) return '🟡';
      return '🔴';
    }

    
const ratio = current / target;

if (ratio >= 0.8) return '🟢';
if (ratio >= 0.5) return '🟡';

return '🔴';
  };

  return (
    <DashboardLayout currentPage="control-panel">
      <div className="p-8">
        <h1
          className="text-4xl font-bold mb-8"
          style={{
            fontFamily:
              "'Playfair Display', serif",
          }}
        >
          Control Panel
        </h1>

        <div className="bg-white rounded-lg border border-border shadow-sm overflow-hidden">
          <div className="p-6 border-b">
            <h2 className="text-xl font-bold">
              Status Geral do Programa
            </h2>
          </div>

          <table className="w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="text-left p-4">
                  Indicador
                </th>
                <th className="text-center p-4">
                  Meta
                </th>
                <th className="text-center p-4">
                  Atual
                </th>
                <th className="text-center p-4">
                  Status
                </th>
              </tr>
            </thead>

            <tbody>
              {indicators.map((item) => (
                <tr
                  key={item.name}
                  className="border-t"
                >
                  <td className="p-4">
                    {item.name}
                  </td>

                  <td className="text-center p-4">
                    {item.target}
                  </td>

                  <td className="text-center p-4">
                    {item.current}
                  </td>

                  <td className="text-center p-4 text-xl">
                    {getStatus(
                      item.target,
                      item.current
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}
