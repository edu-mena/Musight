import { useState, useRef, useEffect } from "react";
import { X } from "lucide-react";

interface TermTooltipProps {
  term: string;
  definition: string;
}

export const TermTooltip = ({ term, definition }: TermTooltipProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState<"bottom" | "top" | "left">("bottom");
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const tooltipRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!isOpen || !triggerRef.current || !tooltipRef.current) return;

    const triggerRect = triggerRef.current.getBoundingClientRect();
    const tooltipRect = tooltipRef.current.getBoundingClientRect();
    const viewport = {
      width: window.innerWidth,
      height: window.innerHeight,
    };

    let newPosition: "bottom" | "top" | "left" = "bottom";
    const spaceBelow = viewport.height - triggerRect.bottom;
    const spaceAbove = triggerRect.top;
    const spaceRight = viewport.width - triggerRect.right;

    if (spaceBelow < tooltipRect.height + 8 && spaceAbove > spaceBelow) {
      newPosition = "top";
    } else if (
      spaceBelow < tooltipRect.height + 8 &&
      spaceAbove < tooltipRect.height + 8 &&
      spaceRight < tooltipRect.width + 8
    ) {
      newPosition = "left";
    }

    setPosition(newPosition);
  }, [isOpen]);

  const positionClasses = {
    bottom: "bottom-full mb-2 left-1/2 -translate-x-1/2",
    top: "top-full mt-2 left-1/2 -translate-x-1/2",
    left: "right-full mr-2 top-1/2 -translate-y-1/2",
  };

  return (
    <div className="relative inline-block">
      <button
        ref={triggerRef}
        onClick={() => setIsOpen(!isOpen)}
        className="inline font-bold italic text-primary hover:text-primary/80 cursor-help transition-colors underline underline-offset-2 decoration-2"
        title={`Clica para ver: ${definition}`}
      >
        {term}
      </button>

      {isOpen && (
        <>
          {/* Overlay para fechar */}
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />

          {/* Tooltip */}
          <div
            ref={tooltipRef}
            className={`
              absolute z-50 max-w-sm bg-white text-foreground 
              rounded-xl shadow-xl p-4 text-sm leading-relaxed
              pointer-events-auto whitespace-normal break-words
              border border-primary/10
              ${positionClasses[position]}
              animation-fadeIn
            `}
          >
            {/* Header com termo */}
            <div className="flex items-start justify-between mb-3 gap-3">
              <p className="font-bold text-base text-primary italic">{term}</p>
              <button
                onClick={() => setIsOpen(false)}
                className="shrink-0 w-5 h-5 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={14} />
              </button>
            </div>

            {/* Definição */}
            <p className="text-gray-700 leading-relaxed">{definition}</p>

            {/* Ponta do tooltip */}
            {position === "bottom" && (
              <div className="absolute bottom-[-8px] left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-white" />
            )}
            {position === "top" && (
              <div className="absolute top-[-8px] left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-b-4 border-l-transparent border-r-transparent border-b-white" />
            )}
            {position === "left" && (
              <div className="absolute left-[-8px] top-1/2 -translate-y-1/2 w-0 h-0 border-t-4 border-b-4 border-r-4 border-t-transparent border-b-transparent border-r-white" />
            )}
          </div>
        </>
      )}

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: ${
              position === "left"
                ? "translateY(-50%) translateX(8px)"
                : position === "top"
                  ? "translateX(-50%) translateY(8px)"
                  : "translateX(-50%) translateY(-8px)"
            };
          }
          to {
            opacity: 1;
            transform: ${
              position === "left"
                ? "translateY(-50%) translateX(0)"
                : position === "top"
                  ? "translateX(-50%) translateY(0)"
                  : "translateX(-50%) translateY(0)"
            };
          }
        }
        
        .animation-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
      `}</style>
    </div>
  );
};
