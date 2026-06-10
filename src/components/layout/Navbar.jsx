import { Link } from "react-router-dom";
import { ThemeToggle } from "../ui/ThemeToggle";

export default function Navbar() {
  return (
    <header className="sticky top-0 z-20 flex h-14 items-center justify-between border-b border-border bg-background/90 px-4 backdrop-blur">
      <Link
        to="/dashboard"
        className="text-lg font-bold tracking-tight text-foreground"
      >
        Enaya
      </Link>

      <div className="flex items-center gap-3">
        <ThemeToggle />
      </div>
    </header>
  );
}
