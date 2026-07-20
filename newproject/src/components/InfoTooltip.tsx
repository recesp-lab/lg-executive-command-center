import { Info } from 'lucide-react';
import { useState } from 'react';

export default function InfoTooltip({ text }: { text: string }) {
  const [open, setOpen] = useState(false);

  return (
    <span className="relative inline-block align-middle ml-1.5">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="text-muted-foreground hover:text-primary"
        title="Como esse número é calculado"
      >
        <Info className="w-3.5 h-3.5" />
      </button>
      {open && (
        <>
          {/* Camada transparente atrás da caixa, só para capturar o clique
              de "fechar" sem precisar de lógica de clique-fora. */}
          <span className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <span className="absolute z-50 left-0 top-6 w-72 p-3 bg-white border border-border rounded-lg shadow-2xl text-xs text-foreground font-normal normal-case leading-relaxed">
            {text}
          </span>
        </>
      )}
    </span>
  );
}
