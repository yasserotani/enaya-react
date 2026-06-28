import { NavLink } from "react-router-dom";
import LogoutButton from "../../features/auth/LogoutButton";
import logoImg from "../../assets/icon-logo.png";

export default function Sidebar() {
  return (
    <aside className="flex w-72 h-screen sticky top-0 shrink-0 flex-col border-r border-border bg-background/30 p-5 backdrop-blur-md justify-between">
      <div>
        {/* Balanced, Prominent Logo Section */}
        <div className="mb-8 border-b border-border/40 pb-5">
          <div className="flex items-center gap-3 px-2">
            <img
              src={logoImg}
              alt="Enaya logo"
              className="h-12 w-auto object-contain"
            />
            <span className="text-2xl font-bold tracking-tight text-foreground">
              Enaya
            </span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex flex-col gap-6">
          {/* Main Section */}
          <div>
            <p className="mb-2.5 px-4 text-[11px] font-bold uppercase tracking-[0.15em] text-foreground/30">
              Main
            </p>
            <div className="flex flex-col gap-1">
              <NavLink
                to="/dashboard"
                className={({ isActive }) =>
                  `nav-link-base ${isActive ? "nav-link-active" : "nav-link-inactive"}`
                }
              >
                {/* Placeholder for Icon if you want to add them later */}
                <span>Dashboard</span>
              </NavLink>
            </div>
          </div>

          {/* Management Section */}
          <div>
            <p className="mb-2.5 px-4 text-[11px] font-bold uppercase tracking-[0.15em] text-foreground/30">
              Management
            </p>
            <div className="flex flex-col gap-1">
              <NavLink
                to="/users"
                className={({ isActive }) =>
                  `nav-link-base ${isActive ? "nav-link-active" : "nav-link-inactive"}`
                }
              >
                <span>Users</span>
              </NavLink>
              <NavLink
                to="/patients"
                className={({ isActive }) =>
                  `nav-link-base ${isActive ? "nav-link-active" : "nav-link-inactive"}`
                }
              >
                <span>Patients</span>
              </NavLink>
              <NavLink
                to="/doctors"
                className={({ isActive }) =>
                  `nav-link-base ${isActive ? "nav-link-active" : "nav-link-inactive"}`
                }
              >
                <span>Doctors</span>
              </NavLink>
              <NavLink
                to="/appointments"
                className={({ isActive }) =>
                  `nav-link-base ${isActive ? "nav-link-active" : "nav-link-inactive"}`
                }
              >
                <span>Appointments</span>
              </NavLink>
              <NavLink
                to="/departments"
                className={({ isActive }) =>
                  `nav-link-base ${isActive ? "nav-link-active" : "nav-link-inactive"}`
                }
              >
                <span>Departments</span>
              </NavLink>
            </div>
          </div>

          {/* Settings Section */}
          <div>
            <p className="mb-2.5 px-4 text-[11px] font-bold uppercase tracking-[0.15em] text-foreground/30">
              Settings
            </p>
            <div className="flex flex-col gap-1">
              <NavLink
                to="/roles"
                className={({ isActive }) =>
                  `nav-link-base ${isActive ? "nav-link-active" : "nav-link-inactive"}`
                }
              >
                <span>Roles</span>
              </NavLink>
            </div>
          </div>
        </nav>
      </div>

      {/* Logout Button Section */}
      <div className="border-t border-border/40 pt-4 mt-auto">
        <LogoutButton />
      </div>
    </aside>
  );
}
