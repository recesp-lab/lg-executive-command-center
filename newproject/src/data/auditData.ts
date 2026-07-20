export interface AuditAction {
  id: string;
  activity: string;
  section: string;
  startDate: string;
  endDate: string;
  responsible: string[];
  status: 'completed' | 'in-progress' | 'planned' | 'blocked';
}

// Mesma chave usada dentro de AuditPlan.tsx - lendo daqui, este arquivo
// sempre reflete as edições reais feitas na página de Auditoria, sem
// precisar duplicar lógica de edição.
export const AUDIT_STORAGE_KEY = 'lg-dashboard:audit-actions';

// Exportado para que AuditPlan.tsx e Cronograma.tsx leiam a MESMA lista
// padrão, em vez de cada um manter sua própria cópia (que já causou
// dessincronia antes, do lado de Módulos).
export const defaultAuditActions: AuditAction[] = [
  { id: '3.1.1', activity: 'Eliminar o backup da rede compartilhada', section: '3.1 Exposição de dados sensíveis (Backup Datamace)', startDate: '2026-06-15', endDate: '2026-06-22', responsible: ['Silvia Melo Neves', 'Denis Soares Dias'], status: 'completed' },
  { id: '3.1.2', activity: 'Migrar para um repositório seguro com controle de acesso', section: '3.1 Exposição de dados sensíveis (Backup Datamace)', startDate: '2026-06-22', endDate: '2026-06-29', responsible: ['Denis Soares Dias'], status: 'completed' },
  { id: '3.1.3', activity: 'Revogar acessos indevidos (incluindo outras áreas)', section: '3.1 Exposição de dados sensíveis (Backup Datamace)', startDate: '2026-06-29', endDate: '2026-07-06', responsible: ['Denis Soares Dias'], status: 'in-progress' },
  { id: '3.1.4', activity: 'Implementar uma política formal de armazenamento de backups sensíveis', section: '3.1 Exposição de dados sensíveis (Backup Datamace)', startDate: '2026-07-06', endDate: '2026-07-20', responsible: ['Denis Soares Dias'], status: 'in-progress' },
  { id: '3.1.5', activity: 'Auditoria periódica de acessos a diretórios críticos', section: '3.1 Exposição de dados sensíveis (Backup Datamace)', startDate: '2026-07-20', endDate: '2026-08-17', responsible: ['Denis Soares Dias', 'Dagmar Orlando Monteiro Duarte'], status: 'planned' },
  { id: '3.2.1', activity: 'Revogar acessos de 18 consultores LG sem vínculo', section: '3.2 Excesso de privilégios (Superusuários)', startDate: '2026-06-15', endDate: '2026-06-20', responsible: ['Silvia Melo Neves', 'Denis Soares Dias'], status: 'completed' },
  { id: '3.2.2', activity: 'Eliminar acessos excessivos de 14 usuários internos', section: '3.2 Excesso de privilégios (Superusuários)', startDate: '2026-06-20', endDate: '2026-06-27', responsible: ['Silvia Melo Neves'], status: 'completed' },
  { id: '3.2.3', activity: 'Eliminar usuário genérico (BENUP)', section: '3.2 Excesso de privilégios (Superusuários)', startDate: '2026-06-27', endDate: '2026-07-04', responsible: ['Denis Soares Dias'], status: 'in-progress' },
  { id: '3.2.4', activity: 'Criar usuários individualizados (terceiros)', section: '3.2 Excesso de privilégios (Superusuários)', startDate: '2026-07-04', endDate: '2026-07-11', responsible: ['Silvia Melo Neves', 'Denis Soares Dias'], status: 'planned' },
  { id: '3.2.5', activity: 'Definir perfis por função (RBAC)', section: '3.2 Excesso de privilégios (Superusuários)', startDate: '2026-07-11', endDate: '2026-07-18', responsible: ['Denis Soares Dias'], status: 'planned' },
  { id: '3.2.6', activity: 'Implementar revisão periódica de acessos', section: '3.2 Excesso de privilégios (Superusuários)', startDate: '2026-07-18', endDate: '2026-08-15', responsible: ['Silvia Melo Neves', 'Denis Soares Dias'], status: 'planned' },
  { id: '3.3.1', activity: 'Suspender a gestão direta de acessos por parte do RH', section: '3.3 Falta de segregação de funções (SoD)', startDate: '2026-07-06', endDate: '2026-07-13', responsible: ['Silvia Melo Neves'], status: 'planned' },
  { id: '3.3.2', activity: 'Transferir a gestão de acessos para TI/Segurança da Informação', section: '3.3 Falta de segregação de funções (SoD)', startDate: '2026-07-13', endDate: '2026-07-20', responsible: ['Denis Soares Dias'], status: 'planned' },
  { id: '3.3.3', activity: 'Implementar fluxo via ferramenta (ex.: Zendesk)', section: '3.3 Falta de segregação de funções (SoD)', startDate: '2026-07-20', endDate: '2026-07-27', responsible: ['Denis Soares Dias'], status: 'planned' },
  { id: '3.3.4', activity: 'Formalizar processo de aprovação', section: '3.3 Falta de segregação de funções (SoD)', startDate: '2026-07-27', endDate: '2026-08-03', responsible: ['Denis Soares Dias'], status: 'planned' },
  { id: '3.3.5', activity: 'Revisão semestral obrigatória de acessos', section: '3.3 Falta de segregação de funções (SoD)', startDate: '2026-08-03', endDate: '2026-08-10', responsible: ['Silvia Melo Neves', 'Denis Soares Dias'], status: 'planned' },
  { id: '3.4.1', activity: 'Bloquear acessos externos sem VPN', section: '3.4 Acesso fora de ambiente seguro', startDate: '2026-06-29', endDate: '2026-07-06', responsible: ['Silvia Melo Neves', 'Denis Soares Dias'], status: 'completed' },
  { id: '3.4.2', activity: 'Tornar a VPN obrigatória', section: '3.4 Acesso fora de ambiente seguro', startDate: '2026-07-06', endDate: '2026-07-13', responsible: ['Silvia Melo Neves', 'Denis Soares Dias'], status: 'in-progress' },
  { id: '3.4.3', activity: 'Restringir o acesso a dispositivos corporativos gerenciados', section: '3.4 Acesso fora de ambiente seguro', startDate: '2026-07-13', endDate: '2026-07-27', responsible: ['Silvia Melo Neves', 'Denis Soares Dias'], status: 'planned' },
  { id: '3.4.4', activity: 'Implementar MFA (autenticação multifator)', section: '3.4 Acesso fora de ambiente seguro', startDate: '2026-07-27', endDate: '2026-08-10', responsible: ['Silvia Melo Neves', 'Denis Soares Dias'], status: 'planned' },
  { id: '3.4.5', activity: 'Monitorar acessos suspeitos', section: '3.4 Acesso fora de ambiente seguro', startDate: '2026-08-10', endDate: '2026-08-17', responsible: ['Silvia Melo Neves', 'Denis Soares Dias'], status: 'planned' },
  { id: '4.1', activity: 'Implementação de governança de identidade e acesso (IAM)', section: '4. Ações estruturais complementares', startDate: '2026-07-06', endDate: '2026-07-20', responsible: ['Silvia Melo Neves', 'Denis Soares Dias'], status: 'planned' },
  { id: '4.2', activity: 'Criação de política formal de acessos de terceiros', section: '4. Ações estruturais complementares', startDate: '2026-07-20', endDate: '2026-08-03', responsible: ['Silvia Melo Neves', 'Denis Soares Dias'], status: 'planned' },
  { id: '4.3', activity: 'Registro (logging) e rastreabilidade completa de auditoria', section: '4. Ações estruturais complementares', startDate: '2026-08-03', endDate: '2026-08-17', responsible: ['Silvia Melo Neves', 'Denis Soares Dias'], status: 'planned' },
  { id: '4.4', activity: 'Capacitação da equipe de RH em segurança da informação', section: '4. Ações estruturais complementares', startDate: '2026-08-03', endDate: '2026-08-17', responsible: ['Silvia Melo Neves', 'Denis Soares Dias'], status: 'planned' },
  { id: '4.5', activity: 'Dashboards de acompanhamento de acessos críticos', section: '4. Ações estruturais complementares', startDate: '2026-08-10', endDate: '2026-08-17', responsible: ['Silvia Melo Neves', 'Denis Soares Dias'], status: 'planned' },
];

export function loadAuditActions(): AuditAction[] {
  try {
    const saved = localStorage.getItem(AUDIT_STORAGE_KEY);
    return saved ? JSON.parse(saved) : defaultAuditActions;
  } catch {
    return defaultAuditActions;
  }
}
