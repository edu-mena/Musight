import { useState } from "react";
import { X } from "lucide-react";

interface Props {
  term: string;
  definition: string;
}

export const TermTooltip = ({ term, definition }: Props) => {
  const [open, setOpen] = useState(false);

  return (
    <span className="relative inline">
      <button
        onClick={() => setOpen(true)}
        className="underline decoration-primary decoration-2 underline-offset-2 text-primary font-semibold cursor-pointer"
      >
        {term}
      </button>
      {open && (
        <>
          <span className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <span className="absolute bottom-full left-0 z-50 mb-2 w-72 rounded-xl border border-border bg-white p-4 shadow-xl">
            <span className="flex items-start justify-between gap-2 mb-1">
              <span className="font-display font-bold text-sm text-primary">{term}</span>
              <button
                onClick={() => setOpen(false)}
                className="text-muted-foreground hover:text-foreground shrink-0"
              >
                <X size={14} />
              </button>
            </span>
            <span className="text-sm text-muted-foreground leading-relaxed block">
              {definition}
            </span>
          </span>
        </>
      )}
    </span>
  );
};
