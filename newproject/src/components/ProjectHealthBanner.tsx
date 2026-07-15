import { computeProjectHealth } from '@/data/projectHealth';

export default function ProjectHealthBanner() {
  const health = computeProjectHealth();

  const bg =
    health.status === 'green'
      ? 'bg-green-50 border-green-300'
      : health.status === 'yellow'
      ? 'bg-yellow-50 border-yellow-300'
      : 'bg-red-50 border-red-300';

  const dot =
    health.status === 'green' ? 'bg-green-500' : health.status === 'yellow' ? 'bg-yellow-500' : 'bg-red-500';

  const projectLabel =
    health.status === 'green' ? 'Projeto Saudável' : health.status === 'yellow' ? 'Projeto em Atenção' : 'Projeto Crítico';

  return (
    <div className={`p-6 rounded-lg border-2 ${bg}`}>
      <div className="flex items-start gap-4">
        <div className={`w-10 h-10 rounded-full shrink-0 mt-1 ${dot}`}></div>
        <div>
          <h2 className="font-bold text-lg text-foreground">Status Executivo do Projeto</h2>
          <p className="text-foreground">{projectLabel}</p>
          {health.reasons.length > 0 ? (
            <ul className="text-sm text-foreground mt-1 space-y-0.5">
              {health.reasons.map((r, i) => (
                <li key={i}>• {r}</li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-foreground mt-1">Riscos Críticos: {health.criticalRisks}</p>
          )}
        </div>
      </div>
    </div>
  );
}
