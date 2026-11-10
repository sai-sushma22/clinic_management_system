import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function MainLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const links = [
    { name: "Dashboard", path: "/dashboard", roles: ["RECEPTIONIST", "NURSE", "PHYSICIAN"] },
    { name: "Patients", path: "/patients", roles: ["RECEPTIONIST", "NURSE", "PHYSICIAN"] },
    { name: "Appointments", path: "/appointments", roles: ["RECEPTIONIST", "NURSE", "PHYSICIAN"] },
    { name: "Nurse", path: "/nurse", roles: ["NURSE"] },
    { name: "Consultations", path: "/consultations", roles: ["PHYSICIAN"] },
    { name: "Checkout", path: "/checkout", roles: ["RECEPTIONIST"] },
    { name: "Clinical Studies", path: "/clinical-studies", roles: ["RECEPTIONIST", "NURSE", "PHYSICIAN"] },
  ];

  return (
    <div className="app-layout">
      <aside className="sidebar">
        <h2>Clinic</h2>

        <nav>
          {links
            .filter((link) => link.roles.includes(user?.role || ""))
            .map((link) => (
              <NavLink key={link.path} to={link.path}>
                {link.name}
              </NavLink>
            ))}
        </nav>

        <div className="sidebar-user">
          <strong>{user?.name}</strong>
          <small>{user?.role}</small>
          <button
            onClick={() => {
              logout();
              navigate("/login");
            }}
          >
            Logout
          </button>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <span>Clinic Management System</span>
          <span>{user?.name}</span>
        </header>

        <section className="page-content">
          <Outlet />
        </section>
      </main>
    </div>
  );
}