// Paleta central de cores para gráficos - espelha exatamente as variáveis
// CSS já definidas em index.css (--chart-1 a --chart-5, --primary), pra
// nenhum gráfico do dashboard usar um tom de azul/verde/vermelho diferente
// do resto da interface.
export const chartColors = {
  primary: '#1E40AF', // igual --primary / --chart-2 - azul profundo da marca
  green: '#10B981', // --chart-1
  amber: '#F59E0B', // --chart-3
  red: '#EF4444', // --chart-4
  gold: '#B8860B', // --chart-5
  gray: '#6B7280', // --muted-foreground
  grayLight: '#CBD5E1', // tom neutro para barras de "Meta"/referência
} as const;

// Fonte consistente com o resto da interface (Inter), pra texto de eixo,
// tooltip e legenda dos gráficos não parecer "colado" com fonte diferente.
export const chartFont = {
  fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif',
};

export const chartTick = { fontSize: 11, ...chartFont };
