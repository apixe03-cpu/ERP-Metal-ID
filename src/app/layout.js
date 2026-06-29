import { cookies } from "next/headers";
import "./globals.css";
import "@/components/Modal.css";
import "@/app/config/Config.css";
import Sidebar from "@/components/Sidebar";

export const metadata = {
  title: "Metal ID - ERP Producción",
  description: "Sistema de gestión integral para Metal ID.",
};

export default function RootLayout({ children }) {
  const cookieStore = cookies();
  const sessionValue = cookieStore.get('metal_session')?.value;
  const role = sessionValue === 'operator' ? 'operator' : 'admin'; // 'authenticated' (vieja cookie) se trata como admin

  return (
    <html lang="es">
      <body>
        <div className="app-layout">
          <Sidebar role={role} />
          <div className="main-content">
            {children}
          </div>
        </div>
      </body>
    </html>
  );
}
