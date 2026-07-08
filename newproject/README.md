# Projeto LG — Dashboard Executivo

Projeto independente (React + Vite + TypeScript + Tailwind v4), sem depender do Manus.
Já inclui todas as correções feitas: números de risco/equipe sincronizados, matriz de
risco funcional, formulários de Novo Risco/Nova Atualização, exportação CSV/JSON,
persistência local, e o bug de contagem de módulos corrigido.

## Rodar localmente

Pré-requisito: [Node.js](https://nodejs.org) instalado (versão 18 ou mais recente).

```bash
npm install
npm run dev
```

Abre em `http://localhost:5173`.

## Publicar de graça (sem precisar de servidor)

### Opção A — Vercel (mais simples)
1. Cria uma conta grátis em vercel.com
2. "Add New Project" → importa este projeto (via upload do zip ou conectando ao GitHub)
3. O Vercel detecta automaticamente que é um projeto Vite e configura tudo
4. Clica em "Deploy" — em ~1 minuto você tem uma URL pública

### Opção B — Netlify
1. Cria conta grátis em netlify.com
2. Arrasta a pasta do projeto (depois de rodar `npm run build`, arrasta a pasta `dist`) direto na tela do Netlify
3. Pronto, já tem link público

### Opção C — GitHub Pages
Precisa de configuração extra de `base` no `vite.config.ts`; recomendo Vercel ou Netlify por serem mais diretos para este tipo de projeto.

## Estrutura

```
src/
  components/       componentes reutilizáveis (layout, semáforo de risco, equipe, módulos)
  components/ui/     Button, Toaster, Tooltip (versões simplificadas, sem dependência do shadcn completo)
  contexts/          ThemeProvider (hoje só tema claro)
  data/              risksData.ts — fonte única dos riscos (Home e página de Riscos leem daqui)
  pages/             cada rota do dashboard (Home, Riscos, Auditoria, Semanal, Equipe)
```

## Observação importante

Este projeto **não foi testado com `npm install` neste ambiente** (sem acesso à internet
no momento da criação). O código foi revisado com cuidado, mas rode `npm run dev` e
me avise se aparecer algum erro no terminal — corrijo rapidamente.
