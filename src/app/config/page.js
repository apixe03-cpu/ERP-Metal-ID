import prisma from "@/lib/prisma";
import ConfigClient from "./ConfigClient";

export const dynamic = "force-dynamic";


export default async function ConfigPage() {
  const materials = await prisma.materialThickness.findMany({
    orderBy: [
      { material: 'asc' },
      { thickness: 'asc' }
    ]
  });

  const employees = await prisma.employee.findMany({
    orderBy: { name: 'asc' }
  });

  const workCenters = await prisma.workCenter.findMany({
    orderBy: { name: 'asc' }
  });

  return (
    <main className="dashboard-container">
      <header className="header glass">
        <div>
          <h1>Configuración del Taller</h1>
          <p>Administra materiales, espesores y empleados</p>
        </div>
      </header>

      <section className="config-section">
        <ConfigClient initialMaterials={materials} initialEmployees={employees} initialWorkCenters={workCenters} />
      </section>
    </main>
  );
}
