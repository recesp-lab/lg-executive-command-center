const LAST_UPDATED_KEY = 'lg-dashboard:last-updated';

// Chamado sempre que qualquer página salva uma edição (risco, módulo, ação
// de auditoria, membro da equipe, atualização semanal). Guarda o horário
// real da última mudança, em vez de um texto fixo escrito à mão no código.
export function markUpdated() {
  try {
    localStorage.setItem(LAST_UPDATED_KEY, new Date().toISOString());
  } catch {
    // localStorage indisponível - segue sem marcar
  }
}

export function loadLastUpdated(): Date | null {
  try {
    const raw = localStorage.getItem(LAST_UPDATED_KEY);
    return raw ? new Date(raw) : null;
  } catch {
    return null;
  }
}
