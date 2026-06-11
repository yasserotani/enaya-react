import { NavLink } from "react-router-dom";
import LogoutButton from "../../features/auth/LogoutButton";
import logoImg from "../../assets/icon-logo.png";
export default function Sidebar() {
  return (
    <aside className="flex w-72 shrink-0 flex-col border-r border-border bg-background/60 p-4 backdrop-blur-sm">
      {/* Logo Section */}
      <div className="mb-6 border-b border-border/70 pb-5">
        <div className="flex items-center gap-3 rounded-lg bg-gradient-to-r from-primary/15 to-transparent px-3 py-3">
          <div className="rounded-md bg-primary/20 p-2">
            <img
              src={logoImg}
              alt="Enaya logo"
              className="h-10 w-10 shrink-0 object-contain"
            />
          </div>
          <div className="flex flex-col leading-tight">
            <h1 className="text-lg font-bold tracking-tight text-foreground">
              Enaya
            </h1>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex flex-1 flex-col gap-5">
        {/* Main Section */}
        <div>
          <p className="mb-2 px-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-foreground/50">
            Main
          </p>
          <div className="flex flex-col gap-1">
            <NavLink
              to="/dashboard"
              className={({ isActive }) =>
                `nav-link-base ${isActive ? "nav-link-active" : "nav-link-inactive"}`
              }
            >
              Dashboard
            </NavLink>
          </div>
        </div>

        {/* Management Section */}
        <div>
          <p className="mb-2 px-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-foreground/50">
            Management
          </p>
          <div className="flex flex-col gap-1">
            <NavLink
              to="/users"
              className={({ isActive }) =>
                `nav-link-base ${isActive ? "nav-link-active" : "nav-link-inactive"}`
              }
            >
              Users
            </NavLink>
            <NavLink
              to="/patients"
              className={({ isActive }) =>
                `nav-link-base ${isActive ? "nav-link-active" : "nav-link-inactive"}`
              }
            >
              Patients
            </NavLink>
            <NavLink
              to="/doctors"
              className={({ isActive }) =>
                `nav-link-base ${isActive ? "nav-link-active" : "nav-link-inactive"}`
              }
            >
              Doctors
            </NavLink>
            <NavLink
              to="/appointments"
              className={({ isActive }) =>
                `nav-link-base ${isActive ? "nav-link-active" : "nav-link-inactive"}`
              }
            >
              Appointments
            </NavLink>
          </div>
        </div>

        {/* Settings Section */}
        <div>
          <p className="mb-2 px-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-foreground/50">
            Settings
          </p>
          <div className="flex flex-col gap-1">
            <NavLink
              to="/roles"
              className={({ isActive }) =>
                `nav-link-base ${isActive ? "nav-link-active" : "nav-link-inactive"}`
              }
            >
              Roles
            </NavLink>
          </div>
        </div>
      </nav>

      {/* Logout Button */}
      <div className="border-t border-border/70 pt-4">
        <LogoutButton />
      </div>
    </aside>
  );
}
