import React from "react";
import { NavLink } from "react-router-dom";
import LogoutButton from "../../features/auth/LogoutButton";

export default function Sidebar() {
  return (
    <aside className="w-64 border-r bg-background/50 p-4">
      <nav className="flex flex-col gap-2">
        <NavLink
          to="/dashboard"
          className={({ isActive }) =>
            `block rounded px-3 py-2 ${isActive ? "bg-primary text-background" : "hover:bg-secondary"}`
          }
        >
          Dashboard
        </NavLink>
      </nav>

      <div className="mt-6">
        <LogoutButton />
      </div>
    </aside>
  );
}
