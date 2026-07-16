import { Link } from "react-router-dom";

export const Logo = ({ light = false, size = "md" }: { light?: boolean; size?: "sm" | "md" }) => (
  <Link to="/app/" className="flex items-center gap-2.5">
    <img
      src="/favicon.png"
      alt="MuSight"
      className={
        size === "sm"
          ? "h-7 w-auto max-w-[112px] object-contain shrink-0"
          : "h-8 w-auto max-w-[128px] object-contain shrink-0"
      }
    />
    <span
      className={`font-display tracking-tight ${size === "sm" ? "text-base" : "text-lg"} leading-none ${light ? "text-white" : "text-foreground"}`}
    >
      Mu<span className="font-bold">Sight</span>
    </span>
  </Link>
);
