import { Link } from "react-router-dom";

export const Logo = ({ light = false, size = "md" }: { light?: boolean; size?: "sm" | "md" }) => (
  <Link to="/" className="flex items-center gap-2.5">
    <img src="/favicon.png" alt="GiraSightin" className={size === "sm" ? "h-7 w-7" : "h-8 w-8"} />
    <span
      className={`font-display tracking-tight ${size === "sm" ? "text-base" : "text-lg"} leading-none ${light ? "text-white" : "text-foreground"}`}
    >
      Gira<span className="font-bold">Sightin</span>
    </span>
  </Link>
);
