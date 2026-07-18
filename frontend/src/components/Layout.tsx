import { useState } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

const NAV = [
  { to: "/", label: "Painel", icon: "◧", end: true },
  { to: "/vehicles", label: "Veículos", icon: "▢" },
  { to: "/models", label: "Modelos", icon: "◈" },
  { to: "/brands", label: "Marcas", icon: "◆" },
  { to: "/users", label: "Usuários", icon: "○" },
  { to: "/audit", label: "Auditoria", icon: "≣" },
];

const TITLES: Record<string, string> = {
  "/": "Painel",
  "/vehicles": "Veículos",
  "/models": "Modelos",
  "/brands": "Marcas",
  "/users": "Usuários",
  "/audit": "Auditoria",
};

export function Layout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [open, setOpen] = useState(false);

  const crumb = TITLES[location.pathname] ?? "Aivacol";
  const initials = (user?.email ?? "A").slice(0, 2).toUpperCase();

  return (
    <div className="app-shell">
      <aside className={`rail ${open ? "open" : ""}`}>
        <div className="rail-brand">
          <div className="rail-mark">AV</div>
          <div>
            <div className="name">Aivacol</div>
            <div className="sub">Fleet Console</div>
          </div>
        </div>
        <nav className="rail-nav" onClick={() => setOpen(false)}>
          <div className="rail-section">Operação</div>
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) => `rail-link ${isActive ? "active" : ""}`}
            >
              <span className="ico" aria-hidden>
                {item.icon}
              </span>
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="rail-foot">v0.1 · desafio-info</div>
      </aside>

      <div className="content">
        <header className="topbar">
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <button className="menu-btn" onClick={() => setOpen((v) => !v)} aria-label="Menu">
              ☰
            </button>
            <span className="crumb">frota / {crumb.toLowerCase()}</span>
          </div>
          <div className="who">
            <span style={{ fontSize: 13, color: "var(--muted)" }}>{user?.email}</span>
            <div className="avatar" title={user?.email ?? ""}>
              {initials}
            </div>
            <button className="btn btn-ghost btn-sm" onClick={logout}>
              Sair
            </button>
          </div>
        </header>
        <main>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
