
import DashboardLayout from '@/components/DashboardLayout';
import React from 'react';
import {
  loadRisks,
  getRiskMetrics,
} from '@/data/risksData';

export default function ControlPanel() {

  const TARGETS_STORAGE =
    'lg-dashboard:control-panel-targets';

  const [targets, setTargets] = React.useState(() => {
    const saved = localStorage.getItem(
      TARGETS_STORAGE
    );

    return saved
      ? JSON.parse(saved)
      : {
          healthScore: 100,
          goLiveModulos: 100,
          integracoesImplementadas: 100,
          testesHomologados: 100,
          incidentesCriticos: 0,
        };
  });

  const METRICS_STORAGE =
    'lg-dashboard:control-panel-metrics';
const HISTORY_STORAGE =
  'lg-dashboard:control-panel-history';

  const [manualMetrics, setManualMetrics] =
    React.useState(() => {
      const saved = localStorage.getItem(
        METRICS_STORAGE
      );

      return saved
        ? JSON.parse(saved)
        : {
            integracoesImplementadas: 85,
            testesHomologados: 92,
          };
    });

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


const integracoesImplementadasCalculado =
  manualMetrics.integracoesImplementadas;

const testesHomologadosCalculado =
  manualMetrics.testesHomologados;

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

React.useEffect(() => {
  localStorage.setItem(
    TARGETS_STORAGE,
    JSON.stringify(targets)
  );
}, [targets]);

React.useEffect(() => {
  localStorage.setItem(
    METRICS_STORAGE,
    JSON.stringify(manualMetrics)
  );
}, [manualMetrics]);

  const indicators = [
{
  name: 'Health Score do Programa',
  target: targets.healthScore,
  current: healthScoreCalculado,
},
{
  name: 'Go-Live dos Módulos',
  target: targets.goLiveModulos,
  current: progressoProjetoCalculado,
},
{
  name: 'Integrações Implementadas',
  target: targets.integracoesImplementadas,
  current: integracoesImplementadasCalculado,
},
{
  name: 'Testes Homologados',
  target: targets.testesHomologados,
  current: testesHomologadosCalculado,
},
{
  name: 'Incidentes Críticos',
  target: targets.incidentesCriticos,
  current: riskMetrics.critical,
},
  ];

const saveMonthlySnapshot = () => {
  const currentHistory = JSON.parse(
    localStorage.getItem(HISTORY_STORAGE) || '[]'
  );

  const snapshot = {
    mes: new Date().toLocaleDateString(
      'pt-BR',
      {
        month: '2-digit',
        year: 'numeric',
      }
    ),

    healthScore: healthScoreCalculado,

    goLive: goLiveModulosCalculado,

    integracoes:
      integracoesImplementadasCalculado,

    testes:
      testesHomologadosCalculado,

    incidentes:
      incidentesCriticosCalculado,

    createdAt: new Date().toISOString(),
  };

  currentHistory.push(snapshot);

  localStorage.setItem(
    HISTORY_STORAGE,
    JSON.stringify(currentHistory)
  );

  alert(
    'Fechamento mensal salvo com sucesso.'
  );
};

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
<p className="text-sm text-muted-foreground mt-2">
  Metas são configuráveis. Valores atuais e status são calculados automaticamente.
</p>
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
  <input
    type="number"
min="0"
  max="100"
    value={item.target}
    className="w-20 text-center border rounded px-2 py-1"
    onChange={(e) => {
      const value = Number(e.target.value);

      switch (item.name) {
        case 'Health Score do Programa':
          setTargets((prev: any) => ({
            ...prev,
            healthScore: value,
          }));
          break;

        case 'Go-Live dos Módulos':
          setTargets((prev: any) => ({
            ...prev,
            goLiveModulos: value,
          }));
          break;

        case 'Integrações Implementadas':
          setTargets((prev: any) => ({
            ...prev,
            integracoesImplementadas: value,
          }));
          break;

        case 'Testes Homologados':
          setTargets((prev: any) => ({
            ...prev,
            testesHomologados: value,
          }));
          break;

        case 'Incidentes Críticos':
          setTargets((prev: any) => ({
            ...prev,
            incidentesCriticos: value,
          }));
          break;
      }
    }}
  />
</td>

<td className="text-center p-4">
  {item.name === 'Integrações Implementadas' ||
  item.name === 'Testes Homologados' ? (
    <input
      type="number"
      min="0"
      max="100"
      value={item.current}
      className="w-20 text-center border rounded px-2 py-1"
      onChange={(e) => {
        const value = Number(e.target.value);

        if (
          item.name ===
          'Integrações Implementadas'
        ) {
          setManualMetrics((prev: any) => ({
            ...prev,
            integracoesImplementadas: value,
          }));
        }

        if (
          item.name ===
          'Testes Homologados'
        ) {
          setManualMetrics((prev: any) => ({
            ...prev,
            testesHomologados: value,
          }));
        }
      }}
    />
  ) : (
    item.current
  )}
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

<div className="border-t p-6 bg-gray-50">
<button
  onClick={saveMonthlySnapshot}
  className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-blue-800"
>
  Salvar Fechamento Mensal
</button>
</div>

</div>
</div>
</DashboardLayout>
  );
}
