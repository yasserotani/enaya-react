import React from "react";
import { Link } from "react-router-dom";
import { ThemeToggle } from "../ui/ThemeToggle";

export default function Navbar() {
  return (
    <header className="h-14 flex items-center justify-between px-4 border-b bg-background/80">
      <Link to="/dashboard" className="font-bold text-lg">
        Enaya
      </Link>

      <div className="flex items-center space-x-4">
        <ThemeToggle />
      </div>
    </header>
  );
}
