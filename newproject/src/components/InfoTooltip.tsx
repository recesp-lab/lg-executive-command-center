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
        <span className="absolute z-20 left-0 top-6 w-64 p-3 bg-white border border-border rounded-lg shadow-lg text-xs text-foreground font-normal normal-case">
          {text}
        </span>
      )}
    </span>
  );
}
