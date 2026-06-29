"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Package, Truck, BarChart2, Settings, Layers, ShoppingCart } from "lucide-react";
import "./Sidebar.css";

export default function Sidebar({ role = 'admin' }) {
  const pathname = usePathname();

  if (pathname === '/login') return null;

  const navItems = [
    { name: "Tablero Producción", path: "/", icon: <LayoutDashboard size={20} /> },
    { name: "Catálogo / Plantillas", path: "/catalogo", icon: <Package size={20} /> },
    { name: "Inventario Chapa", path: "/inventario", icon: <Layers size={20} /> },
    { name: "Compras de Chapa", path: "/compras", icon: <ShoppingCart size={20} /> },
    { name: "Trabajos Finalizados", path: "/entregados", icon: <Truck size={20} /> },
    { name: "Reportes", path: "/reportes", icon: <BarChart2 size={20} /> },
    { name: "Configuración", path: "/config", icon: <Settings size={20} /> },
  ];

  const visibleItems = navItems.filter(item => {
    if (role === 'operator') {
      return item.path === '/' || item.path === '/inventario';
    }
    return true; // Admin ve todo
  });

  return (
    <aside className="sidebar glass">
      <div className="sidebar-brand">
        <h2>Metal ID</h2>
        <p>ERP & Producción</p>
      </div>
      <nav className="sidebar-nav">
        {visibleItems.map((item) => {
          const isActive = pathname === item.path;
          return (
            <Link key={item.path} href={item.path} className={`nav-item ${isActive ? "active" : ""}`}>
              {item.icon}
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>
      <div className="sidebar-footer" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center' }}>
        <button 
          className="btn-icon-danger" 
          onClick={async () => {
            await fetch('/api/auth/logout', { method: 'POST' });
            window.location.href = '/login';
          }}
          style={{ width: '100%', justifyContent: 'center', display: 'flex', alignItems: 'center', gap: '0.5rem', border: '1px solid var(--danger-color)', borderRadius: '8px', padding: '0.5rem' }}
        >
          Cerrar Sesión
        </button>
        <p>v1.0 - Metal ID System</p>
      </div>
    </aside>
  );
}
