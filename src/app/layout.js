import "./globals.css";
import "@/components/Modal.css";
import "@/app/config/Config.css";
import Sidebar from "@/components/Sidebar";

export const metadata = {
  title: "Metal ID - ERP Producción",
  description: "Sistema de gestión integral para Metal ID.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body>
        <div className="app-layout">
          <Sidebar />
          <div className="main-content">
            {children}
          </div>
        </div>
      </body>
    </html>
  );
}
