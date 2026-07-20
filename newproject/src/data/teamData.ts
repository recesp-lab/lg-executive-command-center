export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: string;
  organization: 'SODIMAC' | 'LG' | 'FALABELLA' | 'RECRUT.AI';
  department: string;
}

export const TEAM_STORAGE_KEY = 'lg-dashboard:team-members';

// Exportado para que TeamMembers.tsx leia a MESMA lista padrão, em vez de
// manter sua própria cópia (foi exatamente essa duplicação - com um tipo
// de organização diferente em cada arquivo - que quebrou o build do
// OnePager.tsx: 'RECRUT.AI' existia numa cópia mas não na outra).
export const defaultTeamMembers: TeamMember[] = [
  { id: '1', name: 'Bruno Rafael Costa Freitas', email: 'bfreitas@sodimac.com.br', role: 'Desenvolvedor', organization: 'SODIMAC', department: 'Desenvolvimento' },
  { id: '2', name: 'Raquel Patta Lisboa', email: 'rlisboa@sodimac.com.br', role: 'Analista de Sistemas', organization: 'SODIMAC', department: 'Análise' },
  { id: '3', name: 'André Silveira', email: 'ansilveira@sodimac.com.br', role: 'Desenvolvedor', organization: 'SODIMAC', department: 'Desenvolvimento' },
  { id: '4', name: 'Marislani', email: 'marislani@sodimac.com.br', role: 'Administrativo', organization: 'SODIMAC', department: 'Administrativo' },
  { id: '5', name: 'Douglas Martins Moura', email: 'douglas.moura@lg.com.br', role: 'Gerente de Projeto', organization: 'LG', department: 'Gerência' },
  { id: '6', name: 'Silvia Melo Neves', email: 'sneves@sodimac.com.br', role: 'Gerente de RH', organization: 'SODIMAC', department: 'RH' },
  { id: '7', name: 'Rodrigo Froes Pereira', email: 'rfroes@sodimac.com.br', role: 'Suporte Técnico', organization: 'SODIMAC', department: 'Suporte' },
  { id: '8', name: 'Roger Patrocinio Cardoso', email: 'roger.cardoso@lg.com.br', role: 'Gerente Executivo', organization: 'LG', department: 'Gerência' },
  { id: '9', name: 'Valdirene Santos', email: 'valdirene.santos@lg.com.br', role: 'Administrativo', organization: 'LG', department: 'Administrativo' },
  { id: '10', name: 'Douglas Felipe Belio', email: 'dbelio@sodimac.com.br', role: 'Desenvolvedor', organization: 'SODIMAC', department: 'Desenvolvimento' },
  { id: '11', name: 'Denis Soares Dias', email: 'ddias@sodimac.com.br', role: 'Gerente de TI', organization: 'SODIMAC', department: 'TI' },
  { id: '12', name: 'Alex Bertuqui', email: 'abertuqui@sodimac.com.br', role: 'Desenvolvedor', organization: 'SODIMAC', department: 'Desenvolvimento' },
  { id: '13', name: 'Daniel Neris de Souza', email: 'dsouza@sodimac.com.br', role: 'Analista de Sistemas', organization: 'SODIMAC', department: 'Análise' },
  { id: '14', name: 'Jessé Pereira de Souza Toledo', email: 'jtoledo_ext@sodimac.com.br', role: 'Suporte Técnico', organization: 'SODIMAC', department: 'Suporte' },
  { id: '15', name: 'Dagmar Orlando Monteiro Duarte', email: 'dduarte@sodimac.com.br', role: 'Auditor', organization: 'SODIMAC', department: 'Auditoria' },
  { id: '16', name: 'Renato Pereira', email: 'rpereira@falabella.cl', role: 'Administrativo', organization: 'FALABELLA', department: 'Administrativo' },
];

// Lê a equipe persistida (editada na página Equipe), com fallback garantido
// para a lista padrão. Usado por Home, Riscos, Auditoria, One Pager e a
// própria página Equipe - nunca mostra lista vazia, mesmo no primeiro
// acesso de um navegador novo.
export function loadTeamMembers(): TeamMember[] {
  try {
    const saved = localStorage.getItem(TEAM_STORAGE_KEY);
    return saved ? JSON.parse(saved) : defaultTeamMembers;
  } catch {
    return defaultTeamMembers;
  }
}
